/* Module imports */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { IonicModule, ModalController } from '@ionic/angular';
import { FormsModule, FormControl, ReactiveFormsModule } from '@angular/forms';

/* Test configuration imports */
import { configureTestBed } from '../../../../../test-config/configure-test-bed';

/* Mock imports */
import { HeaderComponentStub } from '../../../../../test-config/component-stubs';
import { ModalControllerStub } from '../../../../../test-config/ionic-stubs';
import { UtilityServiceStub } from '../../../../../test-config/service-stubs';

/* Service imports */
import { UtilityService } from '../../../services/services';

/* Page imports */
import { NoteFormPage } from './note-form.page';


describe('NoteFormPage', (): void => {
  configureTestBed();
  let fixture: ComponentFixture<NoteFormPage>;
  let page: NoteFormPage;
  let originalOnInit: any;

  beforeAll((done: any): Promise<void> => (async (): Promise<void> => {
    TestBed.configureTestingModule({
      declarations: [
        NoteFormPage,
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
    fixture = TestBed.createComponent(NoteFormPage);
    page = fixture.componentInstance;
    originalOnInit = page.ngOnInit;
    page.ngOnInit = jest.fn();
    page.modalCtrl.dismiss = jest.fn();
  });

  test('should create the component', (): void => {
    fixture.detectChanges();

    expect(page).toBeDefined();
  });

  test('should init the component', (): void => {
    page.ngOnInit = originalOnInit;
    page.noteType = 'master';
    page.toUpdate = 'test note';
    page.utilService.toTitleCase = jest.fn()
      .mockReturnValue('Master Note');

    fixture.detectChanges();

    expect(page.title).toMatch('Master Note');
    expect(page.note.value).toMatch('test note');
  });

  test('should dismiss modal with no data', (): void => {
    page.modalCtrl.dismiss = jest.fn();
    const dismissSpy: jest.SpyInstance = jest.spyOn(page.modalCtrl, 'dismiss');

    fixture.detectChanges();

    page.dismiss();
    expect(dismissSpy).toHaveBeenCalled();
  });

  test('should handle note deletion modal dismiss', (): void => {
    page.modalCtrl.dismiss = jest.fn();
    const dismissSpy: jest.SpyInstance = jest.spyOn(page.modalCtrl, 'dismiss');

    fixture.detectChanges();

    page.onDelete();
    expect(dismissSpy).toHaveBeenCalledWith({ method: 'delete' });
  });

  test('should handle note submission', (): void => {
    page.note = new FormControl('test note');
    page.formMethod = 'create';
    page.modalCtrl.dismiss = jest.fn();
    const dismissSpy: jest.SpyInstance = jest.spyOn(page.modalCtrl, 'dismiss');

    fixture.detectChanges();

    page.onSubmit();
    expect(dismissSpy).toHaveBeenCalledWith({
      method: 'create',
      note: 'test note'
    });
  });

  test('should render template with note form', (): void => {
    page.note = new FormControl('test note');
    page.formMethod = 'update';

    fixture.detectChanges();

    const textarea: HTMLElement = fixture.nativeElement.querySelector('app-form-text-area');
    expect(textarea.getAttribute('controlName')).toMatch('note');
    const formButtons: HTMLElement = fixture.nativeElement.querySelector('app-form-buttons');
    expect(formButtons).toBeTruthy();
    const deleteButton: HTMLElement = fixture.nativeElement.querySelector('app-delete-button');
    expect(deleteButton).toBeTruthy();
  });

  test('should render template with delete button removed', (): void => {
    page.note = new FormControl('');
    page.formMethod = 'create';

    fixture.detectChanges();

    const textarea: HTMLElement = fixture.nativeElement.querySelector('app-form-text-area');
    expect(textarea.getAttribute('controlName')).toMatch('note');
    const formButtons: HTMLElement = fixture.nativeElement.querySelector('app-form-buttons');
    expect(formButtons).toBeTruthy();
    const deleteButton: HTMLElement = fixture.nativeElement.querySelector('app-delete-button');
    expect(deleteButton).toBeNull();
  });

});
