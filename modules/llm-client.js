// LLM Client Module - Handles local AI model integration using Transformers.js
export class LLMClient {
    constructor(config) {
        this.config = config;
        this.conversationHistory = [];
        this.systemPrompt = config.conversation.systemPrompt;
        this.pipeline = null;
        this.isModelLoaded = false;
        this.onLoadProgress = null;
    }

    async initialize(onProgress = null) {
        try {
            this.onLoadProgress = onProgress;

            if (onProgress) onProgress(0, 'Starting model load...');

            // Dynamically import Transformers.js
            const { pipeline } = await import('https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.2');

            if (onProgress) onProgress(30, 'Initializing model...');

            // Load the text generation pipeline with a conversational model
            // Using smaller model for faster loading
            this.pipeline = await pipeline(
                'text2text-generation',
                'Xenova/flan-t5-small',
                {
                    progress_callback: (progress) => {
                        if (onProgress && progress.status === 'progress') {
                            const percent = Math.min(30 + (progress.progress || 0) * 60, 90);
                            onProgress(percent, `Loading model: ${Math.round(progress.progress * 100)}%`);
                        }
                    }
                }
            );

            this.isModelLoaded = true;

            if (onProgress) onProgress(100, 'Model loaded successfully!');

            console.log('✓ Local AI model loaded');
            return true;

        } catch (error) {
            console.error('✗ Failed to load model:', error);
            throw error;
        }
    }

    async generateResponse(userMessage) {
        if (!this.isModelLoaded) {
            throw new Error('Model not loaded. Call initialize() first.');
        }

        try {
            // Add user message to history
            this.conversationHistory.push({
                role: 'user',
                content: userMessage
            });

            // Try to generate a good response with retries
            let response = await this.generateWithRetry(userMessage, 3);

            // Add AI response to history
            this.conversationHistory.push({
                role: 'assistant',
                content: response
            });

            return response;

        } catch (error) {
            console.error('Error generating response:', error);
            throw error;
        }
    }

    async generateWithRetry(userMessage, maxRetries = 3) {
        let temperature = 0.8;

        for (let attempt = 0; attempt < maxRetries; attempt++) {
            try {
                // Build better prompt based on context
                const prompt = this.buildContextualPrompt(userMessage);

                // Generate response
                const result = await this.pipeline(prompt, {
                    max_new_tokens: 80,
                    temperature: temperature,
                    top_k: 50,
                    top_p: 0.92,
                    do_sample: true,
                    repetition_penalty: 1.5,
                    num_beams: 2
                });

                let aiResponse = result[0].generated_text.trim();
                aiResponse = this.cleanResponse(aiResponse);

                // Validate response quality
                if (this.validateResponse(aiResponse, userMessage)) {
                    return aiResponse;
                }

                // Increase temperature for next attempt
                temperature += 0.15;
                console.log(`Response validation failed, retry ${attempt + 1}/${maxRetries}`);

            } catch (error) {
                console.error(`Generation attempt ${attempt + 1} failed:`, error);
            }
        }

        // All retries failed, use fallback
        return this.getFallbackQuestion(userMessage);
    }

    buildContextualPrompt(userMessage) {
        const historyLength = this.conversationHistory.length;

        // For first interaction
        if (historyLength <= 1) {
            return `Instruction: You are a Technical Interviewer for a Senior Software Engineer role. The candidate just introduced themselves: "${userMessage}".\nTask: Ask a specific technical question about their coding experience or a relevant technology.\n\nTechnical Question:`;
        }

        // Build context from recent conversation (last 2 exchanges)
        const recentMessages = this.conversationHistory.slice(-4);
        let conversation = '';

        recentMessages.forEach(msg => {
            if (msg.role === 'user') {
                conversation += `Candidate: ${msg.content}\n`;
            } else {
                conversation += `Interviewer: ${msg.content}\n`;
            }
        });

        // Create focused prompt with strict technical persona
        return `Instruction: You are a strict Technical Interviewer. Analyze the conversation below. Based on the candidate's last answer, ask a follow-up TECHNICAL question to test their depth of knowledge. Avoid generic questions. Focus on "how" and "why".\n\nConversation History:\n${conversation}\n\nCandidate's Last Answer: "${userMessage}"\n\nFollow-up Technical Question:`;
    }

    validateResponse(response, userMessage) {
        const lowerResponse = response.toLowerCase();

        // Check for generic/repetitive phrases
        const badPhrases = [
            'professional job interviewer',
            'i am a',
            'my name is',
            'i\'m here to',
            'let me introduce'
        ];

        for (const phrase of badPhrases) {
            if (lowerResponse.includes(phrase)) {
                console.log('Response contains generic phrase:', phrase);
                return false;
            }
        }

        // Must be a question
        if (!response.includes('?')) {
            console.log('Response is not a question');
            return false;
        }

        // Should be reasonable length
        if (response.length < 10 || response.length > 300) {
            console.log('Response length invalid:', response.length);
            return false;
        }

        // Should not just repeat user's words
        const userWords = userMessage.toLowerCase().split(' ');
        const responseWords = lowerResponse.split(' ');
        const overlap = userWords.filter(word =>
            word.length > 4 && responseWords.includes(word)
        ).length;

        if (overlap > userWords.length * 0.7) {
            console.log('Response too similar to input');
            return false;
        }

        return true;
    }

    getFallbackQuestion(userMessage) {
        // Intelligent fallback questions based on keywords
        const lowerMsg = userMessage.toLowerCase();

        if (lowerMsg.includes('experience') || lowerMsg.includes('worked')) {
            return "Can you tell me more about the challenges you faced in that role?";
        }
        if (lowerMsg.includes('project') || lowerMsg.includes('built')) {
            return "What technologies did you use and why did you choose them?";
        }
        if (lowerMsg.includes('team') || lowerMsg.includes('collaborate')) {
            return "How do you handle disagreements within a team?";
        }
        if (lowerMsg.includes('skill') || lowerMsg.includes('learn')) {
            return "What's the most challenging skill you've had to learn recently?";
        }
        if (lowerMsg.includes('problem') || lowerMsg.includes('solve')) {
            return "Can you walk me through your problem-solving approach?";
        }

        // Generic fallbacks
        const genericQuestions = [
            "That's interesting. Can you elaborate on that?",
            "What made you choose that particular approach?",
            "How did that experience shape your career goals?",
            "What would you do differently if you could do it again?",
            "What did you learn from that experience?"
        ];

        return genericQuestions[Math.floor(Math.random() * genericQuestions.length)];
    }

    cleanResponse(response) {
        // Remove common artifacts but preserve actual content
        let cleaned = response
            .replace(/^(Interviewer:|Question:|Ask:|Response:)\s*/i, '')
            .replace(/^["']\s*/, '')
            .replace(/\s*["']$/, '')
            .trim();

        // Remove incomplete sentences at the end
        if (cleaned.length > 0 && !cleaned.match(/[.!?]$/)) {
            const lastSentence = cleaned.lastIndexOf('.');
            if (lastSentence > cleaned.length / 2) {
                cleaned = cleaned.substring(0, lastSentence + 1);
            }
        }

        // Ensure it ends with a question mark if it's a question
        if (cleaned.includes('?') && !cleaned.endsWith('?')) {
            const questionMark = cleaned.lastIndexOf('?');
            cleaned = cleaned.substring(0, questionMark + 1);
        }

        return cleaned;
    }

    clearHistory() {
        this.conversationHistory = [];
    }

    getHistory() {
        return [...this.conversationHistory];
    }

    isReady() {
        return this.isModelLoaded;
    }
}
