import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

// Replace with your verify token
const VERIFY_TOKEN = process.env.VERIFY_TOKEN;
const phoneNumberId = process.env.PHONE_NUMBER_ID;

// Webhook verification endpoint (GET)
export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const mode = searchParams.get('hub.mode');
    const token = searchParams.get('hub.verify_token');
    const challenge = searchParams.get('hub.challenge');

    if (mode && token) {
      if (mode === 'subscribe' && token === VERIFY_TOKEN) {
        console.log('WEBHOOK_VERIFIED');
        return new NextResponse(challenge, { status: 200 });
      } else {
        return new NextResponse(null, { status: 403 });
      }
    } else {
      return new NextResponse(null, { status: 400 });
    }
  } catch (error) {
    console.error('Error in webhook verification:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

// Webhook message receiver endpoint (POST)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Handle incoming messages/events from WhatsApp
    console.log('Received webhook:', JSON.stringify(body, null, 2));

    // WhatsApp cloud API sends messages in body.entry[0].changes[0].value.messages
    const entry = body.entry && body.entry[0];
    const changes = entry && entry.changes && entry.changes[0];
    const value = changes && changes.value;
    const messages = value && value.messages;

    if (messages && messages[0]) {
      const from = messages[0].from; // phone number of sender
      const replyText = 'Hello from WhatsApp Business API!';

      // WhatsApp Cloud API endpoint and token
      const whatsappApiUrl = `https://graph.facebook.com/v23.0/${phoneNumberId}/messages`;
      const whatsappToken = process.env.ACCESS_TOKEN;

      if (!whatsappToken) {
        console.error('ACCESS_TOKEN not found in environment variables');
        return new NextResponse('Server configuration error', { status: 500 });
      }

      try {
        const response = await axios.post(
          whatsappApiUrl,
          {
            messaging_product: 'whatsapp',
            to: from,
            text: { body: replyText }
          },
          {
            headers: {
              'Authorization': `Bearer ${whatsappToken}`,
              'Content-Type': 'application/json'
            }
          }
        );
        console.log('Reply sent:', response.data);
      } catch (error) {
        console.error('Error sending reply:', error instanceof Error ? error.message : 'Unknown error');
        if (axios.isAxiosError(error) && error.response) {
          console.error('Axios error response:', error.response.data);
        }
      }
    }

    return new NextResponse(null, { status: 200 });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}