import { getAuth, onAuthStateChanged, User } from "firebase/auth";

interface AuthSyncOptions {
  onUserChange?: (user: User | null) => void;
  enableCookieSync?: boolean;
}

export class AuthSync {
  private auth = getAuth();
  private unsubscribe: (() => void) | null = null;

  constructor(private options: AuthSyncOptions = {}) {
    this.init();
  }

  private init() {
    this.unsubscribe = onAuthStateChanged(this.auth, async (user) => {
      if (this.options.enableCookieSync) {
        await this.syncWithServer(user);
      }

      this.options.onUserChange?.(user);
    });
  }

  private async syncWithServer(user: User | null) {
    try {
      if (user) {
        const idToken = await user.getIdToken();

        await fetch("/api/auth/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ idToken }),
        });
      } else {
        await fetch("/api/auth/logout", {
          method: "POST",
        });
      }
    } catch (error) {
      console.error("Failed to sync auth state with server:", error);
    }
  }

  public async refreshToken() {
    const user = this.auth.currentUser;
    if (user) {
      try {
        const idToken = await user.getIdToken(true);

        await fetch("/api/auth/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ idToken }),
        });

        return idToken;
      } catch (error) {
        console.error("Failed to refresh token:", error);
        return null;
      }
    }
    return null;
  }

  public destroy() {
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
    }
  }
}

let authSyncInstance: AuthSync | null = null;

export function initAuthSync(options: AuthSyncOptions = {}) {
  if (typeof window !== "undefined" && !authSyncInstance) {
    authSyncInstance = new AuthSync({
      ...options,
      enableCookieSync: true,
    });
  }
  return authSyncInstance;
}

export function getAuthSync() {
  return authSyncInstance;
}

export function destroyAuthSync() {
  if (authSyncInstance) {
    authSyncInstance.destroy();
    authSyncInstance = null;
  }
}
