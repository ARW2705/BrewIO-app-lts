/* Module imports */
import { TestBed, getTestBed, async } from '@angular/core/testing';
import { Storage } from '@ionic/storage';

/* Test configuration imports */
import { configureTestBed } from '../../../../test-config/configure-test-bed';

/* Mock imports */
import { mockBatch } from '../../../../test-config/mock-models/mock-batch';
import { mockInventoryItem } from '../../../../test-config/mock-models/mock-inventory';
import { mockLibraryStorage } from '../../../../test-config/mock-models/mock-library';
import { mockRecipeMasterActive } from '../../../../test-config/mock-models/mock-recipe';
import { mockSyncMetadata } from '../../../../test-config/mock-models/mock-sync';
import { mockUser } from '../../../../test-config/mock-models/mock-user';
import { StorageMock } from '../../../../test-config/mocks-ionic';

/* Interface imports */
import { Batch } from '../../shared/interfaces/batch';
import { LibraryStorage } from '../../shared/interfaces/library';
import { InventoryItem } from '../../shared/interfaces/inventory-item';
import { RecipeMaster } from '../../shared/interfaces/recipe-master';
import { SelectedUnits } from '../../shared/interfaces/units';
import { SyncMetadata } from '../../shared/interfaces/sync';
import { User } from '../../shared/interfaces/user';

/* Default imports */
import { defaultEnglish } from '../../shared/defaults/default-units';

/* Service imports */
import { StorageService } from './storage.service';


describe('StorageService', (): void => {
  let injector: TestBed;
  let storageService: StorageService;
  configureTestBed();

  beforeAll(async((): void => {
    TestBed.configureTestingModule({
      providers: [
        StorageService,
        { provide: Storage, useClass: StorageMock }
      ]
    });
  }));

  beforeEach((): void => {
    injector = getTestBed();
    storageService = injector.get(StorageService);
  });

  test('should create the service', (): void => {
    expect(storageService).toBeDefined();
  });


  describe('Batch Storage', (): void => {
    test('should get batches', (done: jest.DoneCallback): void => {
      const _mockBatch: Batch = mockBatch();

      storageService.storage.get = jest
        .fn()
        .mockReturnValue(Promise.resolve(JSON.stringify([_mockBatch])));

      storageService.getBatches(true)
        .subscribe(
          (batches: Batch[]): void => {
            expect(batches.length).toEqual(1);
            expect(batches).toStrictEqual([_mockBatch]);
            done();
          },
          (error: any): void => {
            console.log(`Error in 'should get batches'`, error);
            expect(true).toBe(false);
          }
        );
    });

    test('should get an error if batches not found', (done: jest.DoneCallback): void => {
      storageService.storage.get = jest
        .fn()
        .mockReturnValue(Promise.resolve(null));

      storageService.getBatches(true)
        .subscribe(
          (results: any): void => {
            console.log('Should not get results', results);
            expect(true).toBe(false);
          },
          (error: string): void => {
            expect(error).toMatch('NotFoundError active batch data not found');
            done();
          }
        );
    });

    test('should get an error if batch list is empty', (done: jest.DoneCallback): void => {
      storageService.storage.get = jest
        .fn()
        .mockReturnValue(Promise.resolve(JSON.stringify([])));

      storageService.getBatches(true)
        .subscribe(
          (results: any): void => {
            console.log('Should not get results', results);
            expect(true).toBe(false);
          },
          (error: string): void => {
            expect(error).toMatch('NotFoundError No active batch data in storage');
            done();
          }
        );
    });

    test('should handle a batch internal storage error', (done: jest.DoneCallback): void => {
      storageService.storage.get = jest
        .fn()
        .mockReturnValue(Promise.resolve([]));

      storageService.getBatches(true)
        .subscribe(
          (results: any): void => {
            console.log('Should not get results', results);
            expect(true).toBe(false);
          },
          (error: string): void => {
            expect(error).toMatch('SyntaxError Unexpected end of JSON input');
            done();
          }
        );
    });

    test('should remove batches', (done: jest.DoneCallback): void => {
      storageService.storage.remove = jest
        .fn()
        .mockReturnValue(Promise.resolve(null));

      const storeSpy: jest.SpyInstance = jest.spyOn(storageService.storage, 'remove');
      const consoleSpy: jest.SpyInstance = jest.spyOn(console, 'log');

      storageService.removeBatches(true);

      setTimeout((): void => {
        expect(storeSpy).toHaveBeenCalledWith(storageService.activeBatchStorageKey);
        expect(consoleSpy.mock.calls[consoleSpy.mock.calls.length - 1][0]).toMatch('Active batch data cleared');
        done();
      }, 10);
    });

    test('should get an error removing batches', (done: jest.DoneCallback): void => {
      storageService.storage.remove = jest
        .fn()
        .mockReturnValue(Promise.reject(new Error('test-error')));

      const storeSpy: jest.SpyInstance = jest.spyOn(storageService.storage, 'remove');
      const consoleSpy: jest.SpyInstance = jest.spyOn(console, 'log');

      storageService.removeBatches(false);

      setTimeout((): void => {
        expect(storeSpy).toHaveBeenCalledWith(storageService.archiveBatchStorageKey);
        const consoleCalls: any[] = consoleSpy.mock.calls[consoleSpy.mock.calls.length - 1];
        expect(consoleCalls[0]).toMatch('Batch storage removal error');
        expect(consoleCalls[1].message).toMatch('test-error');
        done();
      }, 10);
    });

    test('should set batches', (done: jest.DoneCallback): void => {
      const _mockBatch: Batch = mockBatch();

      storageService.storage.set = jest
        .fn()
        .mockReturnValue(Promise.resolve(true));

      const storeSpy: jest.SpyInstance = jest.spyOn(storageService.storage, 'set');

      storageService.setBatches(true, [_mockBatch])
        .subscribe(
          (): void => {
            expect(storeSpy).toHaveBeenCalledWith(
              storageService.activeBatchStorageKey,
              JSON.stringify([_mockBatch])
            );
            done();
          },
          (error: any): void => {
            console.log(`Error in 'should set batches'`, error);
            expect(true).toBe(false);
          }
        );
    });
  });


  describe('Inventory Storage', (): void => {
    test('should get inventory', (done: jest.DoneCallback): void => {
      const _mockInventoryItem: InventoryItem = mockInventoryItem();

      storageService.storage.get = jest
        .fn()
        .mockReturnValue(Promise.resolve(JSON.stringify([_mockInventoryItem])));

      storageService.getInventory()
        .subscribe(
          (items: InventoryItem[]): void => {
            expect(items.length).toEqual(1);
            expect(items).toStrictEqual([_mockInventoryItem]);
            done();
          },
          (error: any): void => {
            console.log(`Error in 'should get inventory'`, error);
            expect(true).toBe(false);
          }
        );
    });

    test('should get an error if inventory not found', (done: jest.DoneCallback): void => {
      storageService.storage.get = jest
        .fn()
        .mockReturnValue(Promise.resolve(null));

      storageService.getInventory()
        .subscribe(
          (results: any): void => {
            console.log('Should not get results', results);
            expect(true).toBe(false);
          },
          (error: string): void => {
            expect(error).toMatch('NotFoundError Inventory data not found');
            done();
          }
        );
    });

    test('should get an error if inventory list is empty', (done: jest.DoneCallback): void => {
      storageService.storage.get = jest
        .fn()
        .mockReturnValue(Promise.resolve(JSON.stringify([])));

      storageService.getInventory()
        .subscribe(
          (results: any): void => {
            console.log('Should not get results', results);
            expect(true).toBe(false);
          },
          (error: string): void => {
            expect(error).toMatch('NotFoundError No inventory data in storage');
            done();
          }
        );
    });

    test('should handle an inventory internal storage error', (done: jest.DoneCallback): void => {
      storageService.storage.get = jest
        .fn()
        .mockReturnValue(Promise.resolve([]));

      storageService.getInventory()
        .subscribe(
          (results: any): void => {
            console.log('Should not get results', results);
            expect(true).toBe(false);
          },
          (error: string): void => {
            expect(error).toMatch('SyntaxError Unexpected end of JSON input');
            done();
          }
        );
    });

    test('should remove inventory', (done: jest.DoneCallback): void => {
      storageService.storage.remove = jest
        .fn()
        .mockReturnValue(Promise.resolve(null));

      const storeSpy: jest.SpyInstance = jest.spyOn(storageService.storage, 'remove');
      const consoleSpy: jest.SpyInstance = jest.spyOn(console, 'log');

      storageService.removeInventory();

      setTimeout((): void => {
        expect(storeSpy).toHaveBeenCalledWith(storageService.inventoryStorageKey);
        expect(consoleSpy.mock.calls[consoleSpy.mock.calls.length - 1][0]).toMatch('Inventory data cleared');
        done();
      }, 10);
    });

    test('should get an error removing inventory', (done: jest.DoneCallback): void => {
      storageService.storage.remove = jest
        .fn()
        .mockReturnValue(Promise.reject(new Error('test-error')));

      const storeSpy: jest.SpyInstance = jest.spyOn(storageService.storage, 'remove');
      const consoleSpy: jest.SpyInstance = jest.spyOn(console, 'log');

      storageService.removeInventory();

      setTimeout((): void => {
        expect(storeSpy).toHaveBeenCalledWith(storageService.inventoryStorageKey);
        const consoleCalls: any[] = consoleSpy.mock.calls[consoleSpy.mock.calls.length - 1];
        expect(consoleCalls[0]).toMatch('Inventory storage removal error');
        expect(consoleCalls[1].message).toMatch('test-error');
        done();
      }, 10);
    });

    test('should set inventory', (done: jest.DoneCallback): void => {
      const _mockInventoryItem: InventoryItem = mockInventoryItem();

      storageService.storage.set = jest
        .fn()
        .mockReturnValue(Promise.resolve(true));

      const storeSpy: jest.SpyInstance = jest.spyOn(storageService.storage, 'set');

      storageService.setInventory([_mockInventoryItem])
        .subscribe(
          (): void => {
            expect(storeSpy).toHaveBeenCalledWith(
              storageService.inventoryStorageKey,
              JSON.stringify([_mockInventoryItem])
            );
            done();
          },
          (error: any): void => {
            console.log(`Error in 'should set inventory'`, error);
            expect(true).toBe(false);
          }
        );
    });
  });


  describe('Library Storage', (): void => {
    test('should get library', (done: jest.DoneCallback): void => {
      const _mockLibraryStorage: LibraryStorage = mockLibraryStorage();

      storageService.storage.get = jest
        .fn()
        .mockReturnValue(Promise.resolve(JSON.stringify(_mockLibraryStorage)));

      storageService.getLibrary()
        .subscribe(
          (library: LibraryStorage): void => {
            expect(library).toStrictEqual(_mockLibraryStorage);
            done();
          },
          (error: any): void => {
            console.log(`Error in 'should get library'`, error);
            expect(true).toBe(false);
          }
        );
    });

    test('should get an error if library not found', (done: jest.DoneCallback): void => {
      storageService.storage.get = jest
        .fn()
        .mockReturnValue(Promise.resolve(null));

      storageService.getLibrary()
        .subscribe(
          (results: any): void => {
            console.log('Should not get results', results);
            expect(true).toBe(false);
          },
          (error: string): void => {
            expect(error).toMatch('NotFoundError Library data not found');
            done();
          }
        );
    });

    test('should get an error if library is empty', (done: jest.DoneCallback): void => {
      storageService.storage.get = jest
        .fn()
        .mockReturnValue(Promise.resolve(JSON.stringify({})));

      storageService.getLibrary()
        .subscribe(
          (results: any): void => {
            console.log('Should not get results', results);
            expect(true).toBe(false);
          },
          (error: string): void => {
            expect(error).toMatch('NotFoundError No library data in storage');
            done();
          }
        );
    });

    test('should handle a library internal storage error', (done: jest.DoneCallback): void => {
      storageService.storage.get = jest
        .fn()
        .mockReturnValue(Promise.resolve({}));

      storageService.getLibrary()
        .subscribe(
          (results: any): void => {
            console.log('Should not get results', results);
            expect(true).toBe(false);
          },
          (error: string): void => {
            expect(error).toMatch('SyntaxError Unexpected token o in JSON at position 1');
            done();
          }
        );
    });

    test('should set library', (done: jest.DoneCallback): void => {
      const _mockLibraryStorage: LibraryStorage = mockLibraryStorage();

      storageService.storage.set = jest
        .fn()
        .mockReturnValue(Promise.resolve(true));

      const storeSpy: jest.SpyInstance = jest.spyOn(storageService.storage, 'set');

      storageService.setLibrary(_mockLibraryStorage)
        .subscribe(
          (): void => {
            expect(storeSpy).toHaveBeenCalledWith(
              storageService.libraryStorageKey,
              JSON.stringify(_mockLibraryStorage)
            );
            done();
          },
          (error: any): void => {
            console.log(`Error in 'should set inventory'`, error);
            expect(true).toBe(false);
          }
        );
    });
  });


  describe('Recipe Storage', (): void => {
    test('should get recipes', (done: jest.DoneCallback): void => {
      const _mockRecipeMasterActive: RecipeMaster = mockRecipeMasterActive();

      storageService.storage.get = jest
        .fn()
        .mockReturnValue(Promise.resolve(JSON.stringify([_mockRecipeMasterActive])));

      storageService.getRecipes()
        .subscribe(
          (recipes: RecipeMaster[]): void => {
            expect(recipes.length).toEqual(1);
            expect(recipes).toStrictEqual([_mockRecipeMasterActive]);
            done();
          },
          (error: any): void => {
            console.log(`Error in 'should get recipes'`, error);
            expect(true).toBe(false);
          }
        );
    });

    test('should get an error if recipes not found', (done: jest.DoneCallback): void => {
      storageService.storage.get = jest
        .fn()
        .mockReturnValue(Promise.resolve(null));

      storageService.getRecipes()
        .subscribe(
          (results: any): void => {
            console.log('Should not get results', results);
            expect(true).toBe(false);
          },
          (error: string): void => {
            expect(error).toMatch('NotFoundError Recipe data not found');
            done();
          }
        );
    });

    test('should get an error if recipes is empty', (done: jest.DoneCallback): void => {
      storageService.storage.get = jest
        .fn()
        .mockReturnValue(Promise.resolve(JSON.stringify([])));

      storageService.getRecipes()
        .subscribe(
          (results: any): void => {
            console.log('Should not get results', results);
            expect(true).toBe(false);
          },
          (error: string): void => {
            expect(error).toMatch('NotFoundError No recipe data in storage');
            done();
          }
        );
    });

    test('should handle a recipe internal storage error', (done: jest.DoneCallback): void => {
      storageService.storage.get = jest
        .fn()
        .mockReturnValue(Promise.resolve([]));

      storageService.getRecipes()
        .subscribe(
          (results: any): void => {
            console.log('Should not get results', results);
            expect(true).toBe(false);
          },
          (error: string): void => {
            expect(error).toMatch('SyntaxError Unexpected end of JSON input');
            done();
          }
        );
    });

    test('should remove recipes', (done: jest.DoneCallback): void => {
      storageService.storage.remove = jest
        .fn()
        .mockReturnValue(Promise.resolve(null));

      const storeSpy: jest.SpyInstance = jest.spyOn(storageService.storage, 'remove');
      const consoleSpy: jest.SpyInstance = jest.spyOn(console, 'log');

      storageService.removeRecipes();

      setTimeout((): void => {
        expect(storeSpy).toHaveBeenCalledWith(storageService.recipeStorageKey);
        expect(consoleSpy.mock.calls[consoleSpy.mock.calls.length - 1][0]).toMatch('Recipe data cleared');
        done();
      }, 10);
    });

    test('should get an error removing recipes', (done: jest.DoneCallback): void => {
      storageService.storage.remove = jest
        .fn()
        .mockReturnValue(Promise.reject(new Error('test-error')));

      const storeSpy: jest.SpyInstance = jest.spyOn(storageService.storage, 'remove');
      const consoleSpy: jest.SpyInstance = jest.spyOn(console, 'log');

      storageService.removeRecipes();

      setTimeout((): void => {
        expect(storeSpy).toHaveBeenCalledWith(storageService.recipeStorageKey);
        const consoleCalls: any[] = consoleSpy.mock.calls[consoleSpy.mock.calls.length - 1];
        expect(consoleCalls[0]).toMatch('Recipe storage removal error');
        expect(consoleCalls[1].message).toMatch('test-error');
        done();
      }, 10);
    });

    test('should set recipes', (done: jest.DoneCallback): void => {
      const _mockRecipeMasterActive: RecipeMaster = mockRecipeMasterActive();

      storageService.storage.set = jest
        .fn()
        .mockReturnValue(Promise.resolve(true));

      const storeSpy: jest.SpyInstance = jest.spyOn(storageService.storage, 'set');

      storageService.setRecipes([_mockRecipeMasterActive])
        .subscribe(
          (): void => {
            expect(storeSpy).toHaveBeenCalledWith(
              storageService.recipeStorageKey,
              JSON.stringify([_mockRecipeMasterActive])
            );
            done();
          },
          (error: any): void => {
            console.log(`Error in 'should set recipes'`, error);
            expect(true).toBe(false);
          }
        );
    });
  });


  describe('Sync Flag Storage', (): void => {
    test('should get sync flags', (done: jest.DoneCallback): void => {
      const _mockSyncMetadata: SyncMetadata = mockSyncMetadata('method', 'docId', 'docType');

      storageService.storage.get = jest
        .fn()
        .mockReturnValue(Promise.resolve(JSON.stringify([_mockSyncMetadata])));

      storageService.getSyncFlags()
        .subscribe(
          (flags: SyncMetadata[]): void => {
            expect(flags.length).toEqual(1);
            expect(flags).toStrictEqual([_mockSyncMetadata]);
            done();
          },
          (error: any): void => {
            console.log(`Error in 'should get sync flags'`, error);
            expect(true).toBe(false);
          }
        );
    });

    test('should get an error if sync flags not found', (done: jest.DoneCallback): void => {
      storageService.storage.get = jest
        .fn()
        .mockReturnValue(Promise.resolve(null));

      storageService.getSyncFlags()
        .subscribe(
          (results: any): void => {
            console.log('Should not get results', results);
            expect(true).toBe(false);
          },
          (error: string): void => {
            expect(error).toMatch('NotFoundError Sync flags not found');
            done();
          }
        );
    });

    test('should get an error if sync flags is empty', (done: jest.DoneCallback): void => {
      storageService.storage.get = jest
        .fn()
        .mockReturnValue(Promise.resolve(JSON.stringify([])));

      storageService.getSyncFlags()
        .subscribe(
          (results: any): void => {
            console.log('Should not get results', results);
            expect(true).toBe(false);
          },
          (error: string): void => {
            expect(error).toMatch('NotFoundError No sync flags in storage');
            done();
          }
        );
    });

    test('should handle a sync flag internal storage error', (done: jest.DoneCallback): void => {
      storageService.storage.get = jest
        .fn()
        .mockReturnValue(Promise.resolve([]));

      storageService.getSyncFlags()
        .subscribe(
          (results: any): void => {
            console.log('Should not get results', results);
            expect(true).toBe(false);
          },
          (error: string): void => {
            expect(error).toMatch('SyntaxError Unexpected end of JSON input');
            done();
          }
        );
    });

    test('should remove sync flags', (done: jest.DoneCallback): void => {
      storageService.storage.remove = jest
        .fn()
        .mockReturnValue(Promise.resolve(null));

      const storeSpy: jest.SpyInstance = jest.spyOn(storageService.storage, 'remove');
      const consoleSpy: jest.SpyInstance = jest.spyOn(console, 'log');

      storageService.removeSyncFlags();

      setTimeout((): void => {
        expect(storeSpy).toHaveBeenCalledWith(storageService.syncStorageKey);
        expect(consoleSpy.mock.calls[consoleSpy.mock.calls.length - 1][0]).toMatch('Sync flags cleared');
        done();
      }, 10);
    });

    test('should get an error removing sync flags', (done: jest.DoneCallback): void => {
      storageService.storage.remove = jest
        .fn()
        .mockReturnValue(Promise.reject(new Error('test-error')));

      const storeSpy: jest.SpyInstance = jest.spyOn(storageService.storage, 'remove');
      const consoleSpy: jest.SpyInstance = jest.spyOn(console, 'log');

      storageService.removeSyncFlags();

      setTimeout((): void => {
        expect(storeSpy).toHaveBeenCalledWith(storageService.syncStorageKey);
        const consoleCalls: any[] = consoleSpy.mock.calls[consoleSpy.mock.calls.length - 1];
        expect(consoleCalls[0]).toMatch('Sync storage removal error');
        expect(consoleCalls[1].message).toMatch('test-error');
        done();
      }, 10);
    });

    test('should set sync flags', (done: jest.DoneCallback): void => {
      const _mockSyncMetadata: SyncMetadata = mockSyncMetadata('method', 'docId', 'docType');

      storageService.storage.set = jest
        .fn()
        .mockReturnValue(Promise.resolve(true));

      const storeSpy: jest.SpyInstance = jest.spyOn(storageService.storage, 'set');

      storageService.setSyncFlags([_mockSyncMetadata])
        .subscribe(
          (): void => {
            expect(storeSpy).toHaveBeenCalledWith(
              storageService.syncStorageKey,
              JSON.stringify([_mockSyncMetadata])
            );
            done();
          },
          (error: any): void => {
            console.log(`Error in 'should set sync flags'`, error);
            expect(true).toBe(false);
          }
        );
    });
  });


  describe('User Storage', (): void => {
    test('should get user', (done: jest.DoneCallback): void => {
      const _mockUser: User = mockUser();

      storageService.storage.get = jest
        .fn()
        .mockReturnValue(Promise.resolve(JSON.stringify(_mockUser)));

      storageService.getUser()
        .subscribe(
          (user: User): void => {
            expect(user).toStrictEqual(_mockUser);
            done();
          },
          (error: any): void => {
            console.log(`Error in 'should get user'`, error);
            expect(true).toBe(false);
          }
        );
    });

    test('should get a default user after error', (done: jest.DoneCallback): void => {
      const _defaultEnglish: SelectedUnits = defaultEnglish();

      storageService.storage.get = jest
        .fn()
        .mockReturnValue(Promise.resolve(null));

      storageService.getUser()
        .subscribe(
          (user: User): void => {
            expect(user).toStrictEqual({
              cid: 'offline',
              username: '',
              token: '',
              preferredUnitSystem: _defaultEnglish.system,
              units: _defaultEnglish
            });
            done();
          },
          (error: any): void => {
            console.log(`Error in 'should get a default user after error'`, error);
            expect(true).toBe(false);
          }
        );
    });

    test('should remove user', (done: jest.DoneCallback): void => {
      storageService.storage.remove = jest
        .fn()
        .mockReturnValue(Promise.resolve(null));

      const storeSpy: jest.SpyInstance = jest.spyOn(storageService.storage, 'remove');
      const consoleSpy: jest.SpyInstance = jest.spyOn(console, 'log');

      storageService.removeUser();

      setTimeout((): void => {
        expect(storeSpy).toHaveBeenCalledWith(storageService.userStorageKey);
        expect(consoleSpy.mock.calls[consoleSpy.mock.calls.length - 1][0]).toMatch('User data cleared');
        done();
      }, 10);
    });

    test('should get an error removing user', (done: jest.DoneCallback): void => {
      storageService.storage.remove = jest
        .fn()
        .mockReturnValue(Promise.reject(new Error('test-error')));

      const storeSpy: jest.SpyInstance = jest.spyOn(storageService.storage, 'remove');
      const consoleSpy: jest.SpyInstance = jest.spyOn(console, 'log');

      storageService.removeUser();

      setTimeout((): void => {
        expect(storeSpy).toHaveBeenCalledWith(storageService.userStorageKey);
        const consoleCalls: any[] = consoleSpy.mock.calls[consoleSpy.mock.calls.length - 1];
        expect(consoleCalls[0]).toMatch('User storage removal error');
        expect(consoleCalls[1].message).toMatch('test-error');
        done();
      }, 10);
    });

    test('should set user', (done: jest.DoneCallback): void => {
      const _mockUser: User = mockUser();

      storageService.storage.set = jest
        .fn()
        .mockReturnValue(Promise.resolve(true));

      const storeSpy: jest.SpyInstance = jest.spyOn(storageService.storage, 'set');

      storageService.setUser(_mockUser)
        .subscribe(
          (): void => {
            expect(storeSpy).toHaveBeenCalledWith(
              storageService.userStorageKey,
              JSON.stringify(_mockUser)
            );
            done();
          },
          (error: any): void => {
            console.log(`Error in 'should set user'`, error);
            expect(true).toBe(false);
          }
        );
    });
  });

});
