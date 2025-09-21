# Frontend-Dokumentation

## App-Struktur

### Routing (Next.js App Router)
```
app/
├── (auth)/                  # Authentifizierte Routen
│   ├── layout.tsx          # Auth-Layout mit Navigation
│   ├── dashboard/          # Dashboard
│   └── en13813/           # EN 13813 Features
│       ├── recipes/       # Rezepturverwaltung
│       ├── dops/          # Leistungserklärungen
│       ├── test-reports/  # Prüfberichte
│       └── batches/       # Chargenverwaltung
├── (public)/               # Öffentliche Routen
│   ├── login/             # Login-Seite
│   ├── register/          # Registrierung
│   └── forgot-password/   # Passwort zurücksetzen
└── api/                    # API Routes
```

### Layouts
```tsx
// app/(auth)/layout.tsx
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1">
        <Header />
        {children}
      </main>
    </div>
  );
}
```

### Feature-Slices
```
components/en13813/
├── RecipeForm.tsx           # Rezeptur-Formular
├── RecipeList.tsx           # Rezeptur-Liste
├── TestReportForm.tsx       # Prüfbericht-Formular
├── DOPGenerator.tsx         # DoP-Generator
├── BatchStatistics.tsx      # Chargen-Statistik
└── QCDashboard.tsx         # Quality Control Dashboard
```

## State-Management

### React Query (TanStack Query)
```typescript
// hooks/useRecipes.ts
export function useRecipes() {
  return useQuery({
    queryKey: ['recipes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('recipes')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    staleTime: 5 * 60 * 1000, // 5 Minuten
  });
}
```

### Zustand (Client State)
```typescript
// stores/uiStore.ts
interface UIStore {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const useUIStore = create<UIStore>((set) => ({
  sidebarOpen: true,
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  activeTab: 'overview',
  setActiveTab: (tab) => set({ activeTab: tab }),
}));
```

### Caching-Strategie
- **Stale-While-Revalidate:** Für Listen und nicht-kritische Daten
- **Cache-First:** Für statische Referenzdaten (EN 13813 Klassen)
- **Network-First:** Für kritische Daten (Prüfberichte, DoPs)

### Error-Handling
```tsx
// components/ErrorBoundary.tsx
export function ErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <ReactErrorBoundary
      FallbackComponent={ErrorFallback}
      onReset={() => window.location.reload()}
    >
      {children}
    </ReactErrorBoundary>
  );
}

// Global Error Handler
function ErrorFallback({ error, resetErrorBoundary }: ErrorFallbackProps) {
  return (
    <Alert variant="destructive">
      <AlertTitle>Ein Fehler ist aufgetreten</AlertTitle>
      <AlertDescription>{error.message}</AlertDescription>
      <Button onClick={resetErrorBoundary}>Erneut versuchen</Button>
    </Alert>
  );
}
```

## Forms & Validation

### React Hook Form + Zod
```typescript
// schemas/recipeSchema.ts
export const recipeSchema = z.object({
  name: z.string().min(3, 'Mindestens 3 Zeichen'),
  designation: z.string().regex(/^[A-Z]{2,3}-[A-Z]\d{1,2}-[A-Z]\d{1,2}$/),
  bindingAgent: z.object({
    type: z.enum(['CT', 'CA', 'CAF', 'SR']),
    amount: z.number().min(0).max(100),
  }),
  aggregates: z.array(z.object({
    name: z.string(),
    percentage: z.number(),
  })),
});

// components/RecipeForm.tsx
export function RecipeForm() {
  const form = useForm<RecipeFormData>({
    resolver: zodResolver(recipeSchema),
    defaultValues: {
      name: '',
      designation: '',
    },
  });

  const onSubmit = async (data: RecipeFormData) => {
    try {
      await createRecipe(data);
      toast.success('Rezeptur erfolgreich erstellt');
    } catch (error) {
      toast.error('Fehler beim Erstellen der Rezeptur');
    }
  };
}
```

### UX-Fehlermuster
- **Inline-Validierung:** Sofortiges Feedback bei Eingabe
- **Debounced Validation:** Verzögerte API-Validierung
- **Progressive Disclosure:** Schrittweise Formular-Komplexität
- **Undo/Redo:** Für kritische Aktionen

## Design-System

### Design Tokens
```css
/* styles/tokens.css */
:root {
  /* Colors */
  --primary: 220 14% 46%;
  --primary-foreground: 0 0% 100%;
  --secondary: 220 14% 96%;
  --destructive: 0 84% 60%;
  
  /* Spacing */
  --spacing-xs: 0.25rem;
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  --spacing-lg: 1.5rem;
  --spacing-xl: 2rem;
  
  /* Typography */
  --font-sans: 'Inter', system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', monospace;
}
```

### shadcn/ui Komponenten
```tsx
// Angepasste Button-Variante
const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input bg-background hover:bg-accent",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
    },
  }
);
```

## Performance-Guidelines

### Code-Splitting
```typescript
// Lazy Loading für große Komponenten
const PDFViewer = lazy(() => import('@/components/PDFViewer'));
const ChartComponent = lazy(() => import('@/components/ChartComponent'));

// Route-based Code Splitting (automatisch durch Next.js)
```

### LCP-Budget
- **Target:** < 2.5s
- **Optimierungen:**
  - Kritische CSS inline
  - Fonts preloaden
  - Images mit next/image optimieren
  - Server Components für statische Inhalte

### Bundle-Optimierung
```javascript
// next.config.js
module.exports = {
  experimental: {
    optimizePackageImports: ['lodash', 'date-fns'],
  },
  images: {
    formats: ['image/avif', 'image/webp'],
  },
};
```

## Accessibility (A11y)

### Fokus-Management
```tsx
// hooks/useFocusTrap.ts
export function useFocusTrap(ref: RefObject<HTMLElement>) {
  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const focusableElements = element.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    // Trap focus within element
  }, [ref]);
}
```

### ARIA-Labels
```tsx
<Button
  aria-label="Rezeptur löschen"
  aria-describedby="delete-confirmation"
  onClick={handleDelete}
>
  <TrashIcon aria-hidden="true" />
</Button>
```

### Kontrast-Anforderungen
- **Normal Text:** Mindestens 4.5:1
- **Large Text:** Mindestens 3:1
- **Interactive Elements:** Mindestens 3:1

### Keyboard-Navigation
- Alle interaktiven Elemente per Tab erreichbar
- Escape schließt Modals
- Enter/Space aktiviert Buttons
- Arrow Keys für Listen-Navigation

## Entwickler-Tools

### VS Code Extensions
- ESLint
- Prettier
- Tailwind CSS IntelliSense
- TypeScript Error Lens

### Browser DevTools
- React Developer Tools
- Supabase Inspector
- Accessibility Insights

### Debugging
```typescript
// utils/debug.ts
export const debug = {
  log: (label: string, data: any) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[${label}]`, data);
    }
  },
  table: (data: any) => {
    if (process.env.NODE_ENV === 'development') {
      console.table(data);
    }
  },
};