import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Usermanage } from './usermanage';

describe('Usermanage', () => {
  let component: Usermanage;
  let fixture: ComponentFixture<Usermanage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Usermanage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Usermanage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
