import { NextResponse } from 'next/server';
import * as Sentry from '@sentry/nextjs';

export async function GET() {
  try {
    // Manually capture a test error
    const testError = new Error('Test error from API route - This should appear in Sentry!');

    // Log DSN status
    console.log('Sentry DSN configured:', !!process.env.NEXT_PUBLIC_SENTRY_DSN);
    console.log('Environment:', process.env.NODE_ENV);

    // Capture the error
    Sentry.captureException(testError, {
      tags: {
        test: true,
        source: 'api-route',
      },
    });

    // Also throw to test automatic capture
    throw testError;
  } catch (error) {
    // Log the error
    console.error('API Route Error:', error);

    return NextResponse.json(
      {
        message: 'Error triggered successfully!',
        sentryDsn: !!process.env.NEXT_PUBLIC_SENTRY_DSN,
        environment: process.env.NODE_ENV,
      },
      { status: 500 }
    );
  }
}