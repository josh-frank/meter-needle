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
      const springStrength = 0.0325;  // How strong the pull toward target is
      const damping = 0.9;         // How quickly oscillation dies down
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
      const boostFactor = Math.min(Math.abs(deltaChange) * 0.0125, 2); // Bigger changes = more initial velocity
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
  const generateArcPath = () => {
    const radius = 35;
    const startRadian = ((state.startAngle - 90) * Math.PI) / 180;
    const endRadian = ((state.endAngle - 90) * Math.PI) / 180;
    const startX = Math.cos(startRadian) * radius;
    const startY = Math.sin(startRadian) * radius;
    const endX = Math.cos(endRadian) * radius;
    const endY = Math.sin(endRadian) * radius;
    const largeArcFlag = (state.endAngle - state.startAngle) > 180 ? 1 : 0;
    return `M ${startX} ${startY} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endX} ${endY}`;
  };

  // Generate scale markings
  const generateScaleMarks = (numMarks, highlightEveryNth = 10) => {    
    return Array.from({ length: numMarks }, (_, i) => {
      const angle = state.startAngle + (i / (numMarks - 1)) * (state.endAngle - state.startAngle);
      // Adjust angle by -90 degrees to align with galvanometer orientation (0° at top)
      const adjustedAngle = angle - 90;
      const radian = (adjustedAngle * Math.PI) / 180;
      
      const value = state.min + (i / (numMarks - 1)) * (state.max - state.min);
      
      // Determine if this is a highlighted mark (every nth mark OR first/last marks)
      const isHighlighted = (i % highlightEveryNth === 0) || (i === numMarks - 1);
      
      // Different radii and styling for highlighted vs normal marks
      const innerRadius = isHighlighted ? 33 : 35;
      const outerRadius = isHighlighted ? 42 : 40;
      const strokeWidth = isHighlighted ? 1 : 0.5;
      const strokeColor = isHighlighted ? "#2c3e50" : "#999";
      
      const x1 = Math.cos(radian) * innerRadius;
      const y1 = Math.sin(radian) * innerRadius;
      const x2 = Math.cos(radian) * outerRadius;
      const y2 = Math.sin(radian) * outerRadius;
      
      const textX = Math.cos(radian) * 28;
      const textY = Math.sin(radian) * 28;
      
      return (
        <g key={i}>
          <line
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
          />
          {/* Only show text labels on highlighted marks */}
          {isHighlighted && (
            <text
              x={textX}
              y={textY}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize="6"
              fill="#2c3e50"
              fontWeight="bold"
            >
              {Math.round(value)}
            </text>
          )}
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

        {/* Scale markings */}
        {generateScaleMarks(state.numMarks, state.highlightEveryNth)}

        {/* Needle */}
        <path
          d='m -1 0 l 1 -40 l 1 40 z'
          fill='#e74c3c'
          // stroke='#e74c3c'
          // strokeWidth='1'
          style={{
            transformOrigin: '0 0',
            transform: `rotate(${needleAngle}deg)`,
          }}
        />

        {/* Needle tip */}
        <circle 
          cx="0" 
          cy="-40" 
          r="1" 
          fill="#c0392b"
          style={{
            transformOrigin: '0 0',
            transform: `rotate(${needleAngle}deg)`,
          }}
        />

        {/* Center pivot */}
        <circle cx="0" cy="0" r="2" fill="#2c3e50" style={{ zIndex: 1 }} />

        {/* Outer arc */}
        <path
          d={generateArcPath()}
          fill="none"
          stroke="#2c3e50"
          strokeWidth="2"
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
            {/* {state.value.toFixed(1)} */}
            {(state.min + ((currentAngle - state.startAngle) / (state.endAngle - state.startAngle)) * (state.max - state.min)).toFixed(1)}
          </text>
      </svg>
    </div>
  );
};

export default Meter;