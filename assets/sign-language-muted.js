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
    if (!isLocalSignVideo && !isReleaseSignVideo) return;

    video.defaultMuted = true;
    video.muted = true;
    video.volume = 0;
    video.setAttribute("muted", "");
  }

  function muteVideos(root) {
    if (root instanceof HTMLVideoElement) muteSignLanguageVideo(root);
    if (root.querySelectorAll) {
      root.querySelectorAll("video").forEach(muteSignLanguageVideo);
    }
  }

  document.addEventListener("play", function (event) {
    if (event.target instanceof HTMLVideoElement) muteSignLanguageVideo(event.target);
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
