(function () {
  "use strict";

  function muteSignLanguageVideo(video) {
    var source = video.getAttribute("src") || video.currentSrc || "";
    var remoteStart = source.indexOf("https://");

    // The bundled runtime normally prefixes mapped filenames with the local
    // video directory. Remove that prefix when videos.json supplies a fully
    // qualified GitHub Release URL.
    if (remoteStart > 0) {
      source = source.slice(remoteStart);
      video.setAttribute("src", source);
    }

    var isLocalSignVideo = source.includes("/content/i18n/") && source.includes("/video/");
    var isReleaseSignVideo = source.includes("/releases/download/sign-language-v1/");
    if (!isLocalSignVideo && !isReleaseSignVideo) return false;

    video.defaultMuted = true;
    video.muted = true;
    video.volume = 0;
    video.setAttribute("muted", "");
    return true;
  }

  function muteVideos(root) {
    if (root instanceof HTMLVideoElement) muteSignLanguageVideo(root);
    if (root.querySelectorAll) {
      root.querySelectorAll("video").forEach(muteSignLanguageVideo);
    }
  }

  function findNarrationButton() {
    return Array.from(document.querySelectorAll("button")).find(function (button) {
      return (button.getAttribute("aria-label") || "").includes("maandishi kwa sauti");
    });
  }

  function narrationIsPlaying() {
    var button = findNarrationButton();
    return Boolean(button && (button.getAttribute("aria-label") || "").startsWith("Zima"));
  }

  function resumeSignLanguageVideos() {
    document.querySelectorAll("video").forEach(function (video) {
      muteSignLanguageVideo(video);
      if (video.paused && !video.ended) {
        video.play().catch(function () {
          // A later user interaction will retry playback if the browser blocks it.
        });
      }
    });
  }

  function scheduleVideoResume() {
    [50, 300, 1000].forEach(function (delay) {
      window.setTimeout(resumeSignLanguageVideos, delay);
    });
  }

  // The reader treats narration and sign language as exclusive modes. Preserve
  // the active narration mode and resume the silent sign video after either
  // control changes so both accessibility features can run together.
  document.addEventListener("click", function (event) {
    var button = event.target.closest && event.target.closest("button");
    if (!button) return;

    var label = button.getAttribute("aria-label") || "";
    var isNarrationButton = label.includes("maandishi kwa sauti");
    var isSignLanguageButton = label === "Lugha ya ishara";
    if (!isNarrationButton && !isSignLanguageButton) return;

    var narrationWasPlaying = narrationIsPlaying();
    window.setTimeout(function () {
      if (isSignLanguageButton && narrationWasPlaying && !narrationIsPlaying()) {
        var narrationButton = findNarrationButton();
        if (narrationButton) narrationButton.click();
      }

      if (narrationIsPlaying()) scheduleVideoResume();
    }, 0);
  }, true);

  document.addEventListener("play", function (event) {
    if (event.target instanceof HTMLVideoElement && muteSignLanguageVideo(event.target)) {
      // Prevent the bundled reader's media-exclusivity handler from disabling
      // narration when the silent sign-language video begins or resumes.
      event.stopImmediatePropagation();
    }
  }, true);

  document.addEventListener("loadstart", function (event) {
    if (event.target instanceof HTMLVideoElement) muteSignLanguageVideo(event.target);
  }, true);

  new MutationObserver(function (mutations) {
    mutations.forEach(function (mutation) {
      if (mutation.type === "attributes") {
        muteVideos(mutation.target);
        return;
      }
      mutation.addedNodes.forEach(function (node) {
        if (node.nodeType === Node.ELEMENT_NODE) muteVideos(node);
      });
    });
  }).observe(document.documentElement, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ["src"]
  });

  muteVideos(document);
})();
