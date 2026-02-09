// Avatar Controller Module - Manages avatar animations and expressions
export class AvatarController {
    constructor(config) {
        this.config = config;
        this.avatarElement = null;
        this.currentState = 'idle';
        this.currentEmotion = 'neutral';
        this.animationInterval = null;

        // Emoji variations for different states
        this.emojis = {
            idle: ['🤖', '😊', '👋'],
            listening: ['👂', '🎧', '👀'],
            thinking: ['🤔', '💭', '🧠'],
            talking: ['💬', '🗣️', '😄']
        };

        // Emotion-based expressions
        this.emotionEmojis = {
            happy: ['😊', '😄', '🤗', '😃'],
            curious: ['🤨', '🧐', '🤔', '🔍'],
            thinking: ['💭', '🤔', '🧠', '💡'],
            encouraging: ['👍', '🌟', '✨', '💪'],
            neutral: ['🤖', '💼', '👔', '😐']
        };

        // Mouth shapes for lip-sync
        this.mouthShapes = {
            'a': '😮',
            'e': '😊',
            'i': '😁',
            'o': '😲',
            'u': '😗',
            'closed': '🙂',
            'talking': '💬'
        };

        this.currentEmojiIndex = 0;
    }

    initialize(avatarElement) {
        this.avatarElement = avatarElement;
        this.setState('idle');
        console.log('✓ Avatar controller initialized');
    }

    setState(state) {
        if (!this.avatarElement) return;

        // Remove all state classes
        this.avatarElement.classList.remove('idle', 'listening', 'thinking', 'talking');

        // Add new state class
        this.avatarElement.classList.add(state);
        this.currentState = state;

        // Update emoji
        this.updateEmoji(state);

        // Handle state-specific animations
        switch (state) {
            case 'idle':
                this.startIdleAnimation();
                break;
            case 'listening':
                this.startListeningAnimation();
                break;
            case 'thinking':
                this.startThinkingAnimation();
                break;
            case 'talking':
                this.startTalkingAnimation();
                break;
        }
    }

    updateEmoji(state) {
        if (!this.avatarElement) return;

        const emojis = this.emojis[state] || this.emojis.idle;
        this.currentEmojiIndex = 0;
        this.avatarElement.textContent = emojis[this.currentEmojiIndex];
    }

    rotateEmoji() {
        if (!this.avatarElement || !this.emojis[this.currentState]) return;

        const emojis = this.emojis[this.currentState];
        this.currentEmojiIndex = (this.currentEmojiIndex + 1) % emojis.length;
        this.avatarElement.textContent = emojis[this.currentEmojiIndex];
    }

    // Set emotion-based expression
    setEmotion(emotion) {
        if (!this.avatarElement) return;

        this.currentEmotion = emotion;
        const emojis = this.emotionEmojis[emotion] || this.emotionEmojis.neutral;
        this.avatarElement.textContent = emojis[0];

        console.log(`Avatar emotion: ${emotion}`);
    }

    // Set mouth shape for lip-sync
    setMouthShape(shape) {
        if (!this.avatarElement) return;

        const emoji = this.mouthShapes[shape] || this.mouthShapes.talking;
        this.avatarElement.textContent = emoji;
    }

    startIdleAnimation() {
        this.clearAnimation();
        // Idle animation is handled by CSS
        // Occasionally rotate emoji
        this.animationInterval = setInterval(() => {
            if (this.currentState === 'idle') {
                this.rotateEmoji();
            }
        }, 5000);
    }

    startListeningAnimation() {
        this.clearAnimation();
        // Listening animation with emoji rotation
        this.animationInterval = setInterval(() => {
            if (this.currentState === 'listening') {
                this.rotateEmoji();
            }
        }, 2000);
    }

    startThinkingAnimation() {
        this.clearAnimation();
        // Thinking animation with faster emoji rotation
        this.animationInterval = setInterval(() => {
            if (this.currentState === 'thinking') {
                this.rotateEmoji();
            }
        }, 800);
    }

    startTalkingAnimation() {
        this.clearAnimation();
        // Talking animation with rapid emoji changes
        this.animationInterval = setInterval(() => {
            if (this.currentState === 'talking') {
                this.rotateEmoji();
            }
        }, 500);
    }

    // Sync avatar mouth movement with speech
    syncWithSpeech(text, onProgress) {
        if (!this.config.avatar.enableLipSync) return;

        // Simple word-based animation
        const words = text.split(' ');
        let wordIndex = 0;

        this.animationInterval = setInterval(() => {
            if (wordIndex >= words.length) {
                this.clearAnimation();
                return;
            }

            // Trigger mouth movement for each word
            this.animateMouth();
            wordIndex++;

            if (onProgress) {
                onProgress(wordIndex / words.length);
            }
        }, this.config.avatar.talkingAnimationSpeed);
    }

    animateMouth() {
        if (!this.avatarElement) return;

        // Add a subtle scale effect to simulate talking
        this.avatarElement.style.transform = 'scale(1.05)';
        setTimeout(() => {
            if (this.avatarElement) {
                this.avatarElement.style.transform = 'scale(1)';
            }
        }, 100);
    }

    clearAnimation() {
        if (this.animationInterval) {
            clearInterval(this.animationInterval);
            this.animationInterval = null;
        }
    }

    // Update avatar expression based on emotion/context
    setExpression(expression) {
        this.setEmotion(expression);
    }

    cleanup() {
        this.clearAnimation();
        this.currentState = 'idle';
    }
}
