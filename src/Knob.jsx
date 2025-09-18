import React, { useState, useRef, useCallback, useEffect } from 'react';

const Knob = ({ state, setState }) => {
  // Extract values from state with defaults
  const {
    value = 50,
    min = 0,
    max = 360,
    step = 1,
    precision = 0,
    unit = "deg",
    label = "Knob",
    continuous = false,
    startAngle = 0,
    endAngle = 360
  } = state || {};
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

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column',
      alignItems: 'center',
      marginBottom: '20px',
      padding: '20px',
      backgroundColor: '#f8f9fa',
      borderRadius: '15px',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
    }}>
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
      
      {/* Label */}
      <h3 style={{ margin: '0 0 15px 0', color: '#2c3e50', fontSize: '18px' }}>
        {label}
      </h3>

      {/* Knob */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '15px'
      }}>
        <svg
          ref={svgRef}
          viewBox="0 0 16 16"
          width="80"
          height="80"
          style={{ 
            backgroundColor: '#fff',
            borderRadius: '50%',
            border: '2px solid #2c3e50',
            cursor: isDraggingRef.current ? 'grabbing' : 'grab',
            userSelect: 'none'
          }}
          onPointerDown={handlePointerDown}
          onTouchStart={handlePointerDown}
        >
          {/* Circle */}
          <circle 
            cx="50%" 
            cy="50%" 
            r="calc(50% - 1px)"
            fill="#fff"
            stroke="#2c3e50"
            strokeWidth="1"
          />
          
          {/* Arc indicator when not continuous */}
          {!continuous && (() => {
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
                stroke="#3498db"
                strokeWidth="2"
                strokeLinecap="round"
              />
            );
          })()}
          
          {/* Pointer line (Dev.to style) */}
          <line 
            x1="50%" 
            y1="50%" 
            x2="100%" 
            y2="50%" 
            stroke="#e74c3c"
            strokeWidth="2"
            strokeLinecap="round"
            style={{
              transformOrigin: 'center center',
              transform: `rotate(${displayAngle - 90}deg)`,
            }}
          />
        </svg>
        
        {/* Value display */}
        <div style={{
          fontSize: '24px',
          fontWeight: 'bold',
          color: '#2c3e50',
          minWidth: '80px',
          textAlign: 'center'
        }}>
          {unit === "rad" 
            ? (value * Math.PI / 180).toFixed(precision)
            : value.toFixed(precision)
          }
          <div style={{ fontSize: '12px', color: '#666' }}>
            {unit}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Knob;