const $ = (s, root=document) => root.querySelector(s);
const $$ = (s, root=document) => Array.from(root.querySelectorAll(s));

function openDrawer(){
  const bd = $("#drawerBackdrop");
  if(!bd) return;
  bd.style.display = "flex";
}
function closeDrawer(){
  const bd = $("#drawerBackdrop");
  if(!bd) return;
  bd.style.display = "none";
}

function initDrawer(){
  const burger = $("#burgerBtn");
  const bd = $("#drawerBackdrop");
  const closeBtn = $("#drawerClose");

  if(burger) burger.addEventListener("click", openDrawer);
  if(closeBtn) closeBtn.addEventListener("click", closeDrawer);

  if(bd){
    bd.addEventListener("click", (e)=>{
      if(e.target === bd) closeDrawer();
    });
  }
}

function initTabs(){
  const tabs = $$(".tab");
  if(!tabs.length) return;

  tabs.forEach(t=>{
    t.addEventListener("click", ()=>{
      tabs.forEach(x=>x.classList.remove("active"));
      t.classList.add("active");
      const go = t.dataset.go;
      if(go) window.location.href = go;
    });
  });
}

function initChat(){
  const btn = $("#sendBtn");
  const input = $("#chatInput");
  const out = $("#chatOut");
  if(!btn || !input || !out) return;

  btn.addEventListener("click", ()=>{
    const v = input.value.trim();
    if(!v) return;

    const p = document.createElement("div");
    p.className = "msg";
    p.style.background = "#eaf2ec";
    p.style.marginTop = "10px";
    p.textContent = "Ты: " + v;
    out.appendChild(p);

    const a = document.createElement("div");
    a.className = "msg";
    a.style.marginTop = "10px";
    a.textContent = "HealFit: Принял! Пока это демо. Далее подключим логику рекомендаций 🙂";
    out.appendChild(a);

    input.value = "";
    out.scrollTop = out.scrollHeight;
  });
}

document.addEventListener("DOMContentLoaded", ()=>{
  initDrawer();
  initTabs();
  initChat();
});