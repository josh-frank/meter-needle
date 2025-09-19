import React, { useState, useRef, useCallback, useEffect } from 'react';

const Knob = ({
    value = 50,
    min = 0,
    max = 360,
    step = 1,
    label = "Knob",
    continuous = false,
    startAngle = 0,
    endAngle = 360,
    numMarks = 11,
    highlightEveryNth = 2,
    setState = () => {},
  }) => {
  const svgRef = useRef(null);
  const isDraggingRef = useRef(false);
  const centerRef = useRef({ x: 0, y: 0 });
  const handlersRef = useRef({});
  
  // Convert value to angle for display
  const valueToDisplayAngle = useCallback((val) => {
    const normalizedValue = (val - min) / (max - min);
    
    if (continuous) {
      // Original behavior: full 360° rotation
      return normalizedValue * 360;
    } else {
      // Constrained to arc: map to startAngle-endAngle range
      let arcRange = endAngle - startAngle;
      if (arcRange <= 0) arcRange += 360; // Handle wrap-around
      return startAngle + (normalizedValue * arcRange);
    }
  }, [min, max, continuous, startAngle, endAngle]);

  const [displayAngle, setDisplayAngle] = useState(() => valueToDisplayAngle(value));

  // Pointer tracking logic
  const calculateAngleFromPointer = useCallback((event) => {
    if (!centerRef.current.x) return displayAngle;

    const clientX = event.touches ? event.touches[0].clientX : event.clientX;
    const clientY = event.touches ? event.touches[0].clientY : event.clientY;
    
    const offsetX = clientX - centerRef.current.x;
    const offsetY = centerRef.current.y - clientY; // Y-coord flip
    
    // Handle by quadrant
    let rad;
    if (offsetX >= 0 && offsetY >= 0) { 
      rad = Math.atan(offsetY / offsetX); 
    } else if (offsetX < 0 && offsetY >= 0) { 
      rad = (Math.PI / 2) + Math.atan(-offsetX / offsetY); 
    } else if (offsetX < 0 && offsetY < 0) { 
      rad = Math.PI + Math.atan(offsetY / offsetX); 
    } else { 
      rad = (3 * Math.PI / 2) + Math.atan(offsetX / -offsetY); 
    }
    
    // Convert to degrees (right=0°)
    let deg = (180 / Math.PI) * rad;
    
    // FLIP: Convert counter-clockwise to clockwise
    deg = 360 - deg;
    if (deg >= 360) deg -= 360;
    
    // Rotate by +90 degrees to compensate for visual rotation (so 0° calculation matches 0° visual)
    deg = deg + 90;
    if (deg >= 360) deg -= 360;
    
    return deg;
  }, [displayAngle]);

  // Handle pointer move
  const handlePointerMove = useCallback((event) => {
    if (!isDraggingRef.current) return;
    
    let deg = calculateAngleFromPointer(event);
    
    if (!continuous) {
      // Constrain angle to the arc range
      let arcRange = endAngle - startAngle;
      if (arcRange <= 0) arcRange += 360; // Handle wrap-around
      
      // Normalize the angle relative to startAngle
      let relativeAngle = deg - startAngle;
      if (relativeAngle < 0) relativeAngle += 360;
      if (relativeAngle > 360) relativeAngle -= 360;
      
      // Constrain to arc range
      if (arcRange < 360) {
        if (relativeAngle > arcRange) {
          // Choose the closest boundary
          const distToStart = relativeAngle > 180 ? 360 - relativeAngle : relativeAngle;
          const distToEnd = Math.abs(relativeAngle - arcRange);
          relativeAngle = distToStart <= distToEnd ? 0 : arcRange;
        }
      }
      
      deg = startAngle + relativeAngle;
      if (deg >= 360) deg -= 360;
    }
    
    setDisplayAngle(deg);
    
    // Convert display angle to value
    let normalizedAngle;
    if (continuous) {
      normalizedAngle = deg / 360; // 0 to 1
    } else {
      let arcRange = endAngle - startAngle;
      if (arcRange <= 0) arcRange += 360;
      let relativeAngle = deg - startAngle;
      if (relativeAngle < 0) relativeAngle += 360;
      normalizedAngle = relativeAngle / arcRange; // 0 to 1 within arc
    }
    
    let newValue = min + (normalizedAngle * (max - min));
    
    // Round to step
    newValue = Math.round(newValue / step) * step;
    
    // Clamp to range
    newValue = Math.max(min, Math.min(max, newValue));
    
    // Update state with new value
    if (setState) {
      setState(prev => ({ ...prev, value: newValue }));
    }
  }, [calculateAngleFromPointer, min, max, step, setState, continuous, startAngle, endAngle]);

  // Handle pointer up
  const handlePointerUp = useCallback(() => {
    isDraggingRef.current = false;
    document.removeEventListener("pointermove", handlersRef.current.move);
    document.removeEventListener("pointerup", handlersRef.current.up);
  }, []);

  // Handle pointer down  
  const handlePointerDown = useCallback((event) => {
    event.preventDefault();
    isDraggingRef.current = true;
    
    // Calculate center (exactly like Dev.to)
    if (svgRef.current) {
      const rect = svgRef.current.getBoundingClientRect();
      centerRef.current = { 
        x: rect.x + (rect.width / 2), 
        y: rect.y + (rect.height / 2) 
      };
    }
    
    // Add document listeners using refs
    document.addEventListener("pointermove", handlersRef.current.move);
    document.addEventListener("pointerup", handlersRef.current.up);
  }, []);

  // Update refs with current handlers
  handlersRef.current.move = handlePointerMove;
  handlersRef.current.up = handlePointerUp;

  // Update display angle when value prop changes
  useEffect(() => {
    if (!isDraggingRef.current) {
      setDisplayAngle(valueToDisplayAngle(value));
    }
  }, [value, valueToDisplayAngle]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Remove any lingering event listeners
      // eslint-disable-next-line react-hooks/exhaustive-deps
      const handlers = handlersRef.current;
      if (handlers.move) {
        document.removeEventListener("pointermove", handlers.move);
      }
      if (handlers.up) {
        document.removeEventListener("pointerup", handlers.up);
      }
    };
  }, []);

  // Generate tick marks around the knob
  const generateTickMarks = () => {
    if (!numMarks || numMarks < 2) return null;
    
    return Array.from({ length: numMarks }, (_, i) => {
      let angle;
      if (continuous) {
        // For continuous knobs, distribute marks evenly around full circle
        angle = (i / (numMarks - 1)) * 360;
      } else {
        // For non-continuous knobs, distribute marks within the arc range
        const range = endAngle - startAngle;
        const normalizedRange = range <= 0 ? range + 360 : range;
        angle = startAngle + (i / (numMarks - 1)) * normalizedRange;
      }
      
      // Adjust angle by -90 degrees to match knob's visual rotation
      const adjustedAngle = angle - 90;
      const radian = (adjustedAngle * Math.PI) / 180;
      
      // Determine if this is a highlighted mark
      const isHighlighted = (i % highlightEveryNth === 0) || (i === numMarks - 1);
      
      // Tick mark positioning (knob uses 16x16 viewBox, center at 8,8)
      const centerX = 8;
      const centerY = 8;
      const innerRadius = 6;
      const outerRadius = isHighlighted ? 8 : 7.5;
      const strokeWidth = isHighlighted ? 0.3 : 0.1;
      const strokeColor = isHighlighted ? "#2c3e50" : "#999";
      
      const x1 = centerX + Math.cos(radian) * innerRadius;
      const y1 = centerY + Math.sin(radian) * innerRadius;
      const x2 = centerX + Math.cos(radian) * outerRadius;
      const y2 = centerY + Math.sin(radian) * outerRadius;
      
      return (
        <line
          key={i}
          x1={x1}
          y1={y1}
          x2={x2}
          y2={y2}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
        />
      );
    });
  };

  return (
    <>
      {/* Hidden range input for accessibility */}
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => {
          if (setState) {
            setState(prev => ({ ...prev, value: Number(e.target.value) }));
          }
        }}
        style={{ display: 'none' }}
        aria-label={label}
      />

      {/* Knob */}
      <svg
        ref={svgRef}
        viewBox="0 0 16 16"
        style={{width: '100%', height: '100%', zIndex: 1, position: 'relative'}}
        onPointerDown={handlePointerDown}
        onTouchStart={handlePointerDown}
        preserveAspectRatio="xMidYMid meet"
      > 
        {/* Tick marks */}
        {generateTickMarks()}
        
        {/* Arc indicator when not continuous */}
        {continuous ? <circle 
           cx="50%" 
           cy="50%" 
           r="calc(50% - 1px)"
           fill="none"
           stroke="#2c3e50"
           className="arc"
        /> : (() => {
          const radius = 6.5; // Slightly smaller than the circle radius
          const centerX = 8;
          const centerY = 8;
          
          // Calculate start and end points (adjust by +90° to compensate for visual rotation)
          const startAngleRad = ((startAngle - 90) * Math.PI) / 180;
          const endAngleRad = ((endAngle - 90) * Math.PI) / 180;
          
          const startX = centerX + radius * Math.cos(startAngleRad);
          const startY = centerY + radius * Math.sin(startAngleRad);
          const endX = centerX + radius * Math.cos(endAngleRad);
          const endY = centerY + radius * Math.sin(endAngleRad);
          
          // Determine if we need the large arc flag
          let arcRange = endAngle - startAngle;
          if (arcRange <= 0) arcRange += 360;
          const largeArcFlag = arcRange > 180 ? 1 : 0;
          
          return (
            <path
              d={`M ${startX} ${startY} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endX} ${endY}`}
              fill="none"
              stroke="#2c3e50"
              className="arc"
            />
          );
        })()}
        
        <path 
          d='M 16 8 L 3 7 L 3 9 Z M 10 8 A 2 2 0 1 0 6 8 A 2 2 0 1 0 10 8 Z'
          fill="#c0392b"
          style={{
            transformOrigin: '8px 8px',
            transform: `rotate(${displayAngle - 90}deg)`,
          }}
        />
      </svg>
    </>
  );
};

export default Knob;