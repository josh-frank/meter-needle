/**
 * Environmental GSR Meter
 * Uses microphone input to detect galvanic skin response via environmental electrical noise
 * Connect cans/electrodes to 3.5mm mic input - body acts as antenna for ambient electrical signals
 */

class EnvironmentalGSRMeter {
    constructor(meterUpdateCallback) {
        this.audioContext = null;
        this.microphone = null;
        this.analyzer = null;
        this.isRunning = false;
        
        // Callback to update your meter display
        this.updateMeter = meterUpdateCallback;
        
        // GSR tracking variables
        this.baselineAmplitude = 0;
        this.currentAmplitude = 0;
        this.smoothingFactor = 0.8; // Low-pass filter
        this.calibrationMultiplier = 1.0;
        
        // Frequency analysis setup
        this.powerLineFreq = 60; // 60Hz in US, 50Hz in Europe
        this.sampleRate = 44100;
        this.fftSize = 2048;
    }

    async initialize(deviceId = null) {
        try {
            // Request microphone access
            console.log("🎤 Requesting microphone access...");
            
            const audioConstraints = {
                sampleRate: this.sampleRate,
                channelCount: 1,
                echoCancellation: false,  // CRITICAL: Disable processing
                noiseSuppression: false,  // CRITICAL: Keep the noise!
                autoGainControl: false,   // CRITICAL: Don't auto-adjust
                latency: 0.01            // Low latency
            };
            
            // Use specific device if provided
            if (deviceId) {
                audioConstraints.deviceId = { exact: deviceId };
                console.log(`🎯 Using specific audio device: ${deviceId}`);
            }
            
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: audioConstraints
            });

            // Create audio context
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            // Connect microphone to analyzer
            this.microphone = this.audioContext.createMediaStreamSource(stream);
            this.analyzer = this.audioContext.createAnalyser();
            
            // Configure analyzer for frequency analysis
            this.analyzer.fftSize = this.fftSize;
            this.analyzer.smoothingTimeConstant = 0.3;
            this.analyzer.minDecibels = -90;
            this.analyzer.maxDecibels = -10;
            
            this.microphone.connect(this.analyzer);
            
            console.log("✅ Audio system initialized!");
            return true;
            
        } catch (error) {
            console.error("❌ Failed to initialize audio:", error);
            return false;
        }
    }

    async startMeasurement(deviceId = null) {
        if (!this.audioContext) {
            const success = await this.initialize(deviceId);
            if (!success) return false;
        }

        this.isRunning = true;
        console.log("🚀 Starting GSR measurement...");
        
        // Start with baseline calibration
        await this.calibrateBaseline();
        
        // Begin continuous measurement
        this.measurementLoop();
        
        return true;
    }

    // Get available audio input devices
    static async getAudioInputDevices() {
        try {
            const devices = await navigator.mediaDevices.enumerateDevices();
            const audioInputs = devices.filter(device => device.kind === 'audioinput');
            
            console.log("🎤 Available audio input devices:");
            audioInputs.forEach((device, index) => {
                console.log(`${index + 1}. ${device.label || `Microphone ${index + 1}`} (${device.deviceId.slice(0, 8)}...)`);
            });
            
            return audioInputs;
        } catch (error) {
            console.error("❌ Failed to enumerate audio devices:", error);
            return [];
        }
    }

    async calibrateBaseline() {
        console.log("📏 Calibrating baseline (3 seconds)...");
        
        const samples = [];
        const calibrationTime = 3000; // 3 seconds
        const startTime = Date.now();
        
        return new Promise((resolve) => {
            const collectBaseline = () => {
                const amplitude = this.getCurrentAmplitude();
                samples.push(amplitude);
                
                // Debug: Log every 10th sample to see if we're getting data
                if (samples.length % 10 === 0) {
                    console.log(`📊 Calibration sample ${samples.length}: ${amplitude}`);
                }
                
                if (Date.now() - startTime < calibrationTime) {
                    requestAnimationFrame(collectBaseline);
                } else {
                    // Calculate average baseline
                    this.baselineAmplitude = samples.reduce((sum, val) => sum + val, 0) / samples.length;
                    console.log(`✅ Baseline established: ${this.baselineAmplitude.toFixed(2)} from ${samples.length} samples`);
                    
                    // Debug: Show sample statistics
                    const minSample = Math.min(...samples);
                    const maxSample = Math.max(...samples);
                    console.log(`📈 Sample range: ${minSample} to ${maxSample}`);
                    
                    // Warn if baseline is suspiciously low
                    if (this.baselineAmplitude < 0.1) {
                        console.warn("⚠️ Very low baseline amplitude - microphone might not be working");
                    }
                    
                    resolve();
                }
            };
            collectBaseline();
        });
    }

    measurementLoop() {
        if (!this.isRunning) return;

        // Get current amplitude at power line frequency
        const rawAmplitude = this.getCurrentAmplitude();
        
        // Apply smoothing (low-pass filter)
        this.currentAmplitude = (this.smoothingFactor * this.currentAmplitude) + 
                               ((1 - this.smoothingFactor) * rawAmplitude);

        // Calculate GSR metrics
        const gsrData = this.calculateGSR();
        
        // Update meter display
        this.updateMeter(gsrData);
        
        // Log for debugging (remove in production)
        if (Math.random() < 0.01) { // Log 1% of samples
            console.log(`📊 Raw: ${rawAmplitude.toFixed(2)}, Smooth: ${this.currentAmplitude.toFixed(2)}, GSR: ${gsrData.conductance.toFixed(2)}µS`);
        }

        // Continue the loop
        requestAnimationFrame(() => this.measurementLoop());
    }

    getCurrentAmplitude() {
        const frequencyData = new Uint8Array(this.analyzer.frequencyBinCount);
        this.analyzer.getByteFrequencyData(frequencyData);
        
        // Calculate which FFT bin corresponds to power line frequency
        const binWidth = this.sampleRate / this.fftSize;
        const powerLineBin = Math.floor(this.powerLineFreq / binWidth);
        
        // Get amplitude at power line frequency and harmonics
        const fundamental = frequencyData[powerLineBin] || 0;
        const secondHarmonic = frequencyData[powerLineBin * 2] || 0;
        const thirdHarmonic = frequencyData[powerLineBin * 3] || 0;
        
        // Combine harmonics (weighted average)
        const combinedAmplitude = (fundamental * 1.0) + 
                                (secondHarmonic * 0.5) + 
                                (thirdHarmonic * 0.25);
        
        return combinedAmplitude;
    }

    calculateGSR() {
        // SAFETY CHECKS to prevent NaN values!
        
        // Ensure we have valid baseline (prevent division by zero)
        if (!this.baselineAmplitude || this.baselineAmplitude === 0) {
            console.warn("⚠️ Zero baseline amplitude - using fallback");
            this.baselineAmplitude = 1; // Minimum fallback value
        }
        
        // Ensure current amplitude is valid
        const safeCurrentAmplitude = Number.isFinite(this.currentAmplitude) ? this.currentAmplitude : 0;
        
        // Calculate change from baseline
        const amplitudeDelta = safeCurrentAmplitude - this.baselineAmplitude;
        const percentChange = (amplitudeDelta / this.baselineAmplitude) * 100;
        
        // Ensure percent change is finite
        const safePercentChange = Number.isFinite(percentChange) ? percentChange : 0;
        
        // Convert to resistance estimate (this is the magic!)
        // Lower amplitude = higher resistance (signal is being attenuated)
        // Higher amplitude = lower resistance (better signal conduction)
        const resistanceChange = -safePercentChange * this.calibrationMultiplier;
        
        // Estimate absolute resistance (requires calibration with known resistors)
        const baseResistance = 100000; // 100kΩ typical baseline
        let estimatedResistance = baseResistance * (1 + resistanceChange / 100);
        
        // Ensure resistance is positive and finite (prevent division by zero in conductance)
        estimatedResistance = Math.max(1000, Number.isFinite(estimatedResistance) ? estimatedResistance : 100000);
        
        // Calculate conductance (inverse of resistance)
        const conductance = (1 / estimatedResistance) * 1000000; // microsiemens
        
        // Normalize for meter display (0-100 scale) - with safety bounds
        const safeConductance = Number.isFinite(conductance) ? conductance : 10;
        const meterValue = Math.max(0, Math.min(100, 
            (safeConductance - 5) / (50 - 5) * 100 // 5-50µS range
        ));

        const result = {
            amplitude: safeCurrentAmplitude,
            percentChange: safePercentChange,
            resistance: estimatedResistance,
            conductance: safeConductance,
            meterValue: Number.isFinite(meterValue) ? meterValue : 0,
            timestamp: Date.now()
        };
        
        // Debug logging for NaN detection
        if (Object.values(result).some(val => !Number.isFinite(val))) {
            console.warn("⚠️ NaN detected in GSR calculation:", result);
        }

        return result;
    }

    // Calibration helper - use with known resistors
    calibrateWithResistor(knownResistance, measuredAmplitude) {
        const expectedChange = (knownResistance - 100000) / 100000 * 100;
        const actualChange = (measuredAmplitude - this.baselineAmplitude) / this.baselineAmplitude * 100;
        
        if (actualChange !== 0) {
            this.calibrationMultiplier = expectedChange / actualChange;
            console.log(`🔧 Calibration updated: ${this.calibrationMultiplier.toFixed(3)}`);
        }
    }

    stop() {
        this.isRunning = false;
        if (this.microphone) {
            this.microphone.disconnect();
        }
        if (this.audioContext) {
            this.audioContext.close();
        }
        console.log("⏹️ GSR measurement stopped");
    }

    // Data export for CSV logging
    exportData() {
        // Implementation for CSV export of collected data
        return {
            session_start: this.sessionStart,
            baseline: this.baselineAmplitude,
            current_data: this.lastGSRData
        };
    }
}

export default EnvironmentalGSRMeter;
