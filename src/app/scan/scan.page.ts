import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AlertController, IonSearchbar, IonicModule, LoadingController } from '@ionic/angular';
import { Barcode, BarcodeScanner } from '@capacitor-mlkit/barcode-scanning';
import { Observable, Subject, combineLatest, debounceTime, defer, distinctUntilChanged, from, map, merge, of, share, startWith, switchMap, takeUntil, tap } from 'rxjs';
import { PrecosService } from '../precos.service';
import { ESTOQUE, FIREBIRD_PRICE_LIST, IProduct, PRICE_LIST } from '../app.interface';
import * as XLSX from 'xlsx';
import { Router } from '@angular/router';

@Component({
  selector: 'app-scan',
  templateUrl: './scan.page.html',
  styleUrls: ['./scan.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, ReactiveFormsModule]
})
export class ScanPage implements OnInit {

  @ViewChild('searchInput', { static: false }) searchInput!: IonSearchbar;

  searchField: FormControl;

  productList$: Observable<any> | any;

  products: IProduct[] = [];

  public searchControl: FormControl | any;
  public searchResults$: Observable<IProduct[]> | any;
  public areMinimumCharactersTyped$: Observable<boolean> | any;
  public areNoResultsFound$: Observable<boolean> | any;



  isSupported = false;
  barcodes: Barcode[] = [];
  productsList: [] = [];
  product: any;
  searchTerm: string = '';
  isLoading = false;

  items: any = [];
  loading: any;

  private readonly ngUnsubscribe = new Subject();

  constructor(
    private alertController: AlertController,
    private pricesService: PrecosService,
    private loadingCtrl: LoadingController,
    private router: Router,
    private formBuilder: FormBuilder
  ) {
    this.searchField = new FormControl('');
  }

  async ngOnInit() {
    // this.loading = await this.loadingCtrl.create({});
    // await this.loading.present();

    this.searchControl = this.formBuilder.control("");

    this.areMinimumCharactersTyped$ = this.searchControl.valueChanges.pipe(
      map((searchString: any) => searchString.length >= 3)
    );

    const searchString$ = merge(
      defer(() => of(this.searchControl.value)),
      this.searchControl.valueChanges
    ).pipe(
      debounceTime(1000),
      distinctUntilChanged()
    );

    this.searchResults$ = searchString$.pipe(
      switchMap((searchString: string) =>
        this.search(searchString)
      ),
      share()
    );

    this.areNoResultsFound$ = this.searchResults$.pipe(
      map((results: any) => results.length === 0)
    );

    this.pricesService
      .getKeyAsObservable(ESTOQUE)
      .pipe()
      .subscribe(async (file) => {
        // this.myData = result;
        if (file != null) {
          this.renderExcelJson(file);
          // await this.loading.dismiss();
        }
        // else {
        //   await this.loading.dismiss();
        // }
      });



    // this.produictList$ = combineLatest([foodList$, searchTerm$]).pipe(
    //   map(([foodList, searchTerm]) => {

    //   }        
    //   )
    // );

    const device = await this.pricesService.getDeviceInfo();
    if (device.platform === 'android' || device.platform === 'ios') {
      BarcodeScanner.isSupported().then((result: { supported: boolean; }) => {
        this.isSupported = result.supported;
      });
    }
  }


  search(searchString: string): Observable<IProduct[]> {
    return of([
      this.products
    ]).pipe(
      map((results: any) =>
        results.filter((EAN13: string) =>
          EAN13.toLowerCase().includes(searchString.toLowerCase())
        )
      ),
      tap((results: any) => console.log("Mock API was called!", results))
    );
  }


  async renderExcelJson(file: any) {
    const f = await (file).arrayBuffer();
    const wb = XLSX.read(f);
    this.products = XLSX.utils.sheet_to_json<any>(wb.Sheets[wb.SheetNames[0]]);
    if (this.loading) {
      await this.loading.dismiss();
    }
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next(null);
    this.ngUnsubscribe.complete();
  }

  async clearStorage() {
    this.searchInput.value = '';
    this.product = null;
    // this.pricesService.storageRemove(PRICE_LIST);
    // this.pricesService.storageRemove(FIREBIRD_PRICE_LIST);
  }

  async searchProduct(): Promise<void> {
    this.product = null;
    this.productsList.forEach((prod: any) => {
      if (prod.EAN13 == this.searchInput.value) {
        this.product = prod;
        this.searchInput.value = '';
      }
    });
  }

  async scan(): Promise<void> {
    this.product = null;
    this.searchInput.value = '';
    this.barcodes = [];

    const granted = await this.requestPermissions();

    if (!granted) {
      this.presentAlert();
      return;
    }

    const { barcodes } = await BarcodeScanner.scan();

    this.barcodes.push(...barcodes);
    await this.presentLoading();

    this.productsList.forEach(async (prod: any) => {
      if (prod.CODIGO == barcodes[0].rawValue || prod.EAN13 == barcodes[0].rawValue) {
        this.product = prod;
        await this.dismissLoading();
      } else {
        await this.dismissLoading();
      }
    });

    if (this.product == null) {
      this.produtoNaoCadastradoAlert();
    }
  }

  async requestPermissions(): Promise<boolean> {
    const { camera } = await BarcodeScanner.requestPermissions();
    return camera === 'granted' || camera === 'limited';
  }

  async produtoNaoCadastradoAlert(): Promise<void> {
    const alert = await this.alertController.create({
      message: 'produto nao cadastrado',
      buttons: ['OK'],
    });
    await alert.present();
  }

  async presentAlert(): Promise<void> {
    const alert = await this.alertController.create({
      header: 'Permission denied',
      message: 'Please grant camera permission to use the barcode scanner.',
      buttons: ['OK'],
    });
    await alert.present();
  }

  async presentLoading(content?: any) {
    this.isLoading = true;
    return await this.loadingCtrl.create({
      cssClass: 'my-custom-class',
      // message: content,
      spinner: 'circles',
    }).then(async (loader: { present: () => Promise<any>; dismiss: () => Promise<any>; }) => {
      await loader.present().then((resp: any) => {
        if (!this.isLoading) {
          loader.dismiss().then(() => { });
        }
      });
    });
  }

  async dismissLoading() {
    this.isLoading = false;
    return await this.loadingCtrl.dismiss();
  }
  
  back() {
    this.router.navigateByUrl('home');
  }
}
