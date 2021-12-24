/* Module imports */
import { TestBed, getTestBed, async } from '@angular/core/testing';
import { Storage } from '@ionic/storage';

/* Test configuration imports */
import { configureTestBed } from '@test/configure-test-bed';

/* Mock imports */
import { mockBatch, mockErrorReport, mockInventoryItem, mockLibraryStorage, mockRecipeMasterActive, mockSyncMetadata, mockUser } from '@test/mock-models';
import { StorageStub } from '@test/ionic-stubs';

/* Interface imports */
import { Batch, ErrorReport, LibraryStorage, InventoryItem, RecipeMaster, SelectedUnits, SyncMetadata, User } from '@shared/interfaces';

/* Type imports */
import { CustomError } from '@shared/types';

/* Default imports */
import { defaultEnglishUnits } from '@shared/defaults';

/* Service imports */
import { StorageService } from './storage.service';


describe('StorageService', (): void => {
  configureTestBed();
  let injector: TestBed;
  let service: StorageService;
  let originalCustomError: any;

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
    service = injector.get(StorageService);
    originalCustomError = service.getCustomError;
    service.getCustomError = jest.fn()
      .mockImplementation((message: string, error: Error): CustomError => {
        return new CustomError('TestError', message, 3, error.message);
      });
  });

  test('should create the service', (): void => {
    expect(service).toBeTruthy();
  });

  test('should get a custom storage error', (): void => {
    service.getCustomError = originalCustomError;
    const _mockError: Error = new Error('test-error');
    const baseMessage: string = 'test base error message';

    const customError: CustomError = service.getCustomError(baseMessage, _mockError);

    expect(customError.name).toMatch('StorageError');
    expect(customError.message).toMatch(`${baseMessage}: ${_mockError.message}`);
    expect(customError.severity).toEqual(3);
    expect(customError.userMessage).toMatch(baseMessage);
  });


  describe('Batch Storage', (): void => {

    test('should get batches', (done: jest.DoneCallback): void => {
      const _mockBatch: Batch = mockBatch();
      service.storage.get = jest.fn().mockReturnValue(Promise.resolve(JSON.stringify([_mockBatch])));

      service.getBatches(true)
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
      service.storage.get = jest.fn().mockReturnValue(Promise.resolve(null));

      service.getBatches(true)
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
      service.storage.get = jest.fn().mockReturnValue(Promise.reject(_mockError));

      service.getBatches(true)
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
      service.storage.remove = jest.fn().mockReturnValue(Promise.resolve(null));
      const storeSpy: jest.SpyInstance = jest.spyOn(service.storage, 'remove');
      const consoleSpy: jest.SpyInstance = jest.spyOn(console, 'log');

      service.removeBatches(true);

      setTimeout((): void => {
        expect(storeSpy).toHaveBeenCalledWith(service.activeBatchStorageKey);
        expect(consoleSpy.mock.calls[consoleSpy.mock.calls.length - 1][0]).toMatch('Active batch data cleared');
        done();
      }, 10);
    });

    test('should get an error removing batches', (done: jest.DoneCallback): void => {
      const _mockError: Error = new Error('test-error');
      service.storage.remove = jest.fn().mockReturnValue(Promise.reject(_mockError));
      const storeSpy: jest.SpyInstance = jest.spyOn(service.storage, 'remove');
      const errorSpy: jest.SpyInstance = jest.spyOn(service, 'getCustomError');

      service.removeBatches(false);

      setTimeout((): void => {
        expect(storeSpy).toHaveBeenCalledWith(service.archiveBatchStorageKey);
        expect(errorSpy).toHaveBeenCalledWith('An error occurred trying to remove batches from storage', _mockError);
        done();
      }, 10);
    });

    test('should set batches', (done: jest.DoneCallback): void => {
      const _mockBatch: Batch = mockBatch();
      service.storage.set = jest.fn().mockReturnValue(Promise.resolve(true));
      const storeSpy: jest.SpyInstance = jest.spyOn(service.storage, 'set');

      service.setBatches(true, [_mockBatch])
        .subscribe(
          (): void => {
            expect(storeSpy).toHaveBeenCalledWith(
              service.activeBatchStorageKey,
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
      service.storage.set = jest.fn().mockReturnValue(Promise.reject(_mockError));

      service.setBatches(true, [_mockBatch])
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
      service.storage.get = jest.fn()
        .mockReturnValue(Promise.resolve(JSON.stringify([_mockErrorReport])));

      service.getErrorReports()
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
      service.storage.get = jest.fn().mockReturnValue(Promise.resolve(null));

      service.getErrorReports()
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
      service.storage.get = jest.fn().mockReturnValue(Promise.reject(_mockError));

      service.getErrorReports()
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
      service.storage.remove = jest.fn().mockReturnValue(Promise.resolve(null));
      const storeSpy: jest.SpyInstance = jest.spyOn(service.storage, 'remove');
      const consoleSpy: jest.SpyInstance = jest.spyOn(console, 'log');

      service.removeErrorReports();

      setTimeout((): void => {
        expect(storeSpy).toHaveBeenCalledWith(service.errorReportStorageKey);
        expect(consoleSpy.mock.calls[consoleSpy.mock.calls.length - 1][0]).toMatch('Error reports cleared');
        done();
      }, 10);
    });

    test('should get an error removing error reports', (done: jest.DoneCallback): void => {
      const _mockError: Error = new Error('test-error');
      service.storage.remove = jest.fn().mockReturnValue(Promise.reject(_mockError));
      const storeSpy: jest.SpyInstance = jest.spyOn(service.storage, 'remove');
      const errorSpy: jest.SpyInstance = jest.spyOn(service, 'getCustomError');

      service.removeErrorReports();

      setTimeout((): void => {
        expect(storeSpy).toHaveBeenCalledWith(service.errorReportStorageKey);
        expect(errorSpy).toHaveBeenCalledWith('An error occurred trying to remove error reports from storage', _mockError);
        done();
      }, 10);
    });

    test('should set error reports', (done: jest.DoneCallback): void => {
      const _mockErrorReport: ErrorReport = mockErrorReport();
      service.storage.set = jest.fn().mockReturnValue(Promise.resolve(true));
      const storeSpy: jest.SpyInstance = jest.spyOn(service.storage, 'set');

      service.setErrorReports([_mockErrorReport])
        .subscribe(
          (): void => {
            expect(storeSpy).toHaveBeenCalledWith(
              service.errorReportStorageKey,
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
      service.storage.set = jest.fn().mockReturnValue(Promise.reject(_mockError));

      service.setErrorReports([_mockErrorReport])
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
      service.storage.get = jest.fn()
        .mockReturnValue(Promise.resolve(JSON.stringify([_mockInventoryItem])));

      service.getInventory()
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
      service.storage.get = jest.fn().mockReturnValue(Promise.resolve(null));

      service.getInventory()
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
      service.storage.get = jest.fn().mockReturnValue(Promise.reject(_mockError));

      service.getInventory()
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
      service.storage.remove = jest.fn().mockReturnValue(Promise.resolve(null));
      const storeSpy: jest.SpyInstance = jest.spyOn(service.storage, 'remove');
      const consoleSpy: jest.SpyInstance = jest.spyOn(console, 'log');

      service.removeInventory();

      setTimeout((): void => {
        expect(storeSpy).toHaveBeenCalledWith(service.inventoryStorageKey);
        expect(consoleSpy.mock.calls[consoleSpy.mock.calls.length - 1][0]).toMatch('Inventory data cleared');
        done();
      }, 10);
    });

    test('should get an error removing inventory', (done: jest.DoneCallback): void => {
      const _mockError: Error = new Error('test-error');
      service.storage.remove = jest.fn().mockReturnValue(Promise.reject(_mockError));
      const storeSpy: jest.SpyInstance = jest.spyOn(service.storage, 'remove');
      const errorSpy: jest.SpyInstance = jest.spyOn(service, 'getCustomError');

      service.removeInventory();

      setTimeout((): void => {
        expect(storeSpy).toHaveBeenCalledWith(service.inventoryStorageKey);
        expect(errorSpy).toHaveBeenCalledWith('An error occurred trying to remove inventory from storage', _mockError);
        done();
      }, 10);
    });

    test('should set inventory', (done: jest.DoneCallback): void => {
      const _mockInventoryItem: InventoryItem = mockInventoryItem();
      service.storage.set = jest.fn().mockReturnValue(Promise.resolve(true));
      const storeSpy: jest.SpyInstance = jest.spyOn(service.storage, 'set');

      service.setInventory([_mockInventoryItem])
        .subscribe(
          (): void => {
            expect(storeSpy).toHaveBeenCalledWith(
              service.inventoryStorageKey,
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
      service.storage.set = jest.fn().mockReturnValue(Promise.reject(_mockError));

      service.setInventory([_mockInventoryItem])
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
      service.storage.get = jest.fn()
        .mockReturnValue(Promise.resolve(JSON.stringify(_mockLibraryStorage)));

      service.getLibrary()
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
      service.storage.get = jest.fn().mockReturnValue(Promise.resolve(null));

      service.getLibrary()
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
      service.storage.get = jest.fn().mockReturnValue(Promise.reject(_mockError));

      service.getLibrary()
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
      service.storage.set = jest.fn().mockReturnValue(Promise.resolve(true));
      const storeSpy: jest.SpyInstance = jest.spyOn(service.storage, 'set');

      service.setLibrary(_mockLibraryStorage)
        .subscribe(
          (): void => {
            expect(storeSpy).toHaveBeenCalledWith(
              service.libraryStorageKey,
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
      service.storage.set = jest.fn().mockReturnValue(Promise.reject(_mockError));

      service.setLibrary(_mockLibraryStorage)
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
      service.storage.get = jest.fn()
        .mockReturnValue(Promise.resolve(JSON.stringify([_mockRecipeMasterActive])));

      service.getRecipes()
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
      service.storage.get = jest.fn().mockReturnValue(Promise.resolve(null));

      service.getRecipes()
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
      service.storage.get = jest.fn().mockReturnValue(Promise.reject(_mockError));

      service.getRecipes()
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
      service.storage.remove = jest.fn().mockReturnValue(Promise.resolve(null));
      const storeSpy: jest.SpyInstance = jest.spyOn(service.storage, 'remove');
      const consoleSpy: jest.SpyInstance = jest.spyOn(console, 'log');

      service.removeRecipes();

      setTimeout((): void => {
        expect(storeSpy).toHaveBeenCalledWith(service.recipeStorageKey);
        expect(consoleSpy.mock.calls[consoleSpy.mock.calls.length - 1][0]).toMatch('Recipe data cleared');
        done();
      }, 10);
    });

    test('should get an error removing recipes', (done: jest.DoneCallback): void => {
      const _mockError: Error = new Error('test-error');
      service.storage.remove = jest.fn().mockReturnValue(Promise.reject(_mockError));
      const errorSpy: jest.SpyInstance = jest.spyOn(service, 'getCustomError');
      const storeSpy: jest.SpyInstance = jest.spyOn(service.storage, 'remove');

      service.removeRecipes();

      setTimeout((): void => {
        expect(storeSpy).toHaveBeenCalledWith(service.recipeStorageKey);
        expect(errorSpy).toHaveBeenCalledWith('An error occurred trying to remove recipes from storage', _mockError);
        done();
      }, 10);
    });

    test('should set recipes', (done: jest.DoneCallback): void => {
      const _mockRecipeMasterActive: RecipeMaster = mockRecipeMasterActive();
      service.storage.set = jest.fn().mockReturnValue(Promise.resolve(true));
      const storeSpy: jest.SpyInstance = jest.spyOn(service.storage, 'set');

      service.setRecipes([_mockRecipeMasterActive])
        .subscribe(
          (): void => {
            expect(storeSpy).toHaveBeenCalledWith(
              service.recipeStorageKey,
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
      service.storage.set = jest.fn().mockReturnValue(Promise.reject(_mockError));

      service.setRecipes([_mockRecipeMasterActive])
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
      service.storage.get = jest.fn()
        .mockReturnValue(Promise.resolve(JSON.stringify([_mockSyncMetadata])));

      service.getSyncFlags()
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
      service.storage.get = jest.fn().mockReturnValue(Promise.resolve(null));

      service.getSyncFlags()
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
      service.storage.get = jest.fn().mockReturnValue(Promise.reject(_mockError));

      service.getSyncFlags()
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
      service.storage.remove = jest.fn().mockReturnValue(Promise.resolve(null));
      const storeSpy: jest.SpyInstance = jest.spyOn(service.storage, 'remove');
      const consoleSpy: jest.SpyInstance = jest.spyOn(console, 'log');

      service.removeSyncFlags();

      setTimeout((): void => {
        expect(storeSpy).toHaveBeenCalledWith(service.syncStorageKey);
        expect(consoleSpy.mock.calls[consoleSpy.mock.calls.length - 1][0]).toMatch('Sync flags cleared');
        done();
      }, 10);
    });

    test('should get an error removing sync flags', (done: jest.DoneCallback): void => {
      const _mockError: Error = new Error('test-error');
      service.storage.remove = jest.fn().mockReturnValue(Promise.reject(_mockError));
      const storeSpy: jest.SpyInstance = jest.spyOn(service.storage, 'remove');
      const errorSpy: jest.SpyInstance = jest.spyOn(service, 'getCustomError');

      service.removeSyncFlags();

      setTimeout((): void => {
        expect(storeSpy).toHaveBeenCalledWith(service.syncStorageKey);
        expect(errorSpy).toHaveBeenCalledWith('An error occurred trying to remove sync flags from storage', _mockError);
        done();
      }, 10);
    });

    test('should set sync flags', (done: jest.DoneCallback): void => {
      const _mockSyncMetadata: SyncMetadata = mockSyncMetadata('method', 'docId', 'docType');
      service.storage.set = jest.fn().mockReturnValue(Promise.resolve(true));
      const storeSpy: jest.SpyInstance = jest.spyOn(service.storage, 'set');

      service.setSyncFlags([_mockSyncMetadata])
        .subscribe(
          (): void => {
            expect(storeSpy).toHaveBeenCalledWith(
              service.syncStorageKey,
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
      service.storage.set = jest.fn().mockReturnValue(Promise.reject(_mockError));

      service.setSyncFlags([_mockSyncMetadata])
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
      service.storage.get = jest.fn()
        .mockReturnValue(Promise.resolve(JSON.stringify(_mockUser)));

      service.getUser()
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
      service.storage.get = jest.fn().mockReturnValue(Promise.resolve(null));

      service.getUser()
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
      service.storage.remove = jest.fn().mockReturnValue(Promise.resolve(null));
      const storeSpy: jest.SpyInstance = jest.spyOn(service.storage, 'remove');
      const consoleSpy: jest.SpyInstance = jest.spyOn(console, 'log');

      service.removeUser();

      setTimeout((): void => {
        expect(storeSpy).toHaveBeenCalledWith(service.userStorageKey);
        expect(consoleSpy.mock.calls[consoleSpy.mock.calls.length - 1][0]).toMatch('User data cleared');
        done();
      }, 10);
    });

    test('should get an error removing user', (done: jest.DoneCallback): void => {
      const _mockError: Error = new Error('test-error');
      service.storage.remove = jest.fn().mockReturnValue(Promise.reject(_mockError));
      const storeSpy: jest.SpyInstance = jest.spyOn(service.storage, 'remove');
      const errorSpy: jest.SpyInstance = jest.spyOn(service, 'getCustomError');

      service.removeUser();

      setTimeout((): void => {
        expect(storeSpy).toHaveBeenCalledWith(service.userStorageKey);
        expect(errorSpy).toHaveBeenCalledWith('An error occurred trying to remove user from storage', _mockError);
        done();
      }, 10);
    });

    test('should set user', (done: jest.DoneCallback): void => {
      const _mockUser: User = mockUser();
      service.storage.set = jest.fn().mockReturnValue(Promise.resolve(true));
      const storeSpy: jest.SpyInstance = jest.spyOn(service.storage, 'set');

      service.setUser(_mockUser)
        .subscribe(
          (): void => {
            expect(storeSpy).toHaveBeenCalledWith(
              service.userStorageKey,
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
      service.storage.set = jest.fn().mockReturnValue(Promise.reject(_mockError));

      service.setUser(_mockUser)
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
