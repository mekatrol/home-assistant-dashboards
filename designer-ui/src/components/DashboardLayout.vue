<template>
  <div
    class="grid"
    :style="gridStyle()"
    ref="container"
  >
    <div
      v-for="(item, i) in gridItems"
      :key="i"
      :class="`item ${item.cssClass ?? ''}`"
      :style="`${gridItemStyle(item)}`"
    >
      <component
        v-if="item.componentName"
        :is="resolveComponent(item.componentName)"
        v-bind="{ ...item.props }"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, type Component } from 'vue';
import type { HassEntity } from 'home-assistant-js-websocket';
import RemoteComponent from '@/components/RemoteWebComponent.vue';
import TimeCard from '@/components/TimeCard.vue';
import StatusIconCard from '@/components/cards/StatusIconCard.vue';
import SwitchCard from '@/components/cards/SwitchCard.vue';

interface Props {
  name: string;
}

interface GridItem {
  componentName?: string; // An undefined component displays as an empty grid item
  props?: object;
  column: number;
  row: number;
  columnSpan: number;
  rowSpan: number;
  cssClass: string;
}

interface Layout {
  width: number;
  height: number;
  columns: number;
  rows: number;
}

const componentMap = {
  RemoteComponent,
  StatusIconCard,
  SwitchCard,
  TimeCard
} as const;

type ComponentName = keyof typeof componentMap;

defineProps<Props>();

const layout: Layout = {
  width: 800,
  height: 480,
  columns: 8,
  rows: 8
};

const defaultGridItem = (row: number, column: number): GridItem => {
  // The layout is rows then columns
  const item = {
    componentName: undefined,
    row: row,
    column: column,
    columnSpan: 1,
    rowSpan: 1,
    cssClass: '',
    props: {}
  };

  return item;
};

// Create the empty grid item arraay
const resolvedComponentCache: Record<string, Component> = {};
const gridItems = ref<GridItem[]>([]);

let giIndex = 0;

// gridItems.value[0] = defaultGridItem(1, 1);
// gridItems.value[0].componentName = 'RemoteComponent';
// gridItems.value[0].props = { name: 'date-time-web-component' };
// gridItems.value[0].columnSpan = 4;
gridItems.value[giIndex] = defaultGridItem(1, 2);
gridItems.value[giIndex].columnSpan = 6;
gridItems.value[giIndex].rowSpan = 2;
gridItems.value[giIndex].componentName = 'TimeCard';
giIndex++;

gridItems.value[giIndex] = defaultGridItem(1, 8);
gridItems.value[giIndex].rowSpan = 2;
gridItems.value[giIndex].componentName = 'StatusIconCard';
gridItems.value[giIndex].props = {
  entityId: 'sun.sun',
  iconOff: 'dark_mode',
  iconOn: 'wb_sunny',
  colorOn: '#f1e20f',
  colorOff: '#f7621e',
  class: 'sun',
  stateAction: (entity: HassEntity): boolean | undefined => {
    return entity.state === 'above_horizon';
  }
};
giIndex++;

gridItems.value[giIndex] = defaultGridItem(3, 7);
gridItems.value[giIndex].columnSpan = 2;
gridItems.value[giIndex].componentName = 'SwitchCard';
gridItems.value[giIndex].props = {
  entityId: 'switch.kitchen_light',
  iconOff: 'light',
  iconOn: 'light',
  colorOn: '#01a301',
  colorOff: '#838282'
};
giIndex++;

gridItems.value[giIndex] = defaultGridItem(3, 1);
gridItems.value[giIndex].columnSpan = 3;
gridItems.value[giIndex].componentName = 'SwitchCard';
gridItems.value[giIndex].props = {
  entityId: 'switch.clothes_line_light_op',
  iconOff: 'light',
  iconOn: 'light',
  colorOn: '#01a301',
  colorOff: '#838282'
};

const resolveComponent = (name: string): Component | null => {
  if (resolvedComponentCache[name]) {
    return resolvedComponentCache[name];
  }

  if (name in componentMap) {
    resolvedComponentCache[name] = componentMap[name as ComponentName];
    return resolvedComponentCache[name];
  }

  // Component not found
  return null;
};

const gridStyle = (): string => {
  const columns = `grid-template-columns: repeat(${layout.columns}, 1fr);`;
  const rows = `grid-template-rows: repeat(${layout.rows}, ${layout.height / layout.rows}px);`;

  return `width: 100%; max-width: ${layout.width}px; max-height: ${layout.height}px; ${columns} ${rows}`;
};

const gridItemStyle = (item: GridItem): string => {
  return `grid-column: ${item.column} / span ${item.columnSpan}; grid-row: ${item.row} / span ${item.rowSpan};`;
};

const container = ref<HTMLDivElement | null>(null);
</script>

<style scoped lang="css">
.grid {
  display: grid;
  gap: 10px;
  overflow: hidden;
}

.item {
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
