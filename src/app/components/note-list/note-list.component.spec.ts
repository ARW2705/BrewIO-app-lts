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
  let component: NoteListComponent;
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
    component = fixture.componentInstance;
    originalOnInit = component.ngOnInit;
    originalOnDestroy = component.ngOnDestroy;
    component.ngOnInit = jest.fn();
    component.ngOnDestroy = jest.fn();
  });

  test('should create the component', (): void => {
    fixture.detectChanges();

    expect(component).toBeDefined();
  });

  test('should log component init and destroy', (): void => {
    component.ngOnInit = originalOnInit;
    component.ngOnDestroy = originalOnDestroy;
    const consoleSpy: jest.SpyInstance = jest.spyOn(console, 'log');

    fixture.detectChanges();

    component.ngOnDestroy();
    expect(consoleSpy.mock.calls[consoleSpy.mock.calls.length - 2][0]).toMatch('note list component init');
    expect(consoleSpy.mock.calls[consoleSpy.mock.calls.length - 1][0]).toMatch('note list component destroy');
  });

  test('should get modal options', (): void => {
    component.notes = [ '1', '2', '3' ];

    fixture.detectChanges();

    expect(component.getModalOptions()).toStrictEqual({
      noteType: 'master',
      formMethod: 'create',
      toUpdate: ''
    });
    component.recipeVariantId = 'variantid';
    expect(component.getModalOptions(1)).toStrictEqual({
      noteType: 'variant',
      formMethod: 'update',
      toUpdate: '2'
    });
  });

  test('should handle not modal dismiss', (): void => {
    component.notes = [ 'a', 'b', 'c' ];
    component.submitUpdatedNotes = jest.fn();

    fixture.detectChanges();

    const createNote: (data: object) => void = component.onNoteModalDismiss();
    const updateNote: (data: object) => void = component.onNoteModalDismiss(1);
    const deleteNote: (data: object) => void = component.onNoteModalDismiss(1);
    createNote({ data: { method: 'create', note: 'd' } });
    expect(component.notes.length).toEqual(4);
    expect(component.notes[3]).toMatch('d');
    updateNote({ data: { method: 'update', note: 'e' } });
    expect(component.notes.length).toEqual(4);
    expect(component.notes[1]).toMatch('e');
    deleteNote({ data: { method: 'delete' } });
    expect(component.notes.length).toEqual(3);
    expect(component.notes[1]).toMatch('c');
  });

  test('should open a note modal with default dismiss', (done: jest.DoneCallback): void => {
    const _stubModal: ModalStub = new ModalStub();
    component.notes = [ 'a', 'b', 'c' ];
    component.getModalOptions = jest.fn()
      .mockReturnValue({
        noteType: 'master',
        formMethod: 'update',
        toUpdate: 'b'
      });
    component.modalCtrl.create = jest.fn()
      .mockReturnValue(Promise.resolve(_stubModal));
    component.onNoteModalDismiss = jest.fn()
      .mockReturnValue((data: object): void => {});
    _stubModal.onDidDismiss = jest.fn()
      .mockReturnValue(Promise.resolve());
    const createSpy: jest.SpyInstance = jest.spyOn(component.modalCtrl, 'create');

    fixture.detectChanges();

    component.openNoteModal(1);
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
      done();
    }, 10);
  });

  test('should patch recipe master notes', (done: jest.DoneCallback): void => {
    const _mockRecipeMasterInactive: RecipeMaster = mockRecipeMasterInactive();
    const notes: string[] = [ 'a', 'b', 'c' ];
    component.recipeService.updateRecipeMasterById = jest.fn()
      .mockReturnValue(of(_mockRecipeMasterInactive));
    component.notes = notes;
    component.recipeMasterId = _mockRecipeMasterInactive.cid;
    const masterSpy: jest.SpyInstance = jest.spyOn(component.recipeService, 'updateRecipeMasterById');

    fixture.detectChanges();

    component.patchRecipeNotes();
    setTimeout((): void => {
      expect(masterSpy).toHaveBeenCalledWith(_mockRecipeMasterInactive.cid, { notes: notes });
      done();
    }, 10);
  });

  test('should patch recipe variant notes', (done: jest.DoneCallback): void => {
    const _mockRecipeMasterInactive: RecipeMaster = mockRecipeMasterInactive();
    const _mockRecipeVariantIncomplete: RecipeVariant = mockRecipeVariantIncomplete();
    const notes: string[] = [ 'a', 'b', 'c' ];
    component.recipeService.updateRecipeVariantById = jest.fn()
      .mockReturnValue(of(_mockRecipeVariantIncomplete));
    component.notes = notes;
    component.recipeVariantId = _mockRecipeVariantIncomplete.cid;
    component.recipeMasterId = _mockRecipeMasterInactive.cid;
    const variantSpy: jest.SpyInstance = jest.spyOn(component.recipeService, 'updateRecipeVariantById');

    fixture.detectChanges();

    component.patchRecipeNotes();
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
    component.toastService.presentToast = jest.fn();
    component.patchRecipeNotes = jest.fn()
      .mockReturnValue(of({}));
    const toastSpy: jest.SpyInstance = jest.spyOn(component.toastService, 'presentToast');

    fixture.detectChanges();

    component.submitUpdatedNotes();
    setTimeout((): void => {
      expect(toastSpy).toHaveBeenCalledWith('Updated notes', 1500, 'bottom');
      done();
    }, 10);
  });

  test('should get an error submitting notes', (done: jest.DoneCallback): void => {
    const _mockError: Error = new Error('test-error');
    component.toastService.presentToast = jest.fn();
    component.patchRecipeNotes = jest.fn()
      .mockReturnValue(throwError(_mockError));
    component.errorReporter.handleUnhandledError = jest.fn();
    const errorSpy: jest.SpyInstance = jest.spyOn(component.errorReporter, 'handleUnhandledError');

    fixture.detectChanges();

    component.submitUpdatedNotes();
    setTimeout((): void => {
      expect(errorSpy).toHaveBeenCalledWith(_mockError);
      done();
    }, 10);
  });

  test('should display a list of notes', (): void => {
    const notes: string[] = [ 'test1', 'test2', 'test3' ];
    component.notes = notes;

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
