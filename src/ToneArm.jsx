import { useRef, useState, useCallback, useEffect } from 'react';

const ToneArm = ({ 
  value = 50, 
  onChange = () => {}, 
  min = 0, 
  max = 100, 
  step = 1,
  startAngle = -90, 
  endAngle = 90,
  numMarks = 21,
  highlightEveryNth = 5,
  label = "Tone Arm"
}) => {
  const svgRef = useRef(null);
  const isDraggingRef = useRef(false);
  const centerRef = useRef({ x: 0, y: 0 });
  const [currentAngle, setCurrentAngle] = useState(() => {
    const normalizedValue = (value - min) / (max - min);
    return startAngle + (normalizedValue * (endAngle - startAngle));
  });

  // Convert value to angle
  const valueToAngle = useCallback((val) => {
    const normalizedValue = (val - min) / (max - min);
    return startAngle + (normalizedValue * (endAngle - startAngle));
  }, [min, max, startAngle, endAngle]);

  // Convert angle to value
  const angleToValue = useCallback((angle) => {
    const normalizedAngle = (angle - startAngle) / (endAngle - startAngle);
    const rawValue = min + (normalizedAngle * (max - min));
    // Round to step
    return Math.round(rawValue / step) * step;
  }, [min, max, startAngle, endAngle, step]);

  // EXACT Dev.to approach - no modifications!
  const calculateAngleFromPointer = useCallback((event) => {
    if (!centerRef.current) return currentAngle;

    // Get mouse/touch position
    const clientX = event.touches ? event.touches[0].clientX : event.clientX;
    const clientY = event.touches ? event.touches[0].clientY : event.clientY;
    
    // Simpler approach - use atan2 which handles all quadrants
    const offsetX = clientX - centerRef.current.x;
    const offsetY = centerRef.current.y - clientY;  // Y flipped for math coords
    
    // Use atan2 - it handles all quadrants and division by zero automatically
    const rad = Math.atan2(offsetY, offsetX);
    const deg = (180 / Math.PI) * rad;
    
    // Debug logging
    if (Math.random() < 0.05) { // Log 5% of moves
      console.log(`🔍 offsetX=${offsetX.toFixed(1)}, offsetY=${offsetY.toFixed(1)}, atan2_deg=${deg.toFixed(1)}`);
    }
    
    // atan2 gives: right=0°, up=90°, left=±180°, down=-90°
    // We want: up=0°, right=90°, down=180°, left=-90°  
    // Correct mapping: needle_angle = 90° - atan2_angle
    let needleAngle = 90 - deg;
    
    // Normalize to our range
    while (needleAngle > 180) needleAngle -= 360;
    while (needleAngle <= -180) needleAngle += 360;
    
    return needleAngle;
  }, [currentAngle]);

  // Handle drag start - Dev.to approach!
  const handleDragStart = useCallback((event) => {
    event.preventDefault();
    isDraggingRef.current = true;
    
    // EXACT Dev.to center calculation
    if (svgRef.current) {
      const rect = svgRef.current.getBoundingClientRect();
      centerRef.current = { 
        x: rect.x + (rect.width / 2), 
        y: rect.y + (rect.height / 2) 
      };
    }
  }, []);

  // Handle drag move - Dev.to direct angle approach!
  const handleDragMove = useCallback((event) => {
    if (!isDraggingRef.current) return;
    event.preventDefault();
    
    // Get direct angle from pointer position (Dev.to approach)
    let newNeedleAngle = calculateAngleFromPointer(event);
    
    // Clamp to valid range
    newNeedleAngle = Math.max(startAngle, Math.min(endAngle, newNeedleAngle));
    
    // Update needle position and value
    setCurrentAngle(newNeedleAngle);
    const newValue = angleToValue(newNeedleAngle);
    onChange(newValue);
  }, [calculateAngleFromPointer, angleToValue, onChange, startAngle, endAngle]);

  // Handle drag end
  const handleDragEnd = useCallback(() => {
    isDraggingRef.current = false;
  }, []);

  // Update angle when value prop changes
  useEffect(() => {
    if (!isDraggingRef.current) {
      setCurrentAngle(valueToAngle(value));
    }
  }, [value, valueToAngle]);

  // Add global event listeners
  useEffect(() => {
    const handleMouseMove = (e) => handleDragMove(e);
    const handleMouseUp = () => handleDragEnd();
    const handleTouchMove = (e) => handleDragMove(e);
    const handleTouchEnd = () => handleDragEnd();

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('touchmove', handleTouchMove);
    document.addEventListener('touchend', handleTouchEnd);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleDragMove, handleDragEnd]);

  // Generate arc path for the dial background
  const generateArcPath = () => {
    const radius = 35;
    const startRadians = (startAngle * Math.PI) / 180;
    const endRadians = (endAngle * Math.PI) / 180;
    
    const startX = Math.sin(startRadians) * radius;
    const startY = -Math.cos(startRadians) * radius;
    const endX = Math.sin(endRadians) * radius;
    const endY = -Math.cos(endRadians) * radius;
    
    const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;
    
    return `M ${startX} ${startY} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endX} ${endY}`;
  };

  // Generate scale marks
  const generateScaleMarks = () => {
    const marks = [];
    const radius = 35;
    
    for (let i = 0; i < numMarks; i++) {
      const angle = startAngle + (i * (endAngle - startAngle)) / (numMarks - 1);
      const radians = (angle * Math.PI) / 180;
      const isHighlighted = i % highlightEveryNth === 0;
      
      const innerRadius = isHighlighted ? radius - 8 : radius - 4;
      const outerRadius = radius - 1;
      
      const innerX = Math.sin(radians) * innerRadius;
      const innerY = -Math.cos(radians) * innerRadius;
      const outerX = Math.sin(radians) * outerRadius;
      const outerY = -Math.cos(radians) * outerRadius;
      
      marks.push(
        <line
          key={i}
          x1={innerX}
          y1={innerY}
          x2={outerX}
          y2={outerY}
          stroke={isHighlighted ? "#2c3e50" : "#7f8c8d"}
          strokeWidth={isHighlighted ? "2" : "1"}
        />
      );

      // Add value labels for highlighted marks
      if (isHighlighted) {
        const labelRadius = radius - 12;
        const labelX = Math.sin(radians) * labelRadius;
        const labelY = -Math.cos(radians) * labelRadius;
        const labelValue = min + (i * (max - min)) / (numMarks - 1);
        
        marks.push(
          <text
            key={`label-${i}`}
            x={labelX}
            y={labelY + 2}
            textAnchor="middle"
            fontSize="6"
            fill="#2c3e50"
            fontWeight="bold"
          >
            {Math.round(labelValue)}
          </text>
        );
      }
    }
    
    return marks;
  };

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column',
      alignItems: 'center',
      marginBottom: '30px',
      padding: '20px',
      backgroundColor: '#f8f9fa',
      borderRadius: '15px',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
    }}>
      {/* Hidden range input for form handling & accessibility */}
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ display: 'none' }}
        aria-label={label}
      />
      
      {/* Label */}
      <h3 style={{ margin: '0 0 15px 0', color: '#2c3e50', fontSize: '18px' }}>
        {label}
      </h3>

      <svg
        ref={svgRef}
        width="300"
        height="200"
        viewBox='-50 -50 100 60'
        preserveAspectRatio="xMidYMid meet"
        style={{ 
          backgroundColor: '#fff',
          borderRadius: '10px',
          border: '3px solid #2c3e50',
          cursor: isDraggingRef.current ? 'grabbing' : 'grab',
          userSelect: 'none'
        }}
        onMouseDown={handleDragStart}
        onTouchStart={handleDragStart}
      >
        {/* Scale markings */}
        {generateScaleMarks()}

        {/* Outer arc */}
        <path
          d={generateArcPath()}
          fill="none"
          stroke="#2c3e50"
          strokeWidth="2"
        />

        {/* Sharp pointed needle - E-meter style! */}
        <path
          d='m -0.5 0 l 0.5 -38 l 0.5 38 z'
          fill='#c0392b'
          stroke='#c0392b'
          strokeWidth='0.5'
          style={{
            transformOrigin: '0 0',
            transform: `rotate(${currentAngle}deg)`,
            filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'
          }}
        />

        {/* Sharp needle tip */}
        <circle 
          cx="0" 
          cy="-38" 
          r="1.5" 
          fill="#c0392b"
          // stroke="#8b2635"
          strokeWidth="0.5"
          style={{
            transformOrigin: '0 0',
            transform: `rotate(${currentAngle}deg)`,
          }}
        />

        {/* Center pivot - larger and more detailed */}
        <circle cx="0" cy="0" r="3" fill="#2c3e50" stroke="#1a252f" strokeWidth="1" />
        <circle cx="0" cy="0" r="1.5" fill="#34495e" />

        {/* Current value display */}
        <text
          x="0"
          y="18"
          textAnchor="middle"
          fontSize="10"
          fill="#2c3e50"
          fontWeight="bold"
        >
          {value.toFixed(1)}
        </text>
      </svg>
    </div>
  );
};

export default ToneArm;