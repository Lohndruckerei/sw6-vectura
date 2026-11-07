# Vectura – Versand-, Verpackungs- und Servicekosten (Konzept)

Stand: 07.11.2026 · Status: **Modell D entschieden** (Details und Vorschläge: [LOGISTIKPAUSCHALE.md](LOGISTIKPAUSCHALE.md)),
Termine als Modul in Vectura ([TERMINE.md](TERMINE.md)); weitere offene Punkte in Abschnitt 9

> **Entscheidungen vom 07.11.2026:** Die Versandpauschale bleibt, der Verpackungszuschlag wird sichtbar aufgeschlagen.
> Die tatsächlichen Versand- und Servicekosten (XML, Mail, Rechnungsabgleich im Workflow-Plugin) werden ausgewertet.
> Mensura schlägt daraus eine **unsichtbare Logistikpauschale** je Option vor und rechnet sie ein (Ziel: 20–30 % Marge).
> **Getrennt gerechnet:** Pauschale und Verpackung decken die eigene Abwicklung, die Logistikpauschale allein die
> Lieferantenkosten.
> Liefer-Countdown und Terminplanung werden als Modul „Termine“ in Vectura gebaut.

*Vectura* (lat. „Fracht, Fuhrlohn“) ist der Arbeitsname. Weitere Namen stehen in Abschnitt 10.
Technisch: Plugin `LdVectura`, Namespace `Lohndruckerei\Vectura`, Tabellen `ld_vectura_*`,
Admin-Präfix `lv-`.

---

## 1. Kurzfassung

1. **Eigenes Plugin, das Shopware erweitert, aber nicht ersetzt.** Versandarten, Länder, Regeln,
   `order_delivery` und Sendungsnummern bleiben Shopware-Standard. Vectura berechnet nur den **Betrag**
   (Kundenpreis), zeigt ihn aufgeschlüsselt an und rechnet intern die **Einkaufskosten je
   Lieferant** mit. Weder LieferLotse (enthält bewusst keine Preise) noch Mensura (rechnet nur je
   Position, nicht je Bestellung und Sendung) sind der richtige Ort dafür. Beide bekommen nur kleine,
   lose gekoppelte Ergänzungen.
2. **Die Produktionszeit bleibt ein Preisbestandteil des Produkts (Mensura, Aufschlag je m²).** Sie ist
   keine Versandart. „24h Express“ als Versandart entfällt. Stattdessen zeigt der Shop einen
   **Zustelltermin**: Fertigstellung + Laufzeit je Versandquelle und Land. Eine echte
   Zustelloption („bis 10 Uhr“) gibt es höchstens als Zusatzservice mit klaren Bedingungen.
3. **Empfehlung Kundenpreis: Modell D „Pauschale + Logistikpauschale“** (Abschnitt 5). Für den Kunden
   bleibt alles wie bisher: 11,90 € je Bestellung (AT 17,90 €) und Verpackung nach der längsten Seite.
   Die tatsächlichen Lieferanten-Versandkosten rechnet Vectura aus den Bestellungen eines Zeitraums
   zurück und schlägt daraus eine **Logistikpauschale je Materialgruppe** vor, mit Zielmarge, z. B. 25 %.
   Mensura rechnet sie unsichtbar in den Artikelpreis ein. Ein Dashboard prüft laufend, ob Kosten und
   Marge gedeckt sind.
4. **Comdatek hat eindeutige Regeln**, sie sind auf connect.comdatek.de veröffentlicht (Abschnitt 3).
   Die Auswertung von 250 echten Aufträgen bestätigt sie. Nicht vorhersagbar sind nur die
   Sperrgutzuschläge bei Hartschaum, Leichtschaum und Canvas. Die Kosten dafür rechnet Vectura
   **geschätzt** mit und gleicht sie mit den Ist-Kosten ab.
5. **Sendungen und Sendungsnummern** (Comdatek-XML, Versandmails von GLS, UPS, DHL und DPD) sammelt Vectura in
   einer eigenen Tabelle und schreibt sie in die Shopware-Lieferung. **Mitteilungen an den Kunden**
   verschickt bis zum Workflow-Plugin der Shopware Flow Builder, danach das Workflow-Plugin.

---

## 2. Ist-Stand lohndruckerei.eu (Shopware 5, ausgelesen am 07.11.2026)

### 2.1 Versand und Verpackung

Quelle: `/versand-und-zahlungsbedingungen`, Sonderartikel „Versand“.

| Fall | Kundenpreis netto |
|---|---|
| Versand DE (versichert, ohne Inseln), je Bestellung | **11,90 €** |
| Versand Österreich | ab **17,90 €**, Überlängen/-größen **69,00 €** |
| Inselzuschlag | „eventuell“, kein Betrag veröffentlicht |
| Versand Folie an zusätzliche Adresse | eigener Artikel je weiterer Adresse |
| Verpackung mit Kantenschutz | je Bestellung, nach der **längsten Seite** des größten Schilds |

| Längste Seite bis | Verpackung |   | Längste Seite bis | Verpackung |
|---|---:|---|---|---:|
| 499 mm | 0,00 € |   | 1300 mm | 23,00 € |
| 500 mm | 7,00 € |   | 1400 mm | 24,00 € |
| 900 mm | 15,00 € |   | 1500 mm | 27,00 € |
| 1000 mm | 17,00 € |   | 2000 mm | 31,90 € |
| 1100 mm | 21,00 € |   | 2500 mm | 36,00 € |
| 1200 mm | 21,90 € |   | 3000 mm | 40,00 € |

> Die Tabelle ist nicht eindeutig: „bis 499 mm 0 €“ und „bis 500 mm 7 €“ lassen die Stufen 501–899 mm
> offen. In Vectura wird sie als **ab-Tabelle** gepflegt (ab 500 mm 7 €, ab 900 mm 15 € …). Das muss
> bestätigt werden.

### 2.2 Produktionszeit (Variante „Produktionszeit“, Aufschlag je m²)

Die Produktionszeit ist als Variante angelegt, ihr Aufschlag rechnet je m² auf die Fläche der Position
(mindestens 1 m²). Ausgelesen über den Flächenrechner, Basis jeweils die längste Produktionszeit:

| Produktionszeit | Aluverbund (ab 1 m² 40 €/m²) | Weiße Folie mit Druck (13,65 €/m²) |
|---|---:|---:|
| 5 AT | Basis | Basis |
| 4 AT | **+4,00 €/m²** | **+4,00 €/m²** |
| 3 AT | **+7,00 €/m²** | **+5,00 €/m²** |
| 2 AT | **+11,00 €/m²** | **+7,00 €/m²** |
| 1 AT | – | **+8,00 €/m²** |
| 0,5 AT | – | **+10,00 €/m²** |

- Annahmeschluss 11:30 Uhr. Angezeigt wird „Geplante Lieferung bei Einzelversand“ = Fertigstellung
  + **1 Arbeitstag** (Bestellung Mo 09.11. → 5 AT → Di 17.11.; 0,5 AT → Di 10.11.).
- Mindestpreis je Position: Aluverbund 17 € (0,25 m² × 53 € = 13,25 € wird auf 17 € angehoben).
- Der Aufschlag gilt **je Position**. Ob eine kurze Produktionszeit nur für eine Position oder für
  die ganze Bestellung gilt, ist heute nicht geregelt.

### 2.3 „24h Express“

Gemeint ist die GLS-Zustellung „bis 10 Uhr am nächsten Tag“. Sie ist unabhängig von der
Produktionszeit wählbar. Ein Kunde kann also 5 AT Produktion **und** 24h Express buchen. Das ist
irreführend und wird in der neuen Lösung ersetzt (Abschnitt 6).

---

## 3. Comdatek (connect.comdatek.de)

### 3.1 Veröffentlichte Regeln („Versand & Zahlung“)

| Land | Service | Versandkosten |
|---|---|---:|
| DE | Standard | 9,90 € |
| DE | Eilproduktion | 12,00 € |
| DE | 48h Express | 15,00 € |
| DE | 24h Express | 20,00 € |
| AT, NL, BE, LU, PL, IT, FR | Standard / Eilproduktion | 15,90 € / 18,00 € |

**Sperrgut** wird nach dem **Paket** bemessen, nicht nach dem Druckprodukt. Gerollte oder gefaltete
Ware zählt mit dem Packmaß:

| Grenzwert Paket | Zuschlag |
|---|---:|
| ab Länge 2.450 mm oder Gurtmaß 2.950 mm | +15,10 € |
| ab Länge 3.150 mm oder 25 kg | +25,10 € |
| ab 30 / 40 / 50 / 60 / 70 / 80 / 90 / 100 / 110 / 120 kg | +30,10 / 35,10 / 40,10 / 45,10 / 48,10 / 50,10 / 55,10 / 60,10 / 65,10 / 70,10 € |

- Versanddienstleister: UPS, DPD, DHL, bei Sperrgut GEL und NexCargo. Laufzeit DE 1–2 AT.
- Annahmeschluss 12:00 Uhr. 24h und 48h beziehen sich auf Arbeitstage. Der Versand erfolgt neutral
  (Dropshipping), als Absender ist bei Lohndruckerei „Versand Logistik, Nürnberg“ hinterlegt.
- Die Termine in der Auftragsliste zeigen: **Standard = 5 AT, Eilproduktion = 3 AT, 48h Express =
  2 AT** bis zur Zustellung.

### 3.2 Auswertung von 250 Aufträgen (14.07.–06.11.2026)

Ausgewertet wurden je Auftrag Service, „Zusatzkosten“ (= Versandkosten), Warenwert (EK), längste
Seite und Material, ohne Adressen. Das Skript dazu steht in `docs/werkzeuge/comdatek-auswertung.js`.

| Gruppe | Aufträge | Versand-EK gesamt | davon 0 € | Ø je Auftrag | Versand-EK in % vom Waren-EK |
|---|---:|---:|---:|---:|---:|
| Standard, **nur Aluverbund** (auch kaschiert auf Alu) | 115 | 9,90 € | 114 | 0,09 € | 0,1 % |
| Standard, andere Materialien | 106 | 1.685,10 € | 2 | 15,90 € | 10,7 % |
| Express/Eil, nur Aluverbund | 10 | 162,00 € | 0 | 16,20 € | 5,8 % |
| Express/Eil, andere | 19 | 624,00 € | 0 | 32,84 € | 22,7 % |
| **Gesamt** | **250** | **2.481,00 €** | 116 | 9,92 € | 6,8 % |

Standard, nicht Aluverbund, nach Material:

| Material | Aufträge | Ø Versand-EK | Höchstwert |
|---|---:|---:|---:|
| **Hartschaum / Leichtschaum (Stadur)** | 37 | **26,40 €** | 105,00 € |
| **Banner / Canvas / Textil** | 7 | **39,76 €** | 195,00 € |
| Papier / Karton / Wabe | 13 | 20,94 € | 68,10 € |
| Mischaufträge | 8 | 24,59 € | 82,70 € |
| Acryl | 12 | 11,49 € | 40,00 € |
| PS / Hart-PVC | 20 | 9,92 € | 29,50 € |
| Magnet | 11 | 8,91 € | 26,80 € |
| Hohlkammer | 3 | 7,23 € | 9,90 € |

**Erkennbare Regeln (Konditionen der Lohndruckerei, weichen von der Liste ab):**

- **Aluverbund: Standardversand 0 €**, auch bei 3000 mm, 3540 × 2500 mm und 9000 mm Länge.
  Express kostet trotzdem: 48h = 15 €, 24h = 20 €, Eil = 12 €.
- **Standard sonst: 5,90 € je Paket.** Mehrere Pakete ergeben ein Vielfaches: 11,80 € / 17,70 € /
  29,50 € = 2 / 3 / 5 Pakete. Ein Teil der Aufträge kostet 9,90 € bzw. 19,80 € (Listenpreis).
- **Sperrgut** ist der Kostentreiber: Hartschaum 5–10 mm und Stadur ab ca. 1.200 mm meist 25–35 €,
  große Hartschaum-Aufträge 60–105 €, Canvas/Keilrahmen bis 195 €.
- Österreich: 15,90 €.

### 3.3 Deckung heute (Schätzung)

Annahme: Der Kunde zahlte je Auftrag 11,90 € + Verpackung nach der längsten Seite (Tabelle 2.1).
Ein Comdatek-Auftrag entspricht dabei etwa einer Shop-Bestellung.

| Gruppe | Kundenanteil Versand + Verpackung | Versand-EK Comdatek | Aufträge mit Unterdeckung | Summe Unterdeckung |
|---|---:|---:|---:|---:|
| Standard, Aluverbund | 3.287,50 € | 9,90 € | 0 | 0 € |
| Standard, andere | 2.639,90 € | 1.685,10 € | 12 | 272,40 € |
| Express/Eil, Aluverbund | 375,90 € | 162,00 € | 1 | 8,10 € |
| Express/Eil, andere | 463,90 € | 624,00 € | 12 | 216,60 € |
| **Gesamt** | **6.767,20 €** | **2.481,00 €** | **25 (10 %)** | **497,10 €** |

- In Summe deckt die heutige Pauschale die Comdatek-Kosten. Zwei Drittel der Erlöse stammen aber aus
  Aluverbund-Aufträgen, für die Comdatek nichts berechnet. Fällt die Alu-Kondition weg, sinkt die Deckung deutlich.
  Die Nachrechnung mit 500 Aufträgen ergibt dann etwa 2,3 statt 3,1, also immer noch gedeckt; siehe
  [LOGISTIKPAUSCHALE.md](LOGISTIKPAUSCHALE.md).
- Unterdeckung entsteht fast nur bei **Sperrgut (Hartschaum, Stadur, Canvas)** und **Express ohne
  Aluverbund**.
- Nicht enthalten sind die eigene Verpackung, die interne Folienproduktion (GLS/DPD-Kosten fehlen noch)
  und Bestellungen mit **mehreren Lieferanten**. Bei diesen fällt die Pauschale jedes Lieferanten an,
  der Kunde zahlt aber nur einmal 11,90 €.
- Express: Der Produktionszeit-Aufschlag von lohndruckerei.eu rechnet je m², mindestens 1 m², z. B. 2 AT
  bei Aluverbund = +11 €. Comdatek berechnet für 48h pauschal 15 €. **Kleine Express-Aufträge sind
  damit nicht gedeckt.**

---

## 4. Wo gehört was hin? (Architektur)

```
Kunde ─► Mensura (Konfigurator, Positionspreis inkl. Produktionszeit, Maße, Gewicht, Material,
                  Lieferantenvorschlag, Fertigstellungsdatum)
            │  Warenkorb
            ▼
         Vectura (Bestellebene): Positionen nach Versandquelle gruppieren → Sendungen schätzen
            → Kundenpreis (Versand, Format/Verpackung, Service) + Zustelltermin
            → intern: geschätzter EK je Quelle, Deckung
            │  Bestellung (Schnappschuss)
            ▼
   Auftragsverteilung / LieferLotse (bestellt beim Lieferanten, holt Dateien ab)
            │  Comdatek-XML, Versandmails, interne GLS-Labels
            ▼
         Vectura-Sendungen (Carrier, Sendungsnummern, Positionen) → Shopware order_delivery.trackingCodes
            │  Event „Sendung erfasst“
            ▼
   Flow Builder (jetzt) / Workflow-Plugin (später): Versandmitteilung an den Kunden
```

| Variante | Bewertung |
|---|---|
| **Nur Shopware-Bordmittel** (Versandarten, Preismatrix mit Regeln, Rule Builder) | Für den Ist-Stand (11,90 € + Verpackung nach Länge, AT) **als Übergang machbar**: Mensura setzt Breite und Höhe an der Position, also greift die Regel „Positionsmaß“. Es braucht aber 12 Regeln, und der Zuschlag ist nicht als eigener Betrag sichtbar. Versandquellen, EK, Sperrgut je Lieferant, Zustelltermin und Sendungen sind **nicht** möglich. |
| **In LieferLotse** | Nein. LieferLotse enthält bewusst keine Preise. Er liefert nur Lieferanten-IDs, die Inbox (Comdatek-XML) und Events. |
| **In Mensura** | Nur der **Produktanteil**: Produktionszeit-Aufschlag (gibt es schon), Gewicht und Maße (gibt es schon), neu ein **Versandanteil bzw. eine Sperrgutklasse je Material** und das Fertigstellungsdatum. Bestellweite Kosten, mehrere Quellen und Sendungen passen nicht hinein. |
| **Eigenes Plugin Vectura** ✅ | Erweitert Shopware: Versandart und Land kommen weiter aus Shopware, Vectura berechnet den Betrag (CartProcessor nach dem Shopware-`DeliveryProcessor`) und schreibt Sendungsnummern in die Shopware-Lieferung. Lose gekoppelt an Mensura und LieferLotse (IDs, Payload, Events), läuft auch ohne sie (dann ist alles „eine Quelle“). |

### 4.1 Technische Bausteine

- **Versandquelle** (`ld_vectura_source`): woher eine Sendung kommt, z. B. „Interne Produktion“
  oder „Comdatek“ (LieferLotse-`supplierId`, ohne Fremdschlüssel). Dazu Laufzeit je Zone,
  Annahmeschluss, Carrier und EK-Profil. Die Quelle einer Position bestimmt die Kette **Mensura-Vorschlag
  (Material vor Kalkulation) → LieferLotse-Zuordnung (Priorität 1) → Standardquelle**.
- **Zone** (`ld_vectura_zone`): Länder und PLZ-Bereiche, z. B. DE, DE-Inseln (PLZ-Liste), AT, EU.
  Maßgeblich ist immer die **Lieferanschrift** (Shopware `shippingLocation`), nicht die
  Rechnungsadresse. Bei Adresswechsel im Checkout rechnet Shopware den Warenkorb ohnehin neu.
- **Kundentarif** (`ld_vectura_tariff`, VK): je Zone und Shopware-Versandart: Grundpreis je Bestellung,
  Zuschlag je weiterer Quelle, optional versandkostenfrei ab Warenwert, Kundengruppen über Shopware-Regeln.
- **Format-/Verpackungsstaffel** (`ld_vectura_format_tier`, VK): längste Seite ab … mm → Betrag.
  Gilt wahlweise einmal je Bestellung (wie heute) oder je Sendung. Länge, Gewicht und Packart
  (flach, gerollt, gefaltet) kommen aus dem Mensura-Payload bzw. der Shopware-Lieferinformation.
- **Zusatzservice** (`ld_vectura_service`, VK): z. B. „Zustellung bis 10 Uhr“ mit Bedingungen (nur
  bestimmte Quellen, Carrier, Zonen und Größen).
- **EK-Regeln** (`ld_vectura_cost_rule`, nur mit eigenem Recht): je Quelle × Zone × Service: Betrag je
  Paket, Paketbildung (max. Länge, Gewicht), Sperrgutstufen (Länge, Gurtmaß, Gewicht), Ausnahmen je
  Material (Comdatek: Aluverbund 0 €).
- **Schnappschuss je Bestellung** (`ld_vectura_order_shipping`, nur Admin-API): Gruppen bzw. Sendungen,
  Rechenweg VK, geschätzter EK, später **Ist-EK** (manuell, aus Comdatek oder aus der
  Lieferantenrechnung) und die Deckung.
- **Sendung** (`ld_vectura_shipment` + Positionen): Bestellung, Quelle, Carrier, Sendungsnummern,
  Positionen (auch Teilmengen), Datum, Herkunft (`comdatek_xml`, `mail`, `gls_api`, `manual`).
  Die Nummern werden zusätzlich in `order_delivery.trackingCodes` geschrieben. So sieht der Kunde sie
  im Konto, und der Shopware-Tracking-Link der Versandart funktioniert.
- **Carrier** (`ld_vectura_carrier`): GLS, DPD, UPS, DHL, GEL, NexCargo mit Tracking-URL, Muster der
  Sendungsnummer (Regex) und Erkennungsmerkmalen in Mails.
- **Anzeige im Shop:** Versand in den Shopware-Versandkosten, Format/Verpackung und Service als eigene,
  nicht löschbare Warenkorbposition („Verpackung mit Kantenschutz (längste Seite 1.400 mm)“). Damit ist
  der Zuschlag auf Rechnung und Beleg sichtbar und richtig besteuert. Dazu der Zustelltermin je Sendung.
  Die Gestaltung gehört zum Storefront-Theme.

---

## 5. Kundenpreis – vier Modelle

### 5.1 Modell D · Pauschale + Logistikpauschale ✅ (Empfehlung, Idee vom 07.11.2026)

- **Kunde sieht:** wie bisher Versandpauschale (DE 11,90 €, AT 17,90 €) + Verpackung nach der längsten
  Seite. Ein Mehrquellen-Zuschlag oder Express als Versandart entfällt.
- **Im Artikelpreis steckt eine Logistikpauschale.** Sie deckt die Versand-, Express- und Sperrgutkosten
  der Lieferanten, die der Pauschale nicht zugeordnet werden können. Je Materialgruppe wählbar als
  **% vom Warenwert**, **€ je m²** oder **€ je Position**. Für Mensura-Produkte ist sie ein eigener
  Schritt im Rechenweg, für den Kunden nicht getrennt ausgewiesen.
- **Vectura schlägt den Wert vor:**
  `Vorschlag = Versand-EK des Zeitraums × (1 + Zielmarge) ÷ Bezugsgröße des Zeitraums` (Fläche,
  Warenwert oder Positionen). Ein Beispiel ist das Quartal mit 25 % Zielmarge. Optional wird der Teil
  abgezogen, den die Kundenpauschale schon deckt (Einstellung „Pauschale verrechnen“).
- **Der Mensch entscheidet:** Der Vorschlag wird angezeigt und erst nach Bestätigung übernommen, mit
  gültig-ab-Datum. Preise ändern sich nie automatisch.
- **Kontrolle:** Das Dashboard zeigt je Zeitraum und Materialgruppe den Ist-Versand-EK, die eingenommene
  Logistikpauschale und die Kundenpauschalen, dazu Deckung und Marge, Ampel gegen Ziel 25 %.
- **Vorteil:** keine Änderung für Kunden, keine Regel je Lieferant nötig, Mehrquellen und Express
  werden über die Zeit gedeckt. **Nachteil:** Einzelne Bestellungen können ins Minus gehen. Das ist
  gewollt, die Rechnung geht über den Zeitraum auf.

**Vorschlag aus den 250 Comdatek-Aufträgen** (Versand-EK je Auftrag anteilig nach Warenwert auf die
Positionen verteilt, inkl. Express, Zielmarge 25 %, ohne Verrechnung der Kundenpauschale):

| Materialgruppe | Positionen | Fläche | Waren-EK | Versand-EK | Ziel (+25 %) | **je m²** | **je Position** | **% vom Waren-EK** |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| Aluverbund (auch kaschiert) | 221 | 436 m² | 19.195 € | 247 € | 309 € | 0,71 € | 1,40 € | 1,6 % |
| Hartschaum / Stadur | 93 | 196 m² | 4.652 € | 983 € | 1.229 € | **6,26 €** | 13,22 € | **26,4 %** |
| Banner / Textil / Canvas | 12 | 101 m² | 2.154 € | 293 € | 367 € | 3,62 € | 30,55 € | 17,0 % |
| Papier / Karton / Wabe | 30 | 389 m² | 2.470 € | 280 € | 350 € | 0,90 € | 11,67 € | 14,2 % |
| PS / Hart-PVC | 37 | 147 m² | 2.469 € | 228 € | 285 € | 1,94 € | 7,70 € | 11,5 % |
| Acryl | 26 | 19 m² | 1.136 € | 203 € | 253 € | 13,06 € | 9,74 € | 22,3 % |
| Magnet | 15 | 21 m² | 778 € | 104 € | 130 € | 6,21 € | 8,66 € | 16,7 % |
| Folie / Etiketten / Sonstiges | 21 | 316 m² | 3.061 € | 115 € | 144 € | 0,45 € | 6,83 € | 4,7 % |
| Hohlkammer | 3 | 112 m² | 568 € | 22 € | 27 € | 0,24 € | 9,04 € | 4,8 % |

Lesart: Hartschaum braucht rund **+26 % auf den EK** bzw. **+6,26 €/m²**, Aluverbund fast nichts. Die
Kundenpauschale von 11,90 € + Verpackung ist hier noch nicht gegengerechnet. Sie deckt laut 3.3 heute
schon etwa 2,7-mal den Comdatek-Versand und vor allem die eigene Verpackung und Abwicklung. Mit
„Pauschale verrechnen“ wird der Vorschlag entsprechend kleiner. Die interne Folienproduktion
(GLS/DPD) fehlt noch in den Zahlen. Bezugsgröße: **% vom Warenwert** ist am robustesten (Acryl hat
wenig Fläche, aber hohe Kosten). **€ je m²** passt zu Mensura und zur Produktionszeit.

### 5.2 Weitere Modelle zum Vergleich

| | A · Pauschale wie heute | B · Je Versandquelle | C · Pauschale + Mischkalkulation |
|---|---|---|---|
| Kunde zahlt | 11,90 € je Bestellung (AT 17,90 €) + Verpackung nach längster Seite (max. der Bestellung) | 11,90 € **je Sendung**, Verpackung je Sendung | 11,90 € je Bestellung + Format nach längster Seite + ggf. **Mehrquellen-Zuschlag** (z. B. 5,90 € je weiterer Sendung oder 0 €) |
| Sperrgut | im Format-Zuschlag | im Format-Zuschlag | **Versandanteil im Produktpreis** je Material (Mensura), z. B. Hartschaum/Stadur +x €/m² oder ab 1.200 mm +y € je Position |
| Express | Produktionszeit je m² | Produktionszeit je m² | Produktionszeit je m² **mit Mindestaufschlag je Position**, z. B. 2 AT mind. 15 € |
| Für den Kunden | einfach, bekannt | transparent, aber er sieht die Lieferantenstruktur; viele Sendungen wirken teuer | einfach, fair: sperrige Ware trägt ihre Kosten selbst |
| Risiko | Mehrquellen und Sperrgut unterdeckt, hängt an der Alu-Kondition | Kunden springen ab, Vergleich mit Wettbewerb (Versand im Preis) | Versandanteile müssen gepflegt werden; die Kontrolle läuft über das Deckungs-Dashboard |
| Aufwand Vectura | klein | mittel | mittel (Mensura: ein Feld je Material) |

Modell D ist die systematische Form von C: Der Versandanteil wird nicht geschätzt, sondern aus den
Ist-Kosten zurückgerechnet und regelmäßig nachgeführt.

**Empfehlung D**, Schritt für Schritt:

1. Start mit Modell A (Ist-Stand, 1:1 nachgebaut, Insel- und AT-Zone sauber), aber **schon mit
   EK-Schätzung, Ist-Kosten und Deckungs-Dashboard**.
2. Logistikpauschale je Materialgruppe mit dem Vorschlag aus 5.1 einführen, zuerst nur für die
   Ausreißer (Hartschaum/Stadur, Acryl, Banner/Canvas, Magnet). Das Dashboard zeigt vorher, was sie in
   den vergangenen Bestellungen gebracht hätte (Simulation).
3. Vierteljährlich neu vorschlagen lassen und bestätigen. Fällt eine Lieferantenkondition weg (z. B.
   Aluverbund frei), steigt der Vorschlag automatisch, und das Dashboard warnt.
4. Optional später: „Versand inklusive“ je Kalkulation (Wettbewerb wir-machen-druck/flyeralarm). Die
   Pauschale wird dann zum Mindestbestellwert-Zuschlag.

**Beispiele (Modell A heute, Comdatek-EK aus echten Aufträgen):**

| Bestellung | Kunde zahlt | EK Versand | Ergebnis |
|---|---:|---:|---:|
| Aluverbund 1000 × 1000, Standard | 11,90 + 17,00 = 28,90 € | 0,00 € | +28,90 € |
| Hartschaum 5 mm 1832 × 288, Standard | 11,90 + 27,00 = 38,90 € | 35,00 € | +3,90 € |
| Hartschaum 3 mm 3390 × 2000 u. a., Standard | 11,90 + 40,00 = 51,90 € | 65,00 € | **−13,10 €** |
| Acryl 1400 × 1000, 48h | 11,90 + 24,00 = 35,90 € (+ Produktionszeit) | 40,00 € | −4,10 € |
| Aluverbund (Comdatek) + Folie (intern, GLS) | 11,90 + Verpackung | 0 € + GLS + eigene Verpackung | offen (GLS-Tarif fehlt) |

---

## 6. Produktionszeit, Express und Zustelltermin

**Entscheidungsvorschlag:** Expresskosten sind **keine Versandkosten**.

- **Produktionszeit** (0,5–8 AT) wählt der Kunde in Mensura je Position, als Aufschlag je m² (Ist-Stand,
  Tabelle 2.2), neu mit **Mindestaufschlag je Position**. Mensura bildet den Wert auf den
  Lieferantenservice ab: Comdatek 5 AT → Standard, 3 AT → Eilproduktion, 2 AT → 48h Express,
  1 AT → 24h Express. Den EK des Express-Services rechnet Vectura mit.
- **Gilt für die Sendung:** Positionen einer Quelle reisen zusammen und warten auf die langsamste
  Position. Vectura zeigt im Warenkorb, wenn eine kurze Produktionszeit dadurch nichts bringt („Die
  Platte wird am 12.11. fertig, die Folie erst am 16.11. – beide kommen zusammen am 17.11.“). Optional:
  „getrennt liefern“ gegen den Mehrquellen-Zuschlag. Das passt zu Mensuras `scope = position | supplier`.
- **Zustelltermin** = Fertigstellung (Mensura: Annahmeschluss, Arbeitstage, Feiertage) + **Laufzeit je
  Quelle und Zone** (Vectura, z. B. intern DE 1 AT, Comdatek DE 1–2 AT, AT +1 AT). Der Shop zeigt
  „voraussichtlich Di 17.11.“ bzw. eine Spanne. Der Termin geht wie heute als `ldDeliveryDate` an
  LieferLotse.
- **„24h Express“ entfällt** als Versandart. Ersatz, falls gewünscht: Zusatzservice **„Zustellung bis
  10 Uhr“** (GLS Express) mit Aufpreis, nur wählbar, wenn alle Positionen aus einer Quelle kommen, die
  das kann (z. B. interne Produktion), und nur innerhalb DE. Er wird klar als „Zustellung“ beschriftet,
  mit Datum. Alternative: ganz weglassen. Die Produktionszeit 0,5 AT erfüllt meist denselben Zweck.

---

### 6.1 Liefer-Countdown und Terminplanung

Countdown bis zum Annahmeschluss, Produktionsprofile je Lieferant (10–0,5 AT, intern 0,5 AT mit Versand am selben
Tag), Zeitleiste im Shop sowie Terminverschiebung nach der Bestellung (Workflow-Plugin) werden als Modul „Termine“ in
Vectura gebaut. Details, Varianten und Rechenregel: [TERMINE.md](TERMINE.md).

## 7. Sendungen und Versandmitteilungen

| Quelle | Weg | Phase |
|---|---|---|
| **Comdatek** | XML je versendeter Position, über die LieferLotse-Schnittstelle „Versandbestätigung empfangen“ in den Eingang → `SupplierFileReceivedEvent` → Vectura-Parser → Sendung | 3 |
| **Interne Produktion (GLS/DPD)** | heute: eigenes Workflow-System per API, Label per Mail. Übergang: Label-/Bestätigungsmail auswerten. Später: Label aus Shopware erzeugen (Workflow-Plugin, GLS-ShipIT-API) | 4 / Workflow |
| **Andere Lieferanten** | Versandmails von GLS, UPS, DHL und DPD im Postfach (IMAP) durchsuchen: Sendungsnummer per Carrier-Muster, Zuordnung über unsere Referenz (Bestellnummer, LieferLotse-Nummer `{Bestellnr}-{Lieferantennr}`) und Empfänger-PLZ. Unsichere Treffer gehen in eine **Prüfliste** im Admin, nichts wird automatisch verschickt. | 4 |
| **Manuell** | im Workflow-Plugin (später). Bis dahin: Shopware-Standard „Sendungsnummer“ an der Lieferung | – |

- Jede erfasste Sendung löst `vectura.shipment.created` aus (Flow Builder: Bestellung, Sendung,
  Positionen, Carrier, Tracking-Links). Damit gehen Versandmitteilungen schon vor dem Workflow-Plugin
  raus. Das Workflow-Plugin übernimmt sie später.
- Teillieferungen: Eine Bestellung hat mehrere Sendungen. Der Lieferstatus „teilweise versandt / versandt“
  wird aus „alle Positionen in einer Sendung?“ abgeleitet.
- Ist-Kosten: Wo der Lieferant Kosten liefert (Comdatek-Portal „Zusatzkosten“, später Rechnung),
  werden sie an die Sendung geschrieben. Daraus wird die Deckung je Bestellung berechnet.

---

## 8. Administration (Lohndruckerei-Designsystem, Präfix `lv-`)

Eigener Bereich unter **Einstellungen → Versand** oder eigener Hauptmenüpunkt „Versand“ (wie Mensura),
Modulfarbe `#0B6E79`, Icon `regular-truck`. Alle Felder mit Hilfetext und Praxisbeispiel,
Erklärkarten je Bereich, Design A/B/C umschaltbar (bis zur Designentscheidung).

| Bereich | Inhalt | Recht |
|---|---|---|
| **Übersicht** | Kennzahlen: Versand-Erlös vs. geschätzter/Ist-EK, Deckung in %, Bestellungen mit Unterdeckung, Mehrquellen-Bestellungen, offene Sendungen; Filterchips „Unterdeckung · Sperrgut · Express · Mehrquellen“ | `lv.viewer`, Beträge EK nur `lv.cost` |
| **Simulator** | Warenkorb zusammenstellen (Material, Format, Menge, Produktionszeit, Land) → Kundenpreis, Termin, EK, Deckung, Rechenweg Zeile für Zeile; „mit Modell C rechnen“ | `lv.viewer` (+ `lv.cost`) |
| **Logistikpauschale** | je Materialgruppe: aktueller Wert, Vorschlag (Zeitraum, Zielmarge, Bezugsgröße), Simulation „was hätte es gebracht“, Übernehmen mit gültig-ab; Verlauf | `lv.cost` |
| **Kundentarife** | Zonen × Versandart: Grundpreis, Mehrquellen-Zuschlag, Format-Staffel (Tabelle mit Live-Vorschau), Zusatzservices | `lv.editor` |
| **Versandquellen** | intern / Lieferanten (Auswahl aus LieferLotse), Laufzeit je Zone, Carrier, Annahmeschluss | `lv.editor` |
| **Einkaufsregeln** | je Quelle: Paketpreis, Sperrgutstufen, Material-Ausnahmen, Express-Services – Vorlage „Comdatek 2026“ | `lv.cost` |
| **Zonen & Carrier** | Länder, PLZ-Bereiche (Inseln), Tracking-URL, Nummernmuster | `lv.editor` |
| **Sendungen** (Phase 3+) | Liste mit Status, Quelle, Carrier-Chip, Nummern; Prüfliste für unsichere Mail-Treffer | `lv.viewer` / `lv.editor` |
| **Postfach** (Phase 4) | IMAP-Zugang (verschlüsselt wie im LieferLotse), Abrufintervall, Regeln je Absender | `lv.admin` |

Carrier bekommen feste Kategorie-Farben nach DESIGN.md (neue Zuordnung dort eintragen, z. B. GLS c1,
DPD c2, DHL c3, UPS c4).

---

## 9. Offene Entscheidungen und benötigte Unterlagen

1. ~~Kundenpreis-Modell~~ → **D entschieden** (07.11.2026).
2. **Logistikpauschale:** Anrechnung der sichtbaren Erlöse, Zeitraum, Senkung sichtbarer Gebühren → offene Fragen in
   [LOGISTIKPAUSCHALE.md](LOGISTIKPAUSCHALE.md) Abschnitt 7; Zielmarge 20–30 % entschieden.
3. **„24h Express“:** ersetzen durch „Zustellung bis 10 Uhr“ (nur interne Produktion) oder streichen?
4. **Format-Staffel:** Stufen bestätigen (Abschnitt 2.1); einmal je Bestellung oder je Sendung?
5. **Mindestaufschlag Produktionszeit** je Position (Vorschlag: so hoch wie der Express-EK, z. B. 15 €).
6. **Österreich:** 17,90 € / 69 € beibehalten? Weitere Länder (CH ist Drittland, also Zoll)?
7. **Inselzuschlag:** Betrag festlegen.
8. Unterlagen: **GLS/DPD-Vertragspreise** (interne Folien), **Beispiel-XML von Comdatek**, 2–3
   **Versandmails** je Carrier (GLS, UPS, DHL, DPD), Zugang zum Versandpostfach (IMAP), Erklärung der
   Comdatek-Kondition (5,90 € je Paket bzw. Aluverbund frei, gilt das vertraglich?).
9. **Name** des Plugins (Abschnitt 10).

---

## 10. Namensvorschläge

| Name | Idee | Präfix |
|---|---|---|
| **Vectura** ✅ | lat. „Fracht, Fuhrlohn“ – genau das, was berechnet wird; Schwester von *Mensura* | `lv-` |
| **Portus** | lat. „Hafen“ – hier laufen alle Sendungen ein und aus | `lp-` |
| **Frachtwerk** | deutsch, handfest, passt zur Druckerei | `lf-`* |
| **Paketpate** | kümmert sich um jedes Paket bis zur Haustür | `lp-` |
| **Kurierkompass** | findet den Weg und den Preis (passt zu Design C „Kompass“) | `lk-` |
| **Transitus** | lat. „Übergang, Durchfahrt“ – Weg vom Lieferanten zum Kunden | `lt-` |
| **Expeditio** | lat. „Versendung“ – klingt nach Aufbruch | `le-` |
| **Porto Fino** | Wortspiel: Porto (Versandkosten) + fein berechnet | `lo-` |

\* `lf-` ist in DESIGN.md für die Druckdaten-Freigabe vorgeschlagen.

---

## 11. Fahrplan

| Schritt | Inhalt | Ergebnis im Shop |
|---|---|---|
| 0 | Sofort, ohne Plugin: im alten Shop „24h Express“ umbenennen in „Zustellung bis 10 Uhr (nur mit Produktionszeit ≤ 1 AT)“ oder deaktivieren | weniger Fehlbuchungen |
| 1 | Gerüst, Rollen, Zonen, Carrier, Versandquellen (Admin nach Designsystem) | Stammdaten pflegbar |
| 2 | Kundentarif + Format-Staffel + CartProcessor (Modell A), AT und Inseln | Warenkorb rechnet wie lohndruckerei.eu |
| 3 | Quellen-Gruppierung (Mensura/LieferLotse), Zustelltermin, Mehrquellen-Zuschlag | Termin und Sendungen im Warenkorb |
| 4 | EK-Regeln (Vorlage Comdatek), Bestell-Schnappschuss, Übersicht/Deckung, Simulator | Deckung je Bestellung sichtbar |
| 5 | Sendungen: Comdatek-XML über LieferLotse-Eingang, Tracking in `order_delivery`, Flow-Event | Versandmitteilung per Flow |
| 6 | Postfach-Auswertung GLS/UPS/DHL/DPD mit Prüfliste | Sendungsnummern ohne Abtippen |
| 7 | Modell D: Logistikpauschale je Materialgruppe – Vorschlag (Zeitraum, Zielmarge), Bestätigung, Übernahme in Mensura-Rechenweg, Simulation über Altbestellungen | Lieferantenversand über den Zeitraum gedeckt + Marge |
| – | Übergabe an das Workflow-Plugin (Mitteilungen, manuelle Eingabe, GLS-Labels) | |
