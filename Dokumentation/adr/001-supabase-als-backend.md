# ADR-001: Verwendung von Supabase als Backend-as-a-Service

## Status
Accepted

## Kontext
Für das EN 13813 Compliance System benötigen wir eine skalierbare, sichere und wartungsarme Backend-Lösung. Die Anforderungen umfassen:
- Relationale Datenbank für komplexe Datenstrukturen
- Authentifizierung und Autorisierung
- Datei-Storage für PDFs und Dokumente
- Row-Level Security für Mandantenfähigkeit
- Echtzeit-Updates (optional)
- Schnelle Entwicklung und Deployment

## Entscheidung
Wir verwenden Supabase als Backend-as-a-Service (BaaS) Lösung.

## Begründung

### Evaluierte Optionen

#### Option 1: Custom Backend (Node.js + PostgreSQL)
**Pro:**
- Volle Kontrolle über Code und Infrastruktur
- Keine Vendor Lock-in
- Beliebige Anpassungen möglich

**Contra:**
- Hoher Entwicklungsaufwand
- Eigene Wartung und Sicherheitsupdates
- Komplexe DevOps-Anforderungen
- Höhere laufende Kosten

#### Option 2: Firebase
**Pro:**
- Bewährte Google-Lösung
- Gute Dokumentation
- Automatische Skalierung

**Contra:**
- NoSQL-Datenbank (Firestore) nicht optimal für relationale Daten
- Vendor Lock-in bei Google
- Limitierte SQL-Funktionalität
- Schwierige Migration

#### Option 3: Supabase (gewählt)
**Pro:**
- PostgreSQL als Basis (relationale Datenbank)
- Eingebaute Authentifizierung
- Row Level Security out-of-the-box
- Open Source und self-hostable
- TypeScript SDK
- Automatische API-Generierung
- Storage für Dateien integriert
- Günstige Preisstruktur

**Contra:**
- Relativ neue Plattform
- Kleinere Community als Firebase
- Einige Features noch in Beta

## Folgen

### Positive Folgen
- **Schnelle Entwicklung:** Auth, DB und Storage sofort verfügbar
- **Sicherheit:** RLS bietet granulare Zugriffskontrolle
- **Skalierbarkeit:** Automatische Skalierung bis Enterprise-Level
- **Developer Experience:** Gute TypeScript-Integration, lokale Entwicklung möglich
- **Kosten:** Kostenloser Tier für Entwicklung, faire Preise für Production

### Negative Folgen
- **Vendor Dependency:** Abhängigkeit von Supabase (gemildert durch Open Source)
- **Learning Curve:** Team muss RLS-Konzepte verstehen
- **Edge Functions Limits:** 10s Timeout könnte für komplexe Operationen limitierend sein

### Mitigationen
- **Exit-Strategie:** Da Supabase auf PostgreSQL basiert, ist Migration möglich
- **Backup-Plan:** Regelmäßige Datenbank-Backups außerhalb Supabase
- **Monitoring:** Verwendung von Vercel Analytics für zusätzliches Monitoring

## Technische Schulden
- Migration von Supabase Auth zu eigenem Auth-System wäre aufwändig
- RLS-Policies müssten bei Migration neu implementiert werden

## Referenzen
- [Supabase Documentation](https://supabase.com/docs)
- [PostgreSQL RLS Guide](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
- [Supabase vs Firebase Comparison](https://supabase.com/alternatives/supabase-vs-firebase)