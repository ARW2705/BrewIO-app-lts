/* Module imports */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { IonicModule, ModalController } from '@ionic/angular';

/* Test configuration imports */
import { configureTestBed } from '../../../../../../test-config/configure-test-bed';

/* Mock imports */
import { mockGrains, mockGrainBill, mockEnglishUnits } from '../../../../../../test-config/mock-models';
import { PreferencesServiceStub, UtilityServiceStub } from '../../../../../../test-config/service-stubs';
import { HeaderComponentStub } from '../../../../../../test-config/component-stubs';
import { ModalControllerStub } from '../../../../../../test-config/ionic-stubs';

/* Interface imports */
import { Grains, GrainBill, SelectedUnits } from '../../../../shared/interfaces';

/* Service imports */
import { PreferencesService, UtilityService } from '../../../../services/services';

/* Page imports */
import { IngredientFormComponent } from './ingredient-form.component';


describe('IngredientFormComponent', (): void => {
  let fixture: ComponentFixture<IngredientFormComponent>;
  let page: IngredientFormComponent;
  let originalOnInit: any;
  configureTestBed();

  beforeAll((done: any): Promise<void> => (async (): Promise<void> => {
    TestBed.configureTestingModule({
      declarations: [
        IngredientFormComponent,
        HeaderComponentStub,
      ],
      providers: [
        { provide: ModalController, useClass: ModalControllerStub },
        { provide: PreferencesService, useClass: PreferencesServiceStub },
        { provide: UtilityService, useClass: UtilityServiceStub }
      ],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
    });
    await TestBed.compileComponents();
  })()
  .then(done)
  .catch(done.fail));

  beforeEach((): void => {
    fixture = TestBed.createComponent(IngredientFormComponent);
    page = fixture.componentInstance;
    originalOnInit = page.ngOnInit;
    page.ngOnInit = jest.fn();
  });

  test('should create the component', (): void => {
    fixture.detectChanges();

    expect(page).toBeTruthy();
  });
  //
  // describe('Form Methods', (): void => {
  //
  //   test('should init the component', (): void => {
  //     page.ngOnInit = originalOnInit;
  //     page.ingredientType = 'grains';
  //     page.update = mockGrainBill()[0];
  //     const _mockEnglishUnits: SelectedUnits = mockEnglishUnits();
  //     page.utilService.toTitleCase = jest.fn()
  //       .mockImplementation((value: string): string => value);
  //     page.preferenceService.getSelectedUnits = jest.fn()
  //       .mockReturnValue(_mockEnglishUnits);
  //     page.buildFormSelectOptions = jest.fn();
  //     const buildSpy: jest.SpyInstance = jest.spyOn(page, 'buildFormSelectOptions');
  //     page.setFormValidity = jest.fn();
  //     const setSpy: jest.SpyInstance = jest.spyOn(page, 'setFormValidity');
  //
  //     fixture.detectChanges();
  //
  //     expect(buildSpy).toHaveBeenCalled();
  //     expect(setSpy).toHaveBeenCalledWith(true);
  //     expect(page.formType).toMatch('update');
  //     expect(page.title).toMatch('grains');
  //     expect(page.units).toStrictEqual(_mockEnglishUnits);
  //   });
  //
  //   test('should dismiss if missing ingredient type', (): void => {
  //     page.ngOnInit = originalOnInit;
  //     page.dismissOnError = jest.fn();
  //     const dismissSpy: jest.SpyInstance = jest.spyOn(page, 'dismissOnError');
  //
  //     fixture.detectChanges();
  //
  //     expect(dismissSpy).toHaveBeenCalledWith('Missing ingredient type');
  //   });
  //
  //   test('should build an array of form select options based on ingredient library', (): void => {
  //     const _mockGrains: Grains[] = mockGrains();
  //     page.ingredientLibrary = _mockGrains;
  //
  //     fixture.detectChanges();
  //
  //     expect(page.ingredientOptions.length).toEqual(0);
  //     page.buildFormSelectOptions();
  //     expect(page.ingredientOptions.length).toEqual(_mockGrains.length);
  //     expect(page.ingredientOptions[0]).toStrictEqual({
  //       label: _mockGrains[0].name,
  //       value: _mockGrains[0]
  //     });
  //   });
  //
  //   test('should dismiss modal with no data', (): void => {
  //     page.modalCtrl.dismiss = jest.fn();
  //     const dismissSpy: jest.SpyInstance = jest.spyOn(page.modalCtrl, 'dismiss');
  //
  //     fixture.detectChanges();
  //
  //     page.dismiss();
  //     expect(dismissSpy).toHaveBeenCalled();
  //   });
  //
  //   test('should dismiss modal with error', (): void => {
  //     page.modalCtrl.dismiss = jest.fn();
  //     const dismissSpy: jest.SpyInstance = jest.spyOn(page.modalCtrl, 'dismiss');
  //
  //     fixture.detectChanges();
  //
  //     page.dismissOnError('test-message');
  //     expect(dismissSpy).toHaveBeenCalledWith({ error: 'test-message' });
  //   });
  //
  //   test('should dismiss modal with deletion flag', (): void => {
  //     page.modalCtrl.dismiss = jest.fn();
  //     const dismissSpy: jest.SpyInstance = jest.spyOn(page.modalCtrl, 'dismiss');
  //
  //     fixture.detectChanges();
  //
  //     page.onDeletion();
  //     expect(dismissSpy).toHaveBeenCalledWith({ delete: true });
  //   });
  //
  //   test('should submit the sub component form values', (): void => {
  //     const _formResult: object = { test: true };
  //     const formPage: any = { getFormResult: (): object => _formResult };
  //     page.modalCtrl.dismiss = jest.fn();
  //     const dismissSpy: jest.SpyInstance = jest.spyOn(page.modalCtrl, 'dismiss');
  //
  //     fixture.detectChanges();
  //
  //     page.formRef = formPage;
  //     page.onSubmit();
  //     expect(dismissSpy).toHaveBeenCalledWith(_formResult);
  //   });
  //
  //   test('should set form validity', (): void => {
  //     fixture.detectChanges();
  //
  //     page.isFormValid = false;
  //     page.setFormValidity(true);
  //     expect(page.isFormValid).toBe(true);
  //     page.setFormValidity(false);
  //     expect(page.isFormValid).toBe(false);
  //   });
  //
  // });
  //
  //
  // describe('Render Template', (): void => {
  //
  //   test('should render the template', (): void => {
  //     page.ngOnInit = originalOnInit;
  //     page.ingredientType = 'grains';
  //     const _mockGrains: Grains[] = mockGrains();
  //     page.ingredientLibrary = _mockGrains;
  //     page.utilService.toTitleCase = jest.fn()
  //       .mockReturnValue('Grains');
  //     const _mockUnits = mockEnglishUnits();
  //     page.preferenceService.getSelectedUnits = jest.fn()
  //       .mockReturnValue(_mockUnits);
  //     const _mockGrainBill: GrainBill = mockGrainBill()[0];
  //     page.update = _mockGrainBill;
  //
  //     fixture.detectChanges();
  //
  //     const grainFormElem: HTMLElement = fixture.nativeElement.querySelector('app-grain-form');
  //     expect(grainFormElem).toBeTruthy();
  //     expect(grainFormElem['grainFormOptions'].length).toEqual(_mockGrains.length);
  //     expect(grainFormElem['units']).toStrictEqual(_mockUnits);
  //     expect(grainFormElem['update']).toStrictEqual(_mockGrainBill);
  //     const hopsFormElem: HTMLElement = fixture.nativeElement.querySelector('app-hops-form');
  //     expect(hopsFormElem).toBeNull();
  //     const yeastFormElem: HTMLElement = fixture.nativeElement.querySelector('app-yeast-form');
  //     expect(yeastFormElem).toBeNull();
  //     const otherFormElem: HTMLElement = fixture.nativeElement.querySelector('app-other-ingredients-form');
  //     expect(otherFormElem).toBeNull();
  //     const formButtons: HTMLElement = fixture.nativeElement.querySelector('app-form-buttons');
  //     expect(formButtons).toBeTruthy();
  //     expect(formButtons['isSubmitDisabled']).toBe(false);
  //     const deleteButton: HTMLElement = fixture.nativeElement.querySelector('app-delete-button');
  //     expect(deleteButton).toBeTruthy();
  //   });
  //
  // });

});
