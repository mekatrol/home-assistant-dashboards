<template>
  <div
    class="grid"
    :style="gridStyle()"
  >
    <div
      v-for="(item, i) in gridItems"
      :key="i"
      :class="`item ${item.componentName ? '' : 'show-outline'} ${item.cssClass ?? ''}`"
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
import ToggleSwitch from '@/components/ToggleSwitch.vue';
import RemoteComponent from '@/components/RemoteWebComponent.vue';

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
  ToggleSwitch,
  RemoteComponent
} as const;

type ComponentName = keyof typeof componentMap;

defineProps<Props>();

const layout: Layout = {
  width: 800,
  height: 480,
  columns: 4,
  rows: 4
};

const defaultGridItem = (index: number): GridItem => {
  // The layout is rows then columns
  const item = {
    componentName: undefined,
    row: Math.floor(index / layout.rows) + 1,
    column: (index % layout.rows) + 1,
    columnSpan: 1,
    rowSpan: 1,
    cssClass: '',
    props: {}
  };

  return item;
};

// Create the empty grid item arraay
const resolvedComponentCache: Record<string, Component> = {};
const gridItems = ref<GridItem[]>(Array.from({ length: layout.columns * layout.rows }, (_, i) => defaultGridItem(i)));

gridItems.value[0].componentName = 'RemoteComponent';
gridItems.value[0].props = { name: 'custom-component', x: 23 };

gridItems.value[3].componentName = 'ToggleSwitch';
gridItems.value[4].componentName = 'ToggleSwitch';
gridItems.value[4].columnSpan = 4;
gridItems.value[4].props = { class: 'toggle3' };

gridItems.value[1].componentName = 'RemoteComponent';
gridItems.value[1].props = { name: 'date-time-web-component', x: 32 };
gridItems.value[1].columnSpan = 2;

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
</script>

<style scoped lang="css">
.grid {
  display: grid;
}

.item {
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.item.show-outline {
  outline: 1px dashed var(--clr-outline);
  outline-offset: -2px;
}
</style>
