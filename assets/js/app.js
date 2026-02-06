// assets/js/app.js
const $ = (s, root = document) => root.querySelector(s);
const $$ = (s, root = document) => Array.from(root.querySelectorAll(s));

function initDrawer() {
  const backdrop = $("#drawerBackdrop");
  const openBtn = $("#menuBtn") || $("#burgerBtn"); // поддержка обоих id
  const closeBtn = $("#drawerClose");

  if (!backdrop || !openBtn) return;

  // защита от двойного бинда
  if (backdrop.dataset.bound === "1") return;
  backdrop.dataset.bound = "1";

  const open = () => {
    backdrop.classList.add("open");
    backdrop.setAttribute("aria-hidden", "false");
    document.body.classList.add("no-scroll");
  };

  const close = () => {
    backdrop.classList.remove("open");
    backdrop.setAttribute("aria-hidden", "true");
    document.body.classList.remove("no-scroll");
  };

  // начальное состояние
  close();

  openBtn.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    backdrop.classList.contains("open") ? close() : open();
  });

  if (closeBtn) {
    closeBtn.addEventListener("click", (e) => {
      e.preventDefault();
      close();
    });
  }

  // клик по подложке закрывает
  backdrop.addEventListener("click", (e) => {
    if (e.target === backdrop) close();
  });

  // esc закрывает
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") close();
  });

  // клики по пунктам меню закрывают
  backdrop.querySelectorAll("a.mlink").forEach((a) => {
    a.addEventListener("click", () => close());
  });
}

function initTabs() {
  // табы формата: <button class="tab" data-go="...">
  $$(".tab[data-go]").forEach((t) => {
    t.addEventListener("click", () => {
      const go = t.dataset.go;
      if (go) window.location.href = go;
    });
  });
}

function initChat() {
  const btn = $("#sendBtn");
  const input = $("#chatInput");
  const out = $("#chatOut");
  if (!btn || !input || !out) return;

  btn.addEventListener("click", () => {
    const v = input.value.trim();
    if (!v) return;

    const u = document.createElement("div");
    u.className = "chat-msg chat-msg--user";
    u.textContent = "Ты: " + v;
    out.appendChild(u);

    const a = document.createElement("div");
    a.className = "chat-msg";
    a.textContent = "HealFit: Принял! Пока это демо 🙂";
    out.appendChild(a);

    input.value = "";
    out.scrollTop = out.scrollHeight;
  });
}

document.addEventListener("DOMContentLoaded", () => {
  initDrawer();
  initTabs();
  initChat();
});