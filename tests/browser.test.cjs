/* Multi-engine end-to-end smoke test, including WebKit (iOS Safari engine). */
const {chromium,webkit}=require('playwright');
const assert=require('node:assert/strict');
const http=require('node:http');
const fs=require('node:fs');
const path=require('node:path');
(async()=>{
 const root=path.join(__dirname,'..'), folder=path.join(__dirname,'artifacts');
 fs.mkdirSync(folder,{recursive:true});
 const server=http.createServer((req,res)=>{
  const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
  const relative=pathname.replace(/^\/c\/?/,'')||'index.html';
  const full=path.resolve(root,relative);
  if(!full.startsWith(root+path.sep)&&full!==path.join(root,'index.html')){res.writeHead(403);res.end();return}
  if(!fs.existsSync(full)||!fs.statSync(full).isFile()){res.writeHead(404);res.end();return}
  const mime=full.endsWith('.css')?'text/css':full.endsWith('.js')?'text/javascript':full.endsWith('.svg')?'image/svg+xml':full.endsWith('.json')?'application/json':'text/html';
  res.writeHead(200,{'Content-Type':mime+'; charset=utf-8','Cache-Control':'public, max-age=3600'});res.end(fs.readFileSync(full));
 });
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const url='http://127.0.0.1:'+server.address().port+'/c/';
 try{
  for(const [engine,type] of [['chromium',chromium],['webkit',webkit]]){
   const browser=await type.launch({headless:true,args:engine==='chromium'?['--no-sandbox']:[]});
   try{
    for(const [name,width,height] of [['small',320,680],['mobile',390,844],['tablet',820,1180]]){
     const context=await browser.newContext({viewport:{width,height},isMobile:width<=390,hasTouch:width<=390,locale:'zh-TW'});
     const page=await context.newPage(),errs=[];
     page.on('pageerror',e=>errs.push(String(e)));
     await page.clock.setFixedTime(new Date('2026-11-21T10:00:00Z'));
     const missing=[];page.on('response',r=>{if(r.url().startsWith(url)&&r.status()>=400)missing.push(r.url()+': '+r.status())});
     await page.goto(url,{waitUntil:'load'});
     assert.match(await page.title(),/刷哪張/);
     assert.equal(await page.locator('html').getAttribute('data-theme'),'light');
     await page.locator('#theme-toggle').click();
     assert.equal(await page.locator('html').getAttribute('data-theme'),'dark');
     await page.reload({waitUntil:'load'});
     assert.equal(await page.locator('html').getAttribute('data-theme'),'dark');
     async function contrast(selector,minimum=4.5,hero=false){const result=await page.locator(selector).first().evaluate((e,{hero})=>{const rgb=s=>s.match(/[\d.]+/g)?.map(Number)||[0,0,0];const lum=a=>a.slice(0,3).map(v=>v/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4).reduce((s,v,i)=>s+v*[.2126,.7152,.0722][i],0);const fg=rgb(getComputedStyle(e).color);let bg=hero?[87,52,33]:null;for(let n=e;!bg&&n;n=n.parentElement){const a=rgb(getComputedStyle(n).backgroundColor);if(a.length===3||a[3]===1)bg=a;}const x=lum(fg),y=lum(bg||[23,23,23]);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05)}, {hero});assert.ok(result>=minimum,selector+' contrast '+result.toFixed(2)+' < '+minimum)}
     await contrast('#main-plan',4.5,true);await contrast('.hero-description',4.5,true);await contrast('#empty-tx strong');await contrast('#empty-tx p');
     await page.screenshot({path:path.join(folder,engine+'-'+name+'-dark-empty.png'),fullPage:true});
     await page.locator('#theme-toggle').click();
     assert.equal(await page.locator('html').getAttribute('data-theme'),'light');

     assert.equal((await page.locator('#entry-payment').innerText()).includes('Google'),false);
     assert.equal(await page.locator('#show-all').innerText(),'逐筆選最佳卡');
     assert.equal(await page.locator('#main-plan').innerText(),'開始記錄消費');
     async function assertNoOverflow(tag){const n=await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth);assert.ok(n<=1,engine+' '+name+' '+tag+' overflow: '+n)}
     await assertNoOverflow('home');
     // The reported iPhone bug must never silently fail to open a form.
     await page.locator('#new-entry').click();
     assert.equal(await page.locator('#entry-dialog').evaluate(d=>d.open),true);
     const modal=await page.locator('#entry-dialog').boundingBox();
     assert.ok(modal&&modal.y>=0&&modal.y+modal.height<=height+2,'dialog not within viewport: '+JSON.stringify(modal));
     if(width<=390)assert.ok(modal.y>20,'mobile dialog should be bottom sheet');
     await page.locator('#entry-store').fill('momo');
     await page.locator('#entry-amount').fill('1200.5');
     await page.locator('#save-entry').click();
     assert.equal(await page.locator('#entry-dialog').evaluate(d=>d.open),false);
     assert.equal(await page.locator('#tx-count').innerText(),'1');
     // Regression: deferred focus used to revert edited amounts non-deterministically.
     await page.locator('[data-edit]').first().click();
     await page.locator('#entry-amount').fill('700');
     await page.locator('#save-entry').click();
     assert.match(await page.locator('#tx-summary').innerText(),/700/);
     // Validate remaining form controls and transaction persistence.
     await page.locator('#new-entry').click();
     await page.locator('#entry-store').fill('50嵐');
     await page.locator('#entry-amount').fill('150');
     await page.locator('#entry-payment').selectOption('card');
     await page.locator('#save-entry').click();
     assert.equal(await page.locator('#tx-count').innerText(),'2');
     await page.reload({waitUntil:'load'});
     assert.equal(await page.locator('#tx-count').innerText(),'2');
     await assertNoOverflow('with transactions');
     await page.locator('#show-all').click();
     assert.equal((await page.locator('#mode-explain').innerText()).includes('每筆擇一張'),true);
     await page.locator('#expand-rank').click();
     assert.equal(await page.locator('.rank-row.is-collapsed').count(),0);
     await page.locator('#show-rich').click();
     const nav=view=>page.locator((width<=390?'.bottom-tabs ':'.top-tabs ')+'[data-view='+view+']');
     await nav('settings').click();
     await page.locator('#theme-choice').selectOption('dark');
     assert.equal(await page.locator('html').getAttribute('data-theme'),'dark');
     await page.locator('#theme-choice').selectOption('light');
     assert.equal(await page.locator('html').getAttribute('data-theme'),'light');

     // First-visit defaults mirror the primary user's supplied Settings screenshot.
     assert.equal(await page.locator('#level').inputValue(),'1');
     assert.equal(await page.locator('#line-linked').isChecked(),true);
     assert.equal(await page.locator('#line-bonus').isChecked(),false);
     assert.equal(await page.locator('#line-used').inputValue(),'0');
     assert.equal(await page.locator('#card-line').isChecked(),true);
     assert.equal(await page.locator('#card-air').isChecked(),true);
     assert.equal(await page.locator('#birth-month').inputValue(),'5');

     assert.equal(await page.locator('#panel-settings').isVisible(),true);
     await page.locator('#level').selectOption('2');
     await page.locator('#line-linked').check();
     await page.locator('#mile-value').fill('0.65');
     await page.locator('#mile-value').dispatchEvent('change');
     await assertNoOverflow('settings');
     await nav('lookup').click();
     assert.equal(await page.locator('#lookup-add').isDisabled(),true);
     for(const merchant of ['蝦皮','寶雅']){
       await page.locator('#popular-shops [data-quick="'+merchant+'"]').click();
       assert.equal(await page.locator('#lookup-search').inputValue(),merchant);
       assert.ok((await page.locator('#lookup-result').innerText()).length>20);
     }

     assert.equal(await page.locator('#panel-lookup').isVisible(),true);
     await page.locator('#lookup-search').fill('50嵐');
     assert.match(await page.locator('#lookup-result').innerText(),/15 點|Richart/);
     // Real merchant search scenarios from 2026 bank and Taipei MRT official sources.
     assert.equal(await page.locator('[data-quick]').count(),12);
     await page.locator('[data-quick="高鐵"]').click();
     assert.match(await page.locator('#lookup-result').innerText(),/高鐵指定購票通路/);
     await page.locator('[data-quick="家樂福"]').click();
     assert.match(await page.locator('#lookup-result').innerText(),/請款認列/);
     await page.locator('[data-quick="臺北捷運"]').click();
     assert.match(await page.locator('#lookup-result').innerText(),/信用卡感應與一卡通/);
     await page.locator('#metro-monthly').fill('850');
     assert.match(await page.locator('#metro-estimate').innerText(),/8 點/);
     await page.locator('[data-quick="全聯福利中心"]').click();
     assert.match(await page.locator('#lookup-result').innerText(),/一般刷卡回饋暫不計算/);
     assert.ok(!(await page.locator('#lookup-result').innerText()).includes('台新 Richart 3.3%'));
     await page.locator('#lookup-search').fill('50嵐');

     await page.locator('#lookup-amount').fill('250');
     await page.locator('#lookup-add').click();
     assert.equal(await page.locator('#tx-count').innerText(),'3');
     await assertNoOverflow('lookup');
     // "檢查權益" must never merely repeat the website's version number.
     const remote='https://raw.githubusercontent.com/EugeneYip/c/main/data/check-status.json?*';
     const checkedAt='2026-11-21T09:00:00Z';
     const baseline={schemaVersion:1,checkedAt,manualReviewedAt:'2026-11-21',
       sources:['richart','line_rules','line_offers','line_travel','air_rules','air_perks'].map(id=>({id,status:'unchanged',lastSuccessAt:checkedAt}))};
     await page.route(remote,route=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(baseline)}));
     await page.locator('#check-update').click();
     await page.locator('#benefit-check-summary').getByText(/官方公告比對紀錄/).waitFor();
     assert.equal(await page.locator('#panel-benefits').isVisible(),true);
     const rightsRect=await page.locator('.rights-inventory').boundingBox();
     const monitorRect=await page.locator('.rights-check').boundingBox();
     assert.ok(rightsRect.y<monitorRect.y,'benefit cards must precede official-source monitoring');
     assert.match(await page.locator('#benefits-refresh').innerText(),/重新讀取監測結果/);
     assert.match(await page.locator('#benefit-check-summary').innerText(),/本次讀取監測紀錄/);
     assert.match(await page.locator('#benefit-check-summary').innerText(),/銀行官方頁面最近掃描/);

     assert.ok((await page.locator('.benefit-item').count())>=8,'missing benefit directory');
     assert.ok(!(await page.locator('#benefit-check-summary').innerText()).includes('最新版 V'),'not a version-only checker');
     await assertNoOverflow('rights overview');
     await page.unroute(remote);
     const changed={...baseline,sources:[{id:'richart',status:'changed',lastSuccessAt:checkedAt,
       diff:{added:['2026 方案優惠改動'],removed:['舊方案優惠']}}]};
     await page.route(remote,route=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(changed)}));
     await page.locator('#benefits-refresh').click();
     await page.locator('#benefit-check-summary').getByText(/疑似官方公告變更/).waitFor();
     await page.locator('#source-details > summary').click();
     assert.match(await page.locator('#benefit-check-list').innerText(),/疑似公告內容變動/);
     await page.screenshot({path:path.join(folder,engine+'-'+name+'-benefits.png'),fullPage:true});
     await nav('today').click();
     await page.screenshot({path:path.join(folder,engine+'-'+name+'-today.png'),fullPage:true});
     await nav('lookup').click();
     await page.screenshot({path:path.join(folder,engine+'-'+name+'-lookup.png'),fullPage:true});
     await nav('settings').click();
     await page.screenshot({path:path.join(folder,engine+'-'+name+'-settings.png'),fullPage:true});
     await page.locator('#theme-choice').selectOption('dark');
     for(const view of ['today','lookup','benefits','settings']){await nav(view).click();await assertNoOverflow('dark '+view);if(view==='today'){await contrast('.rank-row .rname');await contrast('.rank-row .rnum');await contrast('.compare-numbers b');}if(view==='lookup'){await contrast('label[for="lookup-amount"]');await contrast('.lookup-result-head strong');}if(view==='benefits'){await contrast('.benefit-row strong');await contrast('.benefit-headline');}if(view==='settings'){await contrast('label[for="level"]');await contrast('.check');}await page.screenshot({path:path.join(folder,engine+'-'+name+'-dark-'+view+'.png'),fullPage:true});}
     await page.emulateMedia({colorScheme:'dark'});
     await page.locator('#theme-choice').selectOption('system');
     assert.equal(await page.locator('html').getAttribute('data-theme'),'dark');
     await page.emulateMedia({colorScheme:'light'});
     await page.waitForFunction(()=>document.documentElement.dataset.theme==='light');
     assert.deepEqual(missing,[],'missing local assets');
     assert.deepEqual(errs,[],'uncaught errors on '+engine+' '+name);
     await context.close();
     console.log(engine+' '+name+' passes: modal, form, edit, reload, settings, search, update and no overflow');
    }
   }finally{await browser.close()}
  }
 }finally{await new Promise(resolve=>server.close(resolve))}
})().catch(e=>{console.error(e);process.exit(1)});