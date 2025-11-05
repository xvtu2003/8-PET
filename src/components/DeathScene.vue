<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { audioManager } from '../lib/audio'

interface Props {
  petName: string
  petAge: string
  finalMessage: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  complete: []
}>()

const currentStage = ref<'fade' | 'words' | 'dissolve' | 'flash' | 'memorial'>('fade')
const displayedText = ref('')
const textIndex = ref(0)
const showParticles = ref(false)

onMounted(() => {
  // Play death sound
  audioManager.playDeathSound()

  // Stage 1: Fade (5 seconds)
  setTimeout(() => {
    currentStage.value = 'words'
    // Start typing final words
    typeOutMessage()
  }, 5000)
})

function typeOutMessage() {
  const message = props.finalMessage || `*goodbye* I will remember you... *fade*`
  const speed = 50

  const typeInterval = setInterval(() => {
    if (textIndex.value < message.length) {
      displayedText.value += message[textIndex.value]
      textIndex.value++
    } else {
      clearInterval(typeInterval)
      // After message displayed for 3 seconds, move to dissolve
      setTimeout(() => {
        currentStage.value = 'dissolve'
        showParticles.value = true
        // After dissolution (6 seconds), move to memorial
        setTimeout(() => {
          currentStage.value = 'memorial'
        }, 6000)
      }, 3000)
    }
  }, speed)
}

function handleMemorialClick() {
  emit('complete')
}
</script>

<template>
  <div class="death-scene retro-screen">
    <!-- Stage 1: Fade -->
    <div v-if="currentStage === 'fade'" class="stage-fade">
      <div class="pet-fading">
        <div class="ascii-cat-fade">
          |\___/|<br />
          ( o.o )<br />
          ( =^= )<br />
          ( )<br />
          ( )))))))))
        </div>
      </div>
      <div class="fade-text">Saying goodbye...</div>
    </div>

    <!-- Stage 2: Final Words -->
    <div v-else-if="currentStage === 'words'" class="stage-words">
      <div class="pet-dim">
        <div class="ascii-cat">
          |\___/|<br />
          ( . . )<br />
          ( = ~ = )<br />
          ( )<br />
          ( )))))))))
        </div>
      </div>
      <div class="final-message">
        <p>{{ displayedText }}<span class="cursor">_</span></p>
      </div>
    </div>

    <!-- Stage 3: Dissolution -->
    <div v-else-if="currentStage === 'dissolve'" class="stage-dissolve">
      <div class="dissolving-text">{{ displayedText }}</div>

      <!-- Particle effect -->
      <div v-if="showParticles" class="particles">
        <div v-for="i in 20" :key="i" class="particle"></div>
      </div>

      <div class="dissolving-message">
        <p>*glitch* *fade* ....</p>
      </div>
    </div>

    <!-- Stage 4: White Flash & Memorial -->
    <div v-if="currentStage === 'memorial'" class="stage-memorial">
      <div class="memorial-container 8bit-card">
        <h2>{{ petName }} lived 8 minutes</h2>
        <p class="memorial-message">*static* ...goodbye...*fade*</p>

        <div class="memorial-info">
          <p>🖤 Your pet will always be remembered 🖤</p>
        </div>

        <button @click="handleMemorialClick" class="8bit-button next-btn">
          [CONTINUE]
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.death-scene {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: var(--black);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 3000;
  color: var(--white);
  font-family: 'Courier New', monospace;
  overflow: hidden;
}

/* Stage 1: Fade */
.stage-fade {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 30px;
  width: 100%;
  height: 100%;
  animation: fadeOut 5s ease-out forwards;
}

.pet-fading {
  animation: fadeToGray 5s ease-out forwards;
}

.ascii-cat-fade {
  font-size: 2em;
  line-height: 1.2;
  white-space: pre;
  text-align: center;
  color: var(--white);
}

.fade-text {
  font-size: 1.5em;
  opacity: 0.8;
  animation: pulse 1s infinite;
}

@keyframes fadeOut {
  0% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
}

@keyframes fadeToGray {
  0% {
    filter: brightness(1);
  }
  100% {
    filter: brightness(0.5) grayscale(1);
  }
}

/* Stage 2: Final Words */
.stage-words {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 40px;
  width: 100%;
  height: 100%;
  animation: fadeIn 0.5s ease-in;
}

.pet-dim {
  animation: dim 8s ease-in forwards;
}

.ascii-cat {
  font-size: 2em;
  line-height: 1.2;
  white-space: pre;
  text-align: center;
  color: var(--white);
}

.final-message {
  background: var(--black);
  border: 3px solid var(--white);
  padding: 20px 30px;
  box-shadow: 4px 4px 0px var(--white);
  max-width: 400px;
  text-align: center;
}

.final-message p {
  font-size: 1.1em;
  margin: 0;
  letter-spacing: 2px;
  line-height: 1.8;
  min-height: 80px;
}

.cursor {
  animation: blink 0.5s infinite;
}

@keyframes blink {
  0%, 50% {
    opacity: 1;
  }
  51%, 100% {
    opacity: 0;
  }
}

@keyframes fadeIn {
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}

@keyframes dim {
  0% {
    opacity: 1;
  }
  100% {
    opacity: 0.3;
  }
}

/* Stage 3: Dissolution */
.stage-dissolve {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  animation: glitch-fade 6s ease-out forwards;
}

.dissolving-text {
  font-size: 2em;
  text-align: center;
  animation: dissolve 5s ease-out forwards;
  opacity: 0.5;
  filter: blur(0px);
}

.particles {
  position: absolute;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.particle {
  position: absolute;
  width: 4px;
  height: 4px;
  background: var(--white);
  border: 1px solid var(--white);
  animation: particle-fall 3s ease-out forwards;
}

@keyframes particle-fall {
  0% {
    transform: translate(0, 0);
    opacity: 1;
  }
  100% {
    transform: translate(var(--tx), var(--ty));
    opacity: 0;
  }
}

.particle:nth-child(1) {
  --tx: 200px;
  --ty: 400px;
  top: 20%;
  left: 30%;
}
.particle:nth-child(2) {
  --tx: -200px;
  --ty: 400px;
  top: 25%;
  left: 70%;
}
.particle:nth-child(3) {
  --tx: 300px;
  --ty: 500px;
  top: 40%;
  left: 20%;
}
.particle:nth-child(4) {
  --tx: -300px;
  --ty: 500px;
  top: 45%;
  left: 80%;
}
.particle:nth-child(5) {
  --tx: 150px;
  --ty: 600px;
  top: 10%;
  left: 50%;
}
.particle:nth-child(6) {
  --tx: -150px;
  --ty: 600px;
  top: 60%;
  left: 40%;
}
.particle:nth-child(7) {
  --tx: 250px;
  --ty: 450px;
  top: 50%;
  left: 60%;
}
.particle:nth-child(8) {
  --tx: -250px;
  --ty: 450px;
  top: 70%;
  left: 30%;
}
.particle:nth-child(9) {
  --tx: 100px;
  --ty: 550px;
  top: 30%;
  left: 45%;
}
.particle:nth-child(10) {
  --tx: -100px;
  --ty: 550px;
  top: 55%;
  left: 55%;
}
.particle:nth-child(11) {
  --tx: 180px;
  --ty: 480px;
  top: 35%;
  left: 25%;
}
.particle:nth-child(12) {
  --tx: -180px;
  --ty: 480px;
  top: 75%;
  left: 75%;
}
.particle:nth-child(13) {
  --tx: 220px;
  --ty: 520px;
  top: 15%;
  left: 35%;
}
.particle:nth-child(14) {
  --tx: -220px;
  --ty: 520px;
  top: 65%;
  left: 65%;
}
.particle:nth-child(15) {
  --tx: 170px;
  --ty: 490px;
  top: 22%;
  left: 48%;
}
.particle:nth-child(16) {
  --tx: -170px;
  --ty: 490px;
  top: 52%;
  left: 52%;
}
.particle:nth-child(17) {
  --tx: 190px;
  --ty: 510px;
  top: 38%;
  left: 62%;
}
.particle:nth-child(18) {
  --tx: -190px;
  --ty: 510px;
  top: 68%;
  left: 38%;
}
.particle:nth-child(19) {
  --tx: 160px;
  --ty: 470px;
  top: 28%;
  left: 32%;
}
.particle:nth-child(20) {
  --tx: -160px;
  --ty: 470px;
  top: 72%;
  left: 68%;
}

.dissolving-message {
  margin-top: 40px;
  font-size: 1.2em;
  animation: glitch 0.2s infinite;
  opacity: 0.6;
}

@keyframes dissolve {
  0% {
    opacity: 1;
    filter: blur(0px);
  }
  50% {
    filter: blur(2px);
  }
  100% {
    opacity: 0;
    filter: blur(10px);
  }
}

@keyframes glitch {
  0%, 100% {
    text-shadow: none;
  }
  50% {
    text-shadow: 2px 2px var(--white), -2px -2px var(--white);
  }
}

@keyframes glitch-fade {
  0% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
}

/* Stage 4: Memorial */
.stage-memorial {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  animation: memorialAppear 0.8s ease-in;
}

.memorial-container {
  max-width: 400px;
  padding: 30px;
  text-align: center;
  animation: memorialPulse 2s ease-in-out;
}

.memorial-container h2 {
  margin-top: 0;
  margin-bottom: 20px;
  letter-spacing: var(--8bit-letter-spacing);
}

.memorial-message {
  font-style: italic;
  margin-bottom: 30px;
  opacity: 0.9;
}

.memorial-info {
  margin: 20px 0;
  padding: 15px;
  border: 2px solid var(--white);
  font-size: 0.95em;
}

.memorial-info p {
  margin: 0;
}

.next-btn {
  margin-top: 20px;
  font-size: 1.1em;
}

@keyframes memorialAppear {
  0% {
    opacity: 0;
    transform: scale(0.8);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes memorialPulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.02);
  }
}

/* Mobile responsiveness */
@media (max-width: 640px) {
  .ascii-cat,
  .ascii-cat-fade {
    font-size: 1.2em;
  }

  .final-message {
    max-width: 90%;
    padding: 15px 20px;
  }

  .final-message p {
    font-size: 0.9em;
  }

  .memorial-container {
    max-width: 90%;
  }
}
</style>
