// Audio Handler Module - Manages microphone input and audio playback
export class AudioHandler {
    constructor() {
        this.mediaStream = null;
        this.audioContext = null;
        this.analyser = null;
        this.isRecording = false;
        this.onVolumeChange = null;
    }

    async initialize() {
        try {
            // Request microphone access
            this.mediaStream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true,
                    sampleRate: 16000
                }
            });

            // Set up audio context for visualization
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.analyser = this.audioContext.createAnalyser();
            this.analyser.fftSize = 256;

            const source = this.audioContext.createMediaStreamSource(this.mediaStream);
            source.connect(this.analyser);

            console.log('✓ Audio initialized successfully');
            return true;
        } catch (error) {
            console.error('✗ Audio initialization failed:', error);
            throw new Error(`Microphone access denied: ${error.message}`);
        }
    }

    startRecording() {
        this.isRecording = true;
        this.startVolumeMonitoring();
    }

    stopRecording() {
        this.isRecording = false;
    }

    startVolumeMonitoring() {
        if (!this.analyser || !this.isRecording) return;

        const bufferLength = this.analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        const monitor = () => {
            if (!this.isRecording) return;

            this.analyser.getByteFrequencyData(dataArray);

            // Calculate average volume
            const average = dataArray.reduce((a, b) => a + b) / bufferLength;
            const normalizedVolume = average / 255;

            if (this.onVolumeChange) {
                this.onVolumeChange(normalizedVolume);
            }

            requestAnimationFrame(monitor);
        };

        monitor();
    }

    getAudioData() {
        if (!this.analyser) return [];

        const bufferLength = this.analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        this.analyser.getByteFrequencyData(dataArray);

        return Array.from(dataArray);
    }

    cleanup() {
        if (this.mediaStream) {
            this.mediaStream.getTracks().forEach(track => track.stop());
        }
        if (this.audioContext) {
            this.audioContext.close();
        }
        this.isRecording = false;
    }
}
