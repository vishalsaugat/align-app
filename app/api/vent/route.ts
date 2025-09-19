import { NextRequest, NextResponse } from 'next/server';
import { createAzure } from '@ai-sdk/azure';
import { generateText } from 'ai';

export async function POST(req: NextRequest) {
  try {
    const { message } = await req.json();

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const prompt = `You are a thoughtful conflict resolution assistant. A user has shared their thoughts about a conflict they're experiencing. Your role is to:

1. Help them structure their thoughts clearly
2. Identify potential biases or emotional reactions that might cloud their judgment
3. Provide balanced perspective on the situation
4. Suggest constructive ways to approach the conflict
5. Help them see both sides of the situation

Please provide a thoughtful, empathetic analysis that helps them gain clarity. Be supportive but also gently challenge any obvious biases or one-sided thinking.

User's thoughts:
"${message}"

Please provide your analysis in a clear, structured format with sections like:
- Key Points Summary
- Emotional Patterns & Biases to Consider  
- Different Perspectives
- Constructive Next Steps`;

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
      analysis: result.text,
      success: true
    });

  } catch (error) {
    console.error('Error in vent analysis:', error);

    // Fallback response if AI fails
    const fallbackAnalysis = `Thank you for sharing your thoughts. While I'm having technical difficulties providing a full AI analysis right now, here are some general reflection points:

**Key Reflection Questions:**
- What are the core facts vs. your interpretations?
- What emotions are driving your perspective?
- What might the other person's viewpoint be?
- What outcome would be most constructive for everyone?

**Next Steps to Consider:**
- Take some time to process these emotions
- Consider the other person's possible motivations
- Think about what you'd like to achieve from resolving this
- Plan how you might approach a calm conversation

Remember: Conflicts often involve misunderstandings that can be resolved through clear, empathetic communication.`;

    return NextResponse.json({
      analysis: fallbackAnalysis,
      success: true,
      fallback: true
    });
  }
}