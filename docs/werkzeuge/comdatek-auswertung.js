/*
 * Auswertung der Comdatek-Aufträge (connect.comdatek.de) für das Vectura-Konzept.
 *
 * Nutzung: eingeloggt auf https://connect.comdatek.de eine Seite öffnen, dieses Skript in der
 * Browser-Konsole ausführen, warten bis `__cd.done === true`, dann `vecturaCsv()` aufrufen.
 * Liest je Auftrag: Service, Zusatzkosten (= Versandkosten), Positionen (Preis, Material,
 * Kaschierung, Stückzahl, Endformat). Lieferadressen werden NICHT ausgegeben.
 *
 * SEITEN = Anzahl Listenseiten (25 Aufträge je Seite).
 */
const SEITEN = 10;

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

window.vecturaCsv = () => {
    const num = (s) => (s ? parseFloat(s.replace(/[^\d,.-]/g, '').replace(/\./g, '').replace(',', '.')) : 0);
    const de = (n) => String(+n.toFixed(2)).replace('.', ',');
    const rows = window.__cd.orders.map((o) => {
        let val = 0, maxL = 0, area = 0;
        for (const p of o.pos) {
            val += num(p.price);
            const m = (p.fmt || '').match(/(\d+)\s*x\s*(\d+)/);
            const q = parseInt((p.qty || '1').match(/\d+/)?.[0] || '1', 10);
            if (m) { maxL = Math.max(maxL, +m[1], +m[2]); area += (m[1] * m[2] / 1e6) * q; }
        }
        const alu = o.pos.every((p) => /aluminiumverbund/i.test((p.mat || '') + ' ' + (p.kasch || '')));
        const mats = o.pos.map((p) => `${p.mat}${p.kasch ? ' ' + p.kasch : ''} ${p.fmt} x${(p.qty || '').split(' ')[0]}`).join(' | ');
        return [o.nr, o.date, o.service, o.country, de(num(o.extra)), de(val), maxL, de(area), o.pos.length, alu ? 'ja' : 'nein', '"' + mats.replace(/"/g, "'") + '"'].join(';');
    });
    return ['auftrag;datum;service;land;versand_ek;warenwert_ek;laengste_seite_mm;flaeche_m2;positionen;nur_aluverbund;materialien', ...rows].join('\n');
};
