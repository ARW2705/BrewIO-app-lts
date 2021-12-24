/* Module imports */
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { Platform } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';

/* Test configuration imports */
import { configureTestBed } from '@test/configure-test-bed';

/* Mock imports */
import { RecipeServiceStub, InventoryServiceStub, LibraryServiceStub, ProcessServiceStub, UserServiceStub } from '@test/service-stubs';
import { DomStub, PlatformDevStub, StatusBarStub, SplashScreenStub, StorageStub } from '@test/ionic-stubs';

/* Service imports */
import { InventoryService, LibraryService, ProcessService, RecipeService, UserService } from '@services/public';

/* Component imports */
import { AppComponent } from './app.component';


describe('AppComponent', () => {

  let fixture: ComponentFixture<AppComponent>;
  let appComponent: AppComponent;
  configureTestBed();

  beforeAll((done: any): Promise<void> => (async (): Promise<void> => {
    TestBed.configureTestingModule({
      declarations: [ AppComponent ],
      providers: [
        { provide: LibraryService, useClass: LibraryServiceStub },
        { provide: UserService, useClass: UserServiceStub },
        { provide: Document, useClass: DomStub },
        { provide: InventoryService, useClass: InventoryServiceStub },
        { provide: ProcessService, useClass: ProcessServiceStub },
        { provide: RecipeService, useClass: RecipeServiceStub },
        { provide: StatusBar, useClass: StatusBarStub },
        { provide: SplashScreen, useClass: SplashScreenStub },
        { provide: Platform, useClass: PlatformDevStub },
        { provide: Storage, useClass: StorageStub }
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

  test('should handle alert present event', (): void => {
    const mockHTMLElement: HTMLElement = global.document.createElement('ion-select-option');

    mockHTMLElement.scrollIntoView = jest
      .fn();

    global.document.querySelector = jest
      .fn()
      .mockReturnValue(mockHTMLElement);

    appComponent.isSelectOptionChecked = jest
      .fn()
      .mockReturnValueOnce(false)
      .mockReturnValueOnce(true);

    const scrollSpy: jest.SpyInstance = jest.spyOn(mockHTMLElement, 'scrollIntoView');

    fixture.detectChanges();

    appComponent.onAlertOpen();
    expect(scrollSpy).not.toHaveBeenCalled();

    appComponent.onAlertOpen();
    expect(scrollSpy).toHaveBeenCalled();
  });

});
