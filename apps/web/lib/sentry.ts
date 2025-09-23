/**
 * Sentry wrapper for EN13813 application
 * Re-exports the v10 compatible implementation
 */
export { sentryCapture } from "./sentry-v10";

// Re-export Sentry for direct usage if needed
export * as Sentry from "@sentry/nextjs";