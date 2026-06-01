/* ============================================================
 * theme.js — 라이트/다크 모드 토글
 *   - 초기 테마 결정: localStorage → OS prefers-color-scheme → light
 *   - 토글 버튼(.gnb__theme) 클릭 시 전환 + 영구 저장
 *   - 다른 탭/창과 동기화 (storage 이벤트)
 *   - OS 설정 변경 추종 (사용자가 명시 선택 전까지만)
 *
 * FOUC 방지: 인라인 스크립트가 각 페이지 <head>에서 먼저
 *           html data-theme 을 설정해 두므로 깜빡임이 없음.
 * ============================================================ */
(function () {
  "use strict";

  const STORAGE_KEY = "theme";
  const root = document.documentElement;

  function getStored() {
    try { return localStorage.getItem(STORAGE_KEY); } catch (e) { return null; }
  }
  function setStored(v) {
    try { localStorage.setItem(STORAGE_KEY, v); } catch (e) {}
  }

  function apply(theme) {
    root.setAttribute("data-theme", theme);
    // 토글 버튼들 aria-pressed 갱신 (스크린리더용)
    document.querySelectorAll(".gnb__theme").forEach((btn) => {
      btn.setAttribute("aria-pressed", theme === "dark" ? "true" : "false");
      btn.setAttribute("aria-label", theme === "dark" ? "라이트 모드로 전환" : "다크 모드로 전환");
    });
  }

  function current() {
    return root.getAttribute("data-theme") === "dark" ? "dark" : "light";
  }

  function toggle() {
    const next = current() === "dark" ? "light" : "dark";
    apply(next);
    setStored(next);
  }

  /* ---------- 초기화 ---------- */
  // FOUC 스크립트가 이미 data-theme 을 박아뒀음. 우리는 그 상태로 ARIA만 동기화.
  apply(current());

  /* ---------- 토글 버튼 이벤트 ---------- */
  document.querySelectorAll(".gnb__theme").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      toggle();
    });
  });

  /* ---------- 탭 간 동기화 ---------- */
  window.addEventListener("storage", (e) => {
    if (e.key === STORAGE_KEY && e.newValue && e.newValue !== current()) {
      apply(e.newValue);
    }
  });

  /* ---------- OS 변경 추종 (사용자 명시 선택 전에만) ---------- */
  if (window.matchMedia) {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    mq.addEventListener?.("change", (ev) => {
      if (!getStored()) apply(ev.matches ? "dark" : "light");
    });
  }
})();
