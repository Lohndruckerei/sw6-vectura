# Projekt: sw6-vectura (Shopware 6 Plugin „Vectura“ der Lohndruckerei)

Arbeitsname „Vectura“ – Versand-, Verpackungs- und Servicekosten, Zustelltermine, Sendungen.
Konzept und offene Entscheidungen: docs/KONZEPT.md · technische Umsetzung: docs/UMSETZUNG.md ·
Liefer-Countdown/Terminplanung (Modul „Termine“): docs/TERMINE.md ·
Backend/Frontend, Branches und Vertrag: docs/ENTWICKLUNG.md (bei Änderungen mitpflegen).

## Umgebung
- Shopware 6.7 läuft lokal im gemeinsamen Docker-Container "shopware" (Compose, siehe ../CLAUDE.md)
- Dieser Ordner ist im Container eingebunden unter: /var/www/html/custom/plugins/LdVectura
- Shopware-Befehle im Container, z. B.:
  docker exec shopware bash -c "cd /var/www/html && bin/console plugin:refresh"
- Shop: http://localhost, Administration: http://localhost/admin

## Plugin
- Technischer Name: LdVectura
- Namespace: Lohndruckerei\Vectura
- Tabellen-/Entity-Präfix: `ld_vectura_`, ACL-Schlüssel `ld_vectura` (Rollen viewer, editor, cost, admin)
- Admin: Modul `ld-vectura` (Routen `ld.vectura.*`), Komponenten-/CSS-Präfix `lv-`

## Konventionen
- PHP 8.2+, strict_types, Shopware-Coding-Standards
- Texte und Snippets auf Deutsch (de-DE) und Englisch (en-GB)
- Keine Fremdplugins als Abhängigkeit; Composer-Bibliotheken sind erlaubt
- Shopware erweitern, nicht ersetzen: Versandarten, Länder, Regeln, `order_delivery` und Sendungsnummern bleiben
  Shopware-Standard; Vectura berechnet Beträge, Termine und verwaltet Sendungen
- Unabhängig von Mensura und LieferLotse lauffähig; nur lose koppeln (IDs ohne Fremdschlüssel, Payload, Events)
- Admin-Design kommt aus ~/projekte/sw6-entwicklung-lohndruckerei/ld-admin-design – dort ändern, nicht lokal:
  `src/Resources/app/administration/src/ld-admin-design/` ist generiert (`./sync.sh vectura`, Präfix `lv-`,
  Store `lvDesign`, Mixin `lv-design`); Regeln in dessen DESIGN.md
- Jedes Feld mit Hilfetext und Praxisbeispiel, Erklärkarten, Simulator statt Rätselraten
- Preise netto, nur B2B. Einkaufskosten (EK-Regeln, Schnappschuss, Deckung) nur mit eigenem Recht, serverseitig
  geschützt, nie in die Store-API
- Beträge immer serverseitig berechnen
- Kleine, nachvollziehbare Schritte; nach jedem Schritt im Shop testen

## Git
- Repository: git@github.com:Lohndruckerei/sw6-vectura.git (vom Benutzer anzulegen)
- Zugriff über Deploy-Key `~/.ssh/vectura_deploy` (in `core.sshCommand` hinterlegt, ohne Passphrase)
- Nach jedem abgeschlossenen und im Shop getesteten Schritt committen und den aktuellen Branch pushen;
  halbfertige Zwischenstände nicht pushen. Kurz melden, was gepusht wurde (Commit-Hash).
- Nie force-pushen und keine Historie umschreiben, außer der Benutzer verlangt es ausdrücklich.
