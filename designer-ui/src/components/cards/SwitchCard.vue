<template>
  <button
    :class="`switch`"
    :style="style"
    @click="toggleSwitch"
    @mousedown="onMouseDown"
    @mouseup="onMouseUp"
    @mouseleave="onMouseUp"
  >
    <span
      v-if="icon"
      :class="`material-symbols-outlined ${cssClass}`"
      >{{ icon }}</span
    >
    <span>{{ friendlyName }}</span>
  </button>
</template>

<script setup lang="ts">
import type { StateAction } from '@/models/state-models';
import { toggleEntity } from '@/services/home-assistant';
import { useAppStore } from '@/stores/app-store';
import { type HassEntity } from 'home-assistant-js-websocket';
import { computed, ref, watch } from 'vue';

interface Props {
  entityId: string;
  iconOff: string;
  iconOn: string;
  colorOff?: string;
  colorOn?: string;
  stateAction?: StateAction;
}

const props = withDefaults(defineProps<Props>(), {
  colorOff: '#838282',
  colorOn: '#01a301'
});

const appStore = useAppStore();

const entity = ref<HassEntity | undefined>(undefined);
const state = ref<boolean | undefined>(undefined);
const friendlyName = ref<string>(props.entityId);
const isActive = ref(false);

const color = computed(() => {
  return state.value ? props.colorOn : props.colorOff;
});

const icon = computed(() => {
  return state.value ? props.iconOn : props.iconOff;
});

const cssClass = computed((): string => {
  return state.value ? 'on' : 'off';
});

const style = computed((): string => {
  const isActiveColor = 'outline-color: black; background-color: white; color: black';
  const notActiveColor = `outline-color: ${color.value}; background-color: inherit; color: ${color.value};`;

  return isActive.value ? isActiveColor : notActiveColor;
});

const toggleSwitch = async (): Promise<void> => {
  if (!entity.value) {
    return;
  }

  await toggleEntity(entity.value);
};

const onMouseDown = (): void => {
  isActive.value = true;
};
const onMouseUp = (): void => {
  isActive.value = false;
};

watch(
  () => appStore.homeAssistantEntities,
  (entities) => {
    if (!entities) {
      state.value = undefined;
      return;
    }

    entity.value = entities[props.entityId];

    if (!entity.value) {
      state.value = false;
      friendlyName.value = props.entityId;
      return;
    }

    let status: boolean | undefined = entity.value.state === 'on';
    if (props.stateAction) {
      status = props.stateAction(entity.value);
    }

    state.value = status ?? false;
    friendlyName.value = entity.value.attributes['friendly_name'] ?? props.entityId;
  },
  { immediate: true }
);
</script>

<style lang="css" scoped>
button.switch {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-content: center;
  align-items: center;
  gap: 0.2rem;
  outline: 1px solid;
  outline-offset: -2px;
  padding: 1rem;
  border-radius: 5px;
  border: none;
  background-color: inherit;
  cursor: pointer;
}

.switch span {
  text-align: center;
  font-size: 1.1rem;
}

.switch span.material-symbols-outlined {
  font-size: 2rem;
}
</style>
