/* Module imports */
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';

/* Test configuration imports */
import { configureTestBed } from '../../../../test-config/configure-test-bed';

/* Mock imports */
import { mockProcessSchedule } from '../../../../test-config/mock-models/mock-process-schedule';

/* Interface imports */
import { Process } from '../../shared/interfaces/process';

/* Component imports */
import { ProcessManualComponent } from './process-manual.component';


describe('ProcessManualComponent', (): void => {
  let fixture: ComponentFixture<ProcessManualComponent>;
  let processCmp: ProcessManualComponent;
  configureTestBed();

  beforeAll((done: any): Promise<void> => (async (): Promise<void> => {
    TestBed.configureTestingModule({
      declarations: [ ProcessManualComponent ],
      schemas: [ NO_ERRORS_SCHEMA ]
    });
    await TestBed.compileComponents();
  })()
  .then(done)
  .catch(done.fail));

  beforeEach((): void => {
    fixture = TestBed.createComponent(ProcessManualComponent);
    processCmp = fixture.componentInstance;
  });

  test('should create the component', (): void => {
    fixture.detectChanges();

    expect(processCmp).toBeDefined();
  });

  test('should render a manual process', (): void => {
    const _mockProcess: Process = mockProcessSchedule()
      .find((process: Process): boolean => {
        return process.type === 'manual';
      });
    _mockProcess.expectedDuration = 10;

    processCmp.stepData = _mockProcess;

    fixture.detectChanges();

    const ionCols: NodeList = fixture.nativeElement.querySelectorAll('ion-col');

    const nameCol: HTMLElement = <HTMLElement>ionCols.item(0);
    expect(nameCol.children[0].textContent).toMatch(_mockProcess.name);

    const contentCol: HTMLElement = <HTMLElement>ionCols.item(1);
    const description: HTMLElement = <HTMLElement>contentCol.children[0];
    expect(description.textContent).toMatch(`Description: ${_mockProcess.description}`);
    const duration: HTMLElement = <HTMLElement>contentCol.children[1];
    expect(duration.textContent).toMatch('Expected Duration: 10 minutes');
  });

});
