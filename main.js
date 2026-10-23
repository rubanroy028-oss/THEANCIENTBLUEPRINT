/**
 * ===================================================================
 * THE ANCIENT BLUEPRINT NYC · JAVASCRIPT ENGINE
 * Animations, Interactive Kundali, Typewriters, AI Sandbox, Audio Synth
 * ===================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  /* -----------------------------------------------------------------
   * 1. STARFIELD & CELESTIAL PARTICLE CANVAS
   * ----------------------------------------------------------------- */
  const canvas = document.getElementById('starfieldCanvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    window.addEventListener('resize', () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      initStars();
    });

    const starCount = Math.floor((width * height) / 8000);
    const stars = [];
    let mouseX = width / 2;
    let mouseY = height / 2;

    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    });

    function initStars() {
      stars.length = 0;
      for (let i = 0; i < starCount; i++) {
        stars.push({
          x: Math.random() * width,
          y: Math.random() * height,
          radius: Math.random() * 1.4 + 0.3,
          baseAlpha: Math.random() * 0.7 + 0.2,
          alpha: Math.random() * 0.7 + 0.2,
          twinkleSpeed: Math.random() * 0.02 + 0.005,
          twinkleOffset: Math.random() * Math.PI * 2,
          vx: (Math.random() - 0.5) * 0.15,
          vy: (Math.random() - 0.5) * 0.15,
          color: Math.random() > 0.7 ? '#7e9f88' : (Math.random() > 0.4 ? '#b08d4b' : '#3d6049')
        });
      }
    }
    initStars();

    let animationFrameId;
    function renderStarfield(time) {
      ctx.clearRect(0, 0, width, height);

      // Draw faint constellation linkages between nearby stars
      ctx.lineWidth = 0.4;
      for (let i = 0; i < stars.length; i++) {
        const s = stars[i];
        
        // Gentle drift
        s.x += s.vx;
        s.y += s.vy;
        if (s.x < 0) s.x = width;
        if (s.x > width) s.x = 0;
        if (s.y < 0) s.y = height;
        if (s.y > height) s.y = 0;

        // Twinkle calculation
        s.alpha = s.baseAlpha + Math.sin(time * s.twinkleSpeed + s.twinkleOffset) * 0.3;
        if (s.alpha < 0.1) s.alpha = 0.1;

        ctx.fillStyle = s.color;
        ctx.globalAlpha = s.alpha * 0.7;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
        ctx.fill();

        // Connect a few neighbors
        for (let j = i + 1; j < Math.min(i + 8, stars.length); j++) {
          const s2 = stars[j];
          const dist = Math.hypot(s.x - s2.x, s.y - s2.y);
          if (dist < 90) {
            ctx.strokeStyle = '#3d6049';
            ctx.globalAlpha = (1 - dist / 90) * 0.12;
            ctx.beginPath();
            ctx.moveTo(s.x, s.y);
            ctx.lineTo(s2.x, s2.y);
            ctx.stroke();
          }
        }
      }

      ctx.globalAlpha = 1;
      animationFrameId = requestAnimationFrame(renderStarfield);
    }
    requestAnimationFrame(renderStarfield);
  }

  /* -----------------------------------------------------------------
   * 2. CUSTOM CELESTIAL CURSOR
   * ----------------------------------------------------------------- */
  const cursorDot = document.getElementById('cursorDot');
  const cursorAura = document.getElementById('cursorAura');

  if (cursorDot && cursorAura && window.matchMedia('(pointer: fine)').matches) {
    let mousePos = { x: -100, y: -100 };
    let auraPos = { x: -100, y: -100 };

    window.addEventListener('mousemove', (e) => {
      mousePos.x = e.clientX;
      mousePos.y = e.clientY;
      cursorDot.style.transform = `translate(${mousePos.x}px, ${mousePos.y}px)`;
    });

    function animateCursor() {
      // Lerp aura for fluid trailing physics
      auraPos.x += (mousePos.x - auraPos.x) * 0.18;
      auraPos.y += (mousePos.y - auraPos.y) * 0.18;
      cursorAura.style.transform = `translate(${auraPos.x}px, ${auraPos.y}px)`;
      requestAnimationFrame(animateCursor);
    }
    requestAnimationFrame(animateCursor);

    // Hover states on interactive elements
    const interactiveSelectors = 'a, button, input, select, textarea, .kundali-house, .tilt-card, .sandbox-tab, .dot-indicator';
    document.querySelectorAll(interactiveSelectors).forEach((el) => {
      el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
      el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
    });
  }

  /* -----------------------------------------------------------------
   * 3. SCROLL PROGRESS BAR & STICKY HEADER
   * ----------------------------------------------------------------- */
  const scrollProgressBar = document.getElementById('scrollProgressBar');
  const siteHeader = document.getElementById('siteHeader');
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section[id]');

  window.addEventListener('scroll', () => {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollPercent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;

    if (scrollProgressBar) {
      scrollProgressBar.style.width = `${scrollPercent}%`;
    }

    if (siteHeader) {
      if (scrollTop > 40) {
        siteHeader.classList.add('scrolled');
      } else {
        siteHeader.classList.remove('scrolled');
      }
    }

    // Active Section Spy
    let currentSectionId = '';
    sections.forEach((section) => {
      const sectionTop = section.offsetTop - 120;
      const sectionHeight = section.offsetHeight;
      if (scrollTop >= sectionTop && scrollTop < sectionTop + sectionHeight) {
        currentSectionId = section.getAttribute('id');
      }
    });

    navLinks.forEach((link) => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${currentSectionId}`) {
        link.classList.add('active');
      }
    });
  });

  /* -----------------------------------------------------------------
   * 4. DYNAMIC HERO TYPEWRITER
   * ----------------------------------------------------------------- */
  const typewriterText = document.getElementById('typewriterText');
  if (typewriterText) {
    const phrases = [
      "AI can't read your chart. Unless you can.",
      "Ancient Vedic Wisdom made simple.",
      "Ask AI the way the Rishis would.",
      "Decode your Dharma, Timing & Relationships.",
      "Not Your Mother's Astrologer · Julie Taparia NYC"
    ];

    let phraseIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let typeSpeed = 75;

    function typeLoop() {
      const currentPhrase = phrases[phraseIndex];

      if (isDeleting) {
        typewriterText.textContent = currentPhrase.substring(0, charIndex - 1);
        charIndex--;
        typeSpeed = 35;
      } else {
        typewriterText.textContent = currentPhrase.substring(0, charIndex + 1);
        charIndex++;
        typeSpeed = 70;
      }

      if (!isDeleting && charIndex === currentPhrase.length) {
        // Pause at complete phrase
        typeSpeed = 2200;
        isDeleting = true;
      } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        phraseIndex = (phraseIndex + 1) % phrases.length;
        typeSpeed = 400;
      }

      setTimeout(typeLoop, typeSpeed);
    }
    typeLoop();
  }

  /* -----------------------------------------------------------------
   * 5. SCROLL REVEAL OBSERVER
   * ----------------------------------------------------------------- */
  const revealElements = document.querySelectorAll('.reveal-on-scroll');
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const delay = entry.target.getAttribute('data-delay') || 0;
        setTimeout(() => {
          entry.target.classList.add('is-revealed');
        }, parseInt(delay, 10));
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -40px 0px'
  });

  revealElements.forEach((el) => revealObserver.observe(el));

  /* -----------------------------------------------------------------
   * 6. COUNT-UP CREDENTIALS ANIMATION
   * ----------------------------------------------------------------- */
  const countUpElements = document.querySelectorAll('.count-up');
  let countsAnimated = false;

  const countObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting && !countsAnimated) {
        countsAnimated = true;
        countUpElements.forEach((counter) => {
          const target = parseInt(counter.getAttribute('data-target'), 10);
          const duration = 1600; // ms
          const start = 0;
          const startTime = performance.now();

          function updateCounter(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            // Ease out cubic
            const easeProgress = 1 - Math.pow(1 - progress, 3);
            const currentVal = Math.floor(easeProgress * (target - start) + start);

            counter.textContent = currentVal;
            if (progress < 1) {
              requestAnimationFrame(updateCounter);
            } else {
              counter.textContent = target;
            }
          }
          requestAnimationFrame(updateCounter);
        });
      }
    });
  }, { threshold: 0.3 });

  const statsSection = document.querySelector('.stats-section');
  if (statsSection) {
    countObserver.observe(statsSection);
  }

  /* -----------------------------------------------------------------
   * 7. 3D PERSPECTIVE TILT CARDS
   * ----------------------------------------------------------------- */
  const tiltCards = document.querySelectorAll('.tilt-card');
  tiltCards.forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      // Calculate degrees (-8 to 8 deg)
      const rotateX = ((centerY - y) / centerY) * 7;
      const rotateY = ((x - centerX) / centerX) * 7;

      card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateY(-4px)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)';
    });
  });

  /* -----------------------------------------------------------------
   * 8. MAGNETIC BUTTONS EFFECT
   * ----------------------------------------------------------------- */
  const magneticButtons = document.querySelectorAll('.btn-magnetic');
  magneticButtons.forEach((btn) => {
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      btn.style.transform = `translate(${x * 0.25}px, ${y * 0.25}px)`;
    });

    btn.addEventListener('mouseleave', () => {
      btn.style.transform = 'translate(0px, 0px)';
    });
  });

  /* -----------------------------------------------------------------
   * 9. INTERACTIVE RISHI AI PROMPT ENGINE SANDBOX
   * ----------------------------------------------------------------- */
  const promptData = {
    marriage: {
      label: "Marriage Timing & Partner Alignment (7th House)",
      prompt: `[VEDIC JYOTISH AI PROTOCOL · PARASARA TRADITION]
Role: Act as an expert Vedic Astrologer trained in Maharishi Parasara's Brihat Parasara Hora Shastra (BPHS).
Chart Profile:
- Ascendant (Lagna): [Paste Lagna & Degree]
- 7th House (Yuvati Bhava) Sign & Lord: [Paste 7th Lord Placement]
- Venus (Karaka for Love) & Jupiter (Karaka for Dharma/Spouse): [Paste Placements]
- Navamsha (D9) Chart 7th House & Atmakaraka: [Paste D9 Placements]
- Current Vimshottari Mahadasha / Antardasha / Pratyantardasha: [Paste Dasha Dates]

Directives:
1. Examine the activation of the 7th Lord and Upapada Lagna (UL) during the current Mahadasha cycle.
2. Cross-reference Jupiter's transit through the 7th, 1st, or 11th from Moon and Lagna.
3. Identify potential karmic lessons or delays caused by Saturn or Rahu aspects on the 7th house.
4. Synthesize a grounded, non-superstitious timing window for commitment and qualities of the prospective partner.`
    },
    career: {
      label: "Career, Dharma & Natural Strengths (10th House)",
      prompt: `[VEDIC JYOTISH AI PROTOCOL · DHARMA & KARMA ANALYSIS]
Role: Vedic Career Astrologer utilizing Sage Jaimini and Parasara methodologies.
Chart Profile:
- Lagna & 10th House (Karma Bhava) Sign: [Paste 10th House Details]
- 10th Lord Placement, Conjunctions & Aspects: [Paste 10th Lord]
- Amatyakaraka (AmK - Planet with 2nd highest degree): [Paste AmK Planet]
- Dasamsa (D10) Divisional Chart Placements: [Paste D10 Ascendant & 10th House]
- Current Mahadasha & Saturn Sade Sati Phase: [Paste Dates]

Directives:
1. Decode the core vocational archetype indicated by the Amatyakaraka and 10th Lord.
2. Assess whether career success leans toward independent entrepreneurship (Sun/Mars/3rd/10th), technical advisory (Mercury/Ketu), or creative communications (Venus/Moon).
3. Evaluate the current planetary timing to determine if this is a season to consolidate current power or launch a bold career pivot.`
    },
    relationships: {
      label: "Relationship Compatibility & Karmic Patterns (Synastry)",
      prompt: `[VEDIC JYOTISH AI PROTOCOL · ASHTAKOOTA & KARMIC SYNASTRY]
Role: Certified Vedic Astrologer specializing in relationship harmony and karmic ties.
Chart Profiles (Partner A & Partner B):
- Moon Signs (Rashi) & Nakshatras with Padas: [Paste Moon A & B]
- Venus and Mars Placements: [Paste Both]
- Rahu-Ketu Axis in Both Charts: [Paste Nodal Axis]
- 7th House and Upapada Lagna: [Paste Both UL Signs]

Directives:
1. Calculate the core psychological compatibility based on Moon Nakshatras (Nadi, Yoni, Gana, Rashi Maitri).
2. Assess emotional balance: How do both minds communicate under stress?
3. Check for Manglik Dosha balance and whether planetary maturity softens friction.
4. Detail actionable emotional tools grounded in Vedic behavioral psychology.`
    },
    "current-chapter": {
      label: "Current Chapter (Vimshottari Dasha & Planetary Transits)",
      prompt: `[VEDIC JYOTISH AI PROTOCOL · LIFE TIMING & TRANSITS]
Role: Master Vedic Forecaster analyzing Vimshottari Dasha systems.
Current Timing Data:
- Active Mahadasha Lord: [e.g., Jupiter]
- Active Antardasha Lord: [e.g., Saturn]
- Active Pratyantardasha: [e.g., Mercury]
- Current Saturn Transit (Gochar) House from Moon: [e.g., 8th Ashtama or Sade Sati]
- Current Jupiter Transit House: [e.g., 5th House]

Directives:
1. Unpack what this active Dasha chapter is demanding of my soul and life focus.
2. Contrast the natural archetype of the Mahadasha Lord with the Antardasha Lord.
3. Identify favorable windows for decisions regarding residence, finances, and relationships.
4. Suggest practical Vedic remedies (Mantras, charitable acts, behavioral alignments) to optimize planetary flow.`
    },
    "moon-sign": {
      label: "Moon Sign (Chandra Lagna) & Mental Peace",
      prompt: `[VEDIC JYOTISH AI PROTOCOL · CHANDRA LAGNA PSYCHOLOGY]
Role: Vedic Psychological Astrologer analyzing emotional architecture.
Moon Data:
- Moon Sign (Rashi): [Paste Moon Sign]
- Moon Nakshatra & Deity: [Paste Nakshatra]
- Nakshatra Pada & Ruling Planet: [Paste Ruling Planet]
- Planetary Conjunctions with Moon: [e.g., Moon + Saturn / Moon + Rahu / Unafflicted]
- Waxing (Shukla) or Waning (Krishna) Paksha: [Paste Moon Phase]

Directives:
1. Describe how this Moon placement influences instinctive stress reactions and emotional regulation.
2. Outline specific environments, nutrition, and meditative habits that bring mental peace to this Nakshatra.
3. Contrast this internal emotional reality with the external persona projected by the Sun Sign.`
    }
  };

  const codeStream = document.getElementById('codeStream');
  const currentTopicLabel = document.getElementById('currentTopicLabel');
  const sandboxTabs = document.querySelectorAll('.sandbox-tab');
  const copyPromptBtn = document.getElementById('copyPromptBtn');
  const copyBtnText = document.getElementById('copyBtnText');
  const replayPromptBtn = document.getElementById('replayPromptBtn');
  let currentTopicKey = 'marriage';
  let typingTimeout = null;

  function streamPrompt(topicKey) {
    if (typingTimeout) clearTimeout(typingTimeout);
    const data = promptData[topicKey];
    if (!data || !codeStream) return;

    if (currentTopicLabel) {
      currentTopicLabel.textContent = data.label;
    }

    const fullText = data.prompt;
    codeStream.textContent = '';
    let index = 0;
    const streamSpeed = 6; // fast stream for code

    function streamStep() {
      // Add chunk of characters for realism and speed
      const chunkSize = Math.min(4, fullText.length - index);
      codeStream.textContent += fullText.substr(index, chunkSize);
      index += chunkSize;

      if (index < fullText.length) {
        typingTimeout = setTimeout(streamStep, streamSpeed);
      }
    }
    streamStep();
  }

  // Initial load of sandbox prompt
  streamPrompt('marriage');

  // Tab clicks
  sandboxTabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      sandboxTabs.forEach((t) => t.classList.remove('active'));
      tab.classList.add('active');
      currentTopicKey = tab.getAttribute('data-topic');
      streamPrompt(currentTopicKey);
    });
  });

  if (replayPromptBtn) {
    replayPromptBtn.addEventListener('click', () => {
      streamPrompt(currentTopicKey);
    });
  }

  // Copy Prompt to Clipboard
  if (copyPromptBtn) {
    copyPromptBtn.addEventListener('click', () => {
      const data = promptData[currentTopicKey];
      if (!data) return;

      navigator.clipboard.writeText(data.prompt).then(() => {
        if (copyBtnText) copyBtnText.textContent = 'Copied to Clipboard!';
        showToast('Rishi AI Prompt copied! Ready to paste into ChatGPT or Claude.');
        setTimeout(() => {
          if (copyBtnText) copyBtnText.textContent = 'Copy Prompt to Clipboard';
        }, 2500);
      }).catch(() => {
        showToast('Prompt copied!');
      });
    });
  }

  /* -----------------------------------------------------------------
   * 10. INTERACTIVE KUNDALI 12 HOUSES MAP
   * ----------------------------------------------------------------- */
  const kundaliHousesData = {
    1: {
      name: "Tanu Bhava",
      title: "The Ascendant & Physical Self",
      desc: "The 1st House represents your physical body, vitality, innate persona, personality, and how the world experiences your energy. It determines your rising sign (Lagna) and colors your entire chart.",
      ruler: "Aries / Mars",
      themes: "Vitality, Destiny, Identity, Outlook",
      aiRole: "\"Examine Lagna lord placement, strength and degrees\""
    },
    2: {
      name: "Dhana Bhava",
      title: "Wealth, Lineage & Speech",
      desc: "The 2nd House governs accumulated wealth, liquid assets, speech eloquence, family lineage, food habits, and oral communication.",
      ruler: "Taurus / Venus",
      themes: "Savings, Family Values, Voice, Food",
      aiRole: "\"Analyze 2nd lord in divisional charts for financial stability\""
    },
    3: {
      name: "Sahaja Bhava",
      title: "Courage, Siblings & Skills",
      desc: "The 3rd House represents courage, initiative, self-effort (Parakrama), younger siblings, manual dexterity, writing, and short travels.",
      ruler: "Gemini / Mercury",
      themes: "Initiative, Writing, Media, Hands, Willpower",
      aiRole: "\"Assess self-driven ventures and entrepreneurial drive\""
    },
    4: {
      name: "Sukha Bhava",
      title: "Inner Peace, Mother & Home",
      desc: "The 4th House reveals your emotional foundation, heart's contentment (Sukha), relationship with your mother, real estate, vehicles, and sanctuary.",
      ruler: "Cancer / Moon",
      themes: "Mother, Property, Peace of Mind, Education",
      aiRole: "\"Decode internal emotional security and domestic contentment\""
    },
    5: {
      name: "Putra Bhava",
      title: "Purva Punya, Intelligence & Romance",
      desc: "The 5th House is a holy Trikona ruling past-life karma (Purva Punya), creative genius, romance, children, mantra siddhi, and intellectual speculation.",
      ruler: "Leo / Sun",
      themes: "Creativity, Past-Life Merits, Children, Mantras",
      aiRole: "\"Examine 5th lord for creative breakthroughs and romance\""
    },
    6: {
      name: "Ari Bhava",
      title: "Overcoming Obstacles, Health & Daily Work",
      desc: "The 6th House is an Upachaya house ruling everyday routines, service, health challenges, litigation, debts, and the tenacity to overcome competitors.",
      ruler: "Virgo / Mercury",
      themes: "Health, Discipline, Overcoming Adversity, Service",
      aiRole: "\"Identify wellness rhythms and resilience through transits\""
    },
    7: {
      name: "Yuvati Bhava",
      title: "Marriage, Partnerships & Public Life",
      desc: "The 7th House directly opposite the 1st represents significant others, marital compatibility, business partnerships, and interactions with the public.",
      ruler: "Libra / Venus",
      themes: "Spouse, Marriage Timing, Business Alliances, Contracts",
      aiRole: "\"Pinpoint marriage timing, partner traits and D9 sync\""
    },
    8: {
      name: "Randhra Bhava",
      title: "Transformation, Longevity & The Occult",
      desc: "The 8th House oversees sudden transformation, unearned wealth (inheritances, partner's assets), longevity, research, and deep mystical knowledge.",
      ruler: "Scorpio / Mars & Ketu",
      themes: "Rebirth, Occult Wisdom, Sudden Changes, Secrets",
      aiRole: "\"Navigate intense life transitions and psychic regeneration\""
    },
    9: {
      name: "Dharma Bhava",
      title: "Higher Wisdom, Fortune & The Guru",
      desc: "The most auspicious Trikona, the 9th House governs highest fortune (Bhagya), moral destiny (Dharma), mentors/gurus, father, and spiritual pilgrimages.",
      ruler: "Sagittarius / Jupiter",
      themes: "Grace, Higher Philosophy, Teachers, Long Journeys",
      aiRole: "\"Evaluate spiritual guidance and blessings of fortune\""
    },
    10: {
      name: "Karma Bhava",
      title: "Career, Authority & Public Achievement",
      desc: "The highest point of the chart (Kendra), the 10th House governs career vocation, public reputation, leadership authority, and actions in society.",
      ruler: "Capricorn / Saturn",
      themes: "Vocation, Worldly Status, Fame, Professional Power",
      aiRole: "\"Align current Dasha with optimal career elevation\""
    },
    11: {
      name: "Labha Bhava",
      title: "Gains, Networks & Highest Desires",
      desc: "The house of fulfillment of wishes (Labha), the 11th House governs financial windfalls, expansive social circles, elder siblings, and humanitarian ambitions.",
      ruler: "Aquarius / Saturn & Rahu",
      themes: "Revenues, Community, Aspirations, Massive Networks",
      aiRole: "\"Identify streams of gain and influential group connections\""
    },
    12: {
      name: "Vyaya Bhava",
      title: "Moksha, Foreign Lands & Liberation",
      desc: "The final house represents spiritual liberation (Moksha), detachment, foreign settlement, meditation sanctuaries, dreams, and expenditures.",
      ruler: "Pisces / Jupiter",
      themes: "Spiritual Awakening, Foreign Lands, Solitude, Sleep",
      aiRole: "\"Explore overseas relocation and deep meditative states\""
    }
  };

  const kundaliHouses = document.querySelectorAll('.kundali-house');
  const detailHouseNum = document.getElementById('detailHouseNum');
  const detailSanskrit = document.getElementById('detailSanskrit');
  const detailTitle = document.getElementById('detailTitle');
  const detailDescription = document.getElementById('detailDescription');
  const detailRuler = document.getElementById('detailRuler');
  const detailThemes = document.getElementById('detailThemes');
  const detailAiRole = document.getElementById('detailAiRole');

  function updateKundaliHouse(houseNum) {
    const data = kundaliHousesData[houseNum];
    if (!data) return;

    kundaliHouses.forEach((h) => {
      if (parseInt(h.getAttribute('data-house'), 10) === parseInt(houseNum, 10)) {
        h.classList.add('active');
      } else {
        h.classList.remove('active');
      }
    });

    if (detailHouseNum) detailHouseNum.textContent = `House ${houseNum}`;
    if (detailSanskrit) detailSanskrit.textContent = data.name;
    if (detailTitle) detailTitle.textContent = data.title;
    if (detailDescription) detailDescription.textContent = data.desc;
    if (detailRuler) detailRuler.textContent = data.ruler;
    if (detailThemes) detailThemes.textContent = data.themes;
    if (detailAiRole) detailAiRole.textContent = data.aiRole;
  }

  // Attach hover and click to Kundali polygons
  kundaliHouses.forEach((houseEl) => {
    const houseNum = houseEl.getAttribute('data-house');
    houseEl.addEventListener('mouseenter', () => updateKundaliHouse(houseNum));
    houseEl.addEventListener('click', () => updateKundaliHouse(houseNum));
  });

  // Default house 1
  updateKundaliHouse(1);

  /* -----------------------------------------------------------------
   * 11. TESTIMONIALS SLIDER
   * ----------------------------------------------------------------- */
  const testimonialSlides = document.querySelectorAll('.testimonial-slide');
  const reviewDots = document.querySelectorAll('.dot-indicator');
  const prevReviewBtn = document.getElementById('prevReviewBtn');
  const nextReviewBtn = document.getElementById('nextReviewBtn');
  let currentSlide = 0;
  let slideInterval = null;

  function showSlide(index) {
    if (!testimonialSlides.length) return;
    if (index >= testimonialSlides.length) currentSlide = 0;
    else if (index < 0) currentSlide = testimonialSlides.length - 1;
    else currentSlide = index;

    testimonialSlides.forEach((slide, i) => {
      slide.classList.remove('active');
      if (i === currentSlide) slide.classList.add('active');
    });

    reviewDots.forEach((dot, i) => {
      dot.classList.remove('active');
      if (i === currentSlide) dot.classList.add('active');
    });
  }

  function nextSlide() {
    showSlide(currentSlide + 1);
  }

  function prevSlide() {
    showSlide(currentSlide - 1);
  }

  function startAutoSlide() {
    if (slideInterval) clearInterval(slideInterval);
    slideInterval = setInterval(nextSlide, 6500);
  }

  function stopAutoSlide() {
    if (slideInterval) clearInterval(slideInterval);
  }

  if (nextReviewBtn) {
    nextReviewBtn.addEventListener('click', () => {
      nextSlide();
      startAutoSlide();
    });
  }

  if (prevReviewBtn) {
    prevReviewBtn.addEventListener('click', () => {
      prevSlide();
      startAutoSlide();
    });
  }

  reviewDots.forEach((dot) => {
    dot.addEventListener('click', () => {
      const idx = parseInt(dot.getAttribute('data-index'), 10);
      showSlide(idx);
      startAutoSlide();
    });
  });

  const testimonialSlider = document.getElementById('testimonialSlider');
  if (testimonialSlider) {
    testimonialSlider.addEventListener('mouseenter', stopAutoSlide);
    testimonialSlider.addEventListener('mouseleave', startAutoSlide);
  }

  startAutoSlide();

  /* -----------------------------------------------------------------
   * 12. AMBIENT CELESTIAL SOUND SYNTHESIZER (Web Audio API)
   * ----------------------------------------------------------------- */
  const soundToggle = document.getElementById('soundToggle');
  let audioCtx = null;
  let isSoundPlaying = false;
  let soundInterval = null;

  function playCelestialChime() {
    if (!audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      audioCtx = new AudioContext();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    // Ancient Solfeggio / Tibetan bowl resonant frequencies (432Hz, 528Hz, 648Hz, 864Hz)
    const frequencies = [432, 528, 648, 864, 324];
    const freq = frequencies[Math.floor(Math.random() * frequencies.length)];

    const now = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now);
    // Subtle vibrato
    osc.frequency.exponentialRampToValueAtTime(freq * 1.002, now + 1.5);

    // Ethereal bell envelope
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.exponentialRampToValueAtTime(0.08, now + 0.15); // soft strike
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 4.5); // long decay

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start(now);
    osc.stop(now + 4.8);
  }

  if (soundToggle) {
    soundToggle.addEventListener('click', () => {
      isSoundPlaying = !isSoundPlaying;
      if (isSoundPlaying) {
        soundToggle.classList.add('playing');
        playCelestialChime();
        soundInterval = setInterval(playCelestialChime, 4500);
        showToast('Celestial Chimes (432Hz) Activated');
      } else {
        soundToggle.classList.remove('playing');
        if (soundInterval) clearInterval(soundInterval);
        showToast('Celestial Chimes Muted');
      }
    });
  }

  /* -----------------------------------------------------------------
   * 13. MODALS & MOBILE DRAWER
   * ----------------------------------------------------------------- */
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const mobileDrawer = document.getElementById('mobileDrawer');
  const drawerBackdrop = document.getElementById('drawerBackdrop');
  const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');

  function closeMobileDrawer() {
    if (mobileMenuBtn) {
      mobileMenuBtn.classList.remove('active');
      mobileMenuBtn.setAttribute('aria-expanded', 'false');
    }
    if (mobileDrawer) mobileDrawer.classList.remove('open');
    if (drawerBackdrop) drawerBackdrop.classList.remove('active');
    document.body.style.overflow = '';
  }

  function openMobileDrawer() {
    if (mobileMenuBtn) {
      mobileMenuBtn.classList.add('active');
      mobileMenuBtn.setAttribute('aria-expanded', 'true');
    }
    if (mobileDrawer) mobileDrawer.classList.add('open');
    if (drawerBackdrop) drawerBackdrop.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  if (mobileMenuBtn && mobileDrawer) {
    mobileMenuBtn.addEventListener('click', () => {
      const isOpen = mobileDrawer.classList.contains('open');
      if (isOpen) {
        closeMobileDrawer();
      } else {
        openMobileDrawer();
      }
    });

    if (drawerBackdrop) {
      drawerBackdrop.addEventListener('click', closeMobileDrawer);
    }

    mobileNavLinks.forEach((link) => {
      link.addEventListener('click', closeMobileDrawer);
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && mobileDrawer.classList.contains('open')) {
        closeMobileDrawer();
      }
    });
  }

  // Inquiry / WhatsApp Modal
  const contactModal = document.getElementById('contactModal');
  const modalCloseBtn = document.getElementById('modalCloseBtn');
  const whatsappOpenBtn = document.getElementById('whatsappOpenBtn');
  const whatsappBannerBtn = document.getElementById('whatsappBannerBtn');

  function openModal() {
    if (contactModal) contactModal.classList.add('open');
  }

  function closeModal() {
    if (contactModal) contactModal.classList.remove('open');
  }

  const bottomWhatsappTrigger = document.getElementById('bottomWhatsappTrigger');
  if (whatsappOpenBtn) whatsappOpenBtn.addEventListener('click', openModal);
  if (whatsappBannerBtn) whatsappBannerBtn.addEventListener('click', openModal);
  if (bottomWhatsappTrigger) bottomWhatsappTrigger.addEventListener('click', openModal);
  if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeModal);

  if (contactModal) {
    contactModal.addEventListener('click', (e) => {
      if (e.target === contactModal) closeModal();
    });
  }

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
  });

  /* -----------------------------------------------------------------
   * 14. TOAST NOTIFICATION UTILITY
   * ----------------------------------------------------------------- */
  const toastNotification = document.getElementById('toastNotification');
  const toastMessage = document.getElementById('toastMessage');
  let toastTimeout = null;

  function showToast(message) {
    if (!toastNotification || !toastMessage) return;
    toastMessage.textContent = message;
    toastNotification.classList.add('show');

    if (toastTimeout) clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
      toastNotification.classList.remove('show');
    }, 3200);
  }

  // Current year in footer
  const currentYearSpan = document.getElementById('currentYear');
  if (currentYearSpan) {
    currentYearSpan.textContent = new Date().getFullYear();
  }

  /* -----------------------------------------------------------------
   * 15. SILKY-SMOOTH MULTI-LAYER PARALLAX ENGINE
   * ----------------------------------------------------------------- */
  const parallaxElements = document.querySelectorAll('[data-parallax-speed]');
  const isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (parallaxElements.length && !isReducedMotion) {
    let windowHeight = window.innerHeight;
    let targetScrollY = window.scrollY || window.pageYOffset;
    let currentScrollY = targetScrollY;

    let targetMouseX = 0;
    let targetMouseY = 0;
    let currentMouseX = 0;
    let currentMouseY = 0;

    window.addEventListener('resize', () => {
      windowHeight = window.innerHeight;
    });

    window.addEventListener('scroll', () => {
      targetScrollY = window.scrollY || window.pageYOffset;
    }, { passive: true });

    window.addEventListener('mousemove', (e) => {
      targetMouseX = (e.clientX / window.innerWidth - 0.5) * 2;
      targetMouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    });

    function updateParallax() {
      // Lerp scroll position for ultra-smooth fluid cinematic motion
      currentScrollY += (targetScrollY - currentScrollY) * 0.12;

      // Lerp mouse coordinates
      currentMouseX += (targetMouseX - currentMouseX) * 0.08;
      currentMouseY += (targetMouseY - currentMouseY) * 0.08;

      parallaxElements.forEach((el) => {
        const speed = parseFloat(el.getAttribute('data-parallax-speed')) || 0;

        // Skip vertical card staggering on narrow mobile screens to avoid overlap
        if (window.innerWidth < 768 && el.classList.contains('pricing-card-col')) {
          el.style.transform = 'none';
          return;
        }

        const rect = el.getBoundingClientRect();

        // Check if element is within view buffer
        if (rect.bottom >= -250 && rect.top <= windowHeight + 250) {
          const elementCenter = rect.top + rect.height / 2;
          const viewportCenter = windowHeight / 2;
          const distanceFromCenter = elementCenter - viewportCenter;
          const scrollShift = distanceFromCenter * speed;

          // If the element also responds to mouse (floating symbols / badges)
          let mouseShiftX = 0;
          let mouseShiftY = 0;
          if (el.classList.contains('parallax-floating-symbol') || el.classList.contains('floating-stat-badge')) {
            mouseShiftX = currentMouseX * (speed * 45);
            mouseShiftY = currentMouseY * (speed * 45);
          }

          const totalX = mouseShiftX.toFixed(2);
          const totalY = (scrollShift + mouseShiftY).toFixed(2);

          // Apply 3D accelerated transform
          el.style.transform = `translate3d(${totalX}px, ${totalY}px, 0)`;
        }
      });

      requestAnimationFrame(updateParallax);
    }
    requestAnimationFrame(updateParallax);
  }
});
