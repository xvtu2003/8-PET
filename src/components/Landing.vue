<script setup lang="ts">
import { ref } from 'vue'
import NamingModal from './NamingModal.vue'
import Footer from './Footer.vue'

const showNamingModal = ref(false)

function handleCatClick() {
  // Play cute sound effect
  playSound('meow')
  showNamingModal.value = true
}

function playSound(soundType: string) {
  // Create a simple 8-bit sound using Web Audio API
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)

    if (soundType === 'meow') {
      oscillator.frequency.setValueAtTime(400, audioContext.currentTime)
      oscillator.frequency.exponentialRampToValueAtTime(200, audioContext.currentTime + 0.3)
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3)
      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.3)
    }
  } catch (e) {
    console.log('Audio not supported')
  }
}

function handleNamingComplete(petName: string, color: string, accessories: string[]) {
  emit('startGame', petName, color, accessories)
}

const emit = defineEmits<{
  startGame: [petName: string, color: string, accessories: string[]]
}>()
</script>

<template>
  <div class="landing retro-screen">
    <div class="content">
      <h1 class="title">8-PET</h1>
      <p class="subtitle">You found a lonely cat...</p>
      <p class="warning">WARNING: This is a one-time journey. Choose wisely.</p>

      <div class="cat-container float">
        <div class="cat 8bit-card" @click="handleCatClick">
          <!-- Simple 8-bit cat ASCII art -->
          <div class="cat-visual">
            <span class="meow pulse">~</span>
            <pre>
 |\___/|
 (  o o )
 (  =^= )
  (     )
   (      )))))))))))</pre>
          </div>
        </div>
      </div>

      <p class="instruction pulse">Click the cat to continue...</p>
    </div>

    <NamingModal
      v-if="showNamingModal"
      @complete="handleNamingComplete"
      @cancel="showNamingModal = false"
    />

    <!-- Footer -->
    <Footer />
  </div>
</template>

<style scoped>
.landing {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: var(--black);
  position: relative;
}

.content {
  text-align: center;
  max-width: 600px;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.title {
  font-size: 4em;
  margin-bottom: 20px;
  color: var(--white);
  text-shadow: var(--8bit-border-thick) var(--8bit-border-thick) 0px var(--black);
  letter-spacing: var(--8bit-letter-spacing-title);
}

.subtitle {
  font-size: 1.2em;
  color: var(--white);
  margin-bottom: 15px;
  letter-spacing: var(--8bit-letter-spacing);
}

.warning {
  font-size: 0.85em;
  color: var(--white);
  margin-bottom: 25px;
  padding: 10px;
  border: 2px solid var(--white);
  background: rgba(255, 255, 255, 0.1);
  letter-spacing: var(--8bit-letter-spacing);
  animation: pulse 2s infinite;
}

.cat-container {
  margin: 40px 0;
  display: flex;
  justify-content: center;
}

.cat {
  cursor: pointer;
  transition: transform var(--8bit-transition-fast);
  user-select: none;
  display: inline-block;
}

.cat:hover {
  transform: var(--8bit-transform-hover);
  box-shadow: var(--8bit-shadow-button-hover);
}

.cat:active {
  transform: var(--8bit-transform-active);
  box-shadow: var(--8bit-shadow-button-active);
}

.cat-visual {
  position: relative;
  font-family: 'Courier New', monospace;
  font-size: 2.2em;
  color: var(--white);
  line-height: 1.2;
  white-space: pre;
  padding: 20px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px dashed var(--white);
  letter-spacing: 0.1em;
}

.meow {
  position: absolute;
  top: -30px;
  right: 20px;
  font-size: 1.5em;
  color: var(--white);
}

.instruction {
  font-size: 1.1em;
  color: var(--white);
  margin-top: 40px;
  letter-spacing: var(--8bit-letter-spacing);
}
</style>
