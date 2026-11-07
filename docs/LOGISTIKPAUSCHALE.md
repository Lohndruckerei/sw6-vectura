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

1. **In Summe ist mehr als genug gedeckt.** Ein Aufschlag auf alles würde nur die Preise verschlechtern.
2. **Aluverbund subventioniert den Rest** (Deckung 18–27). Fällt die Alu-Kondition weg (223 Standard-Aufträge × 5,90 €
   = +1.316 € in 8 Monaten), sinkt die Gesamtdeckung von 3,1 auf etwa **2,3**. Das ist immer noch gedeckt, das Risiko ist kleiner als zunächst
   angenommen.
3. **Nur vier Verursacher liegen unter dem Ziel:** sperriger Hartschaum mittlerer Länge, Papier/Karton in großen
   Mengen, große Acrylplatten und Express. Genau dort gehört die Logistikpauschale hin, sonst nirgends.
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

### 3.2 Erlöse anrechnen (Einstellung)

`Ziel: Erlöse ≥ Kosten × (1 + Marge)`, Marge-Korridor **20–30 %**, Zielwert 25 %.

| Erlös | anrechnen? (Vorschlag) |
|---|---|
| Versandpauschale | **ja, 100 %**, anteilig nach Warenwert auf die Positionen |
| Verpackungszuschlag | **ja**: bei Dropshipping 100 % (der Lieferant verpackt), bei interner Produktion abzüglich eigener Verpackungskosten (Pauschale je Längenstufe, pflegbar) |
| Produktionszeit-Aufschlag | **anteilig** (Einstellung, z. B. 50 %) für den Verursacher Express. Der Rest ist Produktionsaufwand. |
| Logistikpauschale | ja (das ist das Stellglied) |

Ohne Anrechnung (Logistikpauschale deckt die Lieferantenkosten allein × 1,25) wären es im Schnitt **ca. 6,9 % auf
den Waren-EK**. Das zeigt der Vergleich, empfohlen ist es nicht.

### 3.3 Startvorschlag aus den Daten (Ziel 25 %, mit Anrechnung)

| Verursacher | Vorschlag Logistikanteil (VK, unsichtbar) | Form |
|---|---|---|
| Hartschaum/Stadur, längste Seite 1.200–2.449 mm | **ca. 2,10 €/m²** | gleitend ab 1.000 mm, voll ab 1.400 mm (kein Sprung) |
| Papier/Karton/Wabe in Mengen | **ca. 0,50 €/m²** ab 10 m² je Position | Mengenschwelle gleitend |
| Acryl ≥ 1.200 mm | **ca. 7 € je Position** (nur 5 Fälle → erst beobachten, Vorschlag mit Warnung „wenig Daten“) | je Position |
| Express (Eil, 48h, 24h) | **Mindestanteil je Position**, sodass Aufschlag + Anteil ≥ Service-EK × 1,25 (Eil 15 €, 48h 18,75 €, 24h 25 €), verteilt auf die Express-Positionen einer Bestellung | in der Produktionszeit-Option |
| alle anderen | **0** | – |

Bei 8 Monaten Volumen bringt das rund 390 € zusätzlich, dazu kommen die Express-Mindestanteile. Damit liegen die drei
Material-Brennpunkte bei etwa 1,25. Alle anderen Preise bleiben unverändert.

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

1. Anrechnung: Verpackungszuschlag bei Dropshipping wirklich zu 100 %? Welcher Anteil des
   Produktionszeit-Aufschlags gilt als Service-Erlös?
2. Zeitraum für Vorschläge: rollierend 3 Monate (Vorschlag) oder 6 Monate?
3. Sollen die sichtbaren Verpackungszuschläge gesenkt werden (Idee 3.5)?
4. GLS/DPD-Tarife der internen Produktion und Kosten der eigenen Verpackung je Längenstufe
