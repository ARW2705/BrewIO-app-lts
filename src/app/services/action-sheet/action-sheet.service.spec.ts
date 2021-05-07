/* Module imports */
import { TestBed, getTestBed, async } from '@angular/core/testing';
import { ActionSheetController } from '@ionic/angular';

/* Test configuration imports */
import { configureTestBed } from '../../../../test-config/configure-test-bed';

/* Mock imports */
import { mockActionSheetButtons , mockActionSheetElement } from '../../../../test-config/mock-models';
import { ActionSheetControllerStub } from '../../../../test-config/ionic-stubs';

/* Interface imports */
import { ActionSheetButton } from '../../shared/interfaces/action-sheet-buttons';

/* Service imports */
import { ActionSheetService } from './action-sheet.service';


describe('ActionSheetService', () => {

  let injector: TestBed;
  let actionSheetService: ActionSheetService;
  let actionCtrl: ActionSheetController;
  configureTestBed();

  beforeAll(async(() => {
    TestBed.configureTestingModule({
      providers: [
        ActionSheetService,
        { provide: ActionSheetController, useClass: ActionSheetControllerStub }
      ]
    });

    injector = getTestBed();
    actionSheetService = injector.get(ActionSheetService);
    actionCtrl = injector.get(ActionSheetController);
  }));

  test('should create the service', () => {
    expect(actionSheetService).toBeDefined();
  });

  test('should open action sheet with default options', (done: jest.DoneCallback) => {
    const _mockActionSheetElement = mockActionSheetElement();

    actionCtrl.create = jest
      .fn()
      .mockReturnValue(Promise.resolve(_mockActionSheetElement));

    const createSpy: jest.SpyInstance = jest.spyOn(actionCtrl, 'create');
    const presentSpy: jest.SpyInstance = jest.spyOn(_mockActionSheetElement, 'present');

    actionSheetService.openActionSheet('test', []);

    setTimeout(() => {
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

    actionCtrl.create = jest
      .fn()
      .mockReturnValue(Promise.resolve(_mockActionSheetElement));

    const createSpy: jest.SpyInstance = jest.spyOn(actionCtrl, 'create');
    const presentSpy: jest.SpyInstance = jest.spyOn(_mockActionSheetElement, 'present');

    const _mockActionSheetButtons: ActionSheetButton[] = mockActionSheetButtons();

    actionSheetService.openActionSheet('test', _mockActionSheetButtons, 'custom-class');

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
