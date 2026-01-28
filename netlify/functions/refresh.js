
const { SOURCES } = require('./sources');
const { classify, toText, extract, saveCache } = require('./utils');
const { connectLambda } = require('@netlify/blobs');

function pickAll(){ return [...SOURCES.mandates, ...SOURCES.subnational, ...SOURCES.frameworks]; }

async function aggregateAll(){
  const list = pickAll();
  const out = [];
  for (const s of list){
    try {
      const resp = await fetch(s.url, { headers: { 'User-Agent': 'Netlify-EMESRT-refresh/2.1' }});
      if (!resp.ok) throw new Error(`status ${resp.status}`);
      let text = await toText(resp, s.url);

      if (!text && process.env.AZURE_OCR_ENDPOINT && process.env.AZURE_OCR_KEY && s.url.toLowerCase().endsWith('.pdf')){
        try { const buf = Buffer.from(await resp.arrayBuffer()); text = await azureOcrPdf(buf); } catch (e) {}
      }

      const { levels, year, scope } = extract(text, s);
      let lv = levels;
      if (s.country === 'South Africa' && s.category === 'mandate' && (!lv || !lv.length)) lv = ['L9 (functional equivalent: machine intervention)'];
      if ((s.category === 'subnational' || s.category === 'framework') && (!lv || !lv.length) && /EMESRT|Earth\s*Moving\s*Equipment\s*Safety\s*Round\s*Table/i.test(text)) lv = ['L7','L8','L9'];

      out.push({
        Country: s.country,
        'Jurisdiction/Body': s.jurisdiction,
        'Instrument/Status': classify(s.category),
        Year: year || new Date().getFullYear(),
        Levels: (lv && lv.length) ? lv.join(', ') : 'Not detected',
        'Scope (LV/HME/TMM)': scope,
        Notes: s.instrument_hint || '',
        URL: s.url
      });
    } catch (err){
      out.push({ Country: s.country, 'Jurisdiction/Body': s.jurisdiction, 'Instrument/Status': 'Fetch/parse error', Year: '', Levels: '', 'Scope (LV/HME/TMM)': '', Notes: `Error: ${err}`, URL: s.url });
    }
  }
  const dataset = { generated_at: new Date().toISOString(), count: out.length, rows: out };
  await saveCache(dataset);
  return dataset;
}

async function azureOcrPdf(buffer){
  const endpoint = process.env.AZURE_OCR_ENDPOINT?.replace(/\/$/, ''), key = process.env.AZURE_OCR_KEY; if (!endpoint || !key) return '';
  const url = `${endpoint}/vision/v3.2/read/analyze`;
  const resp = await fetch(url, { method: 'POST', headers: { 'Ocp-Apim-Subscription-Key': key, 'Content-Type': 'application/pdf' }, body: buffer });
  if (!resp.ok) throw new Error(`Azure OCR submit ${resp.status}`);
  const op = resp.headers.get('operation-location'); if (!op) throw new Error('Azure OCR missing operation-location');
  let status = 'running', out = '';
  for (let i=0;i<20;i++){
    await new Promise(r=>setTimeout(r, 2000));
    const r2 = await fetch(op, { headers: { 'Ocp-Apim-Subscription-Key': key }});
    const j = await r2.json(); status = j.status;
    if (status === 'succeeded'){
      out = (j.analyzeResult.readResults||[]).map(p => p.lines.map(l=>l.text).join(' ')).join('\n');
      break;
    }
    if (status === 'failed') throw new Error('Azure OCR failed');
  }
  return out;
}

exports.handler = async (event) => {
  connectLambda(event); // initialize Blobs
  try {
    const data = await aggregateAll();
    return { statusCode: 200, body: JSON.stringify({ ok: true, generated_at: data.generated_at, count: data.count }) };
  } catch (e){
    return { statusCode: 500, body: JSON.stringify({ ok: false, error: String(e) }) };
  }
};
