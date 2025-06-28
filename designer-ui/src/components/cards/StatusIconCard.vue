<template>
  <div class="spacer spacer-left">
    <span
      v-if="icon"
      :class="`material-symbols-outlined ${cssClass}`"
      :style="`color: ${color};`"
      >{{ icon }}</span
    >
  </div>
</template>

<script setup lang="ts">
import type { StateAction } from '@/models/state-models';
import { useAppStore } from '@/stores/app-store';
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

const state = ref<boolean | undefined>(undefined);

const color = computed(() => {
  return state.value ? props.colorOn : props.colorOff;
});

const icon = computed(() => {
  return state.value ? props.iconOn : props.iconOff;
});

const cssClass = computed((): string => {
  return state.value ? 'on' : 'off';
});

const appStore = useAppStore();
watch(
  () => appStore.homeAssistantEntities,
  (entities) => {
    if (!entities) {
      state.value = undefined;
      return;
    }

    const entity = entities[props.entityId];

    if (entity) {
      let status: boolean | undefined = entity.state === 'on';
      if (props.stateAction) {
        status = props.stateAction(entity);
      }

      state.value = status ?? false;
    }
  },
  { immediate: true }
);
</script>

<style lang="css" scoped>
.spacer {
  min-width: 80px;
}

.spacer-left,
.spacer-right {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-content: center;
}

.spacer-left span,
.spacer-right span {
  text-align: center;
  font-size: 4rem;
}

.spacer-left span.off {
  text-align: center;
  font-size: 4rem;
}

.spacer-left span.on {
  text-align: center;
  font-size: 4rem;
}
</style>
