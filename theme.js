/* Theme preference is separate from financial settings to preserve existing data. */
(function(){
"use strict";
const KEY="cardfox-theme";
const allowed=["system","light","dark"];
function pref(){try{const x=localStorage.getItem(KEY);return allowed.includes(x)?x:"system"}catch{return "system"}}
function systemDark(){return !!(window.matchMedia&&window.matchMedia("(prefers-color-scheme: dark)").matches)}
function apply(){const choice=pref(),dark=choice==="dark"||(choice==="system"&&systemDark());document.documentElement.dataset.theme=dark?"dark":"light";document.documentElement.style.colorScheme=dark?"dark":"light";const meta=document.querySelector('meta[name="theme-color"]');if(meta)meta.content=dark?"#171717":"#e8752c";const b=document.getElementById("theme-toggle");if(b){b.textContent=dark?"☀ 淺色":"☾ 深色";b.setAttribute("aria-label",dark?"切換為淺色模式":"切換為深色模式")}const select=document.getElementById("theme-choice");if(select)select.value=choice}
function set(x){if(!allowed.includes(x))return;try{localStorage.setItem(KEY,x)}catch{}apply()}
apply();
document.addEventListener("DOMContentLoaded",function(){
 const b=document.getElementById("theme-toggle");if(b)b.addEventListener("click",()=>set(document.documentElement.dataset.theme==="dark"?"light":"dark"));
 const select=document.getElementById("theme-choice");if(select)select.addEventListener("change",()=>set(select.value));
 apply();
});
if(window.matchMedia){const media=window.matchMedia("(prefers-color-scheme: dark)");if(media.addEventListener)media.addEventListener("change",apply);else if(media.addListener)media.addListener(apply)}
})();
