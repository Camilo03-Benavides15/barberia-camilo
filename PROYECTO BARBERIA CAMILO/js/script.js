const menuToggle = document.querySelector(".menu-toggle");
const siteNav = document.querySelector("#site-nav");
const year = document.querySelector("#year");

year.textContent = new Date().getFullYear();

menuToggle.addEventListener("click", () => {
  const isExpanded = menuToggle.getAttribute("aria-expanded") === "true";
  menuToggle.setAttribute("aria-expanded", String(!isExpanded));
  menuToggle.setAttribute("aria-label", isExpanded ? "Abrir menú" : "Cerrar menú");
  siteNav.classList.toggle("is-open", !isExpanded);
});

siteNav.addEventListener("click", (event) => {
  if (event.target.closest("a")) {
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Abrir menú");
    siteNav.classList.remove("is-open");
  }
});

const treatmentOptions = document.querySelectorAll(".treatment-options");
const treatmentOptionToggles = document.querySelectorAll(".treatment-options-toggle");
const maskOptionsAdd = document.querySelector("#mask-options-add");
const maskCart = document.querySelector("#mask-cart");
const maskCartItems = document.querySelector("#mask-cart-items");
const maskCartTotal = document.querySelector("#mask-cart-total");
const maskBookingButton = document.querySelector("#mask-booking-button");
const orderItems = new Map(JSON.parse(sessionStorage.getItem("barberia-order") || "[]"));

const formatPrice = (price) => `$${new Intl.NumberFormat("es-CO").format(price)}`;

const setTreatmentOptionsExpanded = (isExpanded) => {
  for (const toggle of treatmentOptionToggles) {
    const panel = document.querySelector(`#${toggle.dataset.optionsToggle}`);
    const shouldExpand = isExpanded;
    toggle.setAttribute("aria-expanded", String(shouldExpand));
    panel.hidden = !shouldExpand;
    toggle.innerHTML = shouldExpand
      ? `${toggle.dataset.closeText} <span aria-hidden="true">−</span>`
      : `${toggle.dataset.openText} <span aria-hidden="true">＋</span>`;
  }
  maskOptionsAdd.setAttribute("aria-expanded", "false");
  maskOptionsAdd.textContent = isExpanded ? "Listo" : "＋ Agregar más servicios";
};

const updateOrderCart = () => {
  const items = [...orderItems.values()];
  const total = items.reduce((sum, item) => sum + item.price, 0);

  maskCartItems.replaceChildren();
  for (const item of items) {
    const cartLine = document.createElement("li");
    const name = document.createElement("span");
    const price = document.createElement("strong");
    const removeButton = document.createElement("button");

    name.textContent = item.duration ? `${item.name} · ${item.duration}` : item.name;
    price.textContent = formatPrice(item.price);
    removeButton.type = "button";
    removeButton.className = "mask-remove-item";
    removeButton.dataset.name = item.name;
    removeButton.setAttribute("aria-label", `Quitar ${item.name} del pedido`);
    removeButton.textContent = "×";

    cartLine.append(name, price, removeButton);
    maskCartItems.append(cartLine);
  }

  maskCartTotal.textContent = formatPrice(total);
  maskCart.hidden = items.length === 0;
  maskBookingButton.hidden = items.length === 0;
  sessionStorage.setItem("barberia-order", JSON.stringify([...orderItems]));
  for (const button of document.querySelectorAll(".service-add-button")) {
    const isAdded = orderItems.has(button.dataset.name);
    button.textContent = isAdded ? "Agregado al pedido ✓" : "＋ Agregar al pedido";
    button.setAttribute("aria-pressed", String(isAdded));
  }
  maskBookingButton.href = "reserva.html";
};

for (const input of document.querySelectorAll(".treatment-options input[type=\"checkbox\"]")) {
  input.checked = orderItems.has(input.value);
}

updateOrderCart();

for (const toggle of treatmentOptionToggles) {
  toggle.addEventListener("click", () => {
    const isExpanded = toggle.getAttribute("aria-expanded") === "true";
    for (const optionToggle of treatmentOptionToggles) {
      const panel = document.querySelector(`#${optionToggle.dataset.optionsToggle}`);
      const shouldExpand = optionToggle === toggle ? !isExpanded : false;
      optionToggle.setAttribute("aria-expanded", String(shouldExpand));
      panel.hidden = !shouldExpand;
      optionToggle.innerHTML = shouldExpand
        ? `${optionToggle.dataset.closeText} <span aria-hidden="true">−</span>`
        : `${optionToggle.dataset.openText} <span aria-hidden="true">＋</span>`;
    }
    maskOptionsAdd.setAttribute("aria-expanded", "false");
    maskOptionsAdd.textContent = "＋ Agregar más servicios";
  });
}

maskOptionsAdd.addEventListener("click", () => {
  const panelsAreExpanded = [...treatmentOptionToggles]
    .some((toggle) => toggle.getAttribute("aria-expanded") === "true");
  setTreatmentOptionsExpanded(!panelsAreExpanded);
  if (panelsAreExpanded) {
    maskOptionsAdd.textContent = "＋ Agregar más servicios";
  } else {
    maskOptionsAdd.textContent = "Listo";
    document.querySelector("#mask-options-panel").scrollIntoView({ behavior: "smooth", block: "start" });
  }
});

document.querySelector(".service-grid").addEventListener("click", (event) => {
  const button = event.target.closest(".service-add-button");
  if (!button) {
    return;
  }

  const { name } = button.dataset;
  if (orderItems.has(name)) {
    return;
  }

  orderItems.set(name, { name, price: Number(button.dataset.price), kind: "service" });
  updateOrderCart();
});

for (const options of treatmentOptions) {
  options.addEventListener("change", (event) => {
    if (!event.target.matches('input[type="checkbox"]')) {
      return;
    }

    if (event.target.checked) {
      orderItems.set(event.target.value, {
        name: event.target.value,
        price: Number(event.target.dataset.price),
        duration: event.target.dataset.duration,
        kind: event.target.name === "mask-treatment" ? "mask" : "massage"
      });
      for (const toggle of treatmentOptionToggles) {
        const panel = document.querySelector(`#${toggle.dataset.optionsToggle}`);
        toggle.setAttribute("aria-expanded", "false");
        toggle.innerHTML = `${toggle.dataset.openText} <span aria-hidden="true">＋</span>`;
        panel.hidden = true;
      }
      maskOptionsAdd.setAttribute("aria-expanded", "false");
      maskOptionsAdd.textContent = "＋ Agregar más servicios";
    } else {
      orderItems.delete(event.target.value);
    }
    updateOrderCart();
  });
}

maskCartItems.addEventListener("click", (event) => {
  const removeButton = event.target.closest(".mask-remove-item");
  if (!removeButton) {
    return;
  }

  const itemName = removeButton.dataset.name;
  const option = [...document.querySelectorAll(".treatment-options input[type=\"checkbox\"]")]
    .find((input) => input.value === itemName);

  if (option) {
    option.checked = false;
  }

  orderItems.delete(itemName);
  updateOrderCart();
});
