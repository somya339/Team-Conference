import { openDB, DBSchema, IDBPDatabase } from 'idb';

interface NexusMeetDB extends DBSchema {
  users: {
    key: string;
    value: any;
  };
  meetings: {
    key: string;
    value: any;
  };
  settings: {
    key: string;
    value: any;
  };
  cache: {
    key: string;
    value: any;
    indexes: { 'by-timestamp': number };
  };
}

class IdbStorageService {
  private db: IDBPDatabase<NexusMeetDB> | null = null;
  private readonly dbName = 'nexusmeet';
  private readonly version = 1;

  async init(): Promise<void> {
    try {
      this.db = await openDB<NexusMeetDB>(this.dbName, this.version, {
        upgrade(db) {
          // Users store
          if (!db.objectStoreNames.contains('users')) {
            db.createObjectStore('users');
          }

          // Meetings store
          if (!db.objectStoreNames.contains('meetings')) {
            db.createObjectStore('meetings');
          }

          // Settings store
          if (!db.objectStoreNames.contains('settings')) {
            db.createObjectStore('settings');
          }

          // Cache store with timestamp index
          if (!db.objectStoreNames.contains('cache')) {
            const cacheStore = db.createObjectStore('cache');
            cacheStore.createIndex('by-timestamp', 'timestamp');
          }
        },
      });
    } catch (error) {
      console.error('Failed to initialize IndexedDB:', error);
      throw new Error('Failed to initialize local storage');
    }
  }

  private async ensureDB(): Promise<IDBPDatabase<NexusMeetDB>> {
    if (!this.db) {
      await this.init();
    }
    return this.db!;
  }

  // User data operations
  async setUser(key: string, value: any): Promise<void> {
    try {
      const db = await this.ensureDB();
      await db.put('users', value, key);
    } catch (error) {
      console.error('Failed to store user data:', error);
      throw new Error('Failed to store user data');
    }
  }

  async getUser(key: string): Promise<any | null> {
    try {
      const db = await this.ensureDB();
      return await db.get('users', key) || null;
    } catch (error) {
      console.error('Failed to retrieve user data:', error);
      return null;
    }
  }

  async removeUser(key: string): Promise<void> {
    try {
      const db = await this.ensureDB();
      await db.delete('users', key);
    } catch (error) {
      console.error('Failed to remove user data:', error);
    }
  }

  // Meeting data operations
  async setMeeting(key: string, value: any): Promise<void> {
    try {
      const db = await this.ensureDB();
      await db.put('meetings', value, key);
    } catch (error) {
      console.error('Failed to store meeting data:', error);
      throw new Error('Failed to store meeting data');
    }
  }

  async getMeeting(key: string): Promise<any | null> {
    try {
      const db = await this.ensureDB();
      return await db.get('meetings', key) || null;
    } catch (error) {
      console.error('Failed to retrieve meeting data:', error);
      return null;
    }
  }

  async getAllMeetings(): Promise<any[]> {
    try {
      const db = await this.ensureDB();
      return await db.getAll('meetings');
    } catch (error) {
      console.error('Failed to retrieve all meetings:', error);
      return [];
    }
  }

  async removeMeeting(key: string): Promise<void> {
    try {
      const db = await this.ensureDB();
      await db.delete('meetings', key);
    } catch (error) {
      console.error('Failed to remove meeting data:', error);
    }
  }

  // Settings operations
  async setSetting(key: string, value: any): Promise<void> {
    try {
      const db = await this.ensureDB();
      await db.put('settings', value, key);
    } catch (error) {
      console.error('Failed to store setting:', error);
      throw new Error('Failed to store setting');
    }
  }

  async getSetting(key: string): Promise<any | null> {
    try {
      const db = await this.ensureDB();
      return await db.get('settings', key) || null;
    } catch (error) {
      console.error('Failed to retrieve setting:', error);
      return null;
    }
  }

  async getAllSettings(): Promise<Record<string, any>> {
    try {
      const db = await this.ensureDB();
      const settings = await db.getAll('settings');
      const result: Record<string, any> = {};
      settings.forEach((setting, index) => {
        result[index.toString()] = setting;
      });
      return result;
    } catch (error) {
      console.error('Failed to retrieve all settings:', error);
      return {};
    }
  }

  async removeSetting(key: string): Promise<void> {
    try {
      const db = await this.ensureDB();
      await db.delete('settings', key);
    } catch (error) {
      console.error('Failed to remove setting:', error);
    }
  }

  // Cache operations with TTL
  async setCache(key: string, value: any, ttlMinutes: number = 60): Promise<void> {
    try {
      const db = await this.ensureDB();
      const timestamp = Date.now();
      const expiresAt = timestamp + (ttlMinutes * 60 * 1000);
      
      await db.put('cache', {
        value,
        timestamp,
        expiresAt,
      }, key);
    } catch (error) {
      console.error('Failed to store cache data:', error);
      throw new Error('Failed to store cache data');
    }
  }

  async getCache(key: string): Promise<any | null> {
    try {
      const db = await this.ensureDB();
      const cached = await db.get('cache', key);
      
      if (!cached) return null;
      
      // Check if cache has expired
      if (cached.expiresAt && Date.now() > cached.expiresAt) {
        await this.removeCache(key);
        return null;
      }
      
      return cached.value;
    } catch (error) {
      console.error('Failed to retrieve cache data:', error);
      return null;
    }
  }

  async removeCache(key: string): Promise<void> {
    try {
      const db = await this.ensureDB();
      await db.delete('cache', key);
    } catch (error) {
      console.error('Failed to remove cache data:', error);
    }
  }

  async clearExpiredCache(): Promise<void> {
    try {
      const db = await this.ensureDB();
      const tx = db.transaction('cache', 'readwrite');
      const store = tx.objectStore('cache');
      const index = store.index('by-timestamp');
      
      const now = Date.now();
      let cursor = await index.openCursor();
      
      while (cursor) {
        if (cursor.value.expiresAt && cursor.value.expiresAt < now) {
          await cursor.delete();
        }
        cursor = await cursor.continue();
      }
      
      await tx.done;
    } catch (error) {
      console.error('Failed to clear expired cache:', error);
    }
  }

  // Utility methods
  async clearAll(): Promise<void> {
    try {
      const db = await this.ensureDB();
      await db.clear('users');
      await db.clear('meetings');
      await db.clear('settings');
      await db.clear('cache');
    } catch (error) {
      console.error('Failed to clear all data:', error);
      throw new Error('Failed to clear all data');
    }
  }

  async getStorageInfo(): Promise<{
    users: number;
    meetings: number;
    settings: number;
    cache: number;
  }> {
    try {
      const db = await this.ensureDB();
      const [users, meetings, settings, cache] = await Promise.all([
        db.count('users'),
        db.count('meetings'),
        db.count('settings'),
        db.count('cache'),
      ]);
      
      return { users, meetings, settings, cache };
    } catch (error) {
      console.error('Failed to get storage info:', error);
      return { users: 0, meetings: 0, settings: 0, cache: 0 };
    }
  }
}

export const idbStorage = new IdbStorageService();
