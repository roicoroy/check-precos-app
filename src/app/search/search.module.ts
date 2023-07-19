import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { IonicModule } from "@ionic/angular";
import { CustomFilterPipe } from "src/custom-filter.pipe";

@NgModule({
    declarations: [CustomFilterPipe],
    imports: [
        CommonModule,
        IonicModule
    ],
    exports: [CustomFilterPipe]
})
export class SearchModule { }