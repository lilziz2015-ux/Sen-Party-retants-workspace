/* Sen Party Rentals Pro – App Script (v1.0)
   Local-only edition — simple, fast, and offline-ready
   by ChatGPT + Saliou
*/

// ==== UTILITIES ====
const $ = (id) => document.getElementById(id);
const fmtUSD = (n) => "$" + Number(n || 0).toLocaleString("en-US", { minimumFractionDigits: 2 });
const todayISO = new Date().toISOString().slice(0, 10);
const KEY = "spr.bookings.v2";

// ==== LOCAL STORAGE ====
let bookings = loadLocal();

function loadLocal() {
  try { return JSON.parse(localStorage.getItem(KEY) || "[]"); }
  catch { return []; }
}
function saveLocal() {
  localStorage.setItem(KEY, JSON.stringify(bookings));
}

// ==== DASHBOARD ====
function refreshDashboard() {
  if (!document.getElementById("stat-total")) return;

  const total = bookings.length;
  const today = todayISO;
  const upcoming = bookings.filter(b => b.eventDate >= today).length;
  const unpaid = bookings.reduce((sum, b) => sum + Math.max(0, (b.subtotal || 0) - (b.deposit || 0)), 0);
  const month = new Date().getMonth();
  const revenue = bookings
    .filter(b => new Date(b.eventDate).getMonth() === month)
    .reduce((sum, b) => sum + (b.subtotal || 0), 0);

  $("stat-total").textContent = total;
  $("stat-upcoming").textContent = upcoming;
  $("stat-unpaid").textContent = fmtUSD(unpaid);
  $("stat-revenue").textContent = fmtUSD(revenue);

  renderAgenda();
}

function renderAgenda() {
  const list = $("agenda-list");
  if (!list) return;
  const today = todayISO;
  const todaysBookings = bookings.filter(b => b.eventDate === today);

  list.innerHTML = "";
  if (todaysBookings.length === 0) {
    list.innerHTML = `<li class="muted">No bookings for today.</li>`;
  } else {
    todaysBookings.sort((a, b) => (a.startTime || "").localeCompare(b.startTime || ""));
    todaysBookings.forEach(b => {
      const color = b.deliveryType === "pickup" ? "🟡" : "🟢";
      const li = document.createElement("li");
      li.innerHTML = `<b>${b.startTime}</b> — ${b.customer?.name || "Client"} (${color}) <small>${b.notes || ""}</small>`;
      list.appendChild(li);
    });
  }
}

// ==== BOOKING FORM ====
function setupBookingForm() {
  const name = $("name");
  if (!name) return; // only runs on booking page

  const saveBtn = $("saveBooking");
  const resetBtn = $("resetForm");
  const msg = $("formMsg");

  function readForm() {
    return {
      id: crypto.randomUUID(),
      customer: { name: name.value, email: $("email").value, phone: $("phone").value },
      eventDate: $("eventDate").value,
      startTime: $("startTime").value,
      endTime: $("endTime").value,
      deliveryType: $("deliveryType").value,
      address: $("address").value,
      zip: $("zip").value,
      notes: $("notes").value,
      subtotal: parseFloat($("subtotal").value || 0),
      deposit: parseFloat($("deposit").value || 0),
      createdAt: new Date().toISOString()
    };
  }

  saveBtn.onclick = () => {
    const b = readForm();
    if (!b.customer.name || !b.eventDate) {
      msg.textContent = "⚠️ Please fill out required fields.";
      return;
    }
    bookings.push(b);
    saveLocal();
    msg.textContent = "✅ Booking saved!";
    resetForm();
  };

  resetBtn.onclick = resetForm;

  function resetForm() {
    document.querySelectorAll("input, textarea").forEach(i => i.value = "");
  }
}

// ==== BOOKINGS LIST ====
function renderBookingsList() {
  const list = $("bookingsList");
  if (!list) return;

  list.innerHTML = "";
  const sorted = bookings.sort((a, b) => (a.eventDate || "").localeCompare(b.eventDate || ""));

  sorted.forEach(b => {
    const color = b.deliveryType === "pickup" ? "pickup" : "delivery";
    const div = document.createElement("div");
    div.className = `booking-card ${color}`;
    div.innerHTML = `
      <h3>${b.customer.name} <span class="pill ${color}">${b.deliveryType}</span></h3>
      <p><b>Date:</b> ${b.eventDate} | <b>Time:</b> ${b.startTime}–${b.endTime}</p>
      <p><b>Address:</b> ${b.address || "—"}</p>
      <p><b>Subtotal:</b> ${fmtUSD(b.subtotal)} | <b>Deposit:</b> ${fmtUSD(b.deposit)}</p>
      <p><b>Notes:</b> ${b.notes || "None"}</p>
      <div class="actions">
        <button class="btn-outline" onclick="printInvoice('${b.id}')">🧾 Invoice</button>
        <button class="btn" onclick="deleteBooking('${b.id}')">🗑 Delete</button>
      </div>`;
    list.appendChild(div);
  });
}

function deleteBooking(id) {
  if (!confirm("Delete this booking?")) return;
  bookings = bookings.filter(b => b.id !== id);
  saveLocal();
  renderBookingsList();
  refreshDashboard();
}

// ==== INVOICE ====
function printInvoice(id) {
  const b = bookings.find(x => x.id === id);
  if (!b) return;
  const html = `
    <html><head><title>Invoice</title>
    <style>
      body{font-family:Arial;padding:40px;line-height:1.6;color:#333;}
      h1{color:#0b67a3;}table{width:100%;margin-top:20px;border-collapse:collapse;}
      th,td{border:1px solid #ddd;padding:8px;text-align:left;}
      th{background:#f3f4f6;}
      .footer{margin-top:40px;text-align:center;color:#777;}
    </style>
    </head><body>
    <h1>Sen Party Rentals</h1>
    <p><b>Customer:</b> ${b.customer.name}<br>
    <b>Event Date:</b> ${b.eventDate}<br>
    <b>Type:</b> ${b.deliveryType}</p>
    <table>
      <tr><th>Item</th><th>Subtotal</th><th>Deposit</th><th>Balance</th></tr>
      <tr><td>${b.notes || "Rental Equipment"}</td>
      <td>${fmtUSD(b.subtotal)}</td>
      <td>${fmtUSD(b.deposit)}</td>
      <td>${fmtUSD(b.subtotal - b.deposit)}</td></tr>
    </table>
    <p class="footer">📞 571-719-9575 | 📍 11910 Bradley Forest Rd, Manassas, VA<br>Thank you for choosing Sen Party Rentals!</p>
    </body></html>
  `;
  const w = window.open("", "_blank");
  w.document.write(html);
  w.document.close();
  w.print();
}

// ==== INIT ====
document.addEventListener("DOMContentLoaded", () => {
  refreshDashboard();
  setupBookingForm();
  renderBookingsList();
});
