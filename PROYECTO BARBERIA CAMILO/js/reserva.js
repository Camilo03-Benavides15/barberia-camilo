const bookingSummary = document.querySelector("#booking-summary");
const bookingForm = document.querySelector("#booking-form");
const bookingError = document.querySelector("#booking-error");
const dateInput = document.querySelector("#appointment-date");
const timeInput = document.querySelector("#appointment-time");
const savedOrder = JSON.parse(sessionStorage.getItem("barberia-order") || "[]");

const formatPrice = (price) => `$${new Intl.NumberFormat("es-CO").format(price)}`;

if (savedOrder.length === 0) {
  window.location.replace("index.html#servicios");
} else {
  const total = savedOrder.reduce((sum, [, item]) => sum + item.price, 0);
  const serviceList = document.createElement("ul");
  serviceList.className = "checkout-service-list";
  for (const [, item] of savedOrder) {
    const line = document.createElement("li");
    line.textContent = `${item.name}${item.duration ? ` · ${item.duration}` : ""} — ${formatPrice(item.price)}`;
    serviceList.append(line);
  }
  const totalLine = document.createElement("p");
  totalLine.className = "checkout-summary-total";
  totalLine.textContent = `Total de servicios: ${formatPrice(total)} COP`;
  bookingSummary.append(serviceList, totalLine);

  const localDate = new Date();
  const localDateString = [
    localDate.getFullYear(),
    String(localDate.getMonth() + 1).padStart(2, "0"),
    String(localDate.getDate()).padStart(2, "0")
  ].join("-");
  dateInput.min = localDateString;
}

const showDateOptions = () => {
  timeInput.replaceChildren();
  const chosenDate = new Date(`${dateInput.value}T12:00:00`);
  const day = chosenDate.getDay();
  const placeholder = document.createElement("option");
  placeholder.value = "";
  placeholder.textContent = "Selecciona una hora";
  timeInput.append(placeholder);

  if (!dateInput.value || day === 0) {
    timeInput.disabled = true;
    placeholder.textContent = day === 0 ? "Los domingos no atendemos" : "Primero elige la fecha";
    return;
  }

  const openingMinutes = 9 * 60;
  const closingMinutes = day === 6 ? 12 * 60 : 19 * 60;
  const lastStartMinutes = closingMinutes - 60;
  for (let minutes = openingMinutes; minutes <= lastStartMinutes; minutes += 45) {
    const hour = String(Math.floor(minutes / 60)).padStart(2, "0");
    const minute = String(minutes % 60).padStart(2, "0");
    const value = `${hour}:${minute}`;
    const option = document.createElement("option");
    option.value = value;
    option.textContent = new Intl.DateTimeFormat("es-CO", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true
    }).format(new Date(`2000-01-01T${value}:00`));
    timeInput.append(option);
  }
  timeInput.disabled = false;
};

dateInput.addEventListener("change", showDateOptions);

bookingForm.addEventListener("submit", (event) => {
  event.preventDefault();
  bookingError.hidden = true;
  const formData = new FormData(bookingForm);
  const chosenDate = new Date(`${formData.get("date")}T12:00:00`);
  if (chosenDate.getDay() === 0) {
    bookingError.textContent = "La barbería no atiende los domingos. Elige otro día.";
    bookingError.hidden = false;
    return;
  }

  const booking = {
    customerName: String(formData.get("customerName")).trim(),
    date: String(formData.get("date")),
    time: String(formData.get("time"))
  };
  sessionStorage.setItem("barberia-booking", JSON.stringify(booking));
  window.location.href = "pago.html";
});
