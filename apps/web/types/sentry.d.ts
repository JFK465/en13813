declare global {
  interface Window {
    Sentry?: {
      captureException: (error: Error, context?: any) => void
      captureMessage: (message: string, level?: string) => void
      configureScope: (callback: (scope: any) => void) => void
      withScope: (callback: (scope: any) => void) => void
      setUser: (user: any) => void
      setContext: (key: string, context: any) => void
      addBreadcrumb: (breadcrumb: any) => void
    }
  }
}

export {}