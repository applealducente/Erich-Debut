/* ===== GUEST LIST + TABLES =====
 * The Google Sheet is the guest list. guests.js loads it, RSVPs live in Firebase (firebase-sync.js).
 */
const SEATS_PER_TABLE = 8;
let GUEST_LIST = [];

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
}

function renderTableList(containerId = 'guestTableList') {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = '';

  if (!GUEST_LIST.length) {
    const note = document.createElement('div');
    note.className = 'guest-item empty';
    note.textContent = 'Loading the guest list...';
    container.appendChild(note);
    return;
  }

  Guests.groupByTable(GUEST_LIST).forEach(([tableNum, guests]) => {
    const tableCard = document.createElement('div');
    tableCard.className = 'table-card';

    const header = document.createElement('div');
    header.className = 'table-card-header';
    header.innerHTML = `<span class="table-card-title">Table ${tableNum}</span>`;
    tableCard.appendChild(header);

    const namesList = document.createElement('div');
    namesList.className = 'guest-names-compact';

    guests.forEach(guest => {
      const nameItem = document.createElement('div');
      nameItem.className = 'guest-item';
      nameItem.textContent = guest.name;
      namesList.appendChild(nameItem);
    });

    const vacantCount = Math.max(0, SEATS_PER_TABLE - guests.length);
    if (vacantCount > 0) {
      const vacantSpan = document.createElement('div');
      vacantSpan.className = 'vacant-count';
      vacantSpan.textContent = `+${vacantCount} vacant`;
      namesList.appendChild(vacantSpan);
    }

    tableCard.appendChild(namesList);
    container.appendChild(tableCard);
  });
}

/* ===== RSVP FORM ===== */
function initRSVP() {
  const modal = document.getElementById("rsvpModal");
  const openRsvp = document.getElementById("openRsvp");
  const closeRsvp = document.getElementById("closeRsvp");
  const form = document.getElementById("rsvpForm");
  const attendance = document.getElementById("attendance");
  const confirmation = document.getElementById("rsvpConfirmation");
  const seatingContent = document.getElementById("seatingContent");
  const seatingModal = document.getElementById("seatingModal");

  if (!modal || !form || !openRsvp || !closeRsvp) return;

  function openModal() {
    modal.classList.add("show");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
  }

  function closeModal() {
    modal.classList.remove("show");
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");
  }

  // "Part of the 18s": roles from data.js (18 Roses, Candles, Treasures, Blue Bills, Cotillion)
  function rolesHtml(guestName) {
    if (typeof findRoles !== "function") return "";
    const roles = findRoles(guestName);
    if (!roles.length) return "";
    const lines = roles.map(r => {
      if (r.category === "Cotillion Dancer") {
        const pair = ERICH_18.cotillion[r.number - 1] || [];
        const partner = pair.find(n => normalizeName(n) !== normalizeName(guestName));
        return `<li><strong>Cotillion Dancer</strong>${partner ? ` &middot; paired with ${escapeHtml(partner)}` : ""}</li>`;
      }
      return `<li><strong>${escapeHtml(r.category)}</strong> &middot; No. ${r.number} of 18</li>`;
    }).join("");
    return `<div class="seat-roles"><p class="seat-roles-title">&#10022; You are part of Erich&rsquo;s Eighteen &#10022;</p><ul>${lines}</ul></div>`;
  }

  function openSeatingModal(guestName, tableNum, intro) {
    const title = document.getElementById("seatingTitle");
    title.textContent = `${guestName}, Your Table`;
    seatingContent.innerHTML = `
      <div class="seat-info">
        ${intro || ''}
        <p class="seat-table">Table <strong>${tableNum}</strong></p>
        ${rolesHtml(guestName)}
        <p class="seat-screenshot">Feel free to take a screenshot of this for your reference, so you won&rsquo;t need to look for your table on the day.</p>
        <p class="seat-msg">We look forward to celebrating with you in the garden.</p>
      </div>
    `;
    seatingModal.classList.add("show");
    seatingModal.setAttribute("aria-hidden", "false");
  }

  function closeSeatingModal() {
    seatingModal.classList.remove("show");
    seatingModal.setAttribute("aria-hidden", "true");
  }

  function setFormDisabled(disabled) {
    form.querySelectorAll("input,select,textarea,button[type=submit]").forEach(el => el.disabled = disabled);
  }

  function showNotice(html) {
    confirmation.hidden = false;
    confirmation.innerHTML = html;
    // On a phone the keyboard can hide the message, so bring it into view
    confirmation.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }

  // Event listeners
  openRsvp.addEventListener("click", openModal);
  closeRsvp.addEventListener("click", closeModal);

  const backdrop = modal.querySelector(".modal-backdrop");
  if (backdrop) backdrop.addEventListener("click", closeModal);

  const closeSeating = document.getElementById("closeSeating");
  if (closeSeating) closeSeating.addEventListener("click", closeSeatingModal);

  const seatingBackdrop = seatingModal.querySelector(".modal-backdrop");
  if (seatingBackdrop) seatingBackdrop.addEventListener("click", closeSeatingModal);

  // RSVP form submission
  form.addEventListener("submit", async e => {
    e.preventDefault();
    const name = document.getElementById("guestName").value.trim();
    const answer = attendance.value;
    const message = document.getElementById("message").value.trim();

    if (!GUEST_LIST.length) {
      showNotice(`<div class="not-on-list">We couldn't load the guest list. Please refresh the page and try again.</div>`);
      return;
    }

    const guest = Guests.findGuest(GUEST_LIST, name);
    if (!guest) {
      showNotice(`<div class="not-on-list"><p>We couldn't find <strong>${escapeHtml(name)}</strong> just yet. Your name may be written a little differently on our list.</p><p>Kindly check the guest list and type your name exactly as it appears there. If you still can't find it, please reach out to Erich and we'll gladly sort it out.</p><button type="button" class="not-on-list-link" id="viewGuestListLink">View the guest list</button></div>`);
      const link = document.getElementById("viewGuestListLink");
      if (link) link.addEventListener("click", () => {
        closeModal();
        const target = document.getElementById("tableList");
        if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
      });
      return;
    }

    confirmation.hidden = true;
    setFormDisabled(true);

    let result;
    try {
      result = await RsvpStore.create(guest, answer, message);
    } catch (err) {
      console.error('RSVP save failed:', err);
      setFormDisabled(false);
      showNotice(`<div class="not-on-list">We couldn't save your RSVP just now. Please check your connection and try again.</div>`);
      return;
    }

    // Already RSVPed (checked in Firebase, so a deleted RSVP can be submitted again)
    if (!result.created) {
      const when = result.existing && result.existing.submittedAt
        ? new Date(result.existing.submittedAt).toLocaleDateString()
        : 'an earlier date';
      closeModal();
      openSeatingModal(guest.name, guest.table,
        `<p style="color: #f1d99e; margin-bottom: 16px; font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em;">Already Confirmed</p>`);
      document.querySelector("#seatingContent .seat-msg").textContent =
        `You've already RSVPed on ${when}. We look forward to celebrating with you in the garden.`;
      setFormDisabled(false);
      return;
    }

    // Show confirmation + table
    if (answer === "yes") {
      showNotice(`
        <div class="role-result-title">YOUR RSVP IS SEALED ✦</div>
        <p>See you in the garden, <strong>${escapeHtml(guest.name)}</strong>.</p>
        <p>Your seat awaits.</p>
      `);
      setTimeout(() => {
        closeModal();
        openSeatingModal(guest.name, guest.table);
      }, 1000);
    } else {
      showNotice(`
        <div class="role-result-title">WITH LOVE ✦</div>
        <p>Thank you, <strong>${escapeHtml(guest.name)}</strong>, for letting us know.</p>
      `);
    }
  });
}

/* ===== ENVELOPE & OPENING ===== */
function setupOpening() {
  const envelope = document.getElementById("envelope");
  const opening = document.getElementById("opening");
  const invitation = document.getElementById("invitation");
  const music = document.getElementById("bgMusic");
  const musicToggle = document.getElementById("musicToggle");

  if (!envelope || !opening || !invitation || !music || !musicToggle) return;

  let opened = false;

  function showInvitation() {
    opening.classList.add("leaving");
    setTimeout(() => {
      opening.hidden = true;
      opening.style.display = "none";
      invitation.classList.add("visible");
      invitation.setAttribute("aria-hidden", "false");
      window.scrollTo(0, 0);
    }, 900);
  }

  envelope.addEventListener("click", () => {
    if (opened) return;
    opened = true;
    envelope.classList.add("opening");
    music.volume = 0.72;
    const p = music.play();
    if (p && typeof p.catch === "function") p.catch(() => {});
    setTimeout(showInvitation, 650);
  });

  musicToggle.addEventListener("click", () => {
    if (music.paused) {
      music.play().then(() => {
        musicToggle.innerHTML = "♫ <span>MUSIC ON</span>";
      }).catch(() => {
        musicToggle.innerHTML = "♫ <span>TAP TO PLAY</span>";
      });
    } else {
      music.pause();
      musicToggle.innerHTML = "♫ <span>MUSIC OFF</span>";
    }
  });

  music.addEventListener("play", () => {
    musicToggle.innerHTML = "♫ <span>MUSIC ON</span>";
  });

  music.addEventListener("pause", () => {
    musicToggle.innerHTML = "♫ <span>MUSIC OFF</span>";
  });
}

/* ===== SCROLL REVEAL ANIMATIONS ===== */
function setupScrollReveals() {
  const revealElements = document.querySelectorAll('[data-reveal]');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  revealElements.forEach(el => observer.observe(el));
}

// Organizer password access
function setupOrganizerAccess() {
  const organizerBtn = document.getElementById('organizerAccessBtn');
  const organizerModal = document.getElementById('organizerModal');
  const closeOrganizerModal = document.getElementById('closeOrganizerModal');
  const organizerForm = document.getElementById('organizerForm');
  const organizerConfirmation = document.getElementById('organizerConfirmation');

  if (!organizerBtn || !organizerModal) return;

  const ORGANIZER_PASSWORD = 'erich18'; // Change this to your desired password

  organizerBtn.addEventListener('click', () => {
    organizerModal.classList.add('show');
    organizerModal.setAttribute('aria-hidden', 'false');
  });

  closeOrganizerModal.addEventListener('click', () => {
    organizerModal.classList.remove('show');
    organizerModal.setAttribute('aria-hidden', 'true');
    organizerForm.reset();
  });

  const backdrop = organizerModal.querySelector('.modal-backdrop');
  if (backdrop) {
    backdrop.addEventListener('click', () => {
      organizerModal.classList.remove('show');
      organizerModal.setAttribute('aria-hidden', 'true');
      organizerForm.reset();
    });
  }

  organizerForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const password = document.getElementById('organizerPassword').value;

    if (password === ORGANIZER_PASSWORD) {
      organizerConfirmation.hidden = false;
      organizerConfirmation.innerHTML = '<div style="text-align: center; color: #90ee90;">✓ Access granted!</div>';

      setTimeout(() => {
        organizerModal.classList.remove('show');
        organizerModal.setAttribute('aria-hidden', 'true');
        organizerForm.reset();
        organizerConfirmation.hidden = true;

        // Redirect to dashboard page
        window.location.href = 'dashboard.html'; return;
      }, 800);
    } else {
      organizerConfirmation.hidden = false;
      organizerConfirmation.innerHTML = '<div style="text-align: center; color: #ff9999;">✗ Incorrect password</div>';
      setTimeout(() => {
        organizerConfirmation.hidden = true;
        organizerForm.reset();
      }, 2000);
    }
  });
}

// Initialize on page load
// Rebuild the "Her Eighteen" lists on the page from ERICH_18 (kept in sync with the sheet's 18's tab)
function renderRoleLists() {
  if (typeof ERICH_18 === "undefined") return;
  const cards = { roses: "roses", candles: "candles", treasures: "treasures", blueBills: "blue-bills" };
  Object.entries(cards).forEach(([key, cls]) => {
    const box = document.querySelector(`.role-bloom-card.${cls} .name-list`);
    if (!box || !ERICH_18[key].length) return;
    box.innerHTML = ERICH_18[key].map((n, i) =>
      `<span>${i + 1}. ${escapeHtml(n)}${ONLINE_NAMES.includes(n) ? " (online)" : ""}</span>`).join("");
  });
  const pairs = document.querySelector(".cotillion-pairs");
  if (pairs && ERICH_18.cotillion.length) {
    pairs.innerHTML = ERICH_18.cotillion.map((p, i) =>
      `<div><b>${String(i + 1).padStart(2, "0")}</b><span>${escapeHtml(p[0])}</span><i>&amp;</i><span>${escapeHtml(p[1])}</span></div>`).join("");
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  // Old versions kept guest and RSVP data in this browser. Firebase and the Google Sheet replace it.
  try {
    localStorage.removeItem('erich_rsvps');
    localStorage.removeItem('erich_seating');
  } catch (err) { /* storage unavailable, ignore */ }

  setupOpening();
  initRSVP();
  setupOrganizerAccess();
  setupScrollReveals();
  renderTableList('guestTableList');

  const { guests, source } = await Guests.loadGuests();
  GUEST_LIST = guests;
  if (source === 'none') console.error('Guest list could not be loaded from any source');
  renderTableList('guestTableList');

  // The 18's lists come from the sheet's 18's tab. If it cannot be read, the lists built into the page stay.
  const { roles } = await Guests.loadRoles();
  if (roles) {
    applyRoles(roles);
    renderRoleLists();
  }
});
