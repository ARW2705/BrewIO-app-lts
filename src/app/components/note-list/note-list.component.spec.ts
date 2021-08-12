/* Module imports */
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { of, throwError } from 'rxjs';

/* Test configuration imports */
import { configureTestBed } from '../../../../test-config/configure-test-bed';

/* Mock imports */
import { mockRecipeMasterInactive, mockRecipeVariantIncomplete } from '../../../../test-config/mock-models';
import { ErrorReportingServiceStub, RecipeServiceStub, ToastServiceStub } from '../../../../test-config/service-stubs';
import { ModalControllerStub, ModalStub } from '../../../../test-config/ionic-stubs';

/* Interface imports */
import { RecipeMaster, RecipeVariant } from '../../shared/interfaces';

/* Page imports */
import { NoteFormPage } from '../../pages/forms/note-form/note-form.page';

/* Service imports */
import { ErrorReportingService, RecipeService, ToastService } from '../../services/services';

/* Component imports */
import { NoteListComponent } from './note-list.component';


describe('NoteListComponent', (): void => {
  let fixture: ComponentFixture<NoteListComponent>;
  let noteCmp: NoteListComponent;
  let originalOnInit: any;
  let originalOnDestroy: any;
  configureTestBed();

  beforeAll((done: any): Promise<void> => (async (): Promise<void> => {
    TestBed.configureTestingModule({
      declarations: [ NoteListComponent ],
      providers: [
        { provide: ErrorReportingService, useClass: ErrorReportingServiceStub },
        { provide: ModalController, useClass: ModalControllerStub },
        { provide: RecipeService, useClass: RecipeServiceStub },
        { provide: ToastService, useClass: ToastServiceStub }
      ],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
    });
    await TestBed.compileComponents();
  })()
  .then(done)
  .catch(done.fail));

  beforeEach((): void => {
    fixture = TestBed.createComponent(NoteListComponent);
    noteCmp = fixture.componentInstance;
    originalOnInit = noteCmp.ngOnInit;
    originalOnDestroy = noteCmp.ngOnDestroy;
    noteCmp.ngOnInit = jest.fn();
    noteCmp.ngOnDestroy = jest.fn();
  });

  test('should create the component', (): void => {
    fixture.detectChanges();

    expect(noteCmp).toBeDefined();
  });

  test('should log component init and destroy', (): void => {
    noteCmp.ngOnInit = originalOnInit;
    noteCmp.ngOnDestroy = originalOnDestroy;
    const consoleSpy: jest.SpyInstance = jest.spyOn(console, 'log');

    fixture.detectChanges();

    noteCmp.ngOnDestroy();
    expect(consoleSpy.mock.calls[consoleSpy.mock.calls.length - 2][0]).toMatch('note list component init');
    expect(consoleSpy.mock.calls[consoleSpy.mock.calls.length - 1][0]).toMatch('note list component destroy');
  });

  test('should get the modal dismiss function', (): void => {
    const _mockDismissFn: (index?: number) => (data: object) => void = (index?: number) => {
      return (data: object) => {}
    };
    noteCmp.onNoteModalDismiss = jest.fn()
      .mockReturnValue((data: object) => {});

    fixture.detectChanges();

    const defaultDismiss: (data: object) => void = noteCmp.getModalDismissFn();
    expect(defaultDismiss).toBe(noteCmp.onNoteModalDismiss());
    noteCmp.dismissFn = _mockDismissFn;
    const customDismiss: (data: object) => void = noteCmp.getModalDismissFn();
    expect(customDismiss).not.toBe(noteCmp.onNoteModalDismiss());
  });

  test('should get modal options', (): void => {
    noteCmp.notes = [ '1', '2', '3' ];

    fixture.detectChanges();

    expect(noteCmp.getModalOptions()).toStrictEqual({
      noteType: 'master',
      formMethod: 'create',
      toUpdate: ''
    });
    noteCmp.recipeVariantId = 'variantid';
    expect(noteCmp.getModalOptions(1)).toStrictEqual({
      noteType: 'variant',
      formMethod: 'update',
      toUpdate: '2'
    });
  });

  test('should handle not modal dismiss', (): void => {
    noteCmp.notes = [ 'a', 'b', 'c' ];
    noteCmp.submitUpdatedNotes = jest.fn();

    fixture.detectChanges();

    const createNote: (data: object) => void = noteCmp.onNoteModalDismiss();
    const updateNote: (data: object) => void = noteCmp.onNoteModalDismiss(1);
    const deleteNote: (data: object) => void = noteCmp.onNoteModalDismiss(1);
    createNote({ data: { method: 'create', note: 'd' } });
    expect(noteCmp.notes.length).toEqual(4);
    expect(noteCmp.notes[3]).toMatch('d');
    updateNote({ data: { method: 'update', note: 'e' } });
    expect(noteCmp.notes.length).toEqual(4);
    expect(noteCmp.notes[1]).toMatch('e');
    deleteNote({ data: { method: 'delete' } });
    expect(noteCmp.notes.length).toEqual(3);
    expect(noteCmp.notes[1]).toMatch('c');
  });

  test('should open a note modal with default dismiss', (done: jest.DoneCallback): void => {
    const _stubModal: ModalStub = new ModalStub();
    const _mockNoteDismissFn: (index?: number) => (data: object) => void = (index?: number) => (data: object) => {};
    noteCmp.notes = [ 'a', 'b', 'c' ];
    noteCmp.getModalOptions = jest.fn()
      .mockReturnValue({
        noteType: 'master',
        formMethod: 'update',
        toUpdate: 'b'
      });
    noteCmp.modalCtrl.create = jest.fn()
      .mockReturnValue(Promise.resolve(_stubModal));
    noteCmp.getModalDismissFn = jest.fn()
      .mockReturnValue(_mockNoteDismissFn);
    _stubModal.onDidDismiss = jest.fn()
      .mockReturnValue(Promise.resolve());
    const createSpy: jest.SpyInstance = jest.spyOn(noteCmp.modalCtrl, 'create');
    const dismissSpy: jest.SpyInstance = jest.spyOn(noteCmp, 'getModalDismissFn');

    fixture.detectChanges();

    noteCmp.openNoteModal(1);
    _stubModal.onDidDismiss();
    setTimeout((): void => {
      expect(createSpy).toHaveBeenCalledWith({
        component: NoteFormPage,
        componentProps: {
          noteType: 'master',
          formMethod: 'update',
          toUpdate: 'b'
        }
      });
      expect(dismissSpy).toHaveBeenCalledWith(1);
      done();
    }, 10);
  });

  test('should patch recipe master notes', (done: jest.DoneCallback): void => {
    const _mockRecipeMasterInactive: RecipeMaster = mockRecipeMasterInactive();
    const notes: string[] = [ 'a', 'b', 'c' ];
    noteCmp.recipeService.updateRecipeMasterById = jest.fn()
      .mockReturnValue(of(_mockRecipeMasterInactive));
    noteCmp.notes = notes;
    noteCmp.recipeMasterId = _mockRecipeMasterInactive.cid;
    const masterSpy: jest.SpyInstance = jest.spyOn(noteCmp.recipeService, 'updateRecipeMasterById');

    fixture.detectChanges();

    noteCmp.patchRecipeNotes();
    setTimeout((): void => {
      expect(masterSpy).toHaveBeenCalledWith(_mockRecipeMasterInactive.cid, { notes: notes });
      done();
    }, 10);
  });

  test('should patch recipe variant notes', (done: jest.DoneCallback): void => {
    const _mockRecipeMasterInactive: RecipeMaster = mockRecipeMasterInactive();
    const _mockRecipeVariantIncomplete: RecipeVariant = mockRecipeVariantIncomplete();
    const notes: string[] = [ 'a', 'b', 'c' ];
    noteCmp.recipeService.updateRecipeVariantById = jest.fn()
      .mockReturnValue(of(_mockRecipeVariantIncomplete));
    noteCmp.notes = notes;
    noteCmp.recipeVariantId = _mockRecipeVariantIncomplete.cid;
    noteCmp.recipeMasterId = _mockRecipeMasterInactive.cid;
    const variantSpy: jest.SpyInstance = jest.spyOn(noteCmp.recipeService, 'updateRecipeVariantById');

    fixture.detectChanges();

    noteCmp.patchRecipeNotes();
    setTimeout((): void => {
      expect(variantSpy).toHaveBeenCalledWith(
        _mockRecipeMasterInactive.cid,
        _mockRecipeVariantIncomplete.cid,
        { notes: notes }
      );
      done();
    }, 10);
  });

  test('should submit notes', (done: jest.DoneCallback): void => {
    noteCmp.toastService.presentToast = jest.fn();
    noteCmp.patchRecipeNotes = jest.fn()
      .mockReturnValue(of({}));
    const toastSpy: jest.SpyInstance = jest.spyOn(noteCmp.toastService, 'presentToast');

    fixture.detectChanges();

    noteCmp.submitUpdatedNotes();
    setTimeout((): void => {
      expect(toastSpy).toHaveBeenCalledWith('Updated notes', 1500, 'bottom');
      done();
    }, 10);
  });

  test('should get an error submitting notes', (done: jest.DoneCallback): void => {
    const _mockError: Error = new Error('test-error');
    noteCmp.toastService.presentToast = jest.fn();
    noteCmp.patchRecipeNotes = jest.fn()
      .mockReturnValue(throwError(_mockError));
    noteCmp.errorReporter.handleUnhandledError = jest.fn();
    const errorSpy: jest.SpyInstance = jest.spyOn(noteCmp.errorReporter, 'handleUnhandledError');

    fixture.detectChanges();

    noteCmp.submitUpdatedNotes();
    setTimeout((): void => {
      expect(errorSpy).toHaveBeenCalledWith(_mockError);
      done();
    }, 10);
  });

  test('should display a list of notes', (): void => {
    const notes: string[] = [ 'test1', 'test2', 'test3' ];
    noteCmp.notes = notes;

    fixture.detectChanges();

    const noteButtons: NodeList = fixture.nativeElement.querySelectorAll('button');
    expect(noteButtons.length).toEqual(3);
    const firstButton: Element = noteButtons.item(0).parentNode.children[0];
    expect(Array.from(firstButton.classList).includes('border-bottom-medium')).toBe(true);
    expect(firstButton.children[0].children[1].children[0].textContent).toMatch('test1');
    const lastButton: Element = noteButtons.item(2).parentNode.children[0];
    expect(Array.from(lastButton.classList).includes('border-bottom-medium')).toBe(false);
    expect(lastButton.children[0].children[1].children[0].textContent).toMatch('test3');
  });

});
