/* ===== RSVP STORE (Firebase Realtime Database is the single source of truth) =====
 *
 * Every RSVP lives at rsvps/<key>, where <key> comes from Guests.keyFor(name).
 * Guests and organizers read the same data, so a delete on the dashboard
 * takes effect everywhere. Nothing is kept in localStorage.
 */
const RsvpStore = (function () {
  function rsvpsRef() {
    if (!erichDb) throw new Error('Firebase is not available');
    return erichDb.ref('rsvps');
  }

  function friendly(err) {
    const code = (err && err.code) || '';
    if (/permission/i.test(code + ' ' + (err && err.message))) {
      return 'Firebase refused the request (permission denied). Publish database.rules.json in the Firebase Console under Realtime Database > Rules.';
    }
    return (err && err.message) || 'Unknown Firebase error';
  }

  return {
    friendly,

    available() {
      return !!erichDb;
    },

    // Create an RSVP. Resolves { created: true } or { created: false, existing } if one is already there.
    async create(guest, attendance, message) {
      const data = {
        guestName: guest.name,
        attendance: attendance === 'yes' ? 'yes' : 'no',
        message: (message || '').slice(0, 500),
        table: guest.table,
        submittedAt: new Date().toISOString()
      };
      const result = await rsvpsRef().child(Guests.keyFor(guest.name)).transaction(current => {
        return current ? undefined : data; // returning undefined aborts when an RSVP already exists
      });
      if (result.committed) return { created: true, rsvp: data };
      return { created: false, existing: result.snapshot.val() };
    },

    // Delete one RSVP by guest name
    remove(name) {
      return rsvpsRef().child(Guests.keyFor(name)).remove();
    },

    // Delete several RSVPs in one atomic write. `keys` are Firebase keys.
    removeKeys(keys) {
      const updates = {};
      keys.forEach(k => { updates[k] = null; });
      return rsvpsRef().update(updates);
    },

    // Live feed. onData receives { key: rsvp }, onError receives a readable message.
    listen(onData, onError) {
      const ref = rsvpsRef();
      const handler = ref.on('value',
        snap => onData(snap.val() || {}),
        err => onError(friendly(err))
      );
      return () => ref.off('value', handler);
    }
  };
})();
