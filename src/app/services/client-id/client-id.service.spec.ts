/* Module imports */
import { TestBed, getTestBed, async } from '@angular/core/testing';

/* Test configuration imports */
import { configureTestBed } from '../../../../test-config/configure-test-bed';

/* Service imports */
import { ClientIdService } from './client-id.service';


describe('ClientIdService', () => {
  let injector: TestBed;
  let clientIdService: ClientIdService;
  configureTestBed();

  beforeAll(async ((): void => {
    TestBed.configureTestingModule({
      declarations: [],
      imports: [],
      providers: [ ClientIdService ]
    });

    injector = getTestBed();
    clientIdService = injector.get(ClientIdService);
  }));

  test('should create the service', () => {
    expect(clientIdService).toBeDefined();
  });

  test('should get new client ids', () => {
    const now: number = Date.now();
    const init: number = clientIdService.cid;

    expect(init).toBeLessThanOrEqual(now + 1000);
    expect(init).toBeGreaterThanOrEqual(now - 1000);

    const first: number = parseInt(clientIdService.getNewId(), 10);
    const second: number = parseInt(clientIdService.getNewId(), 10);

    expect(first).toEqual(second - 1);
  });

});
