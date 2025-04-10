
import React, { useEffect, useRef } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { Plane } from 'lucide-react';

interface AirplaneProps {
  isFlying: boolean;
  isCrashed: boolean;
  multiplier: number;
  maxMultiplier: number;
}

const Airplane: React.FC<AirplaneProps> = ({ isFlying, isCrashed, multiplier, maxMultiplier }) => {
  const controls = useAnimation();
  const pathRef = useRef<SVGPathElement>(null);
  const airplaneRef = useRef<HTMLDivElement>(null);
  
  // Calculate flight progress (0-1)
  const progress = Math.min((multiplier - 1) / (maxMultiplier - 1), 1);
  
  useEffect(() => {
    const animateFlight = async () => {
      if (isFlying) {
        // Reset position when starting
        await controls.start({
          left: '5%',
          bottom: '10%',
          transform: 'rotate(0deg) scale(1)',
          transition: { duration: 0 }
        });
        
        // Start flying animation
        controls.start({
          left: `${5 + progress * 75}%`,
          bottom: `${10 + progress * 70}%`,
          transform: 'rotate(15deg) scale(1)',
          transition: { duration: 0.2, ease: "easeOut" }
        });
      } else if (isCrashed) {
        // Crash animation
        controls.start({
          transform: [
            'rotate(15deg) scale(1)', 
            'rotate(90deg) scale(0.9)', 
            'rotate(180deg) scale(0.7)',
            'rotate(270deg) scale(0.5)',
            'rotate(360deg) scale(0)'
          ],
          transition: { duration: 1, ease: "easeInOut" }
        });
      } else {
        // Reset position when game is not active
        controls.start({
          left: '2%',
          bottom: '2%',
          transform: 'rotate(0deg) scale(0.8)',
          transition: { duration: 0.5 }
        });
      }
    };
    
    animateFlight();
  }, [isFlying, isCrashed, progress, controls]);
  
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Flight path curve */}
      <svg 
        className="absolute inset-0 w-full h-full" 
        style={{ opacity: isFlying ? 0.3 : 0 }}
        viewBox="0 0 100 100" 
        preserveAspectRatio="none"
      >
        <path
          ref={pathRef}
          d="M 5,90 Q 30,70 50,30 T 95,10"
          stroke="#FFD700"
          strokeWidth="0.5"
          strokeDasharray="2 2"
          fill="none"
        />
      </svg>
      
      {/* Airplane */}
      <motion.div
        ref={airplaneRef}
        animate={controls}
        initial={{ left: '2%', bottom: '2%', transform: 'rotate(0deg) scale(0.8)' }}
        className="absolute"
        style={{ zIndex: 20 }}
      >
        <div className={`p-2 rounded-full ${isCrashed ? 'bg-red-500' : isFlying ? 'bg-yellow-500' : 'bg-gray-400'}`}>
          <Plane className="text-white" size={24} />
        </div>
      </motion.div>
    </div>
  );
};

export default Airplane;
