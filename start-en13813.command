#!/bin/bash

# Zum Projektverzeichnis wechseln (Root)
cd "$(dirname "$0")"

# Terminal-Titel setzen
echo -ne "\033]0;EN13813 App\007"

# Farben für Ausgabe
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Willkommensnachricht
clear
echo "========================================="
echo -e "${BLUE}   EN13813 Compliance System${NC}"
echo "========================================="
echo ""

# Port definieren
PORT=3001

# Prüfen ob Node.js verfügbar ist
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js ist nicht installiert!${NC}"
    echo "Bitte installiere Node.js von: https://nodejs.org/"
    echo ""
    echo "Drücke Enter zum Beenden..."
    read
    exit 1
fi

echo -e "${GREEN}✓ Node.js Version: $(node --version)${NC}"

# In das Web-App Verzeichnis wechseln
cd apps/web

# Prüfe ob Port bereits belegt ist
if lsof -Pi :$PORT -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  Port $PORT ist bereits belegt${NC}"
    echo ""

    # Zeige welcher Prozess den Port belegt
    echo "Folgender Prozess verwendet Port $PORT:"
    lsof -i :$PORT | head -2
    echo ""

    echo "Möchtest du:"
    echo "1) Den laufenden Prozess beenden und neu starten"
    echo "2) Die App auf einem anderen Port starten (3002)"
    echo "3) Abbrechen"
    echo ""
    read -p "Wähle eine Option (1-3): " choice

    case $choice in
        1)
            echo -e "${YELLOW}Beende laufenden Prozess...${NC}"
            # Beende alle Prozesse auf dem Port
            lsof -ti:$PORT | xargs kill -9 2>/dev/null
            sleep 1
            echo -e "${GREEN}✓ Prozess beendet${NC}"
            ;;
        2)
            PORT=3002
            echo -e "${YELLOW}Verwende alternativen Port $PORT${NC}"
            ;;
        3)
            echo "Abgebrochen."
            exit 0
            ;;
        *)
            echo -e "${RED}Ungültige Auswahl. Abbruch.${NC}"
            exit 1
            ;;
    esac
fi

echo ""
echo -e "${YELLOW}📦 Überprüfe Dependencies...${NC}"

# Prüfe ob package.json existiert
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ package.json nicht gefunden!${NC}"
    echo "Aktuelles Verzeichnis: $(pwd)"
    exit 1
fi

# Prüfe welcher Package Manager verfügbar ist und installiere Dependencies
if command -v pnpm &> /dev/null; then
    echo -e "${GREEN}✓ Verwende pnpm${NC}"

    # Installiere Dependencies nur wenn nötig
    if [ ! -d "node_modules" ]; then
        echo -e "${YELLOW}Installiere Dependencies mit pnpm...${NC}"
        pnpm install
        if [ $? -ne 0 ]; then
            echo -e "${RED}❌ pnpm install fehlgeschlagen${NC}"
            exit 1
        fi
    else
        echo -e "${GREEN}✓ Dependencies bereits installiert${NC}"
    fi

    # Clear Next.js cache bei Problemen
    if [ -d ".next" ]; then
        echo -e "${YELLOW}🧹 Bereinige Next.js Cache...${NC}"
        rm -rf .next
    fi

    # Server starten
    echo ""
    echo -e "${GREEN}🚀 Starte Development Server auf Port $PORT...${NC}"
    echo -e "${GREEN}Die App wird unter http://localhost:$PORT verfügbar sein${NC}"
    echo ""
    echo -e "${BLUE}📌 Supabase-Instanz: fhftgdffhkhmbwqbwiyt${NC}"
    echo ""
    echo -e "${YELLOW}Zum Beenden: Ctrl+C drücken${NC}"
    echo "========================================="
    echo ""

    # Starte mit pnpm
    if [ "$PORT" != "3001" ]; then
        pnpm dev -- -p $PORT
    else
        pnpm dev
    fi

elif command -v npm &> /dev/null; then
    echo -e "${YELLOW}⚠️  Verwende npm (pnpm empfohlen für bessere Performance)${NC}"

    # Installiere Dependencies nur wenn nötig
    if [ ! -d "node_modules" ]; then
        echo -e "${YELLOW}Installiere Dependencies mit npm...${NC}"

        # Bereinige vorher
        rm -rf node_modules package-lock.json

        # Verwende npm mit force flag wegen der bekannten Probleme
        npm install --force
        if [ $? -ne 0 ]; then
            echo -e "${RED}❌ npm install fehlgeschlagen${NC}"
            echo "Empfehlung: Installiere pnpm mit: npm install -g pnpm"
            exit 1
        fi
    else
        echo -e "${GREEN}✓ Dependencies bereits installiert${NC}"
    fi

    # Clear Next.js cache bei Problemen
    if [ -d ".next" ]; then
        echo -e "${YELLOW}🧹 Bereinige Next.js Cache...${NC}"
        rm -rf .next
    fi

    # Server starten
    echo ""
    echo -e "${GREEN}🚀 Starte Development Server auf Port $PORT...${NC}"
    echo -e "${GREEN}Die App wird unter http://localhost:$PORT verfügbar sein${NC}"
    echo ""
    echo -e "${BLUE}📌 Supabase-Instanz: fhftgdffhkhmbwqbwiyt${NC}"
    echo ""
    echo -e "${YELLOW}Zum Beenden: Ctrl+C drücken${NC}"
    echo "========================================="
    echo ""

    # Starte mit npm
    if [ "$PORT" != "3001" ]; then
        npm run dev -- -p $PORT
    else
        npm run dev
    fi
else
    echo -e "${RED}❌ Kein Package Manager gefunden!${NC}"
    echo "Installiere npm oder pnpm"
    exit 1
fi

# Bei Beendigung
echo ""
echo -e "${GREEN}Server wurde beendet.${NC}"
echo "Drücke Enter zum Schließen..."
read