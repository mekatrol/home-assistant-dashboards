import { useAppStore } from '@/stores/app-store';
import { getHomeAssistantToken } from './api';
import { getWebSocketBaseUrl } from './url';

/*********************************************************************
 * See: https://github.com/home-assistant/home-assistant-js-websocket
 *********************************************************************/

import {
  Auth,
  createConnection,
  subscribeEntities,
  Connection,
  ERR_INVALID_AUTH,
  createLongLivedTokenAuth,
  ERR_CANNOT_CONNECT,
  ERR_CONNECTION_LOST,
  ERR_HASS_HOST_REQUIRED,
  ERR_INVALID_HTTPS_TO_HTTP,
  type HassEntities,
  type HassEntity,
  callService
} from 'home-assistant-js-websocket';
import { updateHassEntities } from './web-component';

const url = getWebSocketBaseUrl();
let connection: Connection | undefined = undefined;

const errorToMessage = (err: unknown): string => {
  switch (err) {
    case ERR_CANNOT_CONNECT:
      return 'ERR_CANNOT_CONNECT';
    case ERR_INVALID_AUTH:
      return 'ERR_INVALID_AUTH';
    case ERR_CONNECTION_LOST:
      return 'ERR_CONNECTION_LOST';
    case ERR_HASS_HOST_REQUIRED:
      return 'ERR_HASS_HOST_REQUIRED';
    case ERR_INVALID_HTTPS_TO_HTTP:
      return 'ERR_INVALID_HTTPS_TO_HTTP';
    default:
      return 'Unknown';
  }
};

export const homeAssistantConnect = async (container: HTMLElement): Promise<void> => {
  try {
    const appStore = useAppStore();
    appStore.incrementBusy();

    // Get long lived token from the server
    const token = await getHomeAssistantToken();

    if (token === undefined) {
      appStore.decrementBusy();
      // No token then don't connect
      return;
    }

    const auth: Auth = createLongLivedTokenAuth(url, token);

    connection = await createConnection({ auth });

    subscribeEntities(connection, (entities: HassEntities) => {
      appStore.setHomeAssistantEntities(entities);
      updateHassEntities(container, entities);
      appStore.decrementBusy();
    });
  } catch (err: unknown) {
    throw Error(`Connection to home assistant failed with: '${errorToMessage(err)}'`);
  }
};

export const homeAssistantClose = (): void => {
  connection?.close();
  connection = undefined;
};

export const toggleEntity = async (entity: HassEntity): Promise<void> => {
  if (!connection) {
    // Can't toggle entity if not connected
    return;
  }

  // Get entity domain and service
  const domain = entity.entity_id.split('.')[0];
  const service = entity.state === 'on' ? 'turn_off' : 'turn_on';

  await callService(connection, domain, service, {
    entity_id: entity.entity_id
  });
};
