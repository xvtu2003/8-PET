<!-- e4293fce-3a3a-4b63-a951-9926ce86e904 d507a435-3273-4d3b-9cba-cd55ac0eff14 -->
# Simplified Pet Enhancement Plan

## Overview

Implement 3 streamlined features using the existing thought bubble system: username personalization, mood-based thoughts, and feeding interactions. No new animations, no emojis, minimal visual changes.

## Core Principle

**Use thought bubbles for ALL new interactions** - mood states and feeding reactions appear as thoughts, keeping the ASCII pet model unchanged.

---

## 1. Username Collection & Personalization

### What

- Add username field during sign up/sign in
- Store in Supabase user metadata
- Pass to AI so pet uses your name in conversations
- Display in game header: "Playing with [Username]"

### Implementation

**AuthPage.vue**:

- Add text input: "Your Name"
- No emoji labels
- Validate: 2-20 characters

**lib/auth.ts**:

- Store username in user_metadata on signup
- Retrieve on login

**types/index.ts**:

- Add `username?: string` to AuthUser

**App.vue**:

- Pass username to Game component

**Game.vue**:

- Display username in header
- Pass to AI context

**lib/groq.ts**:

- Add to system prompt: "Your owner's name is [username]"

---

## 2. Mood System (Thought-Based)

### What

5 internal mood states that affect thought bubble content and AI responses. **NO visual indicator, NO emoji** - mood shown only through thoughts.

### Moods & Thoughts

- **happy**: "purr...", "content", "love this"
- **playful**: "play?", "catch!", "fun!"
- **sleepy**: "yawn...", "zzz", "tired"
- **lonely**: "...alone", "where are you?", "miss you"
- **content**: "peaceful", "nice", "warm"

### Mood Logic

Simple time-based:

- Last interaction < 1 min = happy
- Last interaction 1-3 min = content
- Last interaction > 3 min = lonely
- Age elderly = sleepy (more often)
- After feeding = happy

### Implementation

**types/index.ts**:

```typescript
export type Mood = 'happy' | 'playful' | 'sleepy' | 'lonely' | 'content'
```

**Game.vue**:

- Add `currentMood = ref<Mood>('content')`
- Function `updateMood()` every 30s
- Pass mood to PetDisplay for thought selection
- Pass mood to AI in system prompt

**PetDisplay.vue**:

- Receive mood as prop
- Use mood to filter thought categories
- Existing thought bubble system handles display

**lib/groq.ts**:

- Add mood to system prompt
- "Current mood: [mood]"

**No new UI elements** - uses existing thought bubble

---

## 3. Feeding System (Thought-Based)

### What

Feed button that triggers thought bubble reactions - **NO animation**, just text response through existing thought system.

### Reactions (via thoughts)

Different thoughts per age when fed:

- **baby**: "nom nom!", "yummy!", "more?"
- **young**: "tasty!", "thanks!", "delicious"
- **adult**: "thank you", "appreciated", "good"
- **elderly**: "...good", "memories", "grateful"

### Implementation

**PetDisplay.vue**:

- Add simple text button: "FEED" (no emoji)
- Emit 'feed' event
- Button has 30s cooldown (disabled state)

**Game.vue**:

- Handle feed event
- Update mood to 'happy'
- Trigger special thought based on age
- Save to interactions table
- Play existing beep sound

**Existing thought bubble system**:

- Already handles display
- Just pass feeding thought

### Database

Use existing `interactions` table:

- type: 'feed'
- timestamp
- No new tables needed

---

## 4. Remove All Emojis

### Where to Remove

**Game.vue**:

- Timer emojis
- Age emojis (baby/young/adult/elderly)
- Header icons

**PetDisplay.vue**:

- Button emojis

**Landing.vue**:

- Warning emoji
- Cat emoji references

**Memorial.vue**:

- Heart emoji
- All decorative emojis

**ChatInterface.vue**:

- Message emojis

**Footer.vue**:

- Already removed broken heart

**NamingModal.vue**:

- Any emoji decorations

### Replace With

- Text labels: "BABY", "YOUNG", "ADULT", "ELDER"
- Simple brackets: "[RUB]", "[PET]", "[FEED]"
- Text warnings: "WARNING:", "NOTICE:"

---

## Implementation Summary

### Files to Modify

1. **AuthPage.vue** - Add username field
2. **lib/auth.ts** - Store/retrieve username
3. **types/index.ts** - Add Mood type, username to AuthUser
4. **App.vue** - Pass username to Game
5. **Game.vue** - Mood system, feeding handler, username display, remove emojis
6. **PetDisplay.vue** - Add Feed button, mood-aware thoughts, remove emojis
7. **lib/groq.ts** - Add username & mood to AI context
8. **Landing.vue** - Remove emojis
9. **Memorial.vue** - Remove emojis
10. **ChatInterface.vue** - Remove emojis
11. **NamingModal.vue** - Remove emojis

### No New Components

Use existing systems:

- Thought bubble (already exists)
- Buttons (8-bit style exists)
- Sound system (already exists)

### No Animations

- No new ASCII frames
- No complex transitions
- Keep existing idle animations only
- Feeding just triggers thought bubble

### Database Changes

None needed - use existing `interactions` table

---

## Benefits

- Simple and clean interface
- Mood adds depth without visual clutter
- Feeding creates interaction without complexity
- Username personalizes AI responses
- No emoji = consistent 8-bit aesthetic
- Uses existing thought bubble = no new UI

### To-dos

- [ ] Update App.vue to check for existing pet on login and route to correct component
- [ ] Redesign Memorial.vue as emotional permanent memorial for single pet
- [ ] Add validation in startGame to prevent creating multiple pets per account
- [ ] Update death scene to transition to memorial instead of restart
- [ ] Test complete flow: new pet, death, memorial, re-login shows memorial