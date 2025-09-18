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
    const [audioDevices, setAudioDevices] = useState([]);
    const [selectedDevice, setSelectedDevice] = useState('');
    const gsrMeter = useRef(null);

    useEffect(() => {
        // Initialize GSR meter with callback
        gsrMeter.current = new EnvironmentalGSRMeter((data) => {
            setGsrValue(data.meterValue);
            setGsrData(data);
            
            // Store data for CSV export
            setSessionData(prev => [...prev, data]);
        });

        // Load available audio devices
        const loadAudioDevices = async () => {
            const devices = await EnvironmentalGSRMeter.getAudioInputDevices();
            setAudioDevices(devices);
            
            // Auto-select first device if available
            if (devices.length > 0 && !selectedDevice) {
                setSelectedDevice(devices[0].deviceId);
            }
        };
        
        loadAudioDevices();

        return () => {
            if (gsrMeter.current) {
                gsrMeter.current.stop();
            }
        };
    }, [selectedDevice]);

    const handleStartMeasurement = async () => {
        if (gsrMeter.current) {
            const deviceId = selectedDevice || null;
            console.log(`🎯 Starting measurement with device: ${deviceId || 'default'}`);
            
            const success = await gsrMeter.current.startMeasurement(deviceId);
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

            {/* Audio Device Selection */}
            <div style={{ 
                backgroundColor: '#e3f2fd', 
                padding: '15px', 
                borderRadius: '8px', 
                marginBottom: '20px',
                fontSize: '14px'
            }}>
                <strong>🎤 Select Audio Input Device:</strong>
                <div style={{ marginTop: '10px' }}>
                    <select 
                        value={selectedDevice}
                        onChange={(e) => setSelectedDevice(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '8px',
                            borderRadius: '4px',
                            border: '1px solid #ccc',
                            fontSize: '14px'
                        }}
                        disabled={isConnected}
                    >
                        {audioDevices.map((device, index) => (
                            <option key={device.deviceId} value={device.deviceId}>
                                {device.label || `Microphone ${index + 1}`}
                                {device.label.toLowerCase().includes('built-in') && ' (Built-in - NOT for GSR)'}
                                {device.label.toLowerCase().includes('line') && ' (Line Input - Good for GSR!)'}
                                {device.label.toLowerCase().includes('external') && ' (External - Good for GSR!)'}
                            </option>
                        ))}
                    </select>
                    <div style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
                        💡 Choose "Line Input", "External", or avoid "Built-in" for best GSR results
                    </div>
                </div>
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
                <Meter state={{
                    value: gsrValue,
                    min: 0,
                    max: 100,
                    startAngle: -130,
                    endAngle: 130,
                    numMarks: 21,
                    highlightEveryNth: 5
                }} />
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
