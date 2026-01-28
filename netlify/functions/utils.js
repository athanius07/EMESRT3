
const crypto = require('crypto');
const { getStore } = require('@netlify/blobs');

function classify(cat){
  if (cat === 'mandate') return 'Law / Regulation (in force)';
  if (cat === 'subnational') return 'Sub-national guidance (non-mandatory)';
  if (cat === 'framework') return 'Industry framework (reference)';
  return cat;
}

function toPlainHtml(html){
  return html
    .replace(/<script[\s\S]*?<\/script>/gi,'')
    .replace(/<style[\s\S]*?<\/style>/gi,'')
    .replace(/<[^>]+>/g,' ');
}

async function toText(resp, url){
  const buf = Buffer.from(await resp.arrayBuffer());
  if (url.toLowerCase().endsWith('.pdf')){
    try {
      const txt = buf.toString('utf8');
      if (txt && txt.trim().length > 80) return txt;
    } catch {}
    return '';
  }
  try { return toPlainHtml(buf.toString('utf8')); } catch { return ''; }
}

function extract(text){
  const levels = Array.from(text.matchAll(/\bLevel(?:s)?\s*(7|8|9)\b/gi)).map(m=>`L${m[1]}`);
  const yearMatches = Array.from(text.matchAll(/(?:(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+\d{1,2},\s+(\d{4}))|(\b(19|20)\d{2}\b)/g));
  const years = yearMatches.map(m => m[2] ? parseInt(m[2],10) : (m[3] ? parseInt(m[3],10) : null)).filter(Boolean);
  const year = years.length ? Math.max(...years) : null;
  const scopeTags = [];
  if (/trackless\s+mobile\s+machin|\bTMM\b/i.test(text)) scopeTags.push('TMM');
  if (/light\s+vehicle|\bLV\b/i.test(text)) scopeTags.push('LV');
  if (/haul|loader|LHD|excavator|mobile\s+equipment/i.test(text)) scopeTags.push('HME');
  if (/underground/i.test(text)) scopeTags.push('Underground');
  if (/surface/i.test(text)) scopeTags.push('Surface');
  return {
    levels: Array.from(new Set(levels)).sort(),
    year,
    scope: scopeTags.length ? Array.from(new Set(scopeTags)).join(', ') : 'Unspecified'
  };
}

function keyOf(row){ return `${row.Country}|${row['Jurisdiction/Body']}|${row.URL}`; }
function hashRows(rows){ const sorted = [...rows].sort((a,b)=> keyOf(a).localeCompare(keyOf(b))); return crypto.createHash('sha256').update(JSON.stringify(sorted)).digest('hex'); }

function diffRows(prevRows, nextRows){
  const prevMap = new Map(prevRows.map(r => [keyOf(r), r]));
  const nextMap = new Map(nextRows.map(r => [keyOf(r), r]));
  const added = [], removed = [], changed = [];
  for (const [k, v] of nextMap){
    if (!prevMap.has(k)) added.push(v);
    else { const pv = prevMap.get(k); if (JSON.stringify(pv) !== JSON.stringify(v)) changed.push({ before: pv, after: v }); }
  }
  for (const [k, v] of prevMap){ if (!nextMap.has(k)) removed.push(v); }
  return { added, removed, changed };
}

async function saveCache(dataset){
  const store = getStore('emesrt-cache');
  const hash = hashRows(dataset.rows);
  const existing = await store.get('latest', { type: 'json' });
  let changelog = await store.get('changelog', { type: 'json' }) || [];
  if (!existing || existing.hash !== hash){
    let delta = null; if (existing && existing.rows){ delta = diffRows(existing.rows, dataset.rows); }
    const entry = { ts: new Date().toISOString(), hash, count: dataset.rows.length, delta };
    changelog.unshift(entry); changelog = changelog.slice(0, 50);
    await store.set('latest', JSON.stringify({ ...dataset, hash }), { metadata: { hash } });
    await store.set('changelog', JSON.stringify(changelog));
  }
}

async function getCache(){
  const store = getStore('emesrt-cache');
  const latest = await store.get('latest', { type: 'json' });
  const changelog = await store.get('changelog', { type: 'json' }) || [];
  return { latest, changelog };
}

module.exports = { classify, toText, extract, saveCache, getCache, hashRows, diffRows };
