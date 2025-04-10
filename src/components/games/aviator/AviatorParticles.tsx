
import React, { useRef, useEffect } from 'react';

interface ParticleProps {
  isFlying: boolean;
  isCrashed: boolean;
}

const AviatorParticles: React.FC<ParticleProps> = ({ isFlying, isCrashed }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationFrameRef = useRef<number>(0);

  interface Particle {
    x: number;
    y: number;
    size: number;
    speedX: number;
    speedY: number;
    color: string;
    alpha: number;
    decreasing: boolean;
  }

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas to full width of container
    const resizeCanvas = () => {
      const container = canvas.parentElement;
      if (container) {
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;
      }
    };

    // Initialize
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Create particles
    const createParticles = (count: number, crashParticles = false) => {
      const newParticles: Particle[] = [];
      const colors = crashParticles 
        ? ['#FF5B5B', '#FF3838', '#D10000', '#FF8585'] 
        : ['#FFD700', '#FFA500', '#FF6347', '#FF4500'];
      
      for (let i = 0; i < count; i++) {
        newParticles.push({
          x: canvas.width / 2,
          y: canvas.height / 2,
          size: Math.random() * 4 + 1,
          speedX: (Math.random() - 0.5) * 8,
          speedY: (Math.random() - 0.5) * 8,
          color: colors[Math.floor(Math.random() * colors.length)],
          alpha: 1,
          decreasing: false,
        });
      }
      
      return newParticles;
    };

    // Animation
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particlesRef.current.forEach((particle, index) => {
        // Update position
        particle.x += particle.speedX;
        particle.y += particle.speedY;
        
        // Update alpha (fade out)
        if (particle.decreasing) {
          particle.alpha -= 0.02;
        } else if (particle.alpha < 0.95) {
          particle.alpha += 0.02;
        }
        
        // Change to decreasing once particle travels a bit
        if (!particle.decreasing && Math.abs(particle.x - canvas.width / 2) > 50) {
          particle.decreasing = true;
        }
        
        // Draw particle
        ctx.save();
        ctx.globalAlpha = particle.alpha;
        ctx.fillStyle = particle.color;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        
        // Remove faded particles
        if (particle.alpha <= 0) {
          particlesRef.current.splice(index, 1);
        }
      });
      
      // Add more particles based on game state
      if (isFlying && particlesRef.current.length < 50) {
        particlesRef.current.push(...createParticles(3));
      }
      
      // Create explosion when crashed
      if (isCrashed && particlesRef.current.length < 200) {
        particlesRef.current.push(...createParticles(30, true));
      }
      
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    // Start animation
    animate();

    return () => {
      cancelAnimationFrame(animationFrameRef.current);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [isFlying, isCrashed]);

  return (
    <canvas 
      ref={canvasRef} 
      className="absolute inset-0 pointer-events-none z-10" 
      style={{ mixBlendMode: 'screen' }}
    />
  );
};

export default AviatorParticles;
