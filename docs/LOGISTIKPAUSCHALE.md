# Logistikpauschale (Modell D) – Vorschläge

Stand: 07.11.2026 · Entscheidung: **Modell D** · Datenbasis: 500 Comdatek-Aufträge vom 17.03. bis 06.11.2026

## 1. Entschieden (07.11.2026)

- Die **Versandpauschale bleibt** (DE 11,90 €, AT 17,90 €). Der **Verpackungszuschlag** nach der längsten Seite wird
  sichtbar aufgeschlagen.
- Die **tatsächlichen Versand- und Servicekosten** werden ausgewertet. Sie kommen aus Lieferanten-XML, Versandmails
  oder dem **Rechnungsabgleich im Workflow-Plugin** (manuell oder automatisch, nur wenn keine andere Quelle sie liefert).
- **Mensura** schlägt auf Basis der Vectura-Daten eine **Logistikpauschale** vor, verteilt auf eine oder mehrere
  Optionen, und rechnet sie bei Bedarf in den VK ein. Ziel ist **im Schnitt 20–30 % Marge** auf die Versand- und
  Servicekosten. **Der Kunde bemerkt die Logistikanteile nicht.**
- Liefer-Countdown und Terminplanung: **Modul „Termine“ in Vectura** ([TERMINE.md](TERMINE.md)).
- **Getrennt rechnen** (Entscheidung vom 07.11.2026): Versandpauschale und Verpackungszuschlag werden **nicht** auf
  die Lieferantenkosten angerechnet. Sie decken die eigene Abwicklung, Verpackung und Gemeinkosten. Die
  **Logistikpauschale allein** deckt die Versand- und Servicekosten der Lieferanten × 1,20–1,30.

## 2. Was die Daten sagen

| Kennzahl (500 Aufträge, 8 Monate) | Wert |
|---|---:|
| Versand- und Servicekosten Comdatek | **4.236,80 €** |
| davon Grundpaket (5,90 € je Paket) | 1.821,00 € |
| davon Sperrgut-Zuschläge | 1.694,10 € |
| davon Express-Services (Eil 12 €, 48h 15 €, 24h 20 €) | 721,70 € |
| Erlös Versandpauschale (geschätzt) | 5.950,00 € |
| Erlös Verpackungszuschlag (geschätzt) | 7.098,70 € |
| **Deckung mit Pauschale + Verpackung** | **3,08** (= 208 % Marge) |
| Deckung nur mit Pauschale | 1,40 (= 40 % Marge) |
| Aufträge einzeln unter dem Ziel 1,25 | 83 (17 %), Lücke zusammen 1.139 € |
| Deckung je Monat | 2,1 (Sep.) bis 3,8 (Mai) |

**Deckung je Verursacher** (Pauschale anteilig nach Warenwert, Verpackung und Sperrgut auf die Position mit der
längsten Seite, Express nach Fläche):

| Verursacher | Aufträge | Kosten | Erlös Pauschale + Verpackung | Deckung | Lücke zu 1,25 |
|---|---:|---:|---:|---:|---:|
| Aluverbund (alle Längen) | 245 | 330 € | 7.000 € | **18–27** | – |
| Hartschaum/Stadur **1.200–2.449 mm** | 27 | 1.011 € | 1.090 € | **1,08** ⚠ | 174 € |
| Hartschaum/Stadur < 1.200 / ≥ 2.450 mm | 50 | 760 € | 1.279 € | 1,92 / 1,36 | – |
| Papier/Karton/Wabe < 1.200 mm (große Mengen, viele Pakete) | 26 | 427 € | 358 € | **0,84** ⚠ | 175 € |
| Acryl 1.200–2.449 mm (wenige Fälle) | 5 | 183 € | 191 € | **1,05** ⚠ | 37 € |
| Acryl, PS/PVC, Magnet, Folie, Banner, Hohlkammer | 151 | 1.100 € | 2.300 € | 1,6–3,5 | – |
| Eilproduktion ≥ 1 m² / 24h Express | 24 | 575 € | 584 € | **0,98–1,08** ⚠ | ohne Produktionszeit-Aufschlag gerechnet |

**Erkenntnisse:**

> Die Deckungswerte in dieser Tabelle rechnen Pauschale und Verpackung an. Nach der Entscheidung „getrennt rechnen“
> dienen sie nur zur Information. Steuergröße ist die Logistik-Deckung (Abschnitt 3.2/3.3).

1. **Mit Pauschale und Verpackung ist in Summe mehr als genug gedeckt.** Diese Erlöse bleiben aber für die eigene
   Abwicklung reserviert (getrennte Rechnung).
2. **Aluverbund subventioniert den Rest** (Deckung 18–27). Fällt die Alu-Kondition weg (223 Standard-Aufträge × 5,90 €
   = +1.316 € in 8 Monaten), sinkt die Gesamtdeckung von 3,1 auf etwa **2,3**. Das ist immer noch gedeckt, das Risiko ist kleiner als zunächst
   angenommen.
3. **Die Kosten sind sehr ungleich verteilt:** sperriger Hartschaum mittlerer Länge, Papier/Karton in großen Mengen,
   große Acrylplatten und Express kosten weit überdurchschnittlich, Aluverbund fast nichts. Darum wird die
   Logistikpauschale nach Verursachern verteilt und nicht gleichmäßig auf alles.
4. Bei Express fehlt in der Rechnung noch der Erlös aus dem Produktionszeit-Aufschlag (je m²). Mit ihm ist Express
   ab etwa 1–2 m² gedeckt, bei kleinen Positionen nicht.
5. **Noch nicht in den Daten:** interne Produktion (GLS/DPD), eigene Verpackung, andere Lieferanten und
   **Mehrquellen-Bestellungen**. Die Zahlen gelten nur für Comdatek-Dropshipping.

## 3. Vorschlag: verursachergerechte Logistikpauschale

### 3.1 Kosten zerlegen, Verursachern zuordnen (Vectura)

Jede Ist-Kostenposition wird in **Kostenarten** zerlegt und dem **Verursacher** zugeordnet:

| Kostenart | Erkennung | Verursacher → Mensura-Option |
|---|---|---|
| Grundversand | Paketpreis je Lieferant (Comdatek 5,90 €, intern GLS-Tarif) | **Material** (Aluverbund: 0) |
| Paketmenge | Vielfache des Paketpreises bei großen Mengen | **Material × Menge/Fläche** (Papier, Karton, Etiketten) |
| Sperrgut | Rest nach Abzug Grund + Express, bzw. Lieferantenregel (Länge, Gurtmaß, Gewicht) | **Material × längste Seite** |
| Express-Service | Service des Lieferanten (Eil, 48h, 24h) | **Produktionszeit** |
| Mehrquellen | zweite und weitere Sendung derselben Bestellung | **Material/Quelle**, das die zweite Sendung auslöst (z. B. Folie intern + Platte Comdatek) |
| Ausland | Zone AT | über die AT-Pauschale, nicht versteckt |

### 3.2 Getrennte Rechnung (entschieden)

`Ziel: Logistikanteile (VK) ≥ Lieferanten-Versand- und Servicekosten × (1 + Marge)`, Korridor **20–30 %**, Zielwert
25 %, je Verursacher und im Schnitt.

| Erlös | zählt für die Logistik-Deckung? |
|---|---|
| Versandpauschale | **nein**: eigene Abwicklung, Gemeinkosten, eigener Versand |
| Verpackungszuschlag | **nein**: eigene Verpackung, Kantenschutz |
| Produktionszeit-Aufschlag | **nein**: Produktionsaufwand; Express-Services der Lieferanten trägt der Logistikanteil der Produktionszeit-Option |
| Logistikanteil (unsichtbar) | **ja**, das ist das Stellglied |

Das Dashboard zeigt beide Sichten nebeneinander: **Logistik-Deckung** (Steuergröße, Ziel 1,20–1,30) und
**Gesamt-Deckung** inklusive Pauschale und Verpackung (nur zur Information, heute 3,1).

### 3.3 Startvorschlag aus den Daten (Ziel 25 %, getrennt gerechnet)

Bedarf gesamt: 4.237 € × 1,25 = **5.296 € in 8 Monaten (ca. 660 €/Monat)**. Das sind im Schnitt **6,9 % auf den
Waren-EK** (76.562 €), verursachergerecht verteilt aber sehr ungleich:

**a) Grundanteil je Material** (Grundpaket 5,90 € je Paket, nach Warenwert verteilt)

| Material | % vom Waren-EK | oder €/m² | Bemerkung |
|---|---:|---:|---|
| Aluverbund (auch kaschiert) | 0,34 % | 0,16 € | praktisch 0, solange Comdatek frei liefert |
| Folie / Etiketten | 2,82 % | 0,43 € | |
| Hohlkammer | 4,76 % | 0,27 € | wenig Daten (5) |
| Papier / Karton / Wabe | 5,19 % | 0,44 € | plus Mengenanteil, siehe b) |
| Banner / Textil | 6,04 % | 1,21 € | |
| Hartschaum / Stadur | 6,82 % | 1,60 € | plus Sperrgut, siehe b) |
| Acryl | 7,24 % | 4,19 € | |
| PS / Hart-PVC | 8,46 % | 1,37 € | viele kleine Pakete |
| Magnet | 12,0 % | 4,88 € | schwer, kleine Flächen |

**b) Sperrgut- und Mengenanteil je Material × längste Seite** (nur die Position mit der längsten Seite verursacht ihn)

| Verursacher | €/m² | je Position | Fälle | Form |
|---|---:|---:|---:|---|
| Hartschaum/Stadur 1.200–2.449 mm | **11,63 €** | 36,19 € | 27 | Rampe 1.000 → 1.400 mm |
| Hartschaum/Stadur ≥ 2.450 mm | 8,39 € | 35,24 € | 9 | Rampe weiterführen, kein zweiter Sprung |
| Hartschaum/Stadur < 1.200 mm | 0,94 € | 2,36 € | 41 | |
| Acryl 1.200–2.449 mm | 17,77 € | 29,77 € | 5 | wenig Daten → je Position, beobachten |
| Banner / Textil 1.200–2.449 mm | 6,90 € | 18,61 € | 16 | gerollt; Canvas-Ausreißer gekappt |
| Papier / Karton / Wabe < 1.200 mm (Mengen) | 0,46 € | 6,32 € | 26 | Mengenschwelle gleitend ab ca. 10 m² |
| Magnet < 1.200 mm | 0,87 € | 1,18 € | 15 | |

**c) Expressanteil je Produktionszeit-Option** (Lieferanten-Service × 1,25)

| Comdatek-Service (Produktionszeit) | je Bestellung | je Position | €/m² | Vorschlag |
|---|---:|---:|---:|---|
| Eilproduktion (3 AT) | 15,00 € | 6,29 € | 2,37 € | €/m² mit **Mindestbetrag 15 € je Bestellung**, verteilt auf deren Express-Positionen |
| 48h Express (2 AT) | 18,30 € | 6,93 € | 1,61 € | dito, Minimum 18,75 € |
| 24h Express (1 AT) | 22,70 € | 15,61 € | 4,18 € | dito, Minimum 25 € |

Das Minimum je Bestellung ist wichtig: 6 der 11 Aufträge mit 24h Express waren unter 1 m². Ein reiner €/m²-Satz
würde sie nicht decken.

**Wirkung:** Mit a) + b) + c) liegt jeder Verursacher bei etwa 1,25, im Schnitt 5.296 € statt 4.237 €. Aluverbund bleibt
praktisch unverändert. Teurer werden vor allem großer Hartschaum, Acryl, Magnet, PS/PVC und Express-Aufträge.

**Plausibilitätsprüfung vor Übernahme:** Für jeden Verursacher zeigt Mensura den Anteil am VK (z. B. „Hartschaum 5 mm,
1.500 × 1.000: Grund 2,40 € + Sperrgut 17,45 € = +x % auf den VK“). Liegt er über einer Schwelle (Vorschlag 15 % des VK), wird gewarnt.
So sticht kein Preis im Wettbewerbsvergleich auffällig heraus. Ab dieser Schwelle ist eher ein Angebot oder
ein sichtbarer Sperrgutzuschlag die ehrlichere Lösung.

**Vergleich (verworfen): mit Anrechnung** von Pauschale und Verpackung wären heute nur Hartschaum 1.200–2.449 mm
(ca. 2,10 €/m²), Papier/Karton in Mengen (ca. 0,50 €/m²), Acryl ≥ 1.200 mm (ca. 7 €/Position) und Express nötig
gewesen, ca. 390 € in 8 Monaten.

### 3.4 Unsichtbar machen: Regeln für Mensura

1. **Keine eigene Zeile.** Die Logistik steckt im Grundpreis bzw. im **Aufpreis der Option**, die sie verursacht. Die
   Aufpreis-Hinweise im Konfigurator („+ 12,40 €“) enthalten sie bereits, damit die Summe für den Kunden immer
   aufgeht.
2. **Gleitend statt Sprung.** Keine Stufe „ab 1.200 mm + 30 €“, die beim Vergleich zweier Formate auffällt.
   Stattdessen €/m² mit linearer Rampe über einen Längenbereich.
3. **Reihenfolge im Rechenweg:** Grundpreis → Optionen → **Logistikanteile** → Mindestpreis → Kundengruppen-Aufschlag
   → Rundung. Kleine Aufträge mit Mindestpreis behalten so ihren Anteil, und Gewerbe zahlt verhältnismäßig mit.
4. **Überall gleich:** Produktseite, Preismatrix (Menge × Lieferzeit), Warenkorb und Schnappschuss nutzen dieselbe
   Rechnung, sonst entstehen Abweichungen, die auffallen.
5. **Nie nach außen:** Die Store-API und der Payload `ldMensura` enthalten nur den Gesamtpreis. Die Zeile „Logistik“
   sieht man nur im Admin-Rechenweg und im Schnappschuss, mit eigenem Recht (`ld_mensura.logistics`).
6. **Preise stabil halten:** Ein Vorschlag gilt erst, wenn der Korridor **zwei Zeiträume hintereinander** verlassen
   wird (Hysterese). Höchstens ±1 €/m² bzw. ±2 Prozentpunkte je Anpassung. Übernahme nur per Klick mit gültig-ab.

### 3.5 Weitere Ideen aus den Daten

- **Sichtbare Gebühren senken statt verstecken.** Die Verpackungszuschläge bringen allein 7.099 € bei
  4.237 € Gesamtkosten. Ein günstigerer sichtbarer Verpackungszuschlag, z. B. bis 1.000 mm halbiert, wäre ein
  Wettbewerbsargument. Fehlende Deckung käme dann gezielt über die unsichtbare Logistik. Der Vectura-Simulator rechnet
  das vorher über die Altbestellungen durch.
- **Aluverbund als Zugpferd:** Bei Aluverbund-Bestellungen ist die Deckung so hoch, dass z. B. „Verpackung gratis ab
  250 € Warenwert“ nur bei Aluverbund-Bestellungen (oder „versandkostenfrei ab …“) ohne Risiko möglich wäre.
- **Ausreißer kappen:** Einzelaufträge wie Canvas mit 195 € Versand verzerren €/m²-Vorschläge. Im Vorschlag werden
  Kosten oberhalb des 95. Perzentils je Verursacher gekappt und als „Sonderfall – besser per Angebot“ gemeldet.
- **Frühwarnung:** Liegt ein Monat unter 1,2 (wie September mit 2,1 gesamt, Hartschaum deutlich tiefer), meldet das
  Dashboard, welcher Verursacher es war. Ein Vorschlag kommt aber erst nach der Hysterese.
- **Schätzung gegen Ist:** Jede Bestellung hat eine Vectura-Schätzung und später den Ist-Wert. Die Abweichung je
  Lieferant zeigt, wann die EK-Regeln nachgeschärft werden müssen.

## 4. Ist-Kosten erfassen (Vectura)

Neue Tabelle `ld_vectura_shipping_cost`: Bestellung, Sendung (optional), Lieferant/Quelle, Kostenart (Grund,
Paketmenge, Sperrgut, Express, Mehrquellen, sonstiges), Betrag netto, **Herkunft** und Beleg.

| Herkunft | Rang | Wie |
|---|---|---|
| Workflow-Rechnungsabgleich | 1 (endgültig) | `POST /api/_action/ld-vectura/cost` bzw. `ShippingCostService::record()`; ersetzt Werte niedrigeren Rangs |
| Lieferanten-Datei / Portal (Comdatek „Zusatzkosten“, XML) | 2 | Parser je Lieferant (LieferLotse-Eingang) |
| Versandmail | 3 | soweit Beträge enthalten |
| Vectura-Schätzung | 4 | aus EK-Regeln beim Bestellabschluss |

Je Bestellung gilt immer der Wert mit dem höchsten Rang. Die Deckung zeigt an, wie viel davon schon „Ist“ ist
(z. B. „82 % Ist-Kosten, 18 % geschätzt“).

## 5. Schnittstelle Vectura ↔ Mensura

| Richtung | Was |
|---|---|
| Mensura → Vectura | Schnappschuss je Position enthält **Logistikanteil (VK)** und **Produktionszeit-Aufschlag** getrennt. Nur so kann Vectura die Erlösseite messen. |
| Vectura → Mensura | Admin-API `GET /api/_action/ld-vectura/logistics/suggestions?from=&to=`: je Verursacher (Material-`key`, Längenbereich, Mengenschwelle, Produktionszeit-Schlüssel) Ist-Kosten, Erlöse, Deckung, **Vorschlag** (Form, Wert, Rampe), Datenmenge, Warnungen |
| Mensura (Admin) | Karte **„Logistikanteil“** an Kalkulation, Material und Optionswert: Form (% / €/m² / € je Stück / € je Position, Rampe von–bis mm, Mengenschwelle), Wert, gültig-ab; Hinweis „Vorschlag aus Vectura: 2,10 €/m² (Deckung 1,08 → 1,25)“ mit **Übernehmen** und Vorschau („Hartschaum 5 mm, 1.500 × 1.000: +3,15 € unsichtbar“) |
| ohne Vectura | Mensura läuft weiter, der Logistikanteil wird von Hand gepflegt |

Kopplung lose: Mensura ruft die Vorschläge nur ab, wenn Vectura installiert ist. Material-Schlüssel und
Produktionszeit-Schlüssel sind die gemeinsame Sprache, ohne Fremdschlüssel.

## 6. Reihenfolge

| Schritt | Plugin | Inhalt |
|---|---|---|
| 1 | Vectura | `ld_vectura_shipping_cost` + Import der Comdatek-Auswertung (500 Aufträge) als Startdaten |
| 2 | Vectura | Zerlegung nach Kostenarten/Verursachern, Deckungs-Heatmap (Material × Längenbereich), Simulation |
| 3 | Mensura | Logistikanteil an Kalkulation/Material/Optionswert, Rechenweg-Schritt, Schnappschuss-Felder, Recht |
| 4 | Vectura + Mensura | Vorschlags-API, Karte „Vorschlag übernehmen“, Hysterese |
| 5 | Workflow (künftig) | Rechnungsabgleich schreibt Ist-Kosten (Rang 1) |

## 7. Offene Fragen

1. ~~Anrechnung~~ → **getrennt rechnen** (07.11.2026).
2. Warnschwelle Logistikanteil am VK (Vorschlag 15 %)? Ab wann sichtbarer Sperrgutzuschlag oder Angebot?
3. Zeitraum für Vorschläge: rollierend 3 Monate (Vorschlag) oder 6 Monate?
4. Sollen die sichtbaren Verpackungszuschläge gesenkt werden (Idee 3.5)?
5. GLS/DPD-Tarife der internen Produktion und Kosten der eigenen Verpackung je Längenstufe
