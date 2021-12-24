/* Module imports */
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

/* Test configuration imports */
import { configureTestBed } from '@test/configure-test-bed';

/* Constant imports */
import { API_VERSION, APP_VERSION } from '@shared/constants';

/* Component imports */
import { AboutComponent } from './about.component';


describe('AboutComponent', (): void => {
  configureTestBed();
  let fixture: ComponentFixture<AboutComponent>;
  let aboutCmp: AboutComponent;

  beforeAll((done: any): Promise<void> => (async (): Promise<void> => {
    TestBed.configureTestingModule({
      declarations: [ AboutComponent ],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
    });
    await TestBed.compileComponents();
  })()
  .then(done)
  .catch(done.fail));

  beforeEach((): void => {
    fixture = TestBed.createComponent(AboutComponent);
    aboutCmp = fixture.componentInstance;
  });

  test('should create the component', (): void => {
    fixture.detectChanges();

    expect(aboutCmp).toBeDefined();
  });

  test('should contain a description', (): void => {
    fixture.detectChanges();

    const descriptionElement: HTMLElement = fixture.nativeElement.querySelector('p');
    expect(descriptionElement.textContent).toMatch(
      'BrewIO is a multi-purpose tool to design homebrews, organize production, and track inventory.'
    );
    expect(descriptionElement.id).toMatch('app-description');
  });

  test('should contain version data', (): void => {
    fixture.detectChanges();

    const colElements: NodeList = fixture.nativeElement.querySelectorAll('ion-col');
    expect(colElements.item(0).textContent).toMatch(`App Version: ${APP_VERSION}`);
    expect(colElements.item(1).textContent).toMatch(`API Version: ${API_VERSION.split('v')[1]}`);
  });

  test('should contain a github link', (): void => {
    fixture.detectChanges();

    const linkElement: HTMLElement = fixture.nativeElement.querySelector('a');
    expect(linkElement.textContent).toMatch('GitHub');
    expect(linkElement.getAttribute('href')).toMatch('https://github.com/ARW2705/BrewIO-App');
  });

});
