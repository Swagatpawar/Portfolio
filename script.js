/**
 * SWAGAT PAWAR — EDITORIAL PORTFOLIO INTERACTION ENGINE (2026)
 * Features:
 *  1. 3-Stage Branded Opening Sequence
 *  2. Sticky Navigation & ScrollSpy
 *  3. Mobile Drawer Menu with ARIA & Esc Key handling
 *  4. AI Introduction Video Modal with Playback, Captions, Seeking & Audio Visualizer
 *  5. Scroll-Triggered Reveal Animations
 *  6. Real-time IST Local Time Clock
 */

(function () {
  'use strict';

  // State
  let isVideoPlaying = false;
  let videoCurrentTime = 0;
  const videoDuration = 38; // 38 seconds
  let videoTimer = null;
  let isMuted = false;
  let speechUtterance = null;

  const captionsTimeline = [
    { start: 0, end: 4, text: "Hello! I’m Swagat Pawar, an aspiring AI/ML developer and Data Science enthusiast from Belagavi, Karnataka." },
    { start: 4, end: 11, text: "I build practical, high-impact machine learning and computer vision systems that solve real-world problems." },
    { start: 11, end: 19, text: "In PlantGuard AI, I engineered a deep-learning model achieving 98.06% accuracy to classify 15 crop disease categories." },
    { start: 19, end: 27, text: "For CineMatch, I built a custom NumPy-based Singular Value Decomposition recommendation system." },
    { start: 27, end: 34, text: "And with FarmSaathi, our team won 1st Prize for AI innovation, bringing multilingual crop advice to growers." },
    { start: 34, end: 38, text: "I’m always learning and eager to build what’s next. Welcome to my portfolio!" }
  ];

  /* ==========================================================================
     1. OPENING SEQUENCE (Stages 1, 2, 3)
     ========================================================================== */
  function initOpeningSequence() {
    const loader = document.getElementById('opening-loader');
    const progressBar = document.getElementById('loader-progress-bar');
    const progressTrack = document.getElementById('loader-progressbar');
    const statusText = document.getElementById('loader-status-text');

    if (!loader) return;

    // Check prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      document.body.classList.remove('is-loading');
      loader.classList.add('loaded');
      return;
    }

    const duration = 1200; // ~1.2 seconds target
    const startTime = performance.now();

    function updateProgress(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const percentage = Math.round(progress * 100);

      if (progressBar) {
        progressBar.style.width = percentage + '%';
      }
      if (progressTrack) {
        progressTrack.setAttribute('aria-valuenow', percentage);
      }

      if (statusText) {
        if (progress < 0.35) {
          statusText.textContent = 'INITIALIZING EXPERIENCE';
        } else if (progress < 0.75) {
          statusText.textContent = 'CONFIGURING AI/ML WORKFLOWS';
        } else if (progress < 0.95) {
          statusText.textContent = 'PREPARING EDITORIAL VIEW';
        } else {
          statusText.textContent = 'SYSTEM READY';
        }
      }

      if (progress < 1) {
        requestAnimationFrame(updateProgress);
      } else {
        setTimeout(completeLoader, 180);
      }
    }

    function completeLoader() {
      loader.classList.add('loaded');
      document.body.classList.remove('is-loading');
    }

    requestAnimationFrame(updateProgress);
  }

  /* ==========================================================================
     2. NAVIGATION SCROLL & SCROLLSPY
     ========================================================================== */
  function initNavigation() {
    const header = document.getElementById('site-header');
    const navLinks = document.querySelectorAll('.desktop-nav .nav-link');
    const sections = document.querySelectorAll('section[id]');

    // Header scroll background toggle
    function onScroll() {
      if (window.scrollY > 24) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    // ScrollSpy using IntersectionObserver
    if ('IntersectionObserver' in window) {
      const observerOptions = {
        root: null,
        rootMargin: '-20% 0px -60% 0px',
        threshold: 0
      };

      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute('id');
            navLinks.forEach((link) => {
              if (link.getAttribute('href') === '#' + id) {
                link.classList.add('active');
              } else {
                link.classList.remove('active');
              }
            });
          }
        });
      }, observerOptions);

      sections.forEach((section) => observer.observe(section));
    }
  }

  /* ==========================================================================
     3. MOBILE DRAWER NAVIGATION
     ========================================================================== */
  function initMobileDrawer() {
    const toggleBtn = document.getElementById('menu-toggle');
    const drawer = document.getElementById('mobile-nav');
    const closeBtn = document.getElementById('mobile-close');
    const drawerLinks = document.querySelectorAll('.mobile-nav-link');

    if (!toggleBtn || !drawer) return;

    function openDrawer() {
      drawer.classList.add('open');
      drawer.setAttribute('aria-hidden', 'false');
      toggleBtn.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
      if (closeBtn) closeBtn.focus();
    }

    function closeDrawer() {
      drawer.classList.remove('open');
      drawer.setAttribute('aria-hidden', 'true');
      toggleBtn.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
      toggleBtn.focus();
    }

    toggleBtn.addEventListener('click', openDrawer);
    if (closeBtn) closeBtn.addEventListener('click', closeDrawer);

    drawerLinks.forEach((link) => {
      link.addEventListener('click', closeDrawer);
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && drawer.classList.contains('open')) {
        closeDrawer();
      }
    });
  }

  /* ==========================================================================
     4. AI INTRODUCTION VIDEO MODAL & AUDIO ENGINE
     ========================================================================== */
  function initVideoModal() {
    const openBtn = document.getElementById('open-video-btn');
    const modal = document.getElementById('intro-video-modal');
    const closeBtn = document.getElementById('close-video-btn');
    const playBtn = document.getElementById('video-play-btn');
    const playLabel = document.getElementById('play-btn-label');
    const timeDisplay = document.getElementById('video-time');
    const progressTrack = document.getElementById('video-progress-track');
    const progressFill = document.getElementById('video-progress-fill');
    const captionsOverlay = document.getElementById('captions-overlay');
    const captionsToggle = document.getElementById('captions-toggle-btn');
    const volumeToggle = document.getElementById('volume-toggle-btn');
    const visualizerBars = document.querySelectorAll('.video-audio-visualizer .v-bar');

    if (!openBtn || !modal) return;

    let visualizerInterval = null;

    function openModal() {
      modal.classList.add('open');
      modal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      if (closeBtn) closeBtn.focus();
      // Auto-start video presentation on user click
      startVideoPlayback();
    }

    function closeModal() {
      pauseVideoPlayback();
      modal.classList.remove('open');
      modal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      openBtn.focus();
    }

    openBtn.addEventListener('click', openModal);
    if (closeBtn) closeBtn.addEventListener('click', closeModal);

    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeModal();
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.classList.contains('open')) {
        closeModal();
      }
    });

    // Playback control
    function startVideoPlayback() {
      isVideoPlaying = true;
      if (playLabel) playLabel.textContent = '❚❚ Pause';
      startVisualizer();

      if ('speechSynthesis' in window && !isMuted) {
        playSpeech(videoCurrentTime);
      }

      clearInterval(videoTimer);
      videoTimer = setInterval(tickVideo, 250);
    }

    function pauseVideoPlayback() {
      isVideoPlaying = false;
      if (playLabel) playLabel.textContent = '▶ Play';
      stopVisualizer();

      if ('speechSynthesis' in window) {
        isSpeakingSequence = false;
        window.speechSynthesis.cancel();
      }

      clearInterval(videoTimer);
    }

    function tickVideo() {
      videoCurrentTime += 0.25;
      if (videoCurrentTime >= videoDuration) {
        videoCurrentTime = videoDuration;
        pauseVideoPlayback();
      }
      updateVideoUI();
    }

    function updateVideoUI() {
      // Progress bar
      const progressPercent = (videoCurrentTime / videoDuration) * 100;
      if (progressFill) progressFill.style.width = progressPercent + '%';

      // Time display
      const curM = Math.floor(videoCurrentTime / 60);
      const curS = Math.floor(videoCurrentTime % 60);
      const durM = Math.floor(videoDuration / 60);
      const durS = Math.floor(videoDuration % 60);
      if (timeDisplay) {
        timeDisplay.textContent = `${curM}:${curS.toString().padStart(2, '0')} / ${durM}:${durS.toString().padStart(2, '0')}`;
      }

      // Synchronize captions
      if (captionsOverlay) {
        const currentCaption = captionsTimeline.find(
          c => videoCurrentTime >= c.start && videoCurrentTime < c.end
        );
        if (currentCaption) {
          captionsOverlay.textContent = `"${currentCaption.text}"`;
        }
      }
    }

    // Play/Pause button
    if (playBtn) {
      playBtn.addEventListener('click', () => {
        if (isVideoPlaying) {
          pauseVideoPlayback();
        } else {
          if (videoCurrentTime >= videoDuration) {
            videoCurrentTime = 0;
          }
          startVideoPlayback();
        }
      });
    }

    // Seek via progress track click
    if (progressTrack) {
      progressTrack.addEventListener('click', (e) => {
        const rect = progressTrack.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const ratio = Math.max(0, Math.min(1, clickX / rect.width));
        videoCurrentTime = ratio * videoDuration;
        updateVideoUI();
        if ('speechSynthesis' in window) {
          window.speechSynthesis.cancel();
          if (isVideoPlaying && !isMuted) {
            playSpeech(videoCurrentTime);
          }
        }
      });
    }

    // CC Toggle
    if (captionsToggle) {
      captionsToggle.addEventListener('click', () => {
        const isHidden = captionsOverlay.classList.toggle('hidden');
        captionsToggle.setAttribute('aria-pressed', (!isHidden).toString());
        captionsToggle.style.color = isHidden ? '#8D8D84' : '#D8FF3E';
      });
    }

    // Volume Toggle
    if (volumeToggle) {
      volumeToggle.addEventListener('click', () => {
        isMuted = !isMuted;
        volumeToggle.textContent = isMuted ? '🔇' : '🔊';
        if (isMuted) {
          if ('speechSynthesis' in window) window.speechSynthesis.cancel();
        } else if (isVideoPlaying) {
          playSpeech();
        }
      });
    }

    // Natural Male Voice Selection, Calibration & Chunking
    let cachedMaleVoice = null;
    let selectedVoicePreference = 'christopher';
    let speechQueue = [];
    let isSpeakingSequence = false;

    const voiceSelect = document.getElementById('voice-select');
    if (voiceSelect) {
      voiceSelect.addEventListener('change', (e) => {
        selectedVoicePreference = e.target.value;
        cachedMaleVoice = findBestMaleVoice(selectedVoicePreference);
        if (isVideoPlaying && !isMuted) {
          playSpeech(videoCurrentTime);
        }
      });
    }

    function findBestMaleVoice(preference = selectedVoicePreference) {
      if (!('speechSynthesis' in window)) return null;
      const voices = window.speechSynthesis.getVoices();
      if (!voices || voices.length === 0) return null;

      const femaleKeywords = [
        'female', 'zira', 'jenny', 'aria', 'samantha', 'victoria', 
        'karen', 'susan', 'hazel', 'catherine', 'heera', 'neerja', 
        'stephanie', 'michelle', 'linda', 'elena', 'clara', 'eva', 
        'serena', 'fiona', 'tessa', 'zoe', 'natasha'
      ];

      const isFemale = (v) => {
        const name = (v.name + ' ' + (v.voiceURI || '')).toLowerCase();
        return femaleKeywords.some(kw => name.includes(kw));
      };

      const enVoices = voices.filter(v => v.lang.startsWith('en'));

      // If user specifically picked a profile:
      if (preference === 'christopher') {
        const match = enVoices.find(v => !isFemale(v) && v.name.toLowerCase().includes('christopher'));
        if (match) return match;
      } else if (preference === 'guy') {
        const match = enVoices.find(v => !isFemale(v) && v.name.toLowerCase().includes('guy'));
        if (match) return match;
      } else if (preference === 'prabhat') {
        const match = enVoices.find(v => !isFemale(v) && v.name.toLowerCase().includes('prabhat'));
        if (match) return match;
      } else if (preference === 'david') {
        const match = enVoices.find(v => !isFemale(v) && v.name.toLowerCase().includes('david'));
        if (match) return match;
      }

      // Priority 1: High-fidelity natural online English male voices
      const naturalMalePatterns = [
        'prabhat online', 'guy online', 'christopher online', 'eric online',
        'ryan online', 'google uk english male', 'natural male', 'english male'
      ];
      for (const pattern of naturalMalePatterns) {
        const match = enVoices.find(v => !isFemale(v) && v.name.toLowerCase().includes(pattern));
        if (match) return match;
      }

      // Priority 2: Standard desktop English male voices
      const maleNames = [
        'christopher', 'guy', 'prabhat', 'eric', 'david', 'mark', 
        'ryan', 'daniel', 'george', 'alex', 'fred', 'oliver', 
        'james', 'brian', 'tom', 'male', 'ravi'
      ];
      for (const name of maleNames) {
        const match = enVoices.find(v => !isFemale(v) && v.name.toLowerCase().includes(name));
        if (match) return match;
      }

      // Priority 3: Any English voice that is not female
      const nonFemaleEn = enVoices.find(v => !isFemale(v));
      if (nonFemaleEn) return nonFemaleEn;

      return enVoices[0] || voices[0];
    }

    if ('speechSynthesis' in window) {
      cachedMaleVoice = findBestMaleVoice();
      window.speechSynthesis.onvoiceschanged = () => {
        cachedMaleVoice = findBestMaleVoice();
      };
    }

    // Natural sentence-by-sentence conversational playback
    function playSpeech(startTime = 0) {
      if (!('speechSynthesis' in window) || isMuted) return;
      window.speechSynthesis.cancel();
      isSpeakingSequence = false;

      // Filter captions timeline from current playback time
      const remainingItems = captionsTimeline.filter(item => item.end > startTime);
      if (remainingItems.length === 0) return;

      const maleVoice = cachedMaleVoice || findBestMaleVoice();
      let index = 0;
      isSpeakingSequence = true;

      function speakNextSentence() {
        if (!isVideoPlaying || !isSpeakingSequence || index >= remainingItems.length) {
          isSpeakingSequence = false;
          return;
        }

        const item = remainingItems[index];
        const utterance = new SpeechSynthesisUtterance(item.text);

        // Acoustic calibration:
        // rate: 0.96 for calm, clear, deliberate articulation
        // pitch: 0.93 for a natural, rich, resonant baritone delivery
        utterance.rate = 0.96;
        utterance.pitch = 0.93;

        if (maleVoice) {
          utterance.voice = maleVoice;
        }

        utterance.onend = () => {
          index++;
          // Subtle natural pause (180ms) between sentences to mimic human breathing & cadence
          setTimeout(speakNextSentence, 180);
        };

        utterance.onerror = () => {
          index++;
          speakNextSentence();
        };

        window.speechSynthesis.speak(utterance);
      }

      speakNextSentence();
    }

    // Visualizer bar animation
    function startVisualizer() {
      stopVisualizer();
      visualizerInterval = setInterval(() => {
        visualizerBars.forEach(bar => {
          const randHeight = Math.floor(Math.random() * 20) + 4;
          bar.style.height = randHeight + 'px';
        });
      }, 100);
    }

    function stopVisualizer() {
      clearInterval(visualizerInterval);
      visualizerBars.forEach(bar => {
        bar.style.height = '4px';
      });
    }
  }

  /* ==========================================================================
     5. SCROLL REVEAL OBSERVER
     ========================================================================== */
  function initScrollReveals() {
    const reveals = document.querySelectorAll('.section, .project-editorial-item, .achievement-card, .skill-category-card');

    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            obs.unobserve(entry.target);
          }
        });
      }, {
        threshold: 0.12,
        rootMargin: '0px 0px -50px 0px'
      });

      reveals.forEach(el => {
        el.classList.add('reveal-on-scroll');
        observer.observe(el);
      });
    } else {
      reveals.forEach(el => el.classList.add('revealed'));
    }
  }

  /* ==========================================================================
     6. LIVE TIME CLOCK (IST)
     ========================================================================== */
  function initLiveClock() {
    const clock = document.getElementById('live-clock');
    if (!clock) return;

    function updateTime() {
      try {
        const now = new Date();
        const options = {
          timeZone: 'Asia/Kolkata',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true
        };
        const timeString = new Intl.DateTimeFormat('en-IN', options).format(now);
        clock.textContent = `IST (UTC+5:30) • ${timeString}`;
      } catch (e) {
        clock.textContent = 'IST (UTC+5:30)';
      }
    }

    updateTime();
    setInterval(updateTime, 1000);
  }

  /* ==========================================================================
     7. TOP READING SCROLL PROGRESS
     ========================================================================== */
  function initScrollProgress() {
    const progressBar = document.getElementById('scroll-progress');
    if (!progressBar) return;

    function updateScrollProgress() {
      const scrollTotal = document.documentElement.scrollHeight - window.innerHeight;
      const progress = scrollTotal > 0 ? (window.scrollY / scrollTotal) * 100 : 0;
      progressBar.style.width = Math.min(progress, 100) + '%';
    }

    window.addEventListener('scroll', updateScrollProgress, { passive: true });
    updateScrollProgress();
  }

  /* ==========================================================================
     8. EDITORIAL CUSTOM INTERACTIVE CURSOR
     ========================================================================== */
  function initCustomCursor() {
    if (window.matchMedia('(pointer: coarse)').matches) return;

    const dot = document.getElementById('cursor-dot');
    const ring = document.getElementById('cursor-ring');
    if (!dot || !ring) return;

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let ringX = mouseX;
    let ringY = mouseY;
    let isMoving = false;

    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      dot.style.left = mouseX + 'px';
      dot.style.top = mouseY + 'px';
      if (!isMoving) {
        isMoving = true;
        renderCursor();
      }
    });

    function renderCursor() {
      ringX += (mouseX - ringX) * 0.18;
      ringY += (mouseY - ringY) * 0.18;
      ring.style.left = ringX + 'px';
      ring.style.top = ringY + 'px';

      if (Math.abs(mouseX - ringX) > 0.1 || Math.abs(mouseY - ringY) > 0.1) {
        requestAnimationFrame(renderCursor);
      } else {
        isMoving = false;
      }
    }

    // Interactive Hover Elements
    const hoverTargets = document.querySelectorAll('a, button, .btn, .skill-chip, .project-editorial-item, .portrait-card, .achievement-card, .timeline-row, .p-metric, .project-media-frame');
    hoverTargets.forEach((el) => {
      el.addEventListener('mouseenter', () => ring.classList.add('cursor-hover'));
      el.addEventListener('mouseleave', () => ring.classList.remove('cursor-hover'));
    });

    window.addEventListener('mousedown', () => ring.classList.add('cursor-click'));
    window.addEventListener('mouseup', () => ring.classList.remove('cursor-click'));
  }

  /* ==========================================================================
     9. 3D CARD PERSPECTIVE TILT & SPOTLIGHT SHIMMER
     ========================================================================== */
  function initCardTiltAndSpotlight() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const cards = document.querySelectorAll('.portrait-card, .skill-category-card, .achievement-card, .manifesto-card, .project-media-frame');

    cards.forEach((card) => {
      card.classList.add('spotlight-card', 'tilt-card');

      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        card.style.setProperty('--mouse-x', x + 'px');
        card.style.setProperty('--mouse-y', y + 'px');

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = ((y - centerY) / centerY) * -4.5;
        const rotateY = ((x - centerX) / centerX) * 4.5;

        card.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-3px)`;
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(900px) rotateX(0deg) rotateY(0deg) translateY(0px)';
      });
    });
  }

  /* ==========================================================================
     10. SCROLL-TRIGGERED NUMBER COUNTER
     ========================================================================== */
  function initAnimatedCounters() {
    const targets = document.querySelectorAll('.count-target');
    if (!targets.length) return;

    if (!('IntersectionObserver' in window) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const el = entry.target;
          obs.unobserve(el);

          const targetVal = parseFloat(el.getAttribute('data-count'));
          const suffix = el.getAttribute('data-suffix') || '';
          const isDecimal = el.getAttribute('data-count').includes('.');
          const duration = 1400;
          const startTime = performance.now();

          function count(now) {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easeOut = 1 - Math.pow(1 - progress, 3);
            const currentVal = easeOut * targetVal;

            if (isDecimal) {
              el.textContent = currentVal.toFixed(2) + suffix;
            } else if (targetVal > 1000) {
              el.textContent = Math.round(currentVal).toLocaleString() + suffix;
            } else {
              el.textContent = Math.round(currentVal) + suffix;
            }

            if (progress < 1) {
              requestAnimationFrame(count);
            } else {
              el.classList.add('counted');
            }
          }

          requestAnimationFrame(count);
        }
      });
    }, { threshold: 0.25 });

    targets.forEach((target) => observer.observe(target));
  }

  /* ==========================================================================
     DOM READY BOOTSTRAP
     ========================================================================== */
  document.addEventListener('DOMContentLoaded', () => {
    initOpeningSequence();
    initNavigation();
    initMobileDrawer();
    initVideoModal();
    initScrollReveals();
    initLiveClock();
    initScrollProgress();
    initCustomCursor();
    initCardTiltAndSpotlight();
    initAnimatedCounters();
  });

})();
