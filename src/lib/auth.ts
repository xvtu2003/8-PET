import { supabase } from './supabase'

export interface AuthUser {
  id: string
  email: string
  username?: string
  created_at: string
}

export async function signUp(email: string, password: string, username?: string): Promise<AuthUser> {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username: username || ''
        }
      }
    })

    if (error) throw error
    if (!data.user) throw new Error('User not created')

    return {
      id: data.user.id,
      email: data.user.email || '',
      username: username,
      created_at: data.user.created_at || new Date().toISOString(),
    }
  } catch (error) {
    console.error('Sign up error:', error)
    throw error
  }
}

export async function signIn(email: string, password: string): Promise<AuthUser> {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) throw error
    if (!data.user) throw new Error('User not found')

    return {
      id: data.user.id,
      email: data.user.email || '',
      username: (data.user.user_metadata?.username as string) || undefined,
      created_at: data.user.created_at || new Date().toISOString(),
    }
  } catch (error) {
    console.error('Sign in error:', error)
    throw error
  }
}

export async function signOut(): Promise<void> {
  try {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  } catch (error) {
    console.error('Sign out error:', error)
    throw error
  }
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    const { data } = await supabase.auth.getUser()
    if (!data.user) return null

    return {
      id: data.user.id,
      email: data.user.email || '',
      username: (data.user.user_metadata?.username as string) || undefined,
      created_at: data.user.created_at || new Date().toISOString(),
    }
  } catch (error) {
    console.error('Get user error:', error)
    return null
  }
}

export async function onAuthStateChange(callback: (user: AuthUser | null) => void) {
  try {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        callback({
          id: session.user.id,
          email: session.user.email || '',
          username: (session.user.user_metadata?.username as string) || undefined,
          created_at: session.user.created_at || new Date().toISOString(),
        })
      } else {
        callback(null)
      }
    })

    return subscription
  } catch (error) {
    console.error('Auth state change error:', error)
    return null
  }
}
