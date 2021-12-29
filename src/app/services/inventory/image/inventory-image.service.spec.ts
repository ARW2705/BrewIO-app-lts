/* Module imports */
import { async, getTestBed, TestBed } from '@angular/core/testing';
import { forkJoin, of } from 'rxjs';

/* Test configuration imports */
import { configureTestBed } from '@test/configure-test-bed';

/* Mock imports */
import { mockImage, mockImageRequestFormData, mockImageRequestMetadata, mockInventoryItem } from '@test/mock-models';
import { ImageServiceStub } from '@test/service-stubs';

/* Interface imports*/
import { Image, ImageRequestFormData, ImageRequestMetadata, InventoryItem } from '@shared/interfaces';

/* Service imports */
import { ImageService } from '@services/public';
import { InventoryImageService } from './inventory-image.service';


describe('InventoryImageService', (): void => {
  configureTestBed();
  let injector: TestBed;
  let service: InventoryImageService;

  beforeAll(async((): void => {
    TestBed.configureTestingModule({
      providers: [
        InventoryImageService,
        { provide: ImageService, useClass: ImageServiceStub }
      ]
    });
  }));

  beforeEach((): void => {
    injector = getTestBed();
    service = injector.get(InventoryImageService);
  });

  test('should create the service', (): void => {
    expect(service).toBeTruthy();
  });

  test('should compose image upload request data', (): void => {
    const _mockInventoryItem: InventoryItem = mockInventoryItem();
    _mockInventoryItem.optionalItemData.itemLabelImage.hasPending = true;
    _mockInventoryItem.optionalItemData.supplierLabelImage.hasPending = true;

    const imageData: ImageRequestFormData[] = service.composeImageUploadRequests(_mockInventoryItem);

    expect(imageData[0]).toStrictEqual({
      image: _mockInventoryItem.optionalItemData.itemLabelImage,
      name: 'itemLabelImage'
    });
    expect(imageData[1]).toStrictEqual({
      image: _mockInventoryItem.optionalItemData.supplierLabelImage,
      name: 'supplierLabelImage'
    });
  });

  test('should compose image store request data', (done: jest.DoneCallback): void => {
    const _mockInventoryItem: InventoryItem = mockInventoryItem();
    _mockInventoryItem.optionalItemData.itemLabelImage.hasPending = true;
    _mockInventoryItem.optionalItemData.supplierLabelImage.hasPending = true;
    const _mockImage: Image = mockImage();
    service.imageService.storeImageToLocalDir = jest.fn().mockReturnValue(of(_mockImage));
    const storeSpy: jest.SpyInstance = jest.spyOn(service.imageService, 'storeImageToLocalDir');

    forkJoin(service.composeImageStoreRequests(_mockInventoryItem))
      .subscribe(
        (images: Image[]): void => {
          expect(images.length).toEqual(2);
          expect(storeSpy).toHaveBeenCalledTimes(2);
          done();
        },
        (error: any): void => {
          console.log(`Error in 'should compose image store request data'`, error);
          expect(true).toBe(false);
        }
      );
  });

  test('should get image request', (done: jest.DoneCallback): void => {
    const _mockImageRequestFormData: ImageRequestFormData = mockImageRequestFormData();
    const _mockImageRequestMetadata: ImageRequestMetadata = mockImageRequestMetadata();
    service.composeImageUploadRequests = jest.fn().mockReturnValue([_mockImageRequestFormData]);
    service.imageService.blobbifyImages = jest.fn().mockReturnValue(of([_mockImageRequestMetadata]));
    const composeSpy: jest.SpyInstance = jest.spyOn(service, 'composeImageUploadRequests');
    const _mockInventoryItem: InventoryItem = mockInventoryItem();
    service.getImageRequest(_mockInventoryItem)
      .subscribe(
        (requestData: ImageRequestMetadata[]): void => {
          expect(requestData).toStrictEqual([_mockImageRequestMetadata]);
          expect(composeSpy).toHaveBeenCalledWith(_mockInventoryItem);
          done();
        },
        (error: any): void => {
          console.log('Error in: should get image request', error);
          expect(true).toBe(false);
        }
      );
  });

  test('should delete an image', (done: jest.DoneCallback): void => {
    service.imageService.hasDefaultImage = jest.fn()
      .mockReturnValueOnce(false)
      .mockReturnValueOnce(true);
    service.imageService.deleteLocalImage = jest.fn()
      .mockReturnValue(of('test'));
    const deleteSpy: jest.SpyInstance = jest.spyOn(service.imageService, 'deleteLocalImage');
    const consoleSpy: jest.SpyInstance = jest.spyOn(console, 'log');
    const _mockImage: Image = mockImage();

    service.deleteImage(_mockImage);
    service.deleteImage(_mockImage);
    service.deleteImage(null);

    setTimeout((): void => {
      const consoleCalls: any[] = consoleSpy.mock.calls[consoleSpy.mock.calls.length - 1];
      expect(consoleCalls[0]).toMatch('image deletion');
      expect(consoleCalls[1]).toMatch('test');
      expect(deleteSpy).toHaveBeenCalledTimes(1);
      done();
    }, 10);
  });

});
