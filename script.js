const introScreen = document.getElementById("introScreen");
const introVideo = document.getElementById("introVideo");
const website = document.getElementById("website");
const skipIntro = document.getElementById("skipIntro");
const soundButton = document.getElementById("soundButton");
const navbar = document.getElementById("navbar");
const scrollProgress = document.getElementById("scrollProgress");
const openMenu = document.getElementById("openMenu");
const mobileMenu = document.getElementById("mobileMenu");
const closeMenu = document.getElementById("closeMenu");
const themeToggle = document.getElementById("themeToggle");
const matterForm = document.getElementById("matterForm");
const revealElements = Array.from(document.querySelectorAll(".reveal"));
const navLinks = Array.from(document.querySelectorAll(".desktop-menu a[href^='#'], .mobile-menu a[href^='#'], .footer-links a[href^='#']"));
const desktopNavLinks = Array.from(document.querySelectorAll(".desktop-menu a[href^='#']"));
const sections = Array.from(document.querySelectorAll("section[id]"));
const parallaxItems = Array.from(document.querySelectorAll("[data-parallax]"));

let websiteShown = false;
let ticking = false;
let lastScrollY = window.scrollY;

function safeStorageSet(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch (error) {}
}

function setTheme(theme) {
  const nextTheme = theme === "light" ? "light" : "dark";
  document.documentElement.dataset.theme = nextTheme;
  safeStorageSet("ahad-theme", nextTheme);
  if (themeToggle) {
    const label = nextTheme === "dark" ? "Switch to light mode" : "Switch to dark mode";
    themeToggle.setAttribute("aria-label", label);
  }
}

setTheme(document.documentElement.dataset.theme || "dark");

function revealVisibleSections() {
  revealElements.forEach((element) => {
    const rect = element.getBoundingClientRect();
    if (rect.top < window.innerHeight - 72) {
      element.classList.add("visible");
    }
  });
}

function showWebsite() {
  if (websiteShown) return;
  websiteShown = true;

  if (introVideo) {
    introVideo.pause();
  }

  if (introScreen) {
    introScreen.style.opacity = "0";
    introScreen.style.visibility = "hidden";
  }

  window.setTimeout(() => {
    if (introScreen) introScreen.style.display = "none";
    if (website) website.classList.remove("hidden");
    document.body.classList.remove("no-scroll");
    revealVisibleSections();
    updateOnScroll();
  }, 720);
}

if (introScreen) {
  document.body.classList.add("no-scroll");
}

if (introVideo) {
  introVideo.addEventListener("ended", showWebsite);
  introVideo.addEventListener("error", showWebsite);
}

if (skipIntro) {
  skipIntro.addEventListener("click", showWebsite);
}

if (soundButton && introVideo) {
  soundButton.addEventListener("click", async () => {
    introVideo.muted = false;
    try {
      await introVideo.play();
      soundButton.textContent = "Sound On";
    } catch (error) {
      soundButton.textContent = "Tap Again";
    }
  });
}

window.setTimeout(showWebsite, 9000);

function openMobileMenu() {
  if (!mobileMenu) return;
  mobileMenu.classList.add("active");
  mobileMenu.setAttribute("aria-hidden", "false");
  document.body.classList.add("menu-open");
}

function closeMobileMenu() {
  if (!mobileMenu) return;
  mobileMenu.classList.remove("active");
  mobileMenu.setAttribute("aria-hidden", "true");
  document.body.classList.remove("menu-open");
}

if (openMenu) openMenu.addEventListener("click", openMobileMenu);
if (closeMenu) closeMenu.addEventListener("click", closeMobileMenu);

window.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeMobileMenu();
});

if (themeToggle) {
  themeToggle.addEventListener("click", () => {
    const current = document.documentElement.dataset.theme === "light" ? "light" : "dark";
    setTheme(current === "light" ? "dark" : "light");
  });
}

navLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    const targetSelector = link.getAttribute("href");
    if (!targetSelector || !targetSelector.startsWith("#")) return;

    const target = document.querySelector(targetSelector);
    if (!target) return;

    event.preventDefault();
    closeMobileMenu();
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  });
});

function updateActiveNavigation() {
  if (!sections.length) return;

  let currentId = sections[0].id;
  const offset = 150;

  sections.forEach((section) => {
    const top = section.getBoundingClientRect().top + window.scrollY - offset;
    if (window.scrollY >= top) currentId = section.id;
  });

  desktopNavLinks.forEach((link) => {
    link.classList.toggle("active", link.getAttribute("href") === `#${currentId}`);
  });
}

function updateScrollProgress() {
  if (!scrollProgress) return;
  const documentHeight = document.documentElement.scrollHeight - window.innerHeight;
  const progress = documentHeight > 0 ? window.scrollY / documentHeight : 0;
  scrollProgress.style.transform = `scaleX(${Math.min(Math.max(progress, 0), 1)})`;
}

function updateNavbar() {
  if (!navbar) return;
  navbar.classList.toggle("scrolled", window.scrollY > 18);
}

function updateParallax() {
  if (!parallaxItems.length || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  parallaxItems.forEach((item) => {
    const speed = Number.parseFloat(item.dataset.parallax || "0");
    const rect = item.getBoundingClientRect();
    const centerDelta = rect.top + rect.height / 2 - window.innerHeight / 2;
    const translate = centerDelta * -speed;
    item.style.transform = `translate3d(0, ${translate.toFixed(2)}px, 0)`;
  });
}

function updateOnScroll() {
  lastScrollY = window.scrollY;
  updateNavbar();
  updateScrollProgress();
  updateActiveNavigation();
  updateParallax();
  ticking = false;
}

window.addEventListener("scroll", () => {
  lastScrollY = window.scrollY;
  if (!ticking) {
    window.requestAnimationFrame(updateOnScroll);
    ticking = true;
  }
}, { passive: true });

window.addEventListener("resize", () => {
  updateOnScroll();
  revealVisibleSections();
}, { passive: true });

if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("visible");
      revealObserver.unobserve(entry.target);
    });
  }, {
    threshold: 0.14,
    rootMargin: "0px 0px -60px 0px"
  });

  revealElements.forEach((element, index) => {
    const group = element.closest(".stagger-group");
    if (group) {
      const siblings = Array.from(group.querySelectorAll(".reveal"));
      const siblingIndex = siblings.indexOf(element);
      element.style.setProperty("--delay", `${Math.max(siblingIndex, 0) * 80}ms`);
    } else {
      element.style.setProperty("--delay", `${Math.min(index, 2) * 60}ms`);
    }
    revealObserver.observe(element);
  });
} else {
  window.addEventListener("scroll", revealVisibleSections, { passive: true });
  revealVisibleSections();
}

if (matterForm) {
  matterForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const fields = {
      name: document.getElementById("name")?.value.trim() || "",
      email: document.getElementById("email")?.value.trim() || "",
      company: document.getElementById("company")?.value.trim() || "",
      location: document.getElementById("location")?.value.trim() || "",
      matterType: document.getElementById("matterType")?.value.trim() || "",
      message: document.getElementById("message")?.value.trim() || ""
    };

    const subject = encodeURIComponent("New trade matter enquiry");
    const body = encodeURIComponent(
      `Name: ${fields.name}\nEmail: ${fields.email}\nCompany: ${fields.company}\nLocation: ${fields.location}\nMatter type: ${fields.matterType}\n\nMessage:\n${fields.message}`
    );

    window.location.href = `mailto:contact@ahadjusdux.com?subject=${subject}&body=${body}`;
  });
}

window.addEventListener("load", () => {
  revealVisibleSections();
  updateOnScroll();
});
