import { Pipe, PipeTransform } from '@angular/core';
import * as _ from 'lodash';

@Pipe({
    name: 'filter',
    standalone: true
})
export class FilterPipe implements PipeTransform {

    transform(items: any[], searchText: string, filterGroup: any): any[] {
        if (!items) { return []; }
        if (!searchText) { return items; }
        return _.filter(items, it => this.filterByOr(it, filterGroup, searchText));
    }

    filterByOr(item: any, filterGroup: any, searchText: string) {
        let flag = false;
        for (let key of filterGroup) {
            console.log(key, typeof item[key]);
            switch (typeof item[key]) {
                case 'string': flag = this.filterByString(item, key, searchText);
                    break;
                case 'number': flag = this.filterByNumber(item, key, searchText);
                    break;

            }
            if (flag) { break; }
        }
        return flag;
    }

    filterByString(item: { [x: string]: string; }, key: string | number, searchText: string) {
        searchText = searchText.toLowerCase();
        return item[key].toLowerCase().includes(searchText);
    }

    filterByNumber(item: { [x: string]: number; }, key: string | number, searchText: string) {
        return item[key] === Number.parseFloat(searchText);
    }

    filterByBoolean(item: { [x: string]: boolean; }, key: string | number, searchText: string) {
        return item[key] === (/true/i).test(searchText);
    }

}
