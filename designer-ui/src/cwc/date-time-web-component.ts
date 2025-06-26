import type { HassEntities } from 'home-assistant-js-websocket';
import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

@customElement('cwc-date-time-web-component')
export class DateTimeWebComponent extends LitElement {
  @state()
  private timeDisplay: string = '';

  @state()
  private dateDisplay: string = '';

  @state()
  private sunrise: string = '';

  @state()
  private sunset: string = '';

  private timer: ReturnType<typeof setInterval> | null = null;

  @property({ type: Object })
  entities: HassEntities | null = null;

  static styles = css`
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

    @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400..900&display=swap');
    @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined');

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
      display: inline-block;
      white-space: nowrap;
      direction: ltr;
      font-variation-settings:
        'FILL' 0,
        'wght' 400,
        'GRAD' 0,
        'opsz' 48;
      margin-left: 8px;
    }

    .time-card {
      display: flex;
      flex-direction: column;
      gap: 0;
      align-items: center;
      font-family: 'Orbitron';
      width: 100%;
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
  `;

  connectedCallback(): void {
    super.connectedCallback();
    this.updateTime();
    this.timer = setInterval(() => this.updateTime(), 1000);
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  private updateTime(): void {
    const now = new Date();
    this.timeDisplay = this.getTimeWithMeridiem(now, false);
    this.dateDisplay = this.getShortDateWithDay(now);

    const sunEntity = this.entities?.['sun.sun'];
    if (sunEntity?.attributes) {
      const nextDawn = sunEntity.attributes['next_dawn'];
      const nextDusk = sunEntity.attributes['next_dusk'];
      this.sunrise = nextDawn ? this.getTimeWithMeridiem(new Date(nextDawn), false) : '';
      this.sunset = nextDusk ? this.getTimeWithMeridiem(new Date(nextDusk), false) : '';
    }
  }

  private getMeridiem(dt: Date): string {
    return dt.getHours() >= 12 ? 'PM' : 'AM';
  }

  private getHours12Hour(dt: Date): number {
    const hrs24 = dt.getHours();
    return hrs24 > 12 ? hrs24 - 12 : hrs24;
  }

  private getZeroPadded(v: number): string {
    return `${v}`.padStart(2, '0');
  }

  private getTimeWithMeridiem(dateTime: Date, withSeconds: boolean): string {
    const dt = dateTime ?? new Date();
    return this.getHours12Hour(dt) + ':' + this.getZeroPadded(dt.getMinutes()) + (withSeconds ? `:${this.getZeroPadded(dt.getSeconds())}` : '') + ' ' + this.getMeridiem(dt);
  }

  private getShortDateWithDay(dateTime: Date): string {
    const dt = dateTime ?? new Date();
    return daysOfWeek[dt.getDay()].toUpperCase() + ' ' + dt.getDate() + ' ' + months[dt.getMonth()].toUpperCase() + ' ' + dt.getFullYear();
  }

  render(): unknown {
    return html`
      <div class="time-card">
        <p
          id="time"
          class="time"
        >
          ${this.timeDisplay}
        </p>
        <div style="display: flex; flex-direction: row; gap: 30px">
          <div class="sunrise">
            <span class="icon">sunny</span>
            <span id="sunrise">${this.sunrise}</span>
          </div>
          <div class="date">
            <span class="icon">calendar_month</span>
            <span id="date">${this.dateDisplay}</span>
          </div>
          <div class="sunset">
            <span class="icon">routine</span>
            <span id="sunset">${this.sunset}</span>
          </div>
        </div>
      </div>
    `;
  }
}
