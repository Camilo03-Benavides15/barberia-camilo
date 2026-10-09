const paymentSummary = document.querySelector("#payment-booking-summary");
const paymentForm = document.querySelector("#payment-form");
const paymentError = document.querySelector("#payment-error");
const savedOrder = JSON.parse(sessionStorage.getItem("barberia-order") || "[]");
const savedBooking = JSON.parse(sessionStorage.getItem("barberia-booking") || "null");

const formatPrice = (price) => `$${new Intl.NumberFormat("es-CO").format(price)}`;

if (savedOrder.length === 0 || !savedBooking) {
  window.location.replace(savedOrder.length === 0 ? "index.html#servicios" : "reserva.html");
} else {
  const total = savedOrder.reduce((sum, [, item]) => sum + item.price, 0);
  const deposit = Math.ceil(total / 2);
  const serviceList = document.createElement("ul");
  serviceList.className = "checkout-service-list";
  for (const [, item] of savedOrder) {
    const line = document.createElement("li");
    line.textContent = `${item.name}${item.duration ? ` · ${item.duration}` : ""} — ${formatPrice(item.price)}`;
    serviceList.append(line);
  }
  const appointmentLine = document.createElement("p");
  appointmentLine.className = "checkout-appointment-line";
  const appointmentDate = new Date(`${savedBooking.date}T12:00:00`);
  const dateText = new Intl.DateTimeFormat("es-CO", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric"
  }).format(appointmentDate);
  appointmentLine.textContent = `${savedBooking.customerName} · ${dateText} a las ${savedBooking.time}`;
  paymentSummary.append(serviceList, appointmentLine);

  document.querySelector("#deposit-amount").textContent = `${formatPrice(deposit)} COP`;
  document.querySelector("#remaining-amount").textContent = `${formatPrice(total - deposit)} COP`;
  document.querySelector("#deposit-total").textContent = `${formatPrice(total)} COP`;
}

paymentForm.addEventListener("submit", (event) => {
  event.preventDefault();
  paymentError.hidden = true;
  const paymentMethod = new FormData(paymentForm).get("paymentMethod");
  if (!["Tarjeta de crédito", "Nequi", "Efectivo"].includes(paymentMethod)) {
    paymentError.textContent = "Elige cómo prefieres hacer el abono.";
    paymentError.hidden = false;
    return;
  }

  sessionStorage.setItem("barberia-payment-method", String(paymentMethod));
  sessionStorage.removeItem("barberia-demo-deposit-confirmed");
  window.location.href = "confirmacion.html";
});
