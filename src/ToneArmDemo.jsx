import React, { useState } from 'react';
import ToneArm from './ToneArm.jsx';
import Meter from './Meter.jsx';

/**
 * Demo component showing ToneArm in action
 * Shows how the rotary encoder controls values and can work with your Meter display
 */

function ToneArmDemo() {
    const [toneArmValue, setToneArmValue] = useState(25);
    const [sensitivity, setSensitivity] = useState(75);

    // Meter state based on tone arm value
    const meterState = {
        value: toneArmValue,
        min: 0,
        max: 100,
        startAngle: -90,
        endAngle: 90,
        numMarks: 21,
        highlightEveryNth: 5
    };

    return (
        <div style={{ 
            padding: '20px', 
            fontFamily: 'Arial, sans-serif',
            maxWidth: '1000px',
            margin: '0 auto'
        }}>
            <h1 style={{ textAlign: 'center', color: '#333' }}>
                🎛️ E-Meter Style Tone Arm Demo
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
                    <li>Click and drag the red needle to adjust values</li>
                    <li>The hidden range input maintains proper form state</li>
                    <li>Works with mouse and touch devices</li>
                    <li>Perfect for e-meter tone arm controls!</li>
                </ul>
            </div>

            {/* Two-column layout */}
            <div style={{ 
                display: 'grid', 
                gridTemplateColumns: '1fr 1fr',
                gap: '30px',
                marginBottom: '30px'
            }}>
                {/* Left: Interactive ToneArm */}
                <div>
                    <ToneArm
                        value={toneArmValue}
                        onChange={setToneArmValue}
                        min={0}
                        max={100}
                        step={0.1}
                        startAngle={-130}
                        endAngle={130}
                        numMarks={25}
                        highlightEveryNth={5}
                        label="📡 Main Tone Arm"
                    />
                    
                    {/* Second tone arm for sensitivity */}
                    <ToneArm
                        value={sensitivity}
                        onChange={setSensitivity}
                        min={0}
                        max={100}
                        step={1}
                        startAngle={-130}
                        endAngle={130}
                        numMarks={11}
                        highlightEveryNth={2}
                        label="🎚️ Sensitivity"
                    />
                </div>

                {/* Right: Meter Display showing the result */}
                <div>
                    <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                        <h3 style={{ color: '#2c3e50' }}>📊 Meter Display</h3>
                        <p style={{ color: '#666', fontSize: '14px' }}>
                            Shows the value from your tone arm
                        </p>
                    </div>
                    
                    <Meter state={meterState} />
                    
                    {/* Live values */}
                    <div style={{ 
                        display: 'grid', 
                        gridTemplateColumns: '1fr 1fr',
                        gap: '15px',
                        marginTop: '20px'
                    }}>
                        <div style={{ 
                            backgroundColor: '#e8f5e8', 
                            padding: '15px', 
                            borderRadius: '5px',
                            textAlign: 'center'
                        }}>
                            <strong>Tone Arm</strong>
                            <div style={{ fontSize: '24px', color: '#2e7d2e' }}>
                                {toneArmValue.toFixed(1)}
                            </div>
                        </div>
                        
                        <div style={{ 
                            backgroundColor: '#e8f4fd', 
                            padding: '15px', 
                            borderRadius: '5px',
                            textAlign: 'center'
                        }}>
                            <strong>Sensitivity</strong>
                            <div style={{ fontSize: '24px', color: '#1976d2' }}>
                                {sensitivity}%
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Form integration example */}
            <div style={{ 
                backgroundColor: '#fff3e0', 
                padding: '20px', 
                borderRadius: '8px',
                marginTop: '30px'
            }}>
                <h3 style={{ margin: '0 0 15px 0', color: '#f57c00' }}>
                    🔧 Form Integration
                </h3>
                <p style={{ margin: '0 0 15px 0', fontSize: '14px' }}>
                    The ToneArm uses a hidden range input, so it works perfectly with forms:
                </p>
                <form onSubmit={(e) => { 
                    e.preventDefault(); 
                    alert(`Form submitted!\nTone Arm: ${toneArmValue}\nSensitivity: ${sensitivity}`);
                }}>
                    <div style={{ marginBottom: '15px' }}>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                            Regular Range Input (for comparison):
                        </label>
                        <input 
                            type="range" 
                            min="0" 
                            max="100" 
                            value={toneArmValue}
                            onChange={(e) => setToneArmValue(Number(e.target.value))}
                            style={{ width: '100%' }}
                        />
                        <div style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
                            Value: {toneArmValue}
                        </div>
                    </div>
                    
                    <button type="submit" style={{
                        backgroundColor: '#4CAF50',
                        color: 'white',
                        border: 'none',
                        padding: '10px 20px',
                        fontSize: '16px',
                        borderRadius: '5px',
                        cursor: 'pointer'
                    }}>
                        Submit Form
                    </button>
                </form>
            </div>
        </div>
    );
}

export default ToneArmDemo;
