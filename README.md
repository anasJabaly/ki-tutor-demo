# KI Tutor · SYP-15

Anklickbarer lokaler Web-Prototyp mit Studierenden- und Dozierendenansicht. HTML/CSS/JavaScript mit ES-Modulen, ohne externe Pakete oder CDN. Node.js 20+ genügt.

## Start

Im Ordner `ki-tutor-prototyp`:

```sh
npm start
```

Im Browser: **http://127.0.0.1:5000**. Beenden mit Strg+C. Bei belegtem Port: `PORT=5050 npm start`. Nicht per Doppelklick auf `index.html` öffnen: ES-Module benötigen HTTP. `npm test` prüft die Fachlogik.

## Ausprobieren

1. Nutzungshinweis bestätigen. Aufgabe 1 bearbeiten und eine Demoantwort erhalten.
2. „Neuer Dialog“ öffnet einen unabhängigen Lösungsweg; Tabs wechseln und Dialoge wiederfinden, auch nach Neuladen.
3. Aufgabe 2 öffnen und einen eigenen Beitrag aus Aufgabe 1 als Kontext auswählen. Der Quell-Dialog wird gegen Löschen gesperrt. Fortschritt über „Als erledigt markieren“ selbst setzen.
4. Zu „Dozierende“ wechseln, Titel oder Markdown bearbeiten. Die Live-Vorschau folgt dem ungespeicherten Entwurf.
5. „Entwurf speichern“ klicken und zur Studierendenansicht wechseln: Der bisher veröffentlichte Stand bleibt sichtbar. Erst „Veröffentlichen“ schaltet den neuen Kursstand frei.
6. „Vorschau testen“ nutzt den aktuellen ungespeicherten Entwurf. Testdialoge verschwinden beim Schließen und werden nicht gespeichert.
7. Kurs als JSON exportieren/importieren. Import ersetzt nur den Entwurf und bewahrt gültige IDs; danach veröffentlichen. Nur eigene Demo-Exporte importieren, keine echten privaten Kursdaten.
8. „Dienstausfall simulieren“ sperrt das Eingabefeld. „Demo zurücksetzen“ löscht nach Bestätigung sämtliche lokalen Demodaten.

## Umsetzung und Grenzen

| Funktion | Status |
| --- | --- |
| Kurs → Kapitel → Aufgabe, feste Reihenfolge | Anklickbar; ein Kurs pro Instanz |
| Kapitel-Freigabe und Zeitfenster | Funktioniert lokal, nutzt aktuelle Gerätezeit |
| Aufgabenkarte, Einklappen, Markdown-Tabellen | Funktioniert; begrenzter sicherer Markdown-Renderer |
| Formeln | Als Text; kein mathematischer Renderer |
| Mehrere Dialoge, Export, Löschen | Funktioniert lokal mit stabilen UUIDs |
| Chat und fortlaufende Antwortanzeige | Vorgegebene sokratische Demoantworten; keine echte KI oder fachliche Bewertung |
| Fortschritt | Eigene Markierung; keine automatische LLM-Einstufung |
| Kontextübernahme | Maximal ein Beitrag aus festgelegter Aufgabe desselben Kapitels, Momentaufnahme und Löschsperre |
| Bewertungen, Fehler melden | Nur lokal; Meldung erfordert simulierte Dialogfreigabe, keine Übermittlung oder Dozierenden-Inbox |
| Aufgabeneditor, Zusatzkontext, Zeichenlimit, Kapitel-Zeitfenster | Funktioniert lokal |
| Entwurf / Veröffentlichung | Getrennte Browserstände; Veröffentlichung betrifft nur diesen Browser |
| Vorschau | Flüchtiger Demo-Dialog; prüft keine echte Prompt-Wirkung |
| Kursimport/-export | Öffentliche Demo-Inhalte; Schema-/ID-Prüfung, unbekannte/private Felder werden entfernt |
| Private Lösungshinweise und Referenzbilder | Bewusst deaktiviert, keine privaten Inhalte im Client |
| Bild-Uploads | Nur gekennzeichnete UI-Option; keine Dateiannahme |
| Auth, Rollenrechte, Plattform-Storage und LLM | Nicht implementiert; Rollenwechsel ist keine Authentifizierung |
| Analytics, Request-Payload-Vorschau und Debugging-Log | Nicht implementiert |
| Kurs-/Team-/Modell-/Prompteditor, Anlegen/Löschen und Drag & Drop | Nächster Ausbau; aktueller Editor bearbeitet bestehende Aufgaben und Freigaben |

Die Demo benutzt `localStorage` ausschließlich als lokale Ersatzimplementierung. Das ist eine bewusste Prototyp-Abweichung von der Vorgabe, persistente Daten nur im Plattform-Storage abzulegen. Keine Personen-/Nutzertrennung und kein Schutz zwischen Rollen. Keine Secrets oder echten privaten Lösungshinweise eingeben. Die Zustimmung ist nur ein lokaler Demo-Zeitstempel, kein produktiver Datenschutztext.

## Struktur

- `src/data.js`: Demo-Kurs, stabile IDs, Freigabelogik, Importvalidierung und Kontext-Löschsperre.
- `src/services.js`: getrennte Demo-Adapter für Auth, Storage und Tutor.
- `src/app.js`: Zustandswechsel und Interaktionen.
- `src/de.js`: deutsche Ansichtsvorlagen, Kerntexte und sicherer Markdown-Renderer. Einzelne Interaktionshinweise sind noch in `app.js`; vor weiteren Sprachen vollständig in einen Sprachkatalog auslagern.
- `src/styles.css`: responsive Gestaltung, Tastaturfokus und reduzierte Bewegung.
- `server.mjs`: minimaler lokaler statischer Server mit `/healthz`; keine produktive Backend-Implementierung.
- `tests/domain.test.mjs`: Tests zu Freigabe, Entwurfsisolation, Kontext, Import und HTML-Escaping.
- `ENTWICKLUNG.md`: Anbindung und nächste Schritte.

## Gelesene Grundlagen

Aus `/home/anas/Desktop/Uni/Bachelor_Technische_Informatik/5.Semester/SYP/_Daten an Gruppe/261006_Funktionale Beschreibung/`:

- `260928_Funktionale Beschreibung.md` – Kai Kreisköther, Version 0.02, 28.09.2026.
- `platform/PLATFORM.md`.
- `platform/examples/config.py`, `auth_example.py`, `storage_example.py`, `ai_example.py`.

Die Originale wurden nur gelesen. Der Fahrradverleih-Kurs ist selbst erstellter Beispielinhalt, keine Aufgabe des Professors. Die vorherige Chat-Vorschau enthält keinen abrufbaren visuellen Entwurf; die Gestaltung wurde neu erstellt.

## Online als Demo: GitHub Pages

1. Neues öffentliches GitHub-Repository erstellen, z. B. `ki-tutor-demo`.
2. Den **Inhalt** dieses Projektordners in das Repository hochladen: `index.html` und `src/` müssen direkt im Repository-Hauptverzeichnis liegen. `.nojekyll` ebenfalls übernehmen. Nicht den gesamten Uni-/SYP-Ordner hochladen.
3. Im Repository unter **Settings → Pages → Build and deployment** als Source **Deploy from a branch** wählen; Branch **main**, Ordner **/ (root)**, dann **Save**.
4. Nach erfolgreichem Deployment die unter Pages angezeigte Adresse öffnen: `https://DEIN-GITHUB-NAME.github.io/ki-tutor-demo/`.
5. Optional danach unter **Custom domain** eine eigene Subdomain wie `tutor.deine-domain.de` eintragen. Erst danach beim Domainanbieter einen CNAME-Eintrag für `tutor` auf `DEIN-GITHUB-NAME.github.io` setzen (ohne Protokoll und Repository-Pfad). Wenn verfügbar **Enforce HTTPS** aktivieren.

Diese Version enthält relative Asset-Pfade und funktioniert auch unter dem Repository-Unterpfad. GitHub Pages veröffentlicht nur die statischen Dateien; `server.mjs` läuft dort nicht. Jede Person erhält ihre eigenen Demo-Daten in ihrem Browser, keine gemeinsame Datenbank. Beim Wechsel von github.io auf eine eigene Domain werden die bisherigen lokalen Browserdaten nicht automatisch übernommen.

Nur die Demo veröffentlichen: Die spätere produktive Lehranwendung benötigt das Lumentic-Backend und kann nicht vollständig auf GitHub Pages betrieben werden.
