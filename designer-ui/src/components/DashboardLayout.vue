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
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineAsyncComponent, type Component } from 'vue';
import { getApiBaseUrl } from '@/services/url';
import ToggleSwitch from '@/components/ToggleSwitch.vue';

interface Props {
  name: string;
}

interface GridItem {
  componentName?: string; // An undefined component displays as an empty grid item
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
  ToggleSwitch
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
    cssClass: ''
  };

  return item;
};

// Create the empty grid item arraay
const gridItems: GridItem[] = Array.from({ length: layout.columns * layout.rows }, (_, i) => defaultGridItem(i));

gridItems[0].componentName = 'ToggleSwitch';

const apiBaseUrl = getApiBaseUrl();

const resolvedComponentCache: Record<string, Component> = {};

const resolveComponent = (name: string): Component | null => {
  if (resolvedComponentCache[name]) {
    return resolvedComponentCache[name];
  }

  if (name in componentMap) {
    resolvedComponentCache[name] = componentMap[name as ComponentName];
    return resolvedComponentCache[name];
  }

  const url = `${apiBaseUrl}/components/${name}`;

  // Dynamically create an async component (Vue will lazy-load it)
  const asyncComp = defineAsyncComponent({
    loader: () => import(/* @vite-ignore */ url).then((mod) => mod.default),
    delay: 200,
    timeout: 5000,
    errorComponent: {
      template: `<div style="color: red;">Component ${name} load failed</div>`
    },
    loadingComponent: {
      template: `<div>Loading ${name}...</div>`
    }
  });

  resolvedComponentCache[name] = asyncComp;
  return asyncComp;
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
