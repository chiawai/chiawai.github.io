const navToggle = document.querySelector(".nav-toggle");
const navLinks = document.querySelectorAll(".site-nav a");
const tabs = document.querySelectorAll(".project-tab");
const projects = document.querySelectorAll(".project-card");
const graphicInlineLibrary = document.querySelector("#graphicInlineLibrary");
const revealItems = document.querySelectorAll(".expertise-card, .strength-card, .project-card, .contact-panel");
const sections = document.querySelectorAll("#top, #expertise, #work, #contact");
const galleryImages = document.querySelectorAll(".collection-gallery img");
const imageLightbox = document.querySelector(".image-lightbox");
const imageLightboxImage = imageLightbox?.querySelector("img");
const imageLightboxCaption = imageLightbox?.querySelector("p");
const imageLightboxCloseItems = imageLightbox?.querySelectorAll(
  ".image-lightbox-backdrop, .image-lightbox-close",
);

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

const closeImageLightbox = () => {
  imageLightbox?.classList.remove("is-open");
  imageLightbox?.setAttribute("aria-hidden", "true");
  document.body.classList.remove("lightbox-open");
};

const openImageLightbox = (source, alt) => {
  if (!imageLightbox || !imageLightboxImage || !imageLightboxCaption) return;
  imageLightboxImage.src = source;
  imageLightboxImage.alt = alt;
  imageLightboxCaption.textContent = alt;
  imageLightbox.classList.add("is-open");
  imageLightbox.setAttribute("aria-hidden", "false");
  document.body.classList.add("lightbox-open");
};

galleryImages.forEach((image) => {
  image.setAttribute("tabindex", "0");
  image.setAttribute("role", "button");

  const openImage = () => {
    openImageLightbox(image.currentSrc || image.src, image.alt);
  };

  image.addEventListener("click", openImage);
  image.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openImage();
    }
  });
});

imageLightboxCloseItems?.forEach((item) => {
  item.addEventListener("click", closeImageLightbox);
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeImageLightbox();
  }
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

  if (graphicInlineLibrary) {
    graphicInlineLibrary.hidden = filter !== "design";
  }
};

tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    tabs.forEach((item) => item.classList.remove("active"));
    tab.classList.add("active");
    applyProjectFilter(tab.dataset.filter);
  });
});

document.querySelectorAll("[data-expertise-filter]").forEach((link) => {
  link.addEventListener("click", () => {
    const filter = link.dataset.expertiseFilter;
    const matchingTab = document.querySelector(`.project-tab[data-filter="${filter}"]`);
    if (!matchingTab) return;
    tabs.forEach((item) => item.classList.remove("active"));
    matchingTab.classList.add("active");
    applyProjectFilter(filter);
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

const graphicLibrary = document.querySelector(".graphic-library");
const graphicLibraryContent = document.querySelector("#graphicLibraryContent");
const graphicLibraryTitle = document.querySelector("#graphicLibraryTitle");
const graphicLibraryDescription = document.querySelector("#graphicLibraryDescription");
const graphicLibraryEyebrow = document.querySelector("#graphicLibraryEyebrow");
const graphicLibraryBack = document.querySelector(".graphic-library-back");
const graphicLibraryCloseItems = document.querySelectorAll(".graphic-library-backdrop, .graphic-library-close");
let graphicLibraryData = null;
let activeGraphicGroup = null;

const escapeLibraryHtml = (value = "") =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

const loadGraphicLibrary = async () => {
  if (graphicLibraryData) return graphicLibraryData;
  const response = await fetch("assets/graphic-design-library.json");
  if (!response.ok) throw new Error("Unable to load the Graphic Design library.");
  graphicLibraryData = await response.json();
  return graphicLibraryData;
};

const openGraphicLibrary = () => {
  graphicLibrary?.classList.add("is-open");
  graphicLibrary?.setAttribute("aria-hidden", "false");
  document.body.classList.add("graphic-library-open");
};

const closeGraphicLibrary = () => {
  graphicLibrary?.classList.remove("is-open");
  graphicLibrary?.setAttribute("aria-hidden", "true");
  document.body.classList.remove("graphic-library-open");
};

const renderGraphicGroup = (group) => {
  if (!graphicLibraryData || !graphicLibraryContent) return;
  activeGraphicGroup = group;
  graphicLibraryEyebrow.textContent = `GRAPHIC DESIGN · GROUP ${group.number}`;
  graphicLibraryTitle.textContent = group.title;
  graphicLibraryDescription.textContent = group.description;
  graphicLibraryBack.hidden = true;

  const projectLookup = new Map(graphicLibraryData.projects.map((project) => [project.id, project]));
  const projectsInGroup = group.projectIds.map((id) => projectLookup.get(id)).filter(Boolean);
  const scopeLabels = group.scopeAreas?.length ? group.scopeAreas : group.collectionLabels;

  graphicLibraryContent.innerHTML = `
    <div class="graphic-scope" aria-label="Work types">
      ${scopeLabels.map((label) => `<span>${escapeLibraryHtml(label)}</span>`).join("")}
    </div>
    <div class="graphic-group-summary">
      <span><strong>${group.projectCount}</strong> projects</span>
      <span><strong>${group.imageCount}</strong> images</span>
    </div>
    <div class="graphic-project-grid">
      ${projectsInGroup
        .map(
          (project) => `
            <button class="graphic-project-item" type="button" data-graphic-project="${escapeLibraryHtml(project.id)}">
              <span class="graphic-project-thumb">
                ${project.thumbnail ? `<img loading="lazy" decoding="async" src="${escapeLibraryHtml(project.thumbnail)}" alt="">` : ""}
              </span>
              <span class="graphic-project-copy">
                <small>${escapeLibraryHtml(project.collectionLabel)}</small>
                <strong>${escapeLibraryHtml(project.title)}</strong>
                <em>${project.images.length} image${project.images.length === 1 ? "" : "s"}</em>
              </span>
              <i data-lucide="arrow-up-right"></i>
            </button>
          `,
        )
        .join("")}
    </div>
  `;
  graphicLibraryContent.scrollTop = 0;
  window.lucide?.createIcons();
};

const renderGraphicProject = (project, showBack = true) => {
  if (!graphicLibraryContent) return;
  graphicLibraryEyebrow.textContent = project.collectionLabel;
  graphicLibraryTitle.textContent = project.title;
  graphicLibraryDescription.textContent = project.summary;
  graphicLibraryBack.hidden = !showBack;
  graphicLibraryContent.innerHTML = `
    <div class="graphic-project-summary">
      <span>${project.images.length} image${project.images.length === 1 ? "" : "s"}</span>
      <span>${escapeLibraryHtml(project.collectionLabel)}</span>
    </div>
    <div class="graphic-project-gallery">
      ${project.images
        .map(
          (image, index) => `
            <button type="button" class="graphic-gallery-item" data-gallery-image data-source="${escapeLibraryHtml(image.src)}" data-alt="${escapeLibraryHtml(image.alt || `${project.title} image ${index + 1}`)}">
              <img loading="lazy" decoding="async" src="${escapeLibraryHtml(image.src)}" alt="${escapeLibraryHtml(image.alt || "")}">
              <span>${String(index + 1).padStart(2, "0")}</span>
            </button>
          `,
        )
        .join("")}
    </div>
  `;
  graphicLibraryContent.scrollTop = 0;
};

const renderGraphicInlineLibrary = (data) => {
  if (!graphicInlineLibrary) return;
  const projectLookup = new Map(data.projects.map((project) => [project.id, project]));
  const renderProjectPreview = (project) => {
    const previewImages = project.images.slice(0, 3);
    const galleryClass = previewImages.length > 1 ? " is-gallery" : "";
    return `
      <span class="graphic-inline-thumb${galleryClass}">
        <span class="graphic-inline-preview-grid">
          ${previewImages
            .map(
              (image, index) => `<img loading="lazy" decoding="async" src="${escapeLibraryHtml(image.src)}" alt="${escapeLibraryHtml(image.alt || `${project.title} preview ${index + 1}`)}">`,
            )
            .join("")}
        </span>
        <span class="graphic-inline-gallery-badge">
          <i data-lucide="images"></i>
          Project Gallery · ${project.images.length} image${project.images.length === 1 ? "" : "s"}
        </span>
      </span>
    `;
  };
  graphicInlineLibrary.innerHTML = data.groups
    .map((group) => {
      const projectsInGroup = group.projectIds.map((id) => projectLookup.get(id)).filter(Boolean);
      const scopeLabels = group.scopeAreas?.length ? group.scopeAreas : group.collectionLabels;
      return `
        <section class="graphic-inline-section" aria-labelledby="graphic-inline-${escapeLibraryHtml(group.id)}">
          <header class="graphic-inline-heading">
            <div>
              <small>Graphic Design · Group ${escapeLibraryHtml(group.number)}</small>
              <h3 id="graphic-inline-${escapeLibraryHtml(group.id)}">${escapeLibraryHtml(group.title)}</h3>
              <p>${escapeLibraryHtml(group.description)}</p>
            </div>
            <div class="graphic-inline-counts">
              <span>${group.projectCount} projects</span>
              <span>${group.imageCount} images</span>
            </div>
          </header>
          <div class="graphic-inline-scope">
            ${scopeLabels.map((label) => `<span>${escapeLibraryHtml(label)}</span>`).join("")}
          </div>
          <div class="graphic-inline-grid">
            ${projectsInGroup
              .map(
                (project) => `
                  <button class="graphic-inline-card" type="button" data-inline-graphic-project="${escapeLibraryHtml(project.id)}">
                    ${renderProjectPreview(project)}
                    <span class="graphic-inline-copy">
                      <small>${escapeLibraryHtml(project.collectionLabel)}</small>
                      <strong>${escapeLibraryHtml(project.title)}</strong>
                      <p>${escapeLibraryHtml(project.summary)}</p>
                      <span class="graphic-inline-cta">View full project <i data-lucide="arrow-right"></i></span>
                    </span>
                  </button>
                `,
              )
              .join("")}
          </div>
        </section>
      `;
    })
    .join("");
  window.lucide?.createIcons();
};

document.querySelectorAll("[data-graphic-group]").forEach((card) => {
  card.querySelector(".graphic-group-open")?.addEventListener("click", async () => {
    openGraphicLibrary();
    graphicLibraryContent.innerHTML = '<div class="graphic-library-loading">Loading projects...</div>';
    try {
      const data = await loadGraphicLibrary();
      const group = data.groups.find((item) => item.id === card.dataset.graphicGroup);
      if (!group) throw new Error("Graphic Design group not found.");
      renderGraphicGroup(group);
    } catch (error) {
      graphicLibraryContent.innerHTML = `<div class="graphic-library-loading">${escapeLibraryHtml(error.message)}</div>`;
    }
  });
});

graphicLibraryContent?.addEventListener("click", (event) => {
  const projectButton = event.target.closest("[data-graphic-project]");
  if (projectButton && graphicLibraryData) {
    const project = graphicLibraryData.projects.find((item) => item.id === projectButton.dataset.graphicProject);
    if (project) renderGraphicProject(project);
    return;
  }

  const galleryButton = event.target.closest("[data-gallery-image]");
  if (galleryButton) {
    openImageLightbox(galleryButton.dataset.source, galleryButton.dataset.alt);
  }
});

graphicInlineLibrary?.addEventListener("click", (event) => {
  const projectButton = event.target.closest("[data-inline-graphic-project]");
  if (!projectButton || !graphicLibraryData) return;
  const project = graphicLibraryData.projects.find((item) => item.id === projectButton.dataset.inlineGraphicProject);
  if (!project) return;
  activeGraphicGroup = null;
  openGraphicLibrary();
  renderGraphicProject(project, false);
});

graphicLibraryBack?.addEventListener("click", () => {
  if (activeGraphicGroup) renderGraphicGroup(activeGraphicGroup);
});

graphicLibraryCloseItems.forEach((item) => item.addEventListener("click", closeGraphicLibrary));

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && graphicLibrary?.classList.contains("is-open") && !imageLightbox?.classList.contains("is-open")) {
    closeGraphicLibrary();
  }
});

loadGraphicLibrary()
  .then(renderGraphicInlineLibrary)
  .catch((error) => {
    if (graphicInlineLibrary) {
      graphicInlineLibrary.innerHTML = `<div class="graphic-inline-loading">${escapeLibraryHtml(error.message)}</div>`;
    }
  });
