/* Module imports */
import { TestBed, getTestBed, async } from '@angular/core/testing';
import { AnimationController } from '@ionic/angular';

/* Test configuration imports */
import { configureTestBed } from '../../../../test-config/configure-test-bed';

/* Mock imports */
// import {  } from '../../../../test-config/mock-models';
import { AnimationControllerStub, AnimationStub } from '../../../../test-config/ionic-stubs';

/* Service imports */
import { AnimationsService } from './animations.service';


describe('AnimationsService', () => {

  let injector: TestBed;
  let animationService: AnimationsService;
  configureTestBed();

  beforeAll(async(() => {
    TestBed.configureTestingModule({
      providers: [
        AnimationsService,
        { provide: AnimationController, useClass: AnimationControllerStub }
      ]
    });

    injector = getTestBed();
    animationService = injector.get(AnimationsService);
  }));

  test('should create the service', () => {
    expect(animationService).toBeDefined();
  });

  test('should get slide in animation with defaults', (): void => {
    const mockElem: HTMLElement = global.document.createElement('div');
    const _stubAnimation: AnimationStub = new AnimationStub();

    animationService.animationCtrl.create = jest
      .fn()
      .mockReturnValue(_stubAnimation);

    _stubAnimation.addElement = jest
      .fn()
      .mockReturnValue(_stubAnimation);
    _stubAnimation.duration = jest
      .fn()
      .mockReturnValue(_stubAnimation);
    _stubAnimation.fromTo = jest
      .fn()
      .mockReturnValue(_stubAnimation);

    const addSpy: jest.SpyInstance = jest.spyOn(_stubAnimation, 'addElement');
    const durationSpy: jest.SpyInstance = jest.spyOn(_stubAnimation, 'duration');
    const fromSpy: jest.SpyInstance = jest.spyOn(_stubAnimation, 'fromTo');

    animationService.slideIn(mockElem);

    expect(addSpy).toHaveBeenCalledWith(mockElem);
    expect(durationSpy).toHaveBeenCalledWith(500);
    expect(fromSpy).toHaveBeenNthCalledWith(1, 'transform', 'translateX(-100%)', 'translateX(0)');
    expect(fromSpy).toHaveBeenNthCalledWith(2, 'opacity', 0, 1);
  });

  test('should get slide in animation with options', (): void => {
    const mockElem: HTMLElement = global.document.createElement('div');
    const _stubAnimation: AnimationStub = new AnimationStub();

    animationService.animationCtrl.create = jest
      .fn()
      .mockReturnValue(_stubAnimation);

    _stubAnimation.addElement = jest
      .fn()
      .mockReturnValue(_stubAnimation);
    _stubAnimation.duration = jest
      .fn()
      .mockReturnValue(_stubAnimation);
    _stubAnimation.fromTo = jest
      .fn()
      .mockReturnValue(_stubAnimation);

    const addSpy: jest.SpyInstance = jest.spyOn(_stubAnimation, 'addElement');
    const durationSpy: jest.SpyInstance = jest.spyOn(_stubAnimation, 'duration');
    const fromSpy: jest.SpyInstance = jest.spyOn(_stubAnimation, 'fromTo');

    animationService.slideIn(mockElem, {
      duration: 250,
      direction: 70
    });

    expect(addSpy).toHaveBeenCalledWith(mockElem);
    expect(durationSpy).toHaveBeenCalledWith(250);
    expect(fromSpy).toHaveBeenNthCalledWith(1, 'transform', 'translateX(70%)', 'translateX(0)');
    expect(fromSpy).toHaveBeenNthCalledWith(2, 'opacity', 0, 1);

    animationService.slideIn(mockElem, {
      duration: 500
    });

    expect(durationSpy).toHaveBeenNthCalledWith(2, 500);

    animationService.slideIn(mockElem, {
      direction: 100
    });

    expect(fromSpy).toHaveBeenNthCalledWith(5, 'transform', 'translateX(100%)', 'translateX(0)');
  });

  test('should get slide out animation with defaults', (): void => {
    const mockElem: HTMLElement = global.document.createElement('div');
    const _stubAnimation: AnimationStub = new AnimationStub();

    animationService.animationCtrl.create = jest
      .fn()
      .mockReturnValue(_stubAnimation);

    _stubAnimation.addElement = jest
      .fn()
      .mockReturnValue(_stubAnimation);
    _stubAnimation.duration = jest
      .fn()
      .mockReturnValue(_stubAnimation);
    _stubAnimation.fromTo = jest
      .fn()
      .mockReturnValue(_stubAnimation);

    const addSpy: jest.SpyInstance = jest.spyOn(_stubAnimation, 'addElement');
    const durationSpy: jest.SpyInstance = jest.spyOn(_stubAnimation, 'duration');
    const fromSpy: jest.SpyInstance = jest.spyOn(_stubAnimation, 'fromTo');

    animationService.slideOut(mockElem);

    expect(addSpy).toHaveBeenCalledWith(mockElem);
    expect(durationSpy).toHaveBeenCalledWith(500);
    expect(fromSpy).toHaveBeenNthCalledWith(1, 'transform', 'translateX(0)', 'translateX(100%)');
    expect(fromSpy).toHaveBeenNthCalledWith(2, 'opacity', 1, 0);
  });

  test('should get slide out animation with options', (): void => {
    const mockElem: HTMLElement = global.document.createElement('div');
    const _stubAnimation: AnimationStub = new AnimationStub();

    animationService.animationCtrl.create = jest
      .fn()
      .mockReturnValue(_stubAnimation);

    _stubAnimation.addElement = jest
      .fn()
      .mockReturnValue(_stubAnimation);
    _stubAnimation.duration = jest
      .fn()
      .mockReturnValue(_stubAnimation);
    _stubAnimation.fromTo = jest
      .fn()
      .mockReturnValue(_stubAnimation);

    const addSpy: jest.SpyInstance = jest.spyOn(_stubAnimation, 'addElement');
    const durationSpy: jest.SpyInstance = jest.spyOn(_stubAnimation, 'duration');
    const fromSpy: jest.SpyInstance = jest.spyOn(_stubAnimation, 'fromTo');

    animationService.slideOut(mockElem, {
      duration: 250,
      direction: 70
    });

    expect(addSpy).toHaveBeenCalledWith(mockElem);
    expect(durationSpy).toHaveBeenCalledWith(250);
    expect(fromSpy).toHaveBeenNthCalledWith(1, 'transform', 'translateX(0)', 'translateX(70%)');
    expect(fromSpy).toHaveBeenNthCalledWith(2, 'opacity', 1, 0);

    animationService.slideOut(mockElem, {
      duration: 500
    });

    expect(durationSpy).toHaveBeenNthCalledWith(2, 500);

    animationService.slideOut(mockElem, {
      direction: 100
    });

    expect(fromSpy).toHaveBeenNthCalledWith(5, 'transform', 'translateX(0)', 'translateX(100%)');
  });

  test('should get expand animation with defaults', (): void => {
    const mockElem: HTMLElement = global.document.createElement('div');
    const _stubAnimation: AnimationStub = new AnimationStub();

    animationService.animationCtrl.create = jest
      .fn()
      .mockReturnValue(_stubAnimation);

    _stubAnimation.addElement = jest
      .fn()
      .mockReturnValue(_stubAnimation);
    _stubAnimation.duration = jest
      .fn()
      .mockReturnValue(_stubAnimation);
    _stubAnimation.fromTo = jest
      .fn()
      .mockReturnValue(_stubAnimation);
    _stubAnimation.easing = jest
      .fn()
      .mockReturnValue(_stubAnimation);

    const addSpy: jest.SpyInstance = jest.spyOn(_stubAnimation, 'addElement');
    const durationSpy: jest.SpyInstance = jest.spyOn(_stubAnimation, 'duration');
    const fromSpy: jest.SpyInstance = jest.spyOn(_stubAnimation, 'fromTo');
    const easingSpy: jest.SpyInstance = jest.spyOn(_stubAnimation, 'easing');

    animationService.expand(mockElem);

    expect(addSpy).toHaveBeenCalledWith(mockElem);
    expect(durationSpy).toHaveBeenCalledWith(250);
    expect(easingSpy).toHaveBeenCalledWith('ease-in');
    expect(fromSpy).toHaveBeenNthCalledWith(1, 'transform', 'translateY(-50%)', 'translateY(0%)');
    expect(fromSpy).toHaveBeenNthCalledWith(2, 'height', 0, 'auto');
    expect(fromSpy).toHaveBeenNthCalledWith(3, 'opacity', 0, 1);
  });

  test('should get expand animation with options', (): void => {
    const mockElem: HTMLElement = global.document.createElement('div');
    const _stubAnimation: AnimationStub = new AnimationStub();

    animationService.animationCtrl.create = jest
      .fn()
      .mockReturnValue(_stubAnimation);

    _stubAnimation.addElement = jest
      .fn()
      .mockReturnValue(_stubAnimation);
    _stubAnimation.duration = jest
      .fn()
      .mockReturnValue(_stubAnimation);
    _stubAnimation.fromTo = jest
      .fn()
      .mockReturnValue(_stubAnimation);
    _stubAnimation.easing = jest
      .fn()
      .mockReturnValue(_stubAnimation);

    const addSpy: jest.SpyInstance = jest.spyOn(_stubAnimation, 'addElement');
    const durationSpy: jest.SpyInstance = jest.spyOn(_stubAnimation, 'duration');
    const fromSpy: jest.SpyInstance = jest.spyOn(_stubAnimation, 'fromTo');
    const easingSpy: jest.SpyInstance = jest.spyOn(_stubAnimation, 'easing');

    animationService.expand(mockElem, {
      duration: 500,
      direction: -20
    });

    expect(addSpy).toHaveBeenCalledWith(mockElem);
    expect(durationSpy).toHaveBeenCalledWith(500);
    expect(easingSpy).toHaveBeenCalledWith('ease-in');
    expect(fromSpy).toHaveBeenNthCalledWith(1, 'transform', 'translateY(-20%)', 'translateY(0%)');
    expect(fromSpy).toHaveBeenNthCalledWith(2, 'height', 0, 'auto');
    expect(fromSpy).toHaveBeenNthCalledWith(3, 'opacity', 0, 1);

    animationService.expand(mockElem, {
      duration: 100
    });

    expect(durationSpy).toHaveBeenNthCalledWith(2, 100);

    animationService.expand(mockElem, {
      direction: 100
    });

    expect(fromSpy).toHaveBeenNthCalledWith(7, 'transform', 'translateY(100%)', 'translateY(0%)');
  });

  test('should get collapse animation with defaults', (): void => {
    const mockElem: HTMLElement = global.document.createElement('div');
    const _stubAnimation: AnimationStub = new AnimationStub();

    animationService.animationCtrl.create = jest
      .fn()
      .mockReturnValue(_stubAnimation);

    _stubAnimation.addElement = jest
      .fn()
      .mockReturnValue(_stubAnimation);
    _stubAnimation.duration = jest
      .fn()
      .mockReturnValue(_stubAnimation);
    _stubAnimation.fromTo = jest
      .fn()
      .mockReturnValue(_stubAnimation);

    const addSpy: jest.SpyInstance = jest.spyOn(_stubAnimation, 'addElement');
    const durationSpy: jest.SpyInstance = jest.spyOn(_stubAnimation, 'duration');
    const fromSpy: jest.SpyInstance = jest.spyOn(_stubAnimation, 'fromTo');

    animationService.collapse(mockElem);

    expect(addSpy).toHaveBeenCalledWith(mockElem);
    expect(durationSpy).toHaveBeenCalledWith(250);
    expect(fromSpy).toHaveBeenNthCalledWith(1, 'transform', 'translateY(0%)', 'translateY(-50%)');
    expect(fromSpy).toHaveBeenNthCalledWith(2, 'height', 'auto', 0);
    expect(fromSpy).toHaveBeenNthCalledWith(3, 'opacity', 1, 0);
  });

  test('should get collapse animation with options', (): void => {
    const mockElem: HTMLElement = global.document.createElement('div');
    const _stubAnimation: AnimationStub = new AnimationStub();

    animationService.animationCtrl.create = jest
      .fn()
      .mockReturnValue(_stubAnimation);

    _stubAnimation.addElement = jest
      .fn()
      .mockReturnValue(_stubAnimation);
    _stubAnimation.duration = jest
      .fn()
      .mockReturnValue(_stubAnimation);
    _stubAnimation.fromTo = jest
      .fn()
      .mockReturnValue(_stubAnimation);

    const addSpy: jest.SpyInstance = jest.spyOn(_stubAnimation, 'addElement');
    const durationSpy: jest.SpyInstance = jest.spyOn(_stubAnimation, 'duration');
    const fromSpy: jest.SpyInstance = jest.spyOn(_stubAnimation, 'fromTo');

    animationService.collapse(mockElem, {
      duration: 500,
      direction: -20
    });

    expect(addSpy).toHaveBeenCalledWith(mockElem);
    expect(durationSpy).toHaveBeenCalledWith(500);
    expect(fromSpy).toHaveBeenNthCalledWith(1, 'transform', 'translateY(0%)', 'translateY(-20%)');
    expect(fromSpy).toHaveBeenNthCalledWith(2, 'height', 'auto', 0);
    expect(fromSpy).toHaveBeenNthCalledWith(3, 'opacity', 1, 0);

    animationService.collapse(mockElem, {
      duration: 100
    });

    expect(durationSpy).toHaveBeenNthCalledWith(2, 100);

    animationService.collapse(mockElem, {
      direction: 100
    });

    expect(fromSpy).toHaveBeenNthCalledWith(7, 'transform', 'translateY(0%)', 'translateY(100%)');
  });

  test('should check if a hint animation has been shown', (): void => {
    const consoleSpy: jest.SpyInstance = jest.spyOn(console, 'log');

    animationService.hintFlags.sliding.recipeDetail = true;

    expect(animationService.hasHintBeenShown('sliding', 'recipeDetail')).toBe(true);
    expect(animationService.hasHintBeenShown('sliding', 'recipe')).toBe(false);
    expect(animationService.hasHintBeenShown('other', 'recipe')).toBe(false);

    const consoleCalls: any[] = consoleSpy.mock.calls[consoleSpy.mock.calls.length - 1];
    expect(consoleCalls[0]).toMatch('Error getting hint show flag');
    expect(consoleCalls[1]).toMatch('other');
    expect(consoleCalls[2]).toMatch('recipe');
    expect(consoleCalls[3] instanceof Error).toBe(true);
  });

  test('should set hint shown flag', (): void => {
    const consoleSpy: jest.SpyInstance = jest.spyOn(console, 'log');

    animationService.hintFlags.sliding.recipeDetail = false;
    animationService.setHintShownFlag('sliding', 'recipeDetail');
    expect(animationService.hintFlags.sliding.recipeDetail).toBe(true);

    expect(animationService.hintFlags.other).toBeUndefined();
    animationService.setHintShownFlag('other', 'recipe');
    expect(animationService.hintFlags.other).toBeUndefined();

    const consoleCalls: any[] = consoleSpy.mock.calls[consoleSpy.mock.calls.length - 1];
    expect(consoleCalls[0]).toMatch('Error setting hint show flag');
    expect(consoleCalls[1]).toMatch('other');
    expect(consoleCalls[2]).toMatch('recipe');
    expect(consoleCalls[3] instanceof Error).toBe(true);
  });

  test('should get sliding hint animation with defaults', (): void => {
    const mockElem: HTMLElement = global.document.createElement('div');
    const _stubAnimation: AnimationStub = new AnimationStub();

    animationService.animationCtrl.create = jest
      .fn()
      .mockReturnValue(_stubAnimation);

    _stubAnimation.addElement = jest
      .fn()
      .mockReturnValue(_stubAnimation);
    _stubAnimation.duration = jest
      .fn()
      .mockReturnValue(_stubAnimation);
    _stubAnimation.delay = jest
      .fn()
      .mockReturnValue(_stubAnimation);
    _stubAnimation.easing = jest
      .fn()
      .mockReturnValue(_stubAnimation);
    _stubAnimation.keyframes = jest
      .fn()
      .mockReturnValue(_stubAnimation);

    const addSpy: jest.SpyInstance = jest.spyOn(_stubAnimation, 'addElement');
    const durationSpy: jest.SpyInstance = jest.spyOn(_stubAnimation, 'duration');
    const delaySpy: jest.SpyInstance = jest.spyOn(_stubAnimation, 'delay');
    const easingSpy: jest.SpyInstance = jest.spyOn(_stubAnimation, 'easing');
    const keyframesSpy: jest.SpyInstance = jest.spyOn(_stubAnimation, 'keyframes');

    animationService.slidingHint(mockElem, {});

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

    animationService.animationCtrl.create = jest
      .fn()
      .mockReturnValue(_stubAnimation);

    _stubAnimation.addElement = jest
      .fn()
      .mockReturnValue(_stubAnimation);
    _stubAnimation.duration = jest
      .fn()
      .mockReturnValue(_stubAnimation);
    _stubAnimation.delay = jest
      .fn()
      .mockReturnValue(_stubAnimation);
    _stubAnimation.easing = jest
      .fn()
      .mockReturnValue(_stubAnimation);
    _stubAnimation.keyframes = jest
      .fn()
      .mockReturnValue(_stubAnimation);

    const addSpy: jest.SpyInstance = jest.spyOn(_stubAnimation, 'addElement');
    const durationSpy: jest.SpyInstance = jest.spyOn(_stubAnimation, 'duration');
    const delaySpy: jest.SpyInstance = jest.spyOn(_stubAnimation, 'delay');
    const easingSpy: jest.SpyInstance = jest.spyOn(_stubAnimation, 'easing');
    const keyframesSpy: jest.SpyInstance = jest.spyOn(_stubAnimation, 'keyframes');

    animationService.slidingHint(mockElem, {
      duration: 800,
      delay: 250,
      distance: 100
    });

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
