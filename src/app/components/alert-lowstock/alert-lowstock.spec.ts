import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AlertLowstock } from './alert-lowstock';

describe('AlertLowstock', () => {
  let component: AlertLowstock;
  let fixture: ComponentFixture<AlertLowstock>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AlertLowstock]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AlertLowstock);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
