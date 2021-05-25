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
      speed: 250,
      direction: 70
    });

    expect(addSpy).toHaveBeenCalledWith(mockElem);
    expect(durationSpy).toHaveBeenCalledWith(250);
    expect(fromSpy).toHaveBeenNthCalledWith(1, 'transform', 'translateX(70%)', 'translateX(0)');
    expect(fromSpy).toHaveBeenNthCalledWith(2, 'opacity', 0, 1);

    animationService.slideIn(mockElem, {
      speed: 500
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
      speed: 250,
      direction: 70
    });

    expect(addSpy).toHaveBeenCalledWith(mockElem);
    expect(durationSpy).toHaveBeenCalledWith(250);
    expect(fromSpy).toHaveBeenNthCalledWith(1, 'transform', 'translateX(0)', 'translateX(70%)');
    expect(fromSpy).toHaveBeenNthCalledWith(2, 'opacity', 1, 0);

    animationService.slideOut(mockElem, {
      speed: 500
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
      speed: 500,
      direction: -20
    });

    expect(addSpy).toHaveBeenCalledWith(mockElem);
    expect(durationSpy).toHaveBeenCalledWith(500);
    expect(easingSpy).toHaveBeenCalledWith('ease-in');
    expect(fromSpy).toHaveBeenNthCalledWith(1, 'transform', 'translateY(-20%)', 'translateY(0%)');
    expect(fromSpy).toHaveBeenNthCalledWith(2, 'height', 0, 'auto');
    expect(fromSpy).toHaveBeenNthCalledWith(3, 'opacity', 0, 1);

    animationService.expand(mockElem, {
      speed: 100
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
      speed: 500,
      direction: -20
    });

    expect(addSpy).toHaveBeenCalledWith(mockElem);
    expect(durationSpy).toHaveBeenCalledWith(500);
    expect(fromSpy).toHaveBeenNthCalledWith(1, 'transform', 'translateY(0%)', 'translateY(-20%)');
    expect(fromSpy).toHaveBeenNthCalledWith(2, 'height', 'auto', 0);
    expect(fromSpy).toHaveBeenNthCalledWith(3, 'opacity', 1, 0);

    animationService.collapse(mockElem, {
      speed: 100
    });

    expect(durationSpy).toHaveBeenNthCalledWith(2, 100);

    animationService.collapse(mockElem, {
      direction: 100
    });

    expect(fromSpy).toHaveBeenNthCalledWith(7, 'transform', 'translateY(0%)', 'translateY(100%)');
  });

});
