const {test}=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path");
const root=path.join(__dirname,"..");
const j=JSON.parse(fs.readFileSync(path.join(root,"data/benefits.json"),"utf8"));
const status=JSON.parse(fs.readFileSync(path.join(root,"data/check-status.json"),"utf8"));
const html=fs.readFileSync(path.join(root,"index.html"),"utf8");
const parser=fs.readFileSync(path.join(root,"benefits.js"),"utf8");
test("three basic cards and six official monitoring sources",()=>{
 assert.deepEqual(j.cards.map(c=>c.id),["richart","line","air"]);
 assert.equal(j.sources.length,6);
 for(const s of j.sources){assert.ok(s.url.startsWith("https://"));assert.ok(s.anchors.length>=2)}
});
test("rights are traceable to official banks and not conflated with calculating them",()=>{
 const ids=new Set(j.sources.map(s=>s.id));
 assert.ok(j.offers.length>=25);
 for(const p of j.offers){
  assert.ok(ids.has(p.source),p.id);
  assert.ok(["richart","line","air"].includes(p.card),p.id);
  assert.ok(["auto","partial","reference"].includes(p.coverage),p.id);
  assert.ok(/^202[0-9]-\d\d-\d\d$/.test(p.start),p.id);
  assert.ok(p.start<=p.end,p.id);
  assert.ok(p.details&&p.requirements,p.id);
 }
 assert.equal(new Set(j.offers.map(p=>p.id)).size,j.offers.length);
});
test("reference-only bank offers never become guaranteed calculator results",()=>{
 for(const id of ["l_netflix","l_ikea","l_donki","l_hotels","r_esim","r_transfer","a_transfer","a_fee"]){
  assert.equal(j.offers.find(x=>x.id===id)?.coverage,"reference");
 }
});
test("button checks bank entitlements, not product version",()=>{
 assert.match(html,/id="check-update"[^>]*>檢查權益/);
 assert.match(html,/data-view="benefits"/);
 assert.match(html,/id="benefit-check-summary"/);
 assert.ok(!parser.includes("version.json"),"benefits checker must not fetch version metadata");
 assert.match(parser,/raw\.githubusercontent\.com/);
});
test("monitor data distinguishes automation from human review",()=>{
 assert.equal(status.manualReviewedAt,j.manualReviewedAt);
 assert.ok(status.checkedAt===null||!Number.isNaN(Date.parse(status.checkedAt)));
 assert.ok(Array.isArray(status.sources));
 for(const s of status.sources)assert.ok(["baseline","unchanged","changed","error","pending"].includes(s.status));
});
