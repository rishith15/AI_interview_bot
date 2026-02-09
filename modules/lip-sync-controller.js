// Lip Sync Controller Module - Synchronizes mouth movements with speech
export class LipSyncController {
    constructor(avatarController) {
        this.avatar = avatarController;
        this.isActive = false;
        this.currentInterval = null;

        // Phoneme to mouth shape mapping
        this.mouthShapes = {
            'a': '😮',
            'e': '😊',
            'i': '😁',
            'o': '😲',
            'u': '😗',
            'closed': '🙂',
            'talking': '💬'
        };
    }

    async syncWithSpeech(text, duration) {
        if (!text || duration <= 0) return;

        this.isActive = true;
        const words = text.split(' ');
        const timePerWord = duration / words.length;

        for (let i = 0; i < words.length && this.isActive; i++) {
            const word = words[i];
            const shape = this.getShapeForWord(word);

            // Update avatar mouth
            if (this.avatar && this.avatar.setMouthShape) {
                this.avatar.setMouthShape(shape);
            }

            await this.sleep(timePerWord);
        }

        // Close mouth when done
        if (this.avatar && this.avatar.setMouthShape) {
            this.avatar.setMouthShape(this.mouthShapes.closed);
        }

        this.isActive = false;
    }

    getShapeForWord(word) {
        // Simple vowel detection for mouth shape
        const vowels = word.toLowerCase().match(/[aeiou]/g);

        if (!vowels || vowels.length === 0) {
            return this.mouthShapes.closed;
        }

        // Use first vowel for mouth shape
        const firstVowel = vowels[0];
        return this.mouthShapes[firstVowel] || this.mouthShapes.talking;
    }

    // Animate mouth opening/closing
    async animateTalking(duration) {
        this.isActive = true;
        const interval = 200; // ms between mouth movements
        const iterations = Math.floor(duration / interval);

        for (let i = 0; i < iterations && this.isActive; i++) {
            const shape = i % 2 === 0 ? this.mouthShapes.talking : this.mouthShapes.closed;

            if (this.avatar && this.avatar.setMouthShape) {
                this.avatar.setMouthShape(shape);
            }

            await this.sleep(interval);
        }

        this.isActive = false;
    }

    stop() {
        this.isActive = false;
        if (this.currentInterval) {
            clearInterval(this.currentInterval);
            this.currentInterval = null;
        }
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
