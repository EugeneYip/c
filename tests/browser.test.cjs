/* Phone/tablet smoke test. Run in GitHub Actions after installing Playwright */
const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const path=require('node:path');
const fs=require('node:fs');
const http=require('node:http');
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 const root=path.join(__dirname,'..');
 const server=http.createServer((req,res)=>{
  const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
  const relative=pathname.replace(/^\/c\/?/, '')||'index.html',full=path.resolve(root,relative);
  if(!full.startsWith(root+path.sep)&&full!==path.join(root,'index.html')){res.writeHead(403);res.end();return;}
  if(!fs.existsSync(full)||!fs.statSync(full).isFile()){res.writeHead(404);res.end();return;}
  const mime=full.endsWith('.css')?'text/css':full.endsWith('.js')?'text/javascript':full.endsWith('.svg')?'image/svg+xml':'text/html';
  res.writeHead(200,{'Content-Type':mime+'; charset=utf-8'});res.end(fs.readFileSync(full));
 });
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const url='http://127.0.0.1:'+server.address().port+'/c/';
 const folder=path.join(__dirname,'artifacts');fs.mkdirSync(folder,{recursive:true});
 for(const [name,width,height] of [['mobile',390,844],['tablet',820,1180]]){
  const page=await browser.newPage({viewport:{width,height},deviceScaleFactor:2});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(url,{waitUntil:'load'});
  assert.match(await page.title(),/刷哪張/);
  assert.equal(await page.locator('#main-plan').innerText(),'加入消費後試算');
  const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth);
  assert.ok(overflow<=1,'horizontal overflow on '+name+': '+overflow);
  const dialog=page.locator('#entry-dialog');
  await page.locator('#new-entry').click();
  await dialog.locator('#entry-store').fill('50嵐');
  await dialog.locator('#entry-amount').fill('100');
  await dialog.locator('#entry-payment').selectOption('card');
  await dialog.locator('#save-entry').click();
  assert.equal(await page.locator('#tx-count').innerText(),'1');
  await page.screenshot({path:path.join(folder,name+'.png'),fullPage:true});
  await page.reload();
  assert.equal(await page.locator('#tx-count').innerText(),'1');
  const nav=selector=>page.locator(name==='mobile'?'.bottom-tabs [data-view='+selector+']':'.top-tabs [data-view='+selector+']');
  await nav('settings').click();
  assert.equal(await page.locator('#panel-settings').isVisible(),true);
  await nav('lookup').click();
  await page.locator('#lookup-search').fill('momo');
  assert.match(await page.locator('#lookup-result').innerText(),/Richart/);
  assert.deepEqual(errors,[],'JavaScript errors on '+name);
  await page.close();
  console.log(name+' viewport, add transaction, persistence, navigation and lookup: PASS');
 }
 await browser.close();await new Promise(resolve=>server.close(resolve));
})().catch(e=>{console.error(e);process.exit(1)});
