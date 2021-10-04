/* Module imports */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

/* Test configuration imports */
import { configureTestBed } from '../../../../../../test-config/configure-test-bed';

/* Mock imports */
import { mockProcessSchedule } from '../../../../../../test-config/mock-models';

/* Interface imports */
import { ManualProcess, Process } from '../../../../shared/interfaces';

/* Component imports */
import { ProcessManualComponent } from './process-manual.component';


describe('ProcessManualComponent', (): void => {
  configureTestBed();
  let fixture: ComponentFixture<ProcessManualComponent>;
  let component: ProcessManualComponent;

  beforeAll((done: any): Promise<void> => (async (): Promise<void> => {
    TestBed.configureTestingModule({
      declarations: [ ProcessManualComponent ],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
    });
    await TestBed.compileComponents();
  })()
  .then(done)
  .catch(done.fail));

  beforeEach((): void => {
    fixture = TestBed.createComponent(ProcessManualComponent);
    component = fixture.componentInstance;
  });

  test('should create the component', (): void => {
    fixture.detectChanges();

    expect(component).toBeDefined();
  });

  test('should render a manual process', (): void => {
    const _mockProcess: ManualProcess = mockProcessSchedule()
      .find((process: Process): boolean => {
        return process.type === 'manual';
      });
    _mockProcess.expectedDuration = 10;
    component.manualProcess = _mockProcess;

    fixture.detectChanges();

    const header: HTMLElement = fixture.nativeElement.querySelector('app-process-header');
    expect(header['headerText']).toMatch(_mockProcess.name);
    expect(header['isPreview']).toBe(false);
    const preview: HTMLElement = fixture.nativeElement.querySelector('app-process-preview-content');
    expect(preview['process']).toStrictEqual(_mockProcess);
  });

});
