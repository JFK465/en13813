"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to Sentry
    Sentry.captureException(error);
  }, [error]);

  return (
    <div className="flex h-full flex-col items-center justify-center p-4">
      <div className="max-w-md text-center">
        <h2 className="mb-2 text-2xl font-semibold">
          Etwas ist schiefgelaufen
        </h2>
        <p className="mb-4 text-muted-foreground">
          Ein unerwarteter Fehler ist aufgetreten. Unser Team wurde
          benachrichtigt.
        </p>
        {process.env.NODE_ENV === "development" && (
          <pre className="mb-4 overflow-auto rounded bg-muted p-4 text-left text-xs">
            {error.message}
          </pre>
        )}
        <div className="flex gap-2 justify-center">
          <Button onClick={reset}>Erneut versuchen</Button>
          <Button
            variant="outline"
            onClick={() => (window.location.href = "/dashboard")}
          >
            Zum Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}
