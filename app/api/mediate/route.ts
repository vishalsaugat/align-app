import { NextRequest, NextResponse } from 'next/server';
import { createAzure } from '@ai-sdk/azure';
import { generateText } from 'ai';

export async function POST(req: NextRequest) {
  try {
    const { message, conversation, participants } = await req.json();

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // Build conversation context
    const conversationContext = conversation
      .map((msg: { sender: string; content: string }) => `${msg.sender}: ${msg.content}`)
      .join('\n');

    const prompt = `You are an AI mediator facilitating a conversation between ${participants.user} and ${participants.other}. Your role is to:

1. Help both parties communicate clearly and constructively
2. Translate emotional or confrontational language into neutral terms
3. Identify common ground and shared interests
4. Ask clarifying questions when needed
5. Keep the conversation focused on resolution
6. Remain completely neutral and fair to both sides

Previous conversation:
${conversationContext}

Latest message from ${participants.user}: "${message}"

Please provide a mediation response that:
- Acknowledges their message
- Clarifies or rephrases it in neutral terms if needed
- Guides the conversation toward understanding and resolution
- Asks follow-up questions to promote dialogue

Keep your response concise but thoughtful. Focus on moving the conversation forward constructively.`;

    const azure = createAzure({
      apiKey: process.env.AZURE_API_KEY,
      resourceName: process.env.AZURE_RESOURCE_NAME,
      apiVersion: process.env.AZURE_API_VERSION || '2025-01-01-preview',
      useDeploymentBasedUrls: true,
    });
    const result = await generateText({
      model: azure('gpt-5-chat'),
      prompt,
    });

    return NextResponse.json({
      response: result.text,
      success: true
    });

  } catch (error) {
    console.error('Error in mediation:', error);

    // Fallback response if AI fails  
    const fallbackResponse = `Thank you for sharing that perspective. I want to make sure both parties understand each other clearly. 

Could you help me understand what outcome you're hoping for from this conversation? And how do you feel about what was just shared?

Remember, the goal is to find a path forward that works for everyone involved.`;

    return NextResponse.json({
      response: fallbackResponse,
      success: true,
      fallback: true
    });
  }
}