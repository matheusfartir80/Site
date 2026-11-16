const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const path = require('node:path');
const root = process.argv[2];
const script = fs.readFileSync(path.join(root, 'cut/cut-i18n.js'), 'utf8');
const configScript = fs.readFileSync(path.join(root, 'cut/cut-config.js'), 'utf8');
let checks = 0;
function ok(value, label) { assert.ok(value, label); checks++; }
function element() {
  const attrs = {};
  const label = {textContent:''};
  const children = [];
  return {attrs, label, children, hidden:false, textContent:'', innerHTML:'', classList:{add(){}, remove(){}, toggle(){}},
    get href(){return attrs.href;}, set href(v){attrs.href=v;},
    get src(){return attrs.src;}, set src(v){attrs.src=v;},
    setAttribute(k,v){attrs[k]=v;}, getAttribute(k){return attrs[k] ?? null;}, removeAttribute(k){delete attrs[k];},
    querySelector(s){if(s==='[data-btn-label]')return label; if(s==='source[type="video/webm"]')return children.find(c=>c.type==='video/webm')||null; return null;},
    appendChild(c){children.push(c);}, load(){}, addEventListener(){}};
}
function render(overrides={}, lang='pt-BR') {
  const nodes = Object.fromEntries(['download-btn','nav-primary','checkout-btn','buy-pending-notice','demo-section','demo-video'].map(k=>[k,element()]));
  const statuses = [element(),element()];
  const price = element(); price.setAttribute('data-i18n','hero_price_line');
  const document = {
    documentElement:{classList:{add(){}}, lang:'', dir:''},
    body:{getAttribute(){return 'home';}},
    querySelector(sel) {const match = sel.match(/^\[data-role="([^"]+)"\]$/);return match ? nodes[match[1]] || null : null;},
    querySelectorAll(sel) {
      if(sel==='[data-role="download-btn"]')return [nodes['download-btn']];
      if(sel==='[data-role="trial-status"]')return statuses;
      if(sel==='[data-i18n]')return [price];
      return [];
    }, addEventListener(){}, createTextNode(v){return v;}, createElement(){return element();}
  };
  const window = {location:{href:'http://127.0.0.1:8765/cut/', origin:'http://127.0.0.1:8765',search:''},localStorage:{setItem(){},getItem(){return null;}}};
  const ctx = vm.createContext({window,document,navigator:{language:lang},URL,URLSearchParams,Intl,Date,console});
  vm.runInContext(configScript,ctx);
  Object.assign(window.CUT_CONFIG,overrides);
  vm.runInContext(script,ctx);
  window.CUT_I18N.setLang(lang);
  return {nodes,statuses,price,document,strings:window.CUT_I18N.STRINGS};
}
const a=render();
ok(a.nodes['download-btn'].href.startsWith('https://wa.me/5531993811525?text='),'Prelaunch contact destination');
ok(a.nodes['download-btn'].label.textContent==='Saber do lançamento','Prelaunch label');
ok(a.nodes['nav-primary'].href==='#como-funciona','Prelaunch navigation works');
ok(!a.nodes['checkout-btn'].href,'No live checkout by default');
const noVid=render({VIDEO_DEMONSTRACAO_URL:''});
ok(noVid.nodes['demo-section'].hidden && !noVid.nodes['demo-video'].attrs.src && noVid.nodes['demo-video'].children.length===0,'No empty video request');
ok(!a.nodes['demo-section'].hidden && a.nodes['demo-video'].children.some(c=>c.src==='http://127.0.0.1:8765/cut/midia/demo-real.mp4'),'Configured local demo video loads');
ok(a.statuses[0].textContent===a.statuses[1].textContent && a.statuses[0].textContent.length>0,'Both availability notes updated');
const urls={PLAY_STORE_URL:'https://play.google.com/store/apps/details?id=test.fixture'};
const b=render(urls);
ok(!b.nodes['checkout-btn'].href && b.nodes['download-btn'].href.includes('wa.me'),'URLs alone cannot release commerce');
const d=render({...urls,PUBLICACAO_CONFIRMADA:true});
ok(d.nodes['download-btn'].href===urls.PLAY_STORE_URL,'Verified publication enables Google Play download');
ok(d.nodes['checkout-btn'].href===urls.PLAY_STORE_URL && d.nodes['buy-pending-notice'].hidden,'Verified publication enables Google Play purchase CTA');
for(const bad of ['javascript:alert(1)','http://play.google.com/store/apps/details?id=x','https://user:pass@play.google.com/store/apps/details?id=x','https://example.test/store/apps/details?id=x']) {
  ok(!render({PUBLICACAO_CONFIRMADA:true,PLAY_STORE_URL:bad}).nodes['checkout-btn'].href,'Reject unsafe or non-Play destination');
}
ok(render({VIDEO_DEMONSTRACAO_URL:'midia/demo-real.mp4'}).nodes['demo-video'].children.some(c=>c.src==='http://127.0.0.1:8765/cut/midia/demo-real.mp4'),'Relative video source');
ok(render({VIDEO_DEMONSTRACAO_URL:'javascript:alert(1)'}).nodes['demo-section'].hidden,'Unsafe video hidden');
const v=render({VIDEO_DEMONSTRACAO_URL:'https://media.example.test/demo.mp4'});
ok(!v.nodes['demo-section'].hidden,'Configured video displayed'); v.nodes['demo-video'].onerror();
ok(v.nodes['demo-section'].hidden,'Failed media hides player');
ok(render({PRECO_VALOR:19.90}).price.textContent.includes('19,90'),'Price cents preserved');
ok(render({WHATSAPP_SUPORTE:''}).nodes['download-btn'].attrs['aria-disabled']==='true','Missing contact safely disabled');
const pages=['cut/index.html','cut/buy/index.html','cut/privacidade/index.html','cut/termos/index.html','cut/refunds/index.html'];
for(const lang of Object.keys(a.strings)) {
  const r=render({},lang);
  ok(r.document.documentElement.lang===lang,'Language applied '+lang);
  ok(r.document.documentElement.dir===(lang==='ar'?'rtl':'ltr'),'Direction '+lang);
  ok(r.nodes['download-btn'].label.textContent && !r.nodes['download-btn'].href.includes('undefined'),'Localized contact '+lang);
  for (const file of pages) {
    const html=fs.readFileSync(path.join(root,file),'utf8');
    const keys=[...html.matchAll(/data-i18n(?:-marked|-aria|-alt)?="([^"]+)"/g)].map(m=>m[1]);
    ok(keys.every(k=>typeof r.strings[lang][k]==='string'),'All visible translation keys '+lang+' '+file);
  }
  ok(typeof r.strings[lang].hero_title_marked==='string'&&r.strings[lang].hero_title_marked.includes('['),'Hero headline present '+lang);
}
console.log(JSON.stringify({checks, languages:Object.keys(a.strings).length,pages:pages.length,result:'PASS',scope:'Local UI configuration and dictionaries; no remote login, payment or real media playback tested.'},null,2));
