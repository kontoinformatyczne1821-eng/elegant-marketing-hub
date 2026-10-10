'use client';

import { CarouselNavigator } from './carousel-navigator';
import { useState, useEffect } from 'react';

const customThemes = [
  {
    bg: 'bg-[#F4F4F9]',
    button: 'bg-[#262629]',
    dot: 'bg-[#D5D4E0]',
    progress: 'bg-[#D5D4E0]',
  },
  {
    bg: 'bg-[#E7F1FD]',
    button: 'bg-[#016FFE]',
    dot: 'bg-[#89BCF9]',
    progress: 'bg-[#89BCF9]',
  },
  {
    bg: 'bg-[#E0FAE7]',
    button: 'bg-[#2EBE50]',
    dot: 'bg-[#38E363]',
    progress: 'bg-[#38E363]',
  },
  {
    bg: 'bg-[#FCF5DB]',
    button: 'bg-[#FEC400]',
    dot: 'bg-[#FAD34C]',
    progress: 'bg-[#FAD34C]',
  },
];

const demoImages = [
  'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&q=80',
  'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&q=80',
  'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&q=80',
  'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&q=80',
];

export default function CarouselNavigatorDemo() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const totalSlides = 4;
  const autoDelay = 4000;

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % totalSlides);
    }, autoDelay);
    return () => clearInterval(timer);
  }, [currentIndex]);

  return (
    <div className="flex justify-center items-center">
      <CarouselNavigator
        totalSlides={totalSlides}
        autoDelay={autoDelay}
        themes={customThemes}
        currentIndex={currentIndex}
        onIndexChange={setCurrentIndex}
      />
      <div className="relative mt-4 w-full max-w-sm mx-auto overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <img
          src={demoImages[currentIndex]}
          alt={`Slide ${currentIndex + 1}`}
          className="h-full w-full object-cover transition-opacity duration-300"
        />
      </div>
    </div>
  );
}
