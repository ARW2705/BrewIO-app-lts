/* Module imports */
import { async, getTestBed, TestBed } from '@angular/core/testing';

/* TestBed configuration imports */
import { configureTestBed } from '@test/configure-test-bed';

/* Mock imports */
import { mockAlert, mockBatch, mockCalendarMetadata, mockEnglishUnits, mockGeneratedBatch, mockHopsSchedule, mockMetricUnits, mockSyncError, mockSyncMetadata, mockSyncResponse, mockRecipeMasterActive, mockPrimaryValues, mockProcessSchedule, mockErrorResponse, mockUser } from '@test/mock-models';
import { CalculationsServiceStub, IdServiceStub, PreferencesServiceStub , UtilityServiceStub } from '@test/service-stubs';

/* Interface imports */
import { Alert, Batch, BatchAnnotations, BatchContext, BatchProcess, CalendarMetadata, CalendarProcess, HopsSchedule, PrimaryValues, Process, RecipeMaster, SelectedUnits, SyncData, SyncError, SyncRequests, SyncResponse, TimerProcess, User } from '@shared/interfaces';

/* Type imports */
import { CustomError } from '@shared/types';

/* Service imports */
import { CalculationsService, IdService, PreferencesService, UtilityService } from '@services/public';
import { ProcessComponentHelperService } from './process-component-helper.service';


describe('ProcessComponentHelperService', () => {
  configureTestBed();
  let injector: TestBed;
  let service: ProcessComponentHelperService;

  beforeAll(async((): void => {
    TestBed.configureTestingModule({
      providers: [
        ProcessComponentHelperService,
        { provide: CalculationsService, useClass: CalculationsServiceStub },
        { provide: IdService, useClass: IdServiceStub },
        { provide: PreferencesService, useClass: PreferencesServiceStub },
        { provide: UtilityService, useClass: UtilityServiceStub }
      ]
    });
  }));

  beforeEach((): void => {
    injector = getTestBed();
    service = injector.get(ProcessComponentHelperService);
  });

  test('should create the service', (): void => {
    expect(service).toBeTruthy();
  });

  test('should auto set boil duration', (): void => {
    const _mockProcessSchedule: Process[] = mockProcessSchedule();
    const _mockHopsSchedule: HopsSchedule[] = mockHopsSchedule();
    const boilIndex: number = 7;
    (<TimerProcess>_mockProcessSchedule[boilIndex]).duration = 60;
    service.getProcessIndex = jest.fn()
      .mockReturnValueOnce(-1)
      .mockReturnValueOnce(boilIndex);
    service.idService.getNewId = jest.fn().mockReturnValue('1');
    service.autoSetHopsAdditions = jest.fn();
    const autoSpy: jest.SpyInstance = jest.spyOn(service, 'autoSetHopsAdditions');

    service.autoSetBoilDuration(_mockProcessSchedule, 90, _mockHopsSchedule);

    expect(_mockProcessSchedule[_mockProcessSchedule.length - 1]).toStrictEqual({
      cid: '1',
      type: 'timer',
      name: 'Boil',
      description: 'Boil wort',
      duration: 90,
      concurrent: false,
      splitInterval: 1
    });
    expect(autoSpy).not.toHaveBeenCalled();

    service.autoSetBoilDuration(_mockProcessSchedule, 100, _mockHopsSchedule);

    expect((<TimerProcess>_mockProcessSchedule[boilIndex]).duration).toEqual(100);
    expect(autoSpy).toHaveBeenCalled();
  });

  test('should get process index', (): void => {
    const _mockProcessSchedule: Process[] = mockProcessSchedule();
    const mockMashIndex: number = 2;
    const mockPitchIndex: number = 11;
    const mashIndex: number = service.getProcessIndex(_mockProcessSchedule, 'name', 'Mash');
    expect(mashIndex).toEqual(mockMashIndex);
    const pitchIndex: number = service.getProcessIndex(_mockProcessSchedule, 'name', 'Pitch yeast');
    expect(pitchIndex).toEqual(mockPitchIndex);
  });

  test('should auto set hops additions', (): void => {
    const _mockHopsSchedule: HopsSchedule[] = mockHopsSchedule();
    const _mockProcessSchedule: Process[] = mockProcessSchedule();
    const boilIndex: number = 7;
    (<TimerProcess>_mockProcessSchedule[boilIndex]).duration = 60;
    const newHopsProcesses: TimerProcess[] = [
      {
        cid: '1',
        type: 'timer',
        name: 'Add mock hops 1',
        concurrent: true,
        description: 'mock description 1',
        duration: 0,
        splitInterval: 1
      },
      {
        cid: '2',
        type: 'timer',
        name: 'Add mock hops 2',
        concurrent: true,
        description: 'mock description 2',
        duration: 30,
        splitInterval: 1
      }
    ];
    expect(boilIndex).not.toEqual(-1);
    service.generateHopsProcesses = jest.fn().mockReturnValue(newHopsProcesses);
    service.getProcessIndex = jest.fn()
      .mockReturnValueOnce(-1)
      .mockReturnValueOnce(boilIndex)
      .mockReturnValueOnce(boilIndex - 2);

    expect(service.autoSetHopsAdditions(_mockProcessSchedule, 60, _mockHopsSchedule))
      .toStrictEqual(_mockProcessSchedule);
    const newSchedule: Process[] = service.autoSetHopsAdditions(
      _mockProcessSchedule,
      60,
      _mockHopsSchedule
    );
    expect(newSchedule[boilIndex - 2]).toStrictEqual(newHopsProcesses[0]);
    expect(newSchedule[boilIndex - 1]).toStrictEqual(newHopsProcesses[1]);
  });

  test('should auto set mash duration', (): void => {
    const _mockProcessSchedule: Process[] = mockProcessSchedule();
    const mashIndex: number = 2;
    (<TimerProcess>_mockProcessSchedule[mashIndex]).duration = 60;
    service.getProcessIndex = jest.fn()
      .mockReturnValueOnce(-1)
      .mockReturnValueOnce(mashIndex);
    service.idService.getNewId = jest.fn().mockReturnValue('1');

    service.autoSetMashDuration(_mockProcessSchedule, 90);

    expect(_mockProcessSchedule[_mockProcessSchedule.length - 1]).toStrictEqual({
      cid: '1',
      type: 'timer',
      name: 'Mash',
      description: 'Mash grains',
      duration: 90,
      concurrent: false,
      splitInterval: 1
    });

    service.autoSetMashDuration(_mockProcessSchedule, 120);

    expect((<TimerProcess>_mockProcessSchedule[mashIndex]).duration).toEqual(120);
  });

  test('should format hops step description', (): void => {
    const _mockEnglishUnits: SelectedUnits = mockEnglishUnits();
    const _mockMetricUnits: SelectedUnits = mockMetricUnits();
    const _mockHopsSchedule: HopsSchedule = mockHopsSchedule()[0];
    _mockHopsSchedule.quantity = 2;
    service.preferenceService.getSelectedUnits = jest.fn()
      .mockReturnValueOnce(_mockEnglishUnits)
      .mockReturnValueOnce(_mockMetricUnits);
    service.calculator.requiresConversion = jest.fn()
      .mockReturnValueOnce(false)
      .mockReturnValueOnce(true);
    service.calculator.convertWeight = jest.fn()
      .mockImplementation((value: number, ...options: any[]): number => value * 2);
    service.utilService.roundToDecimalPlace = jest.fn()
      .mockImplementation((value: number, places: number): number => {
        return Math.floor(value);
      });

    expect(service.formatHopsDescription(_mockHopsSchedule)).toMatch('Hops addition: 2oz');
    expect(service.formatHopsDescription(_mockHopsSchedule)).toMatch('Hops addition: 4g');
  });

  test('should generate hops processes based on hops schedule', (): void => {
    const _mockHopsSchedule: HopsSchedule[] = mockHopsSchedule();
    service.idService.getNewId = jest.fn().mockReturnValue('1');
    service.formatHopsDescription = jest.fn().mockReturnValue('');

    const processes: Process[] = service.generateHopsProcesses(_mockHopsSchedule, 60);
    expect(processes.length).toEqual(3);
    processes.forEach((process: Process, index: number): void => {
      expect(process.name).toMatch(`Add ${_mockHopsSchedule[index].hopsType.name} hops`);
    });
  });

});
