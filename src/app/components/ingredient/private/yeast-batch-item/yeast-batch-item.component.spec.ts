/* Module imports */
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { By } from '@angular/platform-browser';
import { ComponentFixture, TestBed } from '@angular/core/testing';

/* Test configuration imports */
import { configureTestBed } from '../../../../../../test-config/configure-test-bed';

/* Mock imports */
import { mockYeastBatch } from '../../../../../../test-config/mock-models';

/* Interface imports */
import { YeastBatch } from '../../../../shared/interfaces';

/* Component imports */
import { YeastBatchItemComponent } from './yeast-batch-item.component';


describe('YeastBatchItemComponent', (): void => {
  configureTestBed();
  let fixture: ComponentFixture<YeastBatchItemComponent>;
  let component: YeastBatchItemComponent;
  const _mockYeastBatch: YeastBatch = mockYeastBatch()[0];

  beforeAll((done: any): Promise<void> => (async (): Promise<void> => {
    TestBed.configureTestingModule({
      declarations: [ YeastBatchItemComponent ],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
    });
    await TestBed.compileComponents();
  })()
  .then(done)
  .catch(done.fail));

  beforeEach((): void => {
    fixture = TestBed.createComponent(YeastBatchItemComponent);
    component = fixture.componentInstance;
    component.yeast = _mockYeastBatch;
    component.isLast = false;
  });

  test('should create the component', (): void => {
    fixture.detectChanges();

    expect(component).toBeDefined();
  });

  test('should emit open ingredient form event', (): void => {
    component.openIngredientFormButtonEvent.emit = jest.fn();
    const emitSpy: jest.SpyInstance = jest.spyOn(component.openIngredientFormButtonEvent, 'emit');

    fixture.detectChanges();

    component.openIngredientFormModal();
    expect(emitSpy).toHaveBeenCalled();
  });

  test('should render the template', (): void => {
    component.isLast = true;

    fixture.detectChanges();

    const button: HTMLElement = fixture.debugElement.query(By.css('button')).nativeElement;
    expect(button.classList).not.toContain('border-bottom-medium');
    const icon: HTMLElement = global.document.querySelector('ion-icon');
    expect(icon.getAttribute('name')).toMatch('create-outline');
    const cols: NodeList = global.document.querySelectorAll('ion-col');
    expect(cols.item(2).textContent).toMatch(_mockYeastBatch.yeastType.name);
    expect(cols.item(3).textContent).toMatch(_mockYeastBatch.quantity.toString());
    expect(cols.item(4).textContent.toLowerCase()).toMatch(_mockYeastBatch.yeastType.form);
    expect(cols.item(5).textContent).toMatch('Starter Not Required');
  });
});
