import React, { useState, useEffect, useRef } from 'react';
import EnvironmentalGSRMeter from './EnvironmentalGSRMeter.js';
import Meter from './Meter.jsx'; // Your existing meter component

/**
 * GSR Meter Application
 * Integrates Environmental GSR Meter with your existing Meter component
 * Connect cans/electrodes to computer's 3.5mm mic input
 */

function GSRMeterApp() {
    const [gsrValue, setGsrValue] = useState(0);
    const [isConnected, setIsConnected] = useState(false);
    const [gsrData, setGsrData] = useState(null);
    const [sessionData, setSessionData] = useState([]);
    const gsrMeter = useRef(null);

    useEffect(() => {
        // Initialize GSR meter with callback
        gsrMeter.current = new EnvironmentalGSRMeter((data) => {
            setGsrValue(data.meterValue);
            setGsrData(data);
            
            // Store data for CSV export
            setSessionData(prev => [...prev, data]);
        });

        return () => {
            if (gsrMeter.current) {
                gsrMeter.current.stop();
            }
        };
    }, []);

    const handleStartMeasurement = async () => {
        if (gsrMeter.current) {
            const success = await gsrMeter.current.startMeasurement();
            setIsConnected(success);
            
            if (success) {
                // Clear previous session data
                setSessionData([]);
            }
        }
    };

    const handleStopMeasurement = () => {
        if (gsrMeter.current) {
            gsrMeter.current.stop();
            setIsConnected(false);
        }
    };

    const exportToCSV = () => {
        if (sessionData.length === 0) return;
        
        const csv = [
            'Timestamp,Conductance(µS),Resistance(Ω),Amplitude,PercentChange',
            ...sessionData.map(data => 
                `${new Date(data.timestamp).toISOString()},${data.conductance},${data.resistance},${data.amplitude},${data.percentChange}`
            )
        ].join('\n');
        
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `gsr-session-${new Date().toISOString().slice(0,19)}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    return (
        <div className="gsr-meter-app" style={{ 
            padding: '20px', 
            fontFamily: 'Arial, sans-serif',
            maxWidth: '800px',
            margin: '0 auto'
        }}>
            <h1 style={{ textAlign: 'center', color: '#333' }}>
                🥫⚡ Environmental GSR Meter
            </h1>
            
            <div style={{ 
                backgroundColor: '#f5f5f5', 
                padding: '15px', 
                borderRadius: '8px', 
                marginBottom: '20px',
                fontSize: '14px'
            }}>
                <strong>Setup Instructions:</strong>
                <ol style={{ margin: '10px 0', paddingLeft: '20px' }}>
                    <li>Connect alligator clips to two metal cans or electrodes</li>
                    <li>Connect other end to computer's 3.5mm microphone input</li>
                    <li>Hold the cans/electrodes in your hands</li>
                    <li>Click "Connect & Start Measurement" below</li>
                </ol>
            </div>

            {/* Connection Controls */}
            <div style={{ 
                textAlign: 'center', 
                marginBottom: '30px' 
            }}>
                {!isConnected ? (
                    <button 
                        onClick={handleStartMeasurement}
                        style={{
                            backgroundColor: '#4CAF50',
                            color: 'white',
                            border: 'none',
                            padding: '15px 30px',
                            fontSize: '16px',
                            borderRadius: '5px',
                            cursor: 'pointer'
                        }}
                    >
                        🎤 Connect & Start Measurement
                    </button>
                ) : (
                    <div>
                        <button 
                            onClick={handleStopMeasurement}
                            style={{
                                backgroundColor: '#f44336',
                                color: 'white',
                                border: 'none',
                                padding: '15px 30px',
                                fontSize: '16px',
                                borderRadius: '5px',
                                cursor: 'pointer',
                                marginRight: '10px'
                            }}
                        >
                            ⏹️ Stop Measurement
                        </button>
                        
                        <button 
                            onClick={exportToCSV}
                            disabled={sessionData.length === 0}
                            style={{
                                backgroundColor: sessionData.length > 0 ? '#2196F3' : '#ccc',
                                color: 'white',
                                border: 'none',
                                padding: '15px 30px',
                                fontSize: '16px',
                                borderRadius: '5px',
                                cursor: sessionData.length > 0 ? 'pointer' : 'not-allowed'
                            }}
                        >
                            💾 Export CSV ({sessionData.length} samples)
                        </button>
                    </div>
                )}
            </div>

            {/* Your Beautiful Meter Display */}
            <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                marginBottom: '30px' 
            }}>
                <Meter 
                    value={gsrValue} 
                    label="Galvanic Skin Response"
                    unit="µS"
                    // You might want to add an isConnected prop to show connection status
                />
            </div>

            {/* Live Data Display */}
            {gsrData && isConnected && (
                <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '15px',
                    marginBottom: '20px'
                }}>
                    <div style={{ 
                        backgroundColor: '#e8f5e8', 
                        padding: '15px', 
                        borderRadius: '5px',
                        textAlign: 'center'
                    }}>
                        <strong>Conductance</strong>
                        <div style={{ fontSize: '24px', color: '#2e7d2e' }}>
                            {gsrData.conductance.toFixed(2)} µS
                        </div>
                    </div>
                    
                    <div style={{ 
                        backgroundColor: '#e8f4fd', 
                        padding: '15px', 
                        borderRadius: '5px',
                        textAlign: 'center'
                    }}>
                        <strong>Resistance</strong>
                        <div style={{ fontSize: '24px', color: '#1976d2' }}>
                            {(gsrData.resistance/1000).toFixed(1)} kΩ
                        </div>
                    </div>
                    
                    <div style={{ 
                        backgroundColor: '#fff3e0', 
                        padding: '15px', 
                        borderRadius: '5px',
                        textAlign: 'center'
                    }}>
                        <strong>Signal Change</strong>
                        <div style={{ fontSize: '24px', color: '#f57c00' }}>
                            {gsrData.percentChange.toFixed(1)}%
                        </div>
                    </div>
                </div>
            )}

            {/* Connection Status */}
            <div style={{ 
                textAlign: 'center', 
                fontSize: '14px', 
                color: isConnected ? '#4CAF50' : '#666',
                fontWeight: 'bold'
            }}>
                Status: {isConnected ? '🟢 Connected & Measuring' : '🔴 Disconnected'}
            </div>
        </div>
    );
}

export default GSRMeterApp;
