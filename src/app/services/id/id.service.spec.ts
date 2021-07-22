/* Module imports */
import { TestBed, getTestBed, async } from '@angular/core/testing';

/* Test configuration imports */
import { configureTestBed } from '../../../../test-config/configure-test-bed';

/* Mock imports */
import { mockObjectArray } from '../../../../test-config/mock-models';

/* Service imports */
import { IdService } from './id.service';


describe('IdService', () => {
  let injector: TestBed;
  let idService: IdService;
  configureTestBed();

  beforeAll(async ((): void => {
    TestBed.configureTestingModule({
      providers: [ IdService ]
    });

    injector = getTestBed();
    idService = injector.get(IdService);
  }));

  test('should create the service', () => {
    expect(idService).toBeDefined();
  });

  test('should get new client ids', () => {
    const now: number = Date.now();
    const init: number = idService.cid;

    expect(init).toBeLessThanOrEqual(now + 1000);
    expect(init).toBeGreaterThanOrEqual(now - 1000);

    const first: number = parseInt(idService.getNewId(), 10);
    const second: number = parseInt(idService.getNewId(), 10);

    expect(first).toEqual(second - 1);
  });

  test('should get id', (): void => {
    const obj1: object = { _id: 'id' };
    const obj2: object = { cid: 'id' };
    const obj3: object = {};

    expect(idService.getId(obj1)).toMatch('id');
    expect(idService.getId(obj2)).toMatch('id');
    expect(idService.getId(obj3)).toBeUndefined();
    expect(idService.getId(null)).toBeUndefined();
  });

  test('should get index of object by id', (): void => {
    const _mockObjectArray: object[] = mockObjectArray();
    const foundIndex: number = idService.getIndexById('c', _mockObjectArray);
    expect(foundIndex).toBe(2);
    const notFound: number = idService.getIndexById('e', _mockObjectArray);
    expect(notFound).toBe(-1);
  });

  test('should check if id is a client or server id', (): void => {
    expect(idService.hasDefaultIdType('0123456789012')).toBe(true);
    expect(idService.hasDefaultIdType('0a1b2c3d4e5f6g7h8i9j0kl1')).toBe(false);
    expect(idService.hasDefaultIdType(undefined)).toBe(true);
  });

  test('should check if server id is missing', (): void => {
    expect(idService.isMissingServerId('0a1b2c3d4e5f6g7h8i9j0kl1')).toBe(false);
    expect(idService.isMissingServerId(undefined)).toBe(true);
  });

  test('should check if object contains search id', (): void => {
    const obj1: object = { _id: 'id' };
    const obj2: object = { cid: 'id' };
    const obj3: object = {};

    expect(idService.hasId(obj1, 'id')).toBe(true);
    expect(idService.hasId(obj2, 'id')).toBe(true);
    expect(idService.hasId(obj1, 'other')).toBe(false);
    expect(idService.hasId(obj3, 'id')).toBe(false);
    expect(idService.hasId(obj1, null)).toBe(false);
    expect(idService.hasId(obj1, undefined)).toBe(false);
  });

});
