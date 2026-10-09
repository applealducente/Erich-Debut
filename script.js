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
let modal, openRsvp, closeRsvp, form, attendance, confirmation, seatingContent, seatingModal;

function initRSVP() {
  modal = document.getElementById("rsvpModal");
  openRsvp = document.getElementById("openRsvp");
  closeRsvp = document.getElementById("closeRsvp");
  form = document.getElementById("rsvpForm");
  attendance = document.getElementById("attendance");
  confirmation = document.getElementById("rsvpConfirmation");
  seatingContent = document.getElementById("seatingContent");
  seatingModal = document.getElementById("seatingModal");

  if (!modal || !form) return;
}

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

  openRsvp.addEventListener("click", openModal);
  closeRsvp.addEventListener("click", closeModal);
  modal.querySelector(".modal-backdrop").addEventListener("click", closeModal);

  document.getElementById("closeSeating").addEventListener("click", closeSeatingModal);
  seatingModal.querySelector(".modal-backdrop").addEventListener("click", closeSeatingModal);
}

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

// Save seating when inputs change
document.addEventListener('change', (e) => {
  if (e.target.tagName === 'INPUT' && e.target.hasAttribute('data-table')) {
    const seating = JSON.parse(localStorage.getItem('erich_seating') || '[]');
    const t = parseInt(e.target.getAttribute('data-table'));
    const s = parseInt(e.target.getAttribute('data-seat'));
    const seat = seating.find(x => x.tableNum === t && x.seatNum === s);
    if (seat) {
      seat.guestName = e.target.value;
      saveSeating(seating);
    }
  }
});

// Show/hide dashboard (press ~ to toggle on page)
document.addEventListener('keydown', (e) => {
  if (e.key === '~') {
    const dashboard = document.getElementById('seatingDashboard');
    if (dashboard.hidden) {
      dashboard.hidden = false;
      renderSeatingGrid();
    } else {
      dashboard.hidden = true;
    }
  }
});

document.getElementById('toggleDashboard')?.addEventListener('click', () => {
  document.getElementById('seatingDashboard').hidden = true;
});

// Export/import seating
document.getElementById('exportSeating')?.addEventListener('click', () => {
  const seating = localStorage.getItem('erich_seating');
  const blob = new Blob([seating], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'erich_seating.json';
  a.click();
});

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  initSeating();
  initRSVP();
});
