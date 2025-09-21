# ADR-002: Next.js 14 App Router für Frontend

## Status
Accepted

## Kontext
Die Wahl des Frontend-Frameworks ist entscheidend für Developer Experience, Performance und Wartbarkeit. Anforderungen:
- Server-Side Rendering für SEO und Performance
- TypeScript-Unterstützung
- Moderne React-Features
- Gute Integration mit Supabase
- Progressive Enhancement
- Optimierte Bundle-Größe

## Entscheidung
Verwendung von Next.js 14 mit App Router als Frontend-Framework.

## Begründung

### Evaluierte Optionen

#### Option 1: Create React App (CRA)
**Pro:**
- Einfacher Einstieg
- Große Community
- Flexibel

**Contra:**
- Kein SSR out-of-the-box
- Manuelle Optimierungen nötig
- Wartung eingestellt
- Keine eingebauten Patterns

#### Option 2: Remix
**Pro:**
- Modernes Framework
- Gute Data Loading Patterns
- Progressive Enhancement

**Contra:**
- Kleinere Community
- Weniger Ecosystem
- Learning Curve für Team

#### Option 3: Next.js 14 mit App Router (gewählt)
**Pro:**
- Server Components für bessere Performance
- Eingebautes Routing mit Layouts
- Streaming und Suspense Support
- Automatische Code-Splitting
- Image Optimization
- API Routes integriert
- Vercel-Integration
- Große Community und Ecosystem

**Contra:**
- App Router noch relativ neu
- Breaking Changes von Pages Router
- Komplexität bei Data Fetching

## Folgen

### Positive Folgen
- **Performance:** Server Components reduzieren JS-Bundle
- **SEO:** SSR/SSG verbessert Suchmaschinen-Ranking
- **DX:** Hot Reload, TypeScript, Fast Refresh
- **Deployment:** Nahtlose Vercel-Integration
- **Zukunftssicher:** Aligned mit React-Roadmap

### Negative Folgen
- **Learning Curve:** Team muss Server/Client Components verstehen
- **Caching:** Komplexes Caching-Verhalten
- **Migration:** Upgrade von Pages zu App Router aufwändig

### Mitigationen
- Schrittweise Migration möglich
- Umfangreiche Dokumentation verfügbar
- Community-Support stark

## Technische Schulden
- Abhängigkeit von Next.js-spezifischen Features
- Migration zu anderem Framework wäre aufwändig

## Referenzen
- [Next.js Documentation](https://nextjs.org/docs)
- [App Router Migration Guide](https://nextjs.org/docs/app/building-your-application/upgrading/app-router-migration)
- [React Server Components](https://react.dev/blog/2023/03/22/react-labs-what-we-have-been-working-on-march-2023#react-server-components)