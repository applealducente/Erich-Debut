/* ===== FIREBASE REAL-TIME SYNC ===== */

let db = null;
let currentUser = null;

// Initialize Firebase sync
function initFirebaseSync() {
  try {
    db = firebase.database();
    console.log('Firebase database ready');
    setupRealtimeListeners();
  } catch (err) {
    console.log('Firebase not ready yet:', err.message);
  }
}

// Setup real-time listeners for RSVPs and seating
function setupRealtimeListeners() {
  if (!db) return;

  // Listen for RSVP changes
  db.ref('rsvps').on('value', (snapshot) => {
    const firebaseRsvps = snapshot.val() || {};
    const rsvpArray = Object.values(firebaseRsvps);

    // Update localStorage with Firebase data
    localStorage.setItem('erich_rsvps', JSON.stringify(rsvpArray));

    // Trigger dashboard update if it exists
    if (typeof loadRsvps === 'function') {
      loadRsvps();
    }
    if (typeof updateStats === 'function') {
      updateStats();
    }
  });

  // Listen for seating changes
  db.ref('seating').on('value', (snapshot) => {
    const firebaseSeating = snapshot.val() || [];

    // Update localStorage with Firebase data
    localStorage.setItem('erich_seating', JSON.stringify(firebaseSeating));

    // Trigger dashboard updates
    if (typeof renderTableList === 'function') {
      renderTableList('guestTableList');
      renderTableList('seatingBlueprint');
    }
    if (typeof renderSeatingGrid === 'function') {
      renderSeatingGrid();
    }
  });
}

// Save RSVP to Firebase and localStorage
function saveRsvpToFirebase(guestName, attendance, message) {
  const rsvpData = {
    guestName: guestName,
    attendance: attendance,
    message: message,
    submittedAt: new Date().toISOString()
  };

  // Save to localStorage
  const rsvps = JSON.parse(localStorage.getItem('erich_rsvps') || '[]');
  const existingIndex = rsvps.findIndex(r => r.guestName.toLowerCase() === guestName.toLowerCase());

  if (existingIndex >= 0) {
    rsvps[existingIndex] = rsvpData;
  } else {
    rsvps.push(rsvpData);
  }
  localStorage.setItem('erich_rsvps', JSON.stringify(rsvps));

  // Save to Firebase
  if (db) {
    const sanitizedName = guestName.replace(/[.#$[\]]/g, '');
    db.ref('rsvps/' + sanitizedName).set(rsvpData).catch(err => {
      console.log('Firebase write failed, data saved locally:', err.message);
    });
  }
}

// Save seating to Firebase and localStorage
function saveSeatingToFirebase(seating) {
  // Save to localStorage
  localStorage.setItem('erich_seating', JSON.stringify(seating));

  // Save to Firebase
  if (db) {
    db.ref('seating').set(seating).catch(err => {
      console.log('Firebase write failed, data saved locally:', err.message);
    });
  }
}

// Get all RSVPs from Firebase
async function getRsvpsFromFirebase() {
  return new Promise((resolve) => {
    if (!db) {
      // Fall back to localStorage
      const rsvps = JSON.parse(localStorage.getItem('erich_rsvps') || '[]');
      resolve(rsvps);
      return;
    }

    db.ref('rsvps').once('value', (snapshot) => {
      const firebaseRsvps = snapshot.val() || {};
      const rsvpArray = Object.values(firebaseRsvps);
      localStorage.setItem('erich_rsvps', JSON.stringify(rsvpArray));
      resolve(rsvpArray);
    });
  });
}

// Get all seating from Firebase
async function getSeatingFromFirebase() {
  return new Promise((resolve) => {
    if (!db) {
      // Fall back to localStorage
      const seating = JSON.parse(localStorage.getItem('erich_seating') || '[]');
      resolve(seating);
      return;
    }

    db.ref('seating').once('value', (snapshot) => {
      const firebaseSeating = snapshot.val() || [];
      localStorage.setItem('erich_seating', JSON.stringify(firebaseSeating));
      resolve(firebaseSeating);
    });
  });
}

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
  initFirebaseSync();
});
