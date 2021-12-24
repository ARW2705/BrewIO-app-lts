/* Module imports */
import { TestBed, getTestBed, async } from '@angular/core/testing';
import { File, FileEntry, Entry, IFile, FileError, Metadata } from '@ionic-native/file/ngx';
import { FilePath } from '@ionic-native/file-path/ngx';
import { WebView } from '@ionic-native/ionic-webview/ngx';
import { Observable, of, throwError } from 'rxjs';

/* Test configuration imports */
import { configureTestBed } from '@test/configure-test-bed';

/* Mock imports */
import { mockArrayBuffer, mockIFile, mockFileError, mockFileReader, mockFileMetadata, mockEntry, mockFileEntry } from '@test/mock-models';
import { FileStub, FilePathStub, WebViewStub } from '@test/ionic-stubs';
import { ErrorReportingServiceStub } from '@test/service-stubs';

/* Service imports */
import { ErrorReportingService } from '@services/public';
import { FileService } from './file.service';


describe('FileService', (): void => {
  configureTestBed();
  let injector: TestBed;
  let service: FileService;

  beforeAll(async((): void => {
    TestBed.configureTestingModule({
      providers: [
        FileService,
        { provide: ErrorReportingService, useClass: ErrorReportingServiceStub },
        { provide: File, useClass: FileStub },
        { provide: FilePath, useClass: FilePathStub },
        { provide: WebView, useClass: WebViewStub }
      ]
    });
  }));

  beforeEach((): void => {
    jest.clearAllMocks();
    injector = getTestBed();
    service = injector.get(FileService);

    service.errorReporter.handleGenericCatchError = jest.fn()
      .mockImplementation((): (error: any) => Observable<never> => {
        return (error: any) => throwError(error);
      });
  });

  test('should create the service', (): void => {
    expect(service).toBeDefined();
  });

  test('should convert a cordova file to js file', (done: jest.DoneCallback): void => {
    const _mockArrayBuffer: ArrayBuffer = mockArrayBuffer(10);
    const _mockIFile: IFile = mockIFile('image/jpeg', 10);
    const readerSpy: jest.SpyInstance = jest.spyOn(global, 'FileReader')
      .mockImplementation(() => mockFileReader(_mockArrayBuffer, null));

    service.convertCordovaFileToJSFile(_mockIFile)
      .subscribe(
        (result: string | ArrayBuffer): void => {
          expect(result['byteLength']).toEqual(10);
          done();
        },
        (error: any): void => {
          console.log(`Error on 'should convert a cordova file to js file'`, error);
          expect(true).toBe(false);
        }
      );

    readerSpy.mock.results[0].value.onload();
  });

  test('should get error converting a cordova file to js file', (done: jest.DoneCallback): void => {
    const _mockArrayBuffer: ArrayBuffer = mockArrayBuffer(10);
    const _mockIFile: IFile = mockIFile('image/jpeg', 10);
    const readerSpy: jest.SpyInstance = jest.spyOn(global, 'FileReader')
      .mockImplementation(() => mockFileReader(_mockArrayBuffer, 'got an error'));

    service.convertCordovaFileToJSFile(_mockIFile)
      .subscribe(
        (result: string | ArrayBuffer): void => {
          console.log('Should not get a result', result);
          expect(true).toBe(false);
        },
        (error: any): void => {
          expect(error).toMatch('file reader error: got an error');
          done();
        }
      );

    readerSpy.mock.results[0].value.onerror();
  });

  test('should convert a file entry to a cordova file', (done: jest.DoneCallback): void => {
    const _mockIFile: IFile = mockIFile('image/jpeg', 10);
    const _mockFileEntry: FileEntry = mockFileEntry({
      file: (success: ((data: any) => void), fail: (() => void)) => success(_mockIFile)
    });

    service.convertFileEntrytoCordovaFile(_mockFileEntry)
      .subscribe(
        (testFile: IFile): void => {
          expect(testFile).toStrictEqual(_mockIFile);
          done();
        },
        (error: string): void => {
          console.log(`Error on 'should convert a file entry to a cordova file'`, error);
          expect(true).toBe(false);
        }
      );
  });

  test('should get error converting a file entry to a cordova file', (done: jest.DoneCallback): void => {
    const _mockFileError: FileError = mockFileError();
    const _mockFileEntry: FileEntry = mockFileEntry({
      file: (success: (() => void), fail: ((error: any) => void)) => fail(_mockFileError)
    });

    service.convertFileEntrytoCordovaFile(_mockFileEntry)
      .subscribe(
        (testFile: IFile): void => {
          console.log('Should not get result', testFile);
          expect(true).toBe(false);
        },
        (error: string): void => {
          expect(error).toMatch('test-error');
          done();
        }
      );
  });

  test('should copy a file to temp dir', (done: jest.DoneCallback): void => {
    const _mockEntry: Entry = mockEntry({});
    const _mockFileMetadata: Metadata = mockFileMetadata();
    service.getMetadata = jest.fn().mockReturnValue(of(_mockFileMetadata));
    service.file.copyFile = jest.fn().mockReturnValue(Promise.resolve(_mockEntry));

    service.copyFileToLocalTmpDir('0', 'path', 'fileName', 'fileExt')
      .subscribe(
        ([entry, metadata]: [Entry, Metadata]): void => {
          expect(entry).toStrictEqual(_mockEntry);
          expect(metadata).toStrictEqual(_mockFileMetadata);
          done();
        },
        (error: any): void => {
          console.log(`Error in: 'should copy a file to temp dir'`, error);
          expect(true).toBe(false);
        }
      );
  });

  test('should delete a local file', (done: jest.DoneCallback): void => {
    const _mockIFile: IFile = mockIFile('');
    const _mockFileEntry: FileEntry = mockFileEntry({
      remove: (success: ((data: any) => void), fail: (() => void)) => success(_mockIFile)
    });
    service.file.resolveLocalFilesystemUrl = jest.fn()
      .mockReturnValue(Promise.resolve(_mockFileEntry));

    service.deleteLocalFile('path')
      .subscribe(
        (result: any): void => {
          expect(result).toBeNull();
          done();
        },
        (error: any): void => {
          console.log(`Error in: 'should delete a local file'`, error);
          expect(true).toBe(false);
        }
      );
  });

  test('should pass an error message (not set an error) deleting a local file', (done: jest.DoneCallback): void => {
    const _mockFileError: FileError = mockFileError();
    const _mockFileEntry: FileEntry = mockFileEntry({
      remove: (success: (() => void), fail: ((error: any) => void)) => fail(_mockFileError)
    });

    service.file.resolveLocalFilesystemUrl = jest.fn()
      .mockReturnValue(Promise.resolve(_mockFileEntry));

    service.deleteLocalFile('path')
      .subscribe(
        (result: any): void => {
          expect(result).toMatch('test-error');
          done();
        },
        (error: any): void => {
          console.log(`Error in: 'should delete a local file'`, error);
          expect(true).toBe(false);
        }
      );
  });

  test('should get a local file', (done: jest.DoneCallback): void => {
    const _mockArrayBuffer: ArrayBuffer = mockArrayBuffer(10);
    const _mockIFile: IFile = mockIFile('', 10);
    const _mockFileEntry: FileEntry = mockFileEntry({});
    service.file.resolveLocalFilesystemUrl = jest.fn()
      .mockReturnValue(Promise.resolve(_mockFileEntry));
    service.convertFileEntrytoCordovaFile = jest.fn()
      .mockReturnValue(of(_mockIFile));
    service.convertCordovaFileToJSFile = jest.fn()
      .mockReturnValue(of(_mockArrayBuffer));

    service.getLocalFile('path')
      .subscribe(
        (results: string | ArrayBuffer): void => {
          expect(results['byteLength']).toEqual(10);
          done();
        },
        (error: any): void => {
          console.log(`Error in: 'should get a local file'`, error);
          expect(true).toBe(false);
        }
      );
  });

  test('should get local url', (): void => {
    service.webview.convertFileSrc = jest.fn().mockReturnValue('localurl');

    expect(service.getLocalUrl('path')).toMatch('localurl');
  });

  test('should get metadata', (done: jest.DoneCallback): void => {
    const _mockFileMetadata: Metadata = mockFileMetadata();
    const _mockEntry: Entry = mockEntry({
      getMetadata: (success: ((data: any) => void), fail: (() => void)) => success(_mockFileMetadata)
    });

    service.getMetadata(_mockEntry)
      .subscribe(
        (results: Metadata): void => {
          expect(results).toStrictEqual(_mockFileMetadata);
          done();
        },
        (error: any): void => {
          console.log(`Error in: 'should get metadata'`, error);
          expect(true).toBe(false);
        }
      );
  });

  test('should get an error getting metadata', (done: jest.DoneCallback): void => {
    const _mockFileError: FileError = mockFileError();
    const _mockEntry: Entry = mockEntry({
      getMetadata: (success: (() => void), fail: ((error: any) => void)) => fail(_mockFileError)
    });

    service.getMetadata(_mockEntry)
      .subscribe(
        (results: any): void => {
          console.log('Should not get a result', results);
          expect(true).toBe(false);
        },
        (error: any): void => {
          expect(error).toStrictEqual(_mockFileError);
          done();
        }
      );
  });

  test('should get persistent local directory path', (): void => {
    expect(service.getPersistentDirPath()).toMatch('data');
  });

  test('should get tmp local directory path', (): void => {
    expect(service.getTmpDirPath()).toMatch('tmp');
  });

  test('should resolve native path', (done: jest.DoneCallback): void => {
    service.resolveNativePath('path')
      .subscribe(
        (nativePath: string): void => {
          expect(nativePath).toMatch('native-path');
          done();
        },
        (error: any): void => {
          console.log(`Error in: 'should resolve native path'`, error);
          expect(true).toBe(false);
        }
      );
  });

});
