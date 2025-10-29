// ============================
// Sen Party Rentals Pro — Core App Logic
// ============================

// ---- STORAGE HELPERS ----
export function getBookings() {
  return JSON.parse(localStorage.getItem("spr.bookings") || "[]");
}

export function saveBookings(data) {
  localStorage.setItem("spr.bookings", JSON.stringify(data));
  window.dispatchEvent(new Event("bookingsUpdated"));
}

export function addBooking(booking) {
  const bookings = getBookings();
  bookings.push(booking);
  saveBookings(bookings);
}

export function deleteBooking(id) {
  const bookings = getBookings().filter(b => b.id !== id);
  saveBookings(bookings);
}

// ---- SYNC LISTENER ----
window.addEventListener("storage", e => {
  if (e.key === "spr.bookings") window.dispatchEvent(new Event("bookingsUpdated"));
});

// ---- UTILITIES ----
export function formatCurrency(value) {
  return "$" + (parseFloat(value || 0)).toFixed(2);
}

export function calcBalance(total, deposit) {
  return (parseFloat(total) - parseFloat(deposit)).toFixed(2);
}

export function generateId() {
  return Date.now();
}