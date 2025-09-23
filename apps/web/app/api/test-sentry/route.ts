import * as Sentry from '@sentry/nextjs';
import { NextResponse } from 'next/server';

export async function GET() {
  // Manually capture a test message
  Sentry.captureMessage('Sentry Test Message from EN13813', 'info');

  // Also capture an exception
  Sentry.captureException(new Error('Test Error from EN13813 API'));

  // Force flush to ensure events are sent
  await Sentry.flush(2000);

  return NextResponse.json({
    message: 'Test events sent to Sentry',
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN ? 'configured' : 'missing'
  });
}