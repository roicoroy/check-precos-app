import { HttpClient } from '@angular/common/http';
import { Injectable, OnDestroy } from '@angular/core';
import { PrecosService } from '../precos.service';
import { ESTOQUE, ESTOQUE_JSON, IProduct } from '../app.interface';
import * as XLSX from 'xlsx';
import { Subject, catchError, throwError, takeUntil, BehaviorSubject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class HomeService {

    Products$?: BehaviorSubject<IProduct[]>;

    constructor(
        private pricesService: PrecosService,
    ) { }

    async init() {
        // console.log('init');
        // this.pricesService.getKeyAsObservable(ESTOQUE);
        const myData = await this.pricesService.storageGet(ESTOQUE_JSON);
        // console.log('json', myData);
        return this.Products$ = new BehaviorSubject<IProduct[]>([...myData]);
    }
}