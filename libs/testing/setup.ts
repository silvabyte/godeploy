import { GlobalWindow } from "happy-dom";

// Set up happy-dom for tests that need DOM APIs
const window = new GlobalWindow();
global.window = window as unknown as Window & typeof globalThis;
global.document = window.document;
global.navigator = window.navigator;
global.localStorage = window.localStorage;
global.sessionStorage = window.sessionStorage;
global.HTMLElement = window.HTMLElement;
global.customElements = window.customElements;

