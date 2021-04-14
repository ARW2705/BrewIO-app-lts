/* Module imports */
import { TestBed, getTestBed, async } from '@angular/core/testing';
import { Camera } from '@ionic-native/camera/ngx';
import { Entry } from '@ionic-native/file/ngx';
import { Crop } from '@ionic-native/crop/ngx';
import { ImageResizer } from '@ionic-native/image-resizer/ngx';
import { Observable, of } from 'rxjs';

/* Test configuration imports */
import { configureTestBed } from '../../../../test-config/configure-test-bed';

/* Mock imports */
import { mockImage, mockImageRequestFormData } from '../../../../test-config/mock-models/mock-image';
import { mockEntry } from '../../../../test-config/mock-models/mock-entry';
import { mockFileMetadata } from '../../../../test-config/mock-models/mock-file-metadata';
import { CameraMock, CropMock, ImageResizerMock } from '../../../../test-config/mocks-ionic';
import { ClientIdServiceMock, FileServiceMock } from '../../../../test-config/mocks-app';

/* Default imports */
import { defaultImage } from '../../shared/defaults/default-image';

/* Interface imports */
import { Image, ImageRequestFormData, ImageRequestMetadata } from '../../shared/interfaces/image';

/* Service imports */
import { ImageService } from './image.service';
import { ClientIdService } from '../client-id/client-id.service';
import { FileService } from '../file/file.service';


describe('ImageService', (): void => {
  let injector: TestBed;
  let imageService: ImageService;
  configureTestBed();

  beforeAll(async((): void => {
    TestBed.configureTestingModule({
      providers: [
        ImageService,
        { provide: ClientIdService, useClass: ClientIdServiceMock },
        { provide: FileService, useClass: FileServiceMock },
        { provide: Camera, useClass: CameraMock },
        { provide: Crop, useClass: CropMock },
        { provide: ImageResizer, useClass: ImageResizerMock }
      ]
    });
  }));

  beforeEach((): void => {
    injector = getTestBed();
    imageService = injector.get(ImageService);
  });

  test('should create the service', () => {
    expect(imageService).toBeDefined();
  });

  test('should copy image to local tmp dir', (done: jest.DoneCallback): void => {
    const _mockEntry: Entry = mockEntry({
      nativeURL: 'native-url'
    });
    const _mockFileMetadata = mockFileMetadata();

    imageService.clientIdService.getNewId = jest
      .fn()
      .mockReturnValue('0');

    imageService.fileService.copyFileToLocalTmpDir = jest
      .fn()
      .mockReturnValue(of([_mockEntry, _mockFileMetadata]));

    imageService.fileService.getLocalUrl = jest
      .fn()
      .mockReturnValue('local-url');

    imageService.copyImageToLocalTmpDir('path', 'fileName')
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
    imageService.fileService.deleteLocalFile = jest
      .fn()
      .mockReturnValue(of(null));

    imageService.deleteLocalImage('path')
      .subscribe(
        (results: any): void => {
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
    imageService.deleteLocalImage(null)
      .subscribe(
        (results: any): void => {
          console.log('Should not get a result', results);
          expect(true).toBe(false);
        },
        (error: string): void => {
          expect(error).toMatch('Deletion error: invalid file path: null');
          done();
        }
      );
  });

  test('should import an image', (done: jest.DoneCallback): void => {
    const _mockImage: Image = mockImage();

    imageService.camera.getPicture = jest
      .fn()
      .mockReturnValue(Promise.resolve('image-path'));

    imageService.crop.crop = jest
      .fn()
      .mockReturnValue(Promise.resolve('crop-path/additional-path'));

    imageService.fileService.resolveNativePath = jest
      .fn()
      .mockReturnValue(of('native-path/additional-path'));

    imageService.copyImageToLocalTmpDir = jest
      .fn()
      .mockReturnValue(of(_mockImage));

    const picSpy: jest.SpyInstance = jest.spyOn(imageService.camera, 'getPicture');
    const cropSpy: jest.SpyInstance = jest.spyOn(imageService.crop, 'crop');
    const rnpSpy: jest.SpyInstance = jest.spyOn(imageService.fileService, 'resolveNativePath');
    const copySpy: jest.SpyInstance = jest.spyOn(imageService, 'copyImageToLocalTmpDir');

    imageService.importImage()
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

  test('should store image to local dir', (done: jest.DoneCallback): void => {
    const _mockImage: Image = mockImage();

    imageService.isTempImage = jest
      .fn()
      .mockReturnValue(true);

    imageService.resizeImage = jest
      .fn()
      .mockReturnValue(of('new-resized-path'));

    imageService.fileService.getLocalUrl = jest
      .fn()
      .mockReturnValue('new-local-url');

    imageService.fileService.getTmpDirPath = jest
      .fn()
      .mockReturnValue('tmp-dir');

    imageService.deleteLocalImage = jest
      .fn()
      .mockReturnValue(of(null));

    imageService.storeImageToLocalDir(_mockImage)
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

    imageService.isTempImage = jest
      .fn()
      .mockReturnValue(true);

    imageService.resizeImage = jest
      .fn()
      .mockReturnValue(of('new-resized-path'));

    imageService.fileService.getLocalUrl = jest
      .fn()
      .mockReturnValue('new-local-url');

    imageService.fileService.getTmpDirPath = jest
      .fn()
      .mockReturnValue('tmp-dir');

    imageService.deleteLocalImage = jest
      .fn()
      .mockReturnValue(of(null));

    const deleteSpy: jest.SpyInstance = jest.spyOn(imageService, 'deleteLocalImage');

    imageService.storeImageToLocalDir(_mockImage, 'deletion-path')
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

    imageService.isTempImage = jest
      .fn()
      .mockReturnValue(false);

    imageService.storeImageToLocalDir(_mockImage, 'deletion-path')
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

  test('should resize an image', (done: jest.DoneCallback): void => {
    const _mockImage: Image = mockImage();
    _mockImage.fileSize = 1000 * 1024;
    _mockImage.filePath = 'tmp/file/file.jpg';

    imageService.imageResizer.resize = jest
      .fn()
      .mockReturnValue(Promise.resolve(''));

    imageService.fileService.getPersistentDirPath = jest
      .fn()
      .mockReturnValue('data/');

    const resizeSpy: jest.SpyInstance = jest.spyOn(imageService.imageResizer, 'resize');

    imageService.resizeImage(_mockImage)
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

    const resizeSpy: jest.SpyInstance = jest.spyOn(imageService.imageResizer, 'resize');

    imageService.resizeImage(_mockImage)
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

  test('should prepare an image for upload', (done: jest.DoneCallback): void => {
    const _mockImageRequestFormData1: ImageRequestFormData = mockImageRequestFormData();
    const _mockImageRequestFormData2: ImageRequestFormData = mockImageRequestFormData();
    _mockImageRequestFormData2.name = 'other-test-img';
    _mockImageRequestFormData2.image.cid = '1';
    _mockImageRequestFormData2.image.filePath = 'other-file-path';
    const _mockImageRequestFormData3: ImageRequestFormData = mockImageRequestFormData();

    imageService.isTempImage = jest
      .fn()
      .mockReturnValueOnce(false)
      .mockReturnValueOnce(false)
      .mockReturnValueOnce(true);

    imageService.fileService.getLocalFile = jest
      .fn()
      .mockImplementation((path: string): Observable<string | ArrayBuffer> => {
        return of(new ArrayBuffer(path.length));
      });

    const getSpy: jest.SpyInstance = jest.spyOn(imageService.fileService, 'getLocalFile');

    imageService.blobbifyImages([_mockImageRequestFormData1, _mockImageRequestFormData2, _mockImageRequestFormData3])
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

  test('should get the server url for a filename', (): void => {
    expect(imageService.getServerURL('12345').includes('/images/12345.jpg')).toBe(true);
  });

  test('should handle an image error event', (): void => {
    const _mockImage: Image = mockImage();
    _mockImage.url = _mockImage.localURL;

    imageService.getServerURL = jest
      .fn()
      .mockReturnValue('/images/server-filename.jpg');

    imageService.handleImageError(_mockImage);

    expect(_mockImage.url).toMatch('/images/server-filename.jpg');

    imageService.handleImageError(_mockImage);

    expect(_mockImage.url).toMatch(defaultImage().url);
  });

  test('should check if image is the default image', (): void => {
    const _mockImage: Image = mockImage();
    _mockImage.cid = '12345';
    const _defaultImage: Image = defaultImage();

    expect(imageService.hasDefaultImage(_mockImage)).toBe(false);
    expect(imageService.hasDefaultImage(_defaultImage)).toBe(true);
  });

  test('should check if image is stored in tmp dir', (): void => {
    imageService.fileService.getTmpDirPath = jest
      .fn()
      .mockReturnValue('tmp/');

    const _mockImage: Image = mockImage();
    _mockImage.filePath = 'tmp/12345.jpg';

    expect(imageService.isTempImage(_mockImage)).toBe(true);

    _mockImage.filePath = 'data/12345.jpg';

    expect(imageService.isTempImage(_mockImage)).toBe(false);

    delete _mockImage.filePath;

    expect(imageService.isTempImage(_mockImage)).toBe(false);

    expect(imageService.isTempImage(null)).toBe(false);
  });

  test('should set image\'s initial url', (): void => {
    imageService.getServerURL = jest
      .fn()
      .mockReturnValue('/images/12345');

    const _mockImage: Image = mockImage();

    imageService.setInitialURL(null);
    expect(_mockImage.url).toMatch('url');

    imageService.setInitialURL(_mockImage);
    expect(_mockImage.url).toMatch(_mockImage.localURL);

    delete _mockImage.localURL;
    imageService.setInitialURL(_mockImage);
    expect(_mockImage.url).toMatch('/images/12345');

    delete _mockImage.serverFilename;

    imageService.setInitialURL(_mockImage);
    const _defaultImage: Image = defaultImage();
    expect(_mockImage.url).toMatch(_defaultImage.url);
  });

});
