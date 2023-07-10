import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { Barcode, BarcodeScanner } from '@capacitor-mlkit/barcode-scanning';
import { AlertController, IonSearchbar, IonicModule, LoadingController } from '@ionic/angular';
import { PrecosService } from '../precos.service';
import { Subject, debounceTime, takeUntil } from 'rxjs';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FilterPipe } from "../filter.pipe";
const PRICE_LIST = 'priceList';
@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    FilterPipe
  ]
})
export class HomePage implements OnInit {
  @ViewChild('searchInput', { static: false }) searchInput!: IonSearchbar;

  public searchControl: FormControl;

  isSupported = false;
  barcodes: Barcode[] = [];
  productsList: any;
  product: any;
  filterKeys = ['EAN13'];

  public searchTerm: string = "";

  isLoading = false;

  private readonly ngUnsubscribe = new Subject();

  public items: any = [];
  search: any;

  constructor(
    private alertController: AlertController,
    private pricesService: PrecosService,
    private loadingCtrl: LoadingController,
  ) {
    this.searchControl = new FormControl();
  }

  async ngOnInit() {
    // console.log('ddd');
    this.startServiceFirebird();
    // this.startServiceExcell();
    const device = await this.pricesService.getDeviceInfo();
    if (device.platform === 'android' || device.platform === 'ios') {
      BarcodeScanner.isSupported().then((result) => {
        this.isSupported = result.supported;
      });
    }
  }

  async startServiceFirebird() {
    this.presentLoading('');
    return this.pricesService.getKeyAsObservable(PRICE_LIST)
      .pipe(
        takeUntil(this.ngUnsubscribe)
      )
      .subscribe(async (pricesList) => {
        console.log(':::>', pricesList);
        if (pricesList === null) {
          this.pricesService.getPricesFirebird()
            .pipe(
              takeUntil(this.ngUnsubscribe)
            )
            .subscribe(async (products: any) => {
              console.log(products);
              if (products) {
                this.productsList = products;
                // // console.log(this.productsList);
                this.pricesService.storageSet(PRICE_LIST, this.productsList);
                this.dismissLoading();
              }
            });
        } else {
          this.productsList = pricesList;
          console.log('this.productsList', this.productsList);
          this.dismissLoading();
        }
      });
  }

  // startServiceExcell() {
  //   return this.pricesService.getKeyAsObservable(PRICE_LIST)
  //     .pipe(
  //       takeUntil(this.ngUnsubscribe)
  //     )
  //     .subscribe((pricesList) => {
  //       // console.log(pricesList);
  //       if (pricesList == null) {
  //         this.pricesService.getPricesExcel()
  //           .pipe(
  //             takeUntil(this.ngUnsubscribe)
  //           )
  //           .subscribe((products: any) => {

  //             this.productsList = products.Plan1;
  //             this.pricesService.storageSet(PRICE_LIST, this.productsList);
  //           });
  //       } else {
  //         this.productsList = pricesList;
  //       }
  //     });
  // }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next(null);
    this.ngUnsubscribe.complete();
  }

  async clearStorage() {
    this.searchInput.value = '';
    this.product = '';
    await this.pricesService.storageRemove(PRICE_LIST);
    // this.startServiceFirebird();
  }

  async searchProduct(): Promise<void> {
    this.product = '';
    this.productsList.forEach((prod: any) => {
      if (prod.EAN13 == this.searchInput.value) {
        this.product = prod;
        this.searchInput.value = '';
      }
    });
  }

  async scan(): Promise<void> {
    const granted = await this.requestPermissions();

    this.product = '';
    this.searchInput.value = '';
    this.barcodes = [];

    if (!granted) {
      this.presentAlert();
      return;
    }
    const { barcodes } = await BarcodeScanner.scan();
    this.barcodes.push(...barcodes);

    this.barcodes.forEach(async (barcode) => {
      console.log(barcode);
      this.productsList.forEach(async (prod: any) => {
        if (prod.EAN13 === barcode.rawValue) {
          this.product = prod;
        } else {
          this.produtoNaoCadastradoAlert();
        }
      });
    });
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
    }).then(async (loader) => {
      await loader.present().then(resp => {
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
}
