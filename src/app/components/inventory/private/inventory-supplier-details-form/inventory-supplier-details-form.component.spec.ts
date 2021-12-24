/* Module imports */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

/* Test configuration imports */
import { configureTestBed } from '@test/configure-test-bed';

/* Mock imports */
import { mockImage } from '@test/mock-models';

/* Interface imports */
import { Image } from '@shared/interfaces';

/* Component imports */
import { InventorySupplierDetailsFormComponent } from './inventory-supplier-details-form.component';


describe('InventorySupplierDetailsFormComponent', (): void => {
  configureTestBed();
  let fixture: ComponentFixture<InventorySupplierDetailsFormComponent>;
  let component: InventorySupplierDetailsFormComponent;
  let originalOnInit: () => void;

  beforeAll((done: any): Promise<void> => (async (): Promise<void> => {
    TestBed.configureTestingModule({
      declarations: [ InventorySupplierDetailsFormComponent ],
      imports: [ ReactiveFormsModule ],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
    });
    await TestBed.compileComponents();
  })()
  .then(done)
  .catch(done.fail));

  beforeEach((): void => {
    fixture = TestBed.createComponent(InventorySupplierDetailsFormComponent);
    component = fixture.componentInstance;
    originalOnInit = component.ngOnInit;
    component.ngOnInit = jest.fn();
    component.utilService.compareWith = jest.fn();
  });

  test('should create the component', (): void => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  test('should init the component', (): void => {
    component.ngOnInit = originalOnInit;
    component.selectedSource = 'self';
    component.controls = { sourceType: new FormControl(null) };
    expect(component.controls.sourceType.value).toBeNull();

    fixture.detectChanges();

    expect(component.controls.sourceType.value).toMatch('self');
  });

  test('should handle image selection', (): void => {
    component.imageSelectionEvent.emit = jest.fn();
    const emitSpy: jest.SpyInstance = jest.spyOn(component.imageSelectionEvent, 'emit');
    const _mockImage: Image = mockImage();

    fixture.detectChanges();

    component.onImageSelection(_mockImage);
    expect(emitSpy).toHaveBeenCalledWith({
      imageType: 'supplierLabelImage',
      image: _mockImage
    });
  });

  test('should render the template', (): void => {
    component.ngOnInit = originalOnInit;
    const _mockImage: Image = mockImage();
    component.image = _mockImage;
    component.selectedSource = 'self';
    component.controls = { sourceType: new FormControl(null) };

    fixture.detectChanges();

    const headerElem: HTMLElement = fixture.nativeElement.querySelector('header');
    expect(headerElem.textContent).toMatch('Supplier Details');
    const inputElems: NodeList = fixture.nativeElement.querySelectorAll('app-form-input');
    expect(inputElems.length).toEqual(2);
    const nameElem: HTMLElement = <HTMLElement>inputElems.item(0);
    expect(nameElem.getAttribute('controlName')).toMatch('supplierName');
    const urlElem: HTMLElement = <HTMLElement>inputElems.item(1);
    expect(urlElem.getAttribute('controlName')).toMatch('supplierURL');
    const imageElem: HTMLElement = fixture.nativeElement.querySelector('app-form-image');
    expect(imageElem['image']).toStrictEqual(_mockImage);
    const selectElem: HTMLElement = fixture.nativeElement.querySelector('app-form-select');
    expect(selectElem.getAttribute('controlName')).toMatch('sourceType');
    expect(selectElem['options'].length).toEqual(3);
  });

});
