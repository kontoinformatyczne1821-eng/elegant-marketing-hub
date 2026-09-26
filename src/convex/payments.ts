import Stripe from "stripe";
import { v } from "convex/values";
import { action, internalMutation, query } from "./_generated/server";
import { internal } from "./_generated/api";


/* plan → kwota w groszach (PLN) */
const PRICES: Record<string, number> = {
  essence: 120000,
  signature: 199900,
  prestige: 230000,
};

export const createCheckoutSession = action({
  args: {
    plan: v.string(),
    term: v.string(),
    cardholder: v.string(),
    email: v.optional(v.string()),
    origin: v.string(),
  },
  handler: async (ctx, args): Promise<{ url: string; id: string }> => {
    const amount = PRICES[args.plan];
    if (!amount) throw new Error("Nieznany plan");

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "", {
      apiVersion: "2026-08-26.dahlia",
    });

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "pln",
            unit_amount: amount,
            product_data: {
              name: `QRAFT · ${args.plan.toUpperCase()}`,
              description: `Okres: ${args.term} · nowy klient: −50% przez pierwsze 90 dni`,
            },
          },
          quantity: 1,
        },
      ],
      metadata: {
        plan: args.plan,
        term: args.term,
        cardholder: args.cardholder,
      },
      customer_email: args.email || undefined,
      success_url: `${args.origin}/dziekujemy?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${args.origin}/checkout?canceled=1`,
    });

    if (!session.url) throw new Error("Stripe nie zwrócił adresu płatności");
    return { url: session.url, id: session.id };
  },
});

/** Zapis zakupu — wołany z terminala po potwierdzeniu przez Stripe redirect. */
export const recordPurchase = action({
  args: {
    sessionId: v.string(),
    plan: v.string(),
    term: v.string(),
    email: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const amount = PRICES[args.plan] ?? 0;
    await ctx.runMutation(internal.payments.addPurchase, {
      sessionId: args.sessionId,
      plan: args.plan,
      term: args.term,
      amount,
      email: args.email,
      status: "paid",
    });
  },
});

export const addPurchase = internalMutation({
  args: {
    sessionId: v.string(),
    plan: v.string(),
    term: v.string(),
    amount: v.number(),
    email: v.optional(v.string()),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("purchases")
      .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))
      .first();
    if (existing) return;
    await ctx.db.insert("purchases", { ...args, createdAt: Date.now() });
  },
});

export const purchaseBySession = query({
  args: { sessionId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("purchases")
      .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))
      .first();
  },
});
