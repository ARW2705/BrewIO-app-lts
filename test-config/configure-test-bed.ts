import { ComponentFixture, TestBed, getTestBed, TestBedStatic } from '@angular/core/testing';

export const configureTestBed = () => {
  const testBed: any = getTestBed();
  const originalReset: () => TestBedStatic = TestBed.resetTestingModule;

  beforeAll(() => {
    TestBed.resetTestingModule();
    TestBed.resetTestingModule = () => TestBed;
  });

  afterEach(() => {
    testBed._activeFixtures.forEach((fixture: ComponentFixture<any>) => fixture.destroy());
    testBed._instantiated = false;
  });

  afterAll(() => {
    TestBed.resetTestingModule = originalReset;
    TestBed.resetTestingModule();
  });
};
