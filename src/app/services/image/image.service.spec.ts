/* Module imports */
import { TestBed, getTestBed, async } from '@angular/core/testing';
import { Camera } from '@ionic-native/camera/ngx';
import { Entry } from '@ionic-native/file/ngx';
import { Crop } from '@ionic-native/crop/ngx';
import { ImageResizer } from '@ionic-native/image-resizer/ngx';
import { Observable, of, throwError } from 'rxjs';

/* Test configuration imports */
import { configureTestBed } from '../../../../test-config/configure-test-bed';

/* Mock imports */
import { mockImage, mockImageRequestFormData, mockEntry, mockFileMetadata  } from '../../../../test-config/mock-models';
import { CameraStub, CropStub, ImageResizerStub } from '../../../../test-config/ionic-stubs';
import { IdServiceStub, ErrorReportingServiceStub, FileServiceStub, TypeGuardServiceStub } from '../../../../test-config/service-stubs';

/* Default imports */
import { defaultImage } from '../../shared/defaults';

/* Interface imports */
import { Image, ImageRequestFormData, ImageRequestMetadata } from '../../shared/interfaces';

/* Type imports */
import { CustomError } from '../../shared/types';

/* Service imports */
import { ImageService } from './image.service';
import { IdService, ErrorReportingService, FileService, TypeGuardService } from '../services';


describe('ImageService', (): void => {
  configureTestBed();
  let injector: TestBed;
  let service: ImageService;

  beforeAll(async((): void => {
    TestBed.configureTestingModule({
      providers: [
        ImageService,
        { provide: Camera, useClass: CameraStub },
        { provide: Crop, useClass: CropStub },
        { provide: ErrorReportingService, useClass: ErrorReportingServiceStub },
        { provide: FileService, useClass: FileServiceStub },
        { provide: IdService, useClass: IdServiceStub },
        { provide: ImageResizer, useClass: ImageResizerStub },
        { provide: TypeGuardService, useClass: TypeGuardServiceStub }
      ]
    });
  }));

  beforeEach((): void => {
    injector = getTestBed();
    service = injector.get(ImageService);
    service.errorReporter.handleGenericCatchError = jest.fn()
      .mockImplementation((): (error: any) => Observable<never> => {
        return (error: any): Observable<never> => throwError(error);
      });
  });

  test('should create the service', (): void => {
    expect(service).toBeTruthy();
  });

  describe('Device Actions', (): void => {

    test('should copy image to local tmp dir', (done: jest.DoneCallback): void => {
      const _mockEntry: Entry = mockEntry({
        nativeURL: 'native-url'
      });
      const _mockFileMetadata = mockFileMetadata();
      service.idService.getNewId = jest.fn().mockReturnValue('0');
      service.fileService.copyFileToLocalTmpDir = jest.fn()
      .mockReturnValue(of([_mockEntry, _mockFileMetadata]));
      service.fileService.getLocalUrl = jest.fn()
      .mockReturnValue('local-url');

      service.copyImageToLocalTmpDir('path', 'fileName')
      .subscribe(
        (image: Image): void => {
          expect(image).toStrictEqual({
            cid: '0',
            filePath: 'native-url',
            fileSize: _mockFileMetadata.size,
            hasPending: true,
            localURL: 'local-url',
            url: 'local-url'
          });
          done();
        },
        (error: any): void => {
          console.log(`Error in 'should copy image to local tmp dir'`, error);
          expect(true).toBe(false);
        }
      );
    });

    test('should delete local image', (done: jest.DoneCallback): void => {
      service.fileService.deleteLocalFile = jest.fn().mockReturnValue(of(null));

      service.deleteLocalImage('path')
      .subscribe(
        (results: null): void => {
          expect(results).toBeNull();
          done();
        },
        (error: any): void => {
          console.log(`Error in 'should delete local image'`, error);
          expect(true).toBe(false);
        }
      );
    });

    test('should throw an error deleting local image', (done: jest.DoneCallback): void => {
      service.deleteLocalImage(null)
      .subscribe(
        (results: any): void => {
          console.log('Should not get a result', results);
          expect(true).toBe(false);
        },
        (error: CustomError): void => {
          expect(error.message).toMatch('Deletion error: invalid file path: null');
          done();
        }
      );
    });

    test('should import an image', (done: jest.DoneCallback): void => {
      const _mockImage: Image = mockImage();
      service.camera.getPicture = jest.fn().mockReturnValue(Promise.resolve('image-path'));
      service.crop.crop = jest.fn()
      .mockReturnValue(Promise.resolve('crop-path/additional-path'));
      service.fileService.resolveNativePath = jest.fn()
      .mockReturnValue(of('native-path/additional-path'));
      service.copyImageToLocalTmpDir = jest.fn()
      .mockReturnValue(of(_mockImage));
      const picSpy: jest.SpyInstance = jest.spyOn(service.camera, 'getPicture');
      const cropSpy: jest.SpyInstance = jest.spyOn(service.crop, 'crop');
      const rnpSpy: jest.SpyInstance = jest.spyOn(service.fileService, 'resolveNativePath');
      const copySpy: jest.SpyInstance = jest.spyOn(service, 'copyImageToLocalTmpDir');

      service.importImage()
      .subscribe(
        (): void => {
          expect(picSpy).toHaveBeenCalledWith({
            quality: 100,
            sourceType: 0,
            saveToPhotoAlbum: false,
            correctOrientation: true,
            encodingType: 0,
            mediaType: 0
          });
          expect(cropSpy).toHaveBeenCalledWith('image-path');
          expect(rnpSpy).toHaveBeenCalledWith('crop-path/additional-path');
          expect(copySpy).toHaveBeenCalledWith('native-path/', 'crop-path/');
          done();
        },
        (error: any): void => {
          console.log(`Error in 'should import an image'`, error);
          expect(true).toBe(false);
        }
      );
    });

    test('should handle error importing image by rethrowing error', (done: jest.DoneCallback): void => {
      const _mockError: Error = new Error('test-error');
      service.camera.getPicture = jest.fn().mockReturnValue(Promise.reject(_mockError));
      service.errorReporter.handleGenericCatchError = jest.fn()
      .mockReturnValue((error: Error): Observable<never> => throwError(error));

      service.importImage()
      .subscribe(
        (results: any): void => {
          console.log('should not get any results', results);
          expect(true).toBe(false);
        },
        (error: Error): void => {
          expect(error).toStrictEqual(_mockError);
          done();
        }
      );
    });

    test('should handle error importing image by emitting null', (done: jest.DoneCallback): void => {
      service.camera.getPicture = jest.fn().mockReturnValue(Promise.reject({}));
      service.errorReporter.handleGenericCatchError = jest.fn()
      .mockReturnValue((error: Error): Observable<never> => throwError(error));

      service.importImage()
      .subscribe(
        (expected: null): void => {
          expect(expected).toBeNull();
          done();
        },
        (error: any): void => {
          console.log('should not get an error', error);
          expect(true).toBe(false);
        }
      );
    });

    test('should store image to local dir', (done: jest.DoneCallback): void => {
      const _mockImage: Image = mockImage();
      service.isTempImage = jest.fn().mockReturnValue(true);
      service.resizeImage = jest.fn().mockReturnValue(of('new-resized-path'));
      service.fileService.getLocalUrl = jest.fn().mockReturnValue('new-local-url');
      service.fileService.getTmpDirPath = jest.fn().mockReturnValue('tmp-dir');
      service.deleteLocalImage = jest.fn().mockReturnValue(of(null));

      service.storeImageToLocalDir(_mockImage)
      .subscribe(
        (finalImage: Image): void => {
          expect(finalImage.filePath).toMatch('new-resized-path');
          expect(finalImage.localURL).toMatch('new-local-url');
          expect(finalImage.url).toMatch('new-local-url');
          done();
        },
        (error: any): void => {
          console.log(`Error in 'should store image to local dir'`, error);
          expect(true).toBe(false);
        }
      );
    });

    test('should store image to local dir and delete old image', (done: jest.DoneCallback): void => {
      const _mockImage: Image = mockImage();
      service.isTempImage = jest.fn().mockReturnValue(true);
      service.resizeImage = jest.fn().mockReturnValue(of('new-resized-path'));
      service.fileService.getLocalUrl = jest.fn().mockReturnValue('new-local-url');
      service.fileService.getTmpDirPath = jest.fn().mockReturnValue('tmp-dir');
      service.deleteLocalImage = jest.fn().mockReturnValue(of(null));
      const deleteSpy: jest.SpyInstance = jest.spyOn(service, 'deleteLocalImage');

      service.storeImageToLocalDir(_mockImage, 'deletion-path')
      .subscribe(
        (): void => {
          expect(deleteSpy).toHaveBeenCalledTimes(2);
          done();
        },
        (error: any): void => {
          console.log(`Error in 'should store image to local dir and delete old image'`, error);
          expect(true).toBe(false);
        }
      );
    });

    test('should not resize and store an already stored image', (done: jest.DoneCallback): void => {
      const _mockImage: Image = mockImage();
      service.isTempImage = jest.fn().mockReturnValue(false);

      service.storeImageToLocalDir(_mockImage, 'deletion-path')
      .subscribe(
        (image: Image): void => {
          expect(image).toStrictEqual(_mockImage);
          done();
        },
        (error: any): void => {
          console.log(`Error in 'should not resize and store an already stored image'`, error);
          expect(true).toBe(false);
        }
      );
    });

  });


  describe('File Conversion', (): void => {

    test('should resize an image', (done: jest.DoneCallback): void => {
      const _mockImage: Image = mockImage();
      _mockImage.fileSize = 1000 * 1024;
      _mockImage.filePath = 'tmp/file/file.jpg';
      service.imageResizer.resize = jest.fn().mockReturnValue(Promise.resolve(''));
      service.fileService.getPersistentDirPath = jest.fn().mockReturnValue('data/');
      const resizeSpy: jest.SpyInstance = jest.spyOn(service.imageResizer, 'resize');

      service.resizeImage(_mockImage)
      .subscribe(
        (): void => {
          expect(resizeSpy).toHaveBeenCalledWith({
            uri: 'tmp/file/file.jpg',
            folderName: 'data/',
            fileName: 'file.jpg',
            quality: 50,
            width: 300,
            height: 300,
            base64: false
          });
          done();
        },
        (error: any): void => {
          console.log(`Error in 'should resize an image'`, error);
          expect(true).toBe(false);
        }
      );
    });

    test('should not resize an image that is missing a fileSize', (done: jest.DoneCallback): void => {
      const _mockImage: Image = mockImage();
      delete _mockImage.fileSize;
      const resizeSpy: jest.SpyInstance = jest.spyOn(service.imageResizer, 'resize');

      service.resizeImage(_mockImage)
      .subscribe(
        (path: string): void => {
          expect(path).toMatch(_mockImage.filePath);
          expect(resizeSpy).not.toHaveBeenCalled();
          done();
        },
        (error: any): void => {
          console.log(`Error in 'should not resize an image that is missing a fileSize'`, error);
          expect(true).toBe(false);
        }
      );
    });

  });


  describe('Server Upload Helpers', (): void => {

    test('should prepare an image for upload', (done: jest.DoneCallback): void => {
      const _mockImageRequestFormData1: ImageRequestFormData = mockImageRequestFormData();
      const _mockImageRequestFormData2: ImageRequestFormData = mockImageRequestFormData();
      _mockImageRequestFormData2.name = 'other-test-img';
      _mockImageRequestFormData2.image.cid = '1';
      _mockImageRequestFormData2.image.filePath = 'other-file-path';
      const _mockImageRequestFormData3: ImageRequestFormData = mockImageRequestFormData();
      service.isTempImage = jest.fn()
      .mockReturnValueOnce(false)
      .mockReturnValueOnce(false)
      .mockReturnValueOnce(true);
      service.fileService.getLocalFile = jest.fn()
      .mockImplementation((path: string): Observable<string | ArrayBuffer> => {
        return of(new ArrayBuffer(path.length));
      });
      const getSpy: jest.SpyInstance = jest.spyOn(service.fileService, 'getLocalFile');

      service.blobbifyImages([_mockImageRequestFormData1, _mockImageRequestFormData2, _mockImageRequestFormData3])
      .subscribe(
        (reqMetadata: ImageRequestMetadata[]): void => {
          expect(reqMetadata.length).toEqual(2);
          expect(reqMetadata[0].name).toMatch(_mockImageRequestFormData1.name);
          expect(reqMetadata[0].blob.type).toMatch('image/jpeg');
          expect(reqMetadata[0].filename).toMatch('0.jpg');
          expect(reqMetadata[1].name).toMatch(_mockImageRequestFormData2.name);
          expect(reqMetadata[1].blob.type).toMatch('image/jpeg');
          expect(reqMetadata[1].filename).toMatch('1.jpg');
          expect(getSpy).toHaveBeenCalledTimes(2);
          done();
        },
        (error: any): void => {
          console.log(`Error in 'should prepare an image for upload'`, error);
          expect(true).toBe(false);
        }
      );
    });

  });


  describe('Other Methods', (): void => {

    test('should get the server url for a filename', (): void => {
      expect(service.getServerURL('12345').includes('/images/12345.jpg')).toBe(true);
    });

    test('should handle an image error event', (): void => {
      const _mockImage: Image = mockImage();
      _mockImage.url = _mockImage.localURL;
      service.getServerURL = jest.fn().mockReturnValue('/images/server-filename.jpg');

      service.handleImageError(_mockImage);

      expect(_mockImage.url).toMatch('/images/server-filename.jpg');

      service.handleImageError(_mockImage);

      expect(_mockImage.url).toMatch(defaultImage().url);
    });

    test('should check if image is the default image', (): void => {
      const _mockImage: Image = mockImage();
      _mockImage.cid = '12345';
      const _defaultImage: Image = defaultImage();

      expect(service.hasDefaultImage(_mockImage)).toBe(false);
      expect(service.hasDefaultImage(_defaultImage)).toBe(true);
    });

    test('should check if image is stored in tmp dir', (): void => {
      service.fileService.getTmpDirPath = jest.fn().mockReturnValue('tmp/');
      const _mockImage: Image = mockImage();
      _mockImage.filePath = 'tmp/12345.jpg';

      expect(service.isTempImage(_mockImage)).toBe(true);

      _mockImage.filePath = 'data/12345.jpg';

      expect(service.isTempImage(_mockImage)).toBe(false);

      delete _mockImage.filePath;

      expect(service.isTempImage(_mockImage)).toBe(false);
      expect(service.isTempImage(null)).toBe(false);
    });

    test('should type check a given image', (): void => {
      const _mockImage: Image = mockImage();
      service.typeGuard.hasValidProperties = jest.fn()
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(false);

      expect(service.isSafeImage(_mockImage)).toBe(true);
      expect(service.isSafeImage(null)).toBe(false);
    });

    test('should set image\'s initial url', (): void => {
      service.getServerURL = jest.fn().mockReturnValue('/images/12345');
      const _mockImage: Image = mockImage();

      service.setInitialURL(null);

      expect(_mockImage.url).toMatch('url');

      service.setInitialURL(_mockImage);

      expect(_mockImage.url).toMatch(_mockImage.localURL);
      delete _mockImage.localURL;

      service.setInitialURL(_mockImage);

      expect(_mockImage.url).toMatch('/images/12345');
      delete _mockImage.serverFilename;

      service.setInitialURL(_mockImage);

      const _defaultImage: Image = defaultImage();
      expect(_mockImage.url).toMatch(_defaultImage.url);
    });
    
  });

});
