/* ===== SEATING SYSTEM ===== */

// Initialize seating chart (12 tables, 8 seats each)
function initSeating() {
  const stored = localStorage.getItem('erich_seating');
  if (stored) return JSON.parse(stored);

  const seating = [];
  for (let t = 1; t <= 12; t++) {
    for (let s = 1; s <= 8; s++) {
      seating.push({
        tableNum: t,
        seatNum: s,
        guestName: '', // Fill this in during assignment
        confirmed: false,
        confirmedAt: null
      });
    }
  }
  localStorage.setItem('erich_seating', JSON.stringify(seating));
  return seating;
}

function saveSeating(seating) {
  localStorage.setItem('erich_seating', JSON.stringify(seating));
}

function getGuestSeat(guestName) {
  const seating = JSON.parse(localStorage.getItem('erich_seating') || '[]');
  return seating.find(s => s.guestName.toLowerCase() === guestName.toLowerCase());
}

function updateSeatConfirmation(guestName, attending) {
  const seating = JSON.parse(localStorage.getItem('erich_seating') || '[]');
  const seat = seating.find(s => s.guestName.toLowerCase() === guestName.toLowerCase());
  if (seat) {
    seat.confirmed = attending === 'yes';
    seat.confirmedAt = new Date().toISOString();
    saveSeating(seating);
  }
}

/* ===== RSVP FORM (SIMPLIFIED - NO PLUS-ONES) ===== */
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

  function openSeatingModal(guestName, seat) {
    const title = document.getElementById("seatingTitle");
    title.textContent = `${guestName}, Your Seat`;
    seatingContent.innerHTML = `
      <div class="seat-info">
        <p class="seat-table">Table <strong>${seat.tableNum}</strong></p>
        <p class="seat-num">Seat <strong>${seat.seatNum}</strong></p>
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
  form.addEventListener("submit", e => {
    e.preventDefault();
    const name = document.getElementById("guestName").value.trim();
    const att = attendance.value === "yes";
    const message = document.getElementById("message").value.trim();

    const seat = getGuestSeat(name);
    if (!seat) {
      confirmation.hidden = false;
      confirmation.innerHTML = `<div class="not-on-list">We don't have a seat assigned for <strong>${name}</strong>. Please double-check your name or contact Erich directly.</div>`;
      form.querySelectorAll("input,select,textarea,button[type=submit]").forEach(el => el.disabled = true);
      return;
    }

    // Save RSVP
    updateSeatConfirmation(name, attendance.value);
    const all = JSON.parse(localStorage.getItem("erich_rsvps") || "[]");
    all.push({
      guestName: name,
      attendance: att ? "yes" : "no",
      message,
      seatTable: seat.tableNum,
      seatNum: seat.seatNum,
      submittedAt: new Date().toISOString()
    });
    localStorage.setItem("erich_rsvps", JSON.stringify(all));

    // Show confirmation + seat
    confirmation.hidden = false;
    if (att) {
      confirmation.innerHTML = `
        <div class="role-result-title">YOUR RSVP IS SEALED ✦</div>
        <p>See you in the garden, <strong>${name}</strong>.</p>
        <p>Your seat awaits.</p>
      `;
      setTimeout(() => {
        closeModal();
        openSeatingModal(name, seat);
      }, 1000);
    } else {
      confirmation.innerHTML = `
        <div class="role-result-title">WITH LOVE ✦</div>
        <p>Thank you, <strong>${name}</strong>, for letting us know.</p>
      `;
    }

    form.querySelectorAll("input,select,textarea,button[type=submit]").forEach(el => el.disabled = true);
  });
}

/* ===== ORGANIZER SEATING DASHBOARD ===== */
function renderSeatingGrid() {
  const seating = JSON.parse(localStorage.getItem('erich_seating') || '[]');
  const grid = document.getElementById('seatingGrid');
  if (!grid) return;

  grid.innerHTML = '';

  for (let t = 1; t <= 12; t++) {
    const tableDiv = document.createElement('div');
    tableDiv.className = 'table-block';
    tableDiv.innerHTML = `<h4>Table ${t}</h4>`;

    const seatsDiv = document.createElement('div');
    seatsDiv.className = 'seats-row';

    for (let s = 1; s <= 8; s++) {
      const seat = seating.find(x => x.tableNum === t && x.seatNum === s);
      const seatDiv = document.createElement('div');
      seatDiv.className = 'seat-box';
      if (seat && seat.guestName) {
        seatDiv.classList.add(seat.confirmed ? 'confirmed' : 'assigned');
        seatDiv.title = seat.guestName;
      }
      seatDiv.innerHTML = `<input type="text" placeholder="S${s}" value="${seat?.guestName || ''}" data-table="${t}" data-seat="${s}" />`;
      seatsDiv.appendChild(seatDiv);
    }

    tableDiv.appendChild(seatsDiv);
    grid.appendChild(tableDiv);
  }
}

function renderTableList(containerId = 'guestTableList') {
  const seating = JSON.parse(localStorage.getItem('erich_seating') || '[]');
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = '';

  for (let t = 1; t <= 12; t++) {
    const tableSeats = seating.filter(x => x.tableNum === t);
    const confirmedCount = tableSeats.filter(x => x.confirmed && x.guestName).length;
    const assignedCount = tableSeats.filter(x => x.guestName && !x.confirmed).length;
    const vacantCount = tableSeats.filter(x => !x.guestName).length;

    const tableCard = document.createElement('div');
    tableCard.className = 'table-card';

    // Header with table number and occupancy
    const header = document.createElement('div');
    header.className = 'table-card-header';
    header.innerHTML = `
      <span class="table-card-title">Table ${t}</span>
      <span class="table-occupancy">${confirmedCount + assignedCount}/8 guests</span>
    `;
    tableCard.appendChild(header);

    // Guest list
    const guestList = document.createElement('div');
    guestList.className = 'guest-list';

    // Add confirmed guests first
    tableSeats.forEach(seat => {
      if (seat.guestName && seat.confirmed) {
        const item = document.createElement('div');
        item.className = 'guest-item confirmed';
        item.innerHTML = `
          <span class="guest-status confirmed"></span>
          <span class="guest-name">${seat.guestName}</span>
        `;
        guestList.appendChild(item);
      }
    });

    // Then assigned (not confirmed)
    tableSeats.forEach(seat => {
      if (seat.guestName && !seat.confirmed) {
        const item = document.createElement('div');
        item.className = 'guest-item assigned';
        item.innerHTML = `
          <span class="guest-status assigned"></span>
          <span class="guest-name">${seat.guestName}</span>
        `;
        guestList.appendChild(item);
      }
    });

    // Then vacant seats
    for (let s = 1; s <= vacantCount; s++) {
      const item = document.createElement('div');
      item.className = 'guest-item vacant';
      item.innerHTML = `
        <span class="guest-status vacant"></span>
        <span class="guest-name">Vacant seat</span>
      `;
      guestList.appendChild(item);
    }

    tableCard.appendChild(guestList);
    container.appendChild(tableCard);
  }
}

function setupDashboard() {
  // Save seating when inputs change and update both views
  document.addEventListener('change', (e) => {
    if (e.target.tagName === 'INPUT' && e.target.hasAttribute('data-table')) {
      const seating = JSON.parse(localStorage.getItem('erich_seating') || '[]');
      const t = parseInt(e.target.getAttribute('data-table'));
      const s = parseInt(e.target.getAttribute('data-seat'));
      const seat = seating.find(x => x.tableNum === t && x.seatNum === s);
      if (seat) {
        seat.guestName = e.target.value;
        saveSeating(seating);
        renderTableList('seatingBlueprint');
        renderTableList('guestTableList');
      }
    }
  });

  // Tab switching
  const tabBtns = document.querySelectorAll('.tab-btn');
  const dashboardTabs = document.querySelectorAll('.dashboard-tab');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const tabName = btn.getAttribute('data-tab');

      // Hide all tabs, remove active from all buttons
      dashboardTabs.forEach(tab => tab.classList.remove('active'));
      tabBtns.forEach(b => b.classList.remove('active'));

      // Show selected tab, mark button as active
      const selectedTab = document.getElementById(tabName + 'Tab');
      if (selectedTab) selectedTab.classList.add('active');
      btn.classList.add('active');

      // Render the appropriate view
      if (tabName === 'blueprint') {
        renderTableList('seatingBlueprint');
      } else if (tabName === 'editor') {
        renderSeatingGrid();
      }
    });
  });

  // Show/hide dashboard (press ~ to toggle on page)
  document.addEventListener('keydown', (e) => {
    if (e.key === '~') {
      const dashboard = document.getElementById('seatingDashboard');
      if (dashboard && dashboard.hidden) {
        dashboard.hidden = false;
        renderTableList('seatingBlueprint');
      } else if (dashboard) {
        dashboard.hidden = true;
      }
    }
  });

  const toggleBtn = document.getElementById('toggleDashboard');
  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      const dashboard = document.getElementById('seatingDashboard');
      if (dashboard) dashboard.hidden = true;
    });
  }

  // Export/import seating
  const exportBtn = document.getElementById('exportSeating');
  if (exportBtn) {
    exportBtn.addEventListener('click', () => {
      const seating = localStorage.getItem('erich_seating');
      const blob = new Blob([seating], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'erich_seating.json';
      a.click();
    });
  }
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

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  setupOpening();
  initSeating();
  initRSVP();
  setupDashboard();
  setupScrollReveals();
  renderTableList('guestTableList');
});
