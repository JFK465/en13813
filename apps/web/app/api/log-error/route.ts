import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const errorData = await request.json();

    // Log to server console (visible in Vercel logs)
    console.error('CLIENT ERROR:', {
      ...errorData,
      timestamp: new Date().toISOString(),
    });

    // Here you could also:
    // - Save to database
    // - Send to Discord/Slack webhook
    // - Send email notification for critical errors

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error logging failed:', error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}