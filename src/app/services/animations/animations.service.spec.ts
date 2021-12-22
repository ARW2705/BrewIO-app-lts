/* Module imports */
import { TestBed, getTestBed, async } from '@angular/core/testing';
import { AnimationController } from '@ionic/angular';
import { Observable, of, throwError } from 'rxjs';

/* Test configuration imports */
import { configureTestBed } from '../../../../test-config/configure-test-bed';

/* Mock imports */
import { mockErrorReport } from '../../../../test-config/mock-models';
import { AnimationControllerStub, AnimationStub, Renderer2Stub } from '../../../../test-config/ionic-stubs';
import { ErrorReportingServiceStub } from '../../../../test-config/service-stubs';

/* Interface imports */
import { ErrorReport } from '../../shared/interfaces';

/* Type imports */
import { CustomError } from '../../shared/types';

/* Service imports */
import { AnimationsService } from './animations.service';
import { ErrorReportingService } from '../error-reporting/error-reporting.service';


describe('AnimationsService', (): void => {
  configureTestBed();
  let injector: TestBed;
  let service: AnimationsService;
  let errorReporter: ErrorReportingService;

  beforeAll(async((): void  => {
    TestBed.configureTestingModule({
      providers: [
        AnimationsService,
        { provide: AnimationController, useClass: AnimationControllerStub },
        { provide: ErrorReportingService, useClass: ErrorReportingServiceStub }
      ]
    });
    injector = getTestBed();
    service = injector.get(AnimationsService);
    errorReporter = injector.get(ErrorReportingService);
  }));

  beforeEach((): void => {
    errorReporter.handleGenericCatchError = jest.fn()
      .mockImplementation((error: Error): Observable<never> => throwError(error));
  });

  test('should create the service', (): void => {
    expect(service).toBeTruthy();
  });

  describe('Animations', (): void => {

    test('should get slide in animation with defaults', (): void => {
      const mockElem: HTMLElement = global.document.createElement('div');
      const _stubAnimation: AnimationStub = new AnimationStub();
      service.animationCtrl.create = jest.fn().mockReturnValue(_stubAnimation);
      _stubAnimation.addElement = jest.fn().mockReturnValue(_stubAnimation);
      _stubAnimation.duration = jest.fn().mockReturnValue(_stubAnimation);
      _stubAnimation.fromTo = jest.fn().mockReturnValue(_stubAnimation);
      const addSpy: jest.SpyInstance = jest.spyOn(_stubAnimation, 'addElement');
      const durationSpy: jest.SpyInstance = jest.spyOn(_stubAnimation, 'duration');
      const fromSpy: jest.SpyInstance = jest.spyOn(_stubAnimation, 'fromTo');

      service.slideIn(mockElem);

      expect(addSpy).toHaveBeenCalledWith(mockElem);
      expect(durationSpy).toHaveBeenCalledWith(500);
      expect(fromSpy).toHaveBeenNthCalledWith(1, 'transform', 'translateX(-100%)', 'translateX(0)');
      expect(fromSpy).toHaveBeenNthCalledWith(2, 'opacity', 0, 1);
    });

    test('should get slide in animation with options', (): void => {
      const mockElem: HTMLElement = global.document.createElement('div');
      const _stubAnimation: AnimationStub = new AnimationStub();
      service.animationCtrl.create = jest.fn().mockReturnValue(_stubAnimation);
      _stubAnimation.addElement = jest.fn().mockReturnValue(_stubAnimation);
      _stubAnimation.duration = jest.fn().mockReturnValue(_stubAnimation);
      _stubAnimation.fromTo = jest.fn().mockReturnValue(_stubAnimation);
      const addSpy: jest.SpyInstance = jest.spyOn(_stubAnimation, 'addElement');
      const durationSpy: jest.SpyInstance = jest.spyOn(_stubAnimation, 'duration');
      const fromSpy: jest.SpyInstance = jest.spyOn(_stubAnimation, 'fromTo');

      service.slideIn(mockElem, { duration: 250, direction: 70 });

      expect(addSpy).toHaveBeenCalledWith(mockElem);
      expect(durationSpy).toHaveBeenCalledWith(250);
      expect(fromSpy).toHaveBeenNthCalledWith(1, 'transform', 'translateX(70%)', 'translateX(0)');
      expect(fromSpy).toHaveBeenNthCalledWith(2, 'opacity', 0, 1);

      service.slideIn(mockElem, { duration: 500 });

      expect(durationSpy).toHaveBeenNthCalledWith(2, 500);

      service.slideIn(mockElem, { direction: 100 });

      expect(fromSpy).toHaveBeenNthCalledWith(5, 'transform', 'translateX(100%)', 'translateX(0)');
    });

    test('should get slide out animation with defaults', (): void => {
      const mockElem: HTMLElement = global.document.createElement('div');
      const _stubAnimation: AnimationStub = new AnimationStub();
      service.animationCtrl.create = jest.fn().mockReturnValue(_stubAnimation);
      _stubAnimation.addElement = jest.fn().mockReturnValue(_stubAnimation);
      _stubAnimation.duration = jest.fn().mockReturnValue(_stubAnimation);
      _stubAnimation.fromTo = jest.fn().mockReturnValue(_stubAnimation);
      const addSpy: jest.SpyInstance = jest.spyOn(_stubAnimation, 'addElement');
      const durationSpy: jest.SpyInstance = jest.spyOn(_stubAnimation, 'duration');
      const fromSpy: jest.SpyInstance = jest.spyOn(_stubAnimation, 'fromTo');

      service.slideOut(mockElem);

      expect(addSpy).toHaveBeenCalledWith(mockElem);
      expect(durationSpy).toHaveBeenCalledWith(500);
      expect(fromSpy).toHaveBeenNthCalledWith(1, 'transform', 'translateX(0)', 'translateX(100%)');
      expect(fromSpy).toHaveBeenNthCalledWith(2, 'opacity', 1, 0);
    });

    test('should get slide out animation with options', (): void => {
      const mockElem: HTMLElement = global.document.createElement('div');
      const _stubAnimation: AnimationStub = new AnimationStub();
      service.animationCtrl.create = jest.fn().mockReturnValue(_stubAnimation);
      _stubAnimation.addElement = jest.fn().mockReturnValue(_stubAnimation);
      _stubAnimation.duration = jest.fn().mockReturnValue(_stubAnimation);
      _stubAnimation.fromTo = jest.fn().mockReturnValue(_stubAnimation);
      const addSpy: jest.SpyInstance = jest.spyOn(_stubAnimation, 'addElement');
      const durationSpy: jest.SpyInstance = jest.spyOn(_stubAnimation, 'duration');
      const fromSpy: jest.SpyInstance = jest.spyOn(_stubAnimation, 'fromTo');

      service.slideOut(mockElem, { duration: 250, direction: 70 });

      expect(addSpy).toHaveBeenCalledWith(mockElem);
      expect(durationSpy).toHaveBeenCalledWith(250);
      expect(fromSpy).toHaveBeenNthCalledWith(1, 'transform', 'translateX(0)', 'translateX(70%)');
      expect(fromSpy).toHaveBeenNthCalledWith(2, 'opacity', 1, 0);

      service.slideOut(mockElem, { duration: 500 });

      expect(durationSpy).toHaveBeenNthCalledWith(2, 500);

      service.slideOut(mockElem, { direction: 100 });

      expect(fromSpy).toHaveBeenNthCalledWith(5, 'transform', 'translateX(0)', 'translateX(100%)');
    });

    test('should get expand animation with defaults', (): void => {
      const mockElem: HTMLElement = global.document.createElement('div');
      const _stubAnimation: AnimationStub = new AnimationStub();
      service.animationCtrl.create = jest.fn().mockReturnValue(_stubAnimation);
      _stubAnimation.addElement = jest.fn().mockReturnValue(_stubAnimation);
      _stubAnimation.duration = jest.fn().mockReturnValue(_stubAnimation);
      _stubAnimation.fromTo = jest.fn().mockReturnValue(_stubAnimation);
      _stubAnimation.easing = jest.fn().mockReturnValue(_stubAnimation);
      const addSpy: jest.SpyInstance = jest.spyOn(_stubAnimation, 'addElement');
      const durationSpy: jest.SpyInstance = jest.spyOn(_stubAnimation, 'duration');
      const fromSpy: jest.SpyInstance = jest.spyOn(_stubAnimation, 'fromTo');
      const easingSpy: jest.SpyInstance = jest.spyOn(_stubAnimation, 'easing');

      service.expand(mockElem);

      expect(addSpy).toHaveBeenCalledWith(mockElem);
      expect(durationSpy).toHaveBeenCalledWith(250);
      expect(easingSpy).toHaveBeenCalledWith('ease-in');
      expect(fromSpy).toHaveBeenNthCalledWith(1, 'maxHeight', 0, '100vh');
      expect(fromSpy).toHaveBeenNthCalledWith(2, 'opacity', 0, 1);
    });

    test('should get expand animation with options', (): void => {
      const mockElem: HTMLElement = global.document.createElement('div');
      const _stubAnimation: AnimationStub = new AnimationStub();
      service.animationCtrl.create = jest.fn().mockReturnValue(_stubAnimation);
      _stubAnimation.addElement = jest.fn().mockReturnValue(_stubAnimation);
      _stubAnimation.duration = jest.fn().mockReturnValue(_stubAnimation);
      _stubAnimation.fromTo = jest.fn().mockReturnValue(_stubAnimation);
      _stubAnimation.easing = jest.fn().mockReturnValue(_stubAnimation);
      const addSpy: jest.SpyInstance = jest.spyOn(_stubAnimation, 'addElement');
      const durationSpy: jest.SpyInstance = jest.spyOn(_stubAnimation, 'duration');
      const fromSpy: jest.SpyInstance = jest.spyOn(_stubAnimation, 'fromTo');
      const easingSpy: jest.SpyInstance = jest.spyOn(_stubAnimation, 'easing');

      service.expand(mockElem, { duration: 500 });

      expect(addSpy).toHaveBeenCalledWith(mockElem);
      expect(durationSpy).toHaveBeenCalledWith(500);
      expect(easingSpy).toHaveBeenCalledWith('ease-in');
      expect(fromSpy).toHaveBeenNthCalledWith(1, 'maxHeight', 0, '100vh');
      expect(fromSpy).toHaveBeenNthCalledWith(2, 'opacity', 0, 1);

      service.expand(mockElem, { duration: 100 });

      expect(durationSpy).toHaveBeenNthCalledWith(2, 100);
    });

    test('should get collapse animation with defaults', (): void => {
      const mockElem: HTMLElement = global.document.createElement('div');
      const _stubAnimation: AnimationStub = new AnimationStub();
      service.animationCtrl.create = jest.fn().mockReturnValue(_stubAnimation);
      _stubAnimation.addElement = jest.fn().mockReturnValue(_stubAnimation);
      _stubAnimation.duration = jest.fn().mockReturnValue(_stubAnimation);
      _stubAnimation.fromTo = jest.fn().mockReturnValue(_stubAnimation);
      const addSpy: jest.SpyInstance = jest.spyOn(_stubAnimation, 'addElement');
      const durationSpy: jest.SpyInstance = jest.spyOn(_stubAnimation, 'duration');
      const fromSpy: jest.SpyInstance = jest.spyOn(_stubAnimation, 'fromTo');

      service.collapse(mockElem);

      expect(addSpy).toHaveBeenCalledWith(mockElem);
      expect(durationSpy).toHaveBeenCalledWith(250);
      expect(fromSpy).toHaveBeenNthCalledWith(1, 'maxHeight', '100vh', 0);
      expect(fromSpy).toHaveBeenNthCalledWith(2, 'opacity', 1, 0);
    });

    test('should get collapse animation with options', (): void => {
      const mockElem: HTMLElement = global.document.createElement('div');
      const _stubAnimation: AnimationStub = new AnimationStub();
      service.animationCtrl.create = jest.fn().mockReturnValue(_stubAnimation);
      _stubAnimation.addElement = jest.fn().mockReturnValue(_stubAnimation);
      _stubAnimation.duration = jest.fn().mockReturnValue(_stubAnimation);
      _stubAnimation.fromTo = jest.fn().mockReturnValue(_stubAnimation);
      const addSpy: jest.SpyInstance = jest.spyOn(_stubAnimation, 'addElement');
      const durationSpy: jest.SpyInstance = jest.spyOn(_stubAnimation, 'duration');
      const fromSpy: jest.SpyInstance = jest.spyOn(_stubAnimation, 'fromTo');

      service.collapse(mockElem, { duration: 500 });

      expect(addSpy).toHaveBeenCalledWith(mockElem);
      expect(durationSpy).toHaveBeenCalledWith(500);
      expect(fromSpy).toHaveBeenNthCalledWith(1, 'maxHeight', '100vh', 0);
      expect(fromSpy).toHaveBeenNthCalledWith(2, 'opacity', 1, 0);

      service.collapse(mockElem, { duration: 100 });

      expect(durationSpy).toHaveBeenNthCalledWith(2, 100);
    });

    test('should check if a hint animation has been shown', (): void => {
      const consoleSpy: jest.SpyInstance = jest.spyOn(console, 'log');
      service.hintFlags.sliding.recipeDetail = true;
      expect(service.shouldShowHint('sliding', 'recipeDetail')).toBe(false);
      expect(service.shouldShowHint('sliding', 'recipe')).toBe(true);
      expect(service.shouldShowHint('other', 'recipe')).toBe(true);

      const consoleCalls: any[] = consoleSpy.mock.calls[consoleSpy.mock.calls.length - 1];
      expect(consoleCalls[0]).toMatch('Error getting hint show flag');
      expect(consoleCalls[1]).toMatch('other');
      expect(consoleCalls[2]).toMatch('recipe');
      expect(consoleCalls[3] instanceof Error).toBe(true);
    });

    test('should set hint shown flag', (): void => {
      const consoleSpy: jest.SpyInstance = jest.spyOn(console, 'log');
      service.hintFlags.sliding.recipeDetail = false;

      service.setHintShownFlag('sliding', 'recipeDetail');

      expect(service.hintFlags.sliding.recipeDetail).toBe(true);
      expect(service.hintFlags.other).toBeUndefined();

      service.setHintShownFlag('other', 'recipe');

      expect(service.hintFlags.other).toBeUndefined();
      const consoleCalls: any[] = consoleSpy.mock.calls[consoleSpy.mock.calls.length - 1];
      expect(consoleCalls[0]).toMatch('Error setting hint show flag');
      expect(consoleCalls[1]).toMatch('other');
      expect(consoleCalls[2]).toMatch('recipe');
      expect(consoleCalls[3] instanceof Error).toBe(true);
    });

    test('should get sliding hint animation with defaults', (): void => {
      const mockElem: HTMLElement = global.document.createElement('div');
      const _stubAnimation: AnimationStub = new AnimationStub();
      service.animationCtrl.create = jest.fn().mockReturnValue(_stubAnimation);
      _stubAnimation.addElement = jest.fn().mockReturnValue(_stubAnimation);
      _stubAnimation.duration = jest.fn().mockReturnValue(_stubAnimation);
      _stubAnimation.delay = jest.fn().mockReturnValue(_stubAnimation);
      _stubAnimation.easing = jest.fn().mockReturnValue(_stubAnimation);
      _stubAnimation.keyframes = jest.fn().mockReturnValue(_stubAnimation);
      const addSpy: jest.SpyInstance = jest.spyOn(_stubAnimation, 'addElement');
      const durationSpy: jest.SpyInstance = jest.spyOn(_stubAnimation, 'duration');
      const delaySpy: jest.SpyInstance = jest.spyOn(_stubAnimation, 'delay');
      const easingSpy: jest.SpyInstance = jest.spyOn(_stubAnimation, 'easing');
      const keyframesSpy: jest.SpyInstance = jest.spyOn(_stubAnimation, 'keyframes');

      service.slidingHint(mockElem, {});

      expect(addSpy).toHaveBeenCalledWith(mockElem);
      expect(durationSpy).toHaveBeenCalledWith(1000);
      expect(delaySpy).toHaveBeenCalledWith(0);
      expect(easingSpy).toHaveBeenCalledWith('ease-out');
      expect(keyframesSpy).toHaveBeenCalledWith([
        { offset: 0,    transform: 'translateX(0)'     },
        { offset: 0.2,  transform: 'translateX(-50px)' },
        { offset: 0.25, transform: 'translateX(-50px)' },
        { offset: 0.55, transform: 'translateX(0)'     },
        { offset: 0.65, transform: 'translateX(-13px)' },
        { offset: 0.68, transform: 'translateX(-13px)' },
        { offset: 0.85, transform: 'translateX(0)'     },
        { offset: 0.90, transform: 'translateX(-3px)'  },
        { offset: 0.91, transform: 'translateX(-3px)'  },
        { offset: 1,    transform: 'translateX(0)'     }
      ]);
    });

    test('should get sliding hint animation with options', (): void => {
      const mockElem: HTMLElement = global.document.createElement('div');
      const _stubAnimation: AnimationStub = new AnimationStub();
      service.animationCtrl.create = jest.fn().mockReturnValue(_stubAnimation);
      _stubAnimation.addElement = jest.fn().mockReturnValue(_stubAnimation);
      _stubAnimation.duration = jest.fn().mockReturnValue(_stubAnimation);
      _stubAnimation.delay = jest.fn().mockReturnValue(_stubAnimation);
      _stubAnimation.easing = jest.fn().mockReturnValue(_stubAnimation);
      _stubAnimation.keyframes = jest.fn().mockReturnValue(_stubAnimation);
      const addSpy: jest.SpyInstance = jest.spyOn(_stubAnimation, 'addElement');
      const durationSpy: jest.SpyInstance = jest.spyOn(_stubAnimation, 'duration');
      const delaySpy: jest.SpyInstance = jest.spyOn(_stubAnimation, 'delay');
      const easingSpy: jest.SpyInstance = jest.spyOn(_stubAnimation, 'easing');
      const keyframesSpy: jest.SpyInstance = jest.spyOn(_stubAnimation, 'keyframes');

      service.slidingHint(mockElem, { duration: 800, delay: 250, distance: 100 });

      expect(addSpy).toHaveBeenCalledWith(mockElem);
      expect(durationSpy).toHaveBeenCalledWith(800);
      expect(delaySpy).toHaveBeenCalledWith(250);
      expect(easingSpy).toHaveBeenCalledWith('ease-out');
      expect(keyframesSpy).toHaveBeenCalledWith([
        { offset: 0,    transform: 'translateX(0)'      },
        { offset: 0.2,  transform: 'translateX(-100px)' },
        { offset: 0.25, transform: 'translateX(-100px)' },
        { offset: 0.55, transform: 'translateX(0)'      },
        { offset: 0.65, transform: 'translateX(-25px)'  },
        { offset: 0.68, transform: 'translateX(-25px)'  },
        { offset: 0.85, transform: 'translateX(0)'      },
        { offset: 0.90, transform: 'translateX(-5px)'   },
        { offset: 0.91, transform: 'translateX(-5px)'   },
        { offset: 1,    transform: 'translateX(0)'      }
      ]);
    });

  });


  describe('HTML Element Helpers', (): void => {

    test('should get above the fold count', (): void => {
      const _mockContainerElement: HTMLElement = global.document.createElement('div');
      Object.defineProperty(_mockContainerElement, 'clientHeight', { writable: false, value: 1000 });
      const _mockSampleElement: HTMLElement = global.document.createElement('div');
      Object.defineProperty(_mockSampleElement, 'clientHeight', { writable: false, value: 100 });

      expect(service.getAboveFoldCount(_mockContainerElement, _mockSampleElement)).toEqual(10);
    });

    test('should handle error getting above the fold item count and return -1', (): void => {
      const consoleSpy: jest.SpyInstance = jest.spyOn(console, 'log');

      expect(service.getAboveFoldCount(null, null)).toEqual(-1);

      const consoleCalls: any[] = consoleSpy.mock.calls[consoleSpy.mock.calls.length - 1];
      expect(consoleCalls[0]).toMatch('Error getting content height');
      expect(consoleCalls[1] instanceof Error).toBe(true);
    });

    test('should get estimated item option width', (): void => {
      const _mockIonItemOptions1: HTMLElement = global.document.createElement('div');
      Object.defineProperty(_mockIonItemOptions1, 'textContent', { writable: false, value: 'test' });
      const _mockIonItemOptions2: HTMLElement = global.document.createElement('div');
      Object.defineProperty(_mockIonItemOptions2, 'textContent', { writable: false, value: 'longer' });
      const _mockIonItemOptions3: HTMLElement = global.document.createElement('div');
      Object.defineProperty(_mockIonItemOptions3, 'textContent', { writable: false, value: 'longest' });

      const _mockContainer: HTMLElement = global.document.createElement('div');
      _mockContainer.querySelectorAll = jest.fn()
        .mockReturnValue([ _mockIonItemOptions1, _mockIonItemOptions2, _mockIonItemOptions3 ]);

      expect(service.getEstimatedItemOptionWidth(_mockContainer, 1, 2)).toEqual(157);
    });

    test('should get list of items to be animated', (): void => {
      const _mockContainer: HTMLElement = global.document.createElement('div');
      const _mockElems: HTMLElement[] = new Array(4).fill(global.document.createElement('div'));
      service.getAboveFoldCount = jest.fn()
        .mockReturnValueOnce(3)
        .mockReturnValueOnce(-1);
      _mockContainer.querySelectorAll = jest.fn().mockReturnValue(_mockElems);

      // above fold count = 3
      expect(service.getSlidingElements(_mockContainer, _mockContainer).length).toEqual(3);
      // above fold count returns -1
      expect(service.getSlidingElements(_mockContainer, _mockContainer).length).toEqual(2);
    });

    test('should get sliding hint animations', (): void => {
      const mockElem1: HTMLElement = global.document.createElement('div');
      const mockElem2: HTMLElement = global.document.createElement('section');
      const _stubAnimation: AnimationStub = new AnimationStub();
      service.slidingHint = jest.fn().mockReturnValue(_stubAnimation);
      const animSpy: jest.SpyInstance = jest.spyOn(service, 'slidingHint');

      expect(service.getSlidingHintAnimations([mockElem1, mockElem2], 200, 0))
        .toStrictEqual([ _stubAnimation, _stubAnimation ]);

      expect(animSpy).toHaveBeenNthCalledWith(1, mockElem1, { delay: 0, distance: 200 });
      expect(animSpy).toHaveBeenNthCalledWith(2, mockElem2, { delay: 100, distance: 200 });
    });

    test('should queue sliding hint animations', (done: jest.DoneCallback): void => {
      const _stubAnimation: AnimationStub = new AnimationStub();
      let callBack: () => void;
      _stubAnimation.play = jest.fn().mockReturnValue(Promise.resolve());
      _stubAnimation.destroy = jest.fn();
      _stubAnimation.onFinish = jest.fn()
        .mockImplementation((cb: () => void): Animation => {
          callBack = cb;
          return <any>_stubAnimation;
        });
      const playSpy: jest.SpyInstance = jest.spyOn(_stubAnimation, 'play');
      const destroySpy: jest.SpyInstance = jest.spyOn(_stubAnimation, 'destroy');

      service.queueAnimations([<any>_stubAnimation])[0]
        .subscribe(
          (): void => {
            expect(playSpy).toHaveBeenCalled();
            expect(destroySpy).toHaveBeenCalled();
            done();
          },
          (error: any): void => {
            console.log('Error in: \'should queue sliding hint animations\'', error);
            expect(true).toBe(false);
          }
        );

      callBack();
    });

    test('should play combined sliding hint animations', (done: jest.DoneCallback): void => {
      const _mockElem: HTMLElement = global.document.createElement('div');
      Object.defineProperty(_mockElem, 'clientWidth', { writable: false, value: 100 });
      const _stubAnimation: AnimationStub = new AnimationStub();
      service.getSlidingElements = jest.fn().mockReturnValue([_mockElem]);
      service.getSlidingHintAnimations = jest.fn().mockReturnValue([_stubAnimation]);
      service.queueAnimations = jest.fn().mockReturnValue([of(null)]);
      const getElemSpy: jest.SpyInstance = jest.spyOn(service, 'getSlidingElements');
      const getAnimSpy: jest.SpyInstance = jest.spyOn(service, 'getSlidingHintAnimations');
      const queueSpy: jest.SpyInstance = jest.spyOn(service, 'queueAnimations');

      service.playCombinedSlidingHintAnimations(_mockElem, _mockElem)
        .subscribe(
          (): void => {
            expect(getElemSpy).toHaveBeenCalledWith(_mockElem, _mockElem);
            expect(getAnimSpy).toHaveBeenCalledWith([_mockElem], 25, 0);
            expect(queueSpy).toHaveBeenCalledWith([_stubAnimation]);
            done();
          },
          (error: any): void => {
            console.log('Error in: \'should queue sliding hint animations\'', error);
            expect(true).toBe(false);
          }
        );
    });

    test('should get an error trying to play combined sliding hint animations', (done: jest.DoneCallback): void => {
      const _mockError: Error = new Error('test-error');
      service.getSlidingElements = jest.fn()
        .mockImplementation((): any => { throw _mockError; });

      service.playCombinedSlidingHintAnimations(null, null)
        .subscribe(
          (results: any): void => {
            console.log('Should not get results', results);
            expect(true).toBe(false);
          },
          (error: Error): void => {
            expect(error).toStrictEqual(_mockError);
            done();
          }
        );
    });

    test('should toggle sliding item class', (): void => {
      const _stubRenderer: Renderer2Stub = new Renderer2Stub();
      const _mockElem: HTMLElement = global.document.createElement('div');
      const _mockChildElem: HTMLElement = global.document.createElement('div');
      _stubRenderer.addClass = jest.fn();
      _stubRenderer.removeClass = jest.fn();
      _mockElem.querySelectorAll = jest.fn()
        .mockReturnValue([_mockChildElem]);
      const addSpy: jest.SpyInstance = jest.spyOn(_stubRenderer, 'addClass');
      const removeSpy: jest.SpyInstance = jest.spyOn(_stubRenderer, 'removeClass');

      service.toggleSlidingItemClass(_mockElem, true, <any>_stubRenderer);

      expect(addSpy).toHaveBeenNthCalledWith(1, _mockChildElem, 'item-sliding-active-slide');
      expect(addSpy).toHaveBeenNthCalledWith(2, _mockChildElem, 'item-sliding-active-options-end');
      expect(removeSpy).not.toHaveBeenCalled();

      service.toggleSlidingItemClass(_mockElem, false, <any>_stubRenderer);

      expect(removeSpy).toHaveBeenNthCalledWith(1, _mockChildElem, 'item-sliding-active-slide');
      expect(removeSpy).toHaveBeenNthCalledWith(2, _mockChildElem, 'item-sliding-active-options-end');
      expect(addSpy).toHaveBeenCalledTimes(2);
    });

  });


  describe('Errors', (): void => {

    test('should get an animation error', (): void => {
      const customError: CustomError = service.getAnimationError();
      expect(customError.name).toMatch('AnimationError');
      expect(customError.message).toMatch('An error occurred playing sliding hint animations');
      expect(customError.severity).toEqual(service.errorReporter.lowSeverity);
      expect(customError.userMessage).toMatch('An error occurred playing sliding hint animations');
    })

    test('should report sliding hint error', (): void => {
      const _mockErrorReport: ErrorReport = mockErrorReport();
      Object.assign(service.errorReporter, { lowSeverity: 1 });
      service.errorReporter.setErrorReport = jest.fn();
      const setSpy: jest.SpyInstance = jest.spyOn(service.errorReporter, 'setErrorReport');
      service.errorReporter.getCustomReportFromError = jest.fn()
        .mockImplementation((error: Error): ErrorReport => _mockErrorReport);
      const getSpy: jest.SpyInstance = jest.spyOn(service.errorReporter, 'getCustomReportFromError');

      service.reportSlidingHintError();
      const customError: CustomError = getSpy.mock.calls[0][0];
      expect(customError.name).toMatch('AnimationError');
      expect(customError.message).toMatch('Cannot find content container');
      expect(customError.severity).toEqual(service.errorReporter.lowSeverity);
      expect(customError.userMessage).toMatch('Cannot find content container');
      expect(setSpy).toHaveBeenCalledWith(_mockErrorReport);
    });

  });

});
