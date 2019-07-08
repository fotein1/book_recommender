import { TestBed } from '@angular/core/testing';

import { RateBooksService } from './rate-books.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';

describe('RateBooksService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: RateBooksService = TestBed.get(RateBooksService);
    expect(service).toBeTruthy();
  });
});
