/**
 * IndexedDB wrapper for local data storage
 * Enables offline data persistence for user whiskies, ratings, and notes
 */

const DB_NAME = 'dram-journal-db';
const DB_VERSION = 1;

interface DBSchema {
  userProducts: {
    id: string;
    productId: string;
    rating: number;
    tastingNotes?: string;
    isOwned: boolean;
    isWishlist: boolean;
    createdAt: string;
    synced: boolean; // Track if synced to server
  };
  products: {
    id: string;
    name: string;
    distillery: string;
    productImage?: string;
    description?: string;
    abvPercent?: string;
    price?: string;
    cached: boolean;
  };
  pendingSync: {
    id: string;
    url: string;
    method: string;
    body: string;
    timestamp: number;
  };
}

class LocalDB {
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // User products store
        if (!db.objectStoreNames.contains('userProducts')) {
          const userProductsStore = db.createObjectStore('userProducts', { keyPath: 'id' });
          userProductsStore.createIndex('productId', 'productId', { unique: false });
          userProductsStore.createIndex('synced', 'synced', { unique: false });
        }

        // Products cache store
        if (!db.objectStoreNames.contains('products')) {
          const productsStore = db.createObjectStore('products', { keyPath: 'id' });
          productsStore.createIndex('name', 'name', { unique: false });
        }

        // Pending sync queue
        if (!db.objectStoreNames.contains('pendingSync')) {
          const pendingSyncStore = db.createObjectStore('pendingSync', { keyPath: 'id' });
          pendingSyncStore.createIndex('timestamp', 'timestamp', { unique: false });
        }
      };
    });
  }

  private async ensureDB(): Promise<IDBDatabase> {
    if (!this.db) {
      await this.init();
    }
    return this.db!;
  }

  // User Products Methods
  async saveUserProduct(product: DBSchema['userProducts']): Promise<void> {
    const db = await this.ensureDB();
    const transaction = db.transaction(['userProducts'], 'readwrite');
    const store = transaction.objectStore('userProducts');
    store.put(product);
    
    return new Promise((resolve, reject) => {
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  }

  async getUserProducts(): Promise<DBSchema['userProducts'][]> {
    const db = await this.ensureDB();
    const transaction = db.transaction(['userProducts'], 'readonly');
    const store = transaction.objectStore('userProducts');
    const request = store.getAll();

    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async deleteUserProduct(id: string): Promise<void> {
    const db = await this.ensureDB();
    const transaction = db.transaction(['userProducts'], 'readwrite');
    const store = transaction.objectStore('userProducts');
    store.delete(id);

    return new Promise((resolve, reject) => {
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  }

  // Products Cache Methods
  async cacheProduct(product: DBSchema['products']): Promise<void> {
    const db = await this.ensureDB();
    const transaction = db.transaction(['products'], 'readwrite');
    const store = transaction.objectStore('products');
    store.put({ ...product, cached: true });

    return new Promise((resolve, reject) => {
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  }

  async getCachedProducts(): Promise<DBSchema['products'][]> {
    const db = await this.ensureDB();
    const transaction = db.transaction(['products'], 'readonly');
    const store = transaction.objectStore('products');
    const request = store.getAll();

    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // Pending Sync Methods
  async addToPendingSync(item: Omit<DBSchema['pendingSync'], 'id' | 'timestamp'>): Promise<void> {
    const db = await this.ensureDB();
    const transaction = db.transaction(['pendingSync'], 'readwrite');
    const store = transaction.objectStore('pendingSync');
    
    const syncItem: DBSchema['pendingSync'] = {
      ...item,
      id: crypto.randomUUID(),
      timestamp: Date.now(),
    };

    store.add(syncItem);

    return new Promise((resolve, reject) => {
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  }

  async getPendingSync(): Promise<DBSchema['pendingSync'][]> {
    const db = await this.ensureDB();
    const transaction = db.transaction(['pendingSync'], 'readonly');
    const store = transaction.objectStore('pendingSync');
    const request = store.getAll();

    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async removePendingSync(id: string): Promise<void> {
    const db = await this.ensureDB();
    const transaction = db.transaction(['pendingSync'], 'readwrite');
    const store = transaction.objectStore('pendingSync');
    store.delete(id);

    return new Promise((resolve, reject) => {
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  }

  async clearAllData(): Promise<void> {
    const db = await this.ensureDB();
    const transaction = db.transaction(['userProducts', 'products', 'pendingSync'], 'readwrite');
    
    transaction.objectStore('userProducts').clear();
    transaction.objectStore('products').clear();
    transaction.objectStore('pendingSync').clear();

    return new Promise((resolve, reject) => {
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  }
}

// Export singleton instance
export const localDB = new LocalDB();

// Initialize on module load
if (typeof window !== 'undefined') {
  localDB.init().catch(console.error);
}
