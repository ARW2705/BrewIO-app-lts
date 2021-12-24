/* Module imports */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { IonicModule, ModalController } from '@ionic/angular';
import { FormsModule, FormControl, ReactiveFormsModule } from '@angular/forms';

/* Test configuration imports */
import { configureTestBed } from '@test/configure-test-bed';

/* Mock imports */
import { HeaderComponentStub } from '@test/component-stubs';
import { ModalControllerStub } from '@test/ionic-stubs';
import { UtilityServiceStub } from '@test/service-stubs';

/* Service imports */
import { UtilityService } from '@services/public';

/* Page imports */
import { NoteFormComponent } from './note-form.component';


describe('NoteFormComponent', (): void => {
  configureTestBed();
  let fixture: ComponentFixture<NoteFormComponent>;
  let component: NoteFormComponent;
  let originalOnInit: any;

  beforeAll((done: any): Promise<void> => (async (): Promise<void> => {
    TestBed.configureTestingModule({
      declarations: [
        NoteFormComponent,
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
    fixture = TestBed.createComponent(NoteFormComponent);
    component = fixture.componentInstance;
    originalOnInit = component.ngOnInit;
    component.ngOnInit = jest.fn();
    component.modalCtrl.dismiss = jest.fn();
  });

  test('should create the component', (): void => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  test('should init the component', (): void => {
    component.ngOnInit = originalOnInit;
    component.noteType = 'master';
    component.toUpdate = 'test note';
    component.utilService.toTitleCase = jest.fn()
      .mockReturnValue('Master Note');

    fixture.detectChanges();

    expect(component.title).toMatch('Master Note');
    expect(component.note.value).toMatch('test note');
  });

  test('should dismiss modal with no data', (): void => {
    const dismissSpy: jest.SpyInstance = jest.spyOn(component.modalCtrl, 'dismiss');

    fixture.detectChanges();

    component.dismiss();
    expect(dismissSpy).toHaveBeenCalled();
  });

  test('should handle note deletion modal dismiss', (): void => {
    const dismissSpy: jest.SpyInstance = jest.spyOn(component.modalCtrl, 'dismiss');

    fixture.detectChanges();

    component.onDelete();
    expect(dismissSpy).toHaveBeenCalledWith({ method: 'delete' });
  });

  test('should handle note submission', (): void => {
    component.note = new FormControl('test note');
    component.formMethod = 'create';
    component.modalCtrl.dismiss = jest.fn();
    const dismissSpy: jest.SpyInstance = jest.spyOn(component.modalCtrl, 'dismiss');

    fixture.detectChanges();

    component.onSubmit();
    expect(dismissSpy).toHaveBeenCalledWith({
      method: 'create',
      note: 'test note'
    });
  });

  test('should render template with note form', (): void => {
    component.note = new FormControl('test note');
    component.formMethod = 'update';

    fixture.detectChanges();

    const textarea: HTMLElement = fixture.nativeElement.querySelector('app-form-text-area');
    expect(textarea.getAttribute('controlName')).toMatch('note');
    const formButtons: HTMLElement = fixture.nativeElement.querySelector('app-form-buttons');
    expect(formButtons).toBeTruthy();
    const deleteButton: HTMLElement = fixture.nativeElement.querySelector('app-delete-button');
    expect(deleteButton).toBeTruthy();
  });

  test('should render template with delete button removed', (): void => {
    component.note = new FormControl('');
    component.formMethod = 'create';

    fixture.detectChanges();

    const textarea: HTMLElement = fixture.nativeElement.querySelector('app-form-text-area');
    expect(textarea.getAttribute('controlName')).toMatch('note');
    const formButtons: HTMLElement = fixture.nativeElement.querySelector('app-form-buttons');
    expect(formButtons).toBeTruthy();
    const deleteButton: HTMLElement = fixture.nativeElement.querySelector('app-delete-button');
    expect(deleteButton).toBeNull();
  });

});
