/* Module imports */
import { TestBed, getTestBed, async } from '@angular/core/testing';

/* Test configuration imports */
import { configureTestBed } from '@test/configure-test-bed';

/* Mock imports */
import { mockObjectArray } from '@test/mock-models';

/* Service imports */
import { IdService } from './id.service';


describe('IdService', (): void => {
  configureTestBed();
  let injector: TestBed;
  let service: IdService;

  beforeAll(async ((): void => {
    TestBed.configureTestingModule({
      providers: [ IdService ]
    });

    injector = getTestBed();
    service = injector.get(IdService);
  }));

  test('should create the service', (): void => {
    expect(service).toBeTruthy();
  });

  test('should get new client ids', (): void => {
    const now: number = Date.now();
    const init: number = service.cid;

    expect(init).toBeLessThanOrEqual(now + 1000);
    expect(init).toBeGreaterThanOrEqual(now - 1000);

    const first: number = parseInt(service.getNewId(), 10);
    const second: number = parseInt(service.getNewId(), 10);

    expect(first).toEqual(second - 1);
  });

  test('should get id', (): void => {
    const obj1: object = { _id: 'id' };
    const obj2: object = { cid: 'id' };
    const obj3: object = {};

    expect(service.getId(obj1)).toMatch('id');
    expect(service.getId(obj2)).toMatch('id');
    expect(service.getId(obj3)).toBeUndefined();
    expect(service.getId(null)).toBeUndefined();
  });

  test('should get index of object by id', (): void => {
    const _mockObjectArray: object[] = mockObjectArray();
    const foundIndex: number = service.getIndexById('c', _mockObjectArray);

    expect(foundIndex).toBe(2);

    const notFound: number = service.getIndexById('e', _mockObjectArray);

    expect(notFound).toBe(-1);
  });

  test('should check if id is a client or server id', (): void => {
    expect(service.hasDefaultIdType('0123456789012')).toBe(true);
    expect(service.hasDefaultIdType('0a1b2c3d4e5f6g7h8i9j0kl1')).toBe(false);
    expect(service.hasDefaultIdType(undefined)).toBe(true);
  });

  test('should check if server id is missing', (): void => {
    expect(service.isMissingServerId('0a1b2c3d4e5f6g7h8i9j0kl1')).toBe(false);
    expect(service.isMissingServerId(undefined)).toBe(true);
  });

  test('should check if object contains search id', (): void => {
    const obj1: object = { _id: 'id' };
    const obj2: object = { cid: 'id' };
    const obj3: object = {};

    expect(service.hasId(obj1, 'id')).toBe(true);
    expect(service.hasId(obj2, 'id')).toBe(true);
    expect(service.hasId(obj1, 'other')).toBe(false);
    expect(service.hasId(obj3, 'id')).toBe(false);
    expect(service.hasId(obj1, null)).toBe(false);
    expect(service.hasId(obj1, undefined)).toBe(false);
  });

});
