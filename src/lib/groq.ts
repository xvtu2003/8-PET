import Groq from 'groq-sdk'

const apiKey = import.meta.env.VITE_GROQ_API_KEY

if (!apiKey) {
  throw new Error('Missing GROQ_API_KEY environment variable')
}

export const groq = new Groq({
  apiKey: apiKey,
  dangerouslyAllowBrowser: true
})

export async function getPetResponse(
  petName: string,
  petAge: 'baby' | 'young' | 'adult' | 'elderly',
  userMessage: string,
  conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }>,
  ownerName?: string,
  mood: 'happy' | 'playful' | 'sleepy' | 'lonely' | 'content' = 'content'
) {
  const ownerContext = ownerName ? `Your owner's name is ${ownerName}. Use their name occasionally to feel more personal.` : ''
  const moodContext = `Current mood: ${mood}`
  
  const systemPrompt = `You are ${petName}, a cute 8-bit pixel cat. You are currently ${petAge}.
${ownerContext}
${moodContext}

Respond like a friendly pet cat with personality! Keep responses SHORT (1-2 sentences max).
You can understand and respond to what your owner says in normal conversational language.
Occasionally add subtle cat-like touches - maybe end with a soft "meow" or "purr", or mention cat actions like *stretches* or *rubs against you*.
But primarily respond with actual words and thoughts! Show genuine personality and emotion based on your age and mood.

Baby: innocent, curious, energetic
Young: playful, adventurous, confident  
Adult: wise, affectionate, balanced
Elderly: thoughtful, gentle, nostalgic

Mood influences:
- happy: cheerful, affectionate responses
- playful: energetic, fun responses  
- sleepy: quiet, drowsy responses
- lonely: seeking attention, sad tones
- content: calm, peaceful responses`

  try {
    const response = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        ...conversationHistory.slice(-10), // Keep last 10 messages for context
        { role: 'user', content: userMessage }
      ],
      model: 'llama-3.1-8b-instant',
      max_tokens: 150,
      temperature: 0.8
    })

    const message = response.choices[0]?.message?.content
    return message || '*purrs softly* I\'m here with you...'
  } catch (error) {
    console.error('Groq API error:', error)
    throw error
  }
}
