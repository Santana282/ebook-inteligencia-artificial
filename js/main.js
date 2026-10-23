(() => {
  "use strict";
  const projects = Array.isArray(window.KAZVORA_PROJECTS) ? window.KAZVORA_PROJECTS : [];
  const themeClass = theme => ({red:"red-art",pink:"pink-art",green:"green-art"})[theme] || "";
  const safeText = value => String(value ?? "");
  const projectCard = project => {
    const tags = (project.technologies || []).map(tag => `<span>${safeText(tag)}</span>`).join("");
    const link = project.url
      ? `<a class="project-link" href="${safeText(project.url)}">Ver proyecto <span aria-hidden="true">↗</span></a>`
      : `<span class="project-link" aria-label="Demostración aún no publicada">Ficha en preparación <span aria-hidden="true">↗</span></span>`;
    return `<article class="project-card">
      <div class="project-art ${themeClass(project.theme)}"><span class="art-icon" aria-hidden="true">${safeText(project.icon || "◇")}</span></div>
      <div class="project-body">
        <div class="project-meta"><span class="project-category">${safeText(project.category)}</span><span class="project-status">${safeText(project.status)}</span></div>
        <h3>${safeText(project.title)}</h3><p>${safeText(project.description)}</p>
        <div class="project-tags">${tags}</div>${link}
      </div>
    </article>`;
  };
  const featured = document.getElementById("featured-projects");
  if (featured) {
    const items = projects.filter(p => p.featured).slice(0, 3);
    featured.innerHTML = items.map(projectCard).join("");
  }
  const all = document.getElementById("all-projects");
  const filters = document.getElementById("project-filters");
  if (all && filters) {
    const categories = ["Todos", ...new Set(projects.map(p => p.category).filter(Boolean))];
    filters.innerHTML = categories.map((category, i) =>
      `<button class="filter-button" type="button" data-filter="${safeText(category)}" aria-pressed="${i === 0 ? "true" : "false"}">${safeText(category)}</button>`
    ).join("");
    const render = category => {
      const selected = category === "Todos" ? projects : projects.filter(p => p.category === category);
      all.innerHTML = selected.length ? selected.map(projectCard).join("") : `<p>No hay proyectos en esta categoría todavía.</p>`;
    };
    render("Todos");
    filters.addEventListener("click", event => {
      const button = event.target.closest("button[data-filter]");
      if (!button) return;
      filters.querySelectorAll("button").forEach(item => item.setAttribute("aria-pressed", String(item === button)));
      render(button.dataset.filter);
    });
  }
  const toggle = document.querySelector(".menu-toggle");
  const nav = document.getElementById("main-nav");
  if (toggle && nav) {
    toggle.addEventListener("click", () => {
      const open = toggle.getAttribute("aria-expanded") !== "true";
      toggle.setAttribute("aria-expanded", String(open));
      nav.classList.toggle("is-open", open);
      toggle.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú");
    });
    nav.querySelectorAll("a").forEach(link => link.addEventListener("click", () => {
      nav.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
    }));
  }
  const year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();
  const form = document.getElementById("contact-form");
  if (form) form.addEventListener("submit", event => {
    event.preventDefault();
    const data = new FormData(form);
    const message = [
      "Hola, KAZVORA Technologies.",
      `Mi nombre es: ${data.get("name")}`,
      data.get("email") ? `Mi correo: ${data.get("email")}` : "",
      `Tipo de proyecto: ${data.get("project-type")}`,
      `Detalles: ${data.get("message")}`
    ].filter(Boolean).join("\n");
    const feedback = document.getElementById("form-feedback");
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(message).then(() => {
        feedback.textContent = "Mensaje copiado. Cuando configuremos el WhatsApp oficial, podrás enviarlo directamente.";
      }).catch(() => {
        feedback.textContent = message;
      });
    } else {
      feedback.textContent = message;
    }
  });
})();
