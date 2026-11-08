# Entwicklung: Backend und Frontend getrennt, ein Repo

Wie bei Mensura bleibt Vectura **ein Plugin und ein Repository** mit zwei Arbeitsbereichen. Verbunden sind sie nur
über den **Vertrag** in `docs/contract/`.

| Bereich | Ordner | Inhalt |
|---|---|---|
| **Backend** | `src/Core/`, `src/Service/`, `src/Migration/`, `src/Controller/`, `src/Flow/`, `src/Resources/config/`, `src/Resources/app/administration/`, `tests/Backend/` | Datenmodell, Rechenbausteine, Warenkorb, Sendungen, Postfach, Administration |
| **Frontend** | `src/Resources/app/storefront/`, `src/Resources/views/storefront/`, `tests/Frontend/` | Versand-Schätzung auf der Produktseite, Aufschlüsselung im Warenkorb, Sendungen im Konto |
| **Vertrag** | `docs/contract/` | Store-API, Schema der Cart-Extension `lvShipping`, Beispielfälle mit Sollwerten |
| gemeinsam | `docs/`, `README.md`, `CLAUDE.md`, `composer.json` | Doku, Version |

## Branches

- `main`: immer lauffähig und im Shop getestet.
- `contract/<thema>` → zuerst nach `main`; danach `backend/<thema>` bzw. `frontend/<thema>`.
- Arbeits-Branches holen sich regelmäßig `main`. Kein Force-Push.

## Arbeitskopien

- Backend: `~/projekte/sw6-entwicklung-lohndruckerei/sw6-vectura` (im Container eingebunden als `LdVectura`)
- Frontend: `~/projekte/sw6-entwicklung-lohndruckerei/sw6-vectura-frontend` als `git worktree`, sobald es etwas anzuzeigen gibt (ab Schritt 2F),
  wie `sw6-mensura-frontend`.

## Beispielfälle (geplant)

`docs/contract/fixtures/cart/*.request.json` + `*.expected.json`: Positionen (Material, Format, Menge, Quelle,
Fertigstellung), Lieferanschrift, Versandart → erwartete Beträge, Termine und Hinweise. Erste Fälle aus
KONZEPT Abschnitt 5 (Aluverbund 1000 × 1000, Hartschaum 1832 × 288, Mehrquellen Alu + Folie, Österreich, Insel).
Die Rechenbausteine müssen sie ohne Shop exakt treffen (PHPUnit), das Frontend testet gegen dieselben Dateien.
