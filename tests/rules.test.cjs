/* Run: node --test tests/rules.test.cjs */
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const src=fs.readFileSync(path.join(__dirname,'..','rules.js'),'utf8'),ctx={};
vm.runInNewContext(src,ctx);const R=ctx.CardRules;
const config=(opts={})=>({date:'2026-11-21',level:2,cards:{richart:true,line:true,air:true},lineLinked:true,lineBonus:false,lineBonusUsed:0,birthdayMonth:0,mileValue:.4,lineValue:1,fee:1.5,...opts});
const tx=(store,amount,category='auto',method='card',region='tw',extra={})=>({store,amount,category,method,region,...extra});
test('catalog detects verified brands, not generic guesses',()=>{
 assert.equal(R.identify(tx('50嵐',65)).merchant.chill,10);
 assert.equal(R.identify(tx('momo',100)).group,'digital');
 assert.equal(R.identify(tx('隨便取的雜貨店',100)).group,'general');
});
test('Richart 7-ELEVEN + TWQR: Pay 3.8%, daily 3.3%, per-transaction floor',()=>{
 assert.equal(R.rich(tx('7-ELEVEN',85,'auto','taishin'),'pay',config()).points,3);
 assert.equal(R.rich(tx('7-ELEVEN',85,'auto','taishin'),'daily',config()).points,2);
});
test('Richart convenience + LINE Pay does not magically earn 2.3%',()=>{
 assert.equal(R.rich(tx('全家',85,'auto','linepay'),'pay',config()).points,0);
});
test('food MCC user-confirmed, floor individual transactions',()=>{
 assert.equal(R.rich(tx('一般餐廳',260,'food'),'food',config()).points,8);
 assert.equal(R.rich(tx('一般餐廳',65,'food'),'food',config()).points,2);
});
test('unknown store does not receive a named-store bonus',()=>{
 assert.equal(R.rich(tx('任意書店',1000),'digital',config()).points,3);
});
test('LEVEL 1 designated earn 1.3%',()=>{
 assert.equal(R.rich(tx('momo',1000),'digital',config({level:1})).points,13);
});
test('Pay with LINE Pay earns 2.3% if ordinary eligible',()=>{
 assert.equal(R.rich(tx('一般餐廳',500,'food','linepay'),'pay',config()).points,11);
 assert.equal(R.rich(tx('一般餐廳',500,'food','linepay'),'food',config()).points,1);
});
test('Chill 10%, no expired offer after 2026',()=>{
 assert.equal(R.rich(tx('50嵐',65),'chill',config()).points,6);
 assert.equal(R.rich(tx('50嵐',65),'chill',config({date:'2027-01-03'})).points,0);
});
test('weekends known, other weekdays not assumed public holidays',()=>{
 assert.equal(R.weekend('2026-11-21'),true);
 assert.equal(R.weekend('2026-11-20'),false);
 assert.equal(R.rich(tx('一般雜貨',1000),'holiday',config()).points,20);
 assert.equal(R.rich(tx('一般雜貨',1000),'holiday',config({date:'2026-11-20'})).points,3);
});
test('bonus cap toggle falls back to general points',()=>{
 assert.equal(R.rich(tx('momo',1000),'digital',config({bonusCapReached:true})).points,3);
});
test('insurance special baseline separately from usual general purchases',()=>{
 assert.equal(R.rich(tx('保險',1000,'insurance'),'daily',config()).points,13);
});
test('LINE Pay requires active linked account and 2026 activity date',()=>{
 assert.equal(R.line(tx('momo',1000),config({lineLinked:false})),null);
 assert.equal(R.line(tx('momo',1000),config({date:'2027-01-01'})),null);
});
test('LINE Pay domestic 1%, foreign physical 2.8%, foreign online 1%',()=>{
 assert.equal(R.line(tx('momo',1000),config()).points,10);
 assert.equal(R.line(tx('一般店',1000,'general','apple','abroad'),config()).points,28);
 assert.equal(R.line(tx('一般店',1000,'general','card','abroadonline'),config()).points,10);
});
test('LINE registered additional 2.2%, event balance 450',()=>{
 const c=config({lineBonus:true});
 assert.equal(R.line(tx('海外店',1000,'general','card','abroad'),c,0).points,50);
 assert.equal(R.line(tx('海外店',1000,'general','card','abroad'),c,448).points,30);
});
test('China Airlines business signature normal / 2x / birthday 3x',()=>{
 assert.equal(R.air(tx('一般店',600),config()).points,20);
 assert.equal(R.air(tx('華航',600,'travel','card','tw',{airDouble:true}),config()).points,40);
 assert.equal(R.air(tx('一般海外商店',600,'general','card','abroad'),config()).points,40);
 assert.equal(R.air(tx('德國商店',600,'general','card','europe'),config()).points,0);
 assert.equal(R.air(tx('海外店',600,'general','card','abroad'),config({birthdayMonth:11})).points,60);
});
test('2027 unknown CTBC policies not modeled as zero-return options',()=>{
 const s=config({date:'2027-01-02'});assert.equal(R.line(tx('店',1000),s),null);assert.equal(R.air(tx('店',1000),s),null);
 assert.equal(R.compare(tx('店',1000),'daily',s).length,1);
});
test('Richart-only optimizer considers the whole Taiwan day, not each transaction alone',()=>{
 const e=[tx('7-ELEVEN',85,'auto','taishin'),tx('一般餐廳',260,'food'),tx('50嵐',65)];
 assert.equal(R.optimize(e,config()).richOnly.key,'food');
});
test('user preference: Richart wins equivalent value ties',()=>{
 const e=tx('momo',1000);const options=R.compare(e,'daily',config({mileValue:0,lineValue:.3}));
 assert.equal(options[0].card,'richart');
});
test('no negative / unsupported amount in catalog matching',()=>{
 assert.equal(R.merchants('blah').length,0);
 assert.equal(R.floorPoints(65,10),6);
});

test('merchant match avoids NET false positives and accepts verified store branches',()=>{
 assert.equal(R.merchants('internet cafe').some(x=>x.name==='NET'),false);
 assert.equal(R.merchants('50嵐台北車站店')[0].name,'50嵐');
});
test('whole-day card selection honors scarce remaining foreign promotion cap globally',()=>{
 const s=config({lineBonus:true,lineBonusUsed:440,fee:0,cards:{richart:true,line:true,air:false}});
 const e=[tx('海外小店',250,'general','card','abroad'),tx('海外大店',450,'general','card','abroad')];
 const v=R.optimize(e,s);
 assert.equal(v.recommended.key,'travel');
 assert.equal(v.recommended.total,31);
 assert.equal(v.recommended.rec[0].chosen.card,'richart');
 assert.equal(v.recommended.rec[1].chosen.card,'line');
 assert.equal(v.recommended.rec[1].chosen.extra,10);
});
test('convenience stores lose even base rewards when the special bonus cap is exhausted',()=>{
 const s=config({bonusCapReached:true});
 assert.equal(R.rich(tx('7-ELEVEN',1000,'auto','taishin'),'pay',s).points,0);
});

test('Chill-only merchants cannot silently qualify for unrelated regular plans',()=>{
 const s=config();
 assert.equal(R.rich(tx('Nike',1000),'large',s).points,3);
 assert.equal(R.rich(tx('Nike',1000),'chill',s).points,50);
 assert.equal(R.rich(tx('World Gym',1000),'food',s).points,3);
 assert.equal(R.rich(tx('Pinkoi',1000),'digital',s).points,3);
});
test('Uber Eats is food and is eligible for Chill designated 3.3',()=>{
 const s=config();
 assert.equal(R.identify(tx('Uber Eats',1000)).group,'food');
 assert.equal(R.rich(tx('Uber Eats',1000),'food',s).points,33);
});
test('CTBC excludes specified European physical stores for both entry-level cards',()=>{
 const s=config({lineBonus:true});
 assert.equal(R.line(tx('法國實體店',1000,'general','card','europe'),s).points,0);
 assert.equal(R.air(tx('法國實體店',1000,'general','card','europe'),s).points,0);
});
test('Taiwan TWQR is not a foreign-worldwide wallet',()=>{
 const s=config();
 assert.equal(R.rich(tx('海外商店',1000,'travel','taishin','abroad'),'pay',s).points,3);
 assert.equal(R.rich(tx('海外商店',1000,'travel','taishin','abroad'),'travel',s).points,3);
 assert.equal(R.rich(tx('海外商店',1000,'travel','plus','abroad'),'pay',s).points,38);
});
test('wallet bonus and standard plan are still subject to timezone-boundary dates',()=>{
 const a=tx('momo',1000);
 assert.equal(R.rich(a,'digital',config({date:'2026-06-30'})),null);
 assert.equal(R.rich(a,'digital',config({date:'2027-12-31'})).points,33);
 assert.equal(R.rich(a,'digital',config({date:'2028-01-01'})),null);
});
test('strongly different miles values change card selection without assuming cash equivalence',()=>{
 const a=tx('一般店',3000);
 const low=R.compare(a,'daily',config({mileValue:0}));
 const high=R.compare(a,'daily',config({mileValue:3}));
 assert.notEqual(low[0].card,high[0].card);
});
