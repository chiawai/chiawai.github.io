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

  const drawFluidBlob = (x, y, radiusX, radiusY, color, phase) => {
    context.save();
    context.translate(x, y);
    context.rotate(Math.sin(phase) * 0.16);
    context.scale(1, radiusY / radiusX);
    const gradient = context.createRadialGradient(0, 0, radiusX * 0.08, 0, 0, radiusX);
    gradient.addColorStop(0, color);
    gradient.addColorStop(0.4, color.replace(/0\.\d+\)$/, "0.11)"));
    gradient.addColorStop(0.72, color.replace(/0\.\d+\)$/, "0.035)"));
    gradient.addColorStop(1, "rgba(0, 0, 0, 0)");
    context.fillStyle = gradient;
    context.beginPath();
    context.arc(0, 0, radiusX, 0, Math.PI * 2);
    context.fill();
    context.restore();
  };

  const renderAmbient = (time) => {
    const seconds = time * 0.00024;
    context.clearRect(0, 0, width, height);
    context.fillStyle = "#03050b";
    context.fillRect(0, 0, width, height);
    context.globalCompositeOperation = "screen";

    const scale = Math.max(width, height);
    drawFluidBlob(width * (0.12 + Math.sin(seconds * 0.83) * 0.07), height * (0.22 + Math.cos(seconds * 0.62) * 0.06), scale * 0.42, scale * 0.25, "rgba(23, 156, 151, 0.16)", seconds);
    drawFluidBlob(width * (0.88 + Math.cos(seconds * 0.7) * 0.06), height * (0.25 + Math.sin(seconds * 0.54) * 0.08), scale * 0.4, scale * 0.3, "rgba(111, 83, 224, 0.18)", seconds + 1.7);
    drawFluidBlob(width * (0.48 + Math.sin(seconds * 0.42) * 0.13), height * (0.82 + Math.cos(seconds * 0.58) * 0.08), scale * 0.35, scale * 0.2, "rgba(35, 115, 184, 0.13)", seconds + 3.1);
    drawFluidBlob(width * (0.55 + (mouseX - 0.5) * 0.12), height * (0.46 + (mouseY - 0.5) * 0.1), scale * 0.18, scale * 0.12, "rgba(43, 203, 183, 0.09)", seconds + 4.2);

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
