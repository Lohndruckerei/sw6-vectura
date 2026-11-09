# Liefertermin, Countdown und Terminplanung (Vorschlag)

Stand: 07.11.2026 · Status: **Ort entschieden: Modul „Termine“ in Vectura**; Details noch Vorschlag; gehört zu [KONZEPT.md](KONZEPT.md) und [UMSETZUNG.md](UMSETZUNG.md)

## 1. Anforderung

- Der Kunde sieht zur gewählten Produktionszeit einen **wahrscheinlichen Liefertermin** und einen **Countdown**:
  Bis wann müssen Bestellung **und Druckdaten** da sein, damit dieser Termin gilt?
- Nach einer bestimmten Uhrzeit (Annahmeschluss) zählt automatisch der **nächste Werktag** als erster
  Produktionstag. Das soll sichtbar sein.
- Produktionszeiten von **10 bis 0,5 Arbeitstagen** + Laufzeit. Welche davon möglich sind, bestimmt der
  **Lieferant bzw. die interne Produktion**, z. B. intern 0,5 AT bei Eingang bis 11:00 Uhr mit Versand am selben Tag.
  Nicht jeder Lieferant bietet das an.
- Nach Eingang und Annahme schickt das **Workflow-Plugin** (künftig) eine **Terminbestätigung**. Bei Rückfragen,
  Fehlern oder fehlenden Daten **verschiebt sich der Termin automatisch**. Ausgelöst wird das vom Workflow-Plugin.

## 2. Wo bauen? Drei Varianten

| Variante | Vorteile | Nachteile |
|---|---|---|
| **In Mensura** | Produktionszeit wird dort schon gewählt und bepreist; Annahmeschluss, Arbeitstage und Feiertage gibt es dort bereits | Mensura kennt keine Versandquellen, Laufzeiten und Länder; Artikel ohne Konfigurator fallen heraus; Termin-Änderungen nach der Bestellung passen nicht zu einem Konfigurator |
| **In Vectura** ✅ | Versandquellen (intern, Comdatek …), Laufzeit je Zone, Carrier und Zustelltermin liegen ohnehin hier; ein Kalender für alles | Vectura wird größer; deshalb als **eigenes, klar abgegrenztes Modul** (`Schedule`) mit eigener API und eigenen Events bauen, damit es sich später herauslösen lässt |
| **Eigenes Plugin** (z. B. *Tempus* oder *Terminus*) | klare Zuständigkeit „Zeit“, Workflow-Plugin spricht nur mit ihm | Versandquellen, Laufzeiten und Kalender müssten doppelt gepflegt oder über ein drittes Plugin geteilt werden; mehr Kopplung, mehr Abstimmung |

**Empfehlung: Modul „Termine“ in Vectura**, als `src/Schedule/` mit eigener Store-API, eigenen Events und eigener
Admin-Seite. Aufgabenteilung:

| Plugin | Zuständig für |
|---|---|
| **Mensura** | Auswahl und **Preis** der Produktionszeit (Aufschlag je m², Mindestaufschlag); zeigt die Termine an, die Vectura liefert |
| **Vectura · Termine** | **Was ist möglich, und wann kommt es an:** Produktionsprofile je Versandquelle, Annahmeschluss, Kalender, Laufzeit, Countdown, Termin je Sendung, Terminverlauf nach der Bestellung |
| **Workflow-Plugin** (künftig) | Annahme, Terminbestätigung, Rückfragen; ruft `hold` / `resume` / `reschedule` auf und versendet Mitteilungen bei Terminänderung |
| **Druckdaten-Freigabe** (künftig) | meldet „Druckdaten fehlen / fehlerhaft / freigegeben“ → `hold` / `resume` |

Mensura behält seine eigene Terminberechnung als **Rückfall**, wenn Vectura nicht installiert ist. Ist Vectura da,
fragt Mensura über ein Interface (`DeliveryScheduleProviderInterface`) nach Terminen und verfügbaren
Produktionszeiten. Damit stimmen Konfigurator, Warenkorb und Bestellung immer überein.

## 3. Datenmodell (Erweiterung der Versandquelle)

| Entity | Felder |
|---|---|
| `ld_vectura_calendar` | Name, Arbeitstage (Mo–Fr, optional Sa), Feiertage (Bundesland, z. B. Bayern) + Betriebsruhe; je Quelle zuweisbar (intern: Nürnberg/Bayern; Comdatek: NRW) |
| `ld_vectura_production_profile` | Quelle, Schlüssel (`0.5`, `1`, `2` … `10`), Produktionstage, **Annahmeschluss** (z. B. 0,5 AT → 11:00, sonst 11:30), **Versandschluss** (gleicher Tag versandfertig bis …), Lieferanten-Service (Comdatek: Standard/Eil/48h/24h), Grenzen (max. Stück, max. m², Materialien, max. Länge), aktiv |
| Quelle (vorhanden) | Kalender, Laufzeit je Zone `{min, max}`, Carrier-Abholzeit |
| `ld_vectura_schedule` | je Bestellung und Sendungsgruppe: zugesagte Termine (Start, Versand, Zustellung von–bis), aktueller Plan, Status (`planned`, `confirmed`, `on_hold`, `rescheduled`, `shipped`), Verlauf (wer, wann, warum, alter/neuer Termin) |

Die **Produktionszeiten im Shop** ergeben sich aus den Profilen der Quelle(n) einer Position. Gibt es für eine
Position nur Lieferanten ohne 0,5 AT, wird 0,5 AT nicht angeboten bzw. mit Grund ausgegraut („nur bis 50 Stück“,
„bei diesem Material nicht möglich“). Mensura-Optionswerte vom Typ `delivery` werden den Profil-Schlüsseln zugeordnet.

## 4. Rechenregel

```
Bezugszeit       = jetzt (Europe/Berlin) – Bestellung UND Druckdaten müssen da sein
Produktionsstart = heute, wenn Arbeitstag und Bezugszeit < Annahmeschluss des Profils,
                   sonst nächster Arbeitstag der Quelle
Versandtag       = Produktionsstart + Produktionstage Arbeitstage (Kalender der Quelle)
                   Ausnahme 0,5 AT: Versand am Starttag (gleicher Tag), sofern vor Versandschluss
Zustellung       = Versandtag + Laufzeit {min, max} je Zone in Arbeitstagen des Carriers
                   (Feiertage am Zielort, z. B. AT: noch offen, Frage 6)
Countdown        = Annahmeschluss heute − jetzt (nur wenn heute noch gilt; sonst Countdown bis
                   Annahmeschluss des nächsten Arbeitstags und Hinweis „ab jetzt zählt Montag“)
Sendung          = späteste Position der Quelle
Bestellung       = späteste Sendung – nur Gesamtinfo und Rückfall; Lieferanten bekommen den Termin ihrer Positionen
```

Versandtag je Produktionszeit bei Produktionsstart Mo (vor Annahmeschluss, keine Feiertage):

| Produktionszeit | Versandtag |
|---|---|
| 0,5 AT | Mo (gleicher Tag, Ausnahme) |
| 1 AT | Di |
| 2 AT | Mi |
| 5 AT | Mo der Folgewoche |

Beispiel intern, Folie 0,5 AT, Annahmeschluss 11:00, Laufzeit DE 1 AT:
Bestellung Mo 10:20 → Countdown 40 min → Versand Mo → Zustellung Di. Bestellung Mo 11:05 → Start Di → Versand Di →
Zustellung Mi. Zum Vergleich 1 AT, Annahmeschluss 11:30: Bestellung Mo 11:05 → Start Mo → Versand Di → Zustellung Mi.

## 5. Anzeige im Shop (Storefront-Theme, Frontend-Bereich)

- **Konfigurator / Produktseite:** je Produktionszeit eine Kachel bzw. Zeile mit **Datum** („Zustellung Di 10.11.“),
  Aufschlag und Verfügbarkeit; darüber der **Countdown** „Bestellen und Druckdaten hochladen in **01:14:32** –
  dann kommt Ihre Bestellung am **Dienstag, 10.11.**“.
- **Zeitleiste:** Bestellung → Produktion → Versand → Zustellung als kleiner Balken/Kalender; Wochenende und Feiertage
  grau; nach Ablauf springt die Anzeige sichtbar auf den nächsten Werktag (kurzer Hinweis statt stiller Änderung).
- **Warenkorb/Checkout:** Termin je Sendung, Hinweis wenn Positionen auf die langsamste warten; Countdown auch hier.
- **Technik:** Die Store-API liefert `serverNow`, `deadline` (ISO, mit Zeitzone) und die Termine. Das JS zählt nur
  herunter (gegen `serverNow` korrigiert, damit falsche Uhren beim Kunden nichts verfälschen) und lädt beim Ablauf
  neu. Termine rechnet nur der Server.
- **Nach der Bestellung:** Konto zeigt den aktuellen Termin und, falls verschoben, den Grund in Kundensprache
  („Wir warten auf Ihre Druckdaten“).

## 6. Termin nach der Bestellung

| Ereignis (kommt vom Workflow- bzw. Druckdaten-Plugin) | Wirkung |
|---|---|
| `confirm(orderId)` – Annahme | zugesagter Termin wird fest; Event `vectura.schedule.confirmed` → Terminbestätigung (Workflow-Plugin, bis dahin Flow Builder) |
| `hold(orderId, reason)` – Rückfrage, fehlende/fehlerhafte Daten | Uhr steht; Status `on_hold`; Anzeige „Termin hängt von Ihrer Antwort ab“ |
| `resume(orderId, at)` – Antwort/Daten da | Produktionsstart neu nach Annahmeschluss-Regel ab `at`, gleiche Produktionstage; neuer Termin + Verlauf; Event `vectura.schedule.changed` |
| `reschedule(orderId, dates, reason)` – manuell (Maschinenausfall, Lieferant meldet Verzug) | neuer Termin + Verlauf; Event `vectura.schedule.changed` |
| Sendung erfasst (Abschnitt Sendungen) | Status `shipped`, tatsächlicher Versandtag; Zustellung aus Laufzeit |

- Neue Termine werden an **LieferLotse** weitergegeben, wenn noch nicht beim Lieferanten bestellt; sonst nur Hinweis
  im Admin. Maßgeblich für einen Lieferanten ist der Termin **seiner Positionen** (`payload.ldDeliveryDate`);
  LieferLotse verwendet diesen **vor** dem Bestelltermin. `ld_delivery_date` der Bestellung setzt
  Vectura auf den spätesten Termin, nur als Gesamtinfo und Rückfall für Positionen ohne eigenen Termin.
- Admin-API für das Workflow-Plugin: `POST /api/_action/ld-vectura/schedule/{orderId}/{confirm|hold|resume|reschedule}`
  sowie PHP-Service `ScheduleService`. Rechte: `ld_vectura.schedule`.

## 7. Einordnung in den Fahrplan

| Schritt | Inhalt |
|---|---|
| 3 (erweitert) | Kalender, Produktionsprofile je Quelle, Termin-Rechnung, Store-API `schedule` (Beispielfälle im Vertrag) |
| 3F | Countdown und Zeitleiste im Konfigurator/Warenkorb (Frontend); Mensura fragt Vectura nach Terminen (kleiner Schritt in Mensura) |
| 5 (erweitert) | `ld_vectura_schedule` mit Verlauf, `confirm/hold/resume/reschedule`, Events für Terminbestätigung/-änderung |
| Workflow-Plugin | ruft die Termin-API auf und versendet Bestätigung/Änderung |

## 8. Offene Fragen

1. Annahmeschluss je Produktionszeit: 0,5 AT bis 11:00, alle anderen bis 11:30? Gilt er für Bestellung **und**
   Druckdaten (Vorschlag: ja, Start erst mit vollständigen Daten)?
2. Welche Profile hat welcher Lieferant (Comdatek 5/3/2/1 AT, interne Produktion 0,5–10 AT …), mit welchen Grenzen?
3. Samstag als Produktions- oder Zustelltag?
4. Wenn Positionen einer Bestellung unterschiedliche Produktionszeiten haben: gemeinsam versenden (Standard) oder
   Teillieferung anbieten?
5. Soll der Kunde bei einem verschobenen Termin aktiv zustimmen müssen (z. B. bei Express-Aufschlag → Erstattung)?
6. Gelten für die Laufzeit die Feiertage am **Zielort** (z. B. AT, andere Bundesländer) oder nur die des Kalenders
   der Quelle bzw. des Carriers?
