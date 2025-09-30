import React from "react";
import { createRoot, Root } from "react-dom/client";
import "./index.css";
import { ChatWidget } from "./components";

export type WidgetProps = Record<string, unknown>;

let root: Root | null = null;
let hostEl: HTMLElement | null = null;

function createHost(container?: HTMLElement | null): HTMLElement {
  if (container) return container;
  const el = document.createElement("div");
  el.id = `queryon-widget-host-${Date.now()}`;
  document.body.appendChild(el);
  return el;
}

export function mount(container?: HTMLElement | null, props: WidgetProps = {}): void {
  if (root) {
    unmount();
  }

  hostEl = createHost(container);

  let shadowHost: ShadowRoot | HTMLElement;
  if (hostEl.attachShadow) {
    shadowHost = hostEl.shadowRoot ?? hostEl.attachShadow({ mode: "open" });
  } else {
    shadowHost = hostEl;
  }

  const mountPoint = document.createElement("div");
  mountPoint.id = "queryon-widget-mount";
  shadowHost.appendChild(mountPoint);

  root = createRoot(mountPoint);
  root.render(React.createElement(ChatWidget, props));
}

export function unmount(): void {
  if (!root || !hostEl) return;
  try {
    root.unmount();
  } catch {
    // ignore
  }
  try {
    hostEl.remove();
  } catch {
    // ignore
  }
  root = null;
  hostEl = null;
}

const normalizeAttribute = (attribute: string): string =>
  attribute.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());

class ChatWidgetElement extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback(): void {
    const props: Record<string, string> = {};
    for (let i = 0; i < this.attributes.length; i++) {
      const a = this.attributes[i];
      props[normalizeAttribute(a.name)] = a.value;
    }
    mount(this, props);
  }

  disconnectedCallback(): void {
    unmount();
  }
}

if (typeof window !== "undefined" && !customElements.get("chat-widget")) {
  customElements.define("chat-widget", ChatWidgetElement);
}

const exported = {
  mount,
  unmount,
};
export default exported;
