# Contributing Guide

## Branch-Modell

### Branches
- `main` - Production-ready Code
- `develop` - Integration Branch
- `feature/*` - Neue Features
- `fix/*` - Bugfixes
- `hotfix/*` - Kritische Production-Fixes
- `chore/*` - Maintenance Tasks

### Git Flow
```bash
# Feature entwickeln
git checkout -b feature/EN-123-neue-funktion
git add .
git commit -m "feat(recipes): Add bulk import functionality"
git push origin feature/EN-123-neue-funktion
```

## Commit-Konvention

Wir nutzen [Conventional Commits](https://www.conventionalcommits.org/):

### Format
```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types
- `feat`: Neues Feature
- `fix`: Bugfix
- `docs`: Dokumentation
- `style`: Formatierung (keine Logik-Änderung)
- `refactor`: Code-Refactoring
- `perf`: Performance-Verbesserung
- `test`: Tests hinzufügen/ändern
- `build`: Build-System/Dependencies
- `ci`: CI/CD Konfiguration
- `chore`: Maintenance

### Beispiele
```bash
feat(dop): Add automatic CE marking generation
fix(auth): Resolve token refresh race condition
docs(api): Update endpoint documentation
perf(recipes): Optimize database queries with indexes
```

## PR-Prozess

### PR Template
```markdown
## Beschreibung
Kurze Zusammenfassung der Änderungen

## Art der Änderung
- [ ] Bugfix
- [ ] Neues Feature
- [ ] Breaking Change
- [ ] Dokumentation

## Testing
- [ ] Unit Tests bestehen
- [ ] Integration Tests bestehen
- [ ] Manuell getestet

## Checklist
- [ ] Code folgt den Style Guidelines
- [ ] Selbst-Review durchgeführt
- [ ] Dokumentation aktualisiert
- [ ] Keine Console-Logs
- [ ] Keine Secrets committed
```

### Review-Kriterien
1. **Funktionalität**: Löst die Änderung das Problem?
2. **Code-Qualität**: Lesbar, wartbar, DRY?
3. **Tests**: Ausreichende Coverage?
4. **Performance**: Keine Regressionen?
5. **Security**: Keine Vulnerabilities?

### CI-Checks (müssen grün sein)
- TypeScript Compilation
- ESLint
- Prettier
- Unit Tests
- Build

## Code-Style

### TypeScript
```typescript
// Strict Mode aktiviert
// Explizite Typen bevorzugen
interface RecipeData {
  id: string;
  name: string;
  designation: string;
}

// Keine any-Types
// Const Assertions nutzen
const STRENGTH_CLASSES = ['C5', 'C7', 'C12'] as const;
```

### React Components
```tsx
// Functional Components mit TypeScript
interface ButtonProps {
  variant?: 'primary' | 'secondary';
  onClick: () => void;
  children: React.ReactNode;
}

export function Button({ variant = 'primary', onClick, children }: ButtonProps) {
  return (
    <button className={cn('btn', `btn-${variant}`)} onClick={onClick}>
      {children}
    </button>
  );
}
```

### Imports
```typescript
// Absolute Imports nutzen
import { RecipeService } from '@/modules/en13813/services';
import { Button } from '@/components/ui/button';

// Gruppierte Imports
// 1. External packages
// 2. Internal modules
// 3. Components
// 4. Types
// 5. Styles/Assets
```

## Ordnerstruktur

```
apps/web/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Authenticated routes
│   ├── (public)/          # Public routes
│   └── api/               # API routes
├── components/
│   ├── ui/                # Basis UI-Komponenten
│   ├── en13813/           # Feature-spezifisch
│   └── reports/           # Report-Komponenten
├── modules/en13813/
│   ├── services/          # Business Logic
│   ├── types/             # TypeScript Types
│   └── constants/         # Konstanten
├── lib/                   # Utilities
├── hooks/                 # Custom Hooks
└── types/                 # Global Types
```

## Namenskonventionen

### Files & Folders
- **Components**: PascalCase (`RecipeForm.tsx`)
- **Services**: kebab-case mit .service (`recipe.service.ts`)
- **Utils**: camelCase (`formatDate.ts`)
- **Types**: kebab-case mit .types (`recipe.types.ts`)
- **Constants**: UPPER_SNAKE_CASE in Datei

### Variablen & Funktionen
```typescript
// Konstanten
const MAX_RETRY_ATTEMPTS = 3;

// Funktionen
function calculateStrengthClass(value: number): string { }

// React Hooks
function useRecipeData(id: string) { }

// Event Handler
const handleSubmit = (data: FormData) => { };
```

### Datenbank
- **Tabellen**: snake_case plural (`test_reports`)
- **Spalten**: snake_case (`created_at`)
- **Indizes**: idx_table_column (`idx_recipes_organization_id`)
- **Foreign Keys**: fk_table_reference (`fk_recipes_organization`)

## Issue-Labels

- `bug`: Fehler im System
- `enhancement`: Verbesserung
- `feature`: Neues Feature
- `documentation`: Doku-Updates
- `good first issue`: Einsteigerfreundlich
- `help wanted`: Hilfe benötigt
- `priority:high`: Hohe Priorität
- `priority:low`: Niedrige Priorität
- `wontfix`: Wird nicht behoben
- `duplicate`: Duplikat

## Release-Tagging

### Semantic Versioning
```
v<MAJOR>.<MINOR>.<PATCH>

v1.0.0 - Initial Release
v1.1.0 - Neues Feature
v1.1.1 - Bugfix
v2.0.0 - Breaking Change
```

### Release Notes Template
```markdown
## [1.2.0] - 2024-02-01

### Added
- Bulk import for recipes
- Export to Excel

### Changed
- Improved PDF generation performance

### Fixed
- Authentication token refresh

### Security
- Updated dependencies
```

## Testing Guidelines

### Unit Tests
```typescript
describe('RecipeService', () => {
  it('should calculate correct designation', () => {
    const result = calculateDesignation(mockData);
    expect(result).toBe('CT-C25-F4');
  });
});
```

### Integration Tests
- API Endpoints testen
- Datenbank-Interaktionen
- Auth-Flows

### E2E Tests
- Kritische User Journeys
- Cross-Browser Testing

## Dokumentation

- Code-Kommentare für komplexe Logik
- JSDoc für öffentliche APIs
- README für neue Module
- Architektur-Entscheidungen in ADRs

## Security

- Keine Secrets im Code
- Input-Validierung
- SQL Injection Prevention
- XSS-Schutz
- CSRF-Token
- Rate Limiting