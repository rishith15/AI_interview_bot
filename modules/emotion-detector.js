// Emotion Detector Module - Analyzes text sentiment for facial expressions
export class EmotionDetector {
    constructor() {
        this.emotions = {
            happy: ['great', 'excellent', 'good', 'wonderful', 'amazing', 'fantastic', 'love', 'enjoy'],
            curious: ['what', 'how', 'why', 'when', 'where', 'which', 'who', 'tell me'],
            thinking: ['hmm', 'let me', 'consider', 'think', 'analyze', 'evaluate'],
            encouraging: ['can you', 'could you', 'would you', 'please', 'share'],
            neutral: ['okay', 'alright', 'understood', 'noted']
        };

        this.expressionMap = {
            happy: ['😊', '😄', '🤗', '😃'],
            curious: ['🤨', '🧐', '🤔', '🔍'],
            thinking: ['💭', '🤔', '🧠', '💡'],
            encouraging: ['👍', '🌟', '✨', '💪'],
            neutral: ['🤖', '💼', '👔', '😐']
        };
    }

    detectEmotion(text) {
        const lowerText = text.toLowerCase();

        // Check each emotion category
        for (const [emotion, keywords] of Object.entries(this.emotions)) {
            const matchCount = keywords.filter(keyword =>
                lowerText.includes(keyword)
            ).length;

            if (matchCount > 0) {
                return emotion;
            }
        }

        return 'neutral';
    }

    getExpressionForEmotion(emotion) {
        const expressions = this.expressionMap[emotion] || this.expressionMap.neutral;
        return expressions[0]; // Return primary expression
    }

    getRandomExpressionForEmotion(emotion) {
        const expressions = this.expressionMap[emotion] || this.expressionMap.neutral;
        return expressions[Math.floor(Math.random() * expressions.length)];
    }

    analyzeConversation(messages) {
        const recentMessages = messages.slice(-3);
        const emotions = recentMessages.map(msg => this.detectEmotion(msg.content));

        // Return most common emotion
        const emotionCounts = {};
        emotions.forEach(emotion => {
            emotionCounts[emotion] = (emotionCounts[emotion] || 0) + 1;
        });

        return Object.keys(emotionCounts).reduce((a, b) =>
            emotionCounts[a] > emotionCounts[b] ? a : b
        );
    }
}
