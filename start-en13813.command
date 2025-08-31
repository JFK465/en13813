#!/bin/bash

# Zum Projektverzeichnis wechseln
cd "$(dirname "$0")"

# Terminal-Titel setzen
echo -ne "\033]0;EN13813 App\007"

# Farben für Ausgabe
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Willkommensnachricht
echo "========================================="
echo "   EN13813 App wird gestartet..."
echo "========================================="
echo ""

# Port definieren
PORT=3001

# Prüfen ob pnpm installiert ist
if ! command -v pnpm &> /dev/null; then
    echo -e "${RED}❌ pnpm ist nicht installiert!${NC}"
    echo "Bitte installiere pnpm mit: npm install -g pnpm"
    echo ""
    echo "Drücke Enter zum Beenden..."
    read
    exit 1
fi

# Prüfe ob Port bereits belegt ist
if lsof -Pi :$PORT -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  Port $PORT ist bereits belegt${NC}"
    echo ""
    
    # Zeige welcher Prozess den Port belegt
    echo "Folgender Prozess verwendet Port $PORT:"
    lsof -i :$PORT
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
            # Beende alle Node Prozesse auf Port 3001
            lsof -ti:$PORT | xargs kill -9 2>/dev/null
            sleep 2
            echo -e "${GREEN}✓ Prozess beendet${NC}"
            ;;
        2)
            PORT=3002
            echo -e "${YELLOW}Verwende alternativen Port $PORT${NC}"
            ;;
        3)
            echo "Abgebrochen."
            echo "Drücke Enter zum Beenden..."
            read
            exit 0
            ;;
        *)
            echo -e "${RED}Ungültige Auswahl. Abbruch.${NC}"
            echo "Drücke Enter zum Beenden..."
            read
            exit 1
            ;;
    esac
fi

# Dependencies installieren falls nötig
echo -e "${YELLOW}📦 Installiere Dependencies...${NC}"
pnpm install

# Development Server starten
echo ""
echo -e "${GREEN}🚀 Starte Development Server auf Port $PORT...${NC}"
echo -e "${GREEN}Die App wird unter http://localhost:$PORT verfügbar sein${NC}"
echo ""
echo "Zum Beenden: Ctrl+C drücken"
echo "========================================="
echo ""

# Server starten mit gewähltem Port
cd apps/web
if [ "$PORT" != "3001" ]; then
    # Überschreibe den Port wenn nicht Standard
    pnpm next dev -p $PORT
else
    pnpm dev
fi

# Bei Beendigung
echo ""
echo "Server wurde beendet."
echo "Drücke Enter zum Schließen..."
read