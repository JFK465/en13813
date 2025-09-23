"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function SentryExamplePage() {
  const [isLoading, setIsLoading] = useState(false);

  const triggerError = () => {
    setIsLoading(true);
    // This will trigger a test error for Sentry
    throw new Error("Sentry Test Error - This is a test error from EN13813!");
  };

  const triggerUndefinedFunction = () => {
    setIsLoading(true);
    // @ts-ignore - Intentionally calling undefined function
    myUndefinedFunction();
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="max-w-md text-center space-y-6">
        <h1 className="text-3xl font-bold">Sentry Test Page</h1>
        <p className="text-muted-foreground">
          Click one of the buttons below to trigger a test error for Sentry
        </p>

        <div className="flex flex-col gap-4">
          <Button
            onClick={triggerError}
            disabled={isLoading}
            variant="destructive"
            size="lg"
          >
            Trigger Test Error
          </Button>

          <Button
            onClick={triggerUndefinedFunction}
            disabled={isLoading}
            variant="outline"
            size="lg"
          >
            Call Undefined Function
          </Button>
        </div>

        <p className="text-sm text-muted-foreground mt-8">
          After clicking, check your Sentry dashboard for the error
        </p>
      </div>
    </div>
  );
}