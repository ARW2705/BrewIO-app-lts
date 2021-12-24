/* Module imports */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';

/* Test configuration imports */
import { configureTestBed } from '@test/configure-test-bed';

/* Mock imports */
import { mockProcessSchedule } from '@test/mock-models';

/* Interface imports */
import { Process } from '@shared/interfaces';

/* Component imports */
import { ProcessListComponent } from './process-list.component';


describe('ProcessListComponent', (): void => {
  configureTestBed();
  let fixture: ComponentFixture<ProcessListComponent>;
  let component: ProcessListComponent;

  beforeAll((done: any): Promise<void> => (async (): Promise<void> => {
    TestBed.configureTestingModule({
      declarations: [ ProcessListComponent ],
      schemas: [ NO_ERRORS_SCHEMA ]
    });
    await TestBed.compileComponents();
  })()
  .then(done)
  .catch(done.fail));

  beforeEach((): void => {
    fixture = TestBed.createComponent(ProcessListComponent);
    component = fixture.componentInstance;
    component.openProcessModalEvent.emit = jest.fn();
    component.reorderEvent.emit = jest.fn();
  });

  test('should create the component', (): void => {
    fixture.detectChanges();

    expect(component).toBeDefined();
  });

  test('should handle reorder event', (): void => {
    const _mockProcess: Process = mockProcessSchedule()[0];
    const emitSpy: jest.SpyInstance = jest.spyOn(component.openProcessModalEvent, 'emit');
    const args: any[] = [ _mockProcess.type, _mockProcess, 0 ];

    fixture.detectChanges();

    component.openProcessModal(args[1], args[2]);
    expect(emitSpy).toHaveBeenCalledWith(args);
  });

  test('should handle reorder event', (): void => {
    const emitSpy: jest.SpyInstance = jest.spyOn(component.reorderEvent, 'emit');
    const event: CustomEvent = new CustomEvent(
      'onReorder',
      {
        detail: {
          complete: () => 0
        }
      }
    );

    fixture.detectChanges();

    component.onReorder(event);
    expect(emitSpy).toHaveBeenCalledWith(0);
  });

  test('should render a process list', (): void => {
    const _mockProcessSchedule: Process[] = mockProcessSchedule();
    const manualIndex: number = _mockProcessSchedule.findIndex((process: Process): boolean => {
      return process.type === 'manual';
    });
    const timerIndex: number = _mockProcessSchedule.findIndex((process: Process): boolean => {
      return process.type === 'timer';
    });
    const calendarIndex: number = _mockProcessSchedule.findIndex((process: Process): boolean => {
      return process.type === 'calendar';
    });
    component.schedule = _mockProcessSchedule;

    fixture.detectChanges();

    const processList: NodeList = fixture.nativeElement.querySelectorAll('ion-item');
    const manualProcess: HTMLElement = <HTMLElement>processList.item(manualIndex);
    expect(manualProcess.children[0].children[0].children[0]['name']).toMatch('hand-right-outline');
    expect(manualProcess.children[0].textContent).toMatch(_mockProcessSchedule[manualIndex].name);
    const timerProcess: HTMLElement = <HTMLElement>processList.item(timerIndex);
    expect(timerProcess.children[0].children[0].children[0]['name']).toMatch('timer-outline');
    expect(timerProcess.children[0].textContent).toMatch(_mockProcessSchedule[timerIndex].name);
    const calendarProcess: HTMLElement = <HTMLElement>processList.item(calendarIndex);
    expect(calendarProcess.children[0].children[0].children[0]['name']).toMatch('calendar-outline');
    expect(calendarProcess.children[0].textContent).toMatch(_mockProcessSchedule[calendarIndex].name);
  });

});
