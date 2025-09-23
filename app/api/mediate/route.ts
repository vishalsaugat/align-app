import { NextRequest, NextResponse } from 'next/server';
import { createAzure } from '@ai-sdk/azure';
import { generateText } from 'ai';
import { getToken } from 'next-auth/jwt';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const token = await getToken({ req });
    if (!token?.sub) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { message, conversation, participants, sessionId } = await req.json();

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    if (!participants?.user || !participants?.other) {
      return NextResponse.json({ error: 'Participant names are required' }, { status: 400 });
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

    // Create or update session in database
    const userId = parseInt(token.sub!);
    
    // Verify user exists before creating session
    const userExists = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });
    
    if (!userExists) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    const updatedMessages = [
      ...conversation,
      { role: 'user', content: message, sender: participants.user },
      { role: 'mediator', content: result.text, sender: 'AI Mediator' }
    ];

    let session;
    if (sessionId) {
      // Update existing session
      session = await prisma.mediationSession.update({
        where: { id: sessionId, userId },
        data: {
          messages: updatedMessages,
          updatedAt: new Date(),
        },
      });
    } else {
      // Create new session
      const title = `${participants.user} & ${participants.other}`;
      session = await prisma.mediationSession.create({
        data: {
          userId,
          title,
          participantUser: participants.user,
          participantOther: participants.other,
          messages: updatedMessages,
        },
      });
    }

    return NextResponse.json({
      response: result.text,
      sessionId: session.id,
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
      sessionId: null,
      success: true,
      fallback: true
    });
  }
}

export async function GET(req: NextRequest) {
  try {
    // Check authentication
    const token = await getToken({ req });
    if (!token?.sub) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = parseInt(token.sub!);
    
    // Verify user exists
    const userExists = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });
    
    if (!userExists) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    // Get all mediation sessions for the user
    const sessions = await prisma.mediationSession.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        title: true,
        participantUser: true,
        participantOther: true,
        createdAt: true,
        updatedAt: true,
        messages: true,
      },
    });

    return NextResponse.json({
      sessions,
      success: true
    });

  } catch (error) {
    console.error('Error fetching mediation sessions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sessions' },
      { status: 500 }
    );
  }
}