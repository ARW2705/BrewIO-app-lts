/* Module imports */
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { DebugElement, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { By } from '@angular/platform-browser';

/* Test configuration imports */
import { configureTestBed } from '../../../../test-config/configure-test-bed';

/* Component imports */
import { AccordionComponent } from './accordion.component';


describe('AccordionComponent', (): void => {
  let fixture: ComponentFixture<AccordionComponent>;
  let accordionCmp: AccordionComponent;
  configureTestBed();

  beforeAll((done: any): Promise<void> => (async (): Promise<void> => {
    TestBed.configureTestingModule({
      imports: [ NoopAnimationsModule ],
      declarations: [ AccordionComponent ],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
    });
    await TestBed.compileComponents();
  })()
  .then(done)
  .catch(done.fail));

  beforeEach((): void => {
    fixture = TestBed.createComponent(AccordionComponent);
    accordionCmp = fixture.componentInstance;
  });

  test('should create the component', (): void => {
    fixture.detectChanges();

    expect(accordionCmp).toBeDefined();
  });

  test('should toggle expansion', (): void => {
    fixture.detectChanges();

    const divElement: DebugElement = fixture.debugElement.query(By.css('.accordion'));

    expect(divElement.properties['@expandUpDown'].value).toMatch('collapsed');
    expect(divElement.properties['@expandUpDown'].params.maxHeight).toBe(0);

    accordionCmp.expanded = true;
    accordionCmp.ngOnChanges();
    fixture.detectChanges();

    expect(divElement.properties['@expandUpDown'].value).toMatch('expanded');
    expect(divElement.properties['@expandUpDown'].params.speed).toEqual(250);
    expect(divElement.properties['@expandUpDown'].params.maxHeight).toEqual(2000);

    accordionCmp.expanded = false;
    accordionCmp.ngOnChanges();
    fixture.detectChanges();

    expect(divElement.properties['@expandUpDown'].value).toMatch('collapsed');
    expect(divElement.properties['@expandUpDown'].params.speed).toEqual(250);
    expect(divElement.properties['@expandUpDown'].params.maxHeight).toEqual(0);
  });

});
