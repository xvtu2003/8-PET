<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { supabase } from '../lib/supabase'
import { signOut } from '../lib/auth'
import { getPetResponse } from '../lib/groq'
import { audioManager } from '../lib/audio'
import type { Pet, Memory, PetAge, Mood } from '../types'
import PetDisplay from './PetDisplay.vue'
import ChatInterface from './ChatInterface.vue'
import CustomizationPanel from './CustomizationPanel.vue'
import DeathScene from './DeathScene.vue'
import Footer from './Footer.vue'

interface Props {
  pet: Pet
  userId: string
  username?: string
}

const props = defineProps<Props>()
const emit = defineEmits<{ 
  endGame: []
  logout: []
}>()

const GAME_DURATION = 8 * 60 * 1000 // 8 minutes in milliseconds

// Calculate if this is a new pet or returning to existing one
// Ensure birth_time is parsed as UTC by adding 'Z' if not present
let birthTimeStr = props.pet.birth_time
if (!birthTimeStr.endsWith('Z') && !birthTimeStr.includes('+')) {
  birthTimeStr = birthTimeStr + 'Z'
}
const birthTime = new Date(birthTimeStr).getTime()
const currentTime = Date.now()
const timeElapsedSinceCreation = (currentTime - birthTime) / 1000

// If pet was just created (less than 10 seconds ago), treat as new game starting at 0
// Otherwise, calculate actual elapsed time (for returning users)
const isNewPet = timeElapsedSinceCreation < 10 && timeElapsedSinceCreation >= 0

const startTime = ref(isNewPet ? currentTime : birthTime)
const initialElapsed = isNewPet ? 0 : Math.max(0, timeElapsedSinceCreation)
const elapsedSeconds = ref(initialElapsed)
const petState = ref(props.pet)
const memories = ref<Memory[]>([])
const isSleeping = ref(true)
const isTyping = ref(false)
const showCustomization = ref(false)
const conversationHistory = ref<Array<{ role: 'user' | 'assistant'; content: string }>>([])
const showDeathScene = ref(false)
const finalMessage = ref('')
const isInitialized = ref(false) // Flag to prevent death check until fully initialized
const currentMood = ref<Mood>('content')
const lastInteractionTime = ref(Date.now())

let gameTimer: number | null = null
let updateTimer: number | null = null

const minutesLived = computed(() => Math.floor(elapsedSeconds.value / 60))
const remainingSeconds = computed(() => Math.max(0, GAME_DURATION / 1000 - elapsedSeconds.value))

const petAge = computed((): PetAge => {
  const minutes = minutesLived.value
  if (minutes < 2) return 'baby'
  if (minutes < 4) return 'young'
  if (minutes < 7) return 'adult'
  return 'elderly'
})

const isGoodbyePhase = computed(() => minutesLived.value >= 7)
const isGameOver = computed(() => remainingSeconds.value <= 0)

// Removed unused ageLabel computed property

function updateMood() {
  const timeSinceInteraction = (Date.now() - lastInteractionTime.value) / 1000 / 60 // in minutes
  
  if (timeSinceInteraction < 1) {
    currentMood.value = 'happy'
  } else if (timeSinceInteraction < 3) {
    currentMood.value = 'content'
  } else {
    currentMood.value = 'lonely'
  }
  
  // Elderly pets are sleepy more often
  if (petAge.value === 'elderly' && Math.random() > 0.5) {
    currentMood.value = 'sleepy'
  }
}

async function handleUserMessage(message: string) {
  if (!message.trim() || isTyping.value) return

  // Wake up pet if sleeping
  if (isSleeping.value) {
    isSleeping.value = false
  }
  
  lastInteractionTime.value = Date.now()
  updateMood()

  try {
    isTyping.value = true

    // Add user message to memory
    const userMemory: Memory = {
      id: crypto.randomUUID(),
      pet_id: petState.value.id,
      message: message,
      sender: 'user',
      timestamp: new Date().toISOString(),
      memory_type: 'chat',
      created_at: new Date().toISOString()
    }

    memories.value.push(userMemory)
    conversationHistory.value.push({ role: 'user', content: message })

    // Save to database
    await supabase.from('memories').insert([userMemory])

    // Get pet response
    const petResponse = await getPetResponse(
      petState.value.name,
      petAge.value,
      message,
      conversationHistory.value,
      props.username,
      currentMood.value
    )

    // Add pet message to memory
    const petMemory: Memory = {
      id: crypto.randomUUID(),
      pet_id: petState.value.id,
      message: petResponse,
      sender: 'pet',
      timestamp: new Date().toISOString(),
      memory_type: 'chat',
      created_at: new Date().toISOString()
    }

    memories.value.push(petMemory)
    conversationHistory.value.push({ role: 'assistant', content: petResponse })

    // Save to database
    await supabase.from('memories').insert([petMemory])

    // Play pet sound
    playPetSound()
  } catch (error) {
    console.error('Error getting pet response:', error)
  } finally {
    isTyping.value = false
  }
}

function handlePetInteraction(type: 'rub' | 'click') {
  isSleeping.value = false
  lastInteractionTime.value = Date.now()
  updateMood()
  playPetSound(type)

  // Record interaction
  const interaction = {
    pet_id: petState.value.id,
    interaction_type: type,
    timestamp: new Date().toISOString()
  }
  supabase.from('interactions').insert([interaction])
}

async function handleFeed() {
  if (isGameOver.value) return
  
  // Update mood to happy
  currentMood.value = 'happy'
  lastInteractionTime.value = Date.now()
  
  // Play sound
  audioManager.playBoop()
  
  // Save to interactions table
  try {
    await supabase.from('interactions').insert([{
      pet_id: petState.value.id,
      interaction_type: 'feed',
      timestamp: new Date().toISOString()
    }])
  } catch (error) {
    console.error('Failed to save feed interaction:', error)
  }
}

function playPetSound(type: string = 'meow') {
  try {
    if (type === 'meow') {
      audioManager.playMeow()
    } else if (type === 'rub') {
      audioManager.playBeep()
    }
  } catch (e) {
    console.log('Audio not supported')
  }
}

async function handleCustomizationChange(color: string) {
  try {
    await supabase
      .from('pets')
      .update({
        color: color
      })
      .eq('id', petState.value.id)

    petState.value.color = color
  } catch (error) {
    console.error('Failed to update pet:', error)
  }
}

async function triggerDeathScene() {
  // Get final message from pet
  try {
    const lastMessage = await getPetResponse(
      petState.value.name,
      petAge.value,
      'Goodbye...',
      conversationHistory.value,
      props.username,
      currentMood.value
    )
    finalMessage.value = lastMessage
  } catch (error) {
    finalMessage.value = '*goodbye* I will remember you... *fade*'
  }

  showDeathScene.value = true
}

async function endGameEarly() {
  if (confirm('Are you sure you want to say goodbye to ' + petState.value.name + '?')) {
    await saveFinalState()
    emit('endGame')
  }
}

async function handleLogout() {
  if (confirm('Are you sure you want to logout? Your pet will continue aging while you\'re away.')) {
    try {
      await signOut()
      emit('logout')
    } catch (error) {
      console.error('Logout failed:', error)
      alert('Failed to logout. Please try again.')
    }
  }
}

async function saveFinalState() {
  try {
    await supabase
      .from('pets')
      .update({ is_alive: false })
      .eq('id', petState.value.id)
  } catch (error) {
    console.error('Failed to save final state:', error)
  }
}

function startGameTimer() {
  // Wait 500ms before enabling death checks (allow component to fully initialize)
  setTimeout(() => {
    isInitialized.value = true
  }, 500)

  // Update mood every 30 seconds
  setInterval(updateMood, 30000)

  gameTimer = window.setInterval(() => {
    elapsedSeconds.value = (Date.now() - startTime.value) / 1000

    // Only trigger death scene if initialized, game is actually over, and pet has been alive for at least 10 seconds
    if (isInitialized.value && isGameOver.value && !showDeathScene.value && elapsedSeconds.value > 10) {
      triggerDeathScene()
    }
  }, 1000)
}

onMounted(async () => {
  // If this is a new pet (just created), sync the birth_time to current startTime
  if (isNewPet) {
    const newBirthTime = new Date(startTime.value).toISOString()
    try {
      await supabase
        .from('pets')
        .update({ birth_time: newBirthTime })
        .eq('id', petState.value.id)
      
      // Update local state
      petState.value.birth_time = newBirthTime
    } catch (error) {
      console.error('Failed to update birth time:', error)
    }
  }
  
  startGameTimer()
  loadMemories()
  
  // Play age-appropriate music
  audioManager.playAgeMusic(petAge.value)
})

// Watch for age changes and update music
watch(petAge, (newAge) => {
  audioManager.playAgeMusic(newAge)
})

async function loadMemories() {
  try {
    const { data } = await supabase
      .from('memories')
      .select()
      .eq('pet_id', petState.value.id)
      .order('timestamp', { ascending: true })

    if (data) {
      memories.value = data
      // Reconstruct conversation history
      conversationHistory.value = data.map(m => ({
        role: m.sender === 'user' ? 'user' : 'assistant',
        content: m.message
      }))
    }
  } catch (error) {
    console.error('Failed to load memories:', error)
  }
}

function formatTimeRemaining(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

onBeforeUnmount(() => {
  if (gameTimer) clearInterval(gameTimer)
  if (updateTimer) clearInterval(updateTimer)
  audioManager.stopMusic()
})
</script>

<template>
  <div class="game">
    <!-- Death Scene Overlay -->
    <DeathScene
      v-if="showDeathScene"
      :pet-name="petState.name"
      :pet-age="petAge"
      :final-message="finalMessage"
      @complete="async () => { await saveFinalState(); emit('endGame') }"
    />

    <!-- Header with timer -->
    <div class="header">
      <div class="title-section">
        <h1>{{ petState.name }}</h1>
        <p class="age-display">{{ petAge.toUpperCase() }} ({{ minutesLived }} min)</p>
        <p v-if="username" class="owner-name">Playing with {{ username }}</p>
      </div>
      <div class="timer-section">
        <div v-if="!isGoodbyePhase" class="timer">
          <span class="time-remaining">{{ formatTimeRemaining(remainingSeconds) }} left</span>
          <div class="8bit-progress">
            <div class="8bit-progress-bar" :style="{ width: (elapsedSeconds / (GAME_DURATION / 1000)) * 100 + '%' }"></div>
          </div>
        </div>
        <div v-else class="goodbye-timer">
          <span class="goodbye-text">Final {{ formatTimeRemaining(remainingSeconds) }}</span>
        </div>
      </div>
      <div class="header-buttons">
        <button @click="showCustomization = !showCustomization" class="8bit-button customize-btn">COLOR</button>
        <button @click="handleLogout" class="8bit-button logout-btn" title="Logout">LOGOUT</button>
      </div>
    </div>

    <!-- Main content -->
    <div class="main-content">
      <!-- Pet Display -->
      <div class="pet-section">
        <PetDisplay
          :pet="petState"
          :age="petAge"
          :is-sleeping="isSleeping"
          :mood="currentMood"
          @rub="() => handlePetInteraction('rub')"
          @click="() => handlePetInteraction('click')"
          @feed="handleFeed"
        />
      </div>

      <!-- Customization Panel -->
      <CustomizationPanel
        v-if="showCustomization"
        :pet="petState"
        @update="handleCustomizationChange"
      />

      <!-- Chat Interface -->
      <ChatInterface
        v-else
        :pet-name="petState.name"
        :memories="memories"
        :is-typing="isTyping"
        :is-goodbye-phase="isGoodbyePhase"
        @send-message="handleUserMessage"
        @end-game="endGameEarly"
      />
    </div>

    <!-- Footer -->
    <Footer />
  </div>
</template>

<style scoped>
.game {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--black);
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: var(--8bit-border-thick) solid var(--white);
  background: var(--black);
  box-shadow: 0 var(--8bit-border-thick) 0 var(--white);
}

.title-section h1 {
  margin: 0;
  font-size: 1.8em;
  letter-spacing: var(--8bit-letter-spacing-title);
}

.age-display {
  margin: 5px 0 0 0;
  font-size: 0.85em;
  color: var(--white);
  letter-spacing: var(--8bit-letter-spacing);
}

.owner-name {
  margin: 5px 0 0 0;
  font-size: 0.75em;
  color: var(--white);
  opacity: 0.7;
  letter-spacing: var(--8bit-letter-spacing);
}

.timer-section {
  flex: 1;
  margin: 0 20px;
}

.timer {
  text-align: center;
}

.time-remaining {
  display: block;
  font-size: 1.2em;
  color: var(--white);
  margin-bottom: 8px;
}

.goodbye-timer {
  text-align: center;
}

.goodbye-text {
  font-size: 1.2em;
  color: var(--white);
  animation: pulse 1s infinite;
  letter-spacing: var(--8bit-letter-spacing);
}

.header-buttons {
  display: flex;
  gap: 10px;
  align-items: center;
}

.customize-btn,
.logout-btn {
  font-size: 1.2em;
}

.logout-btn {
  background: var(--black);
  border: 2px solid var(--white);
}

.logout-btn:hover {
  background: var(--white);
  color: var(--black);
}

.main-content {
  flex: 1;
  display: flex;
}

.pet-section {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.game-over-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.game-over-card {
  text-align: center;
  max-width: 400px;
}

.game-over-card h2 {
  color: var(--white);
  font-size: 1.8em;
  margin-bottom: 15px;
  letter-spacing: var(--8bit-letter-spacing-title);
}

.game-over-card p {
  font-size: 1.1em;
  margin-bottom: 10px;
  letter-spacing: var(--8bit-letter-spacing);
}

.memories-count {
  color: var(--white);
  font-weight: bold;
}

.restart-btn {
  margin-top: 20px;
}

/* Mobile Responsiveness */
@media (max-width: 768px) {
  .header {
    flex-direction: column;
    gap: 15px;
    padding: 15px;
  }

  .title-section {
    text-align: center;
    width: 100%;
  }

  .title-section h1 {
    font-size: 1.3em;
  }

  .age-display {
    font-size: 0.75em;
  }

  .owner-name {
    font-size: 0.65em;
  }

  .timer-section {
    margin: 0;
    width: 100%;
  }

  .time-remaining,
  .goodbye-text {
    font-size: 1em;
  }

  .header-buttons {
    width: 100%;
    justify-content: center;
  }

  .customize-btn,
  .logout-btn {
    font-size: 0.8em;
    padding: 8px 16px;
  }

  .main-content {
    flex-direction: column;
    overflow-y: auto;
    overflow-x: hidden;
  }

  .pet-section {
    flex: none;
    height: auto;
    min-height: 40vh;
    max-height: 50vh;
    padding: 10px;
    padding-top: 80px;
    overflow: visible;
  }
}
</style>
