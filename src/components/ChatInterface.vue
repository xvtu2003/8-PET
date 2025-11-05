<script setup lang="ts">
import { ref, nextTick, computed } from 'vue'
import type { Memory } from '../types'

interface Props {
  petName: string
  memories: Memory[]
  isTyping: boolean
  isGoodbyePhase: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  sendMessage: [message: string]
  endGame: []
}>()

const messageInput = ref('')
const chatContainer = ref<HTMLDivElement | null>(null)

const displayedMemories = computed(() => {
  return props.memories.slice().reverse()
})

async function sendMessage() {
  if (!messageInput.value.trim()) return

  const message = messageInput.value
  messageInput.value = ''

  emit('sendMessage', message)

  // Scroll to bottom
  await nextTick()
  if (chatContainer.value) {
    chatContainer.value.scrollTop = chatContainer.value.scrollHeight
  }
}

function handleKeyPress(e: KeyboardEvent) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    sendMessage()
  }
}
</script>

<template>
  <div class="chat-interface">
    <!-- Chat Messages -->
    <div class="chat-container" ref="chatContainer">
      <div v-if="displayedMemories.length === 0" class="empty-state">
        <p>{{ petName }} is waiting for you to speak... 👂</p>
      </div>

      <div v-for="memory in displayedMemories" :key="memory.id" :class="['message', memory.sender]">
        <div class="message-content">
          <span class="sender-label">{{ memory.sender === 'user' ? 'You' : petName }}</span>
          <p>{{ memory.message }}</p>
          <span class="timestamp">{{ formatTime(memory.timestamp) }}</span>
        </div>
      </div>

      <div v-if="isTyping" class="message pet">
        <div class="message-content">
          <span class="sender-label">{{ petName }}</span>
          <p class="typing-indicator">
            <span></span><span></span><span></span>
          </p>
        </div>
      </div>
    </div>

    <!-- Input Area -->
    <div class="input-area">
      <div v-if="isGoodbyePhase" class="goodbye-message">
        <p>These are your final moments together...</p>
      </div>

      <div class="input-group">
        <textarea
          v-model="messageInput"
          :disabled="isTyping"
          placeholder="Talk to your pet..."
          @keypress="handleKeyPress"
          class="message-input 8bit-textarea"
        />
        <button
          @click="sendMessage"
          :disabled="isTyping || !messageInput.trim()"
          class="send-btn 8bit-button"
        >
          {{ isTyping ? '...' : '💬' }}
        </button>
      </div>

      <button
        v-if="isGoodbyePhase"
        @click="() => $emit('endGame')"
        class="goodbye-btn 8bit-button"
      >
        👋 Say Goodbye
      </button>
    </div>
  </div>
</template>

<script lang="ts">
export default {
  methods: {
    formatTime(timestamp: string) {
      const date = new Date(timestamp)
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  }
}
</script>

<style scoped>
.chat-interface {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: var(--black);
  border-left: var(--8bit-border-thick) solid var(--white);
  overflow: hidden;
}

.chat-container {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  display: flex;
  flex-direction: column-reverse;
}

.chat-container::-webkit-scrollbar {
  width: 8px;
}

.chat-container::-webkit-scrollbar-track {
  background: var(--black);
  border: 2px solid var(--white);
}

.chat-container::-webkit-scrollbar-thumb {
  background: var(--white);
}

.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: var(--white);
  text-align: center;
  letter-spacing: var(--8bit-letter-spacing);
}

.message {
  margin-bottom: 15px;
  display: flex;
  animation: slide-in 0.3s ease-out;
}

@keyframes slide-in {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.message.user {
  justify-content: flex-end;
}

.message.pet {
  justify-content: flex-start;
}

.message-content {
  max-width: 70%;
  padding: 12px 15px;
  background: var(--black);
  border: var(--8bit-border-thin) solid var(--white);
  box-shadow: var(--8bit-shadow-input);
}

.message.user .message-content {
  background: var(--white);
  border-color: var(--black);
  color: var(--black);
}

.sender-label {
  display: block;
  font-size: 0.75em;
  font-weight: bold;
  color: var(--white);
  margin-bottom: 3px;
  letter-spacing: var(--8bit-letter-spacing);
}

.message.user .sender-label {
  color: var(--black);
}

.message-content p {
  margin: 0;
  font-size: 0.95em;
  line-height: 1.4;
  word-wrap: break-word;
}

.timestamp {
  display: block;
  font-size: 0.7em;
  color: var(--white);
  opacity: 0.6;
  margin-top: 5px;
}

.message.user .timestamp {
  color: var(--black);
  opacity: 0.6;
}

.typing-indicator {
  display: flex;
  gap: 3px;
  margin: 0;
}

.typing-indicator span {
  display: inline-block;
  width: 6px;
  height: 6px;
  background: var(--white);
  animation: typing 1.4s infinite;
}

.typing-indicator span:nth-child(2) {
  animation-delay: 0.2s;
}

.typing-indicator span:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes typing {
  0%, 60%, 100% {
    opacity: 0.3;
    transform: translateY(0);
  }
  30% {
    opacity: 1;
    transform: translateY(-5px);
  }
}

.input-area {
  padding: 15px;
  border-top: var(--8bit-border-thin) solid var(--white);
  background: var(--black);
}

.goodbye-message {
  background: var(--black);
  border: var(--8bit-border-thin) solid var(--white);
  padding: 10px;
  margin-bottom: 10px;
  text-align: center;
  color: var(--white);
  font-weight: bold;
  animation: pulse 1.5s infinite;
  letter-spacing: var(--8bit-letter-spacing);
}

.input-group {
  display: flex;
  gap: 10px;
}

.message-input {
  flex: 1;
  resize: none;
  height: 50px;
}

.send-btn {
  font-size: 1.2em;
}

.goodbye-btn {
  width: 100%;
  margin-top: 10px;
}
</style>
