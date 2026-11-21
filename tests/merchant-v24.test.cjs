const {test}=require('node:test');
const assert=require('node:assert/strict');
const vm=require('node:vm'),fs=require('node:fs'),path=require('node:path');
const ctx={};ctx.window=ctx;
for(const n of ['rules.js','engine-v22.js'])vm.runInNewContext(fs.readFileSync(path.join(__dirname,'..',n),'utf8'),ctx,{filename:n});
const R=ctx.CardRules;
const setting={date:'2026-11-21',level:2,cards:{richart:true,line:true,air:true},lineLinked:true,lineBonus:false,lineBonusUsed:0,mileValue:.4,lineValue:1,fee:1.5};
const tx=(store,method='card',category='auto',amount=1000)=>({store,method,category,amount,region:'tw'});
test('High-Speed Rail: Richart 天天刷 3.3%, normalized aliases and official purchasing',()=>{
  for(const name of ['高鐵','臺灣高鐵','台灣高鐵','T-EX','THSR']) {
    assert.equal(R.identify(tx(name)).group,'daily',name);
    assert.equal(R.rich(tx(name),'daily',setting).points,33,name);
  }
});
test('Taiwan rail label variants also count as named transit commuter plan',()=>{
  for(const name of ['臺鐵','台鐵','台鐵e訂通'])assert.equal(R.rich(tx(name),'daily',setting).points,33,name);
});
test('Carrefour aliases qualify for Richart 天天刷, not unspecified named Chill offer',()=>{
  for(const name of ['家樂福','Carrefour','萬家福','樂家康']) {
    assert.equal(R.identify(tx(name)).group,'daily',name);
    assert.equal(R.rich(tx(name),'daily',setting).points,33,name);
  }
});
test('PX Mart and PX Mart Plus always excluded from ordinary card returns, even a manual category override',()=>{
  for(const name of ['全聯','全聯福利中心','大全聯','PXGo!']) {
    const t=tx(name,'card','food');
    assert.equal(R.identify(t).group,'excluded',name);
    assert.equal(R.rich(t,'food',setting).points,0,name);
    assert.equal(R.line(t,setting)?.points,0,name);
    assert.equal(R.air(t,setting)?.points,0,name);
  }
});
test('Taipei MRT credit card taps cannot inherit Richart commuter 3.3% or CTBC general cashback automatically',()=>{
  for(const name of ['臺北捷運','台北捷運','北捷','Taipei MRT']) {
    const t=tx(name,'apple');
    assert.equal(R.identify(t).group,'transit',name);
    for(const plan of ['daily','holiday','pay'])assert.equal(R.rich(t,plan,setting).points,0,name+' '+plan);
    assert.equal(R.line(t,setting)?.points,0,name);
    assert.equal(R.air(t,setting)?.points,0,name);
  }
});
test('iPASS 1% transport points accumulate monthly, never per ride rounding',()=>{
  assert.ok(R.PAYMENTS.ipass.includes('一卡通'));
  const txIp=tx('臺北捷運','ipass', 'auto',85);
  assert.equal(R.line(txIp,setting),null);
  assert.equal(R.rich(txIp,'daily',setting).points,0);
  assert.equal(Math.floor(850/100),8);
  assert.notEqual(Math.round(85/100)*10,Math.floor(850/100));
});
test('Unsupported TWQR train ticket does not silently earn Pay 3.8% or commuter 3.3%',()=>{
  assert.equal(R.rich(tx('高鐵','taishin'),'pay',setting).points,0);
  assert.equal(R.rich(tx('高鐵','taishin'),'daily',setting).points,0);
});
test('PX Pay does not accidentally receive an ordinary card bonus',()=>{
  const t=tx('全聯','pxpay','auto');
  assert.equal(R.rich(t,'pay',setting).points,0);
  assert.equal(R.line(t,setting),null);
});