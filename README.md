# WebAR-Demo (MindAR + A-Frame)

Richtest du die Handykamera auf den Zettel, winkt das Strichmännchen, und der rote Punkt wird zur Kugel und hüpft vom Blatt.

## Am Handy anschauen

Voraussetzung: Handy und Mac sind im selben WLAN, und Node.js ist am Mac installiert.

Alle Befehle im Terminal im Projektordner ausführen (in VS Code: **Terminal → Neues Terminal**).

1. **Abhängigkeiten installieren** (einmalig):
   ```
   npm install
   ```

2. **Zertifikat erzeugen** (einmalig). Die Kamera funktioniert im Handy-Browser nur über HTTPS:
   ```
   npm run cert
   ```

3. **Server starten:**
   ```
   npm run https
   ```
   Das Terminal offen lassen. Beim Start listet der Server seine Adressen auf. Die Adresse mit der WLAN-IP merken, z. B. `https://192.168.1.23:8443` (nicht die mit `127.0.0.1`).

4. **Zettel bereitlegen.** Am Mac `https://localhost:8443/target.html` öffnen und den Zettel entweder ausdrucken oder einfach am Bildschirm stehen lassen.

5. **Am Handy die Adresse aus Schritt 3 öffnen**, z. B. `https://192.168.1.23:8443`.
   - Der Browser warnt vor dem selbstsignierten Zertifikat. Das ist hier in Ordnung:
     - iPhone (Safari): **Details einblenden → diese Website öffnen**
     - Android (Chrome): **Erweitert → Weiter zu …**
   - Den Kamerazugriff erlauben.

6. **Kamera auf den Zettel richten.** Der ganze Zettel samt buntem Rand sollte im Bild sein.

Server beenden: im Terminal `Ctrl+C`.

## Wenn es nicht klappt

| Problem | Lösung |
| --- | --- |
| Seite lädt am Handy nicht | Prüfen, ob beide Geräte im selben WLAN sind (kein Gäste-WLAN). Fragt macOS, ob `node` eingehende Verbindungen annehmen darf: erlauben. |
| Kamera bleibt schwarz oder es kommt keine Abfrage | Adresse muss mit `https://` beginnen. Kamerazugriff in den Browser-Einstellungen für die Seite erlauben und neu laden. |
| Zettel wird nicht erkannt | Näher herangehen, bis der Zettel den Großteil des Bildes füllt. Auf gutes Licht achten und Spiegelungen am Bildschirm vermeiden. |
| Seite bleibt beim Laden hängen | Die Bibliotheken kommen aus dem Internet; das Handy braucht also eine Internetverbindung. |

## Nur am Mac testen (Webcam)

```
npm start
```

Dann `http://localhost:8080` öffnen und den ausgedruckten Zettel in die Webcam halten. Hier ist kein Zertifikat nötig.

## Dateien

- `index.html`: die AR-Szene
- `js/show.js`: Strichmännchen und Ablauf der Animation
- `target.html`: Zettel zum Anzeigen und Drucken
- `assets/`: Zettel-Bild und die Tracking-Datei `targets.mind`
- `tools/`: Scripts zum Neuerzeugen des Zettels (`npm run build:target`)

Der bunte Rand des Zettels ist nötig: MindAR erkennt ein Bild nur, wenn es viele kontrastreiche Ecken und Kanten hat.
