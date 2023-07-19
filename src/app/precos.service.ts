import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import { BehaviorSubject, Observable, from } from 'rxjs';
import { BatteryInfo, Device, DeviceId, DeviceInfo, GetLanguageCodeResult } from '@capacitor/device';
import { IProduct } from './app.interface';

@Injectable({
  providedIn: 'root'
})
export class PrecosService {
  localBase = 'http://localhost:5002';
  ngrokBase = 'https://1d05-177-67-246-60.ngrok-free.app';
  txt = '/api/v1/txt';
  excel = '/api/v1/excel';
  firebird = '/api/v1/firebird';

  public items: any = [];

  public Products$?: BehaviorSubject<IProduct[]>;

  constructor(
    private httpClient: HttpClient,
    private storage: Storage,
  ) {
    this.items = [
      { title: "one" },
      { title: "two" },
      { title: "three" },
      { title: "four" },
      { title: "five" },
      { title: "six" }
    ];
  }

  filterItems(searchTerm: string) {
    return this.items.filter((item: { title: string; }) => {
      return item.title.toLowerCase().indexOf(searchTerm.toLowerCase()) > -1;
    });
  }

  getPricesTxt() {
    return this.httpClient.get(this.ngrokBase + this.txt);
  }
  getPricesFirebird() {
    return this.httpClient.get(this.ngrokBase + this.firebird);
  }
  getPricesExcel() {
    return this.httpClient.get(this.ngrokBase + this.excel);
  }

  getKeyAsObservable(key: any): Observable<any> {
    return from(this.storageGet(key));
  }

  async storageSet(key: any, value: any): Promise<any> {
    return await this.storage.set(key, value);
  }
  async storageGet(key: any): Promise<any> {
    return await this.storage.get(key);
  }
  async storageRemove(key: any): Promise<any> {
    return await this.storage.remove(key);
  }
  async getDeviceInfo(): Promise<DeviceInfo> {
    return Device.getInfo();
  }
}
