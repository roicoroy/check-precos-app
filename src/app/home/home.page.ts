import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { IonicModule, LoadingController } from '@ionic/angular';
import { PrecosService } from '../precos.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import * as XLSX from 'xlsx';
import { Router } from '@angular/router';
import { FileOpener } from '@awesome-cordova-plugins/file-opener/ngx';
import { File } from '@ionic-native/file/ngx';
import { ESTOQUE, ESTOQUE_JSON, IProduct } from '../app.interface';
import { HomeService } from './home.service';

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
  ],
  providers: [
    FileOpener,
    File
  ]
})
export class HomePage implements OnInit {

  products: IProduct[] = [];
  loading: any;
  localFile: any;

  constructor(
    private router: Router,
    private pricesService: PrecosService,
    public homeService: HomeService,
    private loadingCtrl: LoadingController
  ) { }

  async ngOnInit() {
    this.loading = await this.loadingCtrl.create({});
    await this.loading.present();

    this.homeService.init();

    // this.homeService.Products$?.subscribe((res) => {
    //   console.log(res);
    // });

    this.pricesService.getKeyAsObservable(ESTOQUE)
      .pipe()
      .subscribe(async (file) => {
        // this.myData = result;
        if (file != null) {
          this.localFile = file;
          // this.renderExcelJson(file);
          // console.log(this.localFile);
          await this.loading.dismiss();
        }
        else {
          await this.loading.dismiss();
        }
      });
  }
  async renderExcelJson(file: any) {
    const f = await (file).arrayBuffer();
    const wb = await XLSX.read(f);
    this.products = await XLSX.utils.sheet_to_json<any>(wb.Sheets[wb.SheetNames[0]]);
    if (this.loading) {
      await this.loading.dismiss();
    }
    return this.products;

  }
  async onFileChange(fileChangeEvent: any) {
    this.loading = await this.loadingCtrl.create({
    });
    this.loading.present();

    const file = fileChangeEvent.target.files[0];
    const json = await this.renderExcelJson(file);

    await this.pricesService.storageSet(ESTOQUE, file)
    await this.pricesService.storageSet(ESTOQUE_JSON, json)
    this.localFile = file;
    await this.loading.dismiss();
  }
  scanPage() {
    this.router.navigateByUrl('scan');
  }
  async clearStorage() {
    this.pricesService.storageRemove(ESTOQUE);
    this.localFile = null;
  }
}
