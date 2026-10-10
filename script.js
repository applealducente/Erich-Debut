/* ===== SEATING SYSTEM ===== */

// Initialize seating chart (12 tables, 8 seats each)
function initSeating() {
  const seating = [];
  for (let t = 1; t <= 12; t++) {
    for (let s = 1; s <= 8; s++) {
      seating.push({
        tableNum: t,
        seatNum: s,
        guestName: '', // Will be filled from sheet sync or local data
        confirmed: false,
        confirmedAt: null
      });
    }
  }
  localStorage.setItem('erich_seating', JSON.stringify(seating));
  return seating;
}

// Fetch guest list from Google Sheet CSV export
async function syncGuestListFromSheet() {
  try {
    // Google Sheet CSV export URL (replace SHEET_ID and sheet gid)
    const sheetUrl = 'https://docs.google.com/spreadsheets/d/1NmHsc0HdhuiVzdJl8CdY0sHlW4-TqJyJVxYrnW8oWgs/export?format=csv&gid=0';

    const response = await fetch(sheetUrl);
    if (!response.ok) return false;

    const csv = await response.text();
    const lines = csv.trim().split('\n');

    const guestList = [];
    // Skip header row, parse guest data
    for (let i = 1; i < lines.length; i++) {
      const parts = lines[i].split(',');
      if (parts.length >= 2 && parts[1].trim()) {
        const name = parts[0].trim().replace(/^"|"$/g, '');
        const tableStr = parts[1].trim();
        const table = parseInt(tableStr);

        if (name && table && table > 0) {
          guestList.push({ name, table });
        }
      }
    }

    if (guestList.length === 0) return false;

    // Apply to seating
    applyGuestListToSeating(guestList);
    return true;
  } catch (err) {
    console.log('Sheet sync skipped, using local data');
    return false;
  }
}

// Apply guest list to seating
function applyGuestListToSeating(guestList) {
  // Create fresh seating (don't preserve old cached data)
  const seating = [];
  for (let t = 1; t <= 12; t++) {
    for (let s = 1; s <= 8; s++) {
      seating.push({
        tableNum: t,
        seatNum: s,
        guestName: '',
        confirmed: false,
        confirmedAt: null
      });
    }
  }

  // Assign guests from list
  guestList.forEach((guest) => {
    const seat = seating.find(s => s.tableNum === guest.table && !s.guestName);
    if (seat) {
      seat.guestName = guest.name;
    }
  });

  localStorage.setItem('erich_seating', JSON.stringify(seating));
}

// Load guest list into seating (fallback if sheet sync fails)
function loadGuestList() {
  const guestList = [
    {name: "Jubilee Ann Mancilla", table: 1},
    {name: "Alvin Sto. Domingo", table: 1},
    {name: "Paola Mancilla", table: 1},
    {name: "Jeamy Shane Nebrida", table: 1},
    {name: "Apple Ulysses Alducente", table: 1},
    {name: "Elma Mancilla", table: 1},
    {name: "Harlet Caigas", table: 1},
    {name: "Elmo Janzhel Mancilla", table: 1},
    {name: "Wilmer Mancilla", table: 2},
    {name: "Fernando Alducente", table: 2},
    {name: "John Amiel Mancilla", table: 2},
    {name: "Joey Baldo", table: 2},
    {name: "John Raven Cruz", table: 2},
    {name: "Diorella Cruz", table: 2},
    {name: "Rommel Cruz", table: 2},
    {name: "Daryl Melitante", table: 3},
    {name: "Rachelle Melitante", table: 3},
    {name: "Nikka Rein Bernil", table: 3},
    {name: "Timmy Liz Ching", table: 3},
    {name: "Leighna Mariano", table: 3},
    {name: "Mary Ann Restua", table: 3},
    {name: "Jelian Ventura", table: 3},
    {name: "Sittie Ainah Sultan", table: 3},
    {name: "Randolf Antonio", table: 4},
    {name: "Frank Mhil Armada", table: 4},
    {name: "Dan Allen Tolentino", table: 4},
    {name: "Idhel Catabas", table: 4},
    {name: "Crist Tilo", table: 4},
    {name: "Hashlee Marie Boniao", table: 4},
    {name: "John Frics Isaac", table: 4},
    {name: "Rom David Bleza", table: 4},
    {name: "David Joenr Traqueña", table: 5},
    {name: "Precious Hillary Siochi", table: 5},
    {name: "Velinda Guadalupe", table: 5},
    {name: "Lorraine Villaflores", table: 5},
    {name: "Daniella Shane Molina", table: 5},
    {name: "Aaron Sales", table: 5},
    {name: "Justine Rhayne Nebrida", table: 5},
    {name: "John Rod Ordonio", table: 5},
    {name: "Liesel Rodelo", table: 6},
    {name: "Tomas Ching Jr.", table: 6},
    {name: "Rene Ching", table: 6},
    {name: "Evelyn Ching Ignacio", table: 6},
    {name: "Kate Paraiso", table: 6},
    {name: "Choi Paraiso", table: 6},
    {name: "Jane Diane", table: 6},
    {name: "Christopher Diane", table: 6},
    {name: "Josephine Moya", table: 7},
    {name: "Michael Moya", table: 7},
    {name: "Yanyan Vibar", table: 7},
    {name: "Mario Vibar", table: 7},
    {name: "Ally Torres", table: 7},
    {name: "Elaine Pascual", table: 7},
    {name: "Eric Blanco", table: 7},
    {name: "Vangie Grimaldo", table: 7},
    {name: "Botchok Grimaldo", table: 8},
    {name: "Ogie Banigued", table: 8},
    {name: "Agnes Dela Cruz", table: 8},
    {name: "Naneth Miranda", table: 8},
    {name: "Manny Miranda", table: 8},
    {name: "Jing Morte", table: 8},
    {name: "Louie Morte", table: 8},
    {name: "Maricar Rarama", table: 8},
    {name: "Jaycel Dacanay", table: 9},
    {name: "Mhane Rivero", table: 9},
    {name: "Jhonny Tumbocon", table: 9},
    {name: "Marcos Llenado", table: 9},
    {name: "Crismar Canlas", table: 9},
    {name: "Patrick John Razon", table: 9},
    {name: "Dan Malumbay", table: 9},
    {name: "Obet Panilong", table: 9},
    {name: "Michael Nito", table: 10},
    {name: "Marlyn Murata", table: 11},
    {name: "Anna Martin", table: 12}
  ];

  const seating = JSON.parse(localStorage.getItem('erich_seating') || '[]');

  guestList.forEach((guest, idx) => {
    const seat = seating.find(s => s.tableNum === guest.table && !s.guestName);
    if (seat) {
      seat.guestName = guest.name;
    }
  });

  localStorage.setItem('erich_seating', JSON.stringify(seating));
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
    title.textContent = `${guestName}, Your Table`;
    seatingContent.innerHTML = `
      <div class="seat-info">
        <p class="seat-table">Table <strong>${seat.tableNum}</strong></p>
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

    // Check if already RSVPed
    const all = JSON.parse(localStorage.getItem("erich_rsvps") || "[]");
    const alreadyRsvped = all.find(r => r.guestName.toLowerCase() === name.toLowerCase());
    if (alreadyRsvped) {
      form.querySelectorAll("input,select,textarea,button[type=submit]").forEach(el => el.disabled = true);

      // Show seat modal with already-submitted message
      const title = document.getElementById("seatingTitle");
      title.textContent = `${name}, Your Table`;
      seatingContent.innerHTML = `
        <div class="seat-info">
          <p style="color: #f1d99e; margin-bottom: 16px; font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em;">Already Confirmed</p>
          <p class="seat-table">Table <strong>${seat.tableNum}</strong></p>
          <p class="seat-msg">You've already RSVPed on ${new Date(alreadyRsvped.submittedAt).toLocaleDateString()}. We look forward to celebrating with you in the garden.</p>
        </div>
      `;
      closeModal();
      seatingModal.classList.add("show");
      seatingModal.setAttribute("aria-hidden", "false");
      return;
    }

    // Save RSVP
    updateSeatConfirmation(name, attendance.value);
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
    const confirmedNames = tableSeats.filter(x => x.confirmed && x.guestName).map(x => x.guestName);
    const assignedNames = tableSeats.filter(x => x.guestName && !x.confirmed).map(x => x.guestName);
    const vacantCount = tableSeats.filter(x => !x.guestName).length;
    const totalGuests = confirmedNames.length + assignedNames.length;

    const tableCard = document.createElement('div');
    tableCard.className = 'table-card';

    // Header with table number
    const header = document.createElement('div');
    header.className = 'table-card-header';
    header.innerHTML = `<span class="table-card-title">Table ${t}</span>`;
    tableCard.appendChild(header);

    // Guest names as individual list items
    const namesList = document.createElement('div');
    namesList.className = 'guest-names-compact';

    const allNames = [...confirmedNames, ...assignedNames];
    if (allNames.length > 0) {
      allNames.forEach(name => {
        const nameItem = document.createElement('div');
        nameItem.className = 'guest-item';
        nameItem.textContent = name;
        namesList.appendChild(nameItem);
      });
    } else if (vacantCount === 8) {
      const emptyItem = document.createElement('div');
      emptyItem.className = 'guest-item empty';
      emptyItem.textContent = 'No guests yet';
      namesList.appendChild(emptyItem);
    }

    if (vacantCount > 0 && totalGuests > 0) {
      const vacantSpan = document.createElement('div');
      vacantSpan.className = 'vacant-count';
      vacantSpan.textContent = `+${vacantCount} vacant`;
      namesList.appendChild(vacantSpan);
    }

    tableCard.appendChild(namesList);
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
      } else if (tabName === 'tracker') {
        // Tracker tab opens admin.html in new window
        window.open('admin.html', 'rsvp_tracker', 'width=1400,height=800');
      }
    });
  });


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
document.addEventListener('DOMContentLoaded', async () => {
  setupOpening();
  initSeating();

  // Try to sync from Google Sheet, fallback to local data
  const synced = await syncGuestListFromSheet();
  if (!synced) {
    loadGuestList();
  }

  initRSVP();
  setupDashboard();
  setupOrganizerAccess();
  setupScrollReveals();
  renderTableList('guestTableList');
});
