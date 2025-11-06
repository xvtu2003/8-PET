<script setup lang="ts">
import { ref } from 'vue'
import type { Pet } from '../types'

interface Props {
  pet: Pet
}

const props = defineProps<Props>()

const emit = defineEmits<{
  update: [color: string]
}>()

const selectedColor = ref(props.pet.color)

const colorPresets = [
  { name: 'White', hex: '#FFFFFF' },
  { name: 'Light Gray', hex: '#CCCCCC' },
  { name: 'Gray', hex: '#999999' },
  { name: 'Dark Gray', hex: '#666666' },
  { name: 'Darker Gray', hex: '#333333' },
  { name: 'Black', hex: '#000000' }
]

function updateColor(color: string) {
  selectedColor.value = color
  saveChanges()
}

function saveChanges() {
  emit('update', selectedColor.value)
}
</script>

<template>
  <div class="customization-panel 8bit-card">
    <h3>🎨 Customize {{ pet.name }}</h3>

    <!-- Color Selection -->
    <div class="section">
      <label>Color</label>
      <div class="color-presets">
        <button
          v-for="preset in colorPresets"
          :key="preset.hex"
          :style="{ backgroundColor: preset.hex, borderColor: '#ffffff' }"
          :class="{ active: selectedColor === preset.hex }"
          @click="updateColor(preset.hex)"
          class="color-button"
          :title="preset.name"
        />
      </div>
      <div class="custom-color">
        <input
          :value="selectedColor"
          type="color"
          @change="(e) => updateColor((e.target as HTMLInputElement).value)"
          class="color-picker-input"
        />
        <span>{{ selectedColor }}</span>
      </div>
    </div>

    <!-- Preview -->
    <div class="preview">
      <p>Preview:</p>
      <div class="pet-preview" :style="{ color: selectedColor }">
        CAT
      </div>
    </div>
  </div>
</template>

<style scoped>
.customization-panel {
  width: 280px;
  overflow-y: auto;
  border-right: none;
  margin: 0;
}

.customization-panel h3 {
  margin-top: 0;
  color: var(--white);
  font-size: 1.1em;
  letter-spacing: var(--8bit-letter-spacing-title);
}

.section {
  margin-bottom: 15px;
  padding-bottom: 15px;
  border-bottom: 1px dashed var(--white);
}

.section:last-child {
  border-bottom: none;
}

.section label {
  display: block;
  color: var(--white);
  font-weight: bold;
  margin-bottom: 8px;
  font-size: 0.9em;
  letter-spacing: var(--8bit-letter-spacing);
}

.color-presets {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 6px;
  margin-bottom: 8px;
}

.color-button {
  width: 100%;
  aspect-ratio: 1;
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
  gap: 8px;
  align-items: center;
  font-size: 0.85em;
}

.color-picker-input {
  width: 50px;
  height: 30px;
  cursor: pointer;
  padding: 0;
  border: var(--8bit-border-thin) solid var(--white);
  box-shadow: var(--8bit-shadow-input);
}

.custom-color span {
  color: var(--white);
  font-family: 'Press Start 2P', monospace;
  font-size: 0.75em;
}

.accessories-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 6px;
}

.accessory-button {
  text-align: left;
}

.accessory-button.selected {
  background: var(--white);
  color: var(--black);
}

.preview {
  background: var(--black);
  border: var(--8bit-border-thin) dashed var(--white);
  padding: 10px;
  text-align: center;
  margin-top: 10px;
}

.preview p {
  margin: 0 0 8px 0;
  color: var(--white);
  font-size: 0.85em;
  letter-spacing: var(--8bit-letter-spacing);
}

.pet-preview {
  font-size: 2.5em;
  margin-bottom: 8px;
}

.accessories-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.accessory-tag {
  font-size: 0.75em;
  background: var(--white);
  color: var(--black);
  padding: 4px 8px;
  text-align: center;
  letter-spacing: var(--8bit-letter-spacing);
}

.customization-panel::-webkit-scrollbar {
  width: 8px;
}

.customization-panel::-webkit-scrollbar-track {
  background: var(--black);
  border: 2px solid var(--white);
}

.customization-panel::-webkit-scrollbar-thumb {
  background: var(--white);
}
</style>
