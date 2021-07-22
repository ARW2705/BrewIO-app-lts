/* Module imports */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';

/* Test configuration imports */
import { configureTestBed } from '../../../../test-config/configure-test-bed';

/* Mock imports */
import { mockProcessSchedule } from '../../../../test-config/mock-models';

/* Interface imports */
import { Process } from '../../shared/interfaces';

/* Component imports */
import { ProcessListComponent } from './process-list.component';


describe('ProcessListComponent', (): void => {
  let fixture: ComponentFixture<ProcessListComponent>;
  let processCmp: ProcessListComponent;
  configureTestBed();

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
    processCmp = fixture.componentInstance;
    processCmp.onRecipeAction = jest
      .fn();
  });

  test('should create the component', (): void => {
    fixture.detectChanges();

    expect(processCmp).toBeDefined();
  });

  test('should handle reorder event', (): void => {
    const _mockProcess: Process = mockProcessSchedule()[0];
    const actionSpy: jest.SpyInstance = jest.spyOn(processCmp, 'onRecipeAction');

    const args: any[] = [ _mockProcess.type, _mockProcess, 0 ];

    fixture.detectChanges();

    processCmp.openProcessModal(args[0], args[1], args[2]);

    expect(actionSpy).toHaveBeenCalledWith('openProcessModal', args);
  });

  test('should handle reorder event', (): void => {
    const actionSpy: jest.SpyInstance = jest.spyOn(processCmp, 'onRecipeAction');

    const event: CustomEvent = new CustomEvent(
      'onReorder',
      {
        detail: {
          complete: () => 0
        }
      }
    );

    fixture.detectChanges();

    processCmp.onReorder(event);

    expect(actionSpy).toHaveBeenCalledWith('onReorder', [ 0 ]);
  });

  test('should render a process list', (): void => {
    const _mockProcessSchedule: Process[] = mockProcessSchedule();
    const manualIndex: number = _mockProcessSchedule
      .findIndex((process: Process): boolean => {
        return process.type === 'manual';
      });
    const timerIndex: number = _mockProcessSchedule
      .findIndex((process: Process): boolean => {
        return process.type === 'timer';
      });
    const calendarIndex: number = _mockProcessSchedule
      .findIndex((process: Process): boolean => {
        return process.type === 'calendar';
      });

    processCmp.schedule = _mockProcessSchedule;

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
