import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { IonicModule, LoadingController } from '@ionic/angular';
import { PrecosService } from '../precos.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import * as XLSX from 'xlsx';
import { Router } from '@angular/router';
import { FileOpener } from '@awesome-cordova-plugins/file-opener/ngx';
import { File } from '@ionic-native/file/ngx';
import { ESTOQUE, IProduct } from '../app.interface';

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
    private loadingCtrl: LoadingController
  ) { }

  async ngOnInit() {
    this.loading = await this.loadingCtrl.create({});
    await this.loading.present();

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
  // async renderExcelJson(file: any) {
  //   const f = await (file).arrayBuffer();
  //   const wb = XLSX.read(f);
  //   this.products = XLSX.utils.sheet_to_json<any>(wb.Sheets[wb.SheetNames[0]]);
  //   if (this.loading) {
  //     await this.loading.dismiss();
  //   }
  // }
  async onFileChange(fileChangeEvent: any) {
    this.loading = await this.loadingCtrl.create({
    });
    this.loading.present();

    const file = fileChangeEvent.target.files[0];

    this.pricesService.storageSet(ESTOQUE, file).then(async (file) => {
      // this.renderExcelJson(file);
      this.loading.dismiss();
      this.localFile = file;
    });

  }
  scanPage() {
    this.router.navigateByUrl('scan');
  }
  async clearStorage() {
    this.pricesService.storageRemove(ESTOQUE);
    this.localFile = null;
  }
}
