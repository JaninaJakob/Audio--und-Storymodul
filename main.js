document.addEventListener("DOMContentLoaded", () => {

  /* ===================================== */
  /* AUDIO BUBBLES (WIE VORHER)            */
  /* ===================================== */

  const bubbles = document.querySelectorAll(".voice-bubble");
  const audios = Array.from(document.querySelectorAll("audio"));

  function stopAllAudios() {
    audios.forEach(a => {
      a.pause();
      a.currentTime = 0;
    });
    bubbles.forEach(b => b.classList.remove("playing"));
  }

  bubbles.forEach(bubble => {
    bubble.addEventListener("click", () => {
      const audio = document.getElementById(bubble.dataset.audio);
      const wasPlaying = bubble.classList.contains("playing");

      stopAllAudios();

      if (!wasPlaying && audio) {
        audio.play().then(() => {
          bubble.classList.add("playing");
        });
      }
    });
  });

  audios.forEach(audio => {
    audio.addEventListener("ended", () => {
      const bubble = document.querySelector(
        `.voice-bubble[data-audio="${audio.id}"]`
      );
      if (bubble) bubble.classList.remove("playing");
    });
  });

  /* ===================================== */
  /* VIDEO FULLSCREEN LOGIK                */
  /* ===================================== */

  const videos = document.querySelectorAll(".video-box video");

  let activeVideo = null;
  let originalParent = null;
  let originalNextSibling = null;

  // NEU: Standardmaessig keine Controls (also keine Zeitdauer im kleinen Bild)
  videos.forEach(v => {
    v.controls = false;
  });

  videos.forEach(video => {
    video.addEventListener("click", () => {

      // ▶️ noch kein Fullscreen aktiv
      if (!activeVideo) {
        activeVideo = video;

        originalParent = video.parentNode;
        originalNextSibling = video.nextSibling;

        // UI ausblenden
        bubbles.forEach(b => b.style.display = "none");
        document.body.classList.add("video-active");

        stopAllAudios();

        // Video aus Layout loesen
        document.body.appendChild(video);
        video.classList.add("video-fullscreen");

        // NEU: im Fullscreen Controls anzeigen (damit auch Zeit unten sichtbar)
        video.controls = true;

        video.muted = false;
        video.volume = 1;
        video.play();

      // ⬅️ gleiches Video wieder schliessen
      } else if (activeVideo === video) {
        exitFullscreen();

      // 🔁 anderes Video waehrend Fullscreen
      } else {
        switchFullscreen(video);
      }
    });
  });

  function exitFullscreen() {
    if (!activeVideo) return;

    activeVideo.pause();
    activeVideo.currentTime = 0;
    activeVideo.classList.remove("video-fullscreen");

    // NEU: beim Verkleinern Controls wieder deaktivieren
    activeVideo.controls = false;

    if (originalNextSibling) {
      originalParent.insertBefore(activeVideo, originalNextSibling);
    } else {
      originalParent.appendChild(activeVideo);
    }

    bubbles.forEach(b => b.style.display = "");
    document.body.classList.remove("video-active");

    activeVideo = null;
    originalParent = null;
    originalNextSibling = null;
  }

  function switchFullscreen(newVideo) {
    if (activeVideo) {
      activeVideo.pause();
      activeVideo.currentTime = 0;
      activeVideo.classList.remove("video-fullscreen");

      // NEU: altes Video wieder ohne Controls
      activeVideo.controls = false;

      if (originalNextSibling) {
        originalParent.insertBefore(activeVideo, originalNextSibling);
      } else {
        originalParent.appendChild(activeVideo);
      }
    }

    activeVideo = newVideo;
    originalParent = newVideo.parentNode;
    originalNextSibling = newVideo.nextSibling;

    bubbles.forEach(b => b.style.display = "none");
    document.body.classList.add("video-active");

    stopAllAudios();

    document.body.appendChild(newVideo);
    newVideo.classList.add("video-fullscreen");

    // NEU: neues Fullscreen-Video mit Controls (Zeit sichtbar)
    newVideo.controls = true;

    newVideo.muted = false;
    newVideo.volume = 1;
    newVideo.play();
  }

});







