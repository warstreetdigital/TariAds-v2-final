/**
 * TariAds - Universal Dedicated Listing Detail Controller
 * Handles Products, Vehicles, Services, and All Marketplace Verticals
 * Enforces Direct Business Contact, Pre-filled WhatsApp Enquiries, and Data-Driven Sponsored Badges
 */

import { TariData } from "./data.js";

document.addEventListener("DOMContentLoaded", function () {
  const urlParams = new URLSearchParams(window.location.search);
  const listingId = urlParams.get("id") || "TAR-PRD-05";

  const dataResult = window.TariData ? window.TariData.getItemById(listingId) : null;
  const notFoundEl = document.getElementById("listingNotFound");
  const contentEl = document.getElementById("listingDetailContent");
  const stickyBar = document.getElementById("detailMobileStickyBar");

  if (!dataResult || !dataResult.item) {
    if (notFoundEl) notFoundEl.style.display = "block";
    if (contentEl) contentEl.style.display = "none";
    if (stickyBar) stickyBar.style.display = "none";
    return;
  }

  const item = dataResult.item;
  const itemType = dataResult.type;

  // DOM Helpers
  const setText = (id, text) => {
    const el = document.getElementById(id);
    if (el) el.textContent = text || "";
  };

  const setHtml = (id, html) => {
    const el = document.getElementById(id);
    if (el) el.innerHTML = html || "";
  };

  // 1. Page Title & Breadcrumbs
  document.title = `${item.title} — TariAds Marketplace`;
  setText("breadcrumbTitle", item.title);
  
  const categoryLink = document.getElementById("breadcrumbCategoryLink");
  if (categoryLink) {
    const catName = item.categoryLabel || itemType.toUpperCase();
    categoryLink.textContent = catName;
    if (itemType === "vehicle" || itemType === "vehicles") {
      categoryLink.href = "vehicles.html";
    } else if (itemType === "service" || itemType === "services") {
      categoryLink.href = "services.html";
    } else if (itemType === "property") {
      categoryLink.href = "properties.html";
    } else {
      categoryLink.href = "products.html";
    }
  }

  // Back button
  const backBtn = document.getElementById("detailBackBtn");
  if (backBtn) {
    backBtn.addEventListener("click", () => {
      if (window.history.length > 1) {
        window.history.back();
      } else {
        window.location.href = "index.html";
      }
    });
  }

  // 2. Images & Gallery
  const heroImg = document.getElementById("detailHeroImage");
  let images = [];
  if (item.images && item.images.length > 0) {
    images = item.images;
  } else if (item.image) {
    images = [item.image];
  }

  if (heroImg && images.length > 0) {
    heroImg.src = images[0];
    heroImg.alt = item.title;
  }

  const thumbsRow = document.getElementById("detailThumbsRow");
  if (thumbsRow && images.length > 1) {
    thumbsRow.style.display = "flex";
    thumbsRow.innerHTML = images.map((imgSrc, idx) => `
      <button type="button" class="detail-thumb-btn ${idx === 0 ? 'active' : ''}" data-index="${idx}" aria-label="View photo ${idx + 1}">
        <img src="${imgSrc}" alt="Thumbnail ${idx + 1}" loading="lazy" />
      </button>
    `).join("");

    thumbsRow.addEventListener("click", (e) => {
      const btn = e.target.closest(".detail-thumb-btn");
      if (!btn) return;
      const idx = parseInt(btn.dataset.index, 10);
      if (!isNaN(idx) && images[idx]) {
        heroImg.src = images[idx];
        thumbsRow.querySelectorAll(".detail-thumb-btn").forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
      }
    });
  }

  // 3. Header Badges & Sponsored Detection (Data-Driven)
  const categoryBadge = document.getElementById("detailCategoryBadge");
  if (categoryBadge) {
    categoryBadge.textContent = item.categoryLabel || itemType.toUpperCase();
  }

  const isSponsored = Boolean(
    item.sponsored === true || 
    (window.TariData && window.TariData.isSponsored && window.TariData.isSponsored(item))
  );

  const sponsoredBadge = document.getElementById("detailSponsoredBadge");
  if (sponsoredBadge) {
    sponsoredBadge.style.display = isSponsored ? "inline-flex" : "none";
  }

  const conditionBadge = document.getElementById("detailConditionBadge");
  if (conditionBadge) {
    conditionBadge.textContent = item.condition || "Available";
  }

  // 4. Listing Title & Price
  setText("detailTitle", item.title);

  let formattedPrice = "";
  if (window.TariData && window.TariData.formatPrice) {
    formattedPrice = window.TariData.formatPrice(item.price, item.currency, item.pricePeriod);
  } else {
    formattedPrice = item.price ? `$${item.price}` : "Price on Request";
  }
  setText("detailPrice", formattedPrice);
  setText("detailStickyPrice", formattedPrice);

  if (item.pricePeriod) {
    setText("detailPricePeriod", `/${item.pricePeriod}`);
  }

  // Indicative ZiG Guide
  const zigGuideEl = document.getElementById("detailZiGGuide");
  if (zigGuideEl && window.TariData && window.TariData.formatZiGGuide) {
    zigGuideEl.textContent = window.TariData.formatZiGGuide(item.price, item.country);
  }

  // 5. Location & Reference
  const suburb = item.suburb || "";
  const location = item.location || "Harare";
  const locDisplay = suburb ? `${suburb}, ${location}` : (location.includes("Harare") ? location : `${location}, Harare`);
  setText("detailLocation", locDisplay);
  setText("detailIdBadge", `ID: ${item.id}`);

  // 6. Description & Specs
  setText("detailDescription", item.description || "No description provided.");

  const featuresGrid = document.getElementById("detailFeaturesGrid");
  const specsSection = document.getElementById("detailSpecsSection");
  const features = item.features || item.amenities || [];
  if (featuresGrid && features.length > 0) {
    featuresGrid.innerHTML = features.map((feat) => `
      <div class="detail-feature-item">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#10B981" stroke-width="2.4"><polyline points="20 6 9 17 4 12"/></svg>
        <span>${feat}</span>
      </div>
    `).join("");
  } else if (specsSection) {
    specsSection.style.display = "none";
  }

  // Verified Guarantee Card
  const verifiedCard = document.getElementById("detailVerifiedCard");
  if (verifiedCard) {
    verifiedCard.style.display = item.verified ? "flex" : "none";
  }

  // 7. Business / Seller Identity
  const seller = item.seller || item.agent || {};
  const sellerName = seller.name || "TariAds Advertiser";
  const sellerRole = seller.type || (itemType === "property" ? "Verified Landlord / Agent" : "Verified Retailer");
  const sellerLocation = seller.location || locDisplay;

  setText("detailSellerName", sellerName);
  setText("detailSellerRole", sellerRole);
  setText("detailSellerLocation", sellerLocation);

  const sellerAvatar = document.getElementById("detailSellerAvatar");
  if (sellerAvatar) {
    if (seller.avatar) {
      sellerAvatar.innerHTML = `<img src="${seller.avatar}" alt="${sellerName}" loading="lazy" />`;
    } else {
      const initials = sellerName.split(/\s+/).map((w) => w[0]).slice(0, 2).join("").toUpperCase();
      sellerAvatar.innerHTML = `<span>${initials || 'TA'}</span>`;
    }
  }

  const sellerVerifiedIcon = document.getElementById("detailSellerVerifiedIcon");
  if (sellerVerifiedIcon) {
    sellerVerifiedIcon.style.display = item.verified ? "inline-block" : "none";
  }

  // 8. Direct Business Contact & Action Selection
  const contactInfo = window.TariData && window.TariData.getListingContact
    ? window.TariData.getListingContact(item, itemType)
    : null;

  const waBtn = document.getElementById("detailWhatsAppBtn");
  const waText = document.getElementById("detailWhatsAppText");
  const callBtn = document.getElementById("detailCallBtn");
  const webBtn = document.getElementById("detailWebLinkBtn");
  const webText = document.getElementById("detailWebLinkText");
  const noContactNotice = document.getElementById("detailNoContactNotice");
  const stickyContactBtn = document.getElementById("detailStickyContactBtn");
  const stickyContactLabel = document.getElementById("detailStickyContactLabel");

  if (contactInfo && contactInfo.hasContact) {
    // If WhatsApp available
    if (contactInfo.whatsapp && contactInfo.waUrl) {
      if (waBtn) {
        waBtn.style.display = "inline-flex";
        waBtn.href = contactInfo.waUrl;
        if (waText) waText.textContent = contactInfo.label || "Enquire on WhatsApp";
      }
      if (stickyContactBtn) {
        stickyContactBtn.style.display = "inline-flex";
        stickyContactBtn.href = contactInfo.waUrl;
        if (stickyContactLabel) stickyContactLabel.textContent = contactInfo.label || "Contact Seller";
      }
    } else {
      if (waBtn) waBtn.style.display = "none";
    }

    // Direct phone call (tel:)
    if (contactInfo.phone && contactInfo.telUrl && !contactInfo.whatsapp) {
      if (callBtn) {
        callBtn.style.display = "inline-flex";
        callBtn.href = contactInfo.telUrl;
      }
      if (stickyContactBtn && !contactInfo.whatsapp) {
        stickyContactBtn.style.display = "inline-flex";
        stickyContactBtn.href = contactInfo.telUrl;
        if (stickyContactLabel) stickyContactLabel.textContent = "Call Seller";
      }
    } else if (callBtn) {
      callBtn.style.display = "none";
    }

    // Direct link (for jobs or services)
    if (contactInfo.link) {
      if (webBtn) {
        webBtn.style.display = "inline-flex";
        webBtn.href = contactInfo.link;
        if (webText) webText.textContent = item.applyUrl ? "Apply Directly" : "Visit Website";
      }
    } else if (webBtn) {
      webBtn.style.display = "none";
    }

    if (noContactNotice) noContactNotice.style.display = "none";

  } else {
    // Honest graceful state: NO broken button or fabricated numbers (e.g. KESON Electronics)
    if (waBtn) waBtn.style.display = "none";
    if (callBtn) callBtn.style.display = "none";
    if (webBtn) webBtn.style.display = "none";
    if (noContactNotice) noContactNotice.style.display = "flex";
    if (stickyContactBtn) {
      stickyContactBtn.style.display = "none";
    }
  }

  // 9. Save and Share Interactions
  const saveBtn = document.getElementById("detailSaveBtn");
  const saveIcon = document.getElementById("detailSaveIcon");
  const stickySaveBtn = document.getElementById("detailStickySaveBtn");

  const updateSaveVisual = (isSaved) => {
    const fill = isSaved ? "#EF4444" : "none";
    const stroke = isSaved ? "#EF4444" : "#FFFFFF";
    if (saveIcon) {
      saveIcon.setAttribute("fill", fill);
      saveIcon.setAttribute("stroke", stroke);
    }
    if (saveBtn) {
      saveBtn.classList.toggle("is-saved", isSaved);
    }
    if (stickySaveBtn) {
      stickySaveBtn.classList.toggle("is-saved", isSaved);
      const svg = stickySaveBtn.querySelector("svg");
      if (svg) {
        svg.setAttribute("fill", isSaved ? "#EF4444" : "none");
        svg.setAttribute("stroke", isSaved ? "#EF4444" : "currentColor");
      }
    }
  };

  const initialSaved = window.TariData && window.TariData.isSaved ? window.TariData.isSaved(item.id) : false;
  updateSaveVisual(initialSaved);

  const handleToggleSave = () => {
    if (window.TariData && window.TariData.toggleSave) {
      const nowSaved = window.TariData.toggleSave(item.id);
      updateSaveVisual(nowSaved);
      showToast(nowSaved ? "Listing saved to your collection" : "Listing removed from saved");
    }
  };

  if (saveBtn) saveBtn.addEventListener("click", handleToggleSave);
  if (stickySaveBtn) stickySaveBtn.addEventListener("click", handleToggleSave);

  // Share action
  const shareBtn = document.getElementById("detailShareBtn");
  const toastEl = document.getElementById("detailToast");

  function showToast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("is-visible");
    setTimeout(() => toastEl.classList.remove("is-visible"), 2400);
  }

  if (shareBtn) {
    shareBtn.addEventListener("click", async () => {
      const shareData = {
        title: item.title,
        text: `${item.title} on TariAds Marketplace (${formattedPrice})`,
        url: window.location.href
      };

      if (navigator.share) {
        try {
          await navigator.share(shareData);
        } catch (err) {
          if (err.name !== "AbortError") {
            copyToClipboard(window.location.href);
          }
        }
      } else {
        copyToClipboard(window.location.href);
      }
    });
  }

  function copyToClipboard(url) {
    navigator.clipboard.writeText(url).then(() => {
      showToast("Listing link copied to clipboard");
    }).catch(() => {
      showToast("Link: " + url);
    });
  }

});
