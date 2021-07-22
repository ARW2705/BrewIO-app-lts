/* Module imports */
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

/* Test configuration imports */
import { configureTestBed } from '../../../../test-config/configure-test-bed';

/* Mock imports */
import { AnimationsServiceStub } from '../../../../test-config/service-stubs';
import { AnimationStub } from '../../../../test-config/ionic-stubs';

/* Service imports */
import { AnimationsService } from '../../services/services';

/* Component imports */
import { AccordionComponent } from './accordion.component';


describe('AccordionComponent', (): void => {
  let fixture: ComponentFixture<AccordionComponent>;
  let accordionCmp: AccordionComponent;
  configureTestBed();

  beforeAll((done: any): Promise<void> => (async (): Promise<void> => {
    TestBed.configureTestingModule({
      imports: [ NoopAnimationsModule ],
      declarations: [ AccordionComponent ],
      providers: [
        { provide: AnimationsService, useClass: AnimationsServiceStub }
      ],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
    });
    await TestBed.compileComponents();
  })()
  .then(done)
  .catch(done.fail));

  beforeEach((): void => {
    fixture = TestBed.createComponent(AccordionComponent);
    accordionCmp = fixture.componentInstance;
  });

  test('should create the component', (): void => {
    fixture.detectChanges();

    expect(accordionCmp).toBeDefined();
  });

  test('should call play animation on changes', (): void => {
    accordionCmp.playAnimation = jest
      .fn();

    const playSpy: jest.SpyInstance = jest.spyOn(accordionCmp, 'playAnimation');

    fixture.detectChanges();

    accordionCmp.ngOnChanges();

    expect(playSpy).toHaveBeenCalled();
  });

  test('should toggle expansion', (): void => {
    const _stubExpandAnimation: AnimationStub = new AnimationStub();
    _stubExpandAnimation.play = jest
      .fn()
      .mockReturnValue(Promise.resolve());

    const _stubCollapseAnimation: AnimationStub = new AnimationStub();
    _stubCollapseAnimation.play = jest
      .fn()
      .mockReturnValue(Promise.resolve());

    accordionCmp.animationService.expand = jest
      .fn()
      .mockReturnValue(_stubExpandAnimation);

    accordionCmp.animationService.collapse = jest
      .fn()
      .mockReturnValue(_stubCollapseAnimation);

    const expandSpy: jest.SpyInstance = jest.spyOn(accordionCmp.animationService, 'expand');
    const collapseSpy: jest.SpyInstance = jest.spyOn(accordionCmp.animationService, 'collapse');
    const expandPlaySpy: jest.SpyInstance = jest.spyOn(_stubExpandAnimation, 'play');
    const collapsePlaySpy: jest.SpyInstance = jest.spyOn(_stubCollapseAnimation, 'play');

    accordionCmp.expanded = true;

    fixture.detectChanges();

    const divElement: HTMLElement = fixture.nativeElement.querySelector('div');

    accordionCmp.playAnimation();

    expect(expandSpy).toHaveBeenCalledWith(divElement, { duration: accordionCmp.animationDuration });
    expect(expandPlaySpy).toHaveBeenCalled();

    accordionCmp.expanded = false;

    accordionCmp.playAnimation();

    expect(collapseSpy).toHaveBeenCalledWith(divElement, { duration: accordionCmp.animationDuration });
    expect(collapsePlaySpy).toHaveBeenCalled();
  });

  test('should not play animation if container is not present', (): void => {
    const _stubExpandAnimation: AnimationStub = new AnimationStub();
    _stubExpandAnimation.play = jest
      .fn()
      .mockReturnValue(Promise.resolve());

    accordionCmp.animationService.expand = jest
      .fn()
      .mockReturnValue(_stubExpandAnimation);

    const expandSpy: jest.SpyInstance = jest.spyOn(accordionCmp.animationService, 'expand');
    const expandPlaySpy: jest.SpyInstance = jest.spyOn(_stubExpandAnimation, 'play');

    accordionCmp.expanded = true;

    fixture.detectChanges();

    accordionCmp.container = null;

    accordionCmp.playAnimation();

    expect(expandSpy).not.toHaveBeenCalled();
    expect(expandPlaySpy).not.toHaveBeenCalled();
  });

});
