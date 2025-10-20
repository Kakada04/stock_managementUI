import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TopSelling } from './top-selling';

describe('TopSelling', () => {
  let component: TopSelling;
  let fixture: ComponentFixture<TopSelling>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TopSelling]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TopSelling);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
