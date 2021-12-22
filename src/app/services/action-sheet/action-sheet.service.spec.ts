/* Module imports */
import { TestBed, getTestBed, async } from '@angular/core/testing';
import { ActionSheetController } from '@ionic/angular';

/* Test configuration imports */
import { configureTestBed } from '../../../../test-config/configure-test-bed';

/* Mock imports */
import { mockActionSheetButtons , mockActionSheetElement } from '../../../../test-config/mock-models';
import { ActionSheetControllerStub } from '../../../../test-config/ionic-stubs';

/* Interface imports */
import { ActionSheetButton } from '../../shared/interfaces';

/* Service imports */
import { ActionSheetService } from './action-sheet.service';


describe('ActionSheetService', () => {
  configureTestBed();
  let injector: TestBed;
  let service: ActionSheetService;
  let actionCtrl: ActionSheetController;

  beforeAll(async((): void => {
    TestBed.configureTestingModule({
      providers: [
        ActionSheetService,
        { provide: ActionSheetController, useClass: ActionSheetControllerStub }
      ]
    });
    injector = getTestBed();
    service = injector.get(ActionSheetService);
    actionCtrl = injector.get(ActionSheetController);
  }));

  test('should create the service', (): void => {
    expect(service).toBeDefined();
  });

  test('should open action sheet with default options', (done: jest.DoneCallback): void => {
    const _mockActionSheetElement = mockActionSheetElement();
    let sheetOptions: any[];
    actionCtrl.create = jest.fn()
      .mockImplementation((...options: any[]): Promise<any> => {
        sheetOptions = options;
        return Promise.resolve(_mockActionSheetElement);
      });
    const createSpy: jest.SpyInstance = jest.spyOn(actionCtrl, 'create');
    const presentSpy: jest.SpyInstance = jest.spyOn(_mockActionSheetElement, 'present');
    const consoleSpy: jest.SpyInstance = jest.spyOn(console, 'log');

    service.openActionSheet('test', []);

    setTimeout(() => {
      sheetOptions[0].buttons[0].handler();
      expect(consoleSpy.mock.calls[consoleSpy.mock.calls.length - 1][0]).toMatch('Action Sheet cancelled');
      expect(presentSpy).toHaveBeenCalled();
      const caughtCall: object = createSpy.mock.calls[0][0];
      expect(caughtCall['header']).toMatch('test');
      expect(caughtCall['buttons'].length).toEqual(1);
      expect(caughtCall['buttons'][0]['text']).toMatch('Cancel');
      expect(caughtCall['cssClass']).toMatch('action-sheet-main');
      done();
    }, 10);
  });

  test('should open action sheet with additional buttons', (done: jest.DoneCallback) => {
    const _mockActionSheetElement = mockActionSheetElement();
    actionCtrl.create = jest.fn()
      .mockReturnValue(Promise.resolve(_mockActionSheetElement));
    const createSpy: jest.SpyInstance = jest.spyOn(actionCtrl, 'create');
    const presentSpy: jest.SpyInstance = jest.spyOn(_mockActionSheetElement, 'present');
    const _mockActionSheetButtons: ActionSheetButton[] = mockActionSheetButtons();

    service.openActionSheet('test', _mockActionSheetButtons, 'custom-class');

    setTimeout(() => {
      expect(presentSpy).toHaveBeenCalled();
      const caughtCall: object = createSpy.mock.calls[0][0];
      expect(caughtCall['header']).toMatch('test');
      expect(caughtCall['buttons'].length).toEqual(5);
      expect(caughtCall['buttons'][0]['text']).toMatch('Choice 1');
      expect(caughtCall['buttons'][3]['role']).toMatch('role');
      expect(caughtCall['buttons'][4]['text']).toMatch('Cancel');
      done();
    }, 10);
  });

});
