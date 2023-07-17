import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormsModule } from '@angular/forms';
import { AlertController, IonSearchbar, IonicModule, LoadingController } from '@ionic/angular';
import { Barcode, BarcodeScanner } from '@capacitor-mlkit/barcode-scanning';
import { Subject, takeUntil } from 'rxjs';
import { PrecosService } from '../precos.service';

const PRICE_LIST = 'priceList';
const FIREBIRD_PRICE_LIST = 'priceList';

@Component({
  selector: 'app-scan',
  templateUrl: './scan.page.html',
  styleUrls: ['./scan.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class ScanPage implements OnInit {

  @ViewChild('searchInput', { static: false }) searchInput!: IonSearchbar;

  searchControl: FormControl;
  isSupported = false;
  barcodes: Barcode[] = [];
  productsList: [] = [];
  product: any;
  searchTerm: string = '';
  isLoading = false;

  items: any = [];
  search: any;

  private readonly ngUnsubscribe = new Subject();

  constructor(
    private alertController: AlertController,
    private pricesService: PrecosService,
    private loadingCtrl: LoadingController,
  ) {
    this.searchControl = new FormControl();
  }

  async ngOnInit() {
    // this.startServiceFirebird();
    // this.startServiceExcell();
    const device = await this.pricesService.getDeviceInfo();
    if (device.platform === 'android' || device.platform === 'ios') {
      BarcodeScanner.isSupported().then((result: { supported: boolean; }) => {
        this.isSupported = result.supported;
      });
    }
  }

  async startServiceFirebird() {
    return this.pricesService.getKeyAsObservable(FIREBIRD_PRICE_LIST)
      .pipe(
        takeUntil(this.ngUnsubscribe)
      )
      .subscribe(async (pricesList) => {
        if (pricesList === null) {
          this.pricesService.getPricesFirebird()
            .pipe(
              takeUntil(this.ngUnsubscribe)
            )
            .subscribe(async (products: any) => {
              console.log(products);
              if (products) {
                // this.productsList = products;
                this.pricesService.storageSet(FIREBIRD_PRICE_LIST, products);
              }
            });
        } else if (pricesList !== null) {
          this.productsList = pricesList;
          // console.log('this.productsList', this.productsList);
          await this.dismissLoading();
        }
      });
  }

  async startServiceExcell() {
    await this.presentLoading();

    return this.pricesService.getKeyAsObservable(PRICE_LIST)
      .pipe(
        takeUntil(this.ngUnsubscribe)
      )
      .subscribe(async (pricesList) => {
        // console.log(pricesList);
        if (pricesList === null) {
          this.pricesService.getPricesExcel()
            .pipe(
              takeUntil(this.ngUnsubscribe)
            )
            .subscribe(async (products: any) => {
              if (products.Plan1) {
                this.productsList = products.Plan1;
                this.pricesService.storageSet(PRICE_LIST, this.productsList);
                await this.dismissLoading();
              }
            });
        } else if (pricesList !== null) {
          this.productsList = pricesList;
          await this.dismissLoading();
          // console.log('this.productsList', this.productsList);
        }
      });
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next(null);
    this.ngUnsubscribe.complete();
  }

  async clearStorage() {
    this.searchInput.value = '';
    this.product = null;
    this.pricesService.storageRemove(PRICE_LIST);
    this.pricesService.storageRemove(FIREBIRD_PRICE_LIST);
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
  

}
