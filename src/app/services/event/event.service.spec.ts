/* Module imports */
import { TestBed, getTestBed, async } from '@angular/core/testing';
import { Subject } from 'rxjs';

/* Test configuration imports */
import { configureTestBed } from '../../../../test-config/configure-test-bed';

/* Service imports */
import { EventService } from './event.service';


describe('EventService', (): void => {
  configureTestBed();
  let injector: TestBed;
  let service: EventService;

  beforeAll(async((): void => {
    TestBed.configureTestingModule({
      providers: [ EventService ]
    });

    injector = getTestBed();
    service = injector.get(EventService);
  }));

  test('should create the service', () => {
    expect(service).toBeDefined();
  });

  test('should register a new event', (done: jest.DoneCallback): void => {
    const eventName: string = 'newEvent';
    const testMessage: object = { test: 'data' };

    expect(service.subscribers[eventName]).toBeUndefined();

    service.register(eventName)
      .subscribe(
        (message: object): void => {
          expect(message).toStrictEqual(testMessage);
          done();
        },
        (error: any): void => {
          console.log('ERROR', error);
          expect(true).toBe(false);
        }
      );

    expect(service.subscribers[eventName]).toBeDefined();
    expect(service.subscribers[eventName].subscriberCount).toEqual(1);
    service.subscribers[eventName].message.next(testMessage);
  });

  test('should register to an existing event', (done: jest.DoneCallback): void => {
    const eventName: string = 'existing';
    const testMessage: object = { test: 'data' };
    service.subscribers[eventName] = {
      message: new Subject<object>(),
      subscriberCount: 1
    };

    service.register(eventName)
      .subscribe(
        (message: object): void => {
          expect(message).toStrictEqual(testMessage);
          done();
        },
        (error: any): void => {
          console.log('ERROR', error);
          expect(true).toBe(false);
        }
      );

    expect(service.subscribers[eventName].subscriberCount).toEqual(2);
    service.subscribers[eventName].message.next(testMessage);
  });

  test('should unregister from an event', () => {
    const eventName: string = 'event';
    service.subscribers[eventName] = {
      message: new Subject<object>(),
      subscriberCount: 2
    };

    service.unregister(eventName);

    expect(service.subscribers[eventName].subscriberCount).toEqual(1);

    service.unregister(eventName);

    expect(service.subscribers[eventName]).toBeUndefined();
  });

  test('should emit a message for an event', (done: jest.DoneCallback): void => {
    const eventName: string = 'existing';
    const testMessage: object = { test: 'data' };
    service.subscribers[eventName] = {
      message: new Subject<object>(),
      subscriberCount: 1
    };

    service.subscribers[eventName].message
      .subscribe(
        (message: object): void => {
          expect(message).toStrictEqual(testMessage);
          done();
        },
        (error: any): void => {
          console.log('ERROR', error);
          expect(true).toBe(false);
        }
      );

    service.emit(eventName, testMessage);
  });

});
