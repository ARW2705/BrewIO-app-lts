/* Module imports */
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { By } from '@angular/platform-browser';
import { ComponentFixture, TestBed } from '@angular/core/testing';

/* Test configuration imports */
import { configureTestBed } from '../../../../test-config/configure-test-bed';

/* Component imports */
import { ProcessHeaderComponent } from './process-header.component';


describe('ProcessHeaderComponent', (): void => {
  configureTestBed();
  let fixture: ComponentFixture<ProcessHeaderComponent>;
  let component: ProcessHeaderComponent;

  beforeAll((done: any): Promise<void> => (async (): Promise<void> => {
    TestBed.configureTestingModule({
      declarations: [
        ProcessHeaderComponent
      ],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
    });
    await TestBed.compileComponents();
  })()
  .then(done)
  .catch(done.fail));

  beforeEach((): void => {
    fixture = TestBed.createComponent(ProcessHeaderComponent);
    component = fixture.componentInstance;
  });

  test('should create the component', (): void => {
    fixture.detectChanges();

    expect(component).toBeTruthy();
  });

  test('should emit show description event', (): void => {
    component.toggleShowDescriptionEvent.emit = jest.fn();
    const emitSpy: jest.SpyInstance = jest.spyOn(component.toggleShowDescriptionEvent, 'emit');

    fixture.detectChanges();

    component.toggleShowDescription();
    expect(emitSpy).toHaveBeenCalled();
  });

  test('should render template as a preview', (): void => {
    const text: string = 'test-text';
    component.headerText = text;
    component.isPreview = true;

    fixture.detectChanges();

    const header: HTMLElement = global.document.querySelector('h2');
    expect(header.classList).toContain('preview-header-text');
    expect(header.children[0].textContent.toLowerCase()).toMatch(text);
  });

  test('should render template with button and timer not expired', (): void => {
    const text: string = 'test-text';
    component.headerText = text;
    component.isPreview = false;
    component.isExpired = true;

    fixture.detectChanges();

    const button: HTMLElement = fixture.debugElement.query(By.css('button')).nativeElement;
    expect(button.classList).toContain('button');
    expect(button.classList).toContain('expand-button');
    expect(button.classList).toContain('timer-expired');
    const icon: HTMLElement = global.document.querySelector('ion-icon');
    expect(icon['color']).toMatch('accent');
    expect(icon['name']).toMatch('checkmark-circle-outline');
    const span: HTMLElement = global.document.querySelector('span');
    expect(span.textContent.toLowerCase()).toMatch(text);
  });

  test('should render template with button and timer expired', (): void => {
    const text: string = 'test-text';
    component.headerText = text;
    component.isPreview = false;
    component.isExpired = false;

    fixture.detectChanges();

    const button: HTMLElement = fixture.debugElement.query(By.css('button')).nativeElement;
    expect(button.classList).toContain('button');
    expect(button.classList).toContain('expand-button');
    expect(button.classList).not.toContain('timer-expired');
    const icon: HTMLElement = global.document.querySelector('ion-icon');
    expect(icon['color']).toMatch('primary');
    expect(icon['name']).toMatch('document-text-outline');
    const span: HTMLElement = global.document.querySelector('span');
    expect(span.textContent.toLowerCase()).toMatch(text);
  });

});
