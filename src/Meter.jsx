import { useRef, useEffect, useState } from 'react';

const Meter = ({ state }) => {
  // Calculate target needle angle based on value
  const normalizedValue = (state.value - state.min) / (state.max - state.min);
  const targetAngle = state.startAngle + (normalizedValue * (state.endAngle - state.startAngle));
  
  // Animation state
  const [currentAngle, setCurrentAngle] = useState(targetAngle);
  const currentAngleRef = useRef(targetAngle);
  const velocityRef = useRef(0);
  const animationRef = useRef(null);
  const lastTargetRef = useRef(targetAngle);

  // Physics-based needle animation
  useEffect(() => {
    const animate = () => {
      const current = currentAngleRef.current;
      const target = targetAngle;
      const velocity = velocityRef.current;
      
      // Calculate delta from target
      const delta = target - current;
      
      // Physics constants (adjust these for different feel)
      const springStrength = 0.125;  // How strong the pull toward target is
      const damping = 0.875;         // How quickly oscillation dies down
      const minVelocity = 0.01;     // Stop animating when velocity is tiny
      
      // Spring physics: acceleration toward target
      const acceleration = delta * springStrength;
      
      // Update velocity and apply damping
      velocityRef.current = (velocity + acceleration) * damping;
      
      // Update position
      const newPosition = current + velocityRef.current;
      
      // Boundary collision detection (the "pegs"!)
      const minBoundary = state.startAngle;
      const maxBoundary = state.endAngle;
      
      if (newPosition < minBoundary) {
        // Hit the left peg! CLANK!
        currentAngleRef.current = minBoundary;
        velocityRef.current = Math.abs(velocityRef.current) * 0.6; // Bounce back with energy loss
      } else if (newPosition > maxBoundary) {
        // Hit the right peg! CLANK!
        currentAngleRef.current = maxBoundary;
        velocityRef.current = -Math.abs(velocityRef.current) * 0.6; // Bounce back with energy loss
      } else {
        // Normal movement, no collision
        currentAngleRef.current = newPosition;
      }
      
      setCurrentAngle(currentAngleRef.current);
      
      // Continue animating if we're still moving significantly
      if (Math.abs(velocityRef.current) > minVelocity || Math.abs(delta) > 0.1) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    // Start animation if target changed
    if (targetAngle !== lastTargetRef.current) {
      lastTargetRef.current = targetAngle;
      
      // Add initial velocity boost based on how big the change is
      const deltaChange = targetAngle - currentAngleRef.current;
      const boostFactor = Math.min(Math.abs(deltaChange) * 0.00625, 2); // Bigger changes = more initial velocity
      velocityRef.current += deltaChange * 0.125 * boostFactor;
      
      // Cancel any existing animation
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      
      // Start the animation
      animationRef.current = requestAnimationFrame(animate);
    }

    // Cleanup
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [targetAngle, state.startAngle, state.endAngle]);

  const needleAngle = currentAngle;

  // Generate dynamic arc path based on startAngle and endAngle
  const generateArcPath = ({ startAngle, endAngle }) => {
    const radius = 35;
    const startRadian = ((startAngle - 90) * Math.PI) / 180;
    const endRadian = ((endAngle - 90) * Math.PI) / 180;
    const startX = Math.cos(startRadian) * radius;
    const startY = Math.sin(startRadian) * radius;
    const endX = Math.cos(endRadian) * radius;
    const endY = Math.sin(endRadian) * radius;
    const largeArcFlag = (endAngle - startAngle) > 180 ? 1 : 0;
    return `M ${startX} ${startY} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endX} ${endY}`;
  };

  // Generate scale markings
  const generateScaleMarks = ({ min, max, startAngle, endAngle }) => {
    const numMarks = 11; // 0, 10, 20, ..., 100
    
    return Array.from({ length: numMarks }, (_, i) => {
      const angle = startAngle + (i / (numMarks - 1)) * (endAngle - startAngle);
      // Adjust angle by -90 degrees to align with galvanometer orientation (0° at top)
      const adjustedAngle = angle - 90;
      const radian = (adjustedAngle * Math.PI) / 180;
      const innerRadius = 35;
      const outerRadius = 42;
      
      const x1 = Math.cos(radian) * innerRadius;
      const y1 = Math.sin(radian) * innerRadius;
      const x2 = Math.cos(radian) * outerRadius;
      const y2 = Math.sin(radian) * outerRadius;
      
      const value = min + (i / (numMarks - 1)) * (max - min);
      const textX = Math.cos(radian) * 30;
      const textY = Math.sin(radian) * 30;
      
      return (
        <g key={i}>
          <line
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke="#333"
            strokeWidth="1"
          />
          <text
            x={textX}
            y={textY}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize="6"
            fill="#333"
          >
            {Math.round(value)}
          </text>
        </g>
      );
    });
  };

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      marginBottom: '30px',
      padding: '20px',
      backgroundColor: '#f8f9fa',
      borderRadius: '15px',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
    }}>
      <svg
        width="300"
        height="200"
        viewBox='-50 -50 100 60'
        preserveAspectRatio="xMidYMid meet"
        style={{ 
          backgroundColor: '#fff',
          borderRadius: '10px',
          border: '3px solid #2c3e50'
        }}
      >
        {/* Outer arc */}
        <path
          d={generateArcPath(state)}
          fill="none"
          stroke="#2c3e50"
          strokeWidth="2"
        />
        
        {/* Scale markings */}
        {generateScaleMarks(state)}
        
        {/* Center pivot */}
        <circle cx="0" cy="0" r="3" fill="#2c3e50" />
        
        {/* Needle */}
        <line
          x1="0"
          y1="0"
          x2="0"
          y2="-32"
          stroke="#e74c3c"
          strokeWidth="2"
          strokeLinecap="round"
          style={{
            transformOrigin: '0 0',
            transform: `rotate(${needleAngle}deg)`
          }}
        />
        
        {/* Needle tip */}
        <circle 
          cx="0" 
          cy="-32" 
          r="1.5" 
          fill="#c0392b"
          style={{
            transformOrigin: '0 0',
            transform: `rotate(${needleAngle}deg)`
          }}
        />
        
        {/* Current value display */}
        <text
          x="0"
          y="15"
          textAnchor="middle"
          fontSize="8"
          fill="#2c3e50"
          fontWeight="bold"
        >
          {state.value.toFixed(1)}
        </text>
      </svg>
    </div>
  );
};

export default Meter;