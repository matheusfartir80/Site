/* ============================================================
   FARTIR CUT — CONTROLADOR DE COREOGRAFIA DE SCROLL
   Carregado exclusivamente em cut/index.html.
   ============================================================ */
(function () {
  "use strict";

  if (!document.body || document.body.getAttribute("data-page") !== "home") {
    return;
  }

  /* ------------------------------------------------------------
     1. CONFIGURAÇÃO DOS NÚMEROS E POSIÇÕES
     ------------------------------------------------------------ */
  var MOTION_CONFIG = {
    desktopMinWidth: 920,
    desktopMinHeight: 600,
    heroShiftDesktop: 44,
    heroShiftMobile: 14,
    heroTiltDeg: 2.2,

    /* Posições originais (%) e posições agrupadas (%) dos 5 trechos na timeline da Cena C */
    wbClips: [
      { rawLeft: 0.00, width: 0.13, packedLeft: 0.145, time: "0:05", screenIdx: 1 },
      { rawLeft: 0.225, width: 0.115, packedLeft: 0.282, time: "0:02", screenIdx: 2 },
      { rawLeft: 0.435, width: 0.14, packedLeft: 0.404, time: "0:04", screenIdx: 3 },
      { rawLeft: 0.665, width: 0.12, packedLeft: 0.551, time: "0:03", screenIdx: 0 },
      { rawLeft: 0.865, width: 0.135, packedLeft: 0.678, time: "0:04", screenIdx: 2 }
    ],
    wbPickThresholds: [0.22, 0.26, 0.31, 0.36, 0.41],
    heroPickThresholds: [0.10, 0.24, 0.40, 0.56, 0.72]
  };

  /* ------------------------------------------------------------
     2. UTILITÁRIOS MATEMÁTICOS
     ------------------------------------------------------------ */
  function clamp(v, min, max) {
    return v < min ? min : v > max ? max : v;
  }

  function invLerp(a, b, v) {
    if (b === a) return 1;
    return clamp((v - a) / (b - a), 0, 1);
  }

  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  function easeOutCubic(t) {
    var inv = 1 - clamp(t, 0, 1);
    return 1 - inv * inv * inv;
  }

  function easeInOutCubic(t) {
    var x = clamp(t, 0, 1);
    return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
  }

  /* ------------------------------------------------------------
     3. ESTADO E REFERÊNCIAS DO DOM
     ------------------------------------------------------------ */
  var dom = {};
  var metrics = {
    vw: window.innerWidth || 390,
    vh: window.innerHeight || 800,
    isRTL: false,
    isDesktopSticky: false,
    reducedMotion: false,
    heroTop: 0,
    heroHeight: 600,
    hrsWidth: 120,
    bridgeWidth: 20,
    wbTop: 0,
    wbHeight: 1000,
    wbStageHeight: 600,
    wbLaneWidth: 420,
    railHeight: 240,
    stepTops: [0, 0, 0],
    perkTops: [],
    offerTop: 0,
    helpTops: [],
    demoTop: 0,
    demoHeight: 500,
    demoHidden: true
  };

  var stepTexts = {
    s1: "Escolha o vídeo original",
    s2: "Revise os trechos",
    s3: "Salve sem perder nitidez"
  };

  var rafId = 0;
  var observers = [];

  function queryElements() {
    dom.html = document.documentElement;
    dom.heroSection = document.getElementById("vantagens");
    dom.heroOriginFill = document.querySelector("[data-hero-origin-fill]");
    dom.heroOriginTc = document.querySelector(".hpo-tc");
    dom.phoneBeforeMover = document.querySelector('[data-phone-mover="before"]');
    dom.phoneAfterMover = document.querySelector('[data-phone-mover="after"]');
    dom.hrsStrip = document.querySelector("[data-hero-raw-strip]");
    dom.hrsTrack = dom.hrsStrip ? dom.hrsStrip.querySelector(".hrs-track") : null;
    dom.hrsPicks = document.querySelectorAll("[data-hrs-pick]");
    dom.hrsGaps = dom.hrsStrip ? dom.hrsStrip.querySelectorAll(".hrs-seg.is-gap") : [];
    dom.heroPlayhead = document.querySelector("[data-hero-playhead]");
    dom.heroProgressFill = document.querySelector("[data-hero-progress-fill]");
    dom.phoneBridge = document.querySelector("[data-phone-bridge]");
    dom.phoneBridgeFill = document.querySelector("[data-phone-bridge-fill]");
    dom.phoneBridgeDot = document.querySelector("[data-phone-bridge-dot]");
    dom.heroTakes = document.querySelectorAll("[data-hero-take]");

    dom.perkCards = document.querySelectorAll("[data-perk-card]");

    dom.wbSection = document.getElementById("como-funciona");
    dom.wbTrack = document.querySelector("[data-wb-track]");
    dom.wbSticky = document.querySelector("[data-wb-sticky]");
    dom.wbSurface = document.querySelector("[data-wb-surface]");
    dom.stepsGrid = document.querySelector("[data-steps-grid]");
    dom.stepCards = document.querySelectorAll("[data-step-card]");
    dom.stepsRail = document.querySelector(".steps-red-rail");
    dom.stepsRailFill = document.querySelector("[data-steps-rail-fill]");
    dom.stepsRailHead = document.querySelector("[data-steps-rail-head]");
    dom.smsPlayhead0 = document.querySelector('[data-sms-playhead="0"]');
    dom.smsPlayhead1 = document.querySelector('[data-sms-playhead="1"]');

    dom.wbPhaseNum = document.querySelector("[data-wb-phase-num]");
    dom.wbPhaseLabel = document.querySelector("[data-wb-phase-label]");
    dom.wbTimecode = document.querySelector("[data-wb-timecode]");
    dom.wbPhoneFrame = dom.wbSurface ? dom.wbSurface.querySelector(".wb-phone-frame") : null;
    dom.wbScreens = document.querySelectorAll("[data-wb-screen]");
    dom.wbCrop = document.querySelector("[data-wb-crop]");
    dom.wbHudTag = document.querySelector("[data-wb-hud-tag]");
    dom.wbHudClip = document.querySelector("[data-wb-hud-clip]");
    dom.wbSeqSummary = document.querySelector("[data-wb-seq-summary]");
    dom.wbSlots = document.querySelectorAll("[data-wb-slot]");
    dom.wbLane = document.querySelector("[data-wb-lane]");
    dom.wbClips = document.querySelectorAll("[data-wb-clip]");
    dom.wbGaps = document.querySelectorAll("[data-wb-gap]");
    dom.wbPlayhead = document.querySelector("[data-wb-playhead]");
    dom.wbAudio = document.querySelector("[data-wb-audio]");

    dom.demoSection = document.getElementById("demonstracao");
    dom.demoShell = document.querySelector("[data-demo-shell]");

    dom.offerBox = document.querySelector("[data-offer-box]");
    dom.helpItems = document.querySelectorAll("[data-help-item]");
    dom.faqDetails = document.querySelectorAll("details.faq-item");
  }

  function refreshStepTranslations() {
    var s1El = document.querySelector('[data-i18n="step_1_title"]');
    var s2El = document.querySelector('[data-i18n="step_2_title"]');
    var s3El = document.querySelector('[data-i18n="step_3_title"]');
    if (s1El && s1El.textContent) stepTexts.s1 = s1El.textContent.trim();
    if (s2El && s2El.textContent) stepTexts.s2 = s2El.textContent.trim();
    if (s3El && s3El.textContent) stepTexts.s3 = s3El.textContent.trim();
  }

  /* ------------------------------------------------------------
     4. LEITURA DE MEDIDAS (READ PHASE)
     ------------------------------------------------------------ */
  function measureLayout() {
    try {
      var scrollY = window.scrollY || window.pageYOffset || 0;
      metrics.vw = window.innerWidth || document.documentElement.clientWidth || 390;
      metrics.vh = window.innerHeight || document.documentElement.clientHeight || 800;
      metrics.isRTL = document.documentElement.dir === "rtl";

      var isMobilePreview = dom.html.classList.contains("is-mobile-preview");
      metrics.isDesktopSticky =
        !metrics.reducedMotion &&
        !isMobilePreview &&
        metrics.vw >= MOTION_CONFIG.desktopMinWidth &&
        metrics.vh >= MOTION_CONFIG.desktopMinHeight;

      if (dom.heroSection) {
        var hRect = dom.heroSection.getBoundingClientRect();
        metrics.heroTop = hRect.top + scrollY;
        metrics.heroHeight = Math.max(1, hRect.height);
      }

      if (dom.hrsTrack) {
        metrics.hrsWidth = Math.max(40, dom.hrsTrack.clientWidth);
      }

      if (dom.phoneBridge) {
        metrics.bridgeWidth = Math.max(12, dom.phoneBridge.clientWidth);
      }

      if (dom.wbTrack) {
        var wRect = dom.wbTrack.getBoundingClientRect();
        metrics.wbTop = wRect.top + scrollY;
        metrics.wbHeight = Math.max(1, wRect.height);
      }

      if (dom.wbSticky && metrics.isDesktopSticky) {
        metrics.wbStageHeight = Math.max(1, dom.wbSticky.clientHeight);
      } else {
        metrics.wbStageHeight = metrics.vh * 0.7;
      }

      if (dom.wbLane) {
        metrics.wbLaneWidth = Math.max(200, dom.wbLane.clientWidth);
      }

      if (dom.stepsRail) {
        metrics.railHeight = Math.max(60, dom.stepsRail.clientHeight);
      }

      for (var i = 0; i < dom.stepCards.length; i++) {
        var sRect = dom.stepCards[i].getBoundingClientRect();
        metrics.stepTops[i] = sRect.top + scrollY;
      }

      metrics.perkTops = [];
      for (var pIdx = 0; pIdx < dom.perkCards.length; pIdx++) {
        metrics.perkTops[pIdx] = dom.perkCards[pIdx].getBoundingClientRect().top + scrollY;
      }

      if (dom.offerBox) {
        metrics.offerTop = dom.offerBox.getBoundingClientRect().top + scrollY;
      }

      metrics.helpTops = [];
      for (var hIdx = 0; hIdx < dom.helpItems.length; hIdx++) {
        metrics.helpTops[hIdx] = dom.helpItems[hIdx].getBoundingClientRect().top + scrollY;
      }

      if (dom.demoSection) {
        metrics.demoHidden = Boolean(dom.demoSection.hidden);
        if (!metrics.demoHidden) {
          var dRect = dom.demoSection.getBoundingClientRect();
          metrics.demoTop = dRect.top + scrollY;
          metrics.demoHeight = Math.max(1, dRect.height);
        }
      }
    } catch (err) {
      fallbackToStatic();
    }
  }

  /* ------------------------------------------------------------
     5. CENA A — TRANSFORMAÇÃO DO HERO (RENDER)
     ------------------------------------------------------------ */
  function renderHeroScene(p) {
    var clamped = clamp(p, 0, 1);
    var eased = easeOutCubic(clamped);
    var dirSign = metrics.isRTL ? -1 : 1;

    /* Linha vermelha de origem acima do título */
    if (dom.heroOriginFill) {
      var originScale = lerp(0.18, 1, eased);
      dom.heroOriginFill.style.transform = "scaleX(" + originScale.toFixed(3) + ")";
    }
    if (dom.heroOriginTc) {
      var secs = Math.round(lerp(0, 39, clamped));
      dom.heroOriginTc.textContent = "00:00:" + (secs < 10 ? "0" + secs : String(secs));
    }

    /* Deslocamento sutil e alinhamento dos dois celulares (até 48px desktop, 16px mobile) */
    var maxShift = metrics.vw >= MOTION_CONFIG.desktopMinWidth ? MOTION_CONFIG.heroShiftDesktop : MOTION_CONFIG.heroShiftMobile;
    var yBefore = lerp(0, -maxShift * 0.45, clamped);
    var yAfter = lerp(6, -maxShift * 0.85, clamped);
    var rotBefore = lerp(-MOTION_CONFIG.heroTiltDeg, 0, eased);
    var rotAfter = lerp(MOTION_CONFIG.heroTiltDeg, 0, eased);
    var scaleAfter = lerp(0.985, 1.0, eased);

    if (dom.phoneBeforeMover) {
      dom.phoneBeforeMover.style.transform =
        "translate3d(0," + yBefore.toFixed(1) + "px,0) rotate(" + rotBefore.toFixed(2) + "deg)";
    }
    if (dom.phoneAfterMover) {
      dom.phoneAfterMover.style.transform =
        "translate3d(0," + yAfter.toFixed(1) + "px,0) scale(" + scaleAfter.toFixed(3) + ") rotate(" + rotAfter.toFixed(2) + "deg)";
    }

    /* Playhead cruzando a faixa de miniaturas no celular 1 */
    if (dom.heroPlayhead) {
      var phX = lerp(2, Math.max(4, metrics.hrsWidth - 4), clamped);
      dom.heroPlayhead.style.transform = "translate3d(" + phX.toFixed(1) + "px,0,0)";
    }

    if (dom.heroProgressFill) {
      var progScale = lerp(0.22, 1, clamped);
      dom.heroProgressFill.style.transform = "scaleX(" + progScale.toFixed(3) + ")";
    }

    /* 5 regiões ganham contornos vermelhos; intervalos vazios perdem destaque */
    var dimGaps = clamped > 0.28;
    for (var g = 0; g < dom.hrsGaps.length; g++) {
      dom.hrsGaps[g].classList.toggle("is-dimmed", dimGaps);
    }

    var activeHeadIdx = -1;
    for (var k = 0; k < dom.hrsPicks.length; k++) {
      var isMarked = clamped >= MOTION_CONFIG.heroPickThresholds[k];
      dom.hrsPicks[k].classList.toggle("is-marked", isMarked);
      if (isMarked) activeHeadIdx = k;
    }

    /* Traço curto vermelho que une origem e seleção */
    var bridgeP = invLerp(0.08, 0.82, clamped);
    if (dom.phoneBridgeFill) {
      dom.phoneBridgeFill.style.transform = "scaleX(" + lerp(0.18, 1, bridgeP).toFixed(3) + ")";
    }
    if (dom.phoneBridgeDot) {
      var dotX = lerp(2, Math.max(4, metrics.bridgeWidth - 2), bridgeP) * dirSign;
      dom.phoneBridgeDot.style.transform = "translate3d(" + dotX.toFixed(1) + "px,0,0)";
    }

    /* Os 5 .take-item no celular 2 recebem as seleções organizadas */
    for (var t = 0; t < dom.heroTakes.length; t++) {
      var takeEl = dom.heroTakes[t];
      var selected = clamped >= MOTION_CONFIG.heroPickThresholds[t];
      takeEl.classList.toggle("is-selected", selected);
      takeEl.classList.toggle("is-waiting", !selected && clamped > 0.02);
      takeEl.classList.toggle("is-active-head", t === activeHeadIdx && clamped < 0.92);
    }
  }

  /* ------------------------------------------------------------
     6. CENA C — A MESA DE EDIÇÃO (RENDER)
     ------------------------------------------------------------ */
  function renderWorkbenchScene(p) {
    var clamped = clamp(p, 0, 1);

    /* 1. Passo ativo na coluna de narrativa (0..2) */
    var activeStep = clamped < 0.34 ? 0 : clamped < 0.74 ? 1 : 2;
    for (var s = 0; s < dom.stepCards.length; s++) {
      dom.stepCards[s].classList.toggle("is-active", s === activeStep);
    }

    /* Linha vermelha lateral que liga as 3 etapas */
    if (dom.stepsRailFill) {
      var railScale = clamp(lerp(0.12, 1, clamped), 0.12, 1);
      dom.stepsRailFill.style.transform = "scaleY(" + railScale.toFixed(3) + ")";
    }
    if (dom.stepsRailHead) {
      var headY = lerp(6, Math.max(12, metrics.railHeight - 6), clamped);
      dom.stepsRailHead.style.transform = "translate3d(0," + headY.toFixed(1) + "px,0)";
    }

    /* No celular / fluxo compacto, anima também os playheads dos quadros móveis */
    if (!metrics.isDesktopSticky || !dom.wbSurface) {
      if (dom.smsPlayhead0) {
        var pStep0 = invLerp(0.0, 0.42, clamped);
        dom.smsPlayhead0.style.left = lerp(12, 86, pStep0).toFixed(1) + "%";
      }
      if (dom.smsPlayhead1) {
        var pStep1 = invLerp(0.28, 0.78, clamped);
        dom.smsPlayhead1.style.left = lerp(16, 88, pStep1).toFixed(1) + "%";
      }
      return;
    }

    /* 2. Rótulo de fase conforme a tabela de progresso:
          0.00–0.20: Escolha o vídeo original
          0.20–0.45: Escolha → revise
          0.45–0.68: Revise os trechos
          0.68–0.85: Revise → salve
          0.85–1.00: Salve sem perder nitidez */
    var phaseNumTxt = "01 / 03";
    var phaseLabelTxt = stepTexts.s1;
    var arrow = metrics.isRTL ? " ← " : " → ";

    if (clamped < 0.20) {
      phaseNumTxt = "01 / 03";
      phaseLabelTxt = stepTexts.s1;
    } else if (clamped < 0.45) {
      phaseNumTxt = "01 → 02";
      phaseLabelTxt = stepTexts.s1 + arrow + stepTexts.s2;
    } else if (clamped < 0.68) {
      phaseNumTxt = "02 / 03";
      phaseLabelTxt = stepTexts.s2;
    } else if (clamped < 0.85) {
      phaseNumTxt = "02 → 03";
      phaseLabelTxt = stepTexts.s2 + arrow + stepTexts.s3;
    } else {
      phaseNumTxt = "03 / 03";
      phaseLabelTxt = stepTexts.s3;
    }

    if (dom.wbPhaseNum) dom.wbPhaseNum.textContent = phaseNumTxt;
    if (dom.wbPhaseLabel) dom.wbPhaseLabel.textContent = phaseLabelTxt;

    /* 3. Fase 0.00–0.20: Faixa contínua entra e se encaixa na área de edição */
    var enterP = easeOutCubic(invLerp(0.0, 0.18, clamped));
    if (dom.wbLane) {
      var laneEnterX = lerp(28, 0, enterP) * (metrics.isRTL ? -1 : 1);
      var laneOpacity = lerp(0.45, 1, enterP);
      dom.wbLane.style.transform = "translate3d(" + laneEnterX.toFixed(1) + "px,0,0)";
      dom.wbLane.style.opacity = laneOpacity.toFixed(2);
    }

    /* 4. Fase 0.20–0.45: Playhead percorre a faixa; 5 seleções recebem bordas vermelhas
       5. Fase 0.45–0.68: Intervalos não selecionados recuam 12px e somem; trechos se aproximam
       6. Fase 0.68–0.85: Pontas de um trecho ajustam poucos pixels; sequência fica alinhada
       7. Fase 0.85–1.00: Moldura final se estabiliza, destaque vermelho termina */
    var collapseP = easeInOutCubic(invLerp(0.46, 0.66, clamped));
    var trimP = Math.sin(invLerp(0.68, 0.84, clamped) * Math.PI);
    var trimSettled = easeOutCubic(invLerp(0.72, 0.85, clamped));
    var finalP = easeOutCubic(invLerp(0.85, 0.96, clamped));

    /* Intervalos não selecionados recuam 12px e somem */
    for (var g = 0; g < dom.wbGaps.length; g++) {
      var gapEl = dom.wbGaps[g];
      var gapY = lerp(0, 12, collapseP);
      var gapScaleY = lerp(1, 0.82, collapseP);
      var gapOp = lerp(1, 0, collapseP);
      gapEl.style.transform = "translate3d(0," + gapY.toFixed(1) + "px,0) scaleY(" + gapScaleY.toFixed(3) + ")";
      gapEl.style.opacity = gapOp.toFixed(2);
    }

    /* Trechos selecionados se aproximam via transform: translate3d */
    var laneW = metrics.wbLaneWidth;
    var activeScreenIdx = 0;
    var activeClipNumber = 1;

    for (var c = 0; c < dom.wbClips.length; c++) {
      var clipEl = dom.wbClips[c];
      var cfg = MOTION_CONFIG.wbClips[c];
      var isMarked = clamped >= MOTION_CONFIG.wbPickThresholds[c];
      var isStabilized = clamped >= 0.87;
      var isTrimTarget = c === 2 && clamped >= 0.68 && clamped < 0.86;

      if (isMarked) {
        activeScreenIdx = cfg.screenIdx;
        activeClipNumber = c + 1;
      }

      /* Deslocamento horizontal do estado bruto para a sequência agrupada */
      var deltaNorm = (cfg.packedLeft - cfg.rawLeft) * collapseP;
      var dxPx = deltaNorm * laneW;

      /* Ajuste fino de pontas (0.68–0.85): trecho 3 ajusta alguns pixels e os seguintes acompanham */
      var trimShiftPx = 0;
      var trimScaleX = 1;
      if (c === 2 && clamped >= 0.68) {
        trimScaleX = 1 - 0.045 * trimSettled + 0.02 * trimP;
      } else if (c > 2 && clamped >= 0.68) {
        trimShiftPx = -3.5 * trimSettled + 1.5 * trimP;
      }

      clipEl.style.transform =
        "translate3d(" + (dxPx + trimShiftPx).toFixed(1) + "px,0,0) scaleX(" + trimScaleX.toFixed(3) + ")";

      clipEl.classList.toggle("is-marked", isMarked && !isStabilized);
      clipEl.classList.toggle("is-stabilized", isStabilized);
      clipEl.classList.toggle("is-trim-active", isTrimTarget);

      /* Sincroniza a lista de 5 takes no painel superior */
      if (dom.wbSlots[c]) {
        dom.wbSlots[c].classList.toggle("is-picked", isMarked);
        dom.wbSlots[c].classList.toggle("is-packed", collapseP > 0.6);
        dom.wbSlots[c].classList.toggle("is-trimming", isTrimTarget);
      }
    }

    /* Posição do Playhead vermelho ao longo das fases */
    if (dom.wbPlayhead) {
      var playheadNorm = 0.02;
      if (clamped < 0.20) {
        playheadNorm = lerp(0.0, 0.04, invLerp(0.0, 0.20, clamped));
      } else if (clamped < 0.45) {
        playheadNorm = lerp(0.04, 0.96, invLerp(0.20, 0.44, clamped));
      } else if (clamped < 0.68) {
        /* Acompanha o agrupamento até a borda do trecho 3 na sequência */
        playheadNorm = lerp(0.96, 0.54, collapseP);
      } else if (clamped < 0.85) {
        /* Permanece na ponta ajustada do trecho 3 e avança ao fim da sequência */
        playheadNorm = lerp(0.54, 0.81, invLerp(0.68, 0.85, clamped));
      } else {
        playheadNorm = 0.81;
      }

      var phPx = playheadNorm * laneW;
      dom.wbPlayhead.style.transform = "translate3d(" + phPx.toFixed(1) + "px,0,0)";
      dom.wbPlayhead.style.opacity = clamped >= 0.92 ? "0.45" : "1";
    }

    /* Faixa de áudio/música acompanha o agrupamento da sequência */
    if (dom.wbAudio) {
      var audioScaleX = lerp(1, 0.68, collapseP);
      dom.wbAudio.style.transform = "scaleX(" + audioScaleX.toFixed(3) + ")";
    }

    /* Monitor do celular e HUD */
    if (clamped >= 0.85) {
      activeScreenIdx = 3;
    }
    for (var scr = 0; scr < dom.wbScreens.length; scr++) {
      dom.wbScreens[scr].classList.toggle("is-visible", scr === activeScreenIdx);
    }

    if (dom.wbCrop) {
      dom.wbCrop.classList.toggle("is-locked", clamped >= 0.65);
    }
    if (dom.wbPhoneFrame) {
      dom.wbPhoneFrame.classList.toggle("is-final-locked", finalP > 0.5);
    }

    if (dom.wbTimecode) {
      if (clamped < 0.45) {
        dom.wbTimecode.textContent = "01:00:00";
      } else if (clamped < 0.85) {
        dom.wbTimecode.textContent = "00:00:39";
      } else {
        dom.wbTimecode.textContent = "0:39 · OK";
      }
    }

    if (dom.wbHudTag) {
      dom.wbHudTag.textContent = clamped < 0.48 ? "RAW · 1:00:00" : clamped < 0.85 ? "SEQ · 20 CLIPS" : "0:39";
    }
    if (dom.wbHudClip) {
      var clipCfg = MOTION_CONFIG.wbClips[clamp(activeClipNumber - 1, 0, 4)];
      dom.wbHudClip.textContent = clamped >= 0.85 ? "0:39 READY" : "#0" + activeClipNumber + " · " + clipCfg.time;
    }
  }

  /* ------------------------------------------------------------
     7. CENA D — DEMONSTRAÇÃO (RENDER)
     ------------------------------------------------------------ */
  function renderDemoScene(p) {
    if (!dom.demoShell || metrics.demoHidden) return;
    var eased = easeOutCubic(clamp(p, 0, 1));
    var scale = lerp(0.96, 1.0, eased);
    var opacity = lerp(0.6, 1.0, eased);
    dom.demoShell.style.transform = "scale(" + scale.toFixed(3) + ")";
    dom.demoShell.style.opacity = opacity.toFixed(2);
  }

  /* ------------------------------------------------------------
     8. ATUALIZAÇÃO DE SCROLL (SINGLE RAF)
     ------------------------------------------------------------ */
  function updateOnScroll() {
    rafId = 0;
    if (metrics.reducedMotion) return;

    try {
      var scrollY = window.scrollY || window.pageYOffset || 0;

      /* Progresso da Cena A (Hero) */
      var heroTravel = Math.max(120, metrics.heroHeight * 0.72);
      var pHero = clamp((scrollY - metrics.heroTop) / heroTravel, 0, 1);
      renderHeroScene(pHero);

      /* Progresso da Cena C (Mesa de Edição) */
      var pWb = 0;
      if (metrics.isDesktopSticky) {
        var denom = Math.max(1, metrics.wbHeight - metrics.wbStageHeight);
        pWb = clamp((scrollY - metrics.wbTop + 84) / denom, 0, 1);
      } else {
        var mobileDenom = Math.max(1, metrics.wbHeight - metrics.vh * 0.45);
        pWb = clamp((scrollY - (metrics.wbTop - metrics.vh * 0.35)) / mobileDenom, 0, 1);
      }
      renderWorkbenchScene(pWb);

      /* Progresso da Cena D (Demonstração: escala 0.96 -> 1 e opacidade 0.6 -> 1) */
      if (!metrics.demoHidden && dom.demoShell) {
        var demoStart = metrics.demoTop - metrics.vh * 0.88;
        var demoEnd = metrics.demoTop - metrics.vh * 0.28;
        var pDemo = invLerp(demoStart, demoEnd, scrollY);
        renderDemoScene(pDemo);
      }

      /* Verificação síncrona de entrada para Cenas B, E e F (garante revelação imediata em âncoras e saltos rápidos) */
      var perkTrigger = scrollY + metrics.vh * 0.85;
      for (var pk = 0; pk < dom.perkCards.length; pk++) {
        if (metrics.perkTops[pk] !== undefined && metrics.perkTops[pk] <= perkTrigger) {
          dom.perkCards[pk].classList.add("is-revealed");
        }
      }

      var blockTrigger = scrollY + metrics.vh * 0.88;
      if (dom.offerBox && metrics.offerTop <= blockTrigger) {
        dom.offerBox.classList.add("is-revealed");
      }

      for (var hk = 0; hk < dom.helpItems.length; hk++) {
        if (metrics.helpTops[hk] !== undefined && metrics.helpTops[hk] <= blockTrigger) {
          dom.helpItems[hk].classList.add("is-revealed");
        }
      }
    } catch (err) {
      fallbackToStatic();
    }
  }

  function requestTick() {
    if (metrics.reducedMotion) return;
    if (!rafId) {
      rafId = window.requestAnimationFrame(updateOnScroll);
    }
  }

  /* ------------------------------------------------------------
     9. INTERSECTION OBSERVERS (ENTRADAS CENA B, E, F)
     ------------------------------------------------------------ */
  function setupRevealObservers() {
    for (var i = 0; i < observers.length; i++) {
      observers[i].disconnect();
    }
    observers = [];

    if (metrics.reducedMotion || typeof IntersectionObserver === "undefined") {
      revealAllStatic();
      return;
    }

    /* Cena B: revelar cada vantagem quando entrar entre 85% e 65% da altura da tela (uma vez por visita) */
    var perkObserver = new IntersectionObserver(
      function (entries) {
        for (var e = 0; e < entries.length; e++) {
          if (entries[e].isIntersecting) {
            entries[e].target.classList.add("is-revealed");
            perkObserver.unobserve(entries[e].target);
          }
        }
      },
      { root: null, rootMargin: "0px 0px -15% 0px", threshold: 0.15 }
    );

    for (var p = 0; p < dom.perkCards.length; p++) {
      perkObserver.observe(dom.perkCards[p]);
    }
    observers.push(perkObserver);

    /* Cena E (#licenca) e Cena F (#ajuda) */
    var blockObserver = new IntersectionObserver(
      function (entries) {
        for (var e = 0; e < entries.length; e++) {
          if (entries[e].isIntersecting) {
            entries[e].target.classList.add("is-revealed");
            blockObserver.unobserve(entries[e].target);
          }
        }
      },
      { root: null, rootMargin: "0px 0px -12% 0px", threshold: 0.15 }
    );

    if (dom.offerBox) {
      blockObserver.observe(dom.offerBox);
    }
    for (var h = 0; h < dom.helpItems.length; h++) {
      blockObserver.observe(dom.helpItems[h]);
    }
    observers.push(blockObserver);
  }

  function revealAllStatic() {
    if (dom.html) {
      dom.html.classList.add("is-hero-entered");
    }
    for (var p = 0; p < dom.perkCards.length; p++) {
      dom.perkCards[p].classList.add("is-revealed");
    }
    if (dom.offerBox) {
      dom.offerBox.classList.add("is-revealed");
    }
    for (var h = 0; h < dom.helpItems.length; h++) {
      dom.helpItems[h].classList.add("is-revealed");
    }
    renderHeroScene(1);
    renderWorkbenchScene(1);
    renderDemoScene(1);
  }

  function fallbackToStatic() {
    try {
      if (rafId) {
        window.cancelAnimationFrame(rafId);
        rafId = 0;
      }
      if (dom.html) {
        dom.html.classList.remove("js-motion-ready");
        dom.html.classList.add("is-hero-entered");
      }
      revealAllStatic();
    } catch (e) {}
  }

  /* ------------------------------------------------------------
     10. INICIALIZAÇÃO E LISTENERS DE RECÁLCULO
     ------------------------------------------------------------ */
  function handleMotionPreferenceChange(mq) {
    metrics.reducedMotion = Boolean(mq && mq.matches);
    if (dom.html) {
      dom.html.classList.toggle("is-reduced-motion", metrics.reducedMotion);
    }
    measureLayout();
    setupRevealObservers();
    if (metrics.reducedMotion) {
      revealAllStatic();
    } else {
      updateOnScroll();
    }
  }

  function ensureImagesLoaded() {
    var imgs = document.querySelectorAll("img");
    for (var i = 0; i < imgs.length; i++) {
      (function (img) {
        var retried = false;
        function reloadIfFailed() {
          if (retried) return;
          var src = img.getAttribute("src");
          if (!src) return;
          retried = true;
          setTimeout(function () {
            var sep = src.indexOf("?") === -1 ? "?" : "&";
            img.src = src + sep + "r=1";
          }, 150);
        }
        img.addEventListener("error", reloadIfFailed);
        if (img.complete && img.naturalWidth === 0) {
          reloadIfFailed();
        }
      })(imgs[i]);
    }
  }

  function init() {
    try {
      queryElements();
      refreshStepTranslations();
      ensureImagesLoaded();

      var mq = window.matchMedia ? window.matchMedia("(prefers-reduced-motion: reduce)") : null;
      metrics.reducedMotion = Boolean(mq && mq.matches);

      dom.html.classList.add("js-motion-ready");
      dom.html.classList.toggle("is-reduced-motion", metrics.reducedMotion);

      /* Dispara entrada curta do hero no próximo frame */
      window.requestAnimationFrame(function () {
        dom.html.classList.add("is-hero-entered");
      });

      measureLayout();
      setupRevealObservers();

      if (metrics.reducedMotion) {
        revealAllStatic();
      } else {
        updateOnScroll();
      }

      /* Listeners passivos de scroll e resize */
      window.addEventListener("scroll", requestTick, { passive: true });
      window.addEventListener(
        "resize",
        function () {
          measureLayout();
          requestTick();
        },
        { passive: true }
      );

      /* Recalcula após carregamento completo de imagens/mídia e fontes */
      window.addEventListener("load", function () {
        measureLayout();
        requestTick();
      });

      if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(function () {
          measureLayout();
          requestTick();
        });
      }

      /* Recalcula ao trocar qualquer um dos 14 idiomas */
      window.addEventListener("cut:i18n-applied", function () {
        refreshStepTranslations();
        measureLayout();
        if (metrics.reducedMotion) {
          revealAllStatic();
        } else {
          updateOnScroll();
        }
      });

      /* Recalcula ao abrir ou fechar perguntas do FAQ */
      for (var f = 0; f < dom.faqDetails.length; f++) {
        dom.faqDetails[f].addEventListener("toggle", function () {
          measureLayout();
          requestTick();
        });
      }

      /* Responde à mudança de prefers-reduced-motion durante a visita */
      if (mq) {
        if (typeof mq.addEventListener === "function") {
          mq.addEventListener("change", handleMotionPreferenceChange);
        } else if (typeof mq.addListener === "function") {
          mq.addListener(handleMotionPreferenceChange);
        }
      }
    } catch (err) {
      fallbackToStatic();
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
