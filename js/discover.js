/**
 * TariAds - Discover Commercial Reels Controller
 * Strict Visual Match to Approved Instagram Reels Layout Reference
 * 
 * Hierarchy:
 * 1. Top Bar: Business Avatar, Name, Verified Badge, Sponsored Tag (if sponsored), Sound Toggle & Circular Close (X)
 * 2. Video: Main focus, full-screen vertical, uncropped/contained aspect ratio
 * 3. Bottom Controls: Compact horizontal outline action icons (Like, Chat, Share, Compact View Listing/Explore button)
 * 4. Caption: Concise natural text above the action row with optional "more" expander
 * 5. Navigation: Vertical swipe up/down, keyboard, desktop chevrons, Back button & X returning to Home
 */

(function () {
  "use strict";

  // 1. THE FOUR EXACT COMMERCIAL REELS
  const DISCOVER_REELS = [
    {
      id: "reel-seraphins",
      businessName: "Seraphins",
      videoUrl: "https://media.usetariads.com/reels/SERAPHINS.MP4.mp4",
      category: "Commercial Showcase",
      verified: false,
      sponsored: false,
      matchedProfile: false,
      avatar: "",
      location: "Harare, Zimbabwe",
      caption: "Commercial showcase reel by Seraphins.",
      whatsapp: "",
      targetUrl: "categories.html",
      actionLabel: "Explore"
    },
    {
      id: "reel-massive-gadgets",
      businessName: "Massive Gadgets",
      videoUrl: "https://media.usetariads.com/reels/MASSIVE%20GADGETS.mp4",
      category: "Gadgets & Electronics",
      verified: true,
      sponsored: false,
      matchedProfile: true,
      avatar: "https://media.usetariads.com/story%20posts/massive-gadgets-story-01.webp",
      location: "Harare CBD, Zimbabwe",
      caption: "Audio gear, smartphones, laptops and accessories available in Harare CBD.",
      whatsapp: "263773974683",
      targetUrl: "listing.html?id=TAR-PRD-01",
      actionLabel: "View Listing"
    },
    {
      id: "reel-keson-electronics",
      businessName: "KESON Electronics",
      videoUrl: "https://media.usetariads.com/reels/KESON.MP4.mp4",
      category: "Home Appliances & Electronics",
      verified: false,
      sponsored: false,
      matchedProfile: true,
      avatar: "",
      location: "Harare CBD, Zimbabwe",
      caption: "Domestic refrigerators, double-door freezers, and multimedia party speaker systems.",
      whatsapp: "",
      targetUrl: "listing.html?id=TAR-PRD-09",
      actionLabel: "View Listing"
    },
    {
      id: "reel-brumebooman",
      businessName: "Brumebooman",
      videoUrl: "https://media.usetariads.com/reels/BRUMEBOOMAN.mp4",
      category: "Commercial Showcase",
      verified: false,
      sponsored: false,
      matchedProfile: false,
      avatar: "",
      location: "Harare, Zimbabwe",
      caption: "Commercial showcase reel by Brumebooman.",
      whatsapp: "",
      targetUrl: "categories.html",
      actionLabel: "Explore"
    }
  ];

  // State Management
  let activeIndex = 0;
  let isMuted = true; // start muted by default to respect browser policies
  const savedPlaybackPositions = {};

  // Check saved mute preference
  try {
    const savedMute = localStorage.getItem("tariads_reels_muted");
    if (savedMute !== null) {
      isMuted = savedMute === "true";
    }
  } catch (e) {}

  // Check saved reel index from session (preserves position when navigating to a listing and returning)
  try {
    const sessionIdx = sessionStorage.getItem("tariads_active_reel_index");
    if (sessionIdx !== null) {
      const parsed = parseInt(sessionIdx, 10);
      if (!isNaN(parsed) && parsed >= 0 && parsed < DISCOVER_REELS.length) {
        activeIndex = parsed;
      }
    }
  } catch (e) {}

  // Liked Reels Set
  function getLikedReels() {
    try {
      const v = localStorage.getItem("tariads_liked_reels");
      return v ? JSON.parse(v) : [];
    } catch (e) {
      return [];
    }
  }

  function isReelLiked(id) {
    return getLikedReels().includes(id);
  }

  function toggleReelLike(id) {
    const liked = getLikedReels();
    const idx = liked.indexOf(id);
    let isNowLiked = false;
    if (idx > -1) {
      liked.splice(idx, 1);
      isNowLiked = false;
    } else {
      liked.push(id);
      isNowLiked = true;
    }
    try {
      localStorage.setItem("tariads_liked_reels", JSON.stringify(liked));
    } catch (e) {}
    return isNowLiked;
  }

  // DOM Elements
  const videoEl = document.getElementById("reelsActiveVideo");
  const stageEl = document.getElementById("reelsFullscreenStage");
  const tapFeedback = document.getElementById("reelsTapFeedback");
  const tapIcon = document.getElementById("reelsTapIcon");
  const spinner = document.getElementById("reelsBufferingSpinner");
  const errorBox = document.getElementById("reelsErrorBox");
  const retryBtn = document.getElementById("reelsRetryBtn");
  const chevronPrev = document.getElementById("reelsChevronPrev");
  const chevronNext = document.getElementById("reelsChevronNext");

  // Top Bar Elements (Business Identity at Top)
  const topAvatar = document.getElementById("reelsTopAvatar");
  const topBusinessName = document.getElementById("reelsTopBusinessName");
  const topVerifiedBadge = document.getElementById("reelsTopVerifiedBadge");
  const topSponsoredTag = document.getElementById("reelsTopSponsoredTag");
  const topLocation = document.getElementById("reelsTopLocation");
  const topSoundBtn = document.getElementById("reelsTopSoundBtn");
  const topSoundIcon = document.getElementById("topSoundIcon");
  const closeBtn = document.getElementById("reelsCloseBtn");

  // Bottom Elements (Caption & Compact Outline Actions)
  const captionContent = document.getElementById("reelsCaptionContent");
  const captionMoreBtn = document.getElementById("reelsCaptionMoreBtn");
  const likeBtn = document.getElementById("reelsLikeBtn");
  const likeIcon = document.getElementById("reelsLikeIcon");
  const commentBtn = document.getElementById("reelsCommentBtn");
  const shareBtn = document.getElementById("reelsShareBtn");
  const primaryActionBtn = document.getElementById("reelsPrimaryActionBtn");
  const primaryActionLabel = document.getElementById("reelsPrimaryActionLabel");
  const progressTrack = document.getElementById("reelsProgressTrack");
  const progressFill = document.getElementById("reelsProgressFill");
  const toast = document.getElementById("reelsToast");

  // Toast Helper
  function showToast(msg) {
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add("is-visible");
    setTimeout(() => {
      toast.classList.remove("is-visible");
    }, 2200);
  }

  // Sound Visual Sync
  function updateSoundUI(muted) {
    isMuted = muted;
    try {
      localStorage.setItem("tariads_reels_muted", muted ? "true" : "false");
    } catch (e) {}

    if (videoEl) {
      videoEl.muted = isMuted;
    }

    const soundMutedSvg = `
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
      <line x1="23" y1="9" x2="17" y2="15"></line>
      <line x1="17" y1="9" x2="23" y2="15"></line>
    `;

    const soundUnmutedSvg = `
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
      <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
    `;

    if (topSoundIcon) topSoundIcon.innerHTML = isMuted ? soundMutedSvg : soundUnmutedSvg;
    if (topSoundBtn) topSoundBtn.setAttribute("title", isMuted ? "Unmute audio" : "Mute audio");
  }

  // Like Visual Sync
  function updateLikeUI(reelId) {
    const isLiked = isReelLiked(reelId);
    if (!likeBtn || !likeIcon) return;
    if (isLiked) {
      likeBtn.classList.add("is-liked");
      likeIcon.setAttribute("fill", "#EF4444");
      likeIcon.setAttribute("stroke", "#EF4444");
    } else {
      likeBtn.classList.remove("is-liked");
      likeIcon.setAttribute("fill", "none");
      likeIcon.setAttribute("stroke", "currentColor");
    }
  }

  // Tap Flash Feedback (Play / Pause Indicator)
  function triggerTapFeedback(isPlaying) {
    if (!tapFeedback || !tapIcon) return;
    tapIcon.innerHTML = isPlaying
      ? `<polygon points="5 3 19 12 5 21 5 3"></polygon>`
      : `<rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect>`;
    tapFeedback.classList.add("is-visible");
    setTimeout(() => {
      tapFeedback.classList.remove("is-visible");
    }, 420);
  }

  // Close Reels Viewer and Return to Home Feed
  function closeReelsViewer() {
    if (videoEl) {
      videoEl.pause();
      videoEl.src = "";
    }
    window.location.href = "index.html";
  }

  // Switch Reel
  function loadReel(index, preserveTime = false) {
    if (index < 0) index = 0;
    if (index >= DISCOVER_REELS.length) index = DISCOVER_REELS.length - 1;

    // Save previous video position
    if (videoEl && !isNaN(videoEl.currentTime) && videoEl.currentTime > 0) {
      const prevReel = DISCOVER_REELS[activeIndex];
      if (prevReel) {
        savedPlaybackPositions[prevReel.id] = videoEl.currentTime;
        try {
          sessionStorage.setItem("tariads_reel_time_" + prevReel.id, videoEl.currentTime.toString());
        } catch (e) {}
      }
    }

    activeIndex = index;
    try {
      sessionStorage.setItem("tariads_active_reel_index", activeIndex.toString());
    } catch (e) {}

    const reel = DISCOVER_REELS[activeIndex];
    if (!reel) return;

    // Reset UI states
    if (errorBox) errorBox.classList.remove("is-visible");
    if (spinner) spinner.classList.add("is-visible");
    if (progressFill) progressFill.style.width = "0%";

    // 1. TOP BAR — BUSINESS IDENTITY AT VERY TOP
    if (topBusinessName) topBusinessName.textContent = reel.businessName;
    if (topLocation) topLocation.textContent = reel.location;

    // Avatar (Avatar image or neat initials)
    if (topAvatar) {
      if (reel.avatar) {
        topAvatar.innerHTML = `<img src="${reel.avatar}" alt="${reel.businessName}" loading="lazy" />`;
      } else {
        const initials = reel.businessName.split(/\s+/).map((w) => w[0]).slice(0, 2).join("").toUpperCase();
        topAvatar.innerHTML = `<span>${initials || 'TA'}</span>`;
      }
    }

    // Verified badge (ONLY for verified businesses, e.g. Massive Gadgets. Never fake!)
    if (topVerifiedBadge) {
      topVerifiedBadge.style.display = reel.verified ? "inline-block" : "none";
    }

    // Sponsored tag (ONLY when reel is actually sponsored)
    if (topSponsoredTag) {
      topSponsoredTag.style.display = reel.sponsored ? "inline-block" : "none";
    }

    // 4. CAPTION (Natural, concise sentence near lower part, above action row)
    if (captionContent) {
      const fullText = reel.caption || "";
      if (fullText.length > 70) {
        captionContent.textContent = fullText.slice(0, 65) + "...";
        if (captionMoreBtn) {
          captionMoreBtn.style.display = "inline";
          captionMoreBtn.onclick = () => {
            captionContent.textContent = fullText;
            captionMoreBtn.style.display = "none";
          };
        }
      } else {
        captionContent.textContent = fullText;
        if (captionMoreBtn) captionMoreBtn.style.display = "none";
      }
    }

    // 3. BOTTOM ACTIONS (Compact outline icons)
    updateLikeUI(reel.id);

    // Primary action on the right
    if (primaryActionBtn) {
      primaryActionBtn.href = reel.targetUrl || "categories.html";
      if (primaryActionLabel) primaryActionLabel.textContent = reel.actionLabel || "View Listing";

      // Save playback state before navigating away
      primaryActionBtn.onclick = () => {
        if (videoEl && !isNaN(videoEl.currentTime)) {
          savedPlaybackPositions[reel.id] = videoEl.currentTime;
          try {
            sessionStorage.setItem("tariads_reel_time_" + reel.id, videoEl.currentTime.toString());
          } catch (e) {}
        }
      };
    }

    // 2. VIDEO ELEMENT (Single active playback, contain/no-stretch, progressive loading)
    if (videoEl) {
      videoEl.pause();
      videoEl.muted = isMuted;
      videoEl.src = reel.videoUrl;
      videoEl.load();

      // Restore position if returning
      let resumeTime = 0;
      if (preserveTime) {
        if (savedPlaybackPositions[reel.id]) {
          resumeTime = savedPlaybackPositions[reel.id];
        } else {
          try {
            const stored = sessionStorage.getItem("tariads_reel_time_" + reel.id);
            if (stored) resumeTime = parseFloat(stored);
          } catch (e) {}
        }
      }

      if (resumeTime > 0) {
        try {
          videoEl.currentTime = resumeTime;
        } catch (e) {}
      }

      const playPromise = videoEl.play();
      if (playPromise !== undefined) {
        playPromise.then(() => {
          if (spinner) spinner.classList.remove("is-visible");
        }).catch((err) => {
          console.warn("Autoplay deferred or blocked:", err);
          if (spinner) spinner.classList.remove("is-visible");
        });
      }
    }
  }

  // Navigation Methods
  function nextReel() {
    const nextIdx = (activeIndex + 1) % DISCOVER_REELS.length;
    loadReel(nextIdx);
  }

  function prevReel() {
    const prevIdx = (activeIndex - 1 + DISCOVER_REELS.length) % DISCOVER_REELS.length;
    loadReel(prevIdx);
  }

  // Play / Pause Toggle
  function togglePlayPause() {
    if (!videoEl) return;
    if (videoEl.paused) {
      videoEl.play().then(() => {
        triggerTapFeedback(true);
      }).catch((e) => {
        console.warn("Play error:", e);
      });
    } else {
      videoEl.pause();
      triggerTapFeedback(false);
    }
  }

  // EVENT LISTENERS

  // Video Events
  if (videoEl) {
    videoEl.addEventListener("timeupdate", () => {
      if (!videoEl.duration) return;
      const pct = (videoEl.currentTime / videoEl.duration) * 100;
      if (progressFill) progressFill.style.width = `${pct}%`;
    });

    videoEl.addEventListener("waiting", () => {
      if (spinner) spinner.classList.add("is-visible");
    });

    videoEl.addEventListener("canplay", () => {
      if (spinner) spinner.classList.remove("is-visible");
      if (errorBox) errorBox.classList.remove("is-visible");
    });

    videoEl.addEventListener("playing", () => {
      if (spinner) spinner.classList.remove("is-visible");
      if (errorBox) errorBox.classList.remove("is-visible");
    });

    videoEl.addEventListener("ended", () => {
      // Loop current reel or smoothly advance
      videoEl.currentTime = 0;
      videoEl.play().catch(() => {});
    });

    videoEl.addEventListener("error", (e) => {
      console.error("Reel video error:", e);
      if (spinner) spinner.classList.remove("is-visible");
      if (errorBox) errorBox.classList.add("is-visible");
    });
  }

  // Tap stage toggles play / pause (excluding buttons)
  if (stageEl) {
    stageEl.addEventListener("click", (e) => {
      if (e.target.closest("button") || e.target.closest("a") || e.target.closest(".reel-viewer-error-box")) return;
      togglePlayPause();
    });
  }

  // Sound Button (Top-Right)
  if (topSoundBtn) {
    topSoundBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      updateSoundUI(!isMuted);
      showToast(isMuted ? "Sound Muted" : "Sound Unmuted");
    });
  }

  // Circular Close (X) Button (Top-Right)
  if (closeBtn) {
    closeBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      closeReelsViewer();
    });
  }

  // Like Button
  if (likeBtn) {
    likeBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      const reel = DISCOVER_REELS[activeIndex];
      if (!reel) return;
      const likedNow = toggleReelLike(reel.id);
      updateLikeUI(reel.id);
      showToast(likedNow ? "Added to liked reels" : "Removed from liked reels");
    });
  }

  // Comment / Chat Button
  if (commentBtn) {
    commentBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      const reel = DISCOVER_REELS[activeIndex];
      if (!reel) return;

      if (reel.whatsapp) {
        const msg = encodeURIComponent(`Hi ${reel.businessName}, I saw your commercial reel on TariAds and would like to make an enquiry.`);
        window.open(`https://wa.me/${reel.whatsapp}?text=${msg}`, "_blank", "noopener,noreferrer");
      } else {
        showToast(`For ${reel.businessName}, visit their store or contact on TariAds.`);
      }
    });
  }

  // Share Button
  if (shareBtn) {
    shareBtn.addEventListener("click", async (e) => {
      e.stopPropagation();
      const reel = DISCOVER_REELS[activeIndex];
      if (!reel) return;

      const shareData = {
        title: `${reel.businessName} Commercial Reel — TariAds`,
        text: `Watch ${reel.businessName} on TariAds Discover Reels!`,
        url: window.location.href
      };

      if (navigator.share) {
        try {
          await navigator.share(shareData);
        } catch (err) {
          if (err.name !== "AbortError") {
            copyReelLink();
          }
        }
      } else {
        copyReelLink();
      }
    });
  }

  function copyReelLink() {
    navigator.clipboard.writeText(window.location.href).then(() => {
      showToast("Reel link copied to clipboard");
    }).catch(() => {
      showToast("Link: " + window.location.href);
    });
  }

  // Scrubber Seeking
  if (progressTrack) {
    progressTrack.addEventListener("click", (e) => {
      e.stopPropagation();
      if (!videoEl || !videoEl.duration) return;
      const rect = progressTrack.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const ratio = Math.max(0, Math.min(1, clickX / rect.width));
      videoEl.currentTime = ratio * videoEl.duration;
    });
  }

  // Error Retry Button
  if (retryBtn) {
    retryBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      loadReel(activeIndex);
    });
  }

  // Desktop Chevrons (Up / Down)
  if (chevronPrev) chevronPrev.addEventListener("click", (e) => { e.stopPropagation(); prevReel(); });
  if (chevronNext) chevronNext.addEventListener("click", (e) => { e.stopPropagation(); nextReel(); });

  // Keyboard Navigation (ArrowUp/Down, Space, Mute)
  document.addEventListener("keydown", (e) => {
    if (e.key === "ArrowDown" || e.key === "PageDown") {
      e.preventDefault();
      nextReel();
    } else if (e.key === "ArrowUp" || e.key === "PageUp") {
      e.preventDefault();
      prevReel();
    } else if (e.key === " " || e.code === "Space") {
      e.preventDefault();
      togglePlayPause();
    } else if (e.key === "m" || e.key === "M") {
      updateSoundUI(!isMuted);
    } else if (e.key === "Escape") {
      closeReelsViewer();
    }
  });

  // Vertical Touch Swipe Gesture Handling (Swipe Up for Next, Swipe Down for Prev)
  let touchStartY = 0;
  let touchStartX = 0;
  const SWIPE_THRESHOLD = 50;

  if (stageEl) {
    stageEl.addEventListener("touchstart", (e) => {
      if (e.touches && e.touches.length > 0) {
        touchStartY = e.touches[0].clientY;
        touchStartX = e.touches[0].clientX;
      }
    }, { passive: true });

    stageEl.addEventListener("touchend", (e) => {
      if (!e.changedTouches || e.changedTouches.length === 0) return;
      const deltaY = e.changedTouches[0].clientY - touchStartY;
      const deltaX = e.changedTouches[0].clientX - touchStartX;

      // Ensure vertical gesture dominates horizontal gesture
      if (Math.abs(deltaY) > SWIPE_THRESHOLD && Math.abs(deltaY) > Math.abs(deltaX)) {
        if (deltaY < 0) {
          // Swiped Up -> Next Reel
          nextReel();
        } else {
          // Swiped Down -> Previous Reel
          prevReel();
        }
      }
    }, { passive: true });
  }

  // Mouse wheel scroll to advance reels
  let lastWheelTime = 0;
  window.addEventListener("wheel", (e) => {
    const now = Date.now();
    if (now - lastWheelTime < 600) return; // Debounce wheel
    if (Math.abs(e.deltaY) > 40) {
      lastWheelTime = now;
      if (e.deltaY > 0) {
        nextReel();
      } else {
        prevReel();
      }
    }
  }, { passive: true });

  // ANDROID & BROWSER SYSTEM BACK BUTTON
  // Closes the Reels viewer and returns smoothly to Home (index.html)
  try {
    window.history.pushState({ tariReels: true }, "", window.location.href);
    window.addEventListener("popstate", () => {
      closeReelsViewer();
    });
  } catch (e) {}

  // INITIALIZATION
  document.addEventListener("DOMContentLoaded", () => {
    updateSoundUI(isMuted);
    loadReel(activeIndex, true);
  });

  if (document.readyState === "interactive" || document.readyState === "complete") {
    updateSoundUI(isMuted);
    loadReel(activeIndex, true);
  }

  // Global methods for debugging & automated testing
  window.TariReels = {
    reels: DISCOVER_REELS,
    getActiveIndex: () => activeIndex,
    next: nextReel,
    prev: prevReel,
    toggleSound: () => updateSoundUI(!isMuted),
    isMuted: () => isMuted,
    close: closeReelsViewer
  };

})();
