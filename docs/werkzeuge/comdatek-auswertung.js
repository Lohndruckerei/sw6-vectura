/*
 * Auswertung der Comdatek-Aufträge (connect.comdatek.de) für das Vectura-Konzept.
 *
 * Nutzung: eingeloggt auf https://connect.comdatek.de eine Seite öffnen, dieses Skript in der
 * Browser-Konsole ausführen, warten bis `__cd.done === true`, dann `vecturaCsv()` aufrufen.
 * Liest je Auftrag: Service, Zusatzkosten (= Versandkosten), Positionen (Preis, Material,
 * Kaschierung, Stückzahl, Endformat). Lieferadressen werden NICHT ausgegeben.
 *
 * SEITEN = Anzahl Listenseiten (25 Aufträge je Seite, neueste zuerst). Vorgabe 20 Seiten × 25 = 500 Aufträge,
 * wie in der Datenbasis von docs/LOGISTIKPAUSCHALE.md. Andere Menge: vor dem Einfügen in der Konsole z. B.
 * `window.CD_SEITEN = 4` setzen (= 100 Aufträge).
 *
 * Spalte `warnungen`: Aufträge ohne erkannte Positionen, Fläche 0, unlesbare Formate/Preise/Zusatzkosten.
 * Solche Zeilen vor dem Import prüfen.
 */
const SEITEN = Number(window.CD_SEITEN) > 0 ? Number(window.CD_SEITEN) : 20;

window.__cd = { done: false, orders: [], err: [] };

(async () => {
    const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
    const ids = [];
    for (let p = 1; p <= SEITEN; p++) {
        const t = await (await fetch('/order/index/' + p, { credentials: 'include' })).text();
        for (const m of t.matchAll(/\/order\/detail\/(\d+)/g)) if (!ids.includes(m[1])) ids.push(m[1]);
        await sleep(200);
    }
    for (const id of ids) {
        try {
            const t = await (await fetch('/order/detail/' + id, { credentials: 'include' })).text();
            const d = new DOMParser().parseFromString(t, 'text/html');
            const txt = d.body.textContent;
            const g = (re) => { const m = txt.match(re); return m ? m[1].trim() : null; };
            const pos = txt.split(/Pos\.: /).slice(1).map((pt) => {
                const lines = pt.split('\n').map((s) => s.trim()).filter(Boolean);
                const f = (k) => { const i = lines.indexOf(k + ':'); return i >= 0 ? lines[i + 1] : null; };
                return { no: lines[0], price: lines[1], mat: f('Material'), qty: f('Stückzahl'), fmt: f('Endformat'), kasch: f('Kaschierung') };
            });
            window.__cd.orders.push({
                nr: g(/Auftrag (com-\d+)/),
                date: g(/Datum:\s*\n?\s*([\d.]+)/),
                service: g(/Service:\s*\n?\s*([^\n]+)/),
                extra: g(/Zusatzkosten:\s*\n?\s*([^\n]+)/),
                country: (g(/Lieferadresse:\s*\n([\s\S]*?)Tel/) || '').match(/[\t\n ](DE|AT|CH|NL|BE|LU|PL|IT|FR)[\t\n ]/)?.[1] || '?',
                pos,
            });
        } catch (e) {
            window.__cd.err.push(id + ': ' + e);
        }
        await sleep(150);
    }
    window.__cd.done = true;
})();

// Zahl im deutschen Format: Tausenderpunkt optional („1.000“), Dezimalkomma optional („5,90“).
const CD_ZAHL = '\\d{1,3}(?:\\.\\d{3})+(?:,\\d+)?|\\d+(?:,\\d+)?';
const cdZahl = (t) => parseFloat(t.replace(/\./g, '').replace(',', '.'));

// Erster Geldbetrag im Text: zuerst ein Betrag mit zwei Nachkommastellen, sonst die erste ganze Zahl.
// „5,90 € (inkl. 19 % MwSt.)“ → 5.9, „1.234,50 €“ → 1234.5, „12 €“ → 12, „kostenlos“/leer → null.
const cdBetrag = (s) => {
    const t = String(s || '');
    const m = t.match(/-?(?:\d{1,3}(?:\.\d{3})+|\d+),\d{2}(?!\d)/) || t.match(/-?(?:\d{1,3}(?:\.\d{3})+|\d+)/);
    return m ? cdZahl(m[0]) : null;
};

// Stückzahl, z. B. „1.000 Stück“ → 1000; nichts lesbar → null.
const cdStueck = (s) => {
    const m = String(s || '').match(/\d{1,3}(?:\.\d{3})+|\d+/);
    return m ? parseInt(m[0].replace(/\./g, ''), 10) : null;
};

// Endformat in mm, z. B. „1.000 x 500 mm“, „100 x 70 cm“, „84,1 × 118,9 cm“, „1,2 m x 0,8 m“; nichts lesbar → null.
const cdFormat = (s) => {
    const re = new RegExp('(' + CD_ZAHL + ')\\s*(mm|cm|m)?\\s*[x×*]\\s*(' + CD_ZAHL + ')\\s*(mm|cm|m)?(?![a-z])', 'i');
    const m = String(s || '').match(re);
    if (!m) return null;
    const faktor = { mm: 1, cm: 10, m: 1000 };
    const e2 = (m[4] || m[2] || 'mm').toLowerCase();
    const e1 = (m[2] || e2).toLowerCase();
    const a = cdZahl(m[1]) * faktor[e1], b = cdZahl(m[3]) * faktor[e2];
    return a > 0 && b > 0 ? [a, b] : null;
};

window.vecturaCsv = () => {
    const de = (n) => (n === null || !isFinite(n) ? '' : String(+n.toFixed(2)).replace('.', ','));
    const rows = window.__cd.orders.map((o) => {
        let val = 0, maxL = 0, area = 0;
        const warn = [];
        if (o.pos.length === 0) warn.push('keine Positionen erkannt');
        o.pos.forEach((p, i) => {
            const nr = p.no || i + 1;
            const preis = cdBetrag(p.price);
            if (preis === null) warn.push(`Pos ${nr}: Preis unlesbar`); else val += preis;
            let q = cdStueck(p.qty);
            if (q === null) { q = 1; warn.push(`Pos ${nr}: Stückzahl unlesbar, 1 angenommen`); }
            const f = cdFormat(p.fmt);
            if (f) { maxL = Math.max(maxL, f[0], f[1]); area += (f[0] * f[1] / 1e6) * q; } else warn.push(`Pos ${nr}: Format unlesbar`);
        });
        if (o.pos.length > 0 && area === 0) warn.push('Fläche 0');
        const versand = cdBetrag(o.extra);
        if (versand === null) warn.push(o.extra ? 'Zusatzkosten ohne Betrag' : 'Zusatzkosten fehlen');
        const alu = o.pos.length > 0 && o.pos.every((p) => /aluminiumverbund/i.test((p.mat || '') + ' ' + (p.kasch || '')));
        const mats = o.pos.map((p) => `${p.mat}${p.kasch ? ' ' + p.kasch : ''} ${p.fmt} x${cdStueck(p.qty) ?? '?'}`).join(' | ');
        const q = (s) => '"' + s.replace(/"/g, "'") + '"';
        return [o.nr, o.date, o.service, o.country, de(versand), de(val), Math.round(maxL), de(area), o.pos.length, alu ? 'ja' : 'nein', q(mats), q(warn.join(', '))].join(';');
    });
    return ['auftrag;datum;service;land;versand_ek;warenwert_ek;laengste_seite_mm;flaeche_m2;positionen;nur_aluverbund;materialien;warnungen', ...rows].join('\n');
};
