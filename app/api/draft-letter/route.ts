import { gateway, generateText } from 'ai'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const body = await request.json()
  const { instruction, letterType, employee, language, reference } = body

  if (!instruction?.trim()) {
    return NextResponse.json({ error: 'Add a short instruction for the draft.' }, { status: 400 })
  }

  const result = await generateText({
    model: gateway('openai/gpt-4o-mini'),
    system: 'You draft concise, formal official correspondence for a controlled government HR system. Never invent sensitive facts. Use only the supplied context. Return only the letter body, without markdown fences or commentary.',
    prompt: `Write a ${language || 'English'} official letter.
Letter type: ${letterType || 'Official correspondence'}
Employee: ${employee || 'Not provided'}
Reference: ${reference || 'Not provided'}
User instruction: ${instruction.trim()}`,
    temperature: 0.2,
  })

  return NextResponse.json({ text: result.text })
}
