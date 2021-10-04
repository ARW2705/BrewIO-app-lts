/* Module imports */
import { ComponentFixture, TestBed } from '@angular/core/testing';

/* Test configuration imports */
import { configureTestBed } from '../../../../../../test-config/configure-test-bed';

/* Mock imports */
import { mockProgressCircle } from '../../../../../../test-config/mock-models';

/* Interface imports */
import { ProgressCircleSettings } from '../../../../shared/interfaces';

/* Component imports */
import { ProgressCircleComponent } from './progress-circle.component';


describe('ProgressCircleComponent', (): void => {
  let fixture: ComponentFixture<ProgressCircleComponent>;
  let circleCmp: ProgressCircleComponent;
  configureTestBed();

  beforeAll((done: any): Promise<void> => (async (): Promise<void> => {
    TestBed.configureTestingModule({
      declarations: [ ProgressCircleComponent ]
    });
    await TestBed.compileComponents();
  })()
  .then(done)
  .catch(done.fail));

  beforeEach((): void => {
    fixture = TestBed.createComponent(ProgressCircleComponent);
    circleCmp = fixture.componentInstance;
  });

  test('should create the component', (): void => {
    fixture.detectChanges();

    expect(circleCmp).toBeDefined();
  });

  test('should render a progress circle with no button', (): void => {
    const _mockProgressCircle: ProgressCircleSettings = mockProgressCircle();

    circleCmp.settings = _mockProgressCircle;
    circleCmp.showButton = false;

    fixture.detectChanges();

    const svg: HTMLElement = fixture.nativeElement.querySelector('svg');
    expect(parseInt(svg.attributes.getNamedItem('height').value, 10)).toEqual(_mockProgressCircle.height);
    expect(parseInt(svg.attributes.getNamedItem('width').value, 10)).toEqual(_mockProgressCircle.width);

    // circle element
    Array.from(svg.children[0].attributes)
      .forEach((attr: Attr): void => {
        if (_mockProgressCircle.circle.hasOwnProperty(attr.name)) {
          const typeName: string = typeof _mockProgressCircle.circle[attr.name];
          if (typeName === 'number') {
            expect(_mockProgressCircle.circle[attr.name]).toEqual(attr.value);
          } else if (typeName === 'string') {
            expect(_mockProgressCircle.circle[attr.name]).toMatch(attr.value);
          }
        }
      });

    // text element
    expect(svg.children[1].textContent).toMatch(_mockProgressCircle.text.content);
    Array.from(svg.children[1].attributes)
      .forEach((attr: Attr): void => {
        if (_mockProgressCircle.text.hasOwnProperty(attr.name)) {
          expect(_mockProgressCircle.text[attr.name]).toMatch(attr.value);
        }
      });

    expect(svg.children.length).toEqual(2);
  });

  test('should render a progress circle with a button', (): void => {
    const _mockProgressCircle: ProgressCircleSettings = mockProgressCircle();

    circleCmp.settings = _mockProgressCircle;
    circleCmp.showButton = true;
    circleCmp.chevronPath = 'M1 L2 3';

    fixture.detectChanges();

    const svg: HTMLElement = fixture.nativeElement.querySelector('svg');
    expect(parseInt(svg.attributes.getNamedItem('height').value, 10)).toEqual(_mockProgressCircle.height);
    expect(parseInt(svg.attributes.getNamedItem('width').value, 10)).toEqual(_mockProgressCircle.width);

    // button path
    Array.from(svg.children[2].attributes)
      .forEach((attr: Attr): void => {
        switch (attr.name) {
          case 'd':
            expect(attr.value).toMatch('M1 L2 3');
            break;
          case 'stroke-width':
            expect(parseFloat(attr.value)).toEqual(_mockProgressCircle.circle.strokeWidth / 2);
            break;
          case 'stroke':
            expect(attr.value).toMatch('var(--ion-color-primary)');
            break;
          case 'stroke-linecap':
            expect(attr.value).toMatch('round');
            break;
          case 'fill':
            expect(attr.value).toMatch('transparent');
            break;
          default:
            break;
        }
      });

    expect(svg.children.length).toEqual(3);
  });

});
