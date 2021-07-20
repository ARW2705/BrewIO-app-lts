/* Module imports */
import { TestBed, getTestBed, async } from '@angular/core/testing';
import { Storage } from '@ionic/storage';

/* Test configuration imports */
import { configureTestBed } from '../../../../test-config/configure-test-bed';

/* Mock imports */
import {
  mockBatch,
  mockErrorReport,
  mockInventoryItem,
  mockLibraryStorage,
  mockRecipeMasterActive,
  mockSyncMetadata,
  mockUser
} from '../../../../test-config/mock-models';
import { StorageStub } from '../../../../test-config/ionic-stubs';

/* Interface imports */
import {
  Batch,
  ErrorReport,
  LibraryStorage,
  InventoryItem,
  RecipeMaster,
  SelectedUnits,
  SyncMetadata,
  User
} from '../../shared/interfaces';

/* Type imports */
import { CustomError } from '../../shared/types';

/* Default imports */
import { defaultEnglishUnits } from '../../shared/defaults';

/* Service imports */
import { StorageService } from './storage.service';


describe('StorageService', (): void => {
  let injector: TestBed;
  let storageService: StorageService;
  let originalCustomError: any;
  configureTestBed();

  beforeAll(async((): void => {
    TestBed.configureTestingModule({
      providers: [
        StorageService,
        { provide: Storage, useClass: StorageStub }
      ]
    });
  }));

  beforeEach((): void => {
    injector = getTestBed();
    storageService = injector.get(StorageService);
    originalCustomError = storageService.getCustomError;
    storageService.getCustomError = jest
      .fn()
      .mockImplementation((message: string, error: Error): CustomError => {
        return new CustomError('TestError', message, 3, error.message);
      });
  });

  test('should create the service', (): void => {
    expect(storageService).toBeDefined();
  });

  test('should get a custom storage error', (): void => {
    storageService.getCustomError = originalCustomError;

    const _mockError: Error = new Error('test-error');
    const baseMessage: string = 'test base error message';
    const customError: CustomError = storageService.getCustomError(baseMessage, _mockError);

    expect(customError.name).toMatch('StorageError');
    expect(customError.message).toMatch(`${baseMessage}: ${_mockError.message}`);
    expect(customError.severity).toEqual(3);
    expect(customError.userMessage).toMatch(baseMessage);
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

    test('should handle batches not found', (done: jest.DoneCallback): void => {
      storageService.storage.get = jest
        .fn()
        .mockReturnValue(Promise.resolve(null));

      storageService.getBatches(true)
        .subscribe(
          (batches: Batch[]): void => {
            expect(batches).not.toBeNull();
            expect(batches).toStrictEqual([]);
            done();
          },
          (error: any): void => {
            console.log(`Error in 'should get handle batches not found'`, error);
            expect(true).toBe(false);
          }
        );
    });

    test('should handle a batch internal storage error', (done: jest.DoneCallback): void => {
      const _mockError: Error = new Error('test-error');

      storageService.storage.get = jest
        .fn()
        .mockReturnValue(Promise.reject(_mockError));

      storageService.getBatches(true)
        .subscribe(
          (results: any): void => {
            console.log('Should not get results', results);
            expect(true).toBe(false);
          },
          (error: CustomError): void => {
            expect(error.message).toMatch('An error occurred trying to get batches from storage');
            expect(error.userMessage).toMatch('test-error');
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
      const _mockError: Error = new Error('test-error');

      storageService.storage.remove = jest
        .fn()
        .mockReturnValue(Promise.reject(_mockError));

      const storeSpy: jest.SpyInstance = jest.spyOn(storageService.storage, 'remove');
      const errorSpy: jest.SpyInstance = jest.spyOn(storageService, 'getCustomError');

      storageService.removeBatches(false);

      setTimeout((): void => {
        expect(storeSpy).toHaveBeenCalledWith(storageService.archiveBatchStorageKey);
        expect(errorSpy).toHaveBeenCalledWith('An error occurred trying to remove batches from storage', _mockError);
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

    test('should get an error setting batches', (done: jest.DoneCallback): void => {
      const _mockBatch: Batch = mockBatch();
      const _mockError: Error = new Error('test-error');

      storageService.storage.set = jest
        .fn()
        .mockReturnValue(Promise.reject(_mockError));

      storageService.setBatches(true, [_mockBatch])
        .subscribe(
          (results: any): void => {
            console.log('Should not get results', results);
            expect(true).toBe(false);
          },
          (error: CustomError): void => {
            expect(error.message).toMatch('An error occurred trying to set batches in storage');
            expect(error.userMessage).toMatch('test-error');
            done();
          }
        );
    });

  });


  describe('Error Report Storage', (): void => {

    test('should get error reports', (done: jest.DoneCallback): void => {
      const _mockErrorReport: ErrorReport = mockErrorReport();

      storageService.storage.get = jest
        .fn()
        .mockReturnValue(Promise.resolve(JSON.stringify([_mockErrorReport])));

      storageService.getErrorReports()
        .subscribe(
          (items: ErrorReport[]): void => {
            expect(items.length).toEqual(1);
            expect(items).toStrictEqual([_mockErrorReport]);
            done();
          },
          (error: any): void => {
            console.log(`Error in 'should get inventory'`, error);
            expect(true).toBe(false);
          }
        );
    });

    test('should handle error reports not found', (done: jest.DoneCallback): void => {
      storageService.storage.get = jest
        .fn()
        .mockReturnValue(Promise.resolve(null));

      storageService.getErrorReports()
        .subscribe(
          (inventory: ErrorReport[]): void => {
            expect(inventory).toStrictEqual([]);
            done();
          },
          (error: Error): void => {
            console.log(`Error in 'should handle error reports not found'`, error);
            expect(true).toBe(false);
          }
        );
    });

    test('should handle an error reports internal storage error', (done: jest.DoneCallback): void => {
      const _mockError: Error = new Error('test-error');

      storageService.storage.get = jest
        .fn()
        .mockReturnValue(Promise.reject(_mockError));

      storageService.getErrorReports()
        .subscribe(
          (results: any): void => {
            console.log('Should not get results', results);
            expect(true).toBe(false);
          },
          (error: CustomError): void => {
            expect(error.message).toMatch('An error occurred trying to get error reports from storage');
            expect(error.userMessage).toMatch('test-error');
            done();
          }
        );
    });

    test('should remove error reports', (done: jest.DoneCallback): void => {
      storageService.storage.remove = jest
        .fn()
        .mockReturnValue(Promise.resolve(null));

      const storeSpy: jest.SpyInstance = jest.spyOn(storageService.storage, 'remove');
      const consoleSpy: jest.SpyInstance = jest.spyOn(console, 'log');

      storageService.removeErrorReports();

      setTimeout((): void => {
        expect(storeSpy).toHaveBeenCalledWith(storageService.errorReportStorageKey);
        expect(consoleSpy.mock.calls[consoleSpy.mock.calls.length - 1][0]).toMatch('Error reports cleared');
        done();
      }, 10);
    });

    test('should get an error removing error reports', (done: jest.DoneCallback): void => {
      const _mockError: Error = new Error('test-error');

      storageService.storage.remove = jest
        .fn()
        .mockReturnValue(Promise.reject(_mockError));

      const storeSpy: jest.SpyInstance = jest.spyOn(storageService.storage, 'remove');
      const errorSpy: jest.SpyInstance = jest.spyOn(storageService, 'getCustomError');

      storageService.removeErrorReports();

      setTimeout((): void => {
        expect(storeSpy).toHaveBeenCalledWith(storageService.errorReportStorageKey);
        expect(errorSpy).toHaveBeenCalledWith('An error occurred trying to remove error reports from storage', _mockError);
        done();
      }, 10);
    });

    test('should set error reports', (done: jest.DoneCallback): void => {
      const _mockErrorReport: ErrorReport = mockErrorReport();

      storageService.storage.set = jest
        .fn()
        .mockReturnValue(Promise.resolve(true));

      const storeSpy: jest.SpyInstance = jest.spyOn(storageService.storage, 'set');

      storageService.setErrorReports([_mockErrorReport])
        .subscribe(
          (): void => {
            expect(storeSpy).toHaveBeenCalledWith(
              storageService.errorReportStorageKey,
              JSON.stringify([_mockErrorReport])
            );
            done();
          },
          (error: any): void => {
            console.log(`Error in 'should set error reports'`, error);
            expect(true).toBe(false);
          }
        );
    });

    test('should get an error setting error reports', (done: jest.DoneCallback): void => {
      const _mockErrorReport: ErrorReport = mockErrorReport();
      const _mockError: Error = new Error('test-error');

      storageService.storage.set = jest
        .fn()
        .mockReturnValue(Promise.reject(_mockError));

      storageService.setErrorReports([_mockErrorReport])
        .subscribe(
          (results: any): void => {
            console.log('Should not get results', results);
            expect(true).toBe(false);
          },
          (error: CustomError): void => {
            expect(error.message).toMatch('An error occurred trying to set error reports in storage');
            expect(error.userMessage).toMatch('test-error');
            done();
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

    test('should handle inventory not found', (done: jest.DoneCallback): void => {
      storageService.storage.get = jest
        .fn()
        .mockReturnValue(Promise.resolve(null));

      storageService.getInventory()
        .subscribe(
          (inventory: InventoryItem[]): void => {
            expect(inventory).toStrictEqual([]);
            done();
          },
          (error: Error): void => {
            console.log(`Error in 'should handle inventory not found'`, error);
            expect(true).toBe(false);
          }
        );
    });

    test('should handle an inventory internal storage error', (done: jest.DoneCallback): void => {
      const _mockError: Error = new Error('test-error');

      storageService.storage.get = jest
        .fn()
        .mockReturnValue(Promise.reject(_mockError));

      storageService.getInventory()
        .subscribe(
          (results: any): void => {
            console.log('Should not get results', results);
            expect(true).toBe(false);
          },
          (error: CustomError): void => {
            expect(error.message).toMatch('An error occurred trying to get inventory from storage');
            expect(error.userMessage).toMatch('test-error');
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
      const _mockError: Error = new Error('test-error');

      storageService.storage.remove = jest
        .fn()
        .mockReturnValue(Promise.reject(_mockError));

      const storeSpy: jest.SpyInstance = jest.spyOn(storageService.storage, 'remove');
      const errorSpy: jest.SpyInstance = jest.spyOn(storageService, 'getCustomError');

      storageService.removeInventory();

      setTimeout((): void => {
        expect(storeSpy).toHaveBeenCalledWith(storageService.inventoryStorageKey);
        expect(errorSpy).toHaveBeenCalledWith('An error occurred trying to remove inventory from storage', _mockError);
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

    test('should get an error setting inventory', (done: jest.DoneCallback): void => {
      const _mockInventoryItem: InventoryItem = mockInventoryItem();
      const _mockError: Error = new Error('test-error');

      storageService.storage.set = jest
        .fn()
        .mockReturnValue(Promise.reject(_mockError));

      storageService.setInventory([_mockInventoryItem])
        .subscribe(
          (results: any): void => {
            console.log('Should not get results', results);
            expect(true).toBe(false);
          },
          (error: CustomError): void => {
            expect(error.message).toMatch('An error occurred trying to set inventory in storage');
            expect(error.userMessage).toMatch('test-error');
            done();
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

    test('should handle library not found', (done: jest.DoneCallback): void => {
      storageService.storage.get = jest
        .fn()
        .mockReturnValue(Promise.resolve(null));

      storageService.getLibrary()
        .subscribe(
          (libraries: LibraryStorage): void => {
            expect(libraries.grains).toStrictEqual([]);
            expect(libraries.hops).toStrictEqual([]);
            expect(libraries.yeast).toStrictEqual([]);
            expect(libraries.style).toStrictEqual([]);
            done();
          },
          (error: Error): void => {
            console.log(`Error in 'should handle library not found'`, error);
            expect(true).toBe(false);
          }
        );
    });

    test('should handle a library internal storage error', (done: jest.DoneCallback): void => {
      const _mockError: Error = new Error('test-error');

      storageService.storage.get = jest
        .fn()
        .mockReturnValue(Promise.reject(_mockError));

      storageService.getLibrary()
        .subscribe(
          (results: any): void => {
            console.log('Should not get results', results);
            expect(true).toBe(false);
          },
          (error: CustomError): void => {
            expect(error.message).toMatch('An error occurred trying to get library from storage');
            expect(error.userMessage).toMatch('test-error');
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

    test('should get an error setting library', (done: jest.DoneCallback): void => {
      const _mockLibraryStorage: LibraryStorage = mockLibraryStorage();
      const _mockError: Error = new Error('test-error');

      storageService.storage.set = jest
        .fn()
        .mockReturnValue(Promise.reject(_mockError));

      storageService.setLibrary(_mockLibraryStorage)
        .subscribe(
          (results: any): void => {
            console.log('Should not get results', results);
            expect(true).toBe(false);
          },
          (error: CustomError): void => {
            expect(error.message).toMatch('An error occurred trying to set library in storage');
            expect(error.userMessage).toMatch('test-error');
            done();
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

    test('should handle recipes not found', (done: jest.DoneCallback): void => {
      storageService.storage.get = jest
        .fn()
        .mockReturnValue(Promise.resolve(null));

      storageService.getRecipes()
        .subscribe(
          (recipes: RecipeMaster[]): void => {
            expect(recipes).toStrictEqual([]);
            done();
          },
          (error: Error): void => {
            console.log(`Error in 'should handle recipes not found'`, error);
            expect(true).toBe(false);
          }
        );
    });

    test('should handle a recipe internal storage error', (done: jest.DoneCallback): void => {
      const _mockError: Error = new Error('test-error');

      storageService.storage.get = jest
        .fn()
        .mockReturnValue(Promise.reject(_mockError));

      storageService.getRecipes()
        .subscribe(
          (results: any): void => {
            console.log('Should not get results', results);
            expect(true).toBe(false);
          },
          (error: CustomError): void => {
            expect(error.message).toMatch('An error occurred trying to get recipes from storage');
            expect(error.userMessage).toMatch('test-error');
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
      const _mockError: Error = new Error('test-error');

      storageService.storage.remove = jest
        .fn()
        .mockReturnValue(Promise.reject(_mockError));

      const errorSpy: jest.SpyInstance = jest.spyOn(storageService, 'getCustomError');
      const storeSpy: jest.SpyInstance = jest.spyOn(storageService.storage, 'remove');

      storageService.removeRecipes();

      setTimeout((): void => {
        expect(storeSpy).toHaveBeenCalledWith(storageService.recipeStorageKey);
        expect(errorSpy).toHaveBeenCalledWith('An error occurred trying to remove recipes from storage', _mockError);
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

    test('should get an error setting recipes', (done: jest.DoneCallback): void => {
      const _mockRecipeMasterActive: RecipeMaster = mockRecipeMasterActive();
      const _mockError: Error = new Error('test-error');

      storageService.storage.set = jest
        .fn()
        .mockReturnValue(Promise.reject(_mockError));

      storageService.setRecipes([_mockRecipeMasterActive])
        .subscribe(
          (results: any): void => {
            console.log('Should not get results', results);
            expect(true).toBe(false);
          },
          (error: CustomError): void => {
            expect(error.message).toMatch('An error occurred trying to set recipes in storage');
            expect(error.userMessage).toMatch('test-error');
            done();
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

    test('should handle sync flags not found', (done: jest.DoneCallback): void => {
      storageService.storage.get = jest
        .fn()
        .mockReturnValue(Promise.resolve(null));

      storageService.getSyncFlags()
        .subscribe(
          (flags: SyncMetadata[]): void => {
            expect(flags).not.toBeNull();
            expect(flags).toStrictEqual([]);
            done();
          },
          (error: any): void => {
            console.log(`Error in 'should get an error if sync flags not found'`, error);
            expect(true).toBe(false);
          }
        );
    });

    test('should handle a sync flag internal storage error', (done: jest.DoneCallback): void => {
      const _mockError: Error = new Error('test-error');

      storageService.storage.get = jest
        .fn()
        .mockReturnValue(Promise.reject(_mockError));

      storageService.getSyncFlags()
        .subscribe(
          (results: any): void => {
            console.log('Should not get results', results);
            expect(true).toBe(false);
          },
          (error: CustomError): void => {
            expect(error.message).toMatch('An error occurred trying to get sync flags from storage');
            expect(error.userMessage).toMatch('test-error');
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
      const _mockError: Error = new Error('test-error');

      storageService.storage.remove = jest
        .fn()
        .mockReturnValue(Promise.reject(_mockError));

      const storeSpy: jest.SpyInstance = jest.spyOn(storageService.storage, 'remove');
      const errorSpy: jest.SpyInstance = jest.spyOn(storageService, 'getCustomError');

      storageService.removeSyncFlags();

      setTimeout((): void => {
        expect(storeSpy).toHaveBeenCalledWith(storageService.syncStorageKey);
        expect(errorSpy).toHaveBeenCalledWith('An error occurred trying to remove sync flags from storage', _mockError);
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

    test('should get an error setting sync flags', (done: jest.DoneCallback): void => {
      const _mockSyncMetadata: SyncMetadata = mockSyncMetadata('create', 'docid', 'doctype');
      const _mockError: Error = new Error('test-error');

      storageService.storage.set = jest
        .fn()
        .mockReturnValue(Promise.reject(_mockError));

      storageService.setSyncFlags([_mockSyncMetadata])
        .subscribe(
          (results: any): void => {
            console.log('Should not get results', results);
            expect(true).toBe(false);
          },
          (error: CustomError): void => {
            expect(error.message).toMatch('An error occurred trying to set sync flags in storage');
            expect(error.userMessage).toMatch('test-error');
            done();
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
      const _defaultEnglishUnits: SelectedUnits = defaultEnglishUnits();

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
              preferredUnitSystem: _defaultEnglishUnits.system,
              units: _defaultEnglishUnits
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
      const _mockError: Error = new Error('test-error');

      storageService.storage.remove = jest
        .fn()
        .mockReturnValue(Promise.reject(_mockError));

      const storeSpy: jest.SpyInstance = jest.spyOn(storageService.storage, 'remove');
      const errorSpy: jest.SpyInstance = jest.spyOn(storageService, 'getCustomError');

      storageService.removeUser();

      setTimeout((): void => {
        expect(storeSpy).toHaveBeenCalledWith(storageService.userStorageKey);
        expect(errorSpy).toHaveBeenCalledWith('An error occurred trying to remove user from storage', _mockError);
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

    test('should get an error setting user', (done: jest.DoneCallback): void => {
      const _mockUser: User = mockUser();
      const _mockError: Error = new Error('test-error');

      storageService.storage.set = jest
        .fn()
        .mockReturnValue(Promise.reject(_mockError));

      storageService.setUser(_mockUser)
        .subscribe(
          (results: any): void => {
            console.log('Should not get results', results);
            expect(true).toBe(false);
          },
          (error: CustomError): void => {
            expect(error.message).toMatch('An error occurred trying to set user in storage');
            expect(error.userMessage).toMatch('test-error');
            done();
          }
        );
    });

  });

});
