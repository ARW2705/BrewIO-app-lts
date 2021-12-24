/* Module imports */
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { of, throwError } from 'rxjs';

/* Test configuration imports */
import { configureTestBed } from '@test/configure-test-bed';

/* Mock imports */
import { ErrorReportingServiceStub, ModalServiceStub } from '@test/service-stubs';

/* Service imports */
import { ErrorReportingService, ModalService } from '@services/public';

/* Component imports */
import { NoteFormComponent } from '@components/note/public/note-form/note-form.component';
import { NoteContainerComponent } from './note-container.component';


describe('NoteContainerComponent', (): void => {
  configureTestBed();
  let fixture: ComponentFixture<NoteContainerComponent>;
  let component: NoteContainerComponent;

  beforeAll((done: any): Promise<void> => (async (): Promise<void> => {
    TestBed.configureTestingModule({
      declarations: [ NoteContainerComponent ],
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
    fixture = TestBed.createComponent(NoteContainerComponent);
    component = fixture.componentInstance;
    component.noteUpdateEvent.emit = jest.fn();
    component.errorReporter.handleUnhandledError = jest.fn();
  });

  test('should create the component', (): void => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  test('should get modal options with index', (): void => {
    component.noteType = 'variant';
    component.notes = [ 'note1', 'note2', 'note3' ];

    fixture.detectChanges();

    expect(component.getModalOptions(2)).toStrictEqual({
      noteType: 'variant',
      formMethod: 'update',
      toUpdate: 'note3'
    });
  });

  test('should get modal options without an index', (): void => {
    component.noteType = 'master';
    component.notes = [ 'note1', 'note2', 'note3' ];

    fixture.detectChanges();

    expect(component.getModalOptions()).toStrictEqual({
      noteType: 'master',
      formMethod: 'create',
      toUpdate: ''
    });
  });

  test('should open note modal and handle create', (done: jest.DoneCallback): void => {
    component.getModalOptions = jest.fn()
      .mockReturnValue({});
    const getSpy: jest.SpyInstance = jest.spyOn(component, 'getModalOptions');
    component.modalService.openModal = jest.fn()
      .mockReturnValue(of({ method: 'create', note: 'create note' }));
    const openSpy: jest.SpyInstance = jest.spyOn(component.modalService, 'openModal');
    const emitSpy: jest.SpyInstance = jest.spyOn(component.noteUpdateEvent, 'emit');
    component.notes = [ 'note1' ];

    fixture.detectChanges();

    component.openNoteModal();
    setTimeout((): void => {
      expect(component.notes.length).toEqual(2);
      expect(component.notes[1]).toMatch('create note');
      expect(getSpy).toHaveBeenCalled();
      expect(openSpy).toHaveBeenCalledWith(NoteFormComponent, {});
      expect(emitSpy).toHaveBeenCalledWith([ 'note1', 'create note' ]);
      done();
    }, 10);
  });

  test('should open note modal and handle update', (done: jest.DoneCallback): void => {
    component.getModalOptions = jest.fn()
      .mockReturnValue({});
    const getSpy: jest.SpyInstance = jest.spyOn(component, 'getModalOptions');
    component.modalService.openModal = jest.fn()
      .mockReturnValue(of({ method: 'update', note: 'update note' }));
    const openSpy: jest.SpyInstance = jest.spyOn(component.modalService, 'openModal');
    const emitSpy: jest.SpyInstance = jest.spyOn(component.noteUpdateEvent, 'emit');
    component.notes = [ 'note1', 'note2' ];

    fixture.detectChanges();

    component.openNoteModal(1);
    setTimeout((): void => {
      expect(component.notes.length).toEqual(2);
      expect(component.notes[1]).toMatch('update note');
      expect(getSpy).toHaveBeenCalled();
      expect(openSpy).toHaveBeenCalledWith(NoteFormComponent, {});
      expect(emitSpy).toHaveBeenCalledWith([ 'note1', 'update note' ]);
      done();
    }, 10);
  });

  test('should open note modal and handle delete', (done: jest.DoneCallback): void => {
    component.getModalOptions = jest.fn()
      .mockReturnValue({});
    const getSpy: jest.SpyInstance = jest.spyOn(component, 'getModalOptions');
    component.modalService.openModal = jest.fn()
      .mockReturnValue(of({ method: 'delete', note: null }));
    const openSpy: jest.SpyInstance = jest.spyOn(component.modalService, 'openModal');
    const emitSpy: jest.SpyInstance = jest.spyOn(component.noteUpdateEvent, 'emit');
    component.notes = [ 'note1', 'note2' ];

    fixture.detectChanges();

    component.openNoteModal(0);
    setTimeout((): void => {
      expect(component.notes.length).toEqual(1);
      expect(component.notes[0]).toMatch('note2');
      expect(getSpy).toHaveBeenCalled();
      expect(openSpy).toHaveBeenCalledWith(NoteFormComponent, {});
      expect(emitSpy).toHaveBeenCalledWith(['note2']);
      done();
    }, 10);
  });

  test('should open note modal and handle error', (done: jest.DoneCallback): void => {
    const _mockError: Error = new Error('test-error');
    component.modalService.openModal = jest.fn()
      .mockReturnValue(throwError(_mockError));
    const errorSpy: jest.SpyInstance = jest.spyOn(component.errorReporter, 'handleUnhandledError');

    fixture.detectChanges();

    component.openNoteModal();
    setTimeout((): void => {
      expect(errorSpy).toHaveBeenCalledWith(_mockError);
      done();
    }, 10);
  });

  test('should render the template', (): void => {
    component.notes = [ 'note1', 'note2' ];
    component.noteType = 'variant';

    fixture.detectChanges();

    const button: HTMLElement = fixture.nativeElement.querySelector('ion-button');
    expect(button.textContent).toMatch('ADD VARIANT NOTE');
    const list: HTMLElement = fixture.nativeElement.querySelector('app-note-list');
    expect(list['noteType']).toMatch('variant');
    expect(list['notes']).toStrictEqual([ 'note1', 'note2' ]);
  });

});
