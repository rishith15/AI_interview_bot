// Interaction Manager Module - Manages interactive features
export class InteractionManager {
    constructor(config) {
        this.config = config;
        this.currentInterviewType = 'general';
        this.currentPersonality = 'professional';
        this.conversationTopics = new Set();
        this.questionCount = 0;
    }

    // Get contextual quick replies based on conversation
    getQuickReplies(lastAIMessage) {
        const replies = [];

        // Generic helpful replies
        if (this.questionCount < 2) {
            replies.push("I have 3 years of experience");
            replies.push("I'm a recent graduate");
            replies.push("I've worked on several projects");
        } else {
            replies.push("Yes, I have experience with that");
            replies.push("Could you clarify?");
            replies.push("Let me think about that");
        }

        return replies;
    }

    // Get suggested questions for the interviewer
    getSuggestedQuestions(interviewType) {
        const questions = {
            technical: [
                "Tell me about your programming experience",
                "What technologies are you most comfortable with?",
                "Describe a challenging technical problem you solved",
                "What's your experience with version control?"
            ],
            behavioral: [
                "Tell me about a time you worked in a team",
                "How do you handle difficult situations?",
                "Describe your greatest professional achievement",
                "How do you prioritize your work?"
            ],
            general: [
                "Tell me about yourself",
                "What are your career goals?",
                "Why are you interested in this position?",
                "What are your strengths and weaknesses?"
            ]
        };

        return questions[interviewType] || questions.general;
    }

    // Update personality mode
    setPersonality(personality) {
        this.currentPersonality = personality;

        const prompts = {
            professional: "You are a professional job interviewer. Ask clear questions about the candidate's experience and skills. Keep responses brief and professional.",
            friendly: "You are a friendly interviewer who makes candidates feel comfortable. Be warm and encouraging while asking about their experience.",
            casual: "You are a relaxed interviewer having a casual conversation. Be conversational and informal while learning about the candidate."
        };

        return prompts[personality] || prompts.professional;
    }

    // Set interview type
    setInterviewType(type) {
        this.currentInterviewType = type;
    }

    // Track conversation progress
    trackProgress(userMessage, aiMessage) {
        this.questionCount++;

        // Extract topics (simple keyword matching)
        const keywords = ['experience', 'project', 'skill', 'team', 'challenge', 'achievement'];
        keywords.forEach(keyword => {
            if (userMessage.toLowerCase().includes(keyword) || aiMessage.toLowerCase().includes(keyword)) {
                this.conversationTopics.add(keyword);
            }
        });
    }

    // Get progress summary
    getProgress() {
        return {
            questionCount: this.questionCount,
            topicsCovered: Array.from(this.conversationTopics),
            interviewType: this.currentInterviewType,
            personality: this.currentPersonality
        };
    }

    // Export conversation
    exportConversation(history, format = 'txt') {
        if (format === 'json') {
            return JSON.stringify({
                timestamp: new Date().toISOString(),
                interviewType: this.currentInterviewType,
                personality: this.currentPersonality,
                progress: this.getProgress(),
                conversation: history
            }, null, 2);
        } else {
            // Text format
            let text = `AI Interview Bot - Conversation Export\n`;
            text += `Date: ${new Date().toLocaleString()}\n`;
            text += `Interview Type: ${this.currentInterviewType}\n`;
            text += `Questions Asked: ${this.questionCount}\n`;
            text += `\n${'='.repeat(50)}\n\n`;

            history.forEach((msg, index) => {
                const role = msg.role === 'user' ? 'You' : 'AI Interviewer';
                text += `${role}: ${msg.content}\n\n`;
            });

            return text;
        }
    }

    reset() {
        this.conversationTopics.clear();
        this.questionCount = 0;
    }
}
