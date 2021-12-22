/* Module imports */
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

/* Test configuration imports */
import { configureTestBed } from '../../../../../../test-config/configure-test-bed';

/* Component imports */
import { NoteListComponent } from './note-list.component';


describe('NoteListComponent', (): void => {
  configureTestBed();
  let fixture: ComponentFixture<NoteListComponent>;
  let component: NoteListComponent;

  beforeAll((done: any): Promise<void> => (async (): Promise<void> => {
    TestBed.configureTestingModule({
      declarations: [ NoteListComponent ],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
    });
    await TestBed.compileComponents();
  })()
  .then(done)
  .catch(done.fail));

  beforeEach((): void => {
    fixture = TestBed.createComponent(NoteListComponent);
    component = fixture.componentInstance;
    component.openNoteModalEvent.emit = jest.fn();
  });

  test('should create the component', (): void => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  test('should emit open note modal event', (): void => {
    const emitSpy: jest.SpyInstance = jest.spyOn(component.openNoteModalEvent, 'emit');

    fixture.detectChanges();

    component.openNoteModal(1);
    expect(emitSpy).toHaveBeenCalledWith(1);
  });

  test('should render the template with empty notes list', (): void => {
    component.notes = [];

    fixture.detectChanges();

    const list: HTMLElement = fixture.nativeElement.querySelector('ion-list');
    expect(list).toBeNull();
    const msg: HTMLElement = fixture.nativeElement.querySelector('.list-empty-message');
    expect(msg.textContent).toMatch('Note List Empty');
  });

  test('should render the template with a list of notes', (): void => {
    component.notes = [ 'note1', 'note2' ];

    fixture.detectChanges();

    const notes: NodeList = fixture.nativeElement.querySelectorAll('p');
    expect(notes.item(0).textContent).toMatch('note1');
    expect(notes.item(1).textContent).toMatch('note2');
  });
});
