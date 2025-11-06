export class AudioManager {
  private audioContext: AudioContext | null = null
  private masterGain: GainNode | null = null

  constructor() {
    try {
      const AudioContextClass = (window as any).AudioContext || (window as any).webkitAudioContext
      this.audioContext = new AudioContextClass()
      this.masterGain = this.audioContext!.createGain()
      this.masterGain.connect(this.audioContext!.destination)
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

  // Boop sound - alternative interaction sound
  playBoop() {
    this.playBeep() // Alias to playBeep
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


  // Background music oscillators
  private musicOscillators: OscillatorNode[] = []
  private musicGain: GainNode | null = null
  private currentMusicAge: string | null = null

  // Play age-appropriate background music
  playAgeMusic(age: 'baby' | 'young' | 'adult' | 'elderly') {
    // Don't restart if same age music is already playing
    if (this.currentMusicAge === age && this.musicOscillators.length > 0) {
      return
    }

    this.stopMusic()
    
    if (!this.audioContext || !this.masterGain) return

    this.currentMusicAge = age
    this.musicGain = this.audioContext.createGain()
    this.musicGain.gain.value = 0.05 // Very soft background music
    this.musicGain.connect(this.masterGain)

    const now = this.audioContext.currentTime

    // Define melodies for each age (frequencies in Hz)
    const melodies = {
      baby: [523.25, 587.33, 659.25, 698.46], // C5, D5, E5, F5 - playful
      young: [659.25, 783.99, 880.00, 987.77], // E5, G5, A5, B5 - energetic
      adult: [392.00, 440.00, 493.88, 523.25], // G4, A4, B4, C5 - balanced
      elderly: [261.63, 293.66, 329.63, 349.23]  // C4, D4, E4, F4 - gentle
    }

    const melody = melodies[age]
    const noteDuration = age === 'elderly' ? 1.2 : age === 'baby' ? 0.6 : 0.8

    // Create a looping melody
    const playMelody = (startTime: number) => {
      melody.forEach((freq, index) => {
        const osc = this.audioContext!.createOscillator()
        const noteGain = this.audioContext!.createGain()

        osc.type = 'sine'
        osc.frequency.setValueAtTime(freq, startTime + index * noteDuration)

        // Fade in and out for each note
        noteGain.gain.setValueAtTime(0, startTime + index * noteDuration)
        noteGain.gain.linearRampToValueAtTime(1, startTime + index * noteDuration + 0.1)
        noteGain.gain.linearRampToValueAtTime(0, startTime + (index + 1) * noteDuration - 0.1)

        osc.connect(noteGain)
        noteGain.connect(this.musicGain!)

        osc.start(startTime + index * noteDuration)
        osc.stop(startTime + (index + 1) * noteDuration)

        this.musicOscillators.push(osc)
      })
    }

    // Play initial melody
    playMelody(now)

    // Schedule recurring melodies
    const melodyLength = melody.length * noteDuration
    let currentTime = now + melodyLength

    // Schedule next 10 loops (will be stopped when age changes or game ends)
    for (let i = 0; i < 10; i++) {
      playMelody(currentTime)
      currentTime += melodyLength
    }
  }

  // Stop background music
  stopMusic() {
    this.musicOscillators.forEach(osc => {
      try {
        osc.stop()
        osc.disconnect()
      } catch (e) {
        // Oscillator may already be stopped
      }
    })
    this.musicOscillators = []
    
    if (this.musicGain) {
      this.musicGain.disconnect()
      this.musicGain = null
    }
    
    this.currentMusicAge = null
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
