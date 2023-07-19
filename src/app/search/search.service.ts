import { Injectable } from '@angular/core';
import { PrecosService } from '../precos.service';
import { ESTOQUE, ESTOQUE_JSON, IProduct } from '../app.interface';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class SearchService {

    public SearchProducts: BehaviorSubject<IProduct[]> = new BehaviorSubject<IProduct[]>([]);

    productsList: IProduct[] = [];

    mockData: IProduct[] = [
        {
            EAN13: '123123',
            CODIGO: '123123',
            DESCRICAO: 'Descricao',
            PRECO_VENDA: '123123',
            QUANTIDATE: '12',
            MARCA: 'Baquo'
        }
    ];

    constructor(
        private pricesService: PrecosService,
    ) { }

    async init() {
        this.productsList = await this.pricesService.storageGet(ESTOQUE_JSON);
        console.log('json', this.productsList);
        this.SearchProducts.next(this.productsList);
    }

    getData(): Observable<IProduct[]> {
        return this.SearchProducts;
    }

    AddProduct(p: IProduct): void {
        this.productsList.push(p);
        if (this.SearchProducts != null) {
            this.SearchProducts.next(this.productsList);
        }
    }

    filterProducts(searchTerm: string) {
        const producNotFound: any = [{
            DESCRICAO: 'Product not found :(',
            EAN13: '000',
            CODIGO: '000'
        }];
        let productArray = this.productsList.filter((product: IProduct) => {
            return product.EAN13.toString().toLowerCase().indexOf(searchTerm.toString()) > -1;
        });

        // console.log(productArray);

        const x = this.productsList.filter(product => {
            
        })
        console.log(x)

        if (productArray.length > 0) {
            // console.log(productArray);
            return this.SearchProducts.next(productArray);
        }
        // return this.SearchProducts.next(productArray);
    }
}

// const productArray: any = this.productsList.map((product: IProduct) => {
//     // console.log(product);
//     if (product.EAN13 === searchTerm) {
//         return product;
//     }
//     // return []
// });
// console.log(productArray);
