import { NextRequest, NextResponse } from 'next/server';
import { createAzure } from '@ai-sdk/azure';
import { generateText } from 'ai';
import { getToken } from 'next-auth/jwt';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    // Check authentication - temporarily disabled for testing
    const token = await getToken({ req });
    if (!token?.sub) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Mock token for testing - replace with real authentication later
    console.log('Mock token:', token);

    const { message, conversationHistory = [], sessionId } = await req.json();

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // Build the conversation context
    let systemPrompt = `You are a thoughtful conflict resolution assistant. Your role is to:

1. Help users structure their thoughts clearly about conflicts
2. Provide balanced perspective and ask clarifying questions
3. Suggest constructive approaches to resolve conflicts
4. Help them see multiple perspectives in the situation
5. Guide them through step-by-step thinking

Be empathetic, supportive, and ask follow-up questions to deepen understanding. Keep responses conversational and engaging.`;

    if (conversationHistory.length === 0) {
      // First message - provide initial analysis
      systemPrompt += `\n\nThis is the start of our conversation. Provide a thoughtful initial response that analyzes their situation and asks clarifying questions to understand it better.`;
    } else {
      // Continuing conversation - maintain context
      systemPrompt += `\n\nThis is a continuing conversation. Build upon what we've discussed and ask deeper questions or provide additional insights.`;
    }

    // Build messages array for conversation
    const messages = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory,
      { role: 'user', content: message }
    ];

    const azure = createAzure({
      apiKey: process.env.AZURE_API_KEY,
      resourceName: process.env.AZURE_RESOURCE_NAME,
      apiVersion: process.env.AZURE_API_VERSION || '2025-01-01-preview',
      useDeploymentBasedUrls: true,
    });
    
    const result = await generateText({
      model: azure('gpt-5-chat'),
      messages,
    });

    // Create or update session in database
    const userId = parseInt(token.sub!);
    
    console.log('User ID from token:', userId);
    const allUsers = await prisma.user.findMany();
    console.log('All users in DB:', allUsers);
    // Verify user exists before creating session
    const userExists = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });

    console.log('User exists:', userExists);
    
    if (!userExists) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    const updatedMessages = [
      ...conversationHistory,
      { role: 'user', content: message },
      { role: 'assistant', content: result.text }
    ];

    let session;
    if (sessionId) {
      // Update existing session
      session = await prisma.ventSession.update({
        where: { id: sessionId, userId },
        data: {
          messages: updatedMessages,
          updatedAt: new Date(),
        },
      });
    } else {
      // Create new session
      const title = message.length > 50 ? message.substring(0, 50) + '...' : message;
      session = await prisma.ventSession.create({
        data: {
          userId,
          title,
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
    console.error('Error in vent analysis:', error);

    // Fallback response if AI fails
    const fallbackResponse = `Thank you for sharing. While I'm having technical difficulties right now, here are some general reflection points:

**Key Questions to Consider:**
- What are the core facts vs. your interpretations?
- What emotions are influencing your perspective?
- What might the other person's viewpoint be?
- What outcome would be most constructive?

**Next Steps:**
- Take time to process your emotions
- Consider the other person's possible motivations
- Think about what you'd like to achieve
- Plan how to approach a calm conversation

I'm here to help you work through this. What specific aspect would you like to explore further?`;

    return NextResponse.json({
      response: fallbackResponse,
      sessionId: null,
      success: true,
      fallback: true
    });
  }
}

export async function GET() {
  try {
    // Check authentication - temporarily disabled for testing
    // const token = await getToken({ req });
    // if (!token?.sub) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }
    
    // Mock token for testing - replace with real authentication later
    const token = { sub: '1' };

    const userId = parseInt(token.sub!);
    
    // Test if Prisma types are working
    const sessions = await prisma.ventSession.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        title: true,
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
    console.error('Error fetching vent sessions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sessions' },
      { status: 500 }
    );
  }
}