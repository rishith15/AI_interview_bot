// Main Application - AI Interview Bot
import { CONFIG } from './config.js';
import { AudioHandler } from './modules/audio-handler.js';
import { LLMClient } from './modules/llm-client.js';
import { TTSEngine } from './modules/tts-engine.js';
import { AvatarController } from './modules/avatar-controller.js';
import { InteractionManager } from './modules/interaction-manager.js';
import { EmotionDetector } from './modules/emotion-detector.js';
import { CacheManager } from './modules/cache-manager.js';
import { LipSyncController } from './modules/lip-sync-controller.js';
import { BackgroundEffects } from './modules/background-effects.js';

class AIInterviewBot {
    constructor() {
        this.audioHandler = new AudioHandler();
        this.llmClient = new LLMClient(CONFIG);
        this.ttsEngine = new TTSEngine(CONFIG);
        this.avatarController = new AvatarController(CONFIG);
        this.interactionManager = new InteractionManager(CONFIG);

        // Bonus Features
        this.emotionDetector = new EmotionDetector();
        this.cacheManager = new CacheManager(50);
        this.lipSyncController = new LipSyncController(this.avatarController);
        this.backgroundEffects = null; // Initialize later with container

        this.recognition = null;
        this.isInterviewActive = false;
        this.isProcessing = false;
        this.isModelLoaded = false;

        // UI Elements
        this.elements = {};

        // State
        this.currentTranscript = '';
        this.conversationHistory = [];

        // Performance tracking
        this.performanceMetrics = {
            cacheHits: 0,
            cacheMisses: 0,
            avgResponseTime: 0,
            totalRequests: 0
        };
    }

    async initialize() {
        try {
            // Get UI elements
            this.elements = {
                startBtn: document.getElementById('start-btn'),
                stopBtn: document.getElementById('stop-btn'),
                clearBtn: document.getElementById('clear-btn'),
                avatar: document.getElementById('avatar-face'),
                statusIndicator: document.getElementById('status-indicator'),
                statusText: document.getElementById('status-text'),
                statusDot: document.getElementById('status-dot'),
                messagesContainer: document.getElementById('messages'),
                voiceSelect: document.getElementById('voice-select'),
                visualizerBars: document.querySelectorAll('.visualizer-bar'),
                alertContainer: document.getElementById('alert-container'),
                loadingProgress: document.getElementById('loading-progress'),
                loadingText: document.getElementById('loading-text'),
                quickRepliesContainer: document.getElementById('quick-replies'),
                personalitySelect: document.getElementById('personality-select'),
                interviewTypeSelect: document.getElementById('interview-type-select'),
                exportBtn: document.getElementById('export-btn'),
                recordingIndicator: document.getElementById('recording-indicator'),
                audioVisualizer: document.getElementById('audio-visualizer')
            };

            // Initialize TTS
            await this.ttsEngine.initialize();
            this.populateVoiceSelect();

            // Initialize avatar controller
            this.avatarController.initialize(this.elements.avatar);

            // Initialize background effects
            const centerPanel = document.querySelector('.center-panel') || document.querySelector('.avatar-panel');
            if (centerPanel) {
                this.backgroundEffects = new BackgroundEffects(centerPanel);
                this.backgroundEffects.initialize();
                this.backgroundEffects.startParticles(30); // Start with subtle particles
            }

            // Restore cache from localStorage
            this.cacheManager.restore();

            // Set up event listeners
            this.setupEventListeners();

            // Initialize Speech Recognition
            this.initializeSpeechRecognition();

            // Load AI model
            await this.loadAIModel();

            console.log('✓ AI Interview Bot initialized');

        } catch (error) {
            console.error('✗ Initialization failed:', error);
            this.showAlert(`Initialization failed: ${error.message}`, 'error');
        }
    }

    initializeSpeechRecognition() {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

        if (!SpeechRecognition) {
            this.showAlert('Speech Recognition not supported in this browser. Please use Chrome or Edge.', 'error');
            return;
        }

        this.recognition = new SpeechRecognition();
        this.recognition.continuous = false; // Changed to false for better stability on mobile/desktop
        this.recognition.interimResults = true;
        this.recognition.lang = CONFIG.speechRecognition.language;

        this.recognition.onstart = () => {
            console.log('Voice recognition started');
            this.elements.statusIndicator.classList.add('listening');
        };

        this.recognition.onresult = (event) => {
            let interimTranscript = '';
            let finalTranscript = '';

            for (let i = event.resultIndex; i < event.results.length; i++) {
                const transcript = event.results[i][0].transcript;
                if (event.results[i].isFinal) {
                    finalTranscript += transcript + ' ';
                } else {
                    interimTranscript += transcript;
                }
            }

            if (finalTranscript) {
                this.currentTranscript += finalTranscript;
                this.handleUserSpeech(finalTranscript.trim());
            }
        };

        this.recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            if (event.error === 'no-speech' || event.error === 'aborted') {
                return; // Ignore common non-critical errors
            }
            // Only show alert for critical errors
            if (event.error === 'network' || event.error === 'not-allowed') {
                this.showAlert(`Microphone error: ${event.error}`, 'error');
            }
        };

        this.recognition.onend = () => {
            console.log('Voice recognition ended');
            this.elements.statusIndicator.classList.remove('listening');

            // Auto-restart if interview is active and not currently processing AI response
            if (this.isInterviewActive && !this.isProcessing) {
                setTimeout(() => {
                    try {
                        if (this.isInterviewActive && !this.isProcessing) {
                            this.recognition.start();
                            console.log('Voice recognition restarted');
                        }
                    } catch (e) {
                        console.log('Recognition restart ignored:', e.message);
                    }
                }, 300); // Slight delay to prevent rapid cycling
            }
        };
    }

    setupEventListeners() {
        this.elements.startBtn.addEventListener('click', () => this.startInterview());
        this.elements.stopBtn.addEventListener('click', () => this.stopInterview());
        this.elements.clearBtn.addEventListener('click', () => this.clearConversation());

        this.elements.voiceSelect.addEventListener('change', (e) => {
            this.ttsEngine.setVoice(e.target.value);
        });

        if (this.elements.personalitySelect) {
            this.elements.personalitySelect.addEventListener('change', (e) => {
                const newPrompt = this.interactionManager.setPersonality(e.target.value);
                CONFIG.conversation.systemPrompt = newPrompt;
            });
        }

        if (this.elements.interviewTypeSelect) {
            this.elements.interviewTypeSelect.addEventListener('change', (e) => {
                this.interactionManager.setInterviewType(e.target.value);
            });
        }

        if (this.elements.exportBtn) {
            this.elements.exportBtn.addEventListener('click', () => this.exportConversation());
        }

        // Audio handler volume callback
        this.audioHandler.onVolumeChange = (volume) => {
            this.updateVisualizer(volume);
        };

        // TTS callbacks
        this.ttsEngine.onSpeakStart = () => {
            this.avatarController.setState('talking');
            this.updateStatus('speaking', 'AI is speaking...');
        };

        this.ttsEngine.onSpeakEnd = () => {
            if (this.isInterviewActive) {
                this.avatarController.setState('listening');
                this.updateStatus('listening', 'Listening...');
            } else {
                this.avatarController.setState('idle');
                this.updateStatus('idle', 'Interview ended');
            }
        };
    }

    async startInterview() {
        if (!this.isModelLoaded) {
            this.showAlert('AI model is still loading. Please wait...', 'warning');
            return;
        }

        try {

            // Initialize audio
            await this.audioHandler.initialize();
            this.audioHandler.startRecording();

            // Start speech recognition
            this.recognition.start();

            this.isInterviewActive = true;
            this.elements.startBtn.disabled = true;
            this.elements.stopBtn.disabled = false;

            // Show recording indicator
            if (this.elements.recordingIndicator) {
                this.elements.recordingIndicator.classList.add('active');
            }
            if (this.elements.audioVisualizer) {
                this.elements.audioVisualizer.classList.add('recording');
            }

            this.avatarController.setState('listening');
            this.updateStatus('listening', 'Listening...');

            // Add welcome message
            const welcomeMessage = "Hello! I'm your AI interviewer. Let's start with a simple question: Can you tell me a bit about yourself?";
            this.addMessage('ai', welcomeMessage);
            this.updateQuickReplies(welcomeMessage);
            await this.ttsEngine.speak(welcomeMessage);

            this.showAlert('Interview started! Speak naturally.', 'success');

        } catch (error) {
            console.error('Failed to start interview:', error);
            this.showAlert(`Failed to start: ${error.message}`, 'error');
            this.stopInterview();
        }
    }

    stopInterview() {
        this.isInterviewActive = false;

        if (this.recognition) {
            this.recognition.stop();
        }

        this.audioHandler.stopRecording();
        this.ttsEngine.stop();

        // Stop lip-sync
        if (this.lipSyncController) {
            this.lipSyncController.stop();
        }

        // Persist cache
        this.cacheManager.persist();

        // Hide recording indicator
        if (this.elements.recordingIndicator) {
            this.elements.recordingIndicator.classList.remove('active');
        }
        if (this.elements.audioVisualizer) {
            this.elements.audioVisualizer.classList.remove('recording');
        }

        this.elements.startBtn.disabled = false;
        this.elements.stopBtn.disabled = true;

        this.avatarController.setState('idle');
        this.updateStatus('idle', 'Interview stopped');

        this.showAlert('Interview ended.', 'info');
    }

    async handleUserSpeech(transcript) {
        if (!transcript || this.isProcessing || !this.isInterviewActive) return;

        this.isProcessing = true;
        this.addMessage('user', transcript);

        try {
            // Update UI
            this.avatarController.setState('thinking');
            this.updateStatus('thinking', 'AI is thinking...');

            const startTime = performance.now();

            // Check cache first (Latency Optimization)
            let response = this.cacheManager.get(transcript);

            if (response) {
                console.log('✓ Cache hit!');
                this.performanceMetrics.cacheHits++;
            } else {
                console.log('✗ Cache miss, generating response...');
                this.performanceMetrics.cacheMisses++;

                // Get AI response
                response = await this.llmClient.generateResponse(transcript);

                // Cache the response
                this.cacheManager.set(transcript, response);
                this.cacheManager.persist(); // Save to localStorage
            }

            // Track performance
            const responseTime = performance.now() - startTime;
            this.performanceMetrics.totalRequests++;
            this.performanceMetrics.avgResponseTime =
                (this.performanceMetrics.avgResponseTime * (this.performanceMetrics.totalRequests - 1) + responseTime)
                / this.performanceMetrics.totalRequests;

            console.log(`Response time: ${responseTime.toFixed(2)}ms | Cache stats:`, this.cacheManager.getStats());

            // Detect emotion from response (Emotion-based expressions)
            const emotion = this.emotionDetector.detectEmotion(response);
            console.log(`Detected emotion: ${emotion}`);

            // Set avatar emotion before speaking
            this.avatarController.setEmotion(emotion);

            // Add to UI
            this.addMessage('ai', response);
            this.updateQuickReplies(response);

            // Track progress
            this.interactionManager.trackProgress(transcript, response);

            // Update background effects intensity based on emotion
            if (this.backgroundEffects) {
                const intensity = emotion === 'happy' ? 0.8 : emotion === 'curious' ? 0.6 : 0.4;
                this.backgroundEffects.setIntensity(intensity);
            }

            // Speak response with lip-sync
            this.avatarController.setState('talking');

            // Start lip-sync animation (Lip-sync feature)
            const speechDuration = (response.split(' ').length / 2.5) * 1000; // Estimate duration
            this.lipSyncController.syncWithSpeech(response, speechDuration);

            await this.ttsEngine.speak(response);

        } catch (error) {
            console.error('Error processing speech:', error);
            this.showAlert(`Error: ${error.message}`, 'error');

            // Return to listening state
            if (this.isInterviewActive) {
                this.avatarController.setState('listening');
                this.updateStatus('listening', 'Listening...');
            }
        } finally {
            this.isProcessing = false;
        }
    }

    addMessage(role, content) {
        // Ensure content is not empty
        if (!content || content.trim() === '') {
            console.warn('Attempted to add empty message');
            return;
        }

        console.log(`Adding ${role} message:`, content);

        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${role}`;

        const roleSpan = document.createElement('div');
        roleSpan.className = 'message-role';
        roleSpan.textContent = role === 'user' ? 'You' : 'AI Interviewer';

        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        contentDiv.textContent = content;

        // Verify content was set
        console.log('Content div text:', contentDiv.textContent);

        messageDiv.appendChild(roleSpan);
        messageDiv.appendChild(contentDiv);

        this.elements.messagesContainer.appendChild(messageDiv);
        this.elements.messagesContainer.scrollTop = this.elements.messagesContainer.scrollHeight;

        this.conversationHistory.push({ role, content });
    }

    clearConversation() {
        this.elements.messagesContainer.innerHTML = '';
        this.conversationHistory = [];
        if (this.llmClient) {
            this.llmClient.clearHistory();
        }
        this.interactionManager.reset();
        if (this.elements.quickRepliesContainer) {
            this.elements.quickRepliesContainer.innerHTML = '';
        }
        this.showAlert('Conversation cleared.', 'info');
    }

    updateStatus(state, text) {
        this.elements.statusIndicator.className = `status-indicator ${state}`;
        this.elements.statusText.textContent = text;
    }

    updateVisualizer(volume) {
        if (!this.elements.visualizerBars) return;

        this.elements.visualizerBars.forEach((bar, index) => {
            // Create more dynamic waveform based on actual audio
            const baseHeight = 10;
            const maxHeight = 50;
            const randomFactor = Math.sin(Date.now() / 100 + index) * 0.3;
            const height = baseHeight + (volume * maxHeight * (1 + randomFactor));

            bar.style.height = `${Math.max(baseHeight, Math.min(maxHeight, height))}px`;

            if (this.isInterviewActive && !this.isProcessing) {
                bar.classList.add('active');
            } else {
                bar.classList.remove('active');
            }
        });
    }

    updateQuickReplies(aiResponse) {
        if (!this.elements.quickRepliesContainer) return;

        // precise quick replies based on context
        let suggestions = [];
        const lowerResponse = aiResponse.toLowerCase();

        if (lowerResponse.includes('experience') || lowerResponse.includes('work')) {
            suggestions = [
                "I have 3 years of experience...",
                "I worked on a major project where...",
                "My technical skills include..."
            ];
        } else if (lowerResponse.includes('challenge') || lowerResponse.includes('difficulty')) {
            suggestions = [
                "One challenge I faced was...",
                "I handled a difficult situation by...",
                "I resolved a conflict when..."
            ];
        } else if (lowerResponse.includes('project') || lowerResponse.includes('built')) {
            suggestions = [
                "I built a web application using...",
                "The project architecture was based on...",
                "I optimized performance by..."
            ];
        } else {
            suggestions = [
                "Could you clarify that?",
                "Yes, I have experience with that",
                "Let me think about that"
            ];
        }

        this.elements.quickRepliesContainer.innerHTML = '';

        suggestions.forEach(text => {
            const button = document.createElement('button');
            button.className = 'quick-reply-btn';
            button.textContent = text;

            // Add click listener immediately
            button.onclick = () => {
                console.log('Quick reply clicked:', text);
                this.handleUserSpeech(text);
                // Clear replies after selection
                this.elements.quickRepliesContainer.innerHTML = '';
            };

            this.elements.quickRepliesContainer.appendChild(button);
        });
    }

    async loadAIModel() {
        try {
            if (this.elements.loadingProgress) {
                this.elements.loadingProgress.style.display = 'block';
            }

            await this.llmClient.initialize((percent, message) => {
                if (this.elements.loadingProgress) {
                    const progressBar = this.elements.loadingProgress.querySelector('.progress-bar');
                    const progressText = this.elements.loadingText;

                    if (progressBar) progressBar.style.width = `${percent}%`;
                    if (progressText) progressText.textContent = message;
                }
            });

            this.isModelLoaded = true;

            if (this.elements.loadingProgress) {
                setTimeout(() => {
                    this.elements.loadingProgress.style.display = 'none';
                }, 1500);
            }

            this.showAlert('AI model loaded! Ready to start interview.', 'success');

        } catch (error) {
            console.error('Failed to load AI model:', error);
            this.showAlert(`Failed to load AI model: ${error.message}`, 'error');
        }
    }

    updateQuickReplies(lastMessage) {
        if (!this.elements.quickRepliesContainer) return;

        const replies = this.interactionManager.getQuickReplies(lastMessage);
        this.elements.quickRepliesContainer.innerHTML = '';

        replies.forEach(reply => {
            const chip = document.createElement('button');
            chip.className = 'quick-reply-chip';
            chip.textContent = reply;
            chip.addEventListener('click', () => {
                if (this.isInterviewActive && !this.isProcessing) {
                    this.handleUserSpeech(reply);
                }
            });
            this.elements.quickRepliesContainer.appendChild(chip);
        });
    }

    exportConversation() {
        const format = 'txt'; // Could be made configurable
        const content = this.interactionManager.exportConversation(this.conversationHistory, format);

        const blob = new Blob([content], { type: format === 'json' ? 'application/json' : 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `interview_${new Date().toISOString().split('T')[0]}.${format}`;
        a.click();
        URL.revokeObjectURL(url);

        this.showAlert('Conversation exported successfully!', 'success');
    }

    populateVoiceSelect() {
        const voices = this.ttsEngine.getAvailableVoices();
        this.elements.voiceSelect.innerHTML = '';

        voices.forEach(voice => {
            const option = document.createElement('option');
            option.value = voice.name;
            option.textContent = `${voice.name} (${voice.lang})`;
            if (voice.name === this.ttsEngine.selectedVoice?.name) {
                option.selected = true;
            }
            this.elements.voiceSelect.appendChild(option);
        });
    }

    showAlert(message, type = 'info') {
        const alert = document.createElement('div');
        alert.className = `alert alert-${type}`;
        alert.textContent = message;

        this.elements.alertContainer.innerHTML = '';
        this.elements.alertContainer.appendChild(alert);

        setTimeout(() => {
            alert.style.opacity = '0';
            setTimeout(() => alert.remove(), 300);
        }, 5000);
    }
}

// Initialize the application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const app = new AIInterviewBot();
    app.initialize();
});
