/* Theme preference is separate from financial settings to preserve existing data. */
(function(){
"use strict";
const KEY="cardfox-theme";
const allowed=["system","light","dark"];
let inMemory=null;
function pref(){if(inMemory)return inMemory;try{const x=localStorage.getItem(KEY);return allowed.includes(x)?x:"system"}catch{return "system"}}
function systemDark(){return !!(window.matchMedia&&window.matchMedia("(prefers-color-scheme: dark)").matches)}
function apply(){const choice=pref(),dark=choice==="dark"||(choice==="system"&&systemDark());document.documentElement.dataset.theme=dark?"dark":"light";document.documentElement.style.colorScheme=dark?"dark":"light";const meta=document.querySelector('meta[name="theme-color"]');if(meta)meta.content=dark?"#171717":"#e8752c";const b=document.getElementById("theme-toggle");if(b){b.querySelector("svg").innerHTML=dark?'<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5"/>':'<path d="M20.8 15A9 9 0 0 1 9 3.2 9 9 0 1 0 20.8 15Z"/>';b.setAttribute("aria-label",dark?"切換為淺色模式":"切換為深色模式")}const select=document.getElementById("theme-choice");if(select)select.value=choice}
function set(x){if(!allowed.includes(x))return;inMemory=x;try{localStorage.setItem(KEY,x)}catch{}apply()}
apply();
document.addEventListener("DOMContentLoaded",function(){
 const b=document.getElementById("theme-toggle");if(b)b.addEventListener("click",()=>set(document.documentElement.dataset.theme==="dark"?"light":"dark"));
 const select=document.getElementById("theme-choice");if(select)select.addEventListener("change",()=>set(select.value));
 apply();
});
if(window.matchMedia){const media=window.matchMedia("(prefers-color-scheme: dark)");if(media.addEventListener)media.addEventListener("change",apply);else if(media.addListener)media.addListener(apply)}
})();
