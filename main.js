document.addEventListener("DOMContentLoaded", () => {

  /* ===================================== */
  /* AUDIO BUBBLES                         */
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
  let fullscreenWrapper = null;   // Overlay-Container
  let timeBar = null;             // Element fuer Zeit-Anzeige

  // Helper: Zeit formatieren (MM:SS)
  function formatTime(seconds) {
    if (!isFinite(seconds) || seconds < 0) seconds = 0;
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    const mm = m.toString().padStart(2, "0");
    const ss = s.toString().padStart(2, "0");
    return `${mm}:${ss}`;
  }

  // Thumbnails: keine nativen Controls
  videos.forEach(v => {
    v.controls = false;
  });

  // Metadaten laden, falls gebraucht (z.B. fuer Dauer)
  videos.forEach(v => {
    v.addEventListener("loadedmetadata", () => {
      v.dataset.duration = v.duration || 0;
    });
  });

  videos.forEach(video => {
    video.addEventListener("click", () => {

      // Noch kein Fullscreen aktiv → dieses Video oeffnen
      if (!activeVideo) {
        openFullscreen(video);

      // Gleiches Video ist aktiv → wieder klein machen
      } else if (activeVideo === video) {
        exitFullscreen();

      // Anderes Video angeklickt, waehrend eins gross ist → Wechsel
      } else {
        switchFullscreen(video);
      }
    });
  });

  function openFullscreen(video) {
    activeVideo = video;

    originalParent = video.parentNode;
    originalNextSibling = video.nextSibling;

    // UI ausblenden
    bubbles.forEach(b => b.style.display = "none");
    document.body.classList.add("video-active");

    stopAllAudios();

    // Overlay-Wrapper erstellen
    fullscreenWrapper = document.createElement("div");
    fullscreenWrapper.className = "video-fullscreen-wrapper";

    // Video in den Wrapper haengen
    video.classList.add("video-fullscreen");
    fullscreenWrapper.appendChild(video);

    // Zeit-Leiste unten
    timeBar = document.createElement("div");
    timeBar.className = "video-time-bar";

    const duration = video.dataset.duration
      ? parseFloat(video.dataset.duration)
      : (video.duration || 0);

    timeBar.textContent = formatTime(duration);

    fullscreenWrapper.appendChild(timeBar);

    // Overlay in den Body
    document.body.appendChild(fullscreenWrapper);

    // Video abspielen
    video.muted = false;
    video.volume = 1;
    video.play();
  }

  function exitFullscreen() {
    if (!activeVideo) return;

    activeVideo.pause();
    activeVideo.currentTime = 0;
    activeVideo.classList.remove("video-fullscreen");

    // Video zurueck an Originalposition
    if (originalNextSibling && originalNextSibling.parentNode === originalParent) {
      originalParent.insertBefore(activeVideo, originalNextSibling);
    } else {
      originalParent.appendChild(activeVideo);
    }

    // Overlay entfernen
    if (fullscreenWrapper) {
      fullscreenWrapper.remove();
      fullscreenWrapper = null;
      timeBar = null;
    }

    // UI wieder einblenden
    bubbles.forEach(b => b.style.display = "");
    document.body.classList.remove("video-active");

    activeVideo = null;
    originalParent = null;
    originalNextSibling = null;
  }

  function switchFullscreen(newVideo) {
    // Altes aktives Video zuruecksetzen
    if (activeVideo) {
      activeVideo.pause();
      activeVideo.currentTime = 0;
      activeVideo.classList.remove("video-fullscreen");

      if (originalNextSibling && originalNextSibling.parentNode === originalParent) {
        originalParent.insertBefore(activeVideo, originalNextSibling);
      } else {
        originalParent.appendChild(activeVideo);
      }
    }

    // Neues Original speichern
    activeVideo = newVideo;
    originalParent = newVideo.parentNode;
    originalNextSibling = newVideo.nextSibling;

    stopAllAudios();

    // Wenn noch kein Wrapper existiert, neu erstellen
    if (!fullscreenWrapper) {
      fullscreenWrapper = document.createElement("div");
      fullscreenWrapper.className = "video-fullscreen-wrapper";
      document.body.appendChild(fullscreenWrapper);
    } else {
      // Alten Inhalt loeschen
      fullscreenWrapper.innerHTML = "";
    }

    // Neues Video in den Wrapper
    newVideo.classList.add("video-fullscreen");
    fullscreenWrapper.appendChild(newVideo);

    // Zeit-Leiste erneuern
    timeBar = document.createElement("div");
    timeBar.className = "video-time-bar";

    const duration = newVideo.dataset.duration
      ? parseFloat(newVideo.dataset.duration)
      : (newVideo.duration || 0);

    timeBar.textContent = formatTime(duration);
    fullscreenWrapper.appendChild(timeBar);

    // Nur zur Sicherheit
    document.body.classList.add("video-active");
    bubbles.forEach(b => b.style.display = "none");

    newVideo.muted = false;
    newVideo.volume = 1;
    newVideo.play();
  }

});









