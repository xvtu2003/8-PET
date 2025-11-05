# 🐱 8-PET: An AI Pet Experience

> **In loving memory of Shina (2010-2025)**  
> *This project was created to preserve the memory of Shina, who gave 15 years of unconditional love and companionship.*

A unique 8-minute AI pet game where you find, name, and bond with an adorable 8-bit cat. Watch your pet age through different life stages and say goodbye in an emotional farewell sequence.

This is a **one-time experience** - each account gets only one companion. The loss you feel is real, and so was the connection.

## Features

- **80-Minute Lifecycle**: Your pet ages through 4 distinct stages (baby → young → adult → elderly)
- **AI Chat**: Powered by Groq API, your pet responds with personality that changes based on age
- **Memory System**: All conversations are saved and displayed
- **Pet Customization**: Change colors and add accessories (bow, hat, collar, glasses)
- **8-bit Aesthetic**: Retro gaming style UI with pixel art fonts and animations
- **Web Audio**: 8-bit sound effects for pet interactions
- **Supabase Backend**: Persistent data storage for all pets and memories

## Setup Instructions

### Prerequisites
- Node.js 16+ installed
- Supabase account with project created
- Groq API key (free tier available at https://groq.com)

### Installation

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure environment variables**:
   - Edit `.env.local` and add your Groq API key:
   ```
   VITE_GROQ_API_KEY=your_groq_api_key_here
   ```
   - Supabase URL and anon key are already configured

3. **Run development server**:
   ```bash
   npm run dev
   ```
   The game will open at `http://localhost:5173`

4. **Build for production**:
   ```bash
   npm run build
   ```

## How to Play

1. **Landing Screen**: Click the lonely 8-bit cat to begin
2. **Naming & Customization**: Give your pet a name, choose a color, and select accessories
3. **Main Game**:
   - **Chat**: Type messages to talk to your pet
   - **Interact**: Click or rub your pet for cute reactions
   - **Customize**: Click the 🎨 button to change colors/accessories
4. **Aging**: Your pet ages every 20 minutes with visible changes
5. **Goodbye Phase**: In the final 10 minutes, say a heartfelt goodbye

## Game Mechanics

### Pet Age Stages
- **Baby (0-20 min)**: Sleepy and confused, just learning about you
- **Young (20-40 min)**: Playful and energetic, wants to play!
- **Adult (40-70 min)**: Wise and affectionate, deep bond forming
- **Elderly (70-80 min)**: Reflective and grateful, preparing to say goodbye

### AI Personality
The pet's responses adapt based on:
- Current age stage
- Conversation history
- Time remaining in the game

### Interactions
- **Chat**: Type messages to have conversations with your pet
- **Rub**: Physical interaction with 8-bit sound effect
- **Click/Pet**: Get cute reactions from your pet

## Technology Stack

- **Frontend**: Vue 3 + TypeScript + Vite
- **Styling**: Custom CSS with 8-bit aesthetic (Fredoka font)
- **Backend**: Supabase (PostgreSQL + Auth)
- **AI**: Groq API (Mixtral-8x7b model)
- **Audio**: Web Audio API for 8-bit sounds

## File Structure

```
src/
├── components/
│   ├── Landing.vue          # Landing screen with cat
│   ├── NamingModal.vue      # Pet naming & customization
│   ├── Game.vue             # Main game loop
│   ├── PetDisplay.vue       # Pet visual & interactions
│   ├── ChatInterface.vue    # Chat UI
│   └── CustomizationPanel.vue # Pet customization
├── lib/
│   ├── supabase.ts          # Supabase client
│   └── groq.ts              # Groq API integration
├── types/
│   └── index.ts             # TypeScript types
├── App.vue                  # Root component
├── style.css                # Global styles
└── main.ts                  # App entry point
```

## Database Schema

### pets
- `id`: UUID (primary key)
- `name`: Pet's name
- `user_id`: User identifier
- `birth_time`: When pet was created
- `color`: Pet's color (hex)
- `accessories`: Array of accessory IDs
- `is_alive`: Alive status

### memories
- `id`: UUID (primary key)
- `pet_id`: Reference to pet
- `message`: Message content
- `sender`: 'user' or 'pet'
- `timestamp`: When message was sent
- `memory_type`: 'chat', 'interaction', etc.

### interactions
- `id`: UUID (primary key)
- `pet_id`: Reference to pet
- `interaction_type`: 'rub', 'click', etc.
- `timestamp`: When interaction occurred

## Customization

### Adding New Accessories
Edit `src/components/NamingModal.vue` and `CustomizationPanel.vue`:
```typescript
const availableAccessories = [
  { id: 'new-id', label: '🎀 Name', color: '#color' }
]
```

### Changing Colors
Color presets are in `NamingModal.vue` and `CustomizationPanel.vue`. Add more colors to the `colorPresets` array.

### Adjusting Game Duration
In `src/components/Game.vue`, change `GAME_DURATION`:
```typescript
const GAME_DURATION = 80 * 60 * 1000 // milliseconds
```

## Troubleshooting

**No audio sounds?**
- Check browser permissions for audio
- Some browsers require HTTPS for audio in production

**Groq API errors?**
- Verify your API key in `.env.local`
- Check Groq API status at https://groq.com
- Free tier may have rate limits

**Supabase connection issues?**
- Verify environment variables are loaded
- Check Supabase project status
- Ensure RLS policies allow anonymous access

## Future Improvements

- Photo/export memories feature
- Multiple pet profiles
- Pet "breeding" for future pets
- Leaderboards for special interactions
- Mobile app version
- More sound effects library
- Multiplayer pet interactions

## License

MIT

## Credits

Built with ❤️ by [Abdalaziz Sairfi](https://abdalazizportfolio.netlify.app/) using Vue 3, Supabase, and Groq AI

---

**Dedicated to Shina** - A beautiful soul who taught us what unconditional love truly means. This game captures the bittersweet reality that our time with our companions is precious and finite. Every moment matters.
