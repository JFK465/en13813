import { NextResponse } from 'next/server';

export async function GET() {
  // This will trigger an error that Sentry should catch
  throw new Error('API Test Error for Sentry - EN13813');

  // This line will never be reached
  return NextResponse.json({ message: 'This should not be returned' });
}