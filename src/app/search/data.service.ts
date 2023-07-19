import { HttpClient } from '@angular/common/http';
import { Injectable, OnDestroy } from '@angular/core';
import { PrecosService } from '../precos.service';
import { ESTOQUE, IProduct } from '../app.interface';
import * as XLSX from 'xlsx';
import { Subject, catchError, throwError, takeUntil, BehaviorSubject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class DataProvider implements OnDestroy {

    Products$: BehaviorSubject<IProduct[]> | undefined;

    productsList: IProduct[] = [];

    private readonly ngUnsubscribe = new Subject();

    constructor(
        public http: HttpClient,
        private pricesService: PrecosService,
    ) {
        this.pricesService
            .getKeyAsObservable(ESTOQUE)
            .pipe(
                catchError(err => {
                    const error = throwError(() => new Error(JSON.stringify(err)));
                    return error;
                }),
                takeUntil(this.ngUnsubscribe),
            )
            .subscribe(async (file) => {
                if (file != null) {
                    // console.log(file);
                    const f = await (file).arrayBuffer();
                    const wb = XLSX.read(f);
                    this.productsList = XLSX.utils.sheet_to_json<any>(wb.Sheets[wb.SheetNames[0]]);
                    
                    console.log(this.productsList);

                    this.Products$ = new BehaviorSubject<IProduct[]>(this.productsList);
                }
            });
    }

    AddProduct(p: IProduct): void {
        this.productsList.push(p);
        if (this.Products$ != null) {
            this.Products$.next(this.productsList);
        }
    }

    filterProducts(searchTerm: string): IProduct[] {
        // console.log(this.productsList);
        const product = this.productsList.filter((item: IProduct) => {
            return item.EAN13.toString().toLowerCase().indexOf(searchTerm.toString()) > -1;
        });
        return product;
    }
    ngOnDestroy(): void {
        this.ngUnsubscribe.next(null);
        this.ngUnsubscribe.complete();
    }
}