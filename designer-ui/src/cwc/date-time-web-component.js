const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

class DateTimeWebComponent extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.timer = null;
    this.entities = null;
  }

  connectedCallback() {
    this.render();
    this.startTimer();
  }

  disconnectedCallback() {
    this.stopTimer();
  }

  startTimer() {
    this.updateTime();
    this.timer = setInterval(() => this.updateTime(), 1000);
  }

  stopTimer() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }
  getMeridiem(dt) {
    return dt.getHours() >= 12 ? 'PM' : 'AM';
  }

  getHours12Hour(dt) {
    const hrs24 = dt.getHours();
    return hrs24 > 12 ? hrs24 - 12 : hrs24;
  }

  getZeroPadded(v) {
    return `${v}`.padStart(2, '0');
  }

  getTimeWithMeridiem(dateTime, withSeconds) {
    const dt = dateTime ?? new Date();
    return this.getHours12Hour(dt) + ':' + this.getZeroPadded(dt.getMinutes()) + (withSeconds ? `:${this.getZeroPadded(dt.getSeconds())}` : '') + ' ' + this.getMeridiem(dt);
  }

  getShortDateWithDay(dateTime) {
    const dt = dateTime ?? new Date();
    return daysOfWeek[dt.getDay()].toLocaleUpperCase() + ' ' + dt.getDate() + ' ' + months[dt.getMonth()].toLocaleUpperCase() + ' ' + dt.getFullYear();
  }

  updateTime() {
    const now = new Date();
    const timeDisplay = this.getTimeWithMeridiem(now, false);
    const dateDisplay = this.getShortDateWithDay(now);

    const dateEl = this.shadowRoot.querySelector('#date');
    if (dateEl) {
      dateEl.textContent = dateDisplay;
    }

    const timeEl = this.shadowRoot.querySelector('#time');
    if (timeEl) {
      timeEl.textContent = timeDisplay;
    }

    if (this.entities) {
      const sunEntity = this.entities['sun.sun'];
      if (sunEntity && sunEntity.attributes) {
        const sunrise = sunEntity.attributes['next_dawn'];
        const sunriseEl = this.shadowRoot.querySelector('#sunrise');

        if (sunrise && sunriseEl) {
          sunriseEl.textContent = this.getTimeWithMeridiem(new Date(sunrise), false);
        }

        const sunset = sunEntity.attributes['next_dusk'];
        const sunsetEl = this.shadowRoot.querySelector('#sunset');
        if (sunset && sunsetEl) {
          sunsetEl.textContent = this.getTimeWithMeridiem(new Date(sunset), false);
        }
      }
    }
  }

  render() {
    this.innerHTML = `
      <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400..900&display=swap" rel="stylesheet">
      <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined" rel="stylesheet">    
    `;

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          height: 100%;
          --clr-time: #ff0000;
          --clr-date: #55ff88;
          --clr-sunrise: #f1e20f;
          --clr-sunset: #f7621e;
        }

        p {
          margin: 0;
          padding: 0;
        }

        .icon {
          font-family: 'Material Symbols Outlined';
          font-weight: normal;
          font-style: normal;
          font-size: 24px;
          line-height: 1;
          letter-spacing: normal;
          text-transform: none;
          display: inline-block;
          white-space: nowrap;
          direction: ltr;

          /* Required for variable icon fonts */
          font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 48;
          margin-left: 8px;
        }

        .time-card {
          display: flex;
          flex-direction: column;
          gap: 0;
          align-items: center;
          font-family: 'Orbitron';
          width: 100%;

          @font-face {
            font-family: 'Orbitron';
            font-style: normal;
            font-weight: 400 900;
            font-display: swap;
            src: url(https://fonts.gstatic.com/s/orbitron/v31/yMJRMIlzdpvBhQQL_Qq7dy0.woff2) format('woff2');
            unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
          }

          .time {
            font-size: 5rem;
            color: var(--clr-time);
          }

          .date,
          .sunrise,
          .sunset {
            height: 100%;
            display: flex;
            flex-direction: row;
            flex-wrap: wrap;
            gap: 5px;
            align-content: center;
            justify-content: center;
            align-items: center;
            font-size: 1.3rem;
          }

          .date {
            color: var(--clr-date);
          }

          .sunrise {
            color: var(--clr-sunrise);
          }

          .sunset {
            color: var(--clr-sunset);
          }
        }    
      </style>

      <div class="time-card">
        <p id="time" class="time"></p>
        <div style="display: flex; flex-direction: row; gap: 30px">
          <div
            class="sunrise"
          >
            <span class="icon">sunny</span>
            <span id="sunrise"></span>
          </div>
          <div class="date">
            <span class="icon">calendar_month</span><span id="date"></span>
          </div>
          <div
            class="sunset"
          >
            <span class="icon">routine</span>
            <span id="sunset"></span>
          </div>
        </div>
      </div>
    `;
  }

  set hass(entities) {
    this.entities = entities;
  }

  setConfig(_config) {
    // optional: for Home Assistant integration
  }
}

customElements.define('cwc-date-time-web-component', DateTimeWebComponent);
