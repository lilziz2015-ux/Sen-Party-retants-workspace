// === Sen Party Rentals Pro App ===

// --- DEMO DATA ---
const demoBookings = [
  {
    id: 1,
    customer: "John Doe",
    date: "2025-10-29",
    type: "delivery",
    status: "paid",
    total: 350,
    deposit: 100,
    balance: 250,
    address: "123 Maple Ave, Manassas, VA"
  },
  {
    id: 2,
    customer: "Aisha Barry",
    date: "2025-10-30",
    type: "pickup",
    status: "unpaid",
    total: 420,
    deposit: 100,
    balance: 320,
    address: "890 River Rd, Woodbridge, VA"
  },
  {
    id: 3,
    customer: "Moussa Diop",
    date: "2025-10-27",
    type: "delivery",
    status: "paid",
    total: 200,
    deposit: 200,
    balance: 0,
    address: "55 Pine St, Fairfax, VA"
  }
];

// --- LOCAL STORAGE SETUP ---
function getBookings() {
  const local = localStorage.getItem("spr.bookings");
  return local ? JSON.parse(local) : demoBookings;
}

function saveBookings(bookings) {
  localStorage.setItem("spr.bookings", JSON.stringify(bookings));
}

// --- DASHBOARD FUNCTIONS ---
function updateStats() {
  const bookings = getBookings();
  const today = new Date().toISOString().slice(0, 10);

  const upcoming = bookings.filter(b => b.date >= today);
  const unpaid = bookings.filter(b => b.balance > 0);

  const totalRevenue = bookings.reduce((sum, b) => sum + b.total, 0);
  const thisMonth = new Date().toISOString().slice(0, 7);
  const monthRevenue = bookings
    .filter(b => b.date.startsWith(thisMonth))
    .reduce((sum, b) => sum + b.total, 0);

  document.getElementById("stat-upcoming").textContent = upcoming.length;
  document.getElementById("stat-total").textContent = bookings.length;
  document.getElementById("stat-unpaid").textContent =
    "$" + unpaid.reduce((sum, b) => sum + b.balance, 0);
  document.getElementById("stat-revenue").textContent = "$" + monthRevenue;
}

// --- TODAY'S AGENDA ---
function loadAgenda() {
  const list = document.getElementById("agenda-list");
  if (!list) return;

  const bookings = getBookings();
  const today = new Date();
  const todayISO = today.toISOString().slice(0, 10);

  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const tomorrowISO = tomorrow.toISOString().slice(0, 10);

  const overdue = bookings.filter(b => b.date < todayISO);
  const todayBookings = bookings.filter(b => b.date === todayISO);
  const tomorrowBookings = bookings.filter(b => b.date === tomorrowISO);

  list.innerHTML = "";

  if (todayBookings.length === 0 && tomorrowBookings.length === 0 && overdue.length === 0) {
    list.innerHTML = "<li class='muted'>No bookings scheduled for today.</li>";
    return;
  }

  overdue.forEach(b => {
    list.innerHTML += `<li class="overdue">
      <span>🔴 ${b.customer} (${b.type})</span>
      <small>${b.address}</small>
    </li>`;
  });
  todayBookings.forEach(b => {
    list.innerHTML += `<li class="upcoming">
      <span>🟢 ${b.customer} (${b.type})</span>
      <small>${b.address}</small>
    </li>`;
  });
  tomorrowBookings.forEach(b => {
    list.innerHTML += `<li class="tomorrow">
      <span>🟡 ${b.customer} (${b.type})</span>
      <small>${b.address}</small>
    </li>`;
  });
}

// --- INITIALIZATION ---
document.addEventListener("DOMContentLoaded", () => {
  updateStats();
  loadAgenda();
});