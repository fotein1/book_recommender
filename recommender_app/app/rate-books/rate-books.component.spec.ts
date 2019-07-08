import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RateBooksComponent } from './rate-books.component';

describe('RateBooksComponent', () => {
  let component: RateBooksComponent;
  let fixture: ComponentFixture<RateBooksComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RateBooksComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RateBooksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
