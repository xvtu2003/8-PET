<script setup lang="ts">
import { ref, onMounted } from 'vue'

const petName = ref('')
const selectedColor = ref('#FFFFFF')
const selectedAccessories = ref<string[]>([])
const catChoice = ref('')
const isChoosingColor = ref(false)

const availableAccessories = [
  { id: 'bow', label: '🎀 Bow', color: '#FFFFFF' },
  { id: 'hat', label: '🎩 Top Hat', color: '#333333' },
  { id: 'collar', label: '⌛ Collar', color: '#CCCCCC' },
  { id: 'glasses', label: '👓 Glasses', color: '#666666' }
]

const colorPresets = [
  { name: 'White', hex: '#FFFFFF', personality: 'Pure and innocent' },
  { name: 'Light Gray', hex: '#CCCCCC', personality: 'Gentle and kind' },
  { name: 'Gray', hex: '#999999', personality: 'Balanced and wise' },
  { name: 'Dark Gray', hex: '#666666', personality: 'Mysterious and deep' },
  { name: 'Darker Gray', hex: '#333333', personality: 'Bold and confident' },
  { name: 'Black', hex: '#000000', personality: 'Elegant and sleek' }
]

// Cat autonomously chooses its color
function catChoosesColor() {
  isChoosingColor.value = true
  catChoice.value = 'mew~ *thinking*...'

  setTimeout(() => {
    // Cat randomly picks a color based on its "personality"
    const randomIndex = Math.floor(Math.random() * colorPresets.length)
    const chosenColor = colorPresets[randomIndex] || colorPresets[0]
    selectedColor.value = chosenColor?.hex || '#ffffff'

    catChoice.value = `*purr* I choose ${chosenColor?.name || 'White'}! ${chosenColor?.personality || 'Pure'} feels right... *beep*`

    setTimeout(() => {
      isChoosingColor.value = false
    }, 3000)
  }, 1500)
}

onMounted(() => {
  // Cat chooses its color when modal opens
  setTimeout(() => {
    catChoosesColor()
  }, 500)
})

function toggleAccessory(id: string) {
  const index = selectedAccessories.value.indexOf(id)
  if (index > -1) {
    selectedAccessories.value.splice(index, 1)
  } else {
    selectedAccessories.value.push(id)
  }
}

function isAccessorySelected(id: string) {
  return selectedAccessories.value.includes(id)
}

function complete() {
  if (!petName.value.trim()) {
    alert('Please give your pet a name!')
    return
  }
  emit('complete', petName.value, selectedColor.value, selectedAccessories.value)
}

const emit = defineEmits<{
  complete: [name: string, color: string, accessories: string[]]
  cancel: []
}>()
</script>

<template>
  <div class="modal-overlay retro-screen">
    <div class="modal 8bit-card">
      <h2>Hi! What's my name? 🥺</h2>

      <!-- Name Input -->
      <div class="input-group">
        <label>Pet Name</label>
        <input
          v-model="petName"
          type="text"
          placeholder="Give me a cute name..."
          maxlength="50"
          @keyup.enter="complete"
          class="8bit-input"
        />
      </div>

      <!-- Cat's Choice Message -->
      <div v-if="catChoice" class="cat-choice-message">
        <p>{{ catChoice }}</p>
      </div>

      <!-- Color Selection -->
      <div class="input-group">
        <label>My Color (I chose for myself! *proud*)</label>
        <div class="color-presets">
          <button
            v-for="preset in colorPresets"
            :key="preset.hex"
            :style="{ backgroundColor: preset.hex, borderColor: '#ffffff' }"
            :class="{ active: selectedColor === preset.hex }"
            @click="selectedColor = preset.hex"
            class="color-button"
            :title="`${preset.name} - ${preset.personality}`"
          />
        </div>
        <button @click="catChoosesColor" class="8bit-button" style="margin-top: 10px;" :disabled="isChoosingColor">
          {{ isChoosingColor ? 'Choosing...' : '🔄 Let me pick again!' }}
        </button>
      </div>

      <!-- Accessories Selection -->
      <div class="input-group">
        <label>Accessories</label>
        <div class="accessories">
          <button
            v-for="accessory in availableAccessories"
            :key="accessory.id"
            @click="toggleAccessory(accessory.id)"
            :class="{ selected: isAccessorySelected(accessory.id) }"
            class="8bit-button 8bit-button-sm accessory-button"
          >
            {{ accessory.label }}
          </button>
        </div>
      </div>

      <!-- Preview -->
      <div class="preview-section">
        <p>Preview:</p>
        <div class="pet-preview">
          <div class="preview-cat">
            <div :style="{ color: selectedColor }">CAT</div>
          </div>
          <p class="pet-name">{{ petName || 'Unnamed Pet' }}</p>
          <div v-if="selectedAccessories.length > 0" class="accessories-preview">
            {{ selectedAccessories.map(a => availableAccessories.find(x => x.id === a)?.label).join(' ') }}
          </div>
        </div>
      </div>

      <!-- Buttons -->
      <div class="button-group">
        <button @click="() => $emit('cancel')" class="8bit-button cancel-btn">Cancel</button>
        <button @click="complete" class="8bit-button start-btn">Let's Play!</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal h2 {
  color: var(--white);
  margin-bottom: 20px;
  text-align: center;
  letter-spacing: var(--8bit-letter-spacing-title);
}

.cat-choice-message {
  background: var(--black);
  border: 3px solid var(--white);
  padding: 15px;
  margin-bottom: 20px;
  box-shadow: 4px 4px 0px var(--white);
  animation: thought-appear 0.5s ease-out;
}

.cat-choice-message p {
  color: var(--white);
  font-size: 0.9em;
  margin: 0;
  text-align: center;
  letter-spacing: 1px;
  line-height: 1.6;
}

@keyframes thought-appear {
  0% {
    opacity: 0;
    transform: translateY(-10px) scale(0.95);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.input-group {
  margin-bottom: 20px;
}

.input-group label {
  display: block;
  margin-bottom: 8px;
  color: var(--white);
  font-weight: bold;
  letter-spacing: var(--8bit-letter-spacing);
}

.color-picker-input {
  width: 60px;
  height: 40px;
  cursor: pointer;
  padding: 0;
  border: var(--8bit-border-thin) solid var(--white);
  box-shadow: var(--8bit-shadow-input);
}

.color-presets {
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
}

.color-button {
  width: 40px;
  height: 40px;
  border: var(--8bit-border-thin) solid var(--white);
  cursor: pointer;
  transition: all var(--8bit-transition-fast);
  padding: 0;
  box-shadow: var(--8bit-shadow-input);
}

.color-button.active {
  transform: var(--8bit-transform-hover);
  box-shadow: var(--8bit-shadow-button-hover);
}

.color-button:hover {
  transform: var(--8bit-transform-hover);
}

.custom-color {
  display: flex;
  gap: 10px;
  align-items: center;
}

.custom-color label {
  margin: 0;
  font-size: 0.9em;
}

.accessories {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.accessory-button.selected {
  background: var(--white);
  color: var(--black);
}

.preview-section {
  background: var(--black);
  border: var(--8bit-border-thin) dashed var(--white);
  padding: 15px;
  margin: 20px 0;
}

.preview-section p {
  color: var(--white);
  margin-bottom: 10px;
  font-size: 0.9em;
  letter-spacing: var(--8bit-letter-spacing);
}

.pet-preview {
  text-align: center;
}

.preview-cat {
  font-size: 3em;
  margin-bottom: 10px;
}

.pet-name {
  font-weight: bold;
  color: var(--white);
  margin: 5px 0;
  letter-spacing: var(--8bit-letter-spacing);
}

.accessories-preview {
  font-size: 0.85em;
  color: var(--white);
  opacity: 0.8;
}

.button-group {
  display: flex;
  gap: 10px;
  justify-content: center;
  margin-top: 20px;
}

.cancel-btn,
.start-btn {
  flex: 1;
}
</style>
