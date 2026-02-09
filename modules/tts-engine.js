// TTS Engine Module - Handles text-to-speech conversion
export class TTSEngine {
    constructor(config) {
        this.config = config;
        this.synth = window.speechSynthesis;
        this.currentUtterance = null;
        this.isSpeaking = false;
        this.selectedVoice = null;
        this.onSpeakStart = null;
        this.onSpeakEnd = null;
        this.onSpeakProgress = null;
    }

    async initialize() {
        return new Promise((resolve) => {
            // Wait for voices to load
            const loadVoices = () => {
                const voices = this.synth.getVoices();

                if (voices.length > 0) {
                    // Try to find a good English voice
                    this.selectedVoice = voices.find(v =>
                        v.lang.startsWith('en') && v.name.includes('Google')
                    ) || voices.find(v =>
                        v.lang.startsWith('en')
                    ) || voices[0];

                    console.log('✓ TTS initialized with voice:', this.selectedVoice.name);
                    resolve(true);
                }
            };

            // Voices might load asynchronously
            if (this.synth.getVoices().length > 0) {
                loadVoices();
            } else {
                this.synth.addEventListener('voiceschanged', loadVoices, { once: true });
                // Fallback timeout
                setTimeout(() => {
                    if (!this.selectedVoice) {
                        loadVoices();
                    }
                }, 100);
            }
        });
    }

    async speak(text) {
        // Cancel any ongoing speech
        this.stop();

        return new Promise((resolve, reject) => {
            if (!text || text.trim().length === 0) {
                resolve();
                return;
            }

            this.currentUtterance = new SpeechSynthesisUtterance(text);

            // Apply configuration
            this.currentUtterance.voice = this.selectedVoice;
            this.currentUtterance.rate = this.config.tts.rate;
            this.currentUtterance.pitch = this.config.tts.pitch;
            this.currentUtterance.volume = this.config.tts.volume;
            this.currentUtterance.lang = this.config.tts.lang;

            // Event handlers
            this.currentUtterance.onstart = () => {
                this.isSpeaking = true;
                if (this.onSpeakStart) {
                    this.onSpeakStart();
                }
            };

            this.currentUtterance.onend = () => {
                this.isSpeaking = false;
                if (this.onSpeakEnd) {
                    this.onSpeakEnd();
                }
                resolve();
            };

            this.currentUtterance.onerror = (event) => {
                this.isSpeaking = false;
                console.error('✗ TTS error:', event);
                reject(event);
            };

            this.currentUtterance.onboundary = (event) => {
                if (this.onSpeakProgress && event.name === 'word') {
                    this.onSpeakProgress(event.charIndex, event.charLength);
                }
            };

            // Start speaking
            this.synth.speak(this.currentUtterance);
        });
    }

    stop() {
        if (this.synth.speaking) {
            this.synth.cancel();
        }
        this.isSpeaking = false;
    }

    pause() {
        if (this.synth.speaking) {
            this.synth.pause();
        }
    }

    resume() {
        if (this.synth.paused) {
            this.synth.resume();
        }
    }

    getAvailableVoices() {
        return this.synth.getVoices().filter(v => v.lang.startsWith('en'));
    }

    setVoice(voiceName) {
        const voices = this.synth.getVoices();
        const voice = voices.find(v => v.name === voiceName);
        if (voice) {
            this.selectedVoice = voice;
            return true;
        }
        return false;
    }
}
