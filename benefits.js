/* Rights Center: curated official benefits and independently monitored public pages. */
(()=>{"use strict";
const $=id=>document.getElementById(id);
const REMOTE="https://raw.githubusercontent.com/EugeneYip/c/main/data/check-status.json";
const NAMES={richart:"台新 Richart",line:"中信 LINE Pay",air:"中信華航商務御璽"};
const COVER={auto:"已納入基本試算",partial:"部分納入試算",reference:"僅提供權益資訊"};
let data=null,feed=null,chosen="richart",all=false,busy=false;
function esc(v){return String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function uri(u){try{let v=new URL(u);return v.protocol==="https:"?v.toString():"#"}catch{return "#"}}
function dateTW(){let p=new Intl.DateTimeFormat("en-US",{timeZone:"Asia/Taipei",year:"numeric",month:"2-digit",day:"2-digit"}).formatToParts(new Date()),q=k=>p.find(x=>x.type===k).value;return q("year")+"-"+q("month")+"-"+q("day")}
function timeTW(iso){if(!iso)return "尚無紀錄";let d=new Date(iso);return Number.isFinite(d.getTime())?new Intl.DateTimeFormat("zh-TW",{timeZone:"Asia/Taipei",year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit",hour12:false}).format(d)+"（臺灣）":"未知"}
async function json(url){let u=new URL(url,location.href);u.searchParams.set("_",Date.now().toString());let r=await fetch(u.toString(),{cache:"no-store"});if(!r.ok)throw Error("HTTP "+r.status);return r.json()}
async function getData(){if(data)return data;const d=await json("data/benefits.json");if(!Array.isArray(d.offers)||!Array.isArray(d.sources))throw Error("資料格式錯誤");return data=d}
function renderOffers(){
 if(!data)return;
 const filters=[["richart","台新 Richart"],["line","中信 LINE Pay"],["air","中信華航"],["all","全部"]];
 $("benefits-filter").innerHTML=filters.map(x=>'<button type="button" data-card="'+x[0]+'" aria-pressed="'+String(chosen===x[0])+'" class="'+(chosen===x[0]?"selected":"")+'">'+x[1]+'</button>').join("");
 let today=dateTW(),src=Object.fromEntries(data.sources.map(s=>[s.id,s]));
 let list=data.offers.filter(o=>chosen==="all"||chosen===o.card).sort((a,b)=>{
   const status=x=>today<x.start?1:today>x.end?2:0;return status(a)-status(b)||a.title.localeCompare(b.title,"zh-TW");
 });
 const visible=all?list:list.slice(0,8);
 $("benefit-count").textContent=list.length+" 項整理權益；非全部銀行促銷";
 $("manual-reviewed").textContent="人工核對基準："+data.manualReviewedAt.replaceAll("-","/")+"（臺灣）";
 $("benefits-results").innerHTML=visible.map(o=>{
  let st=today<o.start?"尚未開始":today>o.end?"已結束":"適用期間內";
  return '<article class="benefit-item '+(st==="已結束"?"expired":"")+'"><div class="benefit-row"><strong>'+esc(o.title)+'</strong><span class="benefit-kind">'+esc(o.kind)+'</span></div><p class="benefit-headline">'+esc(o.headline)+'</p><div class="benefit-tags"><span>'+esc(NAMES[o.card])+'</span><span>'+esc(st)+'</span><span>'+esc(COVER[o.coverage]||"待確認")+'</span></div><details><summary>條件及注意事項</summary><p>'+esc(o.details)+'</p><p><b>限制：</b>'+esc(o.requirements)+'</p><p><b>期間：</b>'+esc(o.start.replaceAll("-","/"))+'－'+esc(o.end.replaceAll("-","/"))+'</p><p><a href="'+uri(src[o.source]?.url)+'" rel="noopener noreferrer" target="_blank">銀行官方原文</a></p></details></article>';
 }).join("");
 $("benefits-more").hidden=list.length<=8;$("benefits-more").textContent=all?"收合權益清單":"顯示其餘 "+Math.max(0,list.length-8)+" 項";
}
function label(s){return ({unchanged:"與既有機器比對基準一致",changed:"疑似公告內容變動，待人工核對",baseline:"已建立機器基準，非人工核對",error:"本次無法讀取官方網站",pending:"尚無自動監測紀錄"})[s]||"監測狀態未確認"}
function statusView(info,source){
 feed=info;
 const sources=data.sources,byId=Object.fromEntries((info.sources||[]).map(x=>[x.id,x]));
 let checked=Date.parse(info.checkedAt||""),old=!Number.isFinite(checked)||Date.now()-checked>48*3600000||checked>Date.now()+3600000;
 let changed=(info.sources||[]).some(x=>x.status==="changed"),error=(info.sources||[]).some(x=>x.status==="error");
 let head=changed?"發現疑似官方公告變更":error?"部分銀行資料無法比對":old?"資料尚未建立或已過期":"已取得官方公告比對紀錄";
 $("benefit-check-summary").innerHTML="<strong>"+head+"</strong><p>最近自動比對："+esc(timeTW(info.checkedAt))+"</p><p>"+(changed?"有來源與既有機器基準不同。需重新核對官方條款後，才能修改計算規則。":old?"尚不能確認目前條款有無變化。":"機器比對僅確認來源文字有無變化，不能保證活動適用資格。")+"</p>";
 $("benefit-check-list").innerHTML=sources.map(src=>{
  let s=byId[src.id],diff=s?.status==="changed"&&s.diff?(s.diff.added||[]).slice(0,3).map(t=>"<p><b>疑似新增：</b>"+esc(t)+"</p>").join("")+(s.diff.removed||[]).slice(0,2).map(t=>"<p><b>疑似移除：</b>"+esc(t)+"</p>").join(""):"";
  return '<div class="source-row"><div><b>'+esc(src.name)+'</b><p>'+esc(label(s?.status))+'</p>'+(s?.lastSuccessAt?"<small>最近成功擷取："+esc(timeTW(s.lastSuccessAt))+"</small>":"")+(diff?'<details><summary>查看疑似變更內容</summary>'+diff+'<p>文字差異不等於已審核的新回饋。</p></details>':"")+'</div><a href="'+uri(src.url)+'" target="_blank" rel="noopener noreferrer">官方頁面</a></div>';
 }).join("");
 $("check-source-note").textContent=source==="github"?"讀取 GitHub 公開儲存庫的監測紀錄，不含私人信用卡資料。":"讀取本站備援紀錄，可能晚於最新監測。";
}
async function render(){
 try{await getData();renderOffers()}
 catch{$("benefits-results").textContent="權益資料暫時無法讀取，請改由下方官方連結查詢。"}
}
async function check(){
 if(busy)return;busy=true;
 let btn=$("check-update"),b2=$("benefits-refresh");btn.disabled=true;b2.disabled=true;
 $("benefit-check-summary").textContent="正在讀取銀行公告監測紀錄…";
 try{
  await getData();renderOffers();
  let report,origin="github";
  try{report=await json(REMOTE)}catch{report=await json("data/check-status.json");origin="fallback"}
  if(!Array.isArray(report.sources))throw Error("Invalid monitor record");
  statusView(report,origin);
 }catch{$("benefit-check-summary").innerHTML="<strong>目前無法核實銀行權益是否有更新</strong><p>可能是連線失敗、監測尚未執行或官方網站拒絕存取。請使用下面的銀行原文連結確認。</p>";}
 finally{busy=false;btn.disabled=false;b2.disabled=false;}
}
function init(){
 const entry=document.querySelector('.top-tabs [data-view="benefits"]')||document.querySelector('[data-view="benefits"]');
 document.querySelectorAll('[data-view="benefits"]').forEach(b=>b.addEventListener("click",()=>{render();if(!feed)check()}));
 $("benefits-filter").addEventListener("click",e=>{let b=e.target.closest("[data-card]");if(!b)return;chosen=b.dataset.card;all=false;renderOffers()});
 $("benefits-more").addEventListener("click",()=>{all=!all;renderOffers()});
 $("benefits-refresh").addEventListener("click",check);
 $("check-update").addEventListener("click",()=>{if(entry)entry.click();check()});
}
init();window.CardBenefitCenter={render,check};
})();