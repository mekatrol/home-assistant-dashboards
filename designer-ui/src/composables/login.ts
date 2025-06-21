import { useAuthService } from '@/services/authService';
import { ApiErrorType } from '@/services/api';
import { ensureRelativeUrl } from '@/services/url';
import { useAppStore } from '@/stores/app-store';
import { useRoute, useRouter } from 'vue-router';

export interface LoginLogout {
  login: (userName: string, password: string, rememberMe: boolean) => Promise<boolean>;
  logout: (logOutOfServer: boolean) => void;
}

export const useLogin = (): LoginLogout => {
  const appStore = useAppStore();
  const authService = useAuthService();
  const router = useRouter();
  const route = useRoute();

  const login = async (userName: string, password: string, rememberMe: boolean): Promise<boolean> => {
    appStore.incrementBusy();
    try {
      // Get an access token for the user
      const token = await authService.login(userName, password, (err) => {
        if (err.errorType === ApiErrorType.Unauthorized) {
          return true;
        }

        return false;
      });

      // Save the access token to the store and set remember me state
      appStore.setUserToken(token, rememberMe);

      if (token) {
        // Refresh user
        await authService.updateUser();
      }

      // Redirect user back to where they navigated from (or home if unknown)
      if (route.query['return']) {
        // If a return route specified then return user to specified route
        const path = ensureRelativeUrl(decodeURIComponent(route.query['return'] as string) ?? '');

        router.push({ path: path });
      } else {
        // If no return route specified then return user to home
        router.push({ name: 'home' });
      }
      return !!token;
    } catch (_) {
      return false;
    } finally {
      appStore.decrementBusy();
    }
  };

  const logout = async (logOutOfServer: boolean): Promise<void> => {
    appStore.incrementBusy();

    if (logOutOfServer) {
      // Logout from server
      await authService.logout();
    }

    // Navigate to current route so that it triggers any route guards after signing out
    router.go(0);

    // NOTE: no need to call 'appStore.decrementBusy' because the page is being reloaded
  };

  return { login, logout };
};
