/* v2.2: Separate card from payment route. Existing formulas remain in rules.js. */
(function(){
'use strict';
const R=window.CardRules;
if(!R)throw Error('CardRules must load before engine-v22');
R.PAYMENTS.apple='Apple Pay';
R.PAYMENTS.card='信用卡直接刷卡';
R.PAYMENTS.taishin='台新Pay／TWQR';
const baseLine=R.line,baseAir=R.air;
const usableDirect=['card','apple'];
function decorate(score,tx,method,changed){
 if(!score)return null;
 const methodName=R.PAYMENTS[method]||'信用卡直接刷卡';
 const cardName=R.CARDS[score.card];
 const instruction=score.card==='richart'?R.PAYMENTS[tx.method]:cardName+' · '+methodName;
 return {...score,payment:method,paymentName:methodName,howToPay:instruction,
   paymentChange:changed,
   uncertain:Boolean(score.uncertain||changed),
   note:changed?'須確認店家可改以信用卡直接刷卡；原先選擇的支付工具不一定支援中信卡。':'',
 };
}
function variants(tx,plan,s,used=0){
 const arr=[];
 const rich=decorate(R.rich(tx,plan,s),tx,tx.method,false);
 if(rich)arr.push(rich);
 if(s.cards?.line!==false){
   const methods=usableDirect.includes(tx.method)?[tx.method]:tx.method==='linepay'?['linepay','card']:['card'];
   for(const method of methods){
     const alt={...tx,method};const sc=baseLine(alt,s,used);
     if(sc)arr.push(decorate(sc,tx,method,method!==tx.method));
   }
 }
 if(s.cards?.air!==false){
   const method=usableDirect.includes(tx.method)?tx.method:'card';
   const alt={...tx,method};
   const sc=baseAir(alt,s);
   if(sc)arr.push(decorate(sc,tx,method,method!==tx.method));
 }
 return arr.sort((a,b)=>b.value-a.value||(a.card==='richart'?-1:b.card==='richart'?1:0)||(a.paymentChange?1:-1));
}
R.cardOptions=variants;
R.compare=(tx,plan,s,used=0)=>variants(tx,plan,s,used);
R.line=(tx,s,used=0)=>{
 if(!usableDirect.includes(tx.method)&&tx.method!=='linepay')return null;
 return baseLine(tx,s,used);
};
R.air=(tx,s)=>usableDirect.includes(tx.method)?baseAir(tx,s):null;
R.optimize=function(entries,s){
 const all=R.PLANS.map(([key,label])=>{
   const richList=entries.map(tx=>R.rich(tx,key,s));
   const start=Math.min(450,Math.max(0,Math.floor(Number(s.lineBonusUsed)||0)));
   let states=new Map([[start,{total:0,previous:null,tx:null,chosen:null,options:null}]]);
   for(const tx of entries){
     const next=new Map();
     for(const [used,prev] of states){
       const alternatives=variants(tx,key,s,used);
       if(!alternatives.length){
         next.set(used,{total:prev.total,previous:prev,tx,chosen:null,options:[]});
         continue;
       }
       for(const option of alternatives){
         const newUsed=used+(option.card==='line'?(option.extra||0):0);
         const total=prev.total+option.value;
         const cur=next.get(newUsed);
         if(!cur||total>cur.total+1e-8||
           (Math.abs(total-cur.total)<1e-8&&option.card==='richart'&&cur.chosen?.card!=='richart')){
           next.set(newUsed,{total,previous:prev,tx,chosen:option,options:alternatives});
         }
       }
     }
     states=next;
   }
   const best=[...states.values()].sort((a,b)=>b.total-a.total)[0]||{total:0};
   const rec=[];
   for(let cur=best;cur&&cur.tx;cur=cur.previous){
     rec.push({tx:cur.tx,chosen:cur.chosen,options:cur.options||[],rich:R.rich(cur.tx,key,s)});
   }
   rec.reverse();
   return {key,label,total:Math.round(best.total*100)/100,points:richList.reduce((v,r)=>v+(r?.points||0),0),rec};
 });
 const byValue=all.slice().sort((a,b)=>b.total-a.total||(a.key==='daily'?-1:b.key==='daily'?1:0));
 const byRich=all.slice().sort((a,b)=>b.points-a.points||(a.key==='daily'?-1:b.key==='daily'?1:0));
 return {recommended:byValue[0],rank:byValue,richOnly:byRich[0],richRank:byRich};
};
})();
