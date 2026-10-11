/* ===== SEATING SYSTEM ===== */

// Initialize seating chart (13 tables, 8 seats each)
function initSeating() {
  const seating = [];
  for (let t = 1; t <= 13; t++) {
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
    // Google Sheet CSV export URL - Guests sheet
    const sheetUrl = 'https://docs.google.com/spreadsheets/d/1NmHsc0HdhuiVzdJl8CdY0sHlW4-TqJyJVxYrnW8oWgs/export?format=csv&gid=1937863515';

    const response = await fetch(sheetUrl);
    if (!response.ok) return false;

    const csv = await response.text();
    const lines = csv.trim().split('\n');

    const guestList = [];
    // Skip header row, parse guest data (columns: number, name, table)
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      // Parse CSV with proper quote handling
      let parts = [];
      let current = '';
      let inQuotes = false;
      for (let j = 0; j < line.length; j++) {
        const char = line[j];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          parts.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      parts.push(current.trim());

      // Guest name is in column 1 (index 1), table is in column 2 (index 2)
      if (parts.length >= 3 && parts[1]) {
        const name = parts[1].replace(/^"|"$/g, '').trim();
        const tableStr = parts[2].trim();
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
    console.log('Sheet sync skipped, using local data', err);
    return false;
  }
}

// Apply guest list to seating
function applyGuestListToSeating(guestList) {
  // Create fresh seating (don't preserve old cached data)
  const seating = [];
  for (let t = 1; t <= 13; t++) {
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

// Load guest list into seating
function loadGuestList() {
  const seating = JSON.parse(localStorage.getItem('erich_seating') || '[]');

  // Direct guest list - all 89 guests with correct table assignments
  const guests = [
    ["Jubilee Ann Mancilla",1],["Alvin Sto. Domingo",1],["Paola Mancilla",1],["Elma Mancilla",1],["Wilmer Mancilla",1],["Fernando Alducente",1],["John Amiel Mancilla",1],["Marlyn Murata",1],
    ["Apple Ulysses Alducente",2],["Harlet Caigas",2],["Joey Baldo",2],["Ally Torres",2],["John Rod Ordonio",2],["Rodolfo Ordonio",2],["Aaron Sales",2],["Patrick John Razon",2],
    ["Jeamy Shane Nebrida",3],["Elmo Janzhel Mancilla",3],["Justine Rhayne Nebrida",3],["John Raven Cruz",3],["Diorella Cruz",3],["Rommel Cruz",3],["Daryl Melitante",3],["Rachelle Melitante",3],
    ["Nikka Rein Bernil",4],["Timmy Liz Ching",4],["Leighna Mariano",4],["Mary Ann Restua",4],["Jelian Ventura",4],["Randolf Antonio",4],["Frank Mhil Armada",4],["Dan Allen Tolentino",4],
    ["Sittie Ainah Sultan",5],["Idhel Catabas",5],["Crist Tilo",5],["Hashlee Marie Boniao",5],
    ["John Benedick Ching",6],["Robert Ching",6],["Liesel Rodelo",6],["Tomas Ching Jr.",6],["Rene Ching",6],["Evelyn Ching Ignacio",6],["Anna Martin",6],["Aida Delos Santos",6],
    ["John Frics Isaac",7],["Rom David Bleza",7],["David Joenr Traqueña",7],["Precious Hillary Siochi",7],["Velinda Guadalupe",7],["Lorraine Villaflores",7],["Daniella Shane Molina",7],["Gaby Maravillo",7],
    ["Kate Paraiso",8],["Choi Paraiso",8],["Jane Diane",8],["Christopher Diane",8],["Ogie Banigued",8],["Agnes Dela Cruz",8],["Elaine Pascual",8],["Eric Blanco",8],
    ["Yanyan Vibar",9],["Mario Vibar",9],["Jhonny Tumbocon",9],["Marcos Llenado",9],["Crismar Canlas",9],["Julianne Marie Llenado",9],["Hissie Moreno",9],["Obet Panilong",9],
    ["Josephine Moya",10],["Michael Moya",10],["Vangie Grimaldo",10],["Michael Nito",10],["Agnes Nito",10],["Botchok Grimaldo",10],
    ["Jennelyn Morte",11],["Louie Morte",11],["Babylynne Gomez",11],["Violy Delos Reyes",11],["Allan Delos Reyes",11],
    ["Christine Juco",12],["Laser Juco",12],["Lance Juco",12],["Terry Joy Gonzales",12],["Marlon Gonzales",12],["Naneth Miranda",12],["Manny Miranda",12],
    ["Jojo Anonas",13],["James Lumio",13],["Maricar Rarama",13],["Jaycel Dacanay",13],["Mhane Rivero",13],["Dan Malumbay",13]
  ];

  // Assign each guest to correct seat
  guests.forEach(([name, table]) => {
    const seat = seating.find(s => s.tableNum === table && !s.guestName);
    if (seat) {
      seat.guestName = name;
    }
  });

  localStorage.setItem('erich_seating', JSON.stringify(seating));
}

function saveSeating(seating) {
  localStorage.setItem('erich_seating', JSON.stringify(seating));

  // Also save to Firebase for real-time sync
  if (typeof saveSeatingToFirebase === 'function') {
    saveSeatingToFirebase(seating);
  }
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

    // Also save to Firebase for real-time sync
    if (typeof saveRsvpToFirebase === 'function') {
      saveRsvpToFirebase(name, att ? 'yes' : 'no', message);
    }

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

  for (let t = 1; t <= 13; t++) {
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

  console.log('renderTableList - seating has', seating.length, 'seats');
  console.log('Sample seat 0:', seating[0]);
  console.log('Sample seat 50:', seating[50]);

  container.innerHTML = '';

  for (let t = 1; t <= 13; t++) {
    const tableSeats = seating.filter(x => x.tableNum === t);
    const confirmedNames = tableSeats.filter(x => x.confirmed && x.guestName).map(x => x.guestName);
    const assignedNames = tableSeats.filter(x => x.guestName && !x.confirmed).map(x => x.guestName);
    const vacantCount = tableSeats.filter(x => !x.guestName).length;
    const totalGuests = confirmedNames.length + assignedNames.length;

    if (t === 1) console.log('Table 1:', { tableSeats: tableSeats.length, assignedNames, vacantCount });

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
  initSeating(); // Always reinitialize to fresh state

  // Always load guest list first (Google Sheet as backup)
  loadGuestList();

  // Try to sync fresh from Google Sheet to update if changed
  await syncGuestListFromSheet();

  initRSVP();
  setupDashboard();
  setupOrganizerAccess();
  setupScrollReveals();

  // Render table list after all data is loaded
  setTimeout(() => renderTableList('guestTableList'), 100);
});
