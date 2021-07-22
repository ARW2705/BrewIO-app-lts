/* Module imports */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { IonicModule, ModalController } from '@ionic/angular';
import { FormsModule, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';

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
  let fixture: ComponentFixture<NoteFormPage>;
  let noteFormPage: NoteFormPage;
  let originalOnInit: any;
  configureTestBed();

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
    noteFormPage = fixture.componentInstance;
    originalOnInit = noteFormPage.ngOnInit;
    noteFormPage.ngOnInit = jest
      .fn();
    noteFormPage.modalCtrl.dismiss = jest
      .fn();
  });

  test('should create the component', (): void => {
    fixture.detectChanges();

    expect(noteFormPage).toBeDefined();
  });

  test('should init the component', (): void => {
    noteFormPage.ngOnInit = originalOnInit;

    noteFormPage.noteType = 'master';
    noteFormPage.toUpdate = 'test note';

    noteFormPage.utilService.toTitleCase = jest
      .fn()
      .mockReturnValue('Master Note');

    fixture.detectChanges();

    expect(noteFormPage.title).toMatch('Master Note');
    expect(noteFormPage.note.value).toMatch('test note');
  });

  test('should dismiss modal with no data', (): void => {
    noteFormPage.modalCtrl.dismiss = jest
      .fn();

    const dismissSpy: jest.SpyInstance = jest.spyOn(noteFormPage.modalCtrl, 'dismiss');

    fixture.detectChanges();

    noteFormPage.dismiss();

    expect(dismissSpy).toHaveBeenCalled();
  });

  test('should handle note deletion modal dismiss', (): void => {
    noteFormPage.modalCtrl.dismiss = jest
      .fn();

    const dismissSpy: jest.SpyInstance = jest.spyOn(noteFormPage.modalCtrl, 'dismiss');

    fixture.detectChanges();

    noteFormPage.onDelete();

    expect(dismissSpy).toHaveBeenCalledWith({ method: 'delete' });
  });

  test('should handle note submission', (): void => {
    noteFormPage.note = new FormControl('test note');
    noteFormPage.formMethod = 'create';

    noteFormPage.modalCtrl.dismiss = jest
      .fn();

    const dismissSpy: jest.SpyInstance = jest.spyOn(noteFormPage.modalCtrl, 'dismiss');

    fixture.detectChanges();

    noteFormPage.onSubmit();

    expect(dismissSpy).toHaveBeenCalledWith({
      method: 'create',
      note: 'test note'
    });
  });

  test('should render template with note form', (): void => {
    noteFormPage.note = new FormControl('test note');
    noteFormPage.formMethod = 'update';

    fixture.detectChanges();

    const textarea: HTMLElement = fixture.nativeElement.querySelector('ion-textarea');
    expect(textarea['value']).toMatch('test note');

    const buttons: NodeList = fixture.nativeElement.querySelectorAll('ion-button');
    expect(buttons.item(0).textContent).toMatch('Cancel');
    expect(buttons.item(1).textContent).toMatch('Submit');
    expect(buttons.item(2).textContent).toMatch('Delete');
  });

  test('should render template with note form error', (): void => {
    noteFormPage.note = new FormControl(Array(501).fill('a').join(''), [Validators.maxLength(500)]);
    noteFormPage.formMethod = 'update';

    fixture.detectChanges();

    const formError: HTMLElement = fixture.nativeElement.querySelector('.form-error');
    expect(formError.textContent).toMatch('Please limit notes to 500 characters');
  });

});
