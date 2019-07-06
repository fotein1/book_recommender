import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BooksRecommendationComponent } from './books-recommendation.component';

describe('BooksRecommendationComponent', () => {
  let component: BooksRecommendationComponent;
  let fixture: ComponentFixture<BooksRecommendationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BooksRecommendationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BooksRecommendationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
