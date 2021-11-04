/* Module imports */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { IonicModule, ModalController } from '@ionic/angular';
import { AbstractControl, FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';

/* Test configuration imports */
import { configureTestBed } from '../../../../../../test-config/configure-test-bed';

/* Mock imports */
import { mockProcessSchedule } from '../../../../../../test-config/mock-models';
import { HeaderComponentStub } from '../../../../../../test-config/component-stubs';
import { ModalControllerStub } from '../../../../../../test-config/ionic-stubs';
import { UtilityServiceStub } from '../../../../../../test-config/service-stubs';

/* Interface imports */
import { CalendarProcess, ManualProcess, Process, TimerProcess } from '../../../../shared/interfaces';

/* Service imports */
import { UtilityService } from '../../../../services/services';

/* Component imports */
import { ProcessFormComponent } from './process-form.component';


describe('ProcessFormComponent', (): void => {
  let fixture: ComponentFixture<ProcessFormComponent>;
  let processFormComponent: ProcessFormComponent;
  let originalOnInit: any;
  const formBuilder: FormBuilder = new FormBuilder();
  const initDefaultForm: () => FormGroup = (): FormGroup => {
    return formBuilder.group({
      type: '',
      name: '',
      description: ''
    });
  };
  configureTestBed();

  beforeAll((done: any): Promise<void> => (async (): Promise<void> => {
    TestBed.configureTestingModule({
      declarations: [
        ProcessFormComponent,
        HeaderComponentStub
      ],
      imports: [
        IonicModule,
        FormsModule,
        ReactiveFormsModule
      ],
      providers: [
        { provide: ModalController, useClass: ModalControllerStub },
        { provide: UtilityService, useClass: UtilityServiceStub }
      ],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
    });
    await TestBed.compileComponents();
  })()
  .then(done)
  .catch(done.fail));

  beforeEach((): void => {
    fixture = TestBed.createComponent(ProcessFormComponent);
    processFormComponent = fixture.componentInstance;
    originalOnInit = processFormComponent.ngOnInit;
    processFormComponent.ngOnInit = jest.fn();
    processFormComponent.modalCtrl.dismiss = jest.fn();
  });

  test('should create the component', (): void => {
    fixture.detectChanges();

    expect(processFormComponent).toBeDefined();
  });

});
