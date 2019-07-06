import { TestBed } from '@angular/core/testing';

import { RecommendaationsService } from './recommendaations.service';

describe('RecommendaationsService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: RecommendaationsService = TestBed.get(RecommendaationsService);
    expect(service).toBeTruthy();
  });
});
