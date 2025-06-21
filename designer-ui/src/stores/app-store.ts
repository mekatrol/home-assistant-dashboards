import { computed, ref } from 'vue';
import { defineStore } from 'pinia';
import { clearMessage, type MessageData } from '@/services/message';
import type { AccessToken, HomeAssistantToken, User } from '@/services/authService';
import { useLocalSessionJsonObject } from '@/composables/local-session';
import { type HassEntities } from 'home-assistant-js-websocket';

export const TOKEN_SESSION_KEY = 'token-session-key';

export const useAppStore = defineStore('app', () => {
  const isBusyCount = ref(0);
  const messageData = ref<MessageData | undefined>(undefined);
  const serverOnline = ref(false);
  const userToken = ref<AccessToken | undefined>(undefined);
  const user = ref<User | undefined>(undefined);
  const homeAssistantToken = ref<HomeAssistantToken | undefined>(undefined);
  const homeAssistantEntities = ref<HassEntities | undefined>(undefined);

  const isBusy = computed(() => isBusyCount.value > 0);

  const closeMessageOverlay = (): void => {
    clearMessage();
  };

  const incrementBusy = (): void => {
    isBusyCount.value++;
  };

  const decrementBusy = (): void => {
    isBusyCount.value--;

    if (isBusyCount.value < 0) {
      isBusyCount.value = 0;
    }
  };

  const setServerOnlineStatus = (status: boolean): void => {
    serverOnline.value = status;
  };

  const setUserToken = (token: AccessToken | undefined, rememberMe: boolean): void => {
    const persistSettings = useLocalSessionJsonObject<AccessToken>(TOKEN_SESSION_KEY);

    userToken.value = token;

    if (rememberMe && !!token) {
      persistSettings.setting = token;
    } else {
      persistSettings.remove();
    }
  };

  const setHomeAssistantToken = (token: HomeAssistantToken | undefined): void => {
    homeAssistantToken.value = token;
  };

  const setHomeAssistantEntities = (entities: HassEntities | undefined): void => {
    homeAssistantEntities.value = entities;
  };

  return {
    messageData,
    closeMessageOverlay,

    isBusy,
    incrementBusy,
    decrementBusy,

    serverOnline,
    setServerOnlineStatus,

    user,
    userToken,
    homeAssistantToken,
    setUserToken,
    setHomeAssistantToken,

    homeAssistantEntities,
    setHomeAssistantEntities
  };
});
