import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RestauranteAddComponent } from './restaurante-add.component';

describe('RestauranteAddComponent', () => {
  let component: RestauranteAddComponent;
  let fixture: ComponentFixture<RestauranteAddComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RestauranteAddComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RestauranteAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
