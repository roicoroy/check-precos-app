import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Observable, Subject, debounceTime, takeUntil } from 'rxjs';
import { IProduct } from '../app.interface';
import { SearchService } from './search.service';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { HomeService } from '../home/home.service';
import { Router } from '@angular/router';
import { PipesModule } from 'src/pipes.module';
import { SearchModule } from './search.module';

@Component({
  selector: 'app-search',
  templateUrl: './search.page.html',
  styleUrls: ['./search.page.scss'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.Default,
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ScrollingModule,
    PipesModule,
  ],
})
export class SearchPage implements OnInit, OnDestroy {

  items = ["Kyle", "Eric", "Bailey", "Deborah", "Glenn", "Jaco", "Joni", "Gigi"]

  term?: string;

  searchTerm: string = '';

  searchControl: FormControl;

  productsList: IProduct[] = [];

  products$?: Observable<IProduct[]>;

  data$?: Observable<any>;

  loading: any;

  private readonly subscription = new Subject();

  constructor(
    public searchService: SearchService,
    public homeService: HomeService,
    private router: Router,
  ) {
    this.searchControl = new FormControl();
  }

  ngOnInit() {
    this.searchService.init();

    this.products$ = this.searchService.SearchProducts;

    this.searchControl.valueChanges
      .pipe(
        debounceTime(1000),
        takeUntil(this.subscription),
      )
      .subscribe((search: string) => {
        this.setFilteredProducts(search);
      });
  }

  ngOnDestroy(): void {
    this.subscription.next(null);
    this.subscription.complete();
  }

  async setFilteredProducts(searchTerm: string) {
    this.searchService.filterProducts(searchTerm);
  }

  back() {
    this.router.navigateByUrl('home');
  }
}
