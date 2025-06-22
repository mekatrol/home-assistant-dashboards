import { useRoute } from 'vue-router';

export interface RouteHelper {
  urlPathParts: () => string[];
}

export const useRouteHelper = (): RouteHelper => {
  const urlPathParts = (): string[] => {
    const route = useRoute();
    const parts = route.path.split('/').filter(Boolean); // remove empty strings
    return parts.length > 0 ? parts : [];
  };

  return {
    urlPathParts
  };
};
