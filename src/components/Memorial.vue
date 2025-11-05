<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { supabase } from '../lib/supabase'
import { signOut } from '../lib/auth'
import type { Pet, Memory } from '../types'
import Footer from './Footer.vue'

interface Props {
  pet: Pet
}

const props = defineProps<Props>()
const emit = defineEmits<{ logout: [] }>()

const memoryCount = ref(0)
const recentMemories = ref<Memory[]>([])
const isLoading = ref(true)
const showAllMemories = ref(false)

const timeLived = computed(() => {
  const birth = new Date(props.pet.birth_time).getTime()
  const deathTime = birth + (8 * 60 * 1000) // 8 minutes
  const minutesLived = Math.floor((deathTime - birth) / 1000 / 60)
  return minutesLived
})

const userMessageCount = computed(() => {
  return recentMemories.value.filter(m => m.sender === 'user').length
})

onMounted(() => {
  loadMemories()
})

async function loadMemories() {
  try {
    // Get memory count
    const { count } = await supabase
      .from('memories')
      .select('*', { count: 'exact', head: true })
      .eq('pet_id', props.pet.id)
    
    memoryCount.value = count || 0

    // Get recent memories (last 6 messages)
    const { data } = await supabase
      .from('memories')
      .select('*')
      .eq('pet_id', props.pet.id)
      .order('timestamp', { ascending: false })
      .limit(6)

    if (data) {
      recentMemories.value = data.reverse()
    }
  } catch (error) {
    console.error('Failed to load memories:', error)
  } finally {
    isLoading.value = false
  }
}

async function handleLogout() {
  if (confirm('Are you sure you want to logout?')) {
    try {
      await signOut()
      emit('logout')
    } catch (error) {
      console.error('Logout failed:', error)
      alert('Failed to logout. Please try again.')
    }
  }
}
</script>

<template>
  <div class="memorial-page retro-screen">
    <div v-if="isLoading" class="loading">
      <p>Loading...</p>
    </div>

    <div v-else class="memorial-container">
      <!-- Header -->
      <div class="memorial-header">
        <!-- Logout Button -->
        <button @click="handleLogout" class="logout-btn-top 8bit-button" title="Logout">
          LOGOUT
        </button>
        
        <h1 class="title">Your Journey Has Ended</h1>
        <div class="memorial-ascii">
          <pre>
  |\___/|
  (  x x )
  (  ~ ~ )
  (       )
  ( )))))))))</pre>
        </div>
        <h2 class="pet-name">{{ pet.name }}</h2>
      </div>

      <!-- Emotional Message -->
      <div class="emotional-message 8bit-card">
        <p class="main-message">
          8-PET is a one-time experience.
        </p>
        <p class="sub-message">
          The loss you feel is real, and so was the connection. 
          Each account receives only one companion.
        </p>
        <p class="treasure-message">
          Treasure the memories you made together.
        </p>
      </div>

      <!-- Pet Statistics -->
      <div class="memorial-stats 8bit-card">
        <h3>In Memory Of {{ pet.name }}</h3>
        
        <div class="stats-grid">
          <div class="stat">
            <span class="label">Born</span>
            <span class="value">{{ new Date(pet.birth_time).toLocaleString() }}</span>
          </div>
          <div class="stat">
            <span class="label">Time Together</span>
            <span class="value">{{ timeLived }} minutes</span>
          </div>
          <div class="stat">
            <span class="label">Conversations</span>
            <span class="value">{{ userMessageCount }}</span>
          </div>
          <div class="stat">
            <span class="label">Total Memories</span>
            <span class="value">{{ memoryCount }}</span>
          </div>
          <div class="stat">
            <span class="label">Favorite Color</span>
            <span class="value color-display" :style="{ color: pet.color }">
              ████
            </span>
          </div>
        </div>
      </div>

      <!-- Recent Memories -->
      <div v-if="recentMemories.length > 0" class="memories-section 8bit-card">
        <h3>Final Moments Together</h3>
        <div class="memories-list">
          <div 
            v-for="memory in recentMemories" 
            :key="memory.id"
            :class="['memory-item', memory.sender]"
          >
            <span class="memory-sender">{{ memory.sender === 'user' ? 'You' : pet.name }}</span>
            <p class="memory-text">{{ memory.message }}</p>
          </div>
        </div>
      </div>

      <!-- Final Message -->
      <div class="final-message">
        <p></p>
        <p>
          <strong>{{ pet.name }}</strong> lived a full life in those precious {{ timeLived }} minutes.
        </p>
        <p>
          The joy, the connection, the loss - it was all real.
        </p>
        <p class="closing">
          Thank you for giving {{ pet.name }} a loving home.
        </p>
      </div>

      <!-- Dedication to Shina -->
      <div class="shina-dedication 8bit-card">
        <div class="dedication-border">
          <h3 class="dedication-title">In Loving Memory</h3>
          <div class="shina-photo">
            <img src="../assets/photo_2025-10-24_19-40-33.jpg" alt="Shina" />
          </div>
          <p class="dedication-text">Shina</p>
          <p class="dedication-years">2010 - 2025</p>
          <p class="dedication-message">
            This project was created to preserve the memory of Shina,<br>
            who gave 15 years of unconditional love and companionship.
          </p>
          <p class="dedication-quote">
            "The loss you feel is real, and so was the connection."
          </p>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <Footer />
  </div>
</template>

<style scoped>
.memorial-page {
  width: 100%;
  height: 100%;
  background: var(--black);
  color: var(--white);
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  padding: 20px;
}

.loading {
  text-align: center;
  font-size: 1.2em;
  letter-spacing: var(--8bit-letter-spacing);
}

.memorial-container {
  max-width: 700px;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 25px;
  padding: 20px;
  position: relative;
  flex: 1;
  margin: 0 auto;
}

/* Header */
.memorial-header {
  text-align: center;
  margin-bottom: 10px;
  position: relative;
  padding-top: 50px;
}

.logout-btn-top {
  position: absolute;
  top: 0;
  right: 0;
  font-size: 0.8em;
  z-index: 10;
}

.title {
  font-size: 2em;
  margin-bottom: 20px;
  letter-spacing: var(--8bit-letter-spacing-title);
  animation: fadeIn 2s;
}

.memorial-ascii {
  margin: 20px 0;
  font-size: 1.5em;
  line-height: 1.2;
  opacity: 0.7;
}

.memorial-ascii pre {
  margin: 0;
  color: var(--white);
}

.pet-name {
  font-size: 1.8em;
  margin-top: 15px;
  letter-spacing: var(--8bit-letter-spacing);
}

/* Emotional Message */
.emotional-message {
  padding: 25px;
  text-align: center;
  line-height: 1.8;
  background: rgba(0, 0, 0, 0.5);
  animation: fadeIn 2.5s;
}

.main-message {
  font-size: 1.1em;
  font-weight: bold;
  margin-bottom: 15px;
  letter-spacing: var(--8bit-letter-spacing);
}

.sub-message {
  font-size: 0.85em;
  margin-bottom: 15px;
  line-height: 1.6;
  opacity: 0.9;
}

.treasure-message {
  font-size: 0.9em;
  font-style: italic;
  margin-top: 15px;
  opacity: 0.8;
}

/* Stats */
.memorial-stats {
  padding: 20px;
  animation: fadeIn 3s;
}

.memorial-stats h3 {
  text-align: center;
  margin-bottom: 20px;
  font-size: 1.1em;
  letter-spacing: var(--8bit-letter-spacing);
  border-bottom: 2px solid var(--white);
  padding-bottom: 10px;
}

.stats-grid {
  display: grid;
  gap: 12px;
}

.stat {
  display: flex;
  justify-content: space-between;
  padding: 8px;
  background: rgba(255, 255, 255, 0.05);
  border-left: 3px solid var(--white);
}

.stat .label {
  font-weight: bold;
  font-size: 0.8em;
  letter-spacing: 1px;
}

.stat .value {
  font-size: 0.85em;
  text-align: right;
}

.color-display {
  font-size: 1.2em;
}

/* Memories Section */
.memories-section {
  padding: 20px;
  animation: fadeIn 3.5s;
}

.memories-section h3 {
  text-align: center;
  margin-bottom: 15px;
  font-size: 1em;
  letter-spacing: var(--8bit-letter-spacing);
}

.memories-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-height: 300px;
  overflow-y: auto;
}

.memory-item {
  padding: 10px;
  background: rgba(0, 0, 0, 0.3);
  border-left: 3px solid var(--white);
}

.memory-item.user {
  border-left-color: var(--white);
  background: rgba(255, 255, 255, 0.1);
}

.memory-item.pet {
  border-left-color: #888;
  background: rgba(0, 0, 0, 0.5);
}

.memory-sender {
  display: block;
  font-size: 0.7em;
  font-weight: bold;
  margin-bottom: 5px;
  opacity: 0.8;
}

.memory-text {
  margin: 0;
  font-size: 0.8em;
  line-height: 1.4;
}

/* Final Message */
.final-message {
  text-align: center;
  padding: 30px 20px;
  line-height: 1.8;
  animation: fadeIn 4s;
}

.final-message p {
  margin: 12px 0;
  font-size: 0.9em;
}

.final-message p:first-child {
  font-size: 2.5em;
  margin-bottom: 20px;
}

.final-message strong {
  color: var(--white);
  text-decoration: underline;
}

.closing {
  margin-top: 25px;
  font-style: italic;
  opacity: 0.8;
  font-size: 0.85em !important;
}

/* Shina Dedication */
.shina-dedication {
  margin: 40px auto 30px;
  max-width: 500px;
  padding: 30px;
  text-align: center;
  background: rgba(0, 0, 0, 0.7);
  animation: fadeIn 3s;
}

.dedication-border {
  border: 3px double var(--white);
  padding: 25px;
}

.dedication-title {
  margin: 0 0 20px 0;
  font-size: 1.2em;
  letter-spacing: var(--8bit-letter-spacing);
  text-transform: uppercase;
}

.shina-photo {
  margin: 20px auto;
  max-width: 200px;
  border: 4px solid var(--white);
  box-shadow: 0 0 0 2px var(--black), 0 0 0 6px var(--white);
  overflow: hidden;
}

.shina-photo img {
  width: 100%;
  height: auto;
  display: block;
  filter: grayscale(10%);
}

.dedication-text {
  margin: 15px 0 5px 0;
  font-size: 1.5em;
  font-weight: bold;
  letter-spacing: 2px;
}

.dedication-years {
  margin: 0 0 20px 0;
  font-size: 1em;
  opacity: 0.8;
  letter-spacing: 1px;
}

.dedication-message {
  margin: 20px 0;
  font-size: 0.85em;
  line-height: 1.6;
  opacity: 0.9;
}

.dedication-quote {
  margin: 20px 0 0 0;
  font-size: 0.8em;
  font-style: italic;
  opacity: 0.7;
  border-top: 1px solid var(--white);
  padding-top: 15px;
}

/* Animation */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Scrollbar */
.memories-list::-webkit-scrollbar {
  width: 6px;
}

.memories-list::-webkit-scrollbar-track {
  background: var(--black);
  border: 1px solid var(--white);
}

.memories-list::-webkit-scrollbar-thumb {
  background: var(--white);
}

/* Mobile responsiveness */
@media (max-width: 640px) {
  .memorial-container {
    padding: 10px;
  }

  .title {
    font-size: 1.3em;
  }

  .pet-name {
    font-size: 1.3em;
  }

  .memorial-ascii {
    font-size: 1em;
  }

  .emotional-message {
    padding: 15px;
  }

  .main-message {
    font-size: 0.95em;
  }

  .sub-message {
    font-size: 0.75em;
  }
}
</style>
