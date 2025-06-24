class DateTimeWebComponent extends HTMLElement {
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
          color: red;
          font-weight: bold;
        }
      </style>
      <p>This is the date time web component.</p>
    `;
  }

  set hass(hass) {
    console.log(`set hass: '${hass}'`);
  }

  setConfig(config) {
    console.log(`date time: '${config}'`);
  }
}

// Define the custom element
customElements.define('cwc-date-time-web-component', DateTimeWebComponent);
