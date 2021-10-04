/* Module imports */
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { of, throwError } from 'rxjs';

/* Test configuration imports */
import { configureTestBed } from '../../../../../test-config/configure-test-bed';

/* Mock imports */
import { mockRecipeMasterInactive, mockRecipeVariantIncomplete } from '../../../../../test-config/mock-models';
import { ErrorReportingServiceStub, ModalServiceStub } from '../../../../../test-config/service-stubs';
import { ModalControllerStub, ModalStub } from '../../../../../test-config/ionic-stubs';

/* Interface imports */
import { RecipeMaster, RecipeVariant } from '../../../shared/interfaces';

/* Page imports */
import { NoteFormPage } from '../../../pages/forms/note-form/note-form.page';

/* Service imports */
import { ErrorReportingService, ModalService } from '../../../services/services';

/* Component imports */
import { NoteListComponent } from './note-list.component';


describe('NoteListComponent', (): void => {
  configureTestBed();
  let fixture: ComponentFixture<NoteListComponent>;
  let component: NoteListComponent;

  beforeAll((done: any): Promise<void> => (async (): Promise<void> => {
    TestBed.configureTestingModule({
      declarations: [ NoteListComponent ],
      providers: [
        { provide: ErrorReportingService, useClass: ErrorReportingServiceStub },
        { provide: ModalService, useClass: ModalServiceStub }
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
    component.noteUpdateEvent.emit = jest.fn();
    component.errorReporter.handleUnhandledError = jest.fn();
  });

  test('should create the component', (): void => {
    fixture.detectChanges();

    expect(component).toBeTruthy();
  });

  test('should get modal options on create', (): void => {
    const notes: string[] = ['a', 'b', 'c'];
    component.noteType = 'master';
    component.notes = notes;

    fixture.detectChanges();

    expect(component.getModalOptions()).toStrictEqual({
      noteType: 'master',
      formMethod: 'create',
      toUpdate: ''
    });
  });

  test('should get modal options on update', (): void => {
    const notes: string[] = ['a', 'b', 'c'];
    component.noteType = 'master';
    component.notes = notes;

    fixture.detectChanges();

    expect(component.getModalOptions(1)).toStrictEqual({
      noteType: 'master',
      formMethod: 'update',
      toUpdate: 'b'
    });
  });

  test('should open note modal with new note', (done: jest.DoneCallback): void => {
    component.notes = ['a'];
    const _mockModalOptions: object = {
      noteType: 'variant',
      formMethod: 'create',
      toUpdate: undefined
    };
    component.getModalOptions = jest.fn()
      .mockReturnValue(_mockModalOptions);
    component.modalService.openModal = jest.fn()
      .mockReturnValue(of({ method: 'create', note: 'test' }));
    const emitSpy: jest.SpyInstance = jest.spyOn(component.noteUpdateEvent, 'emit');
    const openSpy: jest.SpyInstance = jest.spyOn(component.modalService, 'openModal');

    fixture.detectChanges();

    component.openNoteModal();
    setTimeout((): void => {
      expect(emitSpy).toHaveBeenCalled();
      expect(openSpy).toHaveBeenCalledWith(NoteFormPage, _mockModalOptions);
      expect(component.notes.length).toEqual(2);
      expect(component.notes[1]).toMatch('test');
      done();
    }, 10);
  });

  test('should open note modal with updated note', (done: jest.DoneCallback): void => {
    component.notes = ['a', 'b', 'c'];
    const _mockModalOptions: object = {
      noteType: 'variant',
      formMethod: 'update',
      toUpdate: 'b'
    };
    component.getModalOptions = jest.fn()
      .mockReturnValue(_mockModalOptions);
    component.modalService.openModal = jest.fn()
      .mockReturnValue(of({ method: 'update', note: 'test' }));
    const emitSpy: jest.SpyInstance = jest.spyOn(component.noteUpdateEvent, 'emit');
    const openSpy: jest.SpyInstance = jest.spyOn(component.modalService, 'openModal');

    fixture.detectChanges();

    component.openNoteModal(1);
    setTimeout((): void => {
      expect(emitSpy).toHaveBeenCalled();
      expect(openSpy).toHaveBeenCalledWith(NoteFormPage, _mockModalOptions);
      expect(component.notes.length).toEqual(3);
      expect(component.notes[1]).toMatch('test');
      done();
    }, 10);
  });

  test('should open note modal with delete note', (done: jest.DoneCallback): void => {
    component.notes = ['a', 'b', 'c'];
    const _mockModalOptions: object = {
      noteType: 'variant',
      formMethod: 'create',
      toUpdate: undefined
    };
    component.getModalOptions = jest.fn()
      .mockReturnValue(_mockModalOptions);
    component.modalService.openModal = jest.fn()
      .mockReturnValue(of({ method: 'delete', note: null }));
    const emitSpy: jest.SpyInstance = jest.spyOn(component.noteUpdateEvent, 'emit');
    const openSpy: jest.SpyInstance = jest.spyOn(component.modalService, 'openModal');

    fixture.detectChanges();

    component.openNoteModal(1);
    setTimeout((): void => {
      expect(emitSpy).toHaveBeenCalled();
      expect(openSpy).toHaveBeenCalledWith(NoteFormPage, _mockModalOptions);
      expect(component.notes.length).toEqual(2);
      expect(component.notes[1]).toMatch('c');
      done();
    }, 10);
  });

  test('should open note modal with error', (done: jest.DoneCallback): void => {
    component.notes = ['a'];
    const _mockModalOptions: object = {
      noteType: 'variant',
      formMethod: 'create',
      toUpdate: undefined
    };
    const _mockError: Error = new Error('test-error');
    component.getModalOptions = jest.fn()
      .mockReturnValue(_mockModalOptions);
    component.modalService.openModal = jest.fn()
      .mockReturnValue(throwError(_mockError));
    const errorSpy: jest.SpyInstance = jest.spyOn(component.errorReporter, 'handleUnhandledError');
    const openSpy: jest.SpyInstance = jest.spyOn(component.modalService, 'openModal');

    fixture.detectChanges();

    component.openNoteModal();
    setTimeout((): void => {
      expect(errorSpy).toHaveBeenCalledWith(_mockError);
      expect(openSpy).toHaveBeenCalledWith(NoteFormPage, _mockModalOptions);
      expect(component.notes.length).toEqual(1);
      done();
    }, 10);
  });

  test('should render the template with notes', (): void => {
    component.notes = ['a', 'b', 'c'];

    fixture.detectChanges();

    const items: NodeList = fixture.nativeElement.querySelectorAll('ion-item');
    expect(items.length).toEqual(3);
    const firstItem: Element = <Element>items.item(0);
    const firstButton: Element = firstItem.querySelector('button');
    expect(firstButton.classList.contains('border-bottom-medium')).toBe(true);
    const firstNote: Element = firstItem.querySelector('p');
    expect(firstNote.textContent).toMatch('a');
    const lastItem: Element = <Element>items.item(2);
    const lastButton: Element = lastItem.querySelector('button');
    expect(lastButton.classList.contains('border-bottom-medium')).toBe(false);
    const lastNote: Element = lastItem.querySelector('p');
    expect(lastNote.textContent).toMatch('c');
  });

  test('should render the template without notes', (): void => {
    component.notes = [];

    fixture.detectChanges();

    const message: HTMLElement = fixture.nativeElement.querySelector('div');
    expect(message.textContent).toMatch('Note List Empty');
  });

});
