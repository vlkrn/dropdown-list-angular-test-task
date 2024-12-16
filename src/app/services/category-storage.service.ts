import { Injectable } from '@angular/core';
import { Category } from '../interfaces/category.interface';

@Injectable({
  providedIn: 'root',
})
export class CategoryStorageService {
  private dbName = 'appDatabase';
  private storeName = 'categories';
  private dbReady: Promise<IDBDatabase>;

  constructor() {
    this.dbReady = this.init();
  }

  private init(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, 1);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBRequest).result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName, { keyPath: 'label' });
        }
      };

      request.onsuccess = (event) => {
        const db = (event.target as IDBRequest).result;
        this.checkAndInitialize(db).then(() => resolve(db));
      };

      request.onerror = (event) => {
        console.error('Ошибка при открытии базы данных', event);
        reject(event);
      };
    });
  }

  private checkAndInitialize(db: IDBDatabase): Promise<void> {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(this.storeName, 'readonly');
      const store = transaction.objectStore(this.storeName);

      const request = store.getAll();

      request.onsuccess = (event) => {
        if ((event.target as IDBRequest).result.length === 0) {
          this.initializeData(db).then(resolve).catch(reject);
        } else {
          resolve();
        }
      };

      request.onerror = (event) => {
        console.error('Ошибка при проверке данных', event);
        reject(event);
      };
    });
  }

  private initializeData(db: IDBDatabase): Promise<void> {
    return new Promise((resolve, reject) => {
      const defaultData: Category[] = [
        {
          label: 'Продажи',
          children: [
            { label: 'Неразобранное' },
            { label: 'Переговоры' },
            { label: 'Принимают решение' },
            { label: 'Успешно' },
          ],
        },
        {
          label: 'Сотрудники',
          children: [
            { label: 'Неразобранное' },
            { label: 'Переговоры' },
            { label: 'Принимают решение' },
            { label: 'Успешно' },
          ],
        },
        {
          label: 'Партнеры',
          children: [
            { label: 'Неразобранное' },
            { label: 'Переговоры' },
            { label: 'Принимают решение' },
            { label: 'Успешно' },
          ],
        },
        {
          label: 'Ивент',
          children: [
            { label: 'Неразобранное' },
            { label: 'Переговоры' },
            { label: 'Принимают решение' },
            { label: 'Успешно' },
          ],
        },
        {
          label: 'Входящие сообщения',
          children: [
            { label: 'Неразобранное' },
            { label: 'Переговоры' },
            { label: 'Принимают решение' },
            { label: 'Успешно' },
          ],
        },
      ];

      const transaction = db.transaction(this.storeName, 'readwrite');
      const store = transaction.objectStore(this.storeName);

      defaultData.forEach((item) => {
        store.put(item);
      });

      transaction.oncomplete = () => {
        console.log('Данные инициализированы в IndexedDB');
        resolve();
      };

      transaction.onerror = (event) => {
        console.error('Ошибка при инициализации данных', event);
        reject(event);
      };
    });
  }

  async getCategories(): Promise<Category[]> {
    const db = await this.dbReady;

    const transaction = db.transaction(this.storeName, 'readonly');
    const store = transaction.objectStore(this.storeName);

    return new Promise<Category[]>((resolve, reject) => {
      const getRequest = store.getAll();

      getRequest.onsuccess = (event: Event) => {
        resolve((event.target as IDBRequest).result);
      };

      getRequest.onerror = () => {
        reject('Ошибка при получении данных');
      };
    });
  }

  async saveCategories(categories: Category[]): Promise<void> {
    const db = await this.dbReady;

    const transaction = db.transaction(this.storeName, 'readwrite');
    const store = transaction.objectStore(this.storeName);

    for (const category of categories) {
      store.put(category);
    }

    return new Promise((resolve, reject) => {
      transaction.oncomplete = () => {
        resolve();
      };

      transaction.onerror = () => {
        reject('Ошибка при сохранении данных');
      };
    });
  }
}
