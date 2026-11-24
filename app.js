/* CardFox v2.4 — local-first responsive UI */
(function(){
"use strict";
const R=window.CardRules,$=id=>document.getElementById(id),KEY="cardfox-v2",OLD="card-c-2026-v1";
const def=()=>({level:1,cards:{richart:true,line:true,air:true},lineLinked:true,lineBonus:false,lineBonusUsed:0,birthdayMonth:5,mileValue:.4,lineValue:1,fee:1.5,bonusCapReached:false});
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const num=n=>Number(n||0).toLocaleString("zh-TW",{maximumFractionDigits:2});
function taiwanToday(){const a=new Intl.DateTimeFormat("en-US",{timeZone:"Asia/Taipei",year:"numeric",month:"2-digit",day:"2-digit"}).formatToParts(new Date()),v=k=>a.find(x=>x.type===k).value;return v("year")+"-"+v("month")+"-"+v("day")}
const fresh=()=>({date:taiwanToday(),settings:def(),entries:{},favorites:["7-ELEVEN","全家","50嵐","momo","一般餐廳"],holidays:{}});
let monthlyIpass=0;
const QUICK_SHOPS=["蝦皮","寶雅","高鐵","臺北捷運","家樂福","全聯福利中心","大全聯","臺鐵","momo","7-ELEVEN","全家","50嵐"];
let state=fresh(),editing=null,mode="rich",rankExpanded=false,timer;
function safe(x){const amount=Number(x?.amount),store=String(x?.store||"").trim().slice(0,70);if(!store||!Number.isFinite(amount)||amount<.01||amount>1e9)return null;return {id:String(x.id||("tx"+Date.now()+Math.random().toString(36).slice(2,8))),store,amount:Math.round(amount*100)/100,category:R.CATEGORIES[x.category]?x.category:"auto",method:R.PAYMENTS[x.method]?x.method:"card",region:["tw","abroad","abroadonline","europe"].includes(x.region)?x.region:"tw",airDouble:!!x.airDouble};}
function save(){try{localStorage.setItem(KEY,JSON.stringify(state))}catch{toast("此瀏覽器未允許記錄儲存。")}}
function load(){let v=null;try{v=JSON.parse(localStorage.getItem(KEY)||"null")}catch{}
if(v&&v.entries&&v.settings){state={...fresh(),...v,date:taiwanToday(),settings:{...def(),...v.settings,cards:{richart:true,line:v.settings.cards?.line!==false,air:v.settings.cards?.air!==false}}};const all={};for(const [d,arr] of Object.entries(state.entries))if(/^\d{4}-\d{2}-\d{2}$/.test(d)&&Array.isArray(arr))all[d]=arr.map(safe).filter(Boolean);state.entries=all;state.favorites=Array.isArray(v.favorites)?v.favorites.filter(x=>typeof x==="string").slice(0,25):[];state.holidays=v.holidays&&typeof v.holidays==="object"?v.holidays:{};return}
try{const old=JSON.parse(localStorage.getItem(OLD)||"null");if(!old||!Array.isArray(old.items))return;const d=/^\d{4}-\d{2}-\d{2}$/.test(old.config?.date)?old.config.date:taiwanToday();const reg={foreignphysical:"abroad",foreignonline:"abroadonline",europe:"europe"};state.entries[d]=old.items.map(x=>safe({...x,category:R.CATEGORIES[x.kind]?x.kind:"auto",region:reg[x.region]||"tw"})).filter(Boolean);state.settings.level=Number(old.config?.level)===2?2:1;state.settings.lineLinked=!!old.config?.linked;save()}catch{}}
const rows=()=>state.entries[state.date]||[];
function setRows(arr){state.entries[state.date]=arr;save()}
const cfg=()=>({...state.settings,date:state.date,confirmedHoliday:!!state.holidays[state.date]});
function toast(s){const t=$("toast");t.textContent=s;t.classList.add("show");clearTimeout(timer);timer=setTimeout(()=>t.classList.remove("show"),2500)}
function options(id,data){$(id).innerHTML=Object.entries(data).map(([value,label])=>'<option value="'+esc(value)+'">'+esc(label)+'</option>').join("")}
function go(view){document.querySelectorAll("[data-panel]").forEach(e=>e.hidden=e.dataset.panel!==view);document.querySelectorAll("[data-view]").forEach(e=>{const on=e.dataset.view===view;e.classList.toggle("active",on);if(on)e.setAttribute("aria-current","page");else e.removeAttribute("aria-current")});window.scrollTo(0,0);if(view==="lookup")lookup();if(view==="settings")settings();}
function addDays(s,n){const [y,m,d]=s.split("-").map(Number);return new Date(Date.UTC(y,m-1,d+n)).toISOString().slice(0,10)}
function setDate(s){if(!R.valid(s,"2020-01-01","2030-12-31"))return;state.date=s;render();settings();save()}
function dayBadge(){const week=new Date(state.date+"T12:00:00Z").toLocaleDateString("zh-TW",{timeZone:"UTC",weekday:"short"});$("daybadge").textContent=week+" · "+(R.weekend(state.date)||state.holidays[state.date]?"假日":"平日");$("date").value=state.date}
function transactions(){const arr=rows();$("tx-count").textContent=arr.length;$("tx-summary").textContent=arr.length?"共 NT$ "+num(arr.reduce((s,x)=>s+x.amount,0))+"｜可編輯金額與付款方式。":"還沒有記錄今天的消費。";$("empty-tx").hidden=!!arr.length;$("clear-day").hidden=!arr.length;
$("tx-list").innerHTML=arr.map(x=>'<article class="txitem"><div><strong>'+esc(x.store)+'</strong><div class="txmeta">'+esc(R.PAYMENTS[x.method])+' · '+esc(R.CATEGORIES[x.category])+'</div></div><div><div class="txamount">NT$ '+num(x.amount)+'</div><div class="txactions"><button type="button" class="mini-btn" data-edit="'+esc(x.id)+'">編輯</button><button type="button" class="mini-btn remove" data-remove="'+esc(x.id)+'">移除</button></div></div></article>').join("")}
function ranking(result){
 const a=mode==="rich"?result.richRank:result.rank;
 const max=Math.max(1,...a.map(x=>mode==="rich"?x.points:x.total));
 $("mode-explain").textContent=mode==="rich"?"當日所有消費只用 Richart；數字是台新Point。":"每筆擇一張最合適的卡，數字是個人點數估值；Richart 每日仍只能選一個方案。";
 $("rank-chart").innerHTML=rows().length?a.map((x,i)=>{
   const v=mode==="rich"?x.points:x.total;
   return '<div class="rank-row '+(i===0?'best ':'')+(i>=4&&!rankExpanded?'is-collapsed':'')+'"><div class="rname">'+esc(x.label)+'</div><div class="track" role="meter" aria-label="'+esc(x.label)+'" aria-valuemin="0" aria-valuemax="'+max+'" aria-valuenow="'+Math.max(0,v)+'"><i style="width:'+Math.max(0,v)*100/max+'%"></i></div><div class="rnum">'+(mode==="rich"?num(v)+' 點':'$'+num(v))+'</div></div>';
 }).join(''):'<p class="muted small">加入消費後即可比較全部方案。</p>';
 const btn=$("expand-rank");btn.hidden=!rows().length;btn.setAttribute('aria-expanded',String(rankExpanded));btn.textContent=rankExpanded?'收起其餘方案':'展開其他 4 種方案';
 $("show-rich").classList.toggle("selected",mode==="rich");$("show-all").classList.toggle("selected",mode==="all");
 $("show-rich").setAttribute('aria-pressed',String(mode==="rich"));$("show-all").setAttribute('aria-pressed',String(mode==="all"));
}
function cardTag(c){return '<span class="card-tag '+esc(c.card)+'">'+esc(R.CARDS[c.card])+'</span>'}
function requiresSeparateReview(tx){return ['ipass','easycard','pxpay'].includes(tx.method)||['excluded','transit'].includes(R.identify(tx).group)}
function comparison(result){
 if(!rows().length){$("compare-list").innerHTML='<p class="muted small">新增消費後，這裡會顯示每筆適合的卡片與付款方式。</p>';$("warning-box").hidden=true;return}
 $("compare-list").innerHTML='<p class="micro">以 Richart「'+esc(result.recommended.label)+'」為當日方案，比較每筆最適合的一張卡。</p>'+result.recommended.rec.map(({tx,chosen,options})=>{
   const opts=options.filter((o,i,a)=>a.findIndex(z=>z.card===o.card&&z.payment===o.payment)===i);
   return '<article class="compare-row"><div class="compare-top"><div><strong>'+esc(tx.store)+'</strong><div class="micro">消費 NT$ '+num(tx.amount)+'</div></div><div>'+(chosen?cardTag(chosen):'<span class="chip">待核對</span>')+'</div></div>'+
   (chosen?'<div class="compare-numbers"><b>'+num(chosen.points)+' '+esc(chosen.unit)+'</b> · 估值 NT$ '+num(chosen.value)+'</div><div class="compare-note">怎麼付：'+esc(chosen.howToPay)+'</div>':'<div class="compare-numbers">'+(requiresSeparateReview(tx)?'此交易需依電子票證或特殊通路規則另行確認，不列入一般選卡推薦。':'所選日期沒有已核對的回饋規則。')+'</div>')+
   '<details class="compare-details"><summary>回饋依據及其他選項</summary><p>'+(chosen?esc(chosen.reason):'無適用的已核對規則')+'</p>'+
   (chosen?.paymentChange?'<p>注意：'+esc(chosen.note)+'</p>':'')+
   '<p>'+opts.map(o=>esc(R.CARDS[o.card])+'｜'+esc(o.paymentName)+'｜'+num(o.points)+' '+esc(o.unit)+(o.uncertain?'（需核對）':'')).join('<br>')+'</p></details></article>';
 }).join('');
 const notes=[];
 if(state.date<"2026-07-01")notes.push('所選日期早於台新與 LINE Pay 本次支援期間，請核對當期官方資料。');
 if(state.date>"2026-12-31")notes.push('2027 年中信兩卡權益尚未核對，暫不參與選卡。');
 if(state.settings.cards.line&&!state.settings.lineLinked)notes.push('中信 LINE Pay 卡未確認綁定臺灣 LINE Pay 帳號，因此暫不計入。');
 if(state.settings.lineBonus)notes.push('中信海外活動需完成登錄，且仍有名額與加碼額度。');
 if(rows().some(x=>!R.identify(x).merchant))notes.push('未列名商家需依實際請款商店、MCC 再確認。');
 if(rows().some(x=>R.identify(x).group==='convenience'))notes.push('便利商店可能有聯卡中心小額支付分店排除規定。');
 if(rows().some(x=>x.method==='linepay'))notes.push('未計入台新 LINE Pay 額外領券活動；須自行領券及確認資格。');
 if(result.recommended.rec.some(x=>x.chosen?.paymentChange))notes.push('部分推薦須改為信用卡直接刷卡，請確認店家接受該付款方式。');
 const el=$("warning-box");el.hidden=!notes.length;el.innerHTML=notes.length?'<details><summary>試算限制與待確認項目（'+notes.length+'）</summary>'+notes.map(n=>'<p>• '+esc(n)+'</p>').join('')+'</details>':'';
}
function render(){
 dayBadge();transactions();const arr=rows(),data=R.optimize(arr,cfg()),known=data.recommended.rec.some(x=>x.options.length>0),richKnown=arr.some(tx=>!requiresSeparateReview(tx)&&R.rich(tx,'daily',cfg())),allSpecial=arr.length>0&&arr.every(requiresSeparateReview);
 $("main-plan").textContent=arr.length?(richKnown?data.richOnly.label:allSpecial?'需另查回饋':'權益期間未核對'):'開始記錄消費';
 $("main-total").textContent=arr.length&&known?'NT$ '+num(data.recommended.total):'—';
 $("rich-only").textContent=arr.length&&richKnown?num(data.richOnly.points)+' 點':'—';
 $("main-explain").textContent=arr.length?(known?'依 '+arr.length+' 筆消費計算，Richart 當日只需切換一次。':allSpecial?'電子票證或特殊通路需依各自條件確認。':'查無這天已核對的有效權益。'):'加入消費，查看今天最適合的 Richart 方案。';
 ranking(data);comparison(data);if(!$("panel-lookup").hidden)lookup();
}
const suggestions=q=>q.trim()?R.merchants(q,6).map(m=>'<button type="button" data-merchant="'+esc(m.name)+'">'+esc(m.name)+'</button>').join(""):"";
function editor(id=null,seed={}){editing=id;const x=(id?rows().find(row=>row.id===id):seed)||{};$("entry-title").textContent=id?"編輯消費":"加入一筆消費";$("entry-store").value=x.store||"";$("entry-amount").value=x.amount||"";$("entry-payment").value=x.method||"card";$("entry-category").value=x.category||"auto";$("entry-region").value=x.region||"tw";$("air-double").checked=!!x.airDouble;$("entry-suggestions").innerHTML="";document.querySelector(".entry-advanced").open=Boolean(x.category&&x.category!=="auto"||x.region&&x.region!=="tw"||x.airDouble);const d=$("entry-dialog");try{if(typeof d.showModal==="function")d.showModal();else d.setAttribute("open","");}catch(e){d.setAttribute("open","");toast("已開啟消費表單")}}
function close(){const d=$("entry-dialog");if(d.close&&d.open)d.close();else d.removeAttribute("open")}
function editSave(e){e.preventDefault();const x=safe({id:editing||undefined,store:$("entry-store").value,amount:$("entry-amount").value,method:$("entry-payment").value,category:$("entry-category").value,region:$("entry-region").value,airDouble:$("air-double").checked});if(!x){toast("請填寫有效店家及金額");return}const a=rows().slice(),i=a.findIndex(e=>e.id===editing);if(i>=0)a[i]=x;else a.push(x);setRows(a);close();render();toast(i>=0?"已更新消費":"已加入消費")}
function lookupTx(){return safe({store:$("lookup-search").value.trim(),amount:$("lookup-amount").value,category:$("lookup-category").value,method:$("lookup-payment").value,region:$("lookup-region").value})}
function favButtons(manage){return state.favorites.map(x=>'<button type="button" data-favorite="'+esc(x)+'">'+esc(x)+(manage?" ×":"")+"</button>").join("")}
function favorites(){$("favorites").innerHTML=favButtons(false);$("manage-favorites").innerHTML=favButtons(true)||'<span class="micro">尚無常用店家</span>';$("popular-shops").innerHTML=QUICK_SHOPS.map(name=>'<button type="button" data-quick="'+esc(name)+'">'+esc(name)+'</button>').join("")}
function favorite(name){if(!name)return;const at=state.favorites.indexOf(name);if(at>=0)state.favorites.splice(at,1);else if(state.favorites.length<25)state.favorites.push(name);else{toast("最多可加入 25 個店家");return}save();lookup();favorites()}
function lookup(){
 favorites();const term=$("lookup-search").value.trim();$("lookup-suggestions").innerHTML=suggestions(term);const out=$("lookup-result");
 $("lookup-add").disabled=!term||!lookupTx();if(!term){out.innerHTML='<p class="muted small">搜尋高鐵、捷運、量販、網購等；先點快速通路，或輸入商家名稱。</p>';return}
 const tx=lookupTx();if(!tx){out.textContent='請輸入有效試算金額。';return}
 const info=R.identify(tx),c=cfg(),g=info.group;
 const ranking=R.PLANS.map(([key,label])=>({key,label,score:R.rich(tx,key,c)})).filter(x=>x.score).sort((a,b)=>b.score.points-a.score.points);
 const richBest=ranking[0],options=R.cardOptions(tx,richBest?.key||'daily',c,Number(c.lineBonusUsed)||0);
 const best=options[0],others=options.filter((x,i,a)=>x.card!=='richart'&&x.card!==best?.card&&a.findIndex(z=>z.card===x.card)===i);
 let notice='';
 const extra=(label,text,url)=>'<div class="merchant-advice"><b>'+esc(label)+'</b><p>'+esc(text)+'</p>'+(url?'<a href="'+url+'" target="_blank" rel="noopener noreferrer">查看官方條款</a>':'')+'</div>';
 if(g==='transit'){
  notice+=extra('信用卡感應與一卡通是不同的付款方式','2026/7/1 起北捷支援實體信用卡及 Apple Pay 感應進站，但信用卡感應不享北捷常客優惠；中信 LINE Pay 卡的一卡通功能則可依當月合格大眾運輸累計消費每滿 NT$100 回饋 1 點。不可以每次乘車四捨五入算 1%。','https://www.ctbcbank.com/content/dam/minisite/long/creditcard/LINEPay/index.html');
  notice+='<div class="merchant-transport"><label for="metro-monthly">本月已搭乘合格一卡通交通金額（選填）</label><div class="transport-calc"><input id="metro-monthly" type="number" min="0" step="1" inputmode="numeric" value="'+esc(monthlyIpass||'')+'" placeholder="例如：850"><span id="metro-estimate">'+(monthlyIpass?'估算 '+Math.floor(monthlyIpass/100)+' 點':'依月累計，每滿 NT$100 為 1 點')+'</span></div><p class="micro">不含高鐵；此為當月合格一卡通交通支出的估算，不加入單筆刷卡排名。</p></div>';
 } else if(g==='excluded'&&/全聯|PX|大潤發/i.test(tx.store)){
  notice+=extra('全聯／大全聯一般回饋排除','三張卡的基本回饋均不應直接套用於全聯及大全聯。台新 2026/10/30–12/3 的指定活動，限全聯實體門市（不含大全聯）且僅週六、週日，單筆滿 NT$1,300 並以指定 PX Pay／台新Pay／全支付支付，需符合限量及會員資格；不自動加進比較。','https://mkpcard.taishinbank.com.tw/tscccms/promotion/detail/WM_20260907090737422');
 } else if(/高鐵|T-EX|THSR|高速鐵路/i.test(tx.store)){
  notice+=extra('高鐵指定購票通路','台新 Richart「天天刷」符合資格最高 3.3%；須透過高鐵官方網站、T-EX App、車站售票窗口或自動售票機等合格通路完成購票。使用臺灣發行、以新臺幣請款的適格交易；通路及實際請款仍以銀行認列為準。','https://mkpcard.taishinbank.com.tw/tscccms/promotion/detail/WM_20251230190143055');
 } else if(/家樂福|Carrefour|萬家福|樂家康/i.test(tx.store)){
  notice+=extra('量販店名稱及請款認列','家樂福及相關更名通路見於 Richart 天天刷的官方公告。不同網路購物、專櫃或更名後請款資訊仍可能影響指定回饋，建議先核對實際刷卡商店名稱。','https://mobile.richart.tw/TSDIB_RichartWeb/card/credit-card');
 }
 const noBasic=requiresSeparateReview(tx);
 out.innerHTML='<div class="lookup-result-head"><strong>'+esc(info.merchant?.name||tx.store)+'</strong><p>'+(info.merchant?'已收錄店家名稱，仍須核對分店及請款類別':info.assumed?'依自選通路類別估算，仍需確認 MCC':'尚無指定通路比對，先以一般消費保守試算')+'</p></div>'+notice+
 (noBasic?'<div class="result-choice"><div><strong>一般刷卡回饋暫不計算</strong><div class="details">需核對特約活動或電子票證累計規則；勿直接套用一般回饋率。</div></div><b>—</b></div>':(best?'<div class="result-choice"><div>'+cardTag(best)+'<div class="details">'+(best.card==='richart'?'切換 '+esc(richBest?.label||'未核對')+' · ':'')+esc(best.howToPay)+(best.paymentChange?'（需更換付款方式）':'')+'</div></div><b>估值 NT$ '+num(best.value)+'</b></div>':'<p class="muted small">指定日期沒有已核對的有效回饋。</p>'))+
 (noBasic?'':(best?.card==='richart'||!richBest?'':'<div class="result-choice"><div><span class="chip orange">Richart 最佳切換</span><div class="details">'+esc(richBest?.label||'未核對')+'</div></div><b>'+num(richBest?.score.points||0)+' 點</b></div>'))+
 (noBasic?[]:others).map(x=>'<div class="result-choice"><div>'+cardTag(x)+'<div class="details">'+esc(x.howToPay)+'</div></div><b>估值 NT$ '+num(x.value)+'</b></div>').join('')+
 '<p class="micro">這是單筆估算；Richart 全日最佳方案須合併當日交易決定。'+(best?.paymentChange?'更換信用卡時須確認店家接受該付款方式。':'')+(g==='transit'?'感應進站與儲值票卡的優惠不可混為一談。':'')+'</p>'+
 '<button type="button" class="lightbtn" id="toggle-favorite" style="margin-top:12px">'+(state.favorites.includes(term)?'從常用店家移除':'☆ 加入常用店家')+'</button>';
}
const settingsIds={level:"level","bonus-cap":"bonusCapReached","line-linked":"lineLinked","line-bonus":"lineBonus","line-used":"lineBonusUsed","birth-month":"birthdayMonth","mile-value":"mileValue","line-value":"lineValue","foreign-fee":"fee"};
function settings(){for(const [id,key] of Object.entries(settingsIds)){const x=$(id);if(x.type==="checkbox")x.checked=!!state.settings[key];else x.value=state.settings[key]}$("card-line").checked=!!state.settings.cards.line;$("card-air").checked=!!state.settings.cards.air;$("holiday").checked=!!state.holidays[state.date];favorites()}
function settingChange(e){const {id,type,checked,value}=e.target;if(id==="card-line")state.settings.cards.line=checked;else if(id==="card-air")state.settings.cards.air=checked;else if(id==="holiday")state.holidays[state.date]=checked;else if(settingsIds[id]){const raw=type==="checkbox"?checked:id==="line-used"?Math.min(450,Math.max(0,Math.trunc(Number(value)||0))):Math.min(id==="foreign-fee"?10:id==="line-value"||id==="mile-value"?5:12,Math.max(0,Number(value)||0));state.settings[settingsIds[id]]=id==="level"?(Number(value)===2?2:1):id==="birth-month"?Math.min(12,Math.max(0,Math.trunc(Number(value)||0))):raw;}save();settings();render()}
function init(){
load();options("entry-payment",R.PAYMENTS);options("lookup-payment",R.PAYMENTS);options("entry-category",R.CATEGORIES);options("lookup-category",R.CATEGORIES);
document.querySelectorAll("[data-view]").forEach(b=>b.addEventListener("click",()=>go(b.dataset.view)));
$("prev-day").onclick=()=>setDate(addDays(state.date,-1));$("next-day").onclick=()=>setDate(addDays(state.date,1));$("go-today").onclick=()=>setDate(taiwanToday());$("date").onchange=e=>setDate(e.target.value);
$("show-rich").onclick=()=>{mode="rich";rankExpanded=false;render()};$("show-all").onclick=()=>{mode="all";rankExpanded=false;render()};$("expand-rank").onclick=()=>{rankExpanded=!rankExpanded;render()};
$("new-entry").onclick=()=>editor();$("try-sample").onclick=()=>{const sample=[{store:"7-ELEVEN",amount:85,category:"auto",method:"taishin",region:"tw"},{store:"一般餐廳",amount:260,category:"food",method:"taishin",region:"tw"},{store:"50嵐",amount:65,category:"auto",method:"card",region:"tw"}].map(safe);setRows(rows().concat(sample));render();toast("三筆範例已加入，可編輯或清空")};
$("clear-day").onclick=()=>{if(confirm("清空這一天的全部消費？")){setRows([]);render();toast("已清空")}};
$("tx-list").onclick=e=>{const b=e.target.closest("[data-edit],[data-remove]");if(!b)return;const id=b.dataset.edit||b.dataset.remove;if(b.dataset.edit)editor(id);else if(confirm("移除這筆消費？")){setRows(rows().filter(x=>x.id!==id));render()}};
$("entry-form").onsubmit=editSave;$("cancel-entry").onclick=close;document.querySelectorAll(".close-dialog").forEach(b=>b.onclick=close);
$("entry-dialog").onclick=e=>{if(e.target===$("entry-dialog"))close()};
$("entry-store").oninput=e=>$("entry-suggestions").innerHTML=suggestions(e.target.value);
$("entry-suggestions").onclick=e=>{const b=e.target.closest("[data-merchant]");if(b){$("entry-store").value=b.dataset.merchant;$("entry-category").value="auto";$("entry-suggestions").innerHTML=""}};
$("lookup-search").oninput=lookup;["lookup-payment","lookup-category","lookup-region"].forEach(id=>$(id).onchange=lookup);$("lookup-amount").oninput=lookup;
$("lookup-suggestions").onclick=e=>{const b=e.target.closest("[data-merchant]");if(b){$("lookup-search").value=b.dataset.merchant;$("lookup-category").value="auto";lookup()}};
$("popular-shops").onclick=e=>{const b=e.target.closest("[data-quick]");if(b){$("lookup-search").value=b.dataset.quick;$("lookup-category").value="auto";lookup()}};
$("favorites").onclick=e=>{const b=e.target.closest("[data-favorite]");if(b){$("lookup-search").value=b.dataset.favorite;$("lookup-category").value="auto";lookup()}};
$("lookup-result").onclick=e=>{if(e.target.closest("#toggle-favorite"))favorite($("lookup-search").value.trim())};
$("lookup-result").addEventListener("input",e=>{if(e.target.id==="metro-monthly"){monthlyIpass=Math.max(0,Number(e.target.value)||0);const el=$("metro-estimate");if(el)el.textContent=e.target.value?"估算 "+Math.floor(monthlyIpass/100)+" 點":"依月累計，每滿 NT$100 為 1 點"}});
$("lookup-add").onclick=()=>{const tx=lookupTx();if(!tx){toast("請輸入店家名稱及有效消費金額");return}setRows(rows().concat(tx));render();go("today");toast("已加入當日消費")};
$("manage-favorites").onclick=e=>{const b=e.target.closest("[data-favorite]");if(b)favorite(b.dataset.favorite)};
for(const id of [...Object.keys(settingsIds),"card-line","card-air","holiday"])$(id).onchange=settingChange;
$("apply-primary-defaults").onclick=()=>{if(confirm("套用主要使用者的預設資格？這會取代目前的個人設定，但不影響已記錄消費、收藏及日期。請確認 LEVEL、LINE Pay 綁定與生日月份符合持卡人實際情況。")){state.settings=def();save();settings();render();toast("已套用主要使用者預設")}};
$("reset-preferences").onclick=()=>{if(confirm("還原個人設定？交易記錄不受影響。")){state.settings=def();state.holidays={};save();settings();render();toast("已還原預設")}};
$("erase-all").onclick=()=>{if(confirm("刪除本裝置所有消費、收藏和設定？無法復原。")){try{localStorage.removeItem(KEY);localStorage.removeItem(OLD)}catch{}state=fresh();save();settings();render();go("today");toast("已清除所有資料")}};
render();settings();
}
init();
})();