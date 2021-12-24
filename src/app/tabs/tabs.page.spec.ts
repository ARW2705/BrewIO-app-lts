/* Module imports */
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { IonicModule } from '@ionic/angular';

/* Test configuration imports */
import { configureTestBed } from '@test/configure-test-bed';

/* Mock imports */
import { EventServiceStub } from '@test/service-stubs';

/* Service imports */
import { EventService } from '@services/public';

/* Component imports */
import { TabsPage } from './tabs.page';


describe('TabsPage', () => {

  let fixture: ComponentFixture<TabsPage>;
  let tabsPage: TabsPage;
  configureTestBed();

  beforeAll((done: jest.DoneCallback) => (async () => {
    TestBed.configureTestingModule({
      declarations: [ TabsPage ],
      imports: [
        IonicModule,
        RouterTestingModule
      ],
      providers: [
        { provide: EventService, useClass: EventServiceStub },
      ],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
    });
    await TestBed.compileComponents();
  })()
  .then(done)
  .catch(done.fail));

  beforeEach(() => {
    fixture = TestBed.createComponent(TabsPage);
    tabsPage = fixture.componentInstance;
  });

  test('should create the page', () => {
    fixture.detectChanges();

    expect(tabsPage).toBeDefined();
    expect(tabsPage instanceof TabsPage).toBe(true);
  });

  test('should handle tab click', async () => {
    fixture.detectChanges();

    tabsPage.router.navigate = jest
      .fn()
      .mockReturnValue(true);

    tabsPage.tabs.select = jest
      .fn()
      .mockReturnValue(true);

    tabsPage.tabs.getSelected = jest
      .fn()
      .mockReturnValueOnce('my-tab')
      .mockReturnValueOnce('other-tab');

    tabsPage.emitTabChange = jest
      .fn();

    const tab: string = 'my-tab';
    const event: MouseEvent = new MouseEvent('tap');

    const selectSpy: jest.SpyInstance = jest.spyOn(tabsPage.tabs, 'select');
    const routerSpy: jest.SpyInstance = jest.spyOn(tabsPage.router, 'navigate');
    const stopPropSpy: jest.SpyInstance = jest.spyOn(event, 'stopImmediatePropagation');
    const preventDefSpy: jest.SpyInstance = jest.spyOn(event, 'preventDefault');

    const onSame: boolean = await tabsPage.onTabClick(tab, event);
    expect(stopPropSpy).toHaveBeenCalled();
    expect(preventDefSpy).toHaveBeenCalled();
    expect(selectSpy).toHaveBeenCalledWith(tab);
    expect(routerSpy).not.toHaveBeenCalled();
    expect(onSame).toBe(true);

    const onNav: boolean = await tabsPage.onTabClick(tab, event);
    expect(stopPropSpy).toHaveBeenCalled();
    expect(preventDefSpy).toHaveBeenCalled();
    expect(selectSpy.mock.calls.length).toEqual(1);
    expect(routerSpy).toHaveBeenCalledWith(['tabs/my-tab']);
    expect(onNav).toBe(true);
  });

  test('should emit tab change event', () => {
    fixture.detectChanges();

    const eventSpy: jest.SpyInstance = jest.spyOn(tabsPage.event, 'emit');

    const mockEvent: object = { mock: 'test' };

    tabsPage.emitTabChange(mockEvent);

    expect(eventSpy).toHaveBeenCalledWith('tab-change', mockEvent);
  });

});
