import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { TestBed, ComponentFixture } from '@angular/core/testing';

import { Platform } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';

/* Test configuration imports */
import { configureTestBed } from '../../test-config/configure-test-bed';

/* Mock imports */
import { DomMock, PlatformMockDev, StatusBarMock, SplashScreenMock, StorageMock } from '../../test-config/mocks-ionic';

/* Service imports */
import { InventoryService } from './services/inventory/inventory.service';
import { LibraryService } from './services/library/library.service';
import { ProcessService } from './services/process/process.service';
import { RecipeService } from './services/recipe/recipe.service';
import { UserService } from './services/user/user.service';

/* Component imports */
import { AppComponent } from './app.component';


describe('AppComponent', () => {

  let fixture: ComponentFixture<AppComponent>;
  let appComponent: AppComponent;
  configureTestBed();

  beforeAll((done: any) => (async () => {
    TestBed.configureTestingModule({
      declarations: [ AppComponent ],
      imports: [ ],
      providers: [
        {
          provide: LibraryService,
          useValue: {
            fetchAllLibraries: () => []
          }
        },
        {
          provide: UserService,
          useValue: {
            loadUserFromStorage: () => {}
          }
        },
        { provide: Document, useClass: DomMock },
        { provide: InventoryService, useValue: {} },
        { provide: ProcessService, useValue: {} },
        { provide: RecipeService, useValue: {} },
        { provide: StatusBar, useClass: StatusBarMock },
        { provide: SplashScreen, useClass: SplashScreenMock },
        { provide: Platform, useClass: PlatformMockDev },
        { provide: Storage, useClass: StorageMock }
      ],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
    });
    await TestBed.compileComponents();
  })()
  .then(done)
  .catch(done.fail));

  beforeEach(() => {
    fixture = TestBed.createComponent(AppComponent);
    appComponent = fixture.componentInstance;
  });

  test('should create the component', () => {
    fixture.detectChanges();

    expect(appComponent).toBeDefined();
    expect(appComponent instanceof AppComponent).toBe(true);
  });

  test('should call initializeApp on component creation', (done: jest.DoneCallback) => {
    fixture.detectChanges();

    const statusBarSpy: jest.SpyInstance = jest.spyOn(appComponent.statusBar, 'styleDefault');

    appComponent.initializeApp();

    setTimeout(() => {
      expect(statusBarSpy).toHaveBeenCalled();
      done();
    }, 10);
  });

  test('should check if an element is a \'select-interface-option\'', () => {
    const mockOptionElem: object = {
      classList: {
        contains: (searchTerm: string) => searchTerm === 'select-interface-option'
      }
    };
    const mockNotOptionElem: object = {
      classList: {
        contains: (searchTerm: string) => searchTerm === ''
      }
    };

    expect(appComponent.isSelectOptionChecked(<HTMLElement>mockOptionElem)).toBe(true);
    expect(appComponent.isSelectOptionChecked(<HTMLElement>mockNotOptionElem)).toBe(false);
  });

  // TODO: figure out how to test hostlistener with document element

});
