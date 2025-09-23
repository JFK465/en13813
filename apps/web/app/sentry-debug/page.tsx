'use client';

import { useState, useEffect } from 'react';
import * as Sentry from '@sentry/nextjs';
import { Button } from '@/components/ui/button';

export default function SentryDebugPage() {
  const [sentryStatus, setSentryStatus] = useState<any>({});

  useEffect(() => {
    // Check Sentry configuration
    const client = Sentry.getCurrentHub().getClient();
    const options = client?.getOptions() || {};

    setSentryStatus({
      dsn: options.dsn || 'NOT CONFIGURED',
      environment: options.environment || 'NOT SET',
      isEnabled: !!client,
      tracesSampleRate: options.tracesSampleRate,
      release: options.release,
      clientDsn: process.env.NEXT_PUBLIC_SENTRY_DSN || 'NOT IN ENV',
    });
  }, []);

  const testSentry = async () => {
    try {
      // Test 1: Capture message
      Sentry.captureMessage('Debug Test Message from EN13813', 'info');

      // Test 2: Capture exception
      Sentry.captureException(new Error('Debug Test Error from EN13813'));

      // Test 3: Add breadcrumb
      Sentry.addBreadcrumb({
        message: 'Debug test breadcrumb',
        level: 'info',
        category: 'test'
      });

      // Force flush
      await Sentry.flush(2000);

      alert('Sentry tests sent! Check your Sentry dashboard.');
    } catch (error) {
      console.error('Sentry test failed:', error);
      alert('Sentry test failed! Check console.');
    }
  };

  const throwError = () => {
    throw new Error('Thrown Error Test for Sentry - EN13813');
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Sentry Debug Page</h1>

      <div className="bg-muted p-6 rounded-lg mb-6">
        <h2 className="text-xl font-semibold mb-4">Sentry Configuration Status</h2>
        <pre className="text-sm overflow-auto">
          {JSON.stringify(sentryStatus, null, 2)}
        </pre>
      </div>

      <div className="space-y-4">
        <Button onClick={testSentry} variant="default" className="w-full">
          Send Test Events to Sentry
        </Button>

        <Button onClick={throwError} variant="destructive" className="w-full">
          Throw Unhandled Error
        </Button>

        <Button
          onClick={() => {
            // @ts-ignore
            nonExistentFunction();
          }}
          variant="outline"
          className="w-full"
        >
          Call Undefined Function
        </Button>
      </div>

      <div className="mt-8 p-4 bg-yellow-100 dark:bg-yellow-900 rounded">
        <p className="text-sm">
          <strong>Debug Info:</strong> Check the browser console and Network tab for Sentry requests.
          Look for requests to ingest.sentry.io
        </p>
      </div>
    </div>
  );
}