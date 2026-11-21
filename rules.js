/* 刷哪張？ CardFox rules v2.1 — verified baseline 2026-11-20. */
(function(root) {
"use strict";
const SOURCES={richart:"https://mkp.taishinbank.com.tw/s/2025/RichartCard_2025/index.html",line:"https://www.ctbcbank.com/content/dam/minisite/long/creditcard/LINEPay/notice.html",travel:"https://www.ctbcbank.com/content/dam/minisite/long/creditcard/LINEPay/page_travel.html",air:"https://www.ctbcbank.com/content/dam/minisite/long/creditcard/CTBCCI/feature.html"};
const PLANS=[["daily","天天刷"],["large","大筆刷"],["food","好饗刷"],["digital","數趣刷"],["travel","玩旅刷"],["pay","Pay著刷"],["holiday","假日刷"],["chill","Chill刷"]];
const CARDS={richart:"台新 Richart",line:"中信 LINE Pay",air:"中信華航"};
const PAYMENTS={ipass:"中信 LINE Pay 一卡通（搭車）",easycard:"悠遊卡／自動加值",pxpay:"PX Pay／全支付",card:"實體卡／網路刷卡",apple:"Apple／Google Pay",taishin:"台新Pay／TWQR",plus:"台新Pay+",linepay:"LINE Pay",full:"全盈+Pay",other:"其他電子支付"};
const CATEGORIES={auto:"自動辨識",general:"一般消費",food:"餐飲（MCC 需確認）",daily:"日常／交通",large:"百貨／居家",digital:"網購／數位",travel:"旅遊／機票",insurance:"保費",convenience:"便利商店",excluded:"排除交易"};
const catalog=[];
function add(names,group,chill=0) {for(const record of names.split("|")){const aliases=record.split("~").map(x=>x.trim()).filter(Boolean);if(aliases.length)catalog.push({name:aliases[0],aliases,group,chill});}}
add("7-ELEVEN~7-11~統一超商|全家~FamilyMart","convenience");
// Supermarkets: named exclusions apply to all three primary rewards calculations.
add("全聯福利中心~全聯~PX Mart~PXMart|大全聯~大潤發~PX Mart Plus|PXGo!~PX Go","excluded");
// Transit: do not conflate contactless bank card taps with LINE Pay card's iPASS monthly rewards.
add("臺北捷運~台北捷運~北捷~Taipei MRT~捷運~MRT","transit");
add("高鐵~臺灣高鐵~台灣高鐵~T-EX~THSR~高速鐵路|臺鐵~台鐵~台灣鐵路~臺灣鐵路~台鐵e訂通","daily");
add("家樂福~Carrefour~萬家福~樂家康","daily");
add("50嵐|得正|五桐號|龜記|UG TEA|叮哥茶飲|CAFE!N|%Arabica|COMPOSE COFFEE","food",10);
add("詹記麻辣火鍋|萬客什鍋|海底撈|屋馬燒肉|茶六燒肉堂|新村站著吃|燒肉政宗|碳佐麻里|雞湯大叔|貳樓|樂子 the Diner|CAFE ACME|Draft Land|臺虎精釀","food",10);
add("饗饗|NAGOMI","food",5);
add("Netflix|Disney+|巴哈姆特|BOOK WALKER|Animate|樂天KOBO|Readmoo讀墨|愛爾達","digital",5);
add("Pinkoi","general",5);
add("蝦皮~蝦皮購物~Shopee~蝦皮商城~蝦皮官方旗艦店|淘寶|酷澎~Coupang","digital",3.3);
add("Uber Eats~Ubereats","food",3.3);
add("Adidas|New Balance|PUMA|Onitsuka Tiger|Nike|HOKA|Salomon|lululemon","general",5);
add("Anytime Fitness|健身工廠|World Gym|超核心 Hypercore|KX PILATES|17FIT","general",5);
add("好好生醫|POPCARE好在乎|營養師輕食|VITABOX|MYPROTEIN|UrMart","general",5);
add("momo|PChome|Amazon|東森購物|博客來|Richart Mart|PayEasy|iHerb|SHEIN|Farfetch|Olive Young|Steam|PlayStation|Nintendo|ChatGPT|Notion|Canva|Perplexity|Claude|Hahow|PressPlay|Amazing Talker","digital");
add("新光三越|遠東百貨|遠東SOGO|漢神百貨|微風廣場|台北101|遠東巨城|南紡購物中心|誠品生活|京站|三創生活|夢時代|統一時代|中友百貨|LaLaport|MITSUI OUTLET PARK|華泰名品城|SKM Park|IKEA|特力屋|HOLA|宜得利|UNIQLO|GU|ZARA|NET","large");
add("唐吉訶德|LOPIA|萬家福|大買家|寶雅~POYA~寶雅生活館~寶雅線上買|康是美|屈臣氏|杏一醫療|大樹藥局|丁丁藥局|臺鐵|高鐵|台灣大車隊|LINEGO|Yoxi|中油直營|全國加油|美廉社","daily");
add("foodpanda|拓元售票|KKTIX|年代售票|寬宏售票|OPENTIX|FunNow|錢櫃|好樂迪","food");
add("中華航空~華航|長榮航空|星宇航空|台灣虎航|國泰航空|華信航空|立榮航空|樂桃航空|阿聯酋航空|亞洲航空|酷航|日本航空|Klook|KKday|Agoda|Booking.com|Trip.com|Airbnb|Hotels.com|Expedia|雄獅旅遊|易遊網|東南旅遊|可樂旅遊","travel");
const norm=s=>String(s||"").toLocaleLowerCase().normalize("NFKC").replace(/[\s·．。()（）\-_,，、]/g,"");
function merchants(query,limit=10){
 const q=norm(query);if(!q)return catalog.slice(0,limit);
 return catalog.map(m=>({m,score:Math.max(...m.aliases.map(a=>{const v=norm(a);return q===v?4:(v.length>=4||/[\u3400-\u9fff]/.test(v))&&q.startsWith(v)?2:0;}))})).filter(x=>x.score).sort((a,b)=>b.score-a.score||a.m.name.localeCompare(b.m.name,"zh-TW")).slice(0,limit).map(x=>x.m);
}
function identify(tx){const recognized=merchants(tx.store,1)[0];if(recognized&&["excluded","transit"].includes(recognized.group))return {group:recognized.group,merchant:recognized,assumed:false};const m=tx.category==="auto"?recognized:null;return {group:m?m.group:(tx.category==="auto"?"general":tx.category),merchant:m,assumed:!m&&tx.category!=="auto"};}
const valid=(d,start,end)=>/^\d{4}-\d{2}-\d{2}$/.test(d||"")&&d>=start&&d<=end;
function weekend(d){if(!/^\d{4}-\d{2}-\d{2}$/.test(d||""))return false;const [y,m,day]=d.split("-").map(Number);return [0,6].includes(new Date(Date.UTC(y,m-1,day)).getUTCDay());}
const floorPoints=(amt,rate)=>Math.floor(amt*rate/100+1e-8);
const roundPoints=(amt,rate)=>Math.round(amt*rate/100+1e-8);
function output(card,points,rate,reason,tx,s,opts={}){
 const factor=card==="richart"?1:card==="line"?Number(s.lineValue||0):Number(s.mileValue||0);
 const fee=tx.region==="tw"?0:tx.amount*Math.max(0,Number(s.fee||0))/100;
 return {card,points,rate,reason,value:+(points*factor-fee).toFixed(2),unit:card==="richart"?"台新Point":card==="line"?"LINE POINTS":"華航哩",...opts};
}
function rich(tx,plan,s){
 if(s.cards?.richart===false||!valid(s.date,"2026-07-01","2027-12-31"))return null;
 const {group,merchant,assumed}=identify(tx),level2=Number(s.level)===2,normal=["card","apple"].includes(tx.method)||(tx.method==="taishin"&&tx.region==="tw")||(tx.method==="plus"&&tx.region!=="tw"),wallet=["linepay","full"].includes(tx.method),hol=weekend(s.date)||!!s.confirmedHoliday;
 let rate=.3,reason="一般消費",uncertain=assumed||!merchant;
 if(group==="excluded"){rate=0;reason="一般信用卡回饋排除；全聯限定滿額活動另計";uncertain=true;}
 else if(group==="transit"){rate=0;reason="捷運感應乘車是否享卡片回饋待核對；常客回饋不適用信用卡感應";uncertain=true;}
 else if(group==="insurance"){rate=1.3;reason="一般保費一次付清（特殊險種例外）";uncertain=true;if(plan==="holiday"&&hol&&(normal||wallet)){rate=level2?2:1.3;reason="假日刷保費（需符合條件）";}}
 else if(group==="convenience"){
  rate=0;reason="超商一般回饋排除";
  if(tx.region==="tw"&&tx.method==="taishin"&&["daily","pay"].includes(plan)){rate=level2?(plan==="pay"?3.8:3.3):1.3;reason="指定超商使用台新Pay";}
  uncertain=true;
 }else if(plan==="pay"){
  if((tx.method==="taishin"&&tx.region==="tw")||(tx.method==="plus"&&tx.region!=="tw")){rate=level2?3.8:1.3;reason="Pay著刷：台新Pay／Pay+";uncertain=tx.method==="plus"||uncertain;}
  else if(wallet){rate=level2?2.3:1.3;reason="Pay著刷：LINE Pay／全盈+Pay";}
 }else if(plan==="chill"&&valid(s.date,"2026-07-08","2026-12-31")&&merchant?.chill&&["card","apple","taishin","linepay"].includes(tx.method)){
  rate=level2?merchant.chill:1.3;reason="Chill刷指定商家";uncertain=false;
 }else if(plan==="holiday"&&hol&&(normal||wallet)){
  rate=level2?2:1.3;reason="假日刷：週末或已核對國定假日";
 }else if(normal&&((plan==="food"&&group==="food")||(plan==="daily"&&group==="daily")||(plan==="large"&&group==="large")||(plan==="digital"&&group==="digital")||(plan==="travel"&&(group==="travel"||tx.region!=="tw")))){
  rate=level2?3.3:1.3;reason=assumed?"依自選類別估算；須核對商店 MCC":"指定通路";
 }
 if(group!=="convenience"&&group!=="excluded"&&group!=="insurance"&&group!=="transit"&&tx.method==="other"){rate=.3;reason="第三方支付不適用指定加碼";uncertain=true;}
 if(merchant&&["高鐵","臺鐵"].includes(merchant.name)&&tx.method==="taishin"){rate=0;reason="車票購買尚未核實支援台新Pay/TWQR；請改選信用卡官方購票通路";uncertain=true;}
 if(["ipass","easycard","pxpay"].includes(tx.method)){rate=0;reason="電子票證／全聯支付非直接信用卡一般消費，特殊活動另計";uncertain=true;}
 if(s.bonusCapReached&&rate>.3&&group!=="insurance"){rate=group==="convenience"?0:.3;reason="已勾選用盡本期加碼消費額度";uncertain=true;}
 return output("richart",floorPoints(tx.amount,rate),rate,reason,tx,s,{uncertain,source:SOURCES.richart});
}
function line(tx,s,used=0){
 if(s.cards?.line===false||!s.lineLinked||!valid(s.date,"2026-07-01","2026-12-31"))return null;
 const {group}=identify(tx),physical=["card","apple"].includes(tx.method)&&tx.region==="abroad";
 if(tx.region==="europe")return output("line",0,0,"中信列示之指定歐洲國家實體交易不回饋",tx,s,{uncertain:false,extra:0,source:SOURCES.line});
 if(group==="excluded"||group==="transit")return output("line",0,0,group==="transit"?"捷運信用卡感應回饋未核實；一卡通另按月累計":"全聯等一般不回饋通路",tx,s,{uncertain:true,extra:0});
 const rate=physical?2.8:1,base=roundPoints(tx.amount,rate),extra=(physical&&s.lineBonus&&valid(s.date,"2026-10-01","2026-12-31"))?Math.min(Math.max(0,450-used),roundPoints(tx.amount,2.2)):0;
 return output("line",base+extra,rate+(extra?2.2:0),physical?"海外實體一般回饋"+(extra?"＋已登錄額外加碼":""):"一般消費",tx,s,{extra,uncertain:["convenience","insurance"].includes(group)||!!extra,source:extra?SOURCES.travel:SOURCES.line});
}
function air(tx,s){
 if(s.cards?.air===false||!valid(s.date,"2026-01-01","2026-12-31"))return null;
 const {group}=identify(tx);if(group==="excluded"||group==="transit")return output("air",0,0,"此通路不計入一般哩程試算",tx,s,{uncertain:true});
 if(tx.region==="europe")return output("air",0,0,"指定歐洲地區實體交易不回饋（商務御璽卡）",tx,s,{uncertain:false,source:SOURCES.air});
 const physical=["card","apple"].includes(tx.method)&&tx.region==="abroad",birthday=Number(s.birthdayMonth)>0&&Number(s.birthdayMonth)===Number(s.date.slice(5,7));
 const mult=physical&&birthday?3:(physical||tx.airDouble)?2:1,points=Math.floor(tx.amount/30+1e-8)*mult;
 return output("air",points,mult*100/30,mult===3?"生日當月海外實體 3 倍":mult===2?(physical?"海外實體一般 2 倍":"已確認指定消費 2 倍"):"一般 NT$30／1 哩",tx,s,{uncertain:tx.airDouble||group==="convenience"||group==="insurance",source:SOURCES.air});
}
function compare(tx,plan,s,used=0){
 return [rich(tx,plan,s),line(tx,s,used),air(tx,s)].filter(Boolean).sort((a,b)=>b.value-a.value||Number(b.card==="richart")-Number(a.card==="richart")||a.card.localeCompare(b.card));
}
function optimize(entries,s){
 // Global DP over the 450-point LINE Pay promotion cap, not a greedy per-row choice.
 // Cache base card results so mobile devices need not repeatedly classify each store.
 const base=entries.map(tx=>({air:air(tx,s),lineFull:line(tx,s,0),lineBase:line(tx,s,450)}));
 const rank=PLANS.map(([key,label])=>{
  const richList=entries.map(tx=>rich(tx,key,s));
  const initial=Math.max(0,Math.min(450,Math.floor(Number(s.lineBonusUsed)||0)));
  let states=new Map([[initial,{total:0,prev:null,tx:null,chosen:null,options:[],rich:null}]]);
  for(let i=0;i<entries.length;i++){
   const tx=entries[i],info=base[i],rr=richList[i],next=new Map();
   for(const [used,prior] of states){
    const candidates=[rr,info.air].filter(Boolean);
    if(info.lineFull){
     const extra=Math.min(info.lineFull.extra||0,Math.max(0,450-used));
     const b=info.lineBase;
     candidates.push({...b,extra,points:b.points+extra,value:+(b.value+extra*Number(s.lineValue||0)).toFixed(2),reason:b.reason+(extra?"＋已登錄海外加碼":"")});
    }
    candidates.sort((a,b)=>b.value-a.value||Number(b.card==="richart")-Number(a.card==="richart"));
    if(!candidates.length){
     const value={...prior,prev:prior,tx,chosen:null,options:[],rich:rr};
     if(!next.has(used)||value.total>next.get(used).total)next.set(used,value);
     continue;
    }
    for(const c of candidates){
     const nextUsed=used+(c.card==="line"?(c.extra||0):0);
     const total=prior.total+c.value,old=next.get(nextUsed);
     if(!old||total>old.total+1e-8||(Math.abs(total-old.total)<1e-8&&c.card==="richart"&&old.chosen?.card!=="richart"))
      next.set(nextUsed,{total,prev:prior,tx,chosen:c,options:candidates,rich:rr});
    }
   }
   states=next;
  }
  const final=[...states.values()].sort((a,b)=>b.total-a.total)[0]||{total:0},rec=[];
  for(let curr=final;curr&&curr.tx;curr=curr.prev)rec.push({tx:curr.tx,chosen:curr.chosen,options:curr.options,rich:curr.rich});
  rec.reverse();
  return {key,label,total:+final.total.toFixed(2),points:richList.reduce((sum,x)=>sum+(x?.points||0),0),rec};
 });
 const byTotal=rank.slice().sort((a,b)=>b.total-a.total||(a.key==="daily"?-1:b.key==="daily"?1:0));
 const byRich=rank.slice().sort((a,b)=>b.points-a.points||(a.key==="daily"?-1:b.key==="daily"?1:0));
 return {recommended:byTotal[0],rank:byTotal,richOnly:byRich[0],richRank:byRich};
}
root.CardRules={SOURCES,PLANS,CARDS,PAYMENTS,CATEGORIES,catalog,merchants,identify,valid,weekend,floorPoints,roundPoints,rich,line,air,compare,optimize};
})(typeof window==="undefined"?globalThis:window);