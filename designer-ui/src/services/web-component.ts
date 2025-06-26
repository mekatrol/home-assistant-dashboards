import type { HassEntities } from 'home-assistant-js-websocket';
import { getApiBaseUrl } from './url';
import { nextTick } from 'vue';
import { useAppStore } from '@/stores/app-store';

export const CWC_PREFIX = 'cwc-';

const apiBaseUrl = getApiBaseUrl();

export interface CwcWebComponent {
  hass: HassEntities;
  config: string;
}

const setComponentEntities = (component: Element, entities: HassEntities): void => {
  try {
    // Check if the component has the 'set hass' property
    const proto = Object.getPrototypeOf(component);
    const hasHassSetter = Object.getOwnPropertyDescriptor(proto, 'hass')?.set !== undefined;

    if (hasHassSetter) {
      // Get element with intersection of 'set hass' property
      const c = component as HTMLElement & { hass?: HassEntities };

      // Set entitie
      c.hass = entities;
    }
  } catch (_err) {
    /* do nothing here */
  }
};

const loadScriptFromUrl = async (url: string): Promise<void> => {
  // If the script is already loaded, return immediately
  if (document.querySelector(`script[src="${url}"]`)) {
    return;
  }

  const script = document.createElement('script');
  script.src = url;

  // Wait for the script to load or error
  await new Promise<void>((resolve, reject) => {
    script.onload = (): void => resolve();
    script.onerror = (): void => reject(new Error(`Failed to load ${url}`));
    document.head.appendChild(script);
  });
};

export const loadWebComponent = async (name: string, finishedLoading: (hadError: boolean) => void): Promise<void> => {
  try {
    const url = `${apiBaseUrl}/components/${name}`;
    const componentName = `${CWC_PREFIX}${name}`;

    let loadError = false;
    try {
      await loadScriptFromUrl(url);
    } catch (e) {
      console.error(e);
      loadError = true;
      return;
    } finally {
      finishedLoading(loadError);
    }

    await customElements.whenDefined(componentName);

    // Wait for the DOM to update
    await nextTick();

    // Get the element with the specified name
    const el = document.querySelector(componentName) as HTMLElement & { setConfig?: (s: string) => void };

    // If it has a set config then set config value
    if (el?.setConfig) {
      try {
        // Set the element config
        el.setConfig('{}');

        // Set the element entities (if they exist)
        const entities = useAppStore().homeAssistantEntities;
        if (entities) {
          setComponentEntities(el, entities);
        }
      } catch (e) {
        console.error(e);
      }
    }
  } catch (e) {
    console.error(e);
  }
};

export const updateHassEntities = (container: Element, entities: HassEntities | undefined): void => {
  if (entities && container) {
    const cwcComponents = Array.from(container.querySelectorAll('*')).filter((el) => el.tagName.toLowerCase().startsWith(CWC_PREFIX));

    cwcComponents.forEach((component) => {
      setComponentEntities(component, entities);
    });
  }
};
