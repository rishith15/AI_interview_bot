# AI Interview Bot 🎭

A real-time AI-powered interview bot with voice interaction, natural language processing, and animated avatar. Experience natural conversations with an AI interviewer using your voice - **completely offline with no API keys required!**

## ✨ Features

- 🎤 **Voice Input**: Real-time speech recognition using Web Speech API
- 🧠 **Local AI**: Powered by Transformers.js - runs entirely in your browser
- 🔊 **Voice Output**: Natural text-to-speech with multiple voice options
- 🤖 **Animated Avatar**: Visual feedback with state-based animations and emoji expressions
- ⚡ **Low Latency**: Near real-time interaction
- 💬 **Conversation History**: Maintains context across the interview
- 🎨 **Premium UI**: Modern dark theme with glassmorphism effects
- 🎯 **Quick Replies**: Contextual quick reply suggestions
- 🎭 **Personality Modes**: Choose interviewer personality (Professional, Friendly, Casual)
- 📋 **Interview Types**: Technical, Behavioral, or General interviews
- 📥 **Export**: Save your conversation for later review
- 🔒 **Privacy**: Everything runs locally - no data sent to servers

## 🚀 Quick Start

### Prerequisites

- Modern web browser (Chrome or Edge recommended)
- Microphone access
- **No API keys needed!**

### Setup

1. **Run the Application**
   - Open `index.html` in your browser
   - Or use a local server:
     ```bash
     # Using Python
     python -m http.server 8000
     
     # Using Node.js
     npx serve
     ```
   - Navigate to `http://localhost:8000`

2. **First Time Setup**
   - Wait for the AI model to load (30-60 seconds on first run)
   - The model is cached for offline use after first load
   - Select your interview type and personality preference

3. **Start Interview**
   - Click "Start Interview"
   - Allow microphone access when prompted
   - Speak naturally - the AI will listen and respond
   - Use quick reply buttons for common responses

## 📁 Project Structure

```
AI Interview bot/
├── index.html              # Main HTML interface
├── styles.css              # Premium styling with animations
├── app.js                  # Main application logic
├── config.js               # Configuration settings
├── modules/
│   ├── audio-handler.js    # Microphone and audio management
│   ├── llm-client.js       # Local AI model integration (Transformers.js)
│   ├── tts-engine.js       # Text-to-speech engine
│   ├── avatar-controller.js # Avatar animation controller
│   └── interaction-manager.js # Quick replies and export features
└── README.md               # This file
```

## 🎯 How It Works

1. **User speaks** → Microphone captures audio
2. **Speech Recognition** → Converts speech to text in real-time
3. **Local AI Processing** → Processes text using browser-based AI model
4. **AI Response** → Generates contextual interview response
5. **Text-to-Speech** → Converts response to speech
6. **Avatar Animation** → Syncs visual feedback with speech
7. **Audio Playback** → Plays response through speakers

## 🛠️ Technical Stack

- **Frontend**: Vanilla HTML/CSS/JavaScript (ES6 modules)
- **Speech Recognition**: Web Speech API (SpeechRecognition)
- **Text-to-Speech**: Web Speech API (SpeechSynthesis)
- **AI Model**: Transformers.js (Xenova/LaMini-Flan-T5-783M)
- **Audio**: Web Audio API + MediaRecorder
- **Styling**: CSS3 with custom properties and animations

## ⚙️ Configuration

Edit `config.js` to customize:

- Local AI model settings (model name, max tokens, temperature)
- Speech recognition settings (language, continuous mode)
- TTS parameters (rate, pitch, volume)
- Avatar animation speeds
- Conversation context and system prompts
- Interview types and personality modes
- UI preferences

## 🔧 Troubleshooting

### Model loading is slow
- First load downloads ~50MB model (cached after)
- Ensure stable internet connection for first load
- Subsequent loads are instant (uses cached model)

### Microphone not working
- Ensure browser has microphone permissions
- Check system microphone settings
- Try using HTTPS (required for some browsers)

### Speech recognition not working
- Use Chrome or Edge (best support)
- Speak clearly in a quiet environment
- Check browser console for errors

### AI responses are simple
- Browser-based models are smaller than cloud models
- Responses are concise but contextually relevant
- Trade-off for privacy and no API costs

### No voice output
- Check system volume settings
- Verify browser audio permissions
- Try selecting a different voice in settings

## 🌐 Browser Compatibility

| Browser | Speech Recognition | Text-to-Speech | AI Model | Overall Support |
|---------|-------------------|----------------|----------|-----------------|
| Chrome  | ✅ Excellent      | ✅ Excellent   | ✅ Yes   | ✅ Recommended  |
| Edge    | ✅ Excellent      | ✅ Excellent   | ✅ Yes   | ✅ Recommended  |
| Firefox | ⚠️ Limited        | ✅ Good        | ✅ Yes   | ⚠️ Partial      |
| Safari  | ❌ Not supported  | ⚠️ Limited     | ⚠️ Limited | ❌ Not recommended |

## 🔒 Privacy & Security

- **100% Local**: AI model runs entirely in your browser
- **No API Keys**: No external services or API calls
- **No Data Collection**: Conversations stay on your device
- **Offline Capable**: Works offline after model is cached
- **Open Source**: Full transparency of code

## 🎨 Customization

### Change Avatar Emojis
Edit `modules/avatar-controller.js`:
```javascript
this.emojis = {
    idle: ['🤖', '😊', '👋'],
    listening: ['👂', '🎧', '👀'],
    // Add your own emojis
}
```

### Modify Interview Context
Edit `config.js`:
```javascript
conversation: {
  systemPrompt: "Your custom interviewer personality...",
  interviewContext: "your specific job role"
}
```

### Adjust Voice Settings
Edit `config.js`:
```javascript
tts: {
  rate: 1.0,    // Speed (0.1 to 10)
  pitch: 1.0,   // Pitch (0 to 2)
  volume: 1.0   // Volume (0 to 1)
}
```

## 🚀 Future Enhancements

- [ ] Real webcam integration option
- [ ] Advanced lip-sync with phoneme detection
- [ ] Multiple interview scenarios
- [ ] Interview performance analytics
- [ ] Recording and playback features
- [ ] Multi-language support
- [ ] Custom avatar uploads
- [ ] Larger AI models option

## 📄 License

This project is open source and available for educational purposes.

## 🤝 Contributing

Feel free to fork, modify, and enhance this project. Contributions are welcome!

## 💡 Tips for Best Results

1. **Environment**: Use in a quiet room for better speech recognition
2. **Microphone**: Use a quality microphone for clearer audio
3. **Speaking**: Speak clearly and at a moderate pace
4. **Responses**: Keep answers concise for natural conversation flow
5. **Browser**: Use Chrome or Edge for optimal performance
6. **First Load**: Be patient during first model load (cached after)

## 🙏 Acknowledgments

- **Transformers.js** by Xenova for browser-based AI
- **LaMini-Flan-T5** model for conversational AI
- **Web Speech API** for voice capabilities

---

Built with ❤️ using modern web technologies and local AI - No servers, no API keys, complete privacy!
