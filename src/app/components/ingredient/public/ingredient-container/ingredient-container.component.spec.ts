/* Module imports */
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';

/* Test config imports */
import { configureTestBed } from '@test/configure-test-bed';

/* Mock imports */
import { ActionSheetServiceStub, ErrorReportingServiceStub, LibraryServiceStub, ModalServiceStub } from '@test/service-stubs';
import { mockGrainBill, mockGrains, mockHops, mockHopsSchedule, mockOtherIngredients, mockRecipeVariantComplete, mockYeast, mockYeastBatch } from '@test/mock-models';

/* Interface imports */
import { GrainBill, Grains, Hops, HopsSchedule, OtherIngredients, RecipeVariant, Yeast, YeastBatch } from '@shared/interfaces';

/* Service imports */
import { ActionSheetService, ErrorReportingService, LibraryService, ModalService } from '@services/public';

/* Component imports */
import { IngredientContainerComponent } from './ingredient-container.component';


describe('IngredientContainerComponent', (): void => {
  configureTestBed();
  let fixture: ComponentFixture<IngredientContainerComponent>;
  let component: IngredientContainerComponent;
  let originalOnInit: () => void;

  beforeAll((done: any): Promise<void> => (async (): Promise<void> => {
    TestBed.configureTestingModule({
      declarations: [ IngredientContainerComponent ],
      providers: [
        { provide: ActionSheetService, useClass: ActionSheetServiceStub },
        { provide: ErrorReportingService, useClass: ErrorReportingServiceStub },
        { provide: LibraryService, useClass: LibraryServiceStub },
        { provide: ModalService, useClass: ModalServiceStub }
      ],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
    })
  })()
  .then(done)
  .catch(done.fail));

  beforeEach((): void => {
    fixture = TestBed.createComponent(IngredientContainerComponent);
    component = fixture.componentInstance;
    originalOnInit = component.ngOnInit;
    component.ngOnInit = jest.fn();
    component.errorReporter.handleUnhandledError = jest.fn();
  });

  test('should create the component', (): void => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  test('should init the component', (): void => {
    component.getIngredientLibraries = jest.fn();
    const getSpy: jest.SpyInstance = jest.spyOn(component, 'getIngredientLibraries');
    component.ngOnInit = originalOnInit;

    fixture.detectChanges();

    expect(getSpy).toHaveBeenCalled();
  });

  test('should get ingredient libraries', (done: jest.DoneCallback): void => {
    const _mockGrains: Grains[] = mockGrains();
    component.libraryService.getGrainsLibrary = jest.fn()
      .mockReturnValue(of(_mockGrains));
    const _mockHops: Hops[] = mockHops();
    component.libraryService.getHopsLibrary = jest.fn()
      .mockReturnValue(of(_mockHops));
    const _mockYeast: Yeast[] = mockYeast();
    component.libraryService.getYeastLibrary = jest.fn()
      .mockReturnValue(of(_mockYeast));

    fixture.detectChanges();

    expect(component.grainsLibrary).toBeNull();
    expect(component.hopsLibrary).toBeNull();
    expect(component.yeastLibrary).toBeNull();
    component.getIngredientLibraries();
    setTimeout((): void => {
      expect(component.grainsLibrary).toStrictEqual(_mockGrains);
      expect(component.hopsLibrary).toStrictEqual(_mockHops);
      expect(component.yeastLibrary).toStrictEqual(_mockYeast);
      done();
    }, 10);
  });

  test('should handle error getting ingredient libraries', (done: jest.DoneCallback): void => {
    const _mockError: Error = new Error('test-error');
    component.libraryService.getGrainsLibrary = jest.fn()
      .mockReturnValue(throwError(_mockError));
    const errorSpy: jest.SpyInstance = jest.spyOn(component.errorReporter, 'handleUnhandledError');

    fixture.detectChanges();

    component.getIngredientLibraries();
    setTimeout((): void => {
      expect(errorSpy).toHaveBeenCalledWith(_mockError);
      done();
    }, 10);
  });

  test('should open ingredients action sheet', (): void => {
    component.actionService.openActionSheet = jest.fn();
    const openSpy: jest.SpyInstance = jest.spyOn(component.actionService, 'openActionSheet');
    component.openIngredientFormModal = jest.fn();
    const formSpy: jest.SpyInstance = jest.spyOn(component, 'openIngredientFormModal');

    fixture.detectChanges();

    component.openIngredientActionSheet();
    const args: any[] = openSpy.mock.calls[0];
    expect(args[0]).toMatch('Select an Ingredient');
    const options: { text: string, handler: () => void }[] = args[1];
    expect(options[0].text).toMatch('Grains');
    options[0].handler();
    expect(formSpy).toHaveBeenNthCalledWith(1, 'grains');
    expect(options[1].text).toMatch('Hops');
    options[1].handler();
    expect(formSpy).toHaveBeenNthCalledWith(2, 'hops');
    expect(options[2].text).toMatch('Yeast');
    options[2].handler();
    expect(formSpy).toHaveBeenNthCalledWith(3, 'yeast');
    expect(options[3].text).toMatch('Other');
    options[3].handler();
    expect(formSpy).toHaveBeenNthCalledWith(4, 'otherIngredients');
  });

  test('should get ingredient form modal options', (): void => {
    const _mockRecipeVariantComplete: RecipeVariant = mockRecipeVariantComplete();
    component.variant = _mockRecipeVariantComplete;
    const _mockGrains: Grains[] = mockGrains();
    component.grainsLibrary = _mockGrains;
    const _mockHops: Hops[] = mockHops();
    component.hopsLibrary = _mockHops;
    const _mockYeast: Yeast[] = mockYeast();
    component.yeastLibrary = _mockYeast;

    fixture.detectChanges();

    expect(component.getIngredientFormModalOptions('other')).toStrictEqual({
      ingredientType: 'other',
      update: undefined,
      boilTime: _mockRecipeVariantComplete.boilDuration
    });
    const _mockGrainBill: GrainBill = mockGrainBill()[0];
    expect(component.getIngredientFormModalOptions('grains', _mockGrainBill)).toStrictEqual({
      ingredientType: 'grains',
      update: _mockGrainBill,
      boilTime: _mockRecipeVariantComplete.boilDuration,
      ingredientLibrary: _mockGrains
    });
    const _mockHopsSchedule: HopsSchedule = mockHopsSchedule()[0];
    expect(component.getIngredientFormModalOptions('hops', _mockHopsSchedule)).toStrictEqual({
      ingredientType: 'hops',
      update: _mockHopsSchedule,
      boilTime: _mockRecipeVariantComplete.boilDuration,
      ingredientLibrary: _mockHops
    });
    const _mockYeastBatch: YeastBatch = mockYeastBatch()[0];
    expect(component.getIngredientFormModalOptions('yeast', _mockYeastBatch)).toStrictEqual({
      ingredientType: 'yeast',
      update: _mockYeastBatch,
      boilTime: _mockRecipeVariantComplete.boilDuration,
      ingredientLibrary: _mockYeast
    });
  });

  test('should open ingredient form modal', (done: jest.DoneCallback): void => {
    component.ingredientUpdateEvent.emit = jest.fn();
    const emitSpy: jest.SpyInstance = jest.spyOn(component.ingredientUpdateEvent, 'emit');
    const _mockGrainBills: GrainBill[] = mockGrainBill();
    const _mockGrainBill: GrainBill = _mockGrainBills[0];
    component.modalService.openModal = jest.fn()
      .mockReturnValue(of(_mockGrainBill));
    component.getIngredientFormModalOptions = jest.fn()
      .mockReturnValue({});

    fixture.detectChanges();

    const _mockToUpdate: GrainBill = _mockGrainBills[1];
    component.openIngredientFormModal('grains', _mockToUpdate);
    setTimeout((): void => {
      expect(emitSpy).toHaveBeenCalledWith({
        type: 'grains',
        toUpdate: _mockToUpdate,
        ingredient: _mockGrainBill
      });
      done();
    }, 10);
  });

  test('should handle error from modal', (done: jest.DoneCallback): void => {
    const _mockError: Error = new Error('test-error');
    component.modalService.openModal = jest.fn()
      .mockReturnValue(throwError(_mockError));
    component.getIngredientFormModalOptions = jest.fn()
      .mockReturnValue({});
    const errorSpy: jest.SpyInstance = jest.spyOn(component.errorReporter, 'handleUnhandledError');

    fixture.detectChanges();

    component.openIngredientFormModal('grains');
    setTimeout((): void => {
      expect(errorSpy).toHaveBeenCalledWith(_mockError);
      done();
    }, 10);
  });

  test('should render the template', (): void => {
    const _mockRecipeVariantComplete: RecipeVariant = mockRecipeVariantComplete();
    component.variant = _mockRecipeVariantComplete;
    component.ngOnInit = originalOnInit;

    fixture.detectChanges();

    const button: HTMLElement = fixture.nativeElement.querySelector('ion-button');
    expect(button.textContent).toMatch('ADD INGREDIENT');
    const grainBill: HTMLElement = fixture.nativeElement.querySelector('app-grain-bill');
    expect(grainBill).not.toBeNull();
    const hopsSchedule: HTMLElement = fixture.nativeElement.querySelector('app-hops-schedule');
    expect(hopsSchedule).not.toBeNull();
    const yeastBatch: HTMLElement = fixture.nativeElement.querySelector('app-yeast-batch');
    expect(yeastBatch).not.toBeNull();
    const otherIngredients: HTMLElement = fixture.nativeElement.querySelector('app-other-ingredients');
    expect(otherIngredients).not.toBeNull();
  });

});
