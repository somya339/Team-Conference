import { BehaviorSubject, Observable } from 'rxjs';
import { map, distinctUntilChanged } from 'rxjs/operators';
import api from '../api/axios';
import { idbStorage } from '../storage/IdbStorageService';

export interface User {
  id: number;
  email: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  message: string;
}

class AuthService {
  private readonly STORAGE_KEYS = {
    USER: 'user',
    TOKEN: 'token',
  };

  private _state$ = new BehaviorSubject<AuthState>({
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
  });

  constructor() {
    this.initializeAuth();
  }

  private async initializeAuth(): Promise<void> {
    try {
      const [user, token] = await Promise.all([
        idbStorage.getUser(this.STORAGE_KEYS.USER),
        idbStorage.getSetting(this.STORAGE_KEYS.TOKEN),
      ]);

      if (user && token) {
        this.updateState({
          user,
          token,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
      } else {
        this.updateState({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        });
      }
    } catch (error) {
      console.error('Failed to initialize auth:', error);
      this.updateState({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: 'Failed to initialize authentication',
      });
    }
  }

  private updateState(updates: Partial<AuthState>): void {
    const currentState = this._state$.value;
    const newState = { ...currentState, ...updates };
    this._state$.next(newState);
  }

  // Observable getters
  get state$(): Observable<AuthState> {
    return this._state$.asObservable();
  }

  get user$(): Observable<User | null> {
    return this._state$.pipe(
      map(state => state.user),
      distinctUntilChanged()
    );
  }

  get token$(): Observable<string | null> {
    return this._state$.pipe(
      map(state => state.token),
      distinctUntilChanged()
    );
  }

  get isAuthenticated$(): Observable<boolean> {
    return this._state$.pipe(
      map(state => state.isAuthenticated),
      distinctUntilChanged()
    );
  }

  get isLoading$(): Observable<boolean> {
    return this._state$.pipe(
      map(state => state.isLoading),
      distinctUntilChanged()
    );
  }

  get error$(): Observable<string | null> {
    return this._state$.pipe(
      map(state => state.error),
      distinctUntilChanged()
    );
  }

  // Synchronous getters
  get currentUser(): User | null {
    return this._state$.value.user;
  }

  get currentToken(): string | null {
    return this._state$.value.token;
  }

  get isAuthenticated(): boolean {
    return this._state$.value.isAuthenticated;
  }

  // Authentication methods
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    console.log('🔐 AuthService: Login attempt', { email: credentials.email, timestamp: new Date().toISOString() });
    
    try {
      this.updateState({ isLoading: true, error: null });

      const response = await api.post<AuthResponse>('/auth/login', credentials);
      const { user, token, message } = response.data;
      
      console.log('✅ AuthService: Login successful', { 
        userId: user.id, 
        email: user.email, 
        timestamp: new Date().toISOString() 
      });

      // Store in IndexedDB
      await Promise.all([
        idbStorage.setUser(this.STORAGE_KEYS.USER, user),
        idbStorage.setSetting(this.STORAGE_KEYS.TOKEN, token),
      ]);

      this.updateState({
        user,
        token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });

      return { user, token, message };
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Login failed';
      console.error('❌ AuthService: Login failed', { 
        email: credentials.email, 
        error: errorMessage, 
        timestamp: new Date().toISOString() 
      });
      this.updateState({
        isLoading: false,
        error: errorMessage,
      });
      throw new Error(errorMessage);
    }
  }

  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    console.log('📝 AuthService: Registration attempt', { 
      email: credentials.email, 
      name: credentials.name, 
      timestamp: new Date().toISOString() 
    });
    
    try {
      this.updateState({ isLoading: true, error: null });

      const response = await api.post<AuthResponse>('/auth/register', credentials);
      const { user, token, message } = response.data;
      
      console.log('✅ AuthService: Registration successful', { 
        userId: user.id, 
        email: user.email, 
        timestamp: new Date().toISOString() 
      });

      // Store in IndexedDB
      await Promise.all([
        idbStorage.setUser(this.STORAGE_KEYS.USER, user),
        idbStorage.setSetting(this.STORAGE_KEYS.TOKEN, token),
      ]);

      this.updateState({
        user,
        token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });

      return { user, token, message };
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Registration failed';
      console.error('❌ AuthService: Registration failed', { 
        email: credentials.email, 
        error: errorMessage, 
        timestamp: new Date().toISOString() 
      });
      this.updateState({
        isLoading: false,
        error: errorMessage,
      });
      throw new Error(errorMessage);
    }
  }

  async logout(): Promise<void> {
    try {
      // Clear IndexedDB
      await Promise.all([
        idbStorage.removeUser(this.STORAGE_KEYS.USER),
        idbStorage.removeSetting(this.STORAGE_KEYS.TOKEN),
      ]);

      this.updateState({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      console.error('Failed to logout:', error);
      // Even if storage clearing fails, update the state
      this.updateState({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    }
  }

  async refreshToken(): Promise<string | null> {
    try {
      if (!this.currentToken) {
        return null;
      }

      const response = await api.post<{ token: string; user: User }>('/auth/refresh');
      const { token, user } = response.data;

      // Update storage and state
      await Promise.all([
        idbStorage.setUser(this.STORAGE_KEYS.USER, user),
        idbStorage.setSetting(this.STORAGE_KEYS.TOKEN, token),
      ]);

      this.updateState({
        user,
        token,
        isAuthenticated: true,
        error: null,
      });

      return token;
    } catch (error) {
      console.error('Failed to refresh token:', error);
      // If refresh fails, logout the user
      await this.logout();
      return null;
    }
  }

  async updateProfile(updates: Partial<User>): Promise<User> {
    try {
      const response = await api.put<{ user: User }>('/auth/profile', updates);
      const { user } = response.data;

      // Update storage and state
      await idbStorage.setUser(this.STORAGE_KEYS.USER, user);
      this.updateState({ user });

      return user;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to update profile';
      throw new Error(errorMessage);
    }
  }

  async changePassword(oldPassword: string, newPassword: string): Promise<void> {
    try {
      await api.put('/auth/change-password', {
        oldPassword,
        newPassword,
      });
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to change password';
      throw new Error(errorMessage);
    }
  }

  // Utility methods
  clearError(): void {
    this.updateState({ error: null });
  }

  async validateToken(): Promise<boolean> {
    try {
      if (!this.currentToken) {
        return false;
      }

      await api.get('/auth/validate');
      return true;
    } catch (error) {
      return false;
    }
  }

  // Auto-refresh token before expiry
  startTokenRefresh(): void {
    // Disable automatic token refresh for now to prevent logout issues
    // TODO: Implement proper token refresh when backend endpoint is ready
    console.log('Token refresh disabled - implement when /auth/refresh endpoint is available');
    
    // Uncomment when backend supports token refresh:
    // setInterval(async () => {
    //   if (this.isAuthenticated) {
    //     await this.refreshToken();
    //   }
    // }, 5 * 60 * 1000);
  }
}

export const authService = new AuthService();
