/* Module imports */
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { IonicModule, ModalController } from '@ionic/angular';
import { FormsModule, AbstractControl, FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';

/* Test configuration imports */
import { configureTestBed } from '../../../../../test-config/configure-test-bed';

/* Mock imports */
import { mockProcessSchedule } from '../../../../../test-config/mock-models';
import { HeaderComponentStub } from '../../../../../test-config/component-stubs';
import { ModalControllerStub } from '../../../../../test-config/ionic-stubs';

/* Interface imports */
import { CalendarProcess, ManualProcess, Process, TimerProcess } from '../../../shared/interfaces';

/* Page imports */
import { ProcessFormPage } from './process-form.page';


describe('ProcessFormPage', (): void => {
  let fixture: ComponentFixture<ProcessFormPage>;
  let processFormPage: ProcessFormPage;
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
        ProcessFormPage,
        HeaderComponentStub
      ],
      imports: [
        IonicModule,
        FormsModule,
        ReactiveFormsModule
      ],
      providers: [
        { provide: ModalController, useClass: ModalControllerStub },
      ],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
    });
    await TestBed.compileComponents();
  })()
  .then(done)
  .catch(done.fail));

  beforeEach((): void => {
    fixture = TestBed.createComponent(ProcessFormPage);
    processFormPage = fixture.componentInstance;
    originalOnInit = processFormPage.ngOnInit;
    processFormPage.ngOnInit = jest
      .fn();
    processFormPage.modalCtrl.dismiss = jest
      .fn();
  });

  test('should create the component', (): void => {
    fixture.detectChanges();

    expect(processFormPage).toBeDefined();
  });

  describe('Component Methods', (): void => {

    test('should init the component', (): void => {
      processFormPage.ngOnInit = originalOnInit;

      processFormPage.processType = 'manual';

      processFormPage.initForm = jest
        .fn();

      fixture.detectChanges();

      expect(processFormPage.title).toMatch('Manual');
    });

    test('should add manual type form controls', (): void => {
      processFormPage.processForm = initDefaultForm();
      processFormPage.processType = 'manual';

      processFormPage.addFormSpecificControls();

      expect(processFormPage.processForm.controls['expectedDuration']).toBeTruthy();
      expect(processFormPage.processForm.controls['concurrent']).toBeFalsy();
      expect(processFormPage.processForm.controls['splitInterval']).toBeFalsy();
      expect(processFormPage.processForm.controls['duration']).toBeFalsy();
    });

    test('should add timer type form controls', (): void => {
      processFormPage.processForm = initDefaultForm();
      processFormPage.processType = 'timer';

      processFormPage.addFormSpecificControls();

      expect(processFormPage.processForm.controls['expectedDuration']).toBeFalsy();
      expect(processFormPage.processForm.controls['concurrent']).toBeTruthy();
      expect(processFormPage.processForm.controls['splitInterval']).toBeTruthy();
      expect(processFormPage.processForm.controls['duration']).toBeTruthy();
    });

    test('should add calendar type form controls', (): void => {
      processFormPage.processForm = initDefaultForm();
      processFormPage.processType = 'calendar';

      processFormPage.addFormSpecificControls();

      expect(processFormPage.processForm.controls['expectedDuration']).toBeFalsy();
      expect(processFormPage.processForm.controls['concurrent']).toBeFalsy();
      expect(processFormPage.processForm.controls['splitInterval']).toBeFalsy();
      expect(processFormPage.processForm.controls['duration']).toBeTruthy();
    });

    test('should dismiss modal with deletion flag', (): void => {
      processFormPage.modalCtrl.dismiss = jest
        .fn();

      const dismissSpy: jest.SpyInstance = jest.spyOn(processFormPage.modalCtrl, 'dismiss');

      fixture.detectChanges();

      processFormPage.deleteStep();

      expect(dismissSpy).toHaveBeenCalledWith({ delete: true });
    });

    test('should dismiss modal with no data', (): void => {
      processFormPage.modalCtrl.dismiss = jest
        .fn();

      const dismissSpy: jest.SpyInstance = jest.spyOn(processFormPage.modalCtrl, 'dismiss');

      fixture.detectChanges();

      processFormPage.dismiss();

      expect(dismissSpy).toHaveBeenCalled();
    });

    test('should init the form', (): void => {
      processFormPage.processType = 'manual';

      processFormPage.addFormSpecificControls = jest
        .fn();

      processFormPage.mapUpdateToForm = jest
        .fn();

      const addSpy: jest.SpyInstance = jest.spyOn(processFormPage, 'addFormSpecificControls');
      const mapSpy: jest.SpyInstance = jest.spyOn(processFormPage, 'mapUpdateToForm');

      fixture.detectChanges();

      processFormPage.initForm();

      expect(processFormPage.processForm.value).toStrictEqual({
        type: 'manual',
        name: '',
        description: ''
      });
      expect(addSpy).toHaveBeenCalled();
      expect(mapSpy).toHaveBeenCalled();
    });

    test('should map manual type update to form', (): void => {
      const _mockManualProcess: ManualProcess = <ManualProcess>(mockProcessSchedule())[0];

      processFormPage.processForm = initDefaultForm();
      processFormPage.processForm.controls.type.setValue('manual');
      processFormPage.processForm.addControl('expectedDuration', new FormControl());

      processFormPage.update = _mockManualProcess;

      processFormPage.mapUpdateToForm();

      expect(processFormPage.processForm.value).toStrictEqual({
        name: _mockManualProcess.name,
        type: 'manual',
        description: _mockManualProcess.description,
        expectedDuration: _mockManualProcess.expectedDuration
      });
    });

    test('should map timer type update to form', (): void => {
      const _mockTimerProcess: TimerProcess = <TimerProcess>(mockProcessSchedule())[2];

      processFormPage.processForm = initDefaultForm();
      processFormPage.processForm.controls.type.setValue('timer');
      processFormPage.processForm.addControl('duration', new FormControl());
      processFormPage.processForm.addControl('splitInterval', new FormControl());
      processFormPage.processForm.addControl('concurrent', new FormControl());

      processFormPage.update = _mockTimerProcess;

      processFormPage.mapUpdateToForm();

      expect(processFormPage.processForm.value).toStrictEqual({
        name: _mockTimerProcess.name,
        type: 'timer',
        description: _mockTimerProcess.description,
        duration: _mockTimerProcess.duration,
        splitInterval: _mockTimerProcess.splitInterval,
        concurrent: _mockTimerProcess.concurrent
      });
    });

    test('should map calendar type update to form', (): void => {
      const _mockCalendarProcess: CalendarProcess = <CalendarProcess>(mockProcessSchedule())[13];

      processFormPage.processForm = initDefaultForm();
      processFormPage.processForm.controls.type.setValue('calendar');
      processFormPage.processForm.addControl('duration', new FormControl());

      processFormPage.update = _mockCalendarProcess;

      processFormPage.mapUpdateToForm();

      expect(processFormPage.processForm.value).toStrictEqual({
        name: _mockCalendarProcess.name,
        type: 'calendar',
        description: _mockCalendarProcess.description,
        duration: _mockCalendarProcess.duration,
      });
    });

    test('should submit the form', (): void => {
      processFormPage.formMode = 'create';

      processFormPage.processForm = initDefaultForm();

      const dismissSpy: jest.SpyInstance = jest.spyOn(processFormPage.modalCtrl, 'dismiss');

      processFormPage.onSubmit();

      expect(dismissSpy).toHaveBeenCalledWith({
        type: '',
        name: '',
        description: ''
      });

      processFormPage.formMode = 'update';

      processFormPage.onSubmit();

      expect(dismissSpy).toHaveBeenNthCalledWith(
        2,
        {
          update: {
            type: '',
            name: '',
            description: ''
          }
        }
      );
    });

  });


  describe('Render Template', (): void => {

    test('should render form controls', (): void => {
      processFormPage.ngOnInit = originalOnInit;
      processFormPage.processType = 'manual';
      processFormPage.formMode = 'update';

      const _mockManualProcess: ManualProcess = <ManualProcess>(mockProcessSchedule())[0];
      _mockManualProcess.expectedDuration = 30;
      processFormPage.update = _mockManualProcess;

      fixture.detectChanges();

      const ionButtons: NodeList = fixture.nativeElement.querySelectorAll('ion-button');

      expect(ionButtons.item(0).textContent).toMatch('Cancel');
      expect(ionButtons.item(1).textContent).toMatch('Submit');
      expect(ionButtons.item(2).textContent).toMatch('Delete');
    });

    test('should render manual form', (): void => {
      processFormPage.ngOnInit = originalOnInit;
      processFormPage.processType = 'manual';
      processFormPage.formMode = 'update';

      const _mockManualProcess: ManualProcess = <ManualProcess>(mockProcessSchedule())[0];
      _mockManualProcess.expectedDuration = 30;
      processFormPage.update = _mockManualProcess;

      fixture.detectChanges();

      const items: NodeList = fixture.nativeElement.querySelectorAll('ion-item');

      const nameElem: HTMLElement = <HTMLElement>items.item(0);
      expect(nameElem.children[0].textContent).toMatch('Name');
      expect(nameElem.children[1]['value']).toMatch(_mockManualProcess.name);

      const expectedDurationElem: HTMLElement = <HTMLElement>items.item(1);
      expect(expectedDurationElem.children[0].textContent).toMatch('Expected Duration (Minutes)');
      expect(expectedDurationElem.children[1]['value']).toEqual(_mockManualProcess.expectedDuration);

      const descriptionElem: HTMLElement = <HTMLElement>items.item(2);
      expect(descriptionElem.children[0].textContent).toMatch('Description');
      expect(descriptionElem.children[1]['value']).toMatch(_mockManualProcess.description);
    });

    test('should render manual form errors', (): void => {
      processFormPage.ngOnInit = originalOnInit;
      processFormPage.processType = 'manual';
      processFormPage.formMode = 'update';

      const _mockManualProcess: Process = <ManualProcess>(mockProcessSchedule())[0];
      _mockManualProcess.name = 'a';
      _mockManualProcess.description = Array(501).fill('a').join('');
      processFormPage.update = _mockManualProcess;

      fixture.detectChanges();

      const formControls: { [key: string]: AbstractControl } = processFormPage.processForm.controls;
      formControls.name.markAsTouched();
      formControls.description.markAsTouched();
      processFormPage.processForm.updateValueAndValidity();

      fixture.detectChanges();

      const formErrors: NodeList = fixture.nativeElement.querySelectorAll('form-error');
      expect(formErrors.length).toEqual(2);
      expect((<HTMLElement>formErrors.item(0)).getAttribute('controlName')).toMatch('name');
      expect((<HTMLElement>formErrors.item(1)).getAttribute('controlName')).toMatch('description');
    });

    test('should render timer form', (): void => {
      processFormPage.ngOnInit = originalOnInit;
      processFormPage.processType = 'timer';
      processFormPage.formMode = 'update';

      const _mockTimerProcess: TimerProcess = <TimerProcess>(mockProcessSchedule())[2];
      processFormPage.update = _mockTimerProcess;

      fixture.detectChanges();

      const items: NodeList = fixture.nativeElement.querySelectorAll('ion-item');

      const nameElem: HTMLElement = <HTMLElement>items.item(0);
      expect(nameElem.children[0].textContent).toMatch('Name');
      expect(nameElem.children[1]['value']).toMatch(_mockTimerProcess.name);

      const durationElem: HTMLElement = <HTMLElement>items.item(1);
      expect(durationElem.children[0].textContent).toMatch('Duration (Minutes)');
      expect(durationElem.children[1]['value']).toEqual(_mockTimerProcess.duration);

      const splitElem: HTMLElement = <HTMLElement>items.item(2);
      expect(splitElem.children[0].textContent).toMatch('Split Interval');
      expect(splitElem.children[1]['value']).toEqual(_mockTimerProcess.splitInterval);

      const concurrentElem: HTMLElement = <HTMLElement>items.item(3);
      expect(concurrentElem.children[0].textContent).toMatch('Concurrent');
      expect(concurrentElem.children[1]['checked']).toBe(_mockTimerProcess.concurrent);

      const descriptionElem: HTMLElement = <HTMLElement>items.item(4);
      expect(descriptionElem.children[0].textContent).toMatch('Description');
      expect(descriptionElem.children[1]['value']).toMatch(_mockTimerProcess.description);
    });

    test('should render timer form errors', (): void => {
      processFormPage.ngOnInit = originalOnInit;
      processFormPage.processType = 'timer';
      processFormPage.formMode = 'update';

      const _mockTimerProcess: TimerProcess = <TimerProcess>(mockProcessSchedule())[2];
      _mockTimerProcess.name = 'a';
      _mockTimerProcess.description = Array(501).fill('a').join('');
      _mockTimerProcess.duration = -1;
      _mockTimerProcess.splitInterval = -1;
      processFormPage.update = _mockTimerProcess;

      fixture.detectChanges();

      const formControls: { [key: string]: AbstractControl } = processFormPage.processForm.controls;
      formControls.name.markAsTouched();
      formControls.description.markAsTouched();
      formControls.duration.markAsTouched();
      formControls.splitInterval.markAsTouched();
      processFormPage.processForm.updateValueAndValidity();

      fixture.detectChanges();

      const formErrors: NodeList = fixture.nativeElement.querySelectorAll('form-error');
      expect(formErrors.length).toEqual(4);
      expect((<HTMLElement>formErrors.item(0)).getAttribute('controlName')).toMatch('name');
      expect((<HTMLElement>formErrors.item(1)).getAttribute('controlName')).toMatch('duration');
      expect((<HTMLElement>formErrors.item(2)).getAttribute('controlName')).toMatch('splitInterval');
      expect((<HTMLElement>formErrors.item(3)).getAttribute('controlName')).toMatch('description');
    });

    test('should render calendar form', (): void => {
      processFormPage.ngOnInit = originalOnInit;
      processFormPage.processType = 'calendar';
      processFormPage.formMode = 'update';

      const _mockCalendarProcess: CalendarProcess = <CalendarProcess>(mockProcessSchedule())[13];
      _mockCalendarProcess.duration = 30;
      processFormPage.update = _mockCalendarProcess;

      fixture.detectChanges();

      const items: NodeList = fixture.nativeElement.querySelectorAll('ion-item');

      const nameElem: HTMLElement = <HTMLElement>items.item(0);
      expect(nameElem.children[0].textContent).toMatch('Name');
      expect(nameElem.children[1]['value']).toMatch(_mockCalendarProcess.name);

      const durationElem: HTMLElement = <HTMLElement>items.item(1);
      expect(durationElem.children[0].textContent).toMatch('Duration (Days)');
      expect(durationElem.children[1]['value']).toEqual(_mockCalendarProcess.duration);

      const descriptionElem: HTMLElement = <HTMLElement>items.item(2);
      expect(descriptionElem.children[0].textContent).toMatch('Description');
      expect(descriptionElem.children[1]['value']).toMatch(_mockCalendarProcess.description);
    });

    test('should render calendar form errors', (): void => {
      processFormPage.ngOnInit = originalOnInit;
      processFormPage.processType = 'calendar';
      processFormPage.formMode = 'update';

      const _mockCalendarProcess: CalendarProcess = <CalendarProcess>(mockProcessSchedule())[13];
      _mockCalendarProcess.name = 'a';
      _mockCalendarProcess.description = Array(501).fill('a').join('');
      _mockCalendarProcess.duration = -1;
      processFormPage.update = _mockCalendarProcess;

      fixture.detectChanges();

      const formControls: { [key: string]: AbstractControl } = processFormPage.processForm.controls;
      formControls.name.markAsTouched();
      formControls.description.markAsTouched();
      formControls.duration.markAsTouched();
      processFormPage.processForm.updateValueAndValidity();

      fixture.detectChanges();

      const formErrors: NodeList = fixture.nativeElement.querySelectorAll('form-error');
      expect(formErrors.length).toEqual(3);
      expect((<HTMLElement>formErrors.item(0)).getAttribute('controlName')).toMatch('name');
      expect((<HTMLElement>formErrors.item(1)).getAttribute('controlName')).toMatch('duration');
      expect((<HTMLElement>formErrors.item(2)).getAttribute('controlName')).toMatch('description');
    });

  });

});
