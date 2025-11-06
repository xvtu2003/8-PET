<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import type { Pet, PetAge, Mood } from '../types'

interface Props {
  pet: Pet
  age: PetAge
  isSleeping: boolean
  mood: Mood
}

const props = defineProps<Props>()
const emit = defineEmits<{ rub: []; click: []; feed: [] }>()

const feedCooldown = ref(false)

const currentFrame = ref(0)
const isAnimating = ref(false)
const animationType = ref<'idle' | 'rub' | 'pet'>('idle')
let idleAnimationInterval: number | null = null

// Thought bubble system
const showThought = ref(false)
const currentThought = ref('')
let thoughtTimeout: number | null = null

// Cat thoughts based on mood and age
const moodThoughts = {
  happy: ['purr...', 'content', 'love this', ':)', 'happy!'],
  playful: ['play?', 'catch!', 'fun!', '*bounce*', 'wheee!'],
  sleepy: ['yawn...', 'zzz', 'tired', '*snore*', 'sleepy...'],
  lonely: ['...alone', 'where are you?', 'miss you', 'lonely', '...'],
  content: ['peaceful', 'nice', 'warm', '*calm*', 'serene']
}

const feedThoughts = {
  baby: ['nom nom!', 'yummy!', 'more?', '*munch*', 'tasty!'],
  young: ['tasty!', 'thanks!', 'delicious', '*chomp*', 'yum!'],
  adult: ['thank you', 'appreciated', 'good', '*satisfied*', 'nice'],
  elderly: ['...good', 'memories', 'grateful', '*slow bite*', 'warm']
}

const catThoughts = {
  baby: [
    'mew?',
    '*yawn*',
    'zzz...',
    '...sleepy',
    'mrrp?',
    '*blink blink*',
    'hungry...',
    '...warm',
    'mew mew',
    '*confused beep*'
  ],
  young: [
    'grr!',
    'mrrrow!',
    '*zoom zoom*',
    'play?!',
    'catch!',
    '*pounce*',
    'mischief~',
    'wheee!',
    '*bzzt*',
    '...bored',
    'pet me!'
  ],
  adult: [
    'purr~',
    '*content*',
    'nice...',
    'peaceful',
    'mrrow',
    '*stretches*',
    'thinking...',
    'love you',
    'grateful',
    '*wise beep*'
  ],
  elderly: [
    '...purr',
    '*sigh*',
    'memories...',
    'thank you',
    'peaceful',
    '*crackle*',
    '...time',
    'sleepy',
    'content~',
    '*fading*'
  ]
}

// Frame sequences for each interaction
const frameSequences = {
  idle: {
    baby: [
      '|\\___/|\n(  o o )\n(  =^= )\n(       )\n(        ))))))))))',
      '|\\___/|\n(  o o )\n(  ~^~ )\n(       )\n(        ))))))))))',
      '|\\___/|\n(  ^ ^ )\n(  =^= )\n(       )\n(        ))))))))))',
    ],
    young: [
      '|\\___/|\n(  ^ ^ )\n(  = w = )\n(       )\n(        ))))))))))',
      '|\\___/|\n(  ^ ^ )\n(  =w= )\n(       )\n(        ))))))))))',
      '|\\___/|\n(  > < )\n(  = w = )\n(       )\n(        ))))))))))',
    ],
    adult: [
      '/\\_/\\_/\\\n( o.o )\n(  = Y = )\n(  /|_|\\  )\n(   / \\    ))))))))))',
      '/\\_/\\_/\\\n( o.o )\n(  = ^ = )\n(  /|_|\\  )\n(   / \\    ))))))))))',
      '/\\_/\\_/\\\n( o.o )\n(  = Y = )\n(  /|_|\\  )\n(   / \\    ))))))))))',
    ],
    elderly: [
      '|\\___/|\n(  . . )\n(  ~ o ~ )\n(       )\n(   /_\\_   ))))))))))',
      '|\\___/|\n(  . . )\n(  ~ ^ ~ )\n(       )\n(   /_\\_   ))))))))))',
    ]
  },
  rub: {
    baby: [
      '|\\___/|\n(  o o )\n(  =^= )\n(  \\   /)\n(   \\ /  ))))))))))',
      '|\\___/|\n(  > < )\n(  =^= )\n(  / \\ )\n(  / \\  ))))))))))',
      '|\\___/|\n(  o o )\n(  ^ ^ )\n(  \\   /)\n(   \\ /  ))))))))))',
      '|\\___/|\n(  > < )\n(  w w )\n(  / \\ )\n(  / \\  ))))))))))',
    ],
    young: [
      '|\\___/|\n(  ^ ^ )\n(  = w = )\n(  \\   /)\n(   \\ /  ))))))))))',
      '|\\___/|\n(  > < )\n(  =w= )\n(  / \\ )\n(  / \\  ))))))))))',
      '|\\___/|\n(  ^ ^ )\n(  = ^ = )\n(  \\   /)\n(   \\ /  ))))))))))',
      '|\\___/|\n(  ^ ^ )\n(  ^w^ )\n(  / \\ )\n(  / \\  ))))))))))',
    ],
    adult: [
      '/\\_/\\_/\\\n( o.o )\n(  = ^ = )\n( \\  /|_|\\  )\n(  \\ / \\    ))))))))))',
      '/\\_/\\_/\\\n( > < )\n(  = Y = )\n(  /  \\|_|  )\n(   \\ /\\    ))))))))))',
      '/\\_/\\_/\\\n( o.o )\n(  ^ ^ )\n( \\  /|_|\\  )\n(  \\ / \\    ))))))))))',
      '/\\_/\\_/\\\n( > < )\n(  ^ ^ )\n(  /  \\|_|  )\n(   \\ /\\    ))))))))))',
    ],
    elderly: [
      '|\\___/|\n(  . . )\n(  ~ ^ ~ )\n(  \\   /)\n(   \\ /  ))))))))))',
      '|\\___/|\n(  o o )\n(  ~ o ~ )\n(  / \\ )\n(  / \\  ))))))))))',
      '|\\___/|\n(  . . )\n(  ^ o ^ )\n(  \\   /)\n(   \\ /  ))))))))))',
    ]
  },
  pet: {
    baby: [
      '|\\___/|\n(  o o )\n(  =^= )\n(   ^  )\n(        ))))))))))',
      '|\\___/|\n(  ^ ^ )\n(  ^ ^ )\n(   ^  )\n(        ))))))))))',
      '|\\___/|\n(  o o )\n(  = w = )\n(   ^  )\n(        ))))))))))',
    ],
    young: [
      '|\\___/|\n(  ^ ^ )\n(  = w = )\n(   ^  )\n(        ))))))))))',
      '|\\___/|\n(  > < )\n(  ^w^ )\n(   ^  )\n(        ))))))))))',
      '|\\___/|\n(  ^ ^ )\n(  ^w^ )\n(   ^  )\n(        ))))))))))',
    ],
    adult: [
      '/\\_/\\_/\\\n( o.o )\n(  = Y = )\n(    ^  )\n(      \\    ))))))))))',
      '/\\_/\\_/\\\n( > < )\n(  ^ ^ )\n(    ^  )\n(      \\    ))))))))))',
      '/\\_/\\_/\\\n( o.o )\n(  =w= )\n(    ^  )\n(      \\    ))))))))))',
    ],
    elderly: [
      '|\\___/|\n(  . . )\n(  ~ ^ ~ )\n(   ^  )\n(        ))))))))))',
      '|\\___/|\n(  o o )\n(  ~ o ~ )\n(   ^  )\n(        ))))))))))',
    ]
  }
}

function showRandomThought() {
  // Random chance to show thought (30% chance when called)
  if (Math.random() > 0.3) return

  // Combine mood-based and age-based thoughts
  const moodBasedThoughts = moodThoughts[props.mood] || []
  const ageBasedThoughts = catThoughts[props.age] || []
  const allThoughts = [...moodBasedThoughts, ...ageBasedThoughts]
  
  const randomThought = allThoughts[Math.floor(Math.random() * allThoughts.length)] || 'purr...'

  currentThought.value = randomThought
  showThought.value = true

  // Hide thought after 2-4 seconds
  const displayTime = 2000 + Math.random() * 2000
  if (thoughtTimeout) clearTimeout(thoughtTimeout)

  thoughtTimeout = window.setTimeout(() => {
    showThought.value = false
  }, displayTime)
}

function showFeedThought() {
  const thoughts = feedThoughts[props.age] || ['yum!']
  const randomThought = thoughts[Math.floor(Math.random() * thoughts.length)] || 'yum!'
  
  currentThought.value = randomThought
  showThought.value = true
  
  if (thoughtTimeout) clearTimeout(thoughtTimeout)
  thoughtTimeout = window.setTimeout(() => {
    showThought.value = false
  }, 3000)
}

function handleFeedClick() {
  if (feedCooldown.value) return
  
  emit('feed')
  showFeedThought()
  
  // Set 30s cooldown
  feedCooldown.value = true
  setTimeout(() => {
    feedCooldown.value = false
  }, 30000)
}

function scheduleNextThought() {
  // Schedule next thought in 8-20 seconds
  const nextThoughtTime = 8000 + Math.random() * 12000
  setTimeout(() => {
    if (!props.isSleeping) {
      showRandomThought()
    }
    scheduleNextThought()
  }, nextThoughtTime)
}

function startIdleAnimation() {
  if (idleAnimationInterval) clearInterval(idleAnimationInterval)

  let frameIndex = 0
  const idleFrames = frameSequences.idle[props.age]

  idleAnimationInterval = window.setInterval(() => {
    if (!isAnimating.value && animationType.value === 'idle') {
      currentFrame.value = frameIndex
      frameIndex = (frameIndex + 1) % idleFrames.length
    }
  }, 800) // Cycle through idle frames every 800ms
}

function stopIdleAnimation() {
  if (idleAnimationInterval) {
    clearInterval(idleAnimationInterval)
    idleAnimationInterval = null
  }
}

async function playAnimation(type: 'rub' | 'pet') {
  if (isAnimating.value) return

  stopIdleAnimation()
  isAnimating.value = true
  animationType.value = type
  currentFrame.value = 0

  const frames = frameSequences[type][props.age]

  // Play through all frames with 150ms per frame
  for (let i = 0; i < frames.length; i++) {
    currentFrame.value = i
    await new Promise(resolve => setTimeout(resolve, 150))
  }

  // Return to idle animation
  animationType.value = 'idle'
  currentFrame.value = 0
  isAnimating.value = false
  startIdleAnimation()
}

function handleRub() {
  playAnimation('rub')
  emit('rub')
}

function handlePet() {
  playAnimation('pet')
  emit('click')
}

function getCurrentFrame() {
  const sequence = frameSequences[animationType.value][props.age]
  return sequence[currentFrame.value]
}

onMounted(() => {
  startIdleAnimation()
  scheduleNextThought()
})

onUnmounted(() => {
  stopIdleAnimation()
  if (thoughtTimeout) clearTimeout(thoughtTimeout)
})
</script>

<template>
  <div class="pet-display" @click="$emit('click')">
    <div class="pet-container" :class="{ sleeping: isSleeping }">
      <div class="pet-sprite">
        <!-- Animated ASCII art pet -->
        <div class="pet-body" :style="{ color: pet.color }">
          <pre class="pet-ascii">{{ getCurrentFrame() }}</pre>
        </div>

        <!-- Idle animation indicator -->
        <div v-if="!isAnimating" class="idle-indicator">
          <span class="pulse">~</span>
        </div>
      </div>

      <!-- Thought bubble -->
      <div v-if="showThought && !isSleeping" class="thought-bubble">
        <div class="thought-content">{{ currentThought }}</div>
        <div class="thought-tail">
          <div class="bubble-dot"></div>
          <div class="bubble-dot"></div>
        </div>
      </div>

      <!-- Sleeping indicator -->
      <div v-if="isSleeping" class="sleep-indicator">
        Z<span class="sleep-z">Z</span><span class="sleep-z">Z</span>
      </div>

      <!-- Age indicator -->
      <div class="age-indicator">
        {{ getAgeDisplay(age) }}
      </div>
    </div>

    <!-- Interaction buttons -->
    <div class="interaction-buttons">
      <button @click.stop="handleRub" :disabled="isAnimating" class="8bit-button action-btn rub-btn">
        [RUB]
      </button>
      <button @click.stop="handlePet" :disabled="isAnimating" class="8bit-button action-btn">
        [PET]
      </button>
      <button 
        @click.stop="handleFeedClick" 
        :disabled="feedCooldown" 
        class="8bit-button action-btn"
        :class="{ disabled: feedCooldown }"
      >
        [FEED]
      </button>
    </div>
  </div>
</template>

<script lang="ts">
export default {
  methods: {
    getAgeDisplay(age: string) {
      const displays: Record<string, string> = {
        baby: '> BABY <',
        young: '> YOUNG <',
        adult: '> ADULT <',
        elderly: '> ELDER <'
      }
      return displays[age] || age
    }
  }
}
</script>

<style scoped>
.pet-display {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  cursor: pointer;
  user-select: none;
}

.pet-container {
  position: relative;
  transition: transform 0.3s;
}

.pet-container:hover {
  transform: scale(1.05);
}

.pet-container.sleeping {
  opacity: 0.8;
  animation: sleep-bob 2s ease-in-out infinite;
}

@keyframes sleep-bob {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-5px);
  }
}

.pet-sprite {
  position: relative;
  padding: 20px;
  border: var(--8bit-border-thin) solid var(--white);
  box-shadow: var(--8bit-shadow-input);
  background: var(--black);
  font-family: 'Courier New', monospace;
  text-align: center;
  font-size: 1.8em;
  line-height: 1.2;
  color: var(--white);
}

.pet-body {
  font-weight: bold;
  text-shadow: 2px 2px 0px rgba(0, 0, 0, 0.3);
}

.pet-ascii {
  font-family: 'Courier New', monospace;
  white-space: pre;
  line-height: 1.3;
  margin: 10px 0;
  padding: 15px;
  border: 2px solid var(--white);
  background: rgba(255, 255, 255, 0.01);
  font-size: 1.1em;
  animation: float 4s ease-in-out infinite;
  min-height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.idle-indicator {
  position: absolute;
  bottom: 10px;
  right: 10px;
  font-size: 1.5em;
  color: var(--white);
}

.accessories {
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 5px;
  font-size: 1.2em;
}

.accessory {
  animation: float 3s ease-in-out infinite;
}

.sleep-indicator {
  position: absolute;
  top: -40px;
  right: -20px;
  font-size: 1.5em;
  animation: float 1.5s ease-in-out infinite;
}

.sleep-z {
  opacity: 0.6;
  animation: fade-in-out 1s ease-in-out infinite;
}

.sleep-z:nth-child(2) {
  animation-delay: 0.3s;
}

.sleep-z:nth-child(3) {
  animation-delay: 0.6s;
}

@keyframes fade-in-out {
  0%, 100% {
    opacity: 0;
  }
  50% {
    opacity: 1;
  }
}

.age-indicator {
  position: absolute;
  bottom: -30px;
  font-size: 0.8em;
  color: var(--white);
  font-weight: bold;
  white-space: nowrap;
  letter-spacing: var(--8bit-letter-spacing);
}

.interaction-buttons {
  display: flex;
  gap: 10px;
}

/* Thought bubble */
.thought-bubble {
  position: absolute;
  top: -80px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10;
  animation: thought-appear 0.3s ease-out, float 2s ease-in-out infinite;
}

@keyframes thought-appear {
  0% {
    opacity: 0;
    transform: translateX(-50%) translateY(10px) scale(0.8);
  }
  100% {
    opacity: 1;
    transform: translateX(-50%) translateY(0) scale(1);
  }
}

.thought-content {
  background: var(--black);
  border: 3px solid var(--white);
  padding: 8px 16px;
  border-radius: 0;
  box-shadow: 4px 4px 0px var(--white);
  color: var(--white);
  font-size: 0.9em;
  white-space: nowrap;
  font-family: 'Press Start 2P', monospace;
  letter-spacing: 1px;
  position: relative;
}

.thought-tail {
  position: absolute;
  bottom: -25px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: center;
}

.bubble-dot {
  width: 8px;
  height: 8px;
  background: var(--black);
  border: 2px solid var(--white);
  border-radius: 0;
}

.bubble-dot:first-child {
  width: 12px;
  height: 12px;
}

.bubble-dot:last-child {
  width: 6px;
  height: 6px;
}

/* Mobile Responsiveness */
@media (max-width: 768px) {
  .pet-display {
    gap: 15px;
    width: 100%;
  }

  .pet-sprite {
    font-size: 1.3em;
    padding: 15px;
  }

  .pet-ascii {
    font-size: 0.9em;
    padding: 10px;
    min-height: 100px;
  }

  .thought-bubble {
    max-width: 200px;
    font-size: 0.7em;
    padding: 8px 12px;
  }

  .thought-bubble::before {
    border-width: 8px;
    border-left-width: 10px;
    left: 35px;
  }

  .interaction-buttons {
    flex-wrap: wrap;
    gap: 8px;
  }

  .interaction-button,
  .feed-button {
    font-size: 0.7em;
    padding: 8px 12px;
    min-width: 70px;
  }

  .age-indicator {
    font-size: 0.7em;
    bottom: -25px;
  }
}
</style>
