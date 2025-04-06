
import React, { useEffect, useRef } from 'react';

interface ParticleBackgroundProps {
  count?: number;
  minSize?: number;
  maxSize?: number;
  speed?: number;
  colors?: string[];
}

const ParticleBackground: React.FC<ParticleBackgroundProps> = ({
  count = 30,
  minSize = 5,
  maxSize = 20,
  speed = 15,
  colors = ['#1E40AF', '#7E22CE', '#F59E0B']
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    
    const container = containerRef.current;
    const particles: HTMLDivElement[] = [];
    
    // Clean up any existing particles
    container.innerHTML = '';

    // Create particles
    for (let i = 0; i < count; i++) {
      const particle = document.createElement('div');
      const size = Math.random() * (maxSize - minSize) + minSize;
      
      // Set particle styles
      particle.className = 'particle';
      particle.style.width = `${size}px`;
      particle.style.height = `${size}px`;
      
      // Random position
      particle.style.left = `${Math.random() * 100}%`;
      particle.style.top = `${Math.random() * 100}%`;
      
      // Random color from provided colors
      const color = colors[Math.floor(Math.random() * colors.length)];
      particle.style.background = color;
      
      // Random animation duration
      const duration = (Math.random() * speed + speed) * 1000; // Convert to milliseconds
      particle.style.animationDuration = `${duration}ms`;
      
      // Random delay
      particle.style.animationDelay = `${Math.random() * duration}ms`;
      
      // Append to container
      container.appendChild(particle);
      particles.push(particle);
    }

    // Clean up on unmount
    return () => {
      particles.forEach(particle => {
        if (particle.parentNode === container) {
          container.removeChild(particle);
        }
      });
    };
  }, [count, minSize, maxSize, speed, colors]);

  return <div ref={containerRef} className="particles-container" />;
};

export default ParticleBackground;
