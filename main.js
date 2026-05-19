const THEME_KEY = "theme";

function currentTheme() {
  return document.documentElement.getAttribute("data-theme") || "light";
}

function setTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  localStorage.setItem(THEME_KEY, theme);
  const toggle = document.querySelector(".theme-toggle");
  if (toggle) toggle.setAttribute("aria-pressed", String(theme === "dark"));
}

function initThemeToggle() {
  const toggle = document.querySelector(".theme-toggle");
  if (!toggle) return;
  toggle.setAttribute("aria-pressed", String(currentTheme() === "dark"));
  toggle.addEventListener("click", () => {
    setTheme(currentTheme() === "dark" ? "light" : "dark");
  });
}

function renderNews(items) {
  const list = document.querySelector(".news");
  if (!list) return;
  list.innerHTML = items
    .map(
      (item) =>
        `<li class="news__item"><span class="news__date">[${item.date}]</span> ${item.html}</li>`,
    )
    .join("");
  list.querySelectorAll("a").forEach((a) => {
    a.target = "_blank";
    a.rel = "noopener noreferrer";
  });
}

function renderPapers(papers) {
  const list = document.querySelector(".papers");
  if (!list) return;
  list.innerHTML = papers
    .map((p, i) => {
      const linksHtml = p.links
        .map(
          (l) =>
            `<a href="${l.url}" target="_blank" rel="noopener noreferrer">[${l.label}]</a>`,
        )
        .join(" ");
      const abstractId = `abstract-${i}`;
      const toggle = p.abstract
        ? ` <a href="#" class="paper__abstract-toggle" aria-expanded="false" aria-controls="${abstractId}">[+abstract]</a>`
        : "";
      const abstract = p.abstract
        ? `<div class="paper__abstract" id="${abstractId}" hidden><p>${p.abstract}</p></div>`
        : "";
      return `<li class="paper">
        <div class="paper__title">${p.title}</div>
        <div class="paper__authors">${p.authors}</div>
        <div class="paper__venue">${p.venue}</div>
        <div class="paper__links">${linksHtml}${toggle}</div>
        ${abstract}
      </li>`;
    })
    .join("");
}

function initAbstractToggles() {
  document.querySelectorAll(".paper__abstract-toggle").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      const abstract = document.getElementById(btn.getAttribute("aria-controls"));
      const expanded = btn.getAttribute("aria-expanded") === "true";
      if (expanded) {
        abstract.setAttribute("hidden", "");
        btn.textContent = "[+abstract]";
        btn.setAttribute("aria-expanded", "false");
      } else {
        abstract.removeAttribute("hidden");
        btn.textContent = "[−abstract]";
        btn.setAttribute("aria-expanded", "true");
      }
    });
  });
}

async function loadJson(path) {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`Failed to load ${path}: ${res.status}`);
  return res.json();
}

async function main() {
  initThemeToggle();
  try {
    const [news, papers] = await Promise.all([
      loadJson("data/news.json"),
      loadJson("data/papers.json"),
    ]);
    renderNews(news);
    renderPapers(papers);
  } catch (err) {
    console.error(err);
  }
  initAbstractToggles();
}

main();
