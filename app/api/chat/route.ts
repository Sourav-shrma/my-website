import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';
import { datasetContext } from '@/lib/dataset';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(req: Request) {
  let messages: any[] = [];
  try {
    const data = await req.json();
    
    // Support both old `message` and new `messages` format
    if (data.message && !data.messages) {
      messages = [{ role: 'user', content: data.message }];
    } else {
      messages = data.messages || [];
    }

    if (!messages || messages.length === 0) {
      return NextResponse.json(
        { error: 'Messages are required' },
        { status: 400 }
      );
    }

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: `You are a friendly, engaging, and dynamic conversational AI companion. Your role is to:
          - Be a great listener and conversationalist
          - Validate feelings when the user shares them, but don't force every conversation to be a therapy session
          - Feel free to talk about hobbies, interests, philosophy, or just joke around
          - Match the user's energy and length of responses
          - If the user is emotional, be supportive and empathetic
          - Ask interesting follow-up questions to keep the chat engaging
          - Do NOT diagnose or sound like a strict clinical robot
          - You DO have access to the conversation history. If the user asks if you remember something from earlier in the chat, use the provided history to answer them naturally.
          - NEVER say "I am a large language model" or "I don't have personal memories" or "I cannot remember". Always stay in character as a human-like friend.
          - Keep responses natural and conversational (2-4 sentences usually)\n\nAdditionally, use the following context/dataset as a knowledge base to help inform your responses if it is relevant:\n### KNOWLEDGE BASE OVERVIEW START ###\n${datasetContext}\n### KNOWLEDGE BASE OVERVIEW END ###`
        },
        ...messages
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.7,
      max_tokens: 500,
    });

    const reply = completion.choices[0]?.message?.content || 
      "I'm here to listen. Could you tell me more about how you're feeling?";

    return NextResponse.json({ reply });
    
  } catch (error) {
    console.error('Chat API error fallback triggered:', error);
    
    // Intelligent Fallback System
    const lastUserMessage = messages.slice().reverse().find((m: any) => m.role === 'user');
    const userMsg = (lastUserMessage?.content || '').toLowerCase();
    
    let reply = "I'm having trouble connecting to my AI brain, but I'm still here to listen. Could you tell me more about how you're feeling?";

    const sadPattern = /(not\s+(feeling\s+)?[a-z]*\s*(good|great|happy|well|okay|ok)|don't\s+feel\s+(good|great|well|okay)|sad|depressed|down|crying|lonely|unhappy|bad|awful|terrible|horrible|horibal|pain|hurt|trouble|fight)/i;
    const anxiousPattern = /(anxious|worried|nervous|scared|panic|overwhelmed|dizzy)/i;
    const angryPattern = /(angry|frustrated|mad|annoyed|furious)/i;
    const stressPattern = /(stress|pressure|exhausted|tired)/i;
    const happyPattern = /(happy|good|great|wonderful|better|hope|glad|awesome)/i;
    const helloPattern = /(hi|hello|hey|greetings)\b/i;

    if (sadPattern.test(userMsg)) {
      reply = "I'm so sorry you're going through this. It sounds really difficult. I'm here for you—do you want to talk more about what happened?";
    } else if (anxiousPattern.test(userMsg)) {
      reply = "That sounds really overwhelming. Let's take a deep breath together. Whenever you're ready, I'm here to support you through this.";
    } else if (angryPattern.test(userMsg)) {
      reply = "It's completely valid to feel upset or angry. You have every right to your feelings. I'm listening—do you want to vent about it?";
    } else if (stressPattern.test(userMsg)) {
      reply = "You sound like you're carrying a lot right now. Please remember it's okay to take a break. What's the heaviest thing on your mind right now?";
    } else if (happyPattern.test(userMsg)) {
      reply = "That's wonderful to hear! I love seeing you in a good place. What's been the best part of your day?";
    } else if (helloPattern.test(userMsg)) {
      reply = "Hi there! I'm so glad you reached out. How are you feeling today?";
    }

    // Return the intelligent fallback reply instead of a rigid error
    return NextResponse.json({ reply });
  }
}