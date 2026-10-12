# Schrittweise zum echten Tutor

## 1. Fachmodell und Backend

Öffentliche Kursdaten und private Tutor-Daten strikt trennen. Der Browser erhält ausschließlich öffentliche DTOs. Private Lösungshinweise, Referenzbilder, Modell-Secrets und die zusammengesetzten Systemprompts liegen im Backend; nur berechtigte Dozierende dürfen sie über geschützte Editor-Endpunkte bearbeiten. Veröffentlichung erzeugt eine unveränderliche Revision und ein autorisiertes Audit-Ereignis. Gleichzeitige Änderungen mit Versionsnummer/ETag und Konfliktanzeige absichern.

Aktuell ist die Anwendung ein ausdrücklich lokaler Frontend-Prototyp. `PLATFORM.md` beschreibt FastAPI, Jinja2/HTML und uv; die Fachbeschreibung lässt die Architektur grundsätzlich frei. Vor Produktivarbeit Stack mit dem Betreuer abstimmen. Die ES-Module können auch aus FastAPI/Jinja2 ausgeliefert werden. Dann `main.py` und Paketdefinition im Projektroot anlegen, uv-Lockdatei pflegen, Coolify/Nixpacks konfigurieren und auf `0.0.0.0:5000` binden. Der Demo-Server bindet absichtlich nur lokal an `127.0.0.1`; er ersetzt das Plattform-Backend nicht.

## 2. Adapter ersetzen

| Schnittstelle | Lokal jetzt | Produktion |
| --- | --- | --- |
| Auth | Demo-Person / Ansichtsschalter | Identität aus von Traefik verifizierten `X-Auth-*`-Headern; Forward-Secret-Prüfung; serverseitige Rollenprüfung |
| Storage | `demoStorage.load/save/reset` | Backend ruft internen Storage mit App-Credentials und verifizierter Session auf; getrennte Kurs- und Personendaten |
| Tutor | `demoTutor.reply` mit festen Texten | Backend erstellt den vollständigen Prompt und Verlauf; Aufruf ausschließlich über internen AI-Proxy |

Serverseitige Prüfung von Zeichenlimit, Dateityp/-größe, Berechtigungen, CSRF und Pfaden ergänzen. Secrets ausschließlich aus Umgebungsvariablen. Kein direkter externer Provider-Aufruf im Browser. Keine eigene Benutzerverwaltung oder SQLite-Ablage.

Vorschlag für logische Objektschlüssel (mit Plattform-Team klären, ob gemeinsame Kursobjekte im aktuell beschriebenen personengebundenen Storage möglich sind):

```text
courses/{courseId}/draft.json
courses/{courseId}/published/{revisionId}.json
courses/{courseId}/published-head.json
people/{opaqueUserRef}/consent.json
people/{opaqueUserRef}/dialogs/{taskId}/{dialogId}.json
people/{opaqueUserRef}/progress.json
people/{opaqueUserRef}/context-index.json
```

Nutzerreferenzen niemals aus Browser-Eingaben übernehmen. Ein eigener Referenzindex soll spätere Löschsperren ohne Vollscan ermöglichen. IDs beim Import erhalten, referenzierte Aufgabenänderungen/-löschungen validieren. Bei einem vollständigen Kursimport ist festzulegen, wie verwaiste Dialoge behandelt werden.

## 3. Streaming-Widerspruch klären

Die Fachbeschreibung verlangt Streaming. `platform/PLATFORM.md` sagt ausdrücklich: **„Der AI-Proxy unterstützt kein Streaming!“** Die Beispiele senden vollständige Chat-Completions. Der Prototyp zeigt nur eine simulierte Wortausgabe; diese weist keine Streamfähigkeit der Plattform nach. Für Release 1 entweder auf die gesamte Antwort warten oder erst nach Plattformfreigabe echte Streaming-Unterstützung anbinden. Animierte Ausgabe einer fertigen Antwort nicht als echtes Streaming bezeichnen.

Ebenfalls unterscheiden sich die allgemeinen localhost-Grundsätze der Fachbeschreibung von den Docker-Servicenamen in `PLATFORM.md`. Für Deployment gelten die tatsächlich freigegebenen Upstream-URLs und die Container-Bindung; kein Client erhält diese Konfiguration.

## 4. Ausbau nach Releases

1. **Release 1:** Plattform-Auth/Storage/AI, serverseitige DTO-Trennung, vollständiger Kurs- und Prompteditor, feldweise Konfigurationsvererbung, Konfliktschutz, Import/Export, autorisierte Request-Vorschau, redigiertes Debugging, stabile Fehlerzustände und Integrations-/E2E-Tests. Markdown/Formel-Renderer vollständig ergänzen. Deployment und Healthcheck testen.
2. **Release 2:** geprüfte Uploads und Bildablage, private Referenzbilder mit Pflicht-Caption, serverseitige Kontext-Momentaufnahmen und Index. Prompt-Injection-Abwehr testen.
3. **Release 3:** technische Analytics-Ereignisse ohne Identität/Inhalte, ausschließlich aggregierte Dozierendenstatistik, Meldungsworkflow mit gezielter Einwilligung zur Dialogfreigabe und passenden Aufbewahrungs-/Löschregeln.

Produktiver Einsatz laut Unterlagen ab März 2027. Die Demo ist eine Grundlage für Oberfläche und Abläufe, keine Plattform- oder Sicherheitsimplementierung.
