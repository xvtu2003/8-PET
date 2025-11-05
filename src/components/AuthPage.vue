<script setup lang="ts">
import { ref } from 'vue'
import { signUp, signIn } from '../lib/auth'

const isLogin = ref(true)
const email = ref('')
const password = ref('')
const username = ref('')
const confirmPassword = ref('')
const isLoading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

const emit = defineEmits<{
  authenticated: [email: string]
}>()

async function handleSubmit() {
  errorMessage.value = ''
  successMessage.value = ''

  if (!email.value || !password.value) {
    errorMessage.value = 'Please fill in all fields'
    return
  }

  if (!isLogin.value && !username.value) {
    errorMessage.value = 'Please enter your name'
    return
  }

  if (!isLogin.value && (username.value.length < 2 || username.value.length > 20)) {
    errorMessage.value = 'Name must be 2-20 characters'
    return
  }

  if (!isLogin.value && password.value !== confirmPassword.value) {
    errorMessage.value = 'Passwords do not match'
    return
  }

  if (!isLogin.value && password.value.length < 6) {
    errorMessage.value = 'Password must be at least 6 characters'
    return
  }

  isLoading.value = true

  try {
    if (isLogin.value) {
      await signIn(email.value, password.value)
      successMessage.value = 'Welcome back!'
    } else {
      await signUp(email.value, password.value, username.value)
      successMessage.value = 'Account created! Welcome to 8-PET!'
    }

    setTimeout(() => {
      emit('authenticated', email.value)
    }, 1000)
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Authentication failed'
  } finally {
    isLoading.value = false
  }
}

function toggleMode() {
  isLogin.value = !isLogin.value
  errorMessage.value = ''
  successMessage.value = ''
  email.value = ''
  password.value = ''
  username.value = ''
  confirmPassword.value = ''
}
</script>

<template>
  <div class="auth-page retro-screen">
    <div class="auth-container 8bit-card">
      <h1 class="auth-title">8-PET</h1>

      <!-- Cat ASCII Art -->
      <div class="auth-cat-art">
        <pre>⣿⣿⣿⣿⣿⣿⣿⣿⣿⡟⠉⠙⢻⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡿⠛⠛⢿⣿⣿⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣿⣿⣿⣿⡟⠀⠀⠀⠀⢻⣿⣿⣿⣿⣿⣿⣿⣿⡿⠁⠀⠀⠀⢻⣿⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣿⣿⣿⡟⠀⠀⠀⠀⠀⠈⢿⣿⣿⣿⣿⣿⣿⣟⠁⠀⠀⠀⠀⠀⢿⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣿⣿⡿⠀⠀⠀⠀⠀⠀⠀⠘⣿⣿⣿⣿⣿⣿⡇⠀⠀⠀⠀⠀⠀⠘⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣿⣿⠃⠀⠀⠀⠀⠀⠀⠀⠀⢸⣿⣿⣿⣿⡟⠀⠀⠀⠀⠀⠀⠀⠀⢹⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣿⡟⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢿⣿⣿⣿⠇⠀⠀⠀⠀⠀⠀⠀⠀⠘⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣿⠃⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠘⠛⠛⠋⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⡿⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⡇⠀⠀⠀⠀⠀⠀⠀⢀⣀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣷⠀⠀⠀⠀⠀⣴⣾⣿⣿⣷⣆⠀⠀⠀⠀⠀⢀⣴⣿⣿⣷⣄⠀⠀⠀⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣿⠀⠀⠀⠀⣼⣿⣿⣿⠋⠉⢻⡆⠀⠀⠀⠀⣼⡏⠉⢻⣿⣿⠀⠀⠀⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣿⠀⠀⠀⠀⢹⣿⣿⣿⣆⣀⣾⠇⠀⠀⠀⠀⢿⣧⢀⣼⣿⡿⠀⠀⠀⢹⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣿⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠉⠀⠀⠐⠆⠀⠈⠛⠁⠀⠀⠀⠀⠀⠀⠼⠿⠿⠿⠿⣿
⣿⣁⣀⣠⣤⣄⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣤⣴⣶⣶⣴⣿
⣟⠛⠛⠉⢉⣀⣤⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣤⣤⣤⣤⣈⠉⢻
⣿⣿⣶⡿⠟⠉⣁⣠⣶⣄⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣠⣤⣤⣌⡉⠙⠻⢿⣿⣿
⣿⣿⣿⣠⣴⣾⣿⣿⣿⣿⣿⠃⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢰⣾⣿⣿⣿⣿⣿⣿⣿⣶⣾⣿⣿
⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡏⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢸⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣿⣿⣿⣿⣿⡟⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠸⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣿⣿⣿⣿⡿⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣿⣿⣿⡿⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢸⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣿⣿⡿⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣿⡿⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠸⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣿⠃⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢻⣿⣿⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⠇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢸⣿⣿⣿⣿⣿⣿⣿⣿⣿</pre>
      </div>

      <p class="auth-subtitle">{{ isLogin ? 'Welcome Back' : 'Create Account' }}</p>

      <!-- Tab Toggle -->
      <div class="auth-tabs">
        <button
          :class="{ active: isLogin }"
          @click="toggleMode"
          class="8bit-button tab-btn"
        >
          [LOGIN]
        </button>
        <button
          :class="{ active: !isLogin }"
          @click="toggleMode"
          class="8bit-button tab-btn"
        >
          [SIGNUP]
        </button>
      </div>

      <!-- Form -->
      <form @submit.prevent="handleSubmit" class="auth-form">
        <!-- Email Input -->
        <div class="input-group">
          <label for="email">Email</label>
          <input
            id="email"
            v-model="email"
            type="email"
            placeholder="your@email.com"
            class="8bit-input"
            :disabled="isLoading"
          />
        </div>

        <!-- Username Input (Signup only) -->
        <div v-if="!isLogin" class="input-group">
          <label for="username">Your Name</label>
          <input
            id="username"
            v-model="username"
            type="text"
            placeholder="Enter your name"
            maxlength="20"
            class="8bit-input"
            :disabled="isLoading"
          />
        </div>

        <!-- Password Input -->
        <div class="input-group">
          <label for="password">Password</label>
          <input
            id="password"
            v-model="password"
            type="password"
            placeholder="••••••••"
            class="8bit-input"
            :disabled="isLoading"
          />
        </div>

        <!-- Confirm Password (Signup only) -->
        <div v-if="!isLogin" class="input-group">
          <label for="confirm-password">Confirm Password</label>
          <input
            id="confirm-password"
            v-model="confirmPassword"
            type="password"
            placeholder="••••••••"
            class="8bit-input"
            :disabled="isLoading"
          />
        </div>

        <!-- Error Message -->
        <div v-if="errorMessage" class="error-message">
          {{ errorMessage }}
        </div>

        <!-- Success Message -->
        <div v-if="successMessage" class="success-message">
          {{ successMessage }}
        </div>

        <!-- Submit Button -->
        <button
          type="submit"
          class="8bit-button submit-btn"
          :disabled="isLoading"
        >
          {{ isLoading ? 'Loading...' : (isLogin ? '[LOGIN]' : '[CREATE]') }}
        </button>
      </form>

      <!-- Info Text -->
      <p class="auth-info">
        {{ isLogin ? "Don't have an account? Click SIGNUP" : 'Already have an account? Click LOGIN' }}
      </p>
    </div>
  </div>
</template>

<style scoped>
.auth-page {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--black);
  padding: 20px;
}

.auth-container {
  width: 100%;
  max-width: 400px;
  padding: 30px;
}

.auth-title {
  text-align: center;
  font-size: 2.5em;
  color: var(--white);
  margin: 0 0 10px 0;
  letter-spacing: var(--8bit-letter-spacing-title);
}

.auth-subtitle {
  text-align: center;
  color: var(--white);
  font-size: 1.2em;
  margin-bottom: 30px;
  letter-spacing: var(--8bit-letter-spacing);
}

.auth-tabs {
  display: flex;
  gap: 10px;
  margin-bottom: 30px;
}

.tab-btn {
  flex: 1;
  opacity: 0.6;
  transition: opacity 0.2s;
}

.tab-btn.active {
  opacity: 1;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.input-group label {
  color: var(--white);
  font-size: 0.9em;
  letter-spacing: var(--8bit-letter-spacing);
}

.error-message {
  background: var(--black);
  border: 3px solid #ff6b6b;
  color: #ff6b6b;
  padding: 10px;
  box-shadow: 3px 3px 0px var(--white);
  font-size: 0.8em;
  text-align: center;
}

.success-message {
  background: var(--black);
  border: 3px solid #51cf66;
  color: #51cf66;
  padding: 10px;
  box-shadow: 3px 3px 0px var(--white);
  font-size: 0.8em;
  text-align: center;
}

.submit-btn {
  margin-top: 10px;
  font-size: 1.1em;
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.auth-info {
  text-align: center;
  color: var(--white);
  font-size: 0.75em;
  margin-top: 20px;
  letter-spacing: 0.5px;
  opacity: 0.8;
}

.auth-cat-art {
  margin: 20px 0;
  text-align: center;
  overflow: hidden;
}

.auth-cat-art pre {
  color: var(--white);
  font-size: 0.5em;
  line-height: 1;
  margin: 0;
  font-family: 'Courier New', monospace;
  text-shadow: 0 0 4px rgba(255, 255, 255, 0.3);
}

@media (max-width: 640px) {
  .auth-container {
    padding: 20px;
  }

  .auth-title {
    font-size: 1.8em;
  }

  .auth-subtitle {
    font-size: 1em;
  }

  .auth-cat-art pre {
    font-size: 0.35em;
  }
}
</style>
