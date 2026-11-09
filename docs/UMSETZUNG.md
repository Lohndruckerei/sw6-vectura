# Vectura – Vorschläge zur technischen Umsetzung

Stand: 07.11.2026. Grundlage ist [KONZEPT.md](KONZEPT.md) (fachlich: was und warum). Dieses Dokument beschreibt,
**wie** es in Shopware 6.7 gebaut wird, in welcher Reihenfolge und wo es an Mensura und LieferLotse andockt.
Die Aufteilung in Backend und Frontend regelt [ENTWICKLUNG.md](ENTWICKLUNG.md).

---

## 1. Leitlinien

1. **Shopware rechnet weiter, Vectura korrigiert nur.** Versandart, Verfügbarkeit (Rule Builder), Steuer der
   Versandkosten und `order_delivery` bleiben Shopware. Vectura ersetzt **nach** dem Shopware-`DeliveryProcessor`
   den Betrag und hängt einen Rechenweg an den Warenkorb.
2. **Rechnen ohne Shopware-Kernel testbar.** Alle Rechenbausteine (Zone, Format, Tarif, EK, Termin) sind reine PHP-Klassen
   mit einfachen Eingabe-Objekten. Der Warenkorb-Prozessor übersetzt nur zwischen Shopware und diesen Klassen. Damit
   sind sie mit PHPUnit und Beispielfällen prüfbar, wie bei Mensura.
3. **Lose gekoppelt.** Mensura und LieferLotse werden nur verwendet, wenn sie installiert sind
   (`class_exists` bzw. bedingt registrierte Subscriber). Lieferanten-IDs werden ohne Fremdschlüssel gespeichert.
   Fehlt alles, ist jede Bestellung „eine Quelle, Standardquelle“, und Vectura rechnet trotzdem.
4. **Einkaufsdaten getrennt halten.** EK-Regeln, EK-Schätzung und Deckung liegen in eigenen Entities mit eigenem
   Recht (`ld_vectura_cost`), nie `ApiAware`, nie in der Store-API, nie im Warenkorb-Payload.

---

## 2. Bausteine im Backend

```
src/
├── Core/Content/            Entities (DAL): Zone, Carrier, Source, Tariff, FormatTier, Service,
│                            CostRule, LogisticsRate, OrderShipping, Shipment(+Item), MailMatch
├── Service/
│   ├── Model/               reine Datenobjekte: ShippingLine, ShipmentGroup, Breakdown, Money
│   ├── Zone/ZoneResolver               Land + PLZ der Lieferanschrift → Zone (Inseln über PLZ-Liste)
│   ├── Source/SourceResolver           Position → Versandquelle (Mensura-Vorschlag → LieferLotse → Standard)
│   ├── Source/GroupBuilder             Positionen je Quelle → ShipmentGroup (längste Seite, Gewicht, Fertigstellung)
│   ├── Format/FormatResolver           längste Seite/Packart aus Payload `ldMensura` bzw. Lieferinformation
│   ├── Price/TariffCalculator          Kundenpreis (Pauschale, Format-Staffel, Mehrquellen, Service) → Breakdown
│   ├── Cost/CostEstimator              EK je Gruppe aus CostRules (Paket, Sperrgut, Material-Ausnahme, Express)
│   ├── Date/DeliveryDateCalculator     Fertigstellung + Laufzeit je Quelle/Zone, Arbeitstage/Feiertage
│   ├── Logistics/RateSuggester         Vorschlag Logistikpauschale aus Schnappschüssen eines Zeitraums
│   ├── Cart/VecturaCartProcessor       Shopware-Anbindung (siehe 3)
│   ├── Order/SnapshotSubscriber        CartConvertedEvent → ld_vectura_order_shipping
│   ├── Shipment/ShipmentService        Sendung anlegen, Tracking in order_delivery, Lieferstatus, Flow-Event
│   ├── Shipment/Parser/ComdatekXmlParser   (LieferLotse-Eingang)
│   └── Mail/MailboxFetcher, Mail/CarrierMailParser, Mail/OrderMatcher   (Phase 6)
├── Controller/              Admin-API: Simulator, Vorschlag, Sendung manuell; Store-API: Schätzung
├── Flow/                    VecturaShipmentCreatedEvent (+ Mail-Template-Typ lv_shipment_notice)
└── Resources/app/administration/src/module/ld-vectura/   Admin (Designsystem lv-)
```

### 2.1 Datenmodell (Kurzform)

| Entity | Wichtige Felder | Recht |
|---|---|---|
| `ld_vectura_zone` | name, priority, countryIds (M:N `country`), zipPatterns (JSON, z. B. `["18565","25846-25849"]`), active | editor |
| `ld_vectura_carrier` | code (`gls`…), name, trackingUrl (`…{code}`), trackingPattern (Regex), mailSenders (JSON), color (`c1`…`c4`) | editor |
| `ld_vectura_source` | name, type (`internal`/`supplier`), supplierId (LieferLotse, ohne FK), isDefault, cutoff, carrierIds, transitDays (JSON je Zone `{min,max}`), services (z. B. Comdatek-Servicecodes je Produktionszeit) | editor |
| `ld_vectura_tariff` | zoneId, shippingMethodId (Shopware), basePrice, perAdditionalSource, freeFrom, formatScope (`order`/`shipment`), ruleId (optional, Kundengruppen) | editor |
| `ld_vectura_format_tier` | tariffId, fromMm, price, label | editor |
| `ld_vectura_service` | key, name (übersetzt), price, conditions (JSON: Quellen, Zonen, max. Länge) | editor |
| `ld_vectura_cost_rule` | sourceId, zoneId, service, perPackage, packageMaxLength/Weight, bulkyTiers (JSON), materialExceptions (JSON), validFrom | **cost** |
| `ld_vectura_logistics_rate` | materialGroup, basis (`percent`/`per_sqm`/`per_position`), value, margin, validFrom, suggestion (JSON mit Herleitung), confirmedBy/At | **cost** |
| `ld_vectura_order_shipping` | orderId (1:1), schema, groups (JSON), sale (Breakdown), estimatedCost, actualCost, coverage | **cost** (VK-Teil viewer) |
| `ld_vectura_shipment` (+ `_item`) | orderId, sourceId, carrierId, trackingCodes (JSON), shippedAt, origin (`comdatek_xml`/`mail`/`gls_api`/`manual`), reference, items (orderLineItemId, quantity), actualCost | viewer / editor |
| `ld_vectura_mail_match` | messageId, from, subject, receivedAt, carrier, trackingCode, candidates (JSON), status (`auto`/`review`/`done`/`ignored`) | editor |

Materialgruppen der Logistikpauschale sind ein schlichter Schlüssel (`alu`, `hartschaum`, …) mit einer Zuordnung
zu Mensura-Materialien (Material-`key`) bzw. zu Shopware-Kategorien für Artikel ohne Mensura.

---

## 3. Warenkorb: so greift Vectura in Shopware ein

Shopware ruft die Cart-Prozessoren nach Priorität auf; der `DeliveryProcessor` hat `-5000`. Am Ende berechnet
Shopware die Gesamtsumme aus Positionen **und** Versandkosten neu.

| Priorität | Schritt | Was passiert |
|---|---|---|
| `-4900` | `VecturaCartProcessor::collect/process` (Teil 1) | Gruppen bilden (Quelle, längste Seite, Gewicht, Fertigstellung); Format-/Verpackungszuschlag und Zusatzservices als **eigene Position** `type = lv-surcharge` (nicht entfernbar, nicht stapelbar, Steuer wie die Waren, Label „Verpackung mit Kantenschutz (längste Seite 1.400 mm)“) |
| `-5000` | Shopware `DeliveryProcessor` | Versandart, Lieferungen, Standard-Versandkosten |
| `-5100` | `VecturaCartProcessor` (Teil 2, eigener Service) | Versandkosten jeder Lieferung durch den Vectura-Tarif ersetzen (`Delivery::setShippingCosts`, Steuer nach der Steuerart der Versandart wie Shopwares `DeliveryCalculator`); Rechenweg als Cart-Extension `lvShipping` (Gruppen, Beträge, Termine, Hinweise) |

- **Manuelle Versandkosten** (Admin-Bestellbearbeitung, `MANUAL_SHIPPING_COSTS`) werden nie überschrieben.
- **Keine Vectura-Tarif-Zeile** für Zone + Versandart → Shopware-Betrag bleibt (sicherer Rückfall).
- **Adresswechsel im Checkout** löst ohnehin eine Neuberechnung aus; maßgeblich ist `SalesChannelContext::getShippingLocation()`.
- **Hinweise** im Warenkorb als Shopware-`Error` mit Level `notice` (z. B. „Platte und Folie kommen getrennt“,
  „kurze Produktionszeit bringt nichts, weil …“).

### 3.1 Logistikpauschale im Artikelpreis

- **Mensura-Artikel:** Mensura löst nach jeder Berechnung `MensuraPriceCalculatedEvent` aus (in Mensura INTEGRATION 5
  geplant, **kleiner Schritt in Mensura nötig**). Vectura hört darauf und ergänzt eine Rechenweg-Zeile „Logistik“
  (VK) je nach Bezugsgröße (% Warenwert, €/m² oder €/Position), und zwar **nach dem Mindestpreis**, vor
  Kundengruppen-Aufschlag und Rundung (siehe [LOGISTIKPAUSCHALE.md](LOGISTIKPAUSCHALE.md) 3.4). Damit stimmen Produktseite, Warenkorb und
  Schnappschuss automatisch überein.
- **Andere Artikel:** In Phase 1 kein Eingriff in den Preis; das Admin zeigt den empfohlenen Aufschlag je Kategorie
  zum Einpflegen. Später optional ein Preis-Prozessor für Kategorien.
- **Vorschlag** (`RateSuggester`): je Materialgruppe über einen Zeitraum aus `ld_vectura_order_shipping`
  `Σ Versand-EK (Ist, sonst Schätzung) × (1 + Marge) [− Anteil Kundenpauschale] ÷ Σ Bezugsgröße`, mit Herleitung,
  Anzahl Bestellungen und Warnung bei zu wenig Daten (< 20 Positionen). Übernahme nur per Klick, mit gültig-ab.
- **Startwerte** ohne eigene Schnappschüsse: Import der Comdatek-Auswertung (`docs/werkzeuge/comdatek-auswertung.js`
  → CSV → Admin „Daten importieren“).

### 3.2 Zustelltermin

> Erweitert durch das Modul „Termine“ (Produktionsprofile je Quelle, Countdown, Terminverlauf): siehe
> [TERMINE.md](TERMINE.md). Die folgenden Punkte sind der Grundfall ohne Produktionsprofile.

- Fertigstellung je Position: `payload.ldDeliveryDate` von Mensura bzw. Shopware-Lieferzeit des Produkts.
- Gruppe = späteste Fertigstellung ihrer Positionen, + Laufzeit der Quelle für die Zone (Arbeitstage, Feiertage aus
  Vectura-Einstellungen; Vorgabe: Werte aus `LdMensura.config.workingDays/holidays` übernehmen, wenn vorhanden).
- Ergebnis je Gruppe `{earliest, latest}` in `lvShipping`; Bestellung = späteste Gruppe.
- **Übergabe an LieferLotse:** Für Lieferanten gelten die **Positionstermine** (`payload.ldDeliveryDate` der
  Positionen des jeweiligen Lieferanten). LieferLotse verwendet diesen Termin **vor** dem Bestelltermin (`DeliveryDateResolver`).
  Vectura setzt am Bestellkopf (`order.customFields.ld_delivery_date`) den spätesten Termin nur als Gesamtinfo und
  Rückfall für Positionen ohne eigenen Termin; sonst bekämen alle Lieferanten den Termin der langsamsten Sendung.

---

## 4. Bestellung, Sendungen, Mitteilungen

- **Schnappschuss** bei `CartConvertedEvent`: Gruppen, Breakdown VK, EK-Schätzung, Schema-Version. Preisänderungen
  ändern alte Bestellungen nie.
- **Comdatek-XML:** Wenn LieferLotse installiert ist, Subscriber auf `SupplierFileReceivedEvent`. Parser nur für
  Lieferanten, deren Quelle `parser = comdatek_xml` hat. Zuordnung über unsere Referenz (Comdatek „Referenz“ =
  Bestellnummer, ggf. mit „- 1“) und Positionsnummer. Danach Datei nach `archive`, bei Fehlern nach `error`
  (LieferLotse-Ordner).
- **`ShipmentService`**: legt `ld_vectura_shipment` an, hängt die Nummern an `order_delivery.trackingCodes` (Kunde sieht
  sie im Konto, Tracking-Link der Versandart funktioniert), setzt den Lieferstatus über die State Machine
  (`ship_partially` / `ship`) und löst `VecturaShipmentCreatedEvent` aus.
- **Flow Builder:** Auslöser „Vectura → Sendung erfasst“ mit `order`, `shipment`, Tracking-Links; eigener
  Mail-Template-Typ `lv_shipment_notice` (de/en) für die Versandmitteilung. Das Workflow-Plugin kann denselben
  Auslöser später übernehmen oder ersetzen.
- **Postfach (Phase 6):** Bibliothek `webklex/php-imap` (die PHP-Erweiterung `imap` ist ab PHP 8.4 nicht mehr dabei),
  geplante Aufgabe `vectura.mailbox_fetch`, Zugangsdaten verschlüsselt (Verfahren wie LieferLotse `SecretVault`, eigene
  Kopie). Erkennung je Carrier über Absender + Nummernmuster; Zuordnung über Bestellnummer im Betreff/Text, dann
  Empfänger-PLZ + Datum. Sicher → automatisch; unsicher → `ld_vectura_mail_match` zur Prüfung im Admin. Keine
  Mitteilung ohne Zuordnung.

---

## 5. Administration (Designsystem, Präfix `lv-`)

- Modul `ld-vectura`, Routen `ld.vectura.*`, eigener Hauptmenüpunkt **„Versand“** (`type: 'core'` wie Mensura),
  Farbe `#0B6E79`, Icon `regular-truck`; Unterpunkte nach KONZEPT Abschnitt 8.
- Seiten nach DESIGN.md: Listen mit Filterchips (B) bzw. Kennzahl-Kacheln (C), Detailseiten mit Kopfkarte und Reitern,
  leere Zustände mit Einrichtungsschritten (1 Zonen → 2 Versandquellen → 3 Tarif).
- **Simulator** als Kernstück: Positionen (Material, Format, Menge, Produktionszeit), Land/PLZ, Versandart →
  ruft dieselben Rechenbausteine über `POST /api/_action/ld-vectura/simulate` auf; zeigt VK, Termin und (mit Recht)
  EK und Deckung Zeile für Zeile.
- **Format-Staffel** als Tabelle mit Live-Vorschau („Platte 1.250 mm → 23,00 €“).
- Carrier-Chips über `lv-chip` mit fester Kategorie-Farbe (neu in DESIGN.md eintragen).
- ACL-Rollen: `ld_vectura.viewer`, `.editor`, `.cost`, `.admin`; nicht erlaubte Bereiche deaktiviert mit Tooltip.

---

## 6. Frontend (Storefront) – eigener Bereich

| Stelle | Anzeige | Datenquelle |
|---|---|---|
| Produktseite / Konfigurator | „zzgl. 11,90 € Versand · Zustellung voraussichtlich Di 17.11.“ | Store-API `POST /store-api/ld-vectura/estimate` (Vertrag) |
| Warenkorb / Checkout | Versand, Verpackung, Service aufgeschlüsselt; je Sendung Termin und Positionen; Hinweise | Cart-Extension `lvShipping` |
| Bestellbestätigung / Konto | Sendungen mit Carrier, Nummer, Tracking-Link, Positionen | Store-API `GET /store-api/ld-vectura/order/{id}/shipments` |

Gestaltung über das Storefront-Theme (Bootstrap), nicht über das Admin-Designsystem.

---

## 7. Fahrplan mit Größe

| Schritt | Inhalt | Bereich | Größe |
|---|---|---|---|
| 1 | Entities Zone, Carrier, Quelle + Admin-Grundgerüst, Rollen, Einrichtungsschritte | Backend | M |
| 2 | Tarif, Format-Staffel, `VecturaCartProcessor` (Modell A), Steuer, Rückfall, Beispielfälle | Backend + Vertrag | M |
| 2F | Warenkorb-Aufschlüsselung, Schätzung auf der Produktseite | Frontend | S |
| 3 | Quellen-Gruppierung (Mensura/LieferLotse), Zustelltermin, Hinweise; Kalender, Produktionsprofile, Store-API `schedule` (TERMINE.md) | Backend + Vertrag | L |
| 3F | Countdown und Zeitleiste in Konfigurator und Warenkorb | Frontend + Mensura | M |
| 4 | EK-Regeln (Vorlage Comdatek), Schnappschuss, Übersicht/Deckung, Simulator, Comdatek-Import | Backend | L |
| 5 | Sendungen, Comdatek-XML, Tracking in `order_delivery`, Flow-Event + Mailvorlage; Terminverlauf `confirm/hold/resume/reschedule` | Backend | L |
| 5F | Sendungen im Kundenkonto | Frontend | S |
| 6 | Postfach-Auswertung mit Prüfliste | Backend | L |
| 7 | Logistikpauschale: Vorschlag, Bestätigung, Mensura-Event | Backend + Mensura | M |

**Abhängigkeiten außerhalb von Vectura:** Mensura `MensuraPriceCalculatedEvent` (für 7) und Material-Gruppen-Schlüssel;
LieferLotse unverändert nutzbar (Inbox-Event, `ld_delivery_date`, `SupplierResolver`).

**Übergang bis Schritt 2 (ohne Plugin):** Shopware-Versandart „Standard DE“ 11,90 € / „Standard AT“ 17,90 € über
Länder-Regeln; Verpackung vorerst nicht automatisch.
