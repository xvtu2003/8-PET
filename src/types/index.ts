export interface Pet {
  id: string
  name: string
  user_id: string
  birth_time: string
  color: string
  accessories: string[]
  is_alive: boolean
  created_at: string
  updated_at: string
}

export interface Memory {
  id: string
  pet_id: string
  message: string
  sender: 'user' | 'pet'
  timestamp: string
  memory_type: string
  created_at: string
}

export interface Interaction {
  id: string
  pet_id: string
  interaction_type: string
  timestamp: string
  created_at: string
}

export type PetAge = 'baby' | 'young' | 'adult' | 'elderly'

export interface PetState {
  pet: Pet | null
  age: PetAge
  minutesLived: number
  isAlive: boolean
  isSleeping: boolean
}

export interface AuthUser {
  id: string
  email: string
  username?: string
  created_at: string
}

export type Mood = 'happy' | 'playful' | 'sleepy' | 'lonely' | 'content'
