(() => {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const coarsePointer = window.matchMedia("(pointer: coarse)").matches;

  const progressBar = document.querySelector(".scroll-progress span");
  const updateScrollProgress = () => {
    if (!progressBar) return;
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    const progress = scrollable > 0 ? window.scrollY / scrollable : 0;
    progressBar.style.transform = `scaleX(${Math.min(1, Math.max(0, progress))})`;
    document.querySelector(".site-header")?.classList.toggle("is-scrolled", window.scrollY > 40);
  };

  updateScrollProgress();
  window.addEventListener("scroll", updateScrollProgress, { passive: true });
  window.addEventListener("resize", updateScrollProgress);

  document.querySelectorAll(".scroll-reveal-text").forEach((element) => {
    const words = element.textContent.trim().split(/\s+/);
    element.textContent = "";
    words.forEach((word, index) => {
      const span = document.createElement("span");
      span.className = "reveal-word";
      span.style.setProperty("--word-index", index);
      span.textContent = `${word}${index === words.length - 1 ? "" : " "}`;
      element.append(span);
    });
  });

  const revealText = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-revealed");
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.42 },
  );
  document.querySelectorAll(".scroll-reveal-text").forEach((element) => revealText.observe(element));

  const scrambleElement = document.querySelector(".scramble-text");
  if (scrambleElement && !reducedMotion) {
    const finalText = scrambleElement.textContent;
    const glyphs = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let frame = 0;
    const scramble = window.setInterval(() => {
      scrambleElement.textContent = finalText
        .split("")
        .map((character, index) => {
          if (character === " ") return " ";
          if (index < frame) return finalText[index];
          return glyphs[Math.floor(Math.random() * glyphs.length)];
        })
        .join("");
      frame += 1.6;
      if (frame > finalText.length) {
        scrambleElement.textContent = finalText;
        window.clearInterval(scramble);
      }
    }, 24);
  }

  const interactiveCards = document.querySelectorAll(".expertise-card, .project-card, .project-tabs");
  interactiveCards.forEach((card) => {
    card.classList.add("spotlight-card", "cursor-target");

    card.addEventListener("pointermove", (event) => {
      const rect = card.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      card.style.setProperty("--mouse-x", `${x}px`);
      card.style.setProperty("--mouse-y", `${y}px`);
      card.style.setProperty("--spotlight-opacity", "1");

      if (reducedMotion || coarsePointer || card.classList.contains("project-tabs")) return;
      const tiltX = ((x / rect.width) - 0.5) * 5;
      const tiltY = ((y / rect.height) - 0.5) * -5;
      card.style.setProperty("--tilt-x", `${tiltX.toFixed(2)}deg`);
      card.style.setProperty("--tilt-y", `${tiltY.toFixed(2)}deg`);
    });

    card.addEventListener("pointerleave", () => {
      card.style.setProperty("--spotlight-opacity", "0");
      card.style.setProperty("--tilt-x", "0deg");
      card.style.setProperty("--tilt-y", "0deg");
    });
  });

  const photoFrame = document.querySelector(".photo-frame");
  photoFrame?.addEventListener("pointermove", (event) => {
    if (reducedMotion || coarsePointer) return;
    const rect = photoFrame.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;
    photoFrame.style.setProperty("--shine-x", `${x * 100}%`);
    photoFrame.style.setProperty("--shine-y", `${y * 100}%`);
    photoFrame.style.transform = `perspective(1100px) rotateX(${((0.5 - y) * 4).toFixed(2)}deg) rotateY(${((x - 0.5) * 5).toFixed(2)}deg)`;
  });
  photoFrame?.addEventListener("pointerleave", () => {
    photoFrame.style.transform = "perspective(1100px) rotateX(0deg) rotateY(0deg)";
  });

  if (!coarsePointer && !reducedMotion) {
    document.querySelectorAll(".magnetic-target").forEach((element) => {
      element.addEventListener("pointermove", (event) => {
        const rect = element.getBoundingClientRect();
        const x = event.clientX - (rect.left + rect.width / 2);
        const y = event.clientY - (rect.top + rect.height / 2);
        element.style.transform = `translate3d(${(x * 0.13).toFixed(1)}px, ${(y * 0.16).toFixed(1)}px, 0)`;
      });
      element.addEventListener("pointerleave", () => {
        element.style.transform = "translate3d(0, 0, 0)";
      });
    });

    const cursor = document.querySelector(".target-cursor");
    let pointerX = window.innerWidth / 2;
    let pointerY = window.innerHeight / 2;
    let cursorX = pointerX;
    let cursorY = pointerY;

    window.addEventListener("pointermove", (event) => {
      pointerX = event.clientX;
      pointerY = event.clientY;
      cursor?.classList.add("is-visible");
    }, { passive: true });

    document.documentElement.addEventListener("pointerleave", () => cursor?.classList.remove("is-visible"));
    document.querySelectorAll(".cursor-target, a, button").forEach((element) => {
      element.addEventListener("pointerenter", () => cursor?.classList.add("is-targeting"));
      element.addEventListener("pointerleave", () => cursor?.classList.remove("is-targeting"));
    });

    const renderCursor = () => {
      cursorX += (pointerX - cursorX) * 0.18;
      cursorY += (pointerY - cursorY) * 0.18;
      if (cursor) cursor.style.transform = `translate3d(${cursorX}px, ${cursorY}px, 0)`;
      window.requestAnimationFrame(renderCursor);
    };
    renderCursor();
  }

  document.querySelectorAll(".project-tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      const track = document.querySelector(".project-track");
      track?.classList.remove("is-switching");
      window.requestAnimationFrame(() => track?.classList.add("is-switching"));
    });
  });

  const canvas = document.querySelector("#ambient-canvas");
  const context = canvas?.getContext("2d");
  if (!canvas || !context || reducedMotion) return;

  let width = 0;
  let height = 0;
  let pixelRatio = 1;
  let mouseX = 0.64;
  let mouseY = 0.26;
  let ambientFrame = 0;

  const resizeCanvas = () => {
    width = window.innerWidth;
    height = window.innerHeight;
    pixelRatio = Math.min(window.devicePixelRatio || 1, 1.5);
    canvas.width = Math.round(width * pixelRatio);
    canvas.height = Math.round(height * pixelRatio);
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
  };

  window.addEventListener("pointermove", (event) => {
    mouseX += ((event.clientX / width) - mouseX) * 0.08;
    mouseY += ((event.clientY / height) - mouseY) * 0.08;
  }, { passive: true });
  window.addEventListener("resize", resizeCanvas);
  resizeCanvas();

  const drawGlow = (x, y, radius, color) => {
    const gradient = context.createRadialGradient(x, y, 0, x, y, radius);
    gradient.addColorStop(0, color);
    gradient.addColorStop(0.48, color.replace(/[^,]+\)$/, "0.07)"));
    gradient.addColorStop(1, "rgba(0, 0, 0, 0)");
    context.fillStyle = gradient;
    context.fillRect(x - radius, y - radius, radius * 2, radius * 2);
  };

  const renderAmbient = (time) => {
    const seconds = time * 0.00024;
    context.clearRect(0, 0, width, height);
    context.fillStyle = "#03050b";
    context.fillRect(0, 0, width, height);
    context.globalCompositeOperation = "screen";

    drawGlow(width * (0.18 + Math.sin(seconds) * 0.04), height * 0.24, Math.max(width, height) * 0.48, "rgba(38, 91, 173, 0.22)");
    drawGlow(width * (0.79 + Math.cos(seconds * 0.8) * 0.05), height * (0.22 + Math.sin(seconds * 1.1) * 0.05), Math.max(width, height) * 0.42, "rgba(121, 55, 196, 0.24)");
    drawGlow(width * (0.54 + (mouseX - 0.5) * 0.08), height * (0.74 + (mouseY - 0.5) * 0.06), Math.max(width, height) * 0.34, "rgba(20, 135, 128, 0.12)");

    context.lineWidth = 0.7;
    for (let line = 0; line < 4; line += 1) {
      context.beginPath();
      context.strokeStyle = `rgba(${line % 2 ? "139, 92, 246" : "56, 212, 208"}, ${0.055 - line * 0.007})`;
      const offset = line * 88;
      context.moveTo(-120, height * 0.44 + offset);
      context.bezierCurveTo(
        width * 0.22,
        height * (0.22 + Math.sin(seconds + line) * 0.05) + offset,
        width * 0.68,
        height * (0.68 + Math.cos(seconds * 0.7 + line) * 0.04) - offset,
        width + 120,
        height * 0.36 + offset * 0.2,
      );
      context.stroke();
    }

    context.globalCompositeOperation = "source-over";
    ambientFrame = window.requestAnimationFrame(renderAmbient);
  };

  ambientFrame = window.requestAnimationFrame(renderAmbient);
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      window.cancelAnimationFrame(ambientFrame);
    } else {
      ambientFrame = window.requestAnimationFrame(renderAmbient);
    }
  });
})();
