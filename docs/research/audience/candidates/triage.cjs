const fs=require("fs");
const h=fs.readFileSync(process.argv[2],"utf8").split("\n").map(JSON.parse);
const STRONG=/\bDanes?\b|\bDanish (student|applicant|citizen|family|families|IB student|passport|reader|school leaver|pupil|teenager|parent|resident|national|people|household|EHIC|ID|health|insurance|bank|address|citizenship|nationals?)s?\b|\b(from|at|near|close to|away from|leaving|leave|left) home\b|\bhome (country|market|university|system|student)s?\b|\byour (own )?country\b|\bDKK\b|\bkroner\b|\bSU\b|\bSU-|Statens Uddannelsesst|\bfrom Denmark\b|Danish perspective|\bleav(e|ing) Denmark\b|here in Denmark|back in Denmark|\bto Denmark\b|\bCPR\b|MitID|NemID|\bneighbou?r|\bfamiliar\b|\bjust across\b|\bnearby\b|\bour country\b|\bDanish SU\b|you are Danish|if you are Danish|non-Danish|as a Dane|Danish-born|Danish A\b|Danish-speaking|speak Danish|abroad/i;
const out={auto:[],manual:[],weak:[]};
for(const x of h){
  const isComment = x.file.startsWith("src/") && /^(\/\/|\/?\*)/.test(x.text);
  const isExcerpt = /^data\/evidence\//.test(x.file) && (/excerpt$|sourceCheck|\.quote$|\.url$|\.title$/.test(x.path));
  const isUrl = /(^|\.)(url|href|source|sourceUrl)$/.test(x.path) || /^https?:\/\//.test(x.text);
  if(isComment){out.auto.push({...x,why:"code comment, not rendered"});continue;}
  if(isExcerpt){out.auto.push({...x,why:"verbatim source excerpt"});continue;}
  if(isUrl){out.auto.push({...x,why:"URL"});continue;}
  if(STRONG.test(x.text)) out.manual.push(x); else out.weak.push(x);
}
for(const k of Object.keys(out)) fs.writeFileSync(process.argv[3]+"/"+k+".jsonl",out[k].map(x=>JSON.stringify(x)).join("\n"));
const g=(a)=>{const c={};for(const x of a){const k=x.file.split("/").slice(0,2).join("/");c[k]=(c[k]||0)+1;}return c;};
console.log("auto",out.auto.length,"manual",out.manual.length,g(out.manual),"weak",out.weak.length,g(out.weak));
