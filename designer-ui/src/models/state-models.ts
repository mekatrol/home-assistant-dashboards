import type { HassEntity } from 'home-assistant-js-websocket';

// Action definition for callback to determine the state of an entity
export interface StateAction {
  // Return values:
  // undefined - entity invalid or offline
  // false - the state is off/false
  // true - the state is on/true
  (entity: HassEntity): boolean | undefined;
}
