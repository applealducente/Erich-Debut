# Erich Enchants: Enchanted Garden Invitation

This is the new opening experience for Erich Jacelle Ordonio Mancilla's debut invitation.

## Upload these files

- `index.html`
- `styles.css`
- `script.js`
- `assets/enchanted.mp3`

The design expects these optional image assets:

- `assets/garden-background.jpg`
- `assets/erich-original.jpg`

## Important

The envelope click is intentionally the user interaction that starts the music. Browsers generally block true autoplay before the visitor interacts with the page.

The RSVP link is currently a placeholder. Connect it to the final RSVP form/backend once the invitation design is approved.

## Event

Erich Enchants
An Enchanted Eighteenth

November 7, 2026
6:00 PM

Carlito’s Private Pool and Venue
01 Patag St. 3020, Meycauayan, Bulacan

RSVP deadline: October 30, 2026
Dress code: Semi Formal
Color coding: Pastel colors excluding purple or violet
Plus 1 per guest only


## RSVP role recognition

The RSVP flow checks the guest's name against `data.js`.

After a YES RSVP, the confirmation can display:
- 18 Roses + number
- 18 Candles + number
- 18 Treasures + number
- 18 Blue Bills + number
- Cotillion Dancer + pair number

A guest can have multiple roles and all matching roles are shown.

The current RSVP stores submissions in browser localStorage as a prototype. For a real event, connect the same response object to a shared Google Sheet, Supabase, or another backend so the host can see RSVPs from every device.
