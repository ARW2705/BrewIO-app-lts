/* Module imports */
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ModalController } from '@ionic/angular';

/* Test configuration imports */
import { configureTestBed } from '../../../../test-config/configure-test-bed';

/* Mock imports */
import { ModalControllerMock, ModalMock } from '../../../../test-config/mocks-ionic';

/* Component imoprts */
import { QuantityHelperComponent } from './quantity-helper.component';


describe('QuantityHelperComponent', (): void => {
  let fixture: ComponentFixture<QuantityHelperComponent>;
  let qhCmp: QuantityHelperComponent;
  configureTestBed();

  beforeEach((done: any): Promise<void> => (async (): Promise<void> => {
    TestBed.configureTestingModule({
      declarations: [ QuantityHelperComponent ],
      providers: [
        { provide: ModalController, useClass: ModalControllerMock }
      ],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
    });
    await TestBed.compileComponents();
  })()
  .then(done)
  .catch(done.fail));

  beforeEach((): void => {
    fixture = TestBed.createComponent(QuantityHelperComponent);
    qhCmp = fixture.componentInstance;
  });

  test('should create the component', (): void => {
    fixture.detectChanges();

    expect(qhCmp).toBeTruthy();
  });
});
