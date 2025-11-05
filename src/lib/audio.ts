export class AudioManager {
  private audioContext: AudioContext | null = null
  private masterGain: GainNode | null = null

  constructor() {
    try {
      const AudioContextClass = (window as any).AudioContext || (window as any).webkitAudioContext
      this.audioContext = new AudioContextClass()
      this.masterGain = this.audioContext.createGain()
      this.masterGain.connect(this.audioContext.destination)
      this.masterGain.gain.value = 0.3 // Default volume 30%
    } catch (error) {
      console.warn('Web Audio API not supported:', error)
    }
  }

  // Meow sound - simple cat meow
  playMeow() {
    if (!this.audioContext || !this.masterGain) return

    const osc = this.audioContext.createOscillator()
    const gain = this.audioContext.createGain()

    osc.type = 'sine'
    osc.frequency.setValueAtTime(350, this.audioContext.currentTime)
    osc.frequency.exponentialRampToValueAtTime(200, this.audioContext.currentTime + 0.3)

    gain.gain.setValueAtTime(0.2, this.audioContext.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3)

    osc.connect(gain)
    gain.connect(this.masterGain)

    osc.start(this.audioContext.currentTime)
    osc.stop(this.audioContext.currentTime + 0.3)
  }

  // Beep sound - simple interaction beep
  playBeep() {
    if (!this.audioContext || !this.masterGain) return

    const osc = this.audioContext.createOscillator()
    const gain = this.audioContext.createGain()

    osc.type = 'sine'
    osc.frequency.setValueAtTime(800, this.audioContext.currentTime)

    gain.gain.setValueAtTime(0.1, this.audioContext.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1)

    osc.connect(gain)
    gain.connect(this.masterGain)

    osc.start(this.audioContext.currentTime)
    osc.stop(this.audioContext.currentTime + 0.1)
  }

  // Sad/dying sound - descending glitch
  playDeathSound() {
    if (!this.audioContext || !this.masterGain) return

    const duration = 2
    const now = this.audioContext.currentTime

    // First part: descending tone
    const osc1 = this.audioContext.createOscillator()
    const gain1 = this.audioContext.createGain()

    osc1.type = 'sine'
    osc1.frequency.setValueAtTime(800, now)
    osc1.frequency.exponentialRampToValueAtTime(100, now + 1.5)

    gain1.gain.setValueAtTime(0.25, now)
    gain1.gain.exponentialRampToValueAtTime(0.01, now + 1.5)

    osc1.connect(gain1)
    gain1.connect(this.masterGain)

    // Glitch effect
    const osc2 = this.audioContext.createOscillator()
    const gain2 = this.audioContext.createGain()

    osc2.type = 'square'
    osc2.frequency.setValueAtTime(200, now + 1.5)
    osc2.frequency.exponentialRampToValueAtTime(50, now + 2)

    gain2.gain.setValueAtTime(0.1, now + 1.5)
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 2) // Use 0.001 instead of 0 for exponential ramp

    osc2.connect(gain2)
    gain2.connect(this.masterGain)

    osc1.start(now)
    osc1.stop(now + 1.5)

    osc2.start(now + 1.5)
    osc2.stop(now + duration)
  }


  // Set master volume (0-1)
  setVolume(value: number) {
    if (this.masterGain) {
      this.masterGain.gain.value = Math.max(0, Math.min(1, value))
    }
  }

  // Get current volume
  getVolume(): number {
    return this.masterGain?.gain.value || 0
  }

  // Enable/disable audio
  setMuted(muted: boolean) {
    if (this.masterGain) {
      this.masterGain.gain.value = muted ? 0 : 0.3
    }
  }
}

// Create global audio manager instance
export const audioManager = new AudioManager()
