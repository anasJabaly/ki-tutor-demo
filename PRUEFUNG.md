# Prüfung am 12.10.2026

- Sechs Fachlogiktests bestanden (`node tests/domain.test.mjs`): Freigabe/Zeiträume, Entwurfsisolation, Kontext-Löschsperre/Momentaufnahme, Import mit stabilen IDs und Entfernen unbekannter Felder, ungültige Imports, HTML-Escaping/Markdown-Tabelle.
- Syntaxprüfung aller JavaScript-Module und des lokalen Servers bestanden.
- Browserprüfung: Onboarding, Demoantwort, Neuladen mit gespeicherten Dialogen, unabhängiger neuer Dialog, Kontextauswahl, wirksame Löschsperre, selbst gesetzter Fortschritt, Editor-Live-Vorschau, Entwurf speichern ohne sichtbare Studierendenänderung, Veröffentlichung mit sichtbarer Änderung und Vorschau-Dialog.
- Simulierter Dienstausfall: verständlicher Hinweis und gesperrte Eingabe; Fortsetzen funktioniert.
- Desktopprüfung bei 1366 Pixeln; Mobilprüfung bei 390 Pixeln für beide Ansichten. Kein horizontaler Seitenüberlauf nach Korrektur der Grid-Mindestbreite.
- Browser-Fehler-/Warnungsprotokoll bei den geprüften Abläufen leer.
- Screenshots in `screenshots/`. Browser-Testdaten bleiben ausschließlich im lokalen Browser und sind nicht Teil des ausgelieferten Beispielkurses.

Nicht geprüft/implementiert: reale Plattformdienste, echte Authentifizierung, echte KI-Antworten, Uploads, Produktionsdeployment, Analytics und vollständiger barrierefreier Audit. Kurs-Import/-Export fachlogisch validiert; Dateidialoge wurden nicht in der Browserprüfung durchlaufen.
