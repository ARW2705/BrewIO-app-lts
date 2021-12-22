/* Module imports */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { of, throwError } from 'rxjs';

/* Test Configuration imports */
import { configureTestBed } from '../../../../../../test-config/configure-test-bed';

/* Mock imports */
import { ErrorReportingServiceStub, LibraryServiceStub, ModalServiceStub } from '../../../../../../test-config/service-stubs';
import { TruncatePipeStub } from '../../../../../../test-config/pipe-stubs';
import { mockRecipeMasterActive, mockStyles } from '../../../../../../test-config/mock-models';

/* Interface imports */
import { RecipeMaster, Style } from '../../../../shared/interfaces';

/* Service imports */
import { ErrorReportingService, LibraryService, ModalService } from '../../../../services/services';

/* Component imports */
import { GeneralFormButtonComponent } from './general-form-button.component';
import { GeneralFormComponent } from '../general-form/general-form.component';


describe('GeneralFormButtonComponent', () => {
  configureTestBed();
  let component: GeneralFormButtonComponent;
  let fixture: ComponentFixture<GeneralFormButtonComponent>;
  let originalOnInit: () => void;

  beforeAll((done: any): Promise<void> => (async (): Promise<void> => {
    TestBed.configureTestingModule({
      declarations: [
        GeneralFormButtonComponent,
        TruncatePipeStub
      ],
      providers: [
        { provide: ErrorReportingService, useClass: ErrorReportingServiceStub },
        { provide: LibraryService, useClass: LibraryServiceStub },
        { provide: ModalService, useClass: ModalServiceStub }
      ],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
    });
    await TestBed.compileComponents();
  })()
  .then(done)
  .catch(done.fail));

  beforeEach((): void => {
    fixture = TestBed.createComponent(GeneralFormButtonComponent);
    component = fixture.componentInstance;
    originalOnInit = component.ngOnInit;
    component.errorReporter.handleUnhandledError = jest.fn();
    component.ngOnInit = jest.fn();
    const _mockRecipeMasterActive: RecipeMaster = mockRecipeMasterActive();
    component.master = _mockRecipeMasterActive;
    component.variant = _mockRecipeMasterActive.variants[0];
    component.generalFormEvent.emit = jest.fn();
    TruncatePipeStub._returnValue = (value: number): string => value.toString();
  });

  test('should create the component', (): void => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  test('should init the component', (): void => {
    component.ngOnInit = originalOnInit;
    component.getStyleLibrary = jest.fn();
    const getSpy: jest.SpyInstance = jest.spyOn(component, 'getStyleLibrary');

    fixture.detectChanges();

    expect(getSpy).toHaveBeenCalled();
  });

  test('should get style library', (done: jest.DoneCallback): void => {
    const _mockStyles: Style[] = mockStyles();
    component.libraryService.getStyleLibrary = jest.fn()
      .mockReturnValue(of(_mockStyles));

    fixture.detectChanges();

    expect(component.styleLibrary).toBeNull();
    component.getStyleLibrary();
    setTimeout((): void => {
      expect(component.styleLibrary).toStrictEqual(_mockStyles);
      done();
    }, 10);
  });

  test('should handle error getting style library', (done: jest.DoneCallback): void => {
    const _mockError: Error = new Error('test-error');
    component.libraryService.getStyleLibrary = jest.fn()
      .mockReturnValue(throwError(_mockError));
    const errorSpy: jest.SpyInstance = jest.spyOn(component.errorReporter, 'handleUnhandledError');

    fixture.detectChanges();

    component.getStyleLibrary();
    setTimeout((): void => {
      expect(errorSpy).toHaveBeenCalledWith(_mockError);
      done();
    }, 10);
  });

  test('should get general form modal options for new recipe master', (): void => {
    component.getGeneralFormModalUpdateData = jest.fn()
      .mockReturnValue({});
    component.formType = 'master';
    component.docMethod = 'create';
    component.isGeneralFormComplete = false;
    const _mockStyles: Style[] = mockStyles();
    component.styleLibrary = _mockStyles;

    fixture.detectChanges();

    expect(component.getGeneralFormModalOptions()).toStrictEqual({
      formType: 'master',
      docMethod: 'create',
      update: {},
      styles: _mockStyles
    });
  });

  test('should get general form modal options for recipe master update', (): void => {
    component.getGeneralFormModalUpdateData = jest.fn()
      .mockReturnValue({});
    component.formType = 'master';
    component.docMethod = 'update';
    component.isGeneralFormComplete = true;
    const _mockStyles: Style[] = mockStyles();
    component.styleLibrary = _mockStyles;

    fixture.detectChanges();

    expect(component.getGeneralFormModalOptions()).toStrictEqual({
      formType: 'master',
      docMethod: 'update',
      update: { name: component.master.name },
      styles: _mockStyles
    });
  });

  test('should get general form modal options for recipe variant', (): void => {
    component.getGeneralFormModalUpdateData = jest.fn()
      .mockReturnValue({});
    component.formType = 'variant';
    component.docMethod = 'update';
    component.isGeneralFormComplete = true;

    fixture.detectChanges();

    expect(component.getGeneralFormModalOptions()).toStrictEqual({
      formType: 'variant',
      docMethod: 'update',
      update: { variantName: component.variant.variantName }
    });
  });

  test('should get general form modal update data', (): void => {
    component.isGeneralFormComplete = false;
    component.formType = 'variant';

    fixture.detectChanges();

    expect(component.getGeneralFormModalUpdateData()).toStrictEqual({
      batchVolume: component.variant.batchVolume,
      boilDuration: component.variant.boilDuration,
      boilVolume: component.variant.boilVolume,
      brewingType: component.variant.brewingType,
      efficiency: component.variant.efficiency,
      isFavorite: component.variant.isFavorite,
      isMaster: component.variant.isMaster,
      labelImage: component.master.labelImage,
      mashDuration: component.variant.mashDuration,
      mashVolume: component.variant.mashVolume,
      style: component.master.style
    });
    component.formType = 'master';
    expect(component.getGeneralFormModalUpdateData()).toBeNull();
  });

  test('should open general form modal and handle result', (done: jest.DoneCallback): void => {
    component.getGeneralFormModalOptions = jest.fn()
      .mockReturnValue({});
    component.modalService.openModal = jest.fn()
      .mockReturnValue(of({ test: true }));
    const modalSpy: jest.SpyInstance = jest.spyOn(component.modalService, 'openModal');
    const emitSpy: jest.SpyInstance = jest.spyOn(component.generalFormEvent, 'emit');

    fixture.detectChanges();

    component.openGeneralFormModal();
    setTimeout((): void => {
      expect(modalSpy).toHaveBeenCalledWith(GeneralFormComponent, {});
      expect(emitSpy).toHaveBeenCalledWith({ test: true });
      done();
    }, 10);
  });

  test('should open general form modal and handle error', (done: jest.DoneCallback): void => {
    component.getGeneralFormModalOptions = jest.fn()
      .mockReturnValue({});
    const _mockError: Error = new Error('test-error');
    component.modalService.openModal = jest.fn()
      .mockReturnValue(throwError(_mockError));
    const modalSpy: jest.SpyInstance = jest.spyOn(component.modalService, 'openModal');
    const emitSpy: jest.SpyInstance = jest.spyOn(component.generalFormEvent, 'emit');
    component.errorReporter.handleUnhandledError = jest.fn();
    const errorSpy: jest.SpyInstance = jest.spyOn(component.errorReporter, 'handleUnhandledError');

    fixture.detectChanges();

    component.openGeneralFormModal();
    setTimeout((): void => {
      expect(modalSpy).toHaveBeenCalledWith(GeneralFormComponent, {});
      expect(emitSpy).not.toHaveBeenCalled();
      expect(errorSpy).toHaveBeenCalledWith(_mockError);
      done();
    }, 10);
  });

  test('should render the template as new recipe master', (): void => {
    component.getStyleLibrary = jest.fn();
    component.ngOnInit = originalOnInit;
    const _mockRecipeMasterActive: RecipeMaster = mockRecipeMasterActive();
    _mockRecipeMasterActive.name = '';
    component.formType = 'master';
    component.master = _mockRecipeMasterActive;
    component.variant = _mockRecipeMasterActive.variants[0];

    fixture.detectChanges();

    const rows: NodeList = fixture.nativeElement.querySelectorAll('ion-row');
    const firstRow: Element = <Element>rows.item(0);
    expect(firstRow.textContent).toMatch('Tap Here To Begin');
    const secondRow: Element = <Element>rows.item(1);
    const firstSpan: Element = secondRow.children[0];
    expect(firstSpan.textContent).toMatch(`${_mockRecipeMasterActive.variants[0].ABV}% ABV`);
    const secondSpan: Element = secondRow.children[1];
    expect(secondSpan.textContent).toMatch(_mockRecipeMasterActive.style.name);
  });

  test('should render the template as update recipe master', (): void => {
    component.getStyleLibrary = jest.fn();
    component.ngOnInit = originalOnInit;
    const _mockRecipeMasterActive: RecipeMaster = mockRecipeMasterActive();
    component.formType = 'master';
    component.master = _mockRecipeMasterActive;
    component.variant = _mockRecipeMasterActive.variants[0];

    fixture.detectChanges();

    const rows: NodeList = fixture.nativeElement.querySelectorAll('ion-row');
    const firstRow: Element = <Element>rows.item(0);
    expect(firstRow.textContent.toLowerCase()).toMatch(_mockRecipeMasterActive.name);
    const secondRow: Element = <Element>rows.item(1);
    const firstSpan: Element = secondRow.children[0];
    expect(firstSpan.textContent).toMatch(`${_mockRecipeMasterActive.variants[0].ABV}% ABV`);
    const secondSpan: Element = secondRow.children[1];
    expect(secondSpan.textContent).toMatch(_mockRecipeMasterActive.style.name);
  });

  test('should render the template as new recipe variant', (): void => {
    component.getStyleLibrary = jest.fn();
    component.ngOnInit = originalOnInit;
    const _mockRecipeMasterActive: RecipeMaster = mockRecipeMasterActive();
    _mockRecipeMasterActive.variants[0].variantName = '';
    component.formType = 'variant';
    component.master = _mockRecipeMasterActive;
    component.variant = _mockRecipeMasterActive.variants[0];

    fixture.detectChanges();

    const rows: NodeList = fixture.nativeElement.querySelectorAll('ion-row');
    const firstRow: Element = <Element>rows.item(0);
    expect(firstRow.textContent).toMatch('Tap Here To Begin');
    const secondRow: Element = <Element>rows.item(1);
    const firstSpan: Element = secondRow.children[0];
    expect(firstSpan.textContent).toMatch(`${_mockRecipeMasterActive.variants[0].ABV}% ABV`);
    const secondSpan: Element = secondRow.children[1];
    expect(secondSpan.textContent).toMatch(_mockRecipeMasterActive.style.name);
  });

  test('should render the template as update recipe variant', (): void => {
    component.getStyleLibrary = jest.fn();
    component.ngOnInit = originalOnInit;
    const _mockRecipeMasterActive: RecipeMaster = mockRecipeMasterActive();
    component.formType = 'variant';
    component.master = _mockRecipeMasterActive;
    component.variant = _mockRecipeMasterActive.variants[0];

    fixture.detectChanges();

    const rows: NodeList = fixture.nativeElement.querySelectorAll('ion-row');
    const firstRow: Element = <Element>rows.item(0);
    expect(firstRow.textContent.toLowerCase()).toMatch(_mockRecipeMasterActive.variants[0].variantName);
    const secondRow: Element = <Element>rows.item(1);
    const firstSpan: Element = secondRow.children[0];
    expect(firstSpan.textContent).toMatch(`${_mockRecipeMasterActive.variants[0].ABV}% ABV`);
    const secondSpan: Element = secondRow.children[1];
    expect(secondSpan.textContent).toMatch(_mockRecipeMasterActive.style.name);
  });

});
