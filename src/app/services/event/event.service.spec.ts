/* Module imports */
import { TestBed, getTestBed, async } from '@angular/core/testing';
import { Subject } from 'rxjs';

/* Test configuration imports */
import { configureTestBed } from '../../../../test-config/configure-test-bed';

/* Service imports */
import { EventService } from './event.service';


describe('EventService', () => {
  let injector: TestBed;
  let eventService: EventService;
  configureTestBed();

  beforeAll(async((): void => {
    TestBed.configureTestingModule({
      providers: [ EventService ]
    });

    injector = getTestBed();
    eventService = injector.get(EventService);
  }));

  test('should create the service', () => {
    expect(eventService).toBeDefined();
  });

  test('should register a new event', (done: jest.DoneCallback): void => {
    const eventName: string = 'newEvent';
    const testMessage: object = { test: 'data' };

    expect(eventService.subscribers[eventName]).toBeUndefined();

    eventService.register(eventName)
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

    expect(eventService.subscribers[eventName]).toBeDefined();
    expect(eventService.subscribers[eventName].subscriberCount).toEqual(1);
    eventService.subscribers[eventName].message.next(testMessage);
  }); // end 'should register a new event' test

  test('should register to an existing event', (done: jest.DoneCallback): void => {
    const eventName: string = 'existing';
    const testMessage: object = { test: 'data' };

    eventService.subscribers[eventName] = {
      message: new Subject<object>(),
      subscriberCount: 1
    };

    eventService.register(eventName)
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

    expect(eventService.subscribers[eventName].subscriberCount).toEqual(2);
    eventService.subscribers[eventName].message.next(testMessage);
  }); // end 'should register to an existing event' test

  test('should unregister from an event', () => {
    const eventName: string = 'event';

    eventService.subscribers[eventName] = {
      message: new Subject<object>(),
      subscriberCount: 2
    };

    eventService.unregister(eventName);

    expect(eventService.subscribers[eventName].subscriberCount).toEqual(1);

    eventService.unregister(eventName);

    expect(eventService.subscribers[eventName]).toBeUndefined();
  }); // end 'should unregister from an event' test

  test('should emit a message for an event', (done: jest.DoneCallback): void => {
    const eventName: string = 'existing';
    const testMessage: object = { test: 'data' };

    eventService.subscribers[eventName] = {
      message: new Subject<object>(),
      subscriberCount: 1
    };

    eventService.subscribers[eventName].message
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

    eventService.emit(eventName, testMessage);
  }); // end 'should emit a message for an event' test

});
