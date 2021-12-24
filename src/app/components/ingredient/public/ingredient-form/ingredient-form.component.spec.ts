/* Module imports */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { IonicModule, ModalController } from '@ionic/angular';

/* Test configuration imports */
import { configureTestBed } from '@test/configure-test-bed';

/* Mock imports */
import { mockGrains, mockGrainBill, mockHops, mockHopsSchedule, mockOtherIngredients, mockYeast, mockYeastBatch, mockEnglishUnits } from '@test/mock-models';
import { PreferencesServiceStub, UtilityServiceStub } from '@test/service-stubs';
import { GrainFormComponentStub, HeaderComponentStub } from '@test/component-stubs';
import { ModalControllerStub } from '@test/ionic-stubs';

/* Interface imports */
import { FormSelectOption, Grains, GrainBill, Hops, HopsSchedule, OtherIngredients, Yeast, YeastBatch, SelectedUnits } from '@shared/interfaces';

/* component imports */
import { GrainFormComponent } from '@components/ingredient/private/grain-form/grain-form.component';

/* Service imports */
import { PreferencesService, UtilityService } from '@services/public';

/* Page imports */
import { IngredientFormComponent } from './ingredient-form.component';


describe('IngredientFormComponent', (): void => {
  let fixture: ComponentFixture<IngredientFormComponent>;
  let component: IngredientFormComponent;
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
    component = fixture.componentInstance;
    originalOnInit = component.ngOnInit;
    component.ngOnInit = jest.fn();
    component.modalCtrl.dismiss = jest.fn();
    component.utilService.toTitleCase = jest.fn()
      .mockImplementation((str: string): string => str);
  });

  test('should create the component', (): void => {
    fixture.detectChanges();

    expect(component).toBeTruthy();
  });

  test('should init the component with defaults', (): void => {
    component.ngOnInit = originalOnInit;
    const _mockEnglishUnits: SelectedUnits = mockEnglishUnits();
    component.preferenceService.getSelectedUnits = jest.fn()
      .mockReturnValue(_mockEnglishUnits);
    component.buildFormSelectOptions = jest.fn();
    const buildSpy: jest.SpyInstance = jest.spyOn(component, 'buildFormSelectOptions');
    const setSpy: jest.SpyInstance = jest.spyOn(component, 'setFormValidity');

    fixture.detectChanges();

    component.ngOnInit();
    expect(buildSpy).toHaveBeenCalled();
    expect(setSpy).not.toHaveBeenCalled();
    expect(component.formType).toMatch('create');
  });

  test('should init the component with update', (): void => {
    component.ngOnInit = originalOnInit;
    const _mockGrainBill: GrainBill = mockGrainBill()[0];
    component.update = _mockGrainBill;
    const _mockEnglishUnits: SelectedUnits = mockEnglishUnits();
    component.preferenceService.getSelectedUnits = jest.fn()
      .mockReturnValue(_mockEnglishUnits);
    component.buildFormSelectOptions = jest.fn();
    component.setFormValidity = jest.fn();
    const buildSpy: jest.SpyInstance = jest.spyOn(component, 'buildFormSelectOptions');
    const setSpy: jest.SpyInstance = jest.spyOn(component, 'setFormValidity');

    fixture.detectChanges();

    component.ngOnInit();
    expect(buildSpy).toHaveBeenCalled();
    expect(setSpy).toHaveBeenCalledWith(true);
    expect(component.formType).toMatch('update');
  });

  test('should build form select options', (): void => {
    const _mockGrains: Grains[] = mockGrains();
    component.ingredientLibrary = _mockGrains;

    fixture.detectChanges();

    expect(component.ingredientOptions.length).toEqual(0);
    component.buildFormSelectOptions();
    expect(component.ingredientOptions.length).toEqual(_mockGrains.length);
    component.ingredientOptions.forEach((option: FormSelectOption, index: number): void => {
      expect(option.label).toMatch(_mockGrains[index].name);
      expect(option.value).toStrictEqual(_mockGrains[index]);
    })
  });

  test('should dismiss the modal', (): void => {
    const dismissSpy: jest.SpyInstance = jest.spyOn(component.modalCtrl, 'dismiss');

    fixture.detectChanges();

    component.dismiss();
    expect(dismissSpy).toHaveBeenCalled();
  });

  test('should dismiss the modal with deletion flag', (): void => {
    const dismissSpy: jest.SpyInstance = jest.spyOn(component.modalCtrl, 'dismiss');

    fixture.detectChanges();

    component.onDeletion();
    expect(dismissSpy).toHaveBeenCalledWith({ delete: true });
  });

  test('should dismiss the modal with form result', (): void => {
    const grainFormComponent: GrainFormComponent = (new GrainFormComponentStub() as GrainFormComponent);
    const _mockGrainBill: GrainBill = mockGrainBill()[0];
    const _mockFormResult: GrainBill = _mockGrainBill;
    grainFormComponent.getFormResult = jest.fn()
      .mockReturnValue(_mockFormResult);
    const dismissSpy: jest.SpyInstance = jest.spyOn(component.modalCtrl, 'dismiss');

    fixture.detectChanges();

    component.formRef = grainFormComponent;
    component.onSubmit();
    expect(dismissSpy).toHaveBeenCalledWith(_mockFormResult);
  });

  test('should set form validity', (): void => {
    fixture.detectChanges();

    expect(component.isFormValid).toBe(false);
    component.setFormValidity(true);
    expect(component.isFormValid).toBe(true);
  });

  test('should render the template', (): void => {
    component.ngOnInit = originalOnInit;
    const _mockEnglishUnits: SelectedUnits = mockEnglishUnits();
    component.preferenceService.getSelectedUnits = jest.fn()
      .mockReturnValue(_mockEnglishUnits);
    const _mockGrains: Grains[] = mockGrains();
    component.ingredientLibrary = _mockGrains;
    component.ingredientType = 'grains';

    fixture.detectChanges();

    const required: HTMLElement = fixture.nativeElement.querySelector('p');
    expect(required.textContent).toMatch('Required fields');
    const formButtons: HTMLElement = fixture.nativeElement.querySelector('app-form-buttons');
    expect(formButtons).toBeTruthy();
    const deleteButtonMissing: HTMLElement = fixture.nativeElement.querySelector('app-delete-button');
    expect(deleteButtonMissing).toBeNull();
    component.formType = 'update';

    fixture.detectChanges();

    const deleteButton: HTMLElement = fixture.nativeElement.querySelector('app-delete-button');
    expect(deleteButton).toBeTruthy();
  });

  test('should render the template with the grain from', (): void => {
    component.ngOnInit = originalOnInit;
    const _mockGrainBill: GrainBill = mockGrainBill()[0];
    component.update = _mockGrainBill;
    const _mockEnglishUnits: SelectedUnits = mockEnglishUnits();
    component.preferenceService.getSelectedUnits = jest.fn()
      .mockReturnValue(_mockEnglishUnits);
    const _mockGrains: Grains[] = mockGrains();
    component.ingredientLibrary = _mockGrains;
    component.ingredientType = 'grains';

    fixture.detectChanges();

    const grainForm: HTMLElement = fixture.nativeElement.querySelector('app-grain-form');
    expect(grainForm).toBeTruthy();
    const hopsForm: HTMLElement = fixture.nativeElement.querySelector('app-hops-form');
    expect(hopsForm).toBeNull();
    const yeastForm: HTMLElement = fixture.nativeElement.querySelector('app-yeast-form');
    expect(yeastForm).toBeNull();
    const otherForm: HTMLElement = fixture.nativeElement.querySelector('app-other-ingredients-form');
    expect(otherForm).toBeNull();
  });

  test('should render the template with the hops from', (): void => {
    component.ngOnInit = originalOnInit;
    const _mockHopsSchedule: HopsSchedule = mockHopsSchedule()[0];
    component.update = _mockHopsSchedule;
    const _mockEnglishUnits: SelectedUnits = mockEnglishUnits();
    component.preferenceService.getSelectedUnits = jest.fn()
      .mockReturnValue(_mockEnglishUnits);
    const _mockHops: Hops[] = mockHops();
    component.ingredientLibrary = _mockHops;
    component.ingredientType = 'hops';

    fixture.detectChanges();

    const grainForm: HTMLElement = fixture.nativeElement.querySelector('app-grain-form');
    expect(grainForm).toBeNull();
    const hopsForm: HTMLElement = fixture.nativeElement.querySelector('app-hops-form');
    expect(hopsForm).toBeTruthy();
    const yeastForm: HTMLElement = fixture.nativeElement.querySelector('app-yeast-form');
    expect(yeastForm).toBeNull();
    const otherForm: HTMLElement = fixture.nativeElement.querySelector('app-other-ingredients-form');
    expect(otherForm).toBeNull();
  });

  test('should render the template with the yeast from', (): void => {
    component.ngOnInit = originalOnInit;
    const _mockYeastBatch: YeastBatch = mockYeastBatch()[0];
    component.update = _mockYeastBatch;
    const _mockEnglishUnits: SelectedUnits = mockEnglishUnits();
    component.preferenceService.getSelectedUnits = jest.fn()
      .mockReturnValue(_mockEnglishUnits);
    const _mockYeast: Yeast[] = mockYeast();
    component.ingredientLibrary = _mockYeast;
    component.ingredientType = 'yeast';

    fixture.detectChanges();

    const grainForm: HTMLElement = fixture.nativeElement.querySelector('app-grain-form');
    expect(grainForm).toBeNull();
    const hopsForm: HTMLElement = fixture.nativeElement.querySelector('app-hops-form');
    expect(hopsForm).toBeNull();
    const yeastForm: HTMLElement = fixture.nativeElement.querySelector('app-yeast-form');
    expect(yeastForm).toBeTruthy();
    const otherForm: HTMLElement = fixture.nativeElement.querySelector('app-other-ingredients-form');
    expect(otherForm).toBeNull();
  });

  test('should render the template with the other ingredients from', (): void => {
    component.ngOnInit = originalOnInit;
    const _mockOtherIngredients: OtherIngredients = mockOtherIngredients()[0];
    component.update = _mockOtherIngredients;
    const _mockEnglishUnits: SelectedUnits = mockEnglishUnits();
    component.preferenceService.getSelectedUnits = jest.fn()
      .mockReturnValue(_mockEnglishUnits);
    component.ingredientType = 'otherIngredients';

    fixture.detectChanges();

    const grainForm: HTMLElement = fixture.nativeElement.querySelector('app-grain-form');
    expect(grainForm).toBeNull();
    const hopsForm: HTMLElement = fixture.nativeElement.querySelector('app-hops-form');
    expect(hopsForm).toBeNull();
    const yeastForm: HTMLElement = fixture.nativeElement.querySelector('app-yeast-form');
    expect(yeastForm).toBeNull();
    const otherForm: HTMLElement = fixture.nativeElement.querySelector('app-other-ingredients-form');
    expect(otherForm).toBeTruthy();
  });

});
