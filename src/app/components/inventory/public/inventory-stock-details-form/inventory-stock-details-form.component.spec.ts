/* Module imports */
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

/* Test configuration imports */
import { configureTestBed } from '../../../../../../test-config/configure-test-bed';

/* Mock imports */
import { ErrorReportingServiceStub, ModalServiceStub, UtilityServiceStub } from '../../../../../../test-config/service-stubs';

/* Component imports */
import { InventoryStockDetailsFormComponent } from './inventory-stock-details-form.component';

/* Service imports */
import { ErrorReportingService, ModalService, UtilityService } from '../../../../services/services';


describe('InventoryStockDetailsFormComponent', (): void => {
  configureTestBed();
  let fixture: ComponentFixture<InventoryStockDetailsFormComponent>;
  let component: InventoryStockDetailsFormComponent;
  let originalOnInit: () => void;

  beforeAll((done: any): Promise<void> => (async (): Promise<void> => {
    TestBed.configureTestingModule({
      declarations: [ InventoryStockDetailsFormComponent ],
      imports: [ ReactiveFormsModule ],
      providers: [
        { provide: ErrorReportingService, useClass: ErrorReportingServiceStub },
        { provide: ModalService, useClass: ModalServiceStub },
        { provide: UtilityService, useClass: UtilityServiceStub }
      ],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
    });
    await TestBed.compileComponents();
  })()
  .then(done)
  .catch(done.fail));

  beforeEach((): void => {
    fixture = TestBed.createComponent(InventoryStockDetailsFormComponent);
    component = fixture.componentInstance;
    originalOnInit = component.ngOnInit;
    component.ngOnInit = jest.fn();
  });

  test('should create the component', (): void => {
    fixture.detectChanges();

    expect(component).toBeTruthy();
  });

});
