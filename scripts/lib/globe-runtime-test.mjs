/** Execute the real globe mount, animation frames and event handlers.
 * WebGL and DOM are doubles: shader compilation, painted pixels and browser/phone
 * layout require separate browser review. This catches JS runtime/interaction
 * failures that source-pattern checks miss, including dependencies removed with
 * a drawing mode. Time, frame callbacks and input fixtures are deterministic.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import { pathToFileURL } from 'node:url';
export async function runGlobeRuntimeTests() {
  const ROOT = path.resolve(import.meta.dirname, '../..');
  const FILE = path.join(ROOT, 'src/assets/js/globe.js');
  const source = (await fs.readFile(FILE, 'utf8')).replace('export async function mountGlobe', 'async function mountGlobe').replaceAll('import.meta.url', JSON.stringify(pathToFileURL(FILE).href));
  const allGeo = JSON.parse(await fs.readFile(path.join(ROOT, 'data/geo/countries.json'), 'utf8'));
  const geo = { countries: allGeo.countries.filter(x => ['dk','nl','ca'].includes(x.id)) };
  const destinations = [
    { code:'dk', name:'Denmark', continent:'europe', continentName:'Europe', href:'/denmark/' },
    { code:'nl', name:'Netherlands', continent:'europe', continentName:'Europe', href:'/countries/netherlands/' },
    { code:'ca', name:'Canada', continent:'north-america', continentName:'North America', href:'/countries/canada/' },
  ];
  const fixtures = [
    { id:'dk', name:'Denmark', lat:56, lon:10, country:'dk', precision:'region', href:'/denmark/', count:2, schools:[
      {id:'dk-aa', inst:'dk-aa', name:'Aarhus University', lat:56.17,lon:10.2,href:'/universities/dk-aa/'},
      {id:'dk-co', inst:'dk-co', name:'University of Copenhagen', lat:55.68,lon:12.57,href:'/universities/dk-co/'}]},
    { id:'nl', name:'Netherlands', lat:52, lon:5, country:'nl', precision:'region', href:'/countries/netherlands/', count:2, schools:[
      {id:'nl-ut', inst:'nl-ut', name:'Utrecht University', lat:52.09,lon:5.12,href:'/universities/nl-ut/'},
      {id:'nl-am', inst:'nl-am', name:'University of Amsterdam', lat:52.37,lon:4.9,href:'/universities/nl-am/'}]},
    { id:'ca', name:'Canada', lat:57, lon:-100, country:'ca', precision:'region', href:'/countries/canada/', count:2, schools:[
      {id:'ca-to', inst:'ca-to', name:'University of Toronto', lat:43.65,lon:-79.38,href:'/universities/ca-to/'},
      {id:'ca-ub', inst:'ca-ub', name:'University of British Columbia', lat:49.26,lon:-123.25,href:'/universities/ca-ub/'}]},
  ];
  function makeRun({phone=false,reduced=false,single=false,hash=''}={}) {
    let time=10000, seq=0, draws=0, rafs=new Map(), timers=new Map();
    // Canvas calls intentionally do no drawing; only the JS caller is exercised.
    const requested=[], choices=[], mutations=[];
    const glConstants=new Map();
    const gl=new Proxy({}, {get(t,k) {
      if(k in t) return t[k];
      if(k.startsWith('__')) return undefined;
      if(/^[A-Z0-9_]+$/.test(k)) { if(!glConstants.has(k))glConstants.set(k,glConstants.size+1); return glConstants.get(k); }
      if(k==='getShaderParameter') return ()=>true;
      if(k==='getProgramParameter') return (p,v)=>v===gl.ACTIVE_UNIFORMS?0:true;
      if(k==='getExtension') return ()=>null;
      if(k==='getParameter') return ()=> 'mock hardware';
      if(k==='getAttribLocation') return ()=>0;
      if(k.startsWith('create')) return ()=>({});
      if(k==='drawArrays'||k==='drawElements') return ()=>{draws++;};
      return ()=>{};
    }});
    const ctx2d=new Proxy({}, {get(t,k) {
      if(k in t)return t[k];
      if(k==='getImageData')return(x,y,w,h)=>({data:new Uint8ClampedArray(w*h*4)});
      if(k==='measureText')return text=>({width:String(text).length*7});
      if(k==='createLinearGradient')return()=>({addColorStop(){}});
      return ()=>{};
    }});
    // Only the selectors used by globe.js are needed by these DOM doubles.
    function simpleMatches(n,s) {
      if(s.includes(':not([hidden])')&&n.hidden)return false;
      s=s.replaceAll(':not([hidden])','');
      const tag=s.match(/^[a-z0-9-]+/i)?.[0]; if(tag&&n.tagName!==tag.toUpperCase())return false;
      for(const m of s.matchAll(/\.([\w-]+)/g)) if(!n.classList.contains(m[1]))return false;
      for(const m of s.matchAll(/\[([^\]=]+)(?:="?([^\]"]+)"?)?\]/g)) {
        if(!n.hasAttribute(m[1]))return false;
        if(m[2]!==undefined&&n.getAttribute(m[1])!==m[2])return false;
      }
      return true;
    }
    function matches(n,s) { return s.split(',').some(part=>{
      const bits=part.trim().split(/\s+/); if(!simpleMatches(n,bits.pop()))return false;
      let up=n.parentNode;
      while(bits.length){const b=bits.pop();while(up&&!simpleMatches(up,b))up=up.parentNode;if(!up)return false;up=up.parentNode;}
      return true;
    }); }
    class N {
      constructor(tag='div'){this.tagName=tag.toUpperCase();this.children=[];this.parentNode=null;this.dataset={};this.attrs=new Map();this.events=new Map();this._text='';this.hidden=false;this.width=0;this.height=0;this.style={setProperty(k,v){this[k]=v;},removeProperty(k){delete this[k];}};this.classes=new Set();this.classList={add:(...a)=>a.forEach(x=>this.classes.add(x)),remove:(...a)=>a.forEach(x=>this.classes.delete(x)),contains:x=>this.classes.has(x),toggle:(k,v)=>{v??=!this.classes.has(k);v?this.classes.add(k):this.classes.delete(k);return v;}};}
      set className(v){this.classes=new Set(String(v).split(/\s+/).filter(Boolean));}get className(){return [...this.classes].join(' ');}
      get firstChild(){return this.children[0]||null;}get firstElementChild(){return this.children.find(x=>x.tagName!=='#TEXT')||null;}get parentElement(){return this.parentNode;}get isConnected(){return this===document.documentElement||!!this.parentNode?.isConnected;}
      get offsetParent(){return this.hidden?null:this.parentNode;}get offsetWidth(){return this.getBoundingClientRect().width;}get offsetHeight(){return this.getBoundingClientRect().height;}
      set textContent(v){this.children.forEach(x=>x.parentNode=null);this.children=[];this._text=String(v);}get textContent(){return this._text+this.children.map(x=>x.textContent).join('');}
      setAttribute(k,v){v=String(v);this.attrs.set(k,v);if(k==='class')this.className=v;if(k==='hidden')this.hidden=true;if(k.startsWith('data-'))this.dataset[k.slice(5).replace(/-([a-z])/g,(_,c)=>c.toUpperCase())]=v;if(k==='href'||k==='src'||k==='id')this[k]=v;}
      getAttribute(k){if(k==='class')return this.className;if(k==='hidden')return this.hidden?'':null;if(k.startsWith('data-'))return this.dataset[k.slice(5).replace(/-([a-z])/g,(_,c)=>c.toUpperCase())]??null;return this.attrs.get(k)??null;}
      hasAttribute(k){return this.getAttribute(k)!==null;}removeAttribute(k){this.attrs.delete(k);if(k==='hidden')this.hidden=false;if(k.startsWith('data-'))delete this.dataset[k.slice(5).replace(/-([a-z])/g,(_,c)=>c.toUpperCase())];}
      toggleAttribute(k,v){v??=!this.hasAttribute(k);v?this.setAttribute(k,''):this.removeAttribute(k);return v;}
      append(...nodes){for(let n of nodes){if(typeof n==='string'){const text=new N('#text');text.textContent=n;n=text;}n.remove();this.children.push(n);n.parentNode=this;}}
      prepend(...nodes){for(const n of [...nodes].reverse()){n.remove();this.children.unshift(n);n.parentNode=this;}}
      before(...nodes){if(!this.parentNode)return;for(const n of nodes){n.remove();const i=this.parentNode.children.indexOf(this);this.parentNode.children.splice(i,0,n);n.parentNode=this.parentNode;}}
      after(...nodes){if(!this.parentNode)return;let cursor=this;for(const n of nodes){n.remove();const p=cursor.parentNode,i=p.children.indexOf(cursor);p.children.splice(i+1,0,n);n.parentNode=p;cursor=n;}}
      remove(){if(this.parentNode){const p=this.parentNode;p.children.splice(p.children.indexOf(this),1);this.parentNode=null;}}
      replaceChildren(...nodes){this.children.forEach(x=>x.parentNode=null);this.children=[];this._text='';this.append(...nodes);}
      contains(n){return n===this||this.children.some(c=>c.contains(n));}
      querySelectorAll(s){return this.children.flatMap(c=>[...(matches(c,s)?[c]:[]),...c.querySelectorAll(s)]);}querySelector(s){return this.querySelectorAll(s)[0]||null;}
      closest(s){for(let n=this;n;n=n.parentNode)if(matches(n,s))return n;return null;}
      addEventListener(k,f){if(!this.events.has(k))this.events.set(k,[]);this.events.get(k).push(f);}removeEventListener(k,f){this.events.set(k,(this.events.get(k)||[]).filter(x=>x!==f));}
      dispatchEvent(e){e.target??=this;for(const fn of this.events.get(e.type)||[])fn(e);return !e.defaultPrevented;}
      getBoundingClientRect(){const stage=this.classList.contains('world__stage');const w=stage?(phone?360:1000):this.classList.contains('world__card')?(phone?360:250):Math.max(12,this.textContent.length*7);const h=stage?(phone?360:600):this.classList.contains('world__card')?150:24;return {x:0,y:0,left:0,top:0,right:w,bottom:h,width:w,height:h};}
      getContext(type){return type==='2d'?ctx2d:gl;}focus(){document.activeElement=this;}scrollIntoView(){}setPointerCapture(){}releasePointerCapture(){}animate(){return {finished:Promise.resolve()};}
    }
    const document=new N('document');document.documentElement=new N('html');document.documentElement.dataset.base='/';document.body=new N('body');document.documentElement.append(document.body);document.activeElement=document.body;document.hidden=false;document.createElement=tag=>new N(tag);document.createElementNS=(_,tag)=>new N(tag);document.createTextNode=text=>{const n=new N('#text');n.textContent=text;return n;};document.querySelectorAll=s=>document.documentElement.querySelectorAll(s);
    if(reduced)document.documentElement.setAttribute('data-motion','reduced');
    const figure=new N('figure');figure.id=single?'country-map':'discover-map';figure.dataset={unit:'degrees',layer:'Study options'};
    const stage=new N('div');stage.className='world__stage';const list=new N('ul');list.className='world__list';const caption=new N('figcaption');caption.className='world__caption';const data=new N('script');data.className='world__data';
    const places=single?fixtures[0].schools.map(q=>({...q,country:'dk',precision:'institution',count:2})):structuredClone(fixtures);data.textContent=JSON.stringify(places);
    for(const p of places){const a=new N('a');a.setAttribute('data-place',p.id);a.setAttribute('href',p.href);const badge=new N('span');badge.className='world__count';a.append(badge);list.append(a);}
    stage.append(data);figure.append(stage,list,caption);document.body.append(figure);figure.addEventListener('world:choose', e=>choices.push(e.detail));
    const location={search:'?map=globe',hash,pathname:'/',href:'https://example.test/?map=globe'+hash,assign(href){this.href=href;}};
    const history={state:null,pushState(state,_,url){this.state=state;if(url?.startsWith('#'))location.hash=url;},replaceState(state){this.state=state;}};
    const window=new N('window');window.devicePixelRatio=2;window.requestIdleCallback=fn=>{timers.set(++seq,{fn,at:time+1});return seq;};
    const observe=class{constructor(fn){this.fn=fn;}observe(){}disconnect(){}};
    const media=q=>({matches:q.includes('max-width')?phone:q.includes('coarse')?phone:q.includes('reduced-motion')?reduced:false,addEventListener(){},removeEventListener(){}});
    const context = {
      document, window, location, history, URL, URLSearchParams, console,
      matchMedia: media, navigator: { platform: 'test' }, performance: { now: () => time },
      getComputedStyle: () => ({ getPropertyValue: () => '', scrollPaddingTop: '88px' }),
      innerHeight: 1000, scrollY: 0, scrollTo() {},
      ResizeObserver: observe, IntersectionObserver: observe,
      MutationObserver: class extends observe { constructor(fn) { super(fn); mutations.push(this); } },
      Image: class extends N { constructor() { super('img'); } },
      CustomEvent: class {
        constructor(type, opts = {}) { this.type = type; this.detail = opts.detail; this.cancelable = opts.cancelable; }
        preventDefault() { this.defaultPrevented = true; }
      },
      requestAnimationFrame: fn => { rafs.set(++seq, fn); return seq; },
      cancelAnimationFrame: id => rafs.delete(id),
      setTimeout: (fn, ms = 0) => { timers.set(++seq, { fn, at: time + ms }); return seq; },
      clearTimeout: id => timers.delete(id),
      fetch: async url => {
        requested.push(String(url));
        return { ok: true, json: async () => String(url).includes('destinations') ? destinations : geo };
      },
    };
    window.requestAnimationFrame=context.requestAnimationFrame;
    const mount=vm.runInNewContext(source+'\nmountGlobe;',context,{filename:FILE});
    async function frames(n=10){for(let i=0;i<n;i++){time+=16;const callbacks=[...rafs.values()];rafs.clear();for(const fn of callbacks)fn(time);for(const [id,t] of [...timers])if(t.at<=time){timers.delete(id);t.fn();}await Promise.resolve();}}
    function event(type,values={}){const e={type,target:stage,pointerType:'touch',pointerId:1,button:0,clientX:150,clientY:150,detail:1,preventDefault(){this.defaultPrevented=true;},...values};stage.dispatchEvent(e);return e;}
    return {mount,figure,stage,document,frames,event,requested,choices,location,setReduced(){document.documentElement.setAttribute('data-motion','reduced');mutations.forEach(o=>o.fn());},get time(){return time;},advance(ms){time+=ms;},get draws(){return draws;}};
  }
  // Both navigation modes, pointer types and motion preferences run from mount.
  for(const options of [{},{phone:true},{reduced:true},{phone:true,reduced:true},{single:true},{single:true,phone:true},{phone:true,reduced:true,hash:'#region=europe'}]) {
    const name=JSON.stringify(options);const run=makeRun(options);let fails=[];
    try {
      const api=await run.mount(run.figure,{onFail:why=>fails.push(why)});
      await run.frames(12);assert.equal(run.figure.dataset.globe,'on');assert.ok(run.draws>0);assert.deepEqual(fails,[]);if(options.hash){assert.equal(api.debug.lv.region,'europe');assert.deepEqual([...run.choices.at(-1).nations],['dk','nl']);}
      if(!options.single){
        assert.equal(api.debug.levels,true);
        assert.equal(api.show({region:'europe'}),true);await run.frames(130);assert.equal(api.debug.lv.level,'region');assert.equal(run.choices.at(-1).kind,'region');assert.deepEqual([...run.choices.at(-1).nations],['dk','nl']);
        assert.equal(api.show({country:'dk'}),true);await run.frames(130);assert.equal(api.debug.lv.country,'dk');
        api.show({bounds:{north:70,south:40,west:-10,east:30},label:'Nearby'});await run.frames(130);api.show({country:'dk'});await run.frames(130);assert.equal(run.choices.at(-1).kind,'country');assert.equal(run.choices.at(-1).id,'dk');
        api.setCounts(new Map([['nl',1],['nl-ut',2]]));await run.frames(5);const schools=api.debug.places.flatMap(p=>p.subs);assert.equal(schools.find(p=>p.id==='dk-aa').dim,true);assert.equal(schools.find(p=>p.id==='nl-ut').dim,false);const hit=api.debug.hits().find(h=>h.key==='s:dk-aa');assert.ok(hit,'country school hit missing');run.event('click',{target:schools.find(p=>p.id==='dk-aa').node,clientX:hit.x,clientY:hit.y});assert.equal(run.location.href,'/universities/dk-aa/');assert.equal(schools.find(p=>p.id==='nl-ut').dim,false);
        assert.equal(api.show({place:'dk-aa'}),true);await run.frames(5);
        api.reset();await run.frames(130);assert.equal(api.debug.lv.level,'world');
      }else{
        api.setCounts(new Map([['dk-aa',3]]),{selected:'dk-aa'});await run.frames(5);assert.equal(api.debug.places.find(p=>p.id==='dk-aa').selected,true);assert.equal(api.debug.places.find(p=>p.id==='dk-co').dim,true);
        api.show({country:'dk'});await run.frames(130);
        api.show({place:'dk-aa'});await run.frames(130);
        api.reset();await run.frames(130);
      }
      run.event('pointerdown');run.event('pointermove',{clientX:180,clientY:152});run.event('pointerup',{clientX:180,clientY:152});await run.frames(8);
      run.event('pointerdown',{pointerId:2,clientX:180});run.event('pointerdown',{pointerId:3,clientX:240});run.event('pointermove',{pointerId:3,clientX:260});run.event('pointerup',{pointerId:2,clientX:180});run.event('pointerup',{pointerId:3,clientX:260});await run.frames(130);
      run.event('wheel',{ctrlKey:true,deltaY:100,deltaMode:0});await run.frames(130);
      const view=api.debug.view;for(const k of ['lat','lon','alt'])assert.ok(Number.isFinite(view[k]),`${k} not finite`);
      if(!options.reduced){api.debug.flyTo({lat:45,lon:10,alt:0.6});await run.frames(2);run.setReduced();assert.equal(api.debug.view.lat,45);assert.equal(api.debug.view.lon,10);assert.equal(api.debug.view.alt,0.6);await run.frames(5);assert.equal(api.debug.view.lon,10);}
      assert.deepEqual(fails,[]);api.destroy();
    } catch (error) { throw new Error(`Globe runtime ${name}: ${error.message}`, { cause: error }); }
  }
  return 7;
}
