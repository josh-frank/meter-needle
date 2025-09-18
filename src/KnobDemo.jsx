import React, { useState } from 'react';
import Knob from './Knob.jsx';

function KnobDemo() {
    const [angleState, setAngleState] = useState({
        value: 45,
        min: 0,
        max: 360,
        step: 1,
        precision: 0,
        unit: "deg",
        label: "🎯 Angle Control",
        continuous: true,
        startAngle: 0,
        endAngle: 360
    });
    
    const [volumeState, setVolumeState] = useState({
        value: 75,
        min: 0,
        max: 100,
        step: 1,
        precision: 0,
        unit: "%",
        label: "🔊 Volume Control",
        continuous: true,
        startAngle: 0,
        endAngle: 360
    });

    return (
        <div style={{ 
            padding: '20px', 
            fontFamily: 'Arial, sans-serif',
            maxWidth: '800px',
            margin: '0 auto'
        }}>
            <h1 style={{ textAlign: 'center', color: '#333' }}>
                🎛️ Dev.to Knob Demo
            </h1>
            
            <div style={{ 
                backgroundColor: '#f5f5f5', 
                padding: '15px', 
                borderRadius: '8px', 
                marginBottom: '30px',
                fontSize: '14px'
            }}>
                <strong>How to use:</strong>
                <ul style={{ margin: '10px 0', paddingLeft: '20px' }}>
                    <li>Click and drag the red line to adjust values</li>
                    <li>Uses Dev.to's exact pointer tracking logic</li>
                    <li>Should have perfect tracking with no jumps!</li>
                </ul>
            </div>

            {/* Two knobs side by side */}
            <div style={{ 
                display: 'grid', 
                gridTemplateColumns: '1fr 1fr',
                gap: '30px',
                marginBottom: '30px'
            }}>
                <Knob
                    state={angleState}
                    setState={setAngleState}
                />
                
                <Knob
                    state={volumeState}
                    setState={setVolumeState}
                />
            </div>

            {/* Visual feedback */}
            <div style={{ 
                display: 'grid', 
                gridTemplateColumns: '1fr 1fr',
                gap: '30px',
                marginTop: '30px'
            }}>
                {/* Angle visualization */}
                <div style={{ textAlign: 'center' }}>
                    <h3>Angle Visualization</h3>
                    <div 
                        style={{
                            width: '100px',
                            height: '100px',
                            margin: '0 auto',
                            background: `conic-gradient(red ${angleState.value}deg, white ${angleState.value + 10}deg)`,
                            borderRadius: '50%',
                            border: '2px solid #333'
                        }}
                    />
                    <p>Angle: {angleState.value}°</p>
                </div>

                {/* Volume visualization */}
                <div style={{ textAlign: 'center' }}>
                    <h3>Volume Visualization</h3>
                    <div style={{
                        width: '100px',
                        height: '100px',
                        margin: '0 auto',
                        backgroundColor: '#f0f0f0',
                        border: '2px solid #333',
                        borderRadius: '10px',
                        position: 'relative',
                        overflow: 'hidden'
                    }}>
                        <div style={{
                            position: 'absolute',
                            bottom: 0,
                            left: 0,
                            right: 0,
                            height: `${volumeState.value}%`,
                            backgroundColor: volumeState.value > 80 ? '#ff4444' : volumeState.value > 50 ? '#ffaa00' : '#44ff44',
                            transition: 'height 0.2s ease'
                        }} />
                    </div>
                    <p>Volume: {volumeState.value}%</p>
                </div>
            </div>

            {/* JSON output for debugging */}
            <div style={{ 
                backgroundColor: '#f8f8f8', 
                padding: '15px', 
                borderRadius: '8px',
                marginTop: '30px',
                fontFamily: 'monospace'
            }}>
                <strong>Current Values:</strong>
                <pre style={{ margin: '10px 0' }}>
{JSON.stringify({ 
  angle: angleState.value, 
  volume: volumeState.value,
  angleState,
  volumeState 
}, null, 2)}
                </pre>
            </div>
        </div>
    );
}

export default KnobDemo;
