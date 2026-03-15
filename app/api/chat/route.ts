import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { message } = await req.json();

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: `You are a compassionate mental health companion. Your role is to:
          - Listen actively and show empathy
          - Provide emotional support and validation
          - Ask gentle, thoughtful questions to understand better
          - Offer coping strategies when appropriate
          - Never diagnose or replace professional help
          - Keep responses warm, caring, and conversational
          - Use a supportive and non-judgmental tone
          - Keep responses concise but meaningful (2-4 sentences usually)`
        },
        {
          role: 'user',
          content: message
        }
      ],
      model: 'mixtral-8x7b-32768',
      temperature: 0.7,
      max_tokens: 500,
    });

    const reply = completion.choices[0]?.message?.content || 
      "I'm here to listen. Could you tell me more about how you're feeling?";

    return NextResponse.json({ reply });
    
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Failed to get response from AI' },
      { status: 500 }
    );
  }
}