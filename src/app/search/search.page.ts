import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule, LoadingController, NavController } from '@ionic/angular';
import { Observable, Subject, catchError, debounceTime, takeUntil, throwError } from 'rxjs';
import { IProduct } from '../app.interface';
import { DataProvider } from './data.service';
import { ScrollingModule } from '@angular/cdk/scrolling';

@Component({
  selector: 'app-search',
  templateUrl: './search.page.html',
  styleUrls: ['./search.page.scss'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ScrollingModule
  ]
})
export class SearchPage implements OnInit, OnDestroy {
  searchTerm: string = '';
  searchControl: FormControl;
  searching: boolean = false;
  productsList: IProduct[] = [];
  products?: Observable<IProduct[]>;
  loading: any;
  items: any;
  private readonly ngUnsubscribe = new Subject();
  constructor(
    public navCtrl: NavController,
    public dataService: DataProvider,
    private loadingCtrl: LoadingController,
  ) {
    this.searchControl = new FormControl();
  }

  async ngOnInit() {

    // this.setFilteredProducts('');

    // this.searchControl.valueChanges
    //   .pipe(
    //     debounceTime(700),
    //     catchError(err => {
    //       const error = throwError(() => new Error(JSON.stringify(err)));
    //       return error;
    //     }),
    //     takeUntil(this.ngUnsubscribe),
    //   )
    //   .subscribe((search: any) => {
    //     return this.setFilteredProducts(search);
    //   });


    this.items = Array.from({ length: 100000 }).map((_, i) => `Item #${i}`);

    // this.products = this.dataService.Products$;
    this.dataService.Products$?.subscribe((p)=>{
      console.log('asd', p);
    });

    // if (this.products != null) {
    //   // this.products.subscribe((p: any) => {
    //   //   console.log(p); 
    //   // });
    // }
    // console.log(this.items);

 
  }
  ngOnDestroy(): void {
    this.ngUnsubscribe.next(null);
    this.ngUnsubscribe.complete();
  }

  async setFilteredProducts(searchTerm: string) {
    console.log(searchTerm);

    const loading = await this.loadingCtrl.create({});
    await loading.present();

    this.productsList = await this.dataService.filterProducts(searchTerm);
    // const productsList: any = await this.dataService.filterProducts(searchTerm);
    // this.productsList = Array.from(productsList);

    // .map((product: any, i) => {
    //   return product;
    // });
    // console.log(this.productsList);

    await loading.dismiss();

    // try {
    //   this.productsList = await this.dataService.filterProducts(searchTerm);
    //   await loading.dismiss();
    // } catch (err) {
    //   const error = throwError(() => new Error(JSON.stringify(err)));
    //   await loading.dismiss();
    //   return error;
    // }
  }

}
