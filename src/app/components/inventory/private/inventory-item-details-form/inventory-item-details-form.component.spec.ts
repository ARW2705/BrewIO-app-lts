/* Module imports */
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

/* Test configuration imports */
import { configureTestBed } from '@test/configure-test-bed';

/* Mock imports */
import { UtilityServiceStub } from '@test/service-stubs';
import { mockImage, mockStyles } from '@test/mock-models';

/* Interface imports */
import { Image, Style } from '@shared/interfaces';

/* Serivce imports */
import { UtilityService } from '@services/public';

/* Component imports */
import { InventoryItemDetailsFormComponent } from './inventory-item-details-form.component';


describe('InventoryItemDetailsFormComponent', (): void => {
  configureTestBed();
  let fixture: ComponentFixture<InventoryItemDetailsFormComponent>;
  let component: InventoryItemDetailsFormComponent;
  let originalOnInit: () => void;

  beforeAll((done: any): Promise<void> => (async (): Promise<void> => {
    TestBed.configureTestingModule({
      declarations: [ InventoryItemDetailsFormComponent ],
      imports: [ ReactiveFormsModule ],
      providers: [ { provide: UtilityService, useClass: UtilityServiceStub } ],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
    });
    await TestBed.compileComponents();
  })()
  .then(done)
  .catch(done.fail));

  beforeEach((): void => {
    fixture = TestBed.createComponent(InventoryItemDetailsFormComponent);
    component = fixture.componentInstance;
    originalOnInit = component.ngOnInit;
    component.ngOnInit = jest.fn();
  });

  test('should create the component', (): void => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  test('should init the component', (): void => {
    component.ngOnInit = originalOnInit;
    const _mockControl: FormControl = new FormControl();
    component.controls = { itemStyleId: _mockControl };
    const _mockStyle: Style = mockStyles()[0];
    component.selectedStyle = _mockStyle;

    fixture.detectChanges();

    component.ngOnInit();
    expect(component.controls.itemStyleId.value).toStrictEqual(_mockStyle);
  });

  test('should emit image selection event', (): void => {
    component.imageSelectionEvent.emit = jest.fn();
    const emitSpy: jest.SpyInstance = jest.spyOn(component.imageSelectionEvent, 'emit');

    fixture.detectChanges();

    const _mockImage: Image = mockImage();
    component.onImageSelection(_mockImage);
    expect(emitSpy).toHaveBeenCalledWith({ imageType: 'itemLabelImage', image: _mockImage });
  });

  test('should render the template', (): void => {
    const controls: { [key: string]: FormControl } = {
      itemName: new FormControl(),
      itemSubname: new FormControl(),
      description: new FormControl(),
      itemStyleId: new FormControl(),
      itemABV: new FormControl(),
      itemIBU: new FormControl(),
      itemSRM: new FormControl()
    };
    const _mockStyle: Style = mockStyles()[0];
    component.selectedStyle = _mockStyle;
    const _mockImage: Image = mockImage();
    component.image = _mockImage;
    component.controls = controls;
    component.ngOnInit = originalOnInit;

    fixture.detectChanges();

    const formInputs: NodeList = fixture.nativeElement.querySelectorAll('app-form-input');
    const nameInput: HTMLElement = <HTMLElement>formInputs.item(0);
    expect(nameInput.getAttribute('controlName')).toMatch('itemName');
    const subNameInput: HTMLElement = <HTMLElement>formInputs.item(1);
    expect(subNameInput.getAttribute('controlName')).toMatch('itemSubname');
    const abvInput: HTMLElement = <HTMLElement>formInputs.item(2);
    expect(abvInput.getAttribute('controlName')).toMatch('itemABV');
    const ibuInput: HTMLElement = <HTMLElement>formInputs.item(3);
    expect(ibuInput.getAttribute('controlName')).toMatch('itemIBU');
    const srmInput: HTMLElement = <HTMLElement>formInputs.item(4);
    expect(srmInput.getAttribute('controlName')).toMatch('itemSRM');

    const formImage: HTMLElement = fixture.nativeElement.querySelector('app-form-image');
    expect(formImage['image']).toStrictEqual(_mockImage);

    const formTextarea: HTMLElement = fixture.nativeElement.querySelector('app-form-text-area');
    expect(formTextarea.getAttribute('controlName')).toMatch('description');

    const formSelect: HTMLElement = fixture.nativeElement.querySelector('app-form-select');
    expect(formSelect.getAttribute('controlName')).toMatch('itemStyleId');
  });

});
