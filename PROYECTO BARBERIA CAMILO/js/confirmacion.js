const confirmationSummary = document.querySelector("#confirmation-summary");
const whatsappButton = document.querySelector("#whatsapp-confirm-button");
const whatsappNotice = document.querySelector("#whatsapp-confirmation-notice");
const demoDepositAmount = document.querySelector("#demo-deposit-amount");
const demoPaymentInstructions = document.querySelector("#demo-payment-instructions");
const demoDepositButton = document.querySelector("#demo-deposit-button");
const savedOrder = JSON.parse(sessionStorage.getItem("barberia-order") || "[]");
const savedBooking = JSON.parse(sessionStorage.getItem("barberia-booking") || "null");
const paymentMethod = sessionStorage.getItem("barberia-payment-method");
const demoDepositKey = "barberia-demo-deposit-confirmed";

const formatPrice = (price) => `$${new Intl.NumberFormat("es-CO").format(price)}`;

if (savedOrder.length === 0 || !savedBooking || !["Tarjeta de crédito", "Nequi", "Efectivo"].includes(paymentMethod)) {
  const destination = savedOrder.length === 0 ? "index.html#servicios" : !savedBooking ? "reserva.html" : "pago.html";
  window.location.replace(destination);
} else {
  const total = savedOrder.reduce((sum, [, item]) => sum + item.price, 0);
  const deposit = Math.ceil(total * 0.3);
  const lines = savedOrder.map(([, item]) => {
    const duration = item.duration ? ` (${item.duration})` : "";
    return `• ${item.name} — ${formatPrice(item.price)} COP${duration}`;
  });
  const appointmentDate = new Date(`${savedBooking.date}T12:00:00`);
  const dateText = new Intl.DateTimeFormat("es-CO", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric"
  }).format(appointmentDate);
  const message = [
    "Hola, quiero solicitar esta cita en Barbería Camilo:",
    ...lines,
    `Fecha solicitada: ${dateText}.`,
    `Hora solicitada: ${savedBooking.time}.`,
    `Nombre: ${savedBooking.customerName}.`,
    `Total: ${formatPrice(total)} COP.`,
    `Abono de prueba del 30%: ${formatPrice(deposit)} COP por ${paymentMethod}.`,
    `Saldo del 70% al finalizar: ${formatPrice(total - deposit)} COP.`,
    "Esta es una solicitud de prueba; el pago no ha sido verificado.",
    "Por favor, confirma la disponibilidad de la fecha y hora."
  ].join("\n");
  whatsappButton.href = `https://wa.me/573163115300?text=${encodeURIComponent(message)}`;
  demoDepositAmount.textContent = `${formatPrice(deposit)} COP`;
  demoPaymentInstructions.textContent = paymentMethod === "Nequi"
    ? "Método elegido: Nequi de prueba (000 000 0000). No realices transferencias; solo simula el abono para revisar el flujo."
    : paymentMethod === "Efectivo"
      ? "Método elegido: efectivo. En una reserva real, el abono se entregaría en el local; aquí solo se simula."
      : "Método elegido: tarjeta. El cobro con tarjeta está desactivado; aquí solo se simula.";

  const appointmentLine = document.createElement("p");
  appointmentLine.className = "checkout-appointment-line";
  appointmentLine.textContent = `${savedBooking.customerName} · ${dateText} a las ${savedBooking.time}`;
  const serviceList = document.createElement("ul");
  serviceList.className = "checkout-service-list";
  for (const [, item] of savedOrder) {
    const line = document.createElement("li");
    line.textContent = `${item.name}${item.duration ? ` · ${item.duration}` : ""} — ${formatPrice(item.price)}`;
    serviceList.append(line);
  }
  const totalLine = document.createElement("p");
  totalLine.className = "checkout-summary-total";
  totalLine.textContent = `Total: ${formatPrice(total)} COP · Abono requerido (30%): ${formatPrice(deposit)} COP`;
  confirmationSummary.append(appointmentLine, serviceList, totalLine);

  const revealWhatsApp = () => {
    whatsappButton.hidden = false;
    whatsappNotice.hidden = false;
    demoDepositButton.hidden = true;
    sessionStorage.setItem(demoDepositKey, "true");
  };

  demoDepositButton.addEventListener("click", () => {
    revealWhatsApp();
  });

  if (sessionStorage.getItem(demoDepositKey) === "true") {
    revealWhatsApp();
  }
}
