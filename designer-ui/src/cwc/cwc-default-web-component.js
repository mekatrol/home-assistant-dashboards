// my-web-component.js
class MyWebComponent extends HTMLElement {
  constructor() {
    super();
    // Attach a shadow root to isolate styles
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.render();
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        p {
          color: greenyellow;
          font-weight: bold;
        }
      </style>
      <p>This is the default web component placeholder.</p>
    `;
  }
}

// Define the custom element
customElements.define('cwc-default-web-component', MyWebComponent);
