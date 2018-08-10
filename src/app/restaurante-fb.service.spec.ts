import { TestBed, inject } from '@angular/core/testing';

import { RestauranteFbService } from './restaurante-fb.service';

describe('RestauranteFbService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [RestauranteFbService]
    });
  });

  it('should be created', inject([RestauranteFbService], (service: RestauranteFbService) => {
    expect(service).toBeTruthy();
  }));
});
