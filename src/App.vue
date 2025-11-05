<script setup lang="ts">
import { ref, onMounted } from 'vue'
import Landing from './components/Landing.vue'
import Game from './components/Game.vue'
import AuthPage from './components/AuthPage.vue'
import Memorial from './components/Memorial.vue'
import { supabase } from './lib/supabase'
import { getCurrentUser, onAuthStateChange } from './lib/auth'
import type { Pet, AuthUser } from './types'

const currentPet = ref<Pet | null>(null)
const userId = ref<string>('')
const currentUser = ref<AuthUser | null>(null)
const isAuthenticated = ref(false)
const showMemorial = ref(false)
const isLoading = ref(true)

// Removed unused generateUserId function

async function startGame(petName: string, color: string, accessories: string[]) {
  try {
    // Check if user already has a pet (prevent multiple pets per account)
    const { data: existing } = await supabase
      .from('pets')
      .select()
      .eq('user_id', userId.value)

    if (existing && existing.length > 0) {
      alert('You already have a companion. Each account can only have one pet.')
      return
    }

    // Create new pet
    const { data, error } = await supabase
      .from('pets')
      .insert([
        {
          name: petName,
          user_id: userId.value,
          color: color,
          accessories: accessories,
          is_alive: true,
          birth_time: new Date().toISOString()
        }
      ])
      .select()
      .single()

    if (error) throw error

    currentPet.value = data
  } catch (error) {
    console.error('Failed to create pet:', error)
    alert('Failed to create pet. Please try again.')
  }
}

function endGame() {
  // When pet dies, show memorial instead of allowing restart
  showMemorial.value = true
}

async function loadExistingPet() {
  if (!userId.value) return
  
  try {
    const { data, error } = await supabase
      .from('pets')
      .select()
      .eq('user_id', userId.value)
      .single()

    if (error) {
      // No pet found - user can create one
      if (error.code === 'PGRST116') {
        currentPet.value = null
        showMemorial.value = false
      } else {
        console.error('Error loading pet:', error)
      }
    } else if (data) {
      // Check if pet should be dead based on elapsed time
      // Ensure birth_time is parsed as UTC
      let birthTimeStr = data.birth_time
      if (!birthTimeStr.endsWith('Z') && !birthTimeStr.includes('+')) {
        birthTimeStr = birthTimeStr + 'Z'
      }
      const birthTime = new Date(birthTimeStr).getTime()
      const elapsed = (Date.now() - birthTime) / 1000
      const GAME_DURATION_SECONDS = 8 * 60 // 8 minutes
      
      if (elapsed > GAME_DURATION_SECONDS && data.is_alive) {
        // Pet is past game duration but marked alive - mark as dead
        await supabase
          .from('pets')
          .update({ is_alive: false })
          .eq('id', data.id)
        
        data.is_alive = false
      }
      
      currentPet.value = data
      if (!data.is_alive) {
        showMemorial.value = true
      }
    }
  } catch (error) {
    console.error('Failed to load pet:', error)
  } finally {
    isLoading.value = false
  }
}

async function handleAuthenticated(email: string) {
  userId.value = email
  isAuthenticated.value = true
  isLoading.value = true
  await loadExistingPet()
}

function handleLogout() {
  // Reset all state
  currentPet.value = null
  showMemorial.value = false
  isAuthenticated.value = false
  userId.value = ''
  currentUser.value = null
}

onMounted(async () => {
  // Check if user is already logged in
  const user = await getCurrentUser()
  if (user) {
    currentUser.value = user
    userId.value = user.id
    isAuthenticated.value = true
    await loadExistingPet()
  } else {
    // For backward compatibility, use localStorage ID if no auth user
    const stored = localStorage.getItem('8pet-user-id')
    if (stored) {
      userId.value = stored
      isAuthenticated.value = true
      await loadExistingPet()
    } else {
      isLoading.value = false
    }
  }

  // Listen for auth state changes
  onAuthStateChange(async (user) => {
    if (user) {
      currentUser.value = user
      userId.value = user.id
      isAuthenticated.value = true
      isLoading.value = true
      await loadExistingPet()
    } else {
      currentUser.value = null
      isAuthenticated.value = false
      currentPet.value = null
      showMemorial.value = false
      isLoading.value = false
    }
  })
})
</script>

<template>
  <div id="app">
    <!-- Loading state -->
    <div v-if="isLoading" class="loading-screen">
      <p>Loading...</p>
    </div>
    
    <!-- Not authenticated -->
    <AuthPage v-else-if="!isAuthenticated" @authenticated="handleAuthenticated" />
    
    <!-- Memorial for deceased pet -->
    <Memorial v-else-if="showMemorial && currentPet" :pet="currentPet" @logout="handleLogout" />
    
    <!-- Game with living pet -->
    <Game v-else-if="currentPet?.is_alive" :pet="currentPet" :user-id="userId" :username="currentUser?.username" @end-game="endGame" @logout="handleLogout" />
    
    <!-- Landing for new users -->
    <Landing v-else @start-game="startGame" />
  </div>
</template>

<style scoped>
#app {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.loading-screen {
  text-align: center;
  color: var(--white);
  font-size: 1.5em;
  letter-spacing: var(--8bit-letter-spacing);
}
</style>
