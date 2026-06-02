/**
 * Generates available time slots for a service listing on a given date.
 * Enforces buffer time between slots — no back-to-back booking possible.
 */
function generateSlots({ workingHoursStart, workingHoursEnd, slotDurationMins, bufferMins, existingBookings = [], blockedSlots = [] }) {
  const slots = [];
  const [startH, startM] = workingHoursStart.split(':').map(Number);
  const [endH, endM] = workingHoursEnd.split(':').map(Number);
  const startTotal = startH * 60 + startM;
  const endTotal = endH * 60 + endM;
  const step = slotDurationMins + bufferMins;

  for (let t = startTotal; t + slotDurationMins <= endTotal; t += step) {
    const slotEnd = t + slotDurationMins;
    const isBooked = existingBookings.some(b => {
      const bStart = timeToMins(b.start);
      const bEnd = timeToMins(b.end);
      return t < bEnd && slotEnd > bStart;
    });
    const isBlocked = blockedSlots.some(b => {
      const bStart = timeToMins(b.start);
      const bEnd = timeToMins(b.end);
      return t < bEnd && slotEnd > bStart;
    });
    if (!isBooked && !isBlocked) {
      slots.push({ start: minsToTime(t), end: minsToTime(slotEnd) });
    }
  }
  return slots;
}

function timeToMins(time) {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

function minsToTime(mins) {
  const h = Math.floor(mins / 60).toString().padStart(2, '0');
  const m = (mins % 60).toString().padStart(2, '0');
  return `${h}:${m}`;
}

module.exports = { generateSlots };
