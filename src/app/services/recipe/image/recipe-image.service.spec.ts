/* Module imports */
import { async, getTestBed, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

/* Test configuration imports */
import { configureTestBed } from '@test/configure-test-bed';

/* Mock imports */
import { mockImage, mockImageRequestMetadata, mockRecipeMasterActive } from '@test/mock-models';
import { ImageServiceStub } from '@test/service-stubs';

/* Interface imports */
import { Image, ImageRequestMetadata, RecipeMaster } from '@shared/interfaces';

/* Service imports */
import { ImageService } from '@services/image/image.service';
import { RecipeImageService } from './recipe-image.service';


describe('RecipeImageService', (): void => {
  configureTestBed();
  let injector: TestBed;
  let service: RecipeImageService;

  beforeAll(async((): void => {
    TestBed.configureTestingModule({
      providers: [
        RecipeImageService,
        { provide: ImageService, useClass: ImageServiceStub }
      ]
    });
  }));

  beforeEach((): void => {
    injector = getTestBed();
    service = injector.get(RecipeImageService);
  });

  test('should create the service', (): void => {
    expect(service).toBeTruthy();
  });

  test('should store a new image', (done: jest.DoneCallback): void => {
    const _mockImage: Image = mockImage();
    _mockImage.hasPending = true;
    service.storeImageToLocalDir = jest.fn().mockReturnValue(of(_mockImage));
    const storeSpy: jest.SpyInstance = jest.spyOn(service, 'storeImageToLocalDir');

    service.storeNewImage(_mockImage)
      .subscribe(
        (image: Image): void => {
          expect(image).toStrictEqual(_mockImage);
          expect(storeSpy).toHaveBeenCalledWith(_mockImage);
          done();
        },
        (error: Error): void => {
          console.log('Error in: should store a new image', error);
          expect(true).toBe(false);
        }
      );
  });

  test('should not store a new image if not pending', (done: jest.DoneCallback): void => {
    const _mockImage: Image = mockImage();
    _mockImage.hasPending = false;
    service.storeImageToLocalDir = jest.fn();
    const storeSpy: jest.SpyInstance = jest.spyOn(service, 'storeImageToLocalDir');

    service.storeNewImage(_mockImage)
      .subscribe(
        (image: Image): void => {
          expect(image).toBeNull();
          expect(storeSpy).not.toHaveBeenCalled();
          done();
        },
        (error: Error): void => {
          console.log('Error in: should not store a new image if not pending', error);
          expect(true).toBe(false);
        }
      );
  });

  test('should delete an image', (done: jest.DoneCallback): void => {
    const _mockImage: Image = mockImage();
    service.imageService.hasDefaultImage = jest.fn().mockReturnValue(false);
    service.imageService.deleteLocalImage = jest.fn().mockReturnValue(of(''));
    const deleteSpy: jest.SpyInstance = jest.spyOn(service.imageService, 'deleteLocalImage');
    const consoleSpy: jest.SpyInstance = jest.spyOn(console, 'log');

    service.deleteImage(_mockImage);
    setTimeout((): void => {
      expect(deleteSpy).toHaveBeenCalledWith(_mockImage.filePath);
      expect(consoleSpy.mock.calls[consoleSpy.mock.calls.length - 1][0]).toMatch('image deletion');
      done();
    }, 10);
  });

  test('should get an image request', (done: jest.DoneCallback): void => {
    const _mockRecipeMasterActive: RecipeMaster = mockRecipeMasterActive();
    const _mockImage: Image = mockImage();
    _mockImage.hasPending = true;
    _mockRecipeMasterActive.labelImage = _mockImage;
    const _mockImageRequestMetadata: ImageRequestMetadata = mockImageRequestMetadata();
    service.imageService.blobbifyImages = jest.fn().mockReturnValue(of([_mockImageRequestMetadata]));
    const blobSpy: jest.SpyInstance = jest.spyOn(service.imageService, 'blobbifyImages');

    service.getImageRequest(_mockRecipeMasterActive, true)
      .subscribe(
        (metadata: ImageRequestMetadata[]): void => {
          expect(metadata).toStrictEqual([_mockImageRequestMetadata]);
          expect(blobSpy).toHaveBeenCalledWith([ { image: _mockImage, name: 'labelImage' }]);
          done();
        },
        (error: Error): void => {
          console.log('Error in: should get an image request', error);
          expect(true).toBe(false);
        }
      );
  });

  test('should check if image is a temporary file', (): void => {
    service.imageService.isTempImage = jest.fn().mockReturnValue(true);
    const isSpy: jest.SpyInstance = jest.spyOn(service.imageService, 'isTempImage');
    const _mockImage: Image = mockImage();

    service.isTempImage(_mockImage);
    expect(isSpy).toHaveBeenCalledWith(_mockImage);
  });

  test('should store image to local directory', (done: jest.DoneCallback): void => {
    const _mockImage: Image = mockImage();
    service.imageService.storeImageToLocalDir = jest.fn().mockReturnValue(of(_mockImage));
    const storeSpy: jest.SpyInstance = jest.spyOn(service.imageService, 'storeImageToLocalDir');

    service.storeImageToLocalDir(_mockImage)
      .subscribe(
        (image: Image): void => {
          expect(image).toStrictEqual(_mockImage);
          expect(storeSpy).toHaveBeenCalledWith(_mockImage, '');
          done();
        },
        (error: Error): void => {
          console.log('Error in: should store image to local directory', error);
          expect(true).toBe(false);
        }
      );
  });

});
