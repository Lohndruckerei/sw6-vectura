# Vectura – Versand, Verpackung und Sendungen für Shopware 6

Shopware-6.7-Plugin der Lohndruckerei (Arbeitsname). Vectura erweitert den Shopware-Versand um:

- **Kundenpreise:** Pauschale je Zone (DE, Inseln, AT …), Format-/Verpackungszuschlag nach der
  längsten Seite, Mehrquellen-Zuschlag, Zusatzservices
- **Zustelltermin:** Fertigstellung (Mensura) + Laufzeit je Versandquelle und Zone
- **Einkaufskosten und Deckung:** EK-Regeln je Lieferant (z. B. Comdatek mit Sperrgut), Schnappschuss je
  Bestellung, Übersicht und Simulator
- **Sendungen:** Sendungsnummern aus Comdatek-XML und Versandmails, Übernahme in die Shopware-Lieferung,
  Flow-Event für Versandmitteilungen

Konzept, Analyse der Ist-Kosten und Fahrplan: [docs/KONZEPT.md](docs/KONZEPT.md) ·
technische Umsetzung: [docs/UMSETZUNG.md](docs/UMSETZUNG.md) ·
Liefer-Countdown und Termine: [docs/TERMINE.md](docs/TERMINE.md) ·
Backend/Frontend und Vertrag: [docs/ENTWICKLUNG.md](docs/ENTWICKLUNG.md)

```
Mensura (Positionspreis, Maße, Produktionszeit) ─► Vectura (Bestellung: Versand, Termin, EK)
LieferLotse (Lieferanten, Eingang) ─► Vectura-Sendungen ─► Flow Builder / Workflow-Plugin
```

Status: Konzept + Plugin-Gerüst (v0.1.0), im Container eingebunden (`custom/plugins/LdVectura`), installiert und aktiv.
