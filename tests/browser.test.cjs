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
     await page.goto(url,{waitUntil:'load'});
     assert.match(await page.title(),/刷哪張/);
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
     assert.equal(await page.locator('#panel-settings').isVisible(),true);
     await page.locator('#level').selectOption('2');
     await page.locator('#line-linked').check();
     await page.locator('#mile-value').fill('0.65');
     await page.locator('#mile-value').dispatchEvent('change');
     await assertNoOverflow('settings');
     await nav('lookup').click();
     assert.equal(await page.locator('#panel-lookup').isVisible(),true);
     await page.locator('#lookup-search').fill('50嵐');
     assert.match(await page.locator('#lookup-result').innerText(),/15 點|Richart/);
     await page.locator('#lookup-amount').fill('250');
     await page.locator('#lookup-add').click();
     assert.equal(await page.locator('#tx-count').innerText(),'3');
     await assertNoOverflow('lookup');
     // "檢查權益" must never merely repeat the website's version number.
     const remote='https://raw.githubusercontent.com/EugeneYip/c/main/data/check-status.json?*';
     const checkedAt=new Date().toISOString();
     const baseline={schemaVersion:1,checkedAt,manualReviewedAt:'2026-11-21',
       sources:[{id:'richart',status:'unchanged',lastSuccessAt:checkedAt},
                {id:'line_rules',status:'baseline',lastSuccessAt:checkedAt}]};
     await page.route(remote,route=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(baseline)}));
     await page.locator('#check-update').click();
     await page.locator('#benefit-check-summary').getByText(/官方公告比對紀錄/).waitFor();
     assert.equal(await page.locator('#panel-benefits').isVisible(),true);
     assert.ok((await page.locator('.benefit-item').count())>=8,'missing benefit directory');
     assert.ok(!(await page.locator('#benefit-check-summary').innerText()).includes('最新版 V'),'not a version-only checker');
     await assertNoOverflow('rights overview');
     await page.unroute(remote);
     const changed={...baseline,sources:[{id:'richart',status:'changed',lastSuccessAt:checkedAt,
       diff:{added:['2026 方案優惠改動'],removed:['舊方案優惠']}}]};
     await page.route(remote,route=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(changed)}));
     await page.locator('#benefits-refresh').click();
     await page.locator('#benefit-check-summary').getByText(/疑似官方公告變更/).waitFor();
     assert.match(await page.locator('#benefit-check-list').innerText(),/疑似公告內容變動/);
     await page.screenshot({path:path.join(folder,engine+'-'+name+'-benefits.png'),fullPage:true});
     await nav('today').click();
     await page.screenshot({path:path.join(folder,engine+'-'+name+'-today.png'),fullPage:true});
     await nav('lookup').click();
     await page.screenshot({path:path.join(folder,engine+'-'+name+'-lookup.png'),fullPage:true});
     await nav('settings').click();
     await page.screenshot({path:path.join(folder,engine+'-'+name+'-settings.png'),fullPage:true});
     assert.deepEqual(errs,[],'uncaught errors on '+engine+' '+name);
     await context.close();
     console.log(engine+' '+name+' passes: modal, form, edit, reload, settings, search, update and no overflow');
    }
   }finally{await browser.close()}
  }
 }finally{await new Promise(resolve=>server.close(resolve))}
})().catch(e=>{console.error(e);process.exit(1)});
