const navToggle = document.querySelector(".nav-toggle");
const navLinks = document.querySelectorAll(".site-nav a");
const tabs = document.querySelectorAll(".project-tab");
const projects = document.querySelectorAll(".project-card");
const revealItems = document.querySelectorAll(".expertise-card, .project-card, .contact-panel");
const sections = document.querySelectorAll("#top, #expertise, #work, #contact");

document.body.classList.add("js-enabled");

revealItems.forEach((item, index) => {
  item.style.setProperty("--reveal-delay", `${(index % 10) * 45}ms`);
});

window.addEventListener("DOMContentLoaded", () => {
  if (window.lucide) {
    window.lucide.createIcons();
  }
});

navToggle?.addEventListener("click", () => {
  const isOpen = document.body.classList.toggle("nav-open");
  navToggle.setAttribute("aria-expanded", String(isOpen));
});

navLinks.forEach((link) => {
  link.addEventListener("click", () => {
    document.body.classList.remove("nav-open");
    navToggle?.setAttribute("aria-expanded", "false");
  });
});

const applyProjectFilter = (filter) => {
  let visibleIndex = 0;

  projects.forEach((project) => {
    const categories = project.dataset.category || "";
    const isVisible = categories.includes(filter);
    project.hidden = !isVisible;

    if (isVisible) {
      project.style.setProperty("--reveal-delay", `${(visibleIndex % 12) * 42}ms`);
      project.classList.remove("is-visible");
      visibleIndex += 1;

      window.requestAnimationFrame(() => {
        project.classList.add("is-visible");
      });
    }
  });
};

tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    tabs.forEach((item) => item.classList.remove("active"));
    tab.classList.add("active");
    applyProjectFilter(tab.dataset.filter);
  });
});

applyProjectFilter(document.querySelector(".project-tab.active")?.dataset.filter || "design");

if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.14 },
  );

  revealItems.forEach((item) => revealObserver.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add("is-visible"));
}

if ("IntersectionObserver" in window) {
  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        const id = entry.target.id;
        navLinks.forEach((link) => {
          const href = link.getAttribute("href");
          link.classList.toggle("active", href === `#${id}`);
        });
      });
    },
    { rootMargin: "-35% 0px -55% 0px", threshold: 0 },
  );

  sections.forEach((section) => sectionObserver.observe(section));
}
