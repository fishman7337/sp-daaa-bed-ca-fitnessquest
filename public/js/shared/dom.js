export function byId(id) {
  return document.getElementById(id);
}

export function clear(element) {
  if (!element) return;
  while (element.firstChild) {
    element.removeChild(element.firstChild);
  }
}

export function el(tag, options = {}, children = []) {
  const node = document.createElement(tag);
  const childList = Array.isArray(children) ? children : [children];

  for (const [key, value] of Object.entries(options)) {
    if (value === undefined || value === null) continue;
    if (key === "className") {
      node.className = value;
    } else if (key === "text") {
      node.textContent = value;
    } else if (key === "dataset") {
      for (const [dataKey, dataValue] of Object.entries(value)) {
        node.dataset[dataKey] = dataValue;
      }
    } else {
      node.setAttribute(key, value);
    }
  }

  for (const child of childList) {
    if (child === undefined || child === null) continue;
    node.appendChild(
      typeof child === "string" ? document.createTextNode(child) : child,
    );
  }

  return node;
}

export function setStatus(target, message, isError = false) {
  if (!target) return;
  target.textContent = message || "";
  target.classList.toggle("error", Boolean(isError));
}

export function card(title, lines = [], actions = []) {
  const body = [
    el("h3", { text: title }),
    ...lines.map((line) => el("p", { text: line })),
    actions.length ? el("div", { className: "actions" }, actions) : null,
  ];
  return el("article", { className: "card" }, body);
}

export function renderCards(
  target,
  items,
  renderer,
  emptyText = "Nothing to show yet.",
) {
  clear(target);
  if (!items.length) {
    target.appendChild(el("p", { text: emptyText }));
    return;
  }
  for (const item of items) {
    target.appendChild(renderer(item));
  }
}

export function renderTable(target, columns, rows) {
  clear(target);
  const table = el("table");
  const thead = el("thead");
  const tbody = el("tbody");
  thead.appendChild(
    el(
      "tr",
      {},
      columns.map((column) => el("th", { text: column.label })),
    ),
  );

  for (const row of rows) {
    tbody.appendChild(
      el(
        "tr",
        {},
        columns.map((column) =>
          el("td", { text: String(row[column.key] ?? "-") }),
        ),
      ),
    );
  }

  table.append(thead, tbody);
  target.appendChild(el("div", { className: "table-wrap" }, table));
}
