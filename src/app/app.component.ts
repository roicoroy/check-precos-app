import { Component } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { Storage } from '@ionic/storage-angular';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: true,
  imports: [IonicModule],
})
export class AppComponent {
  constructor(
    private storage: Storage,
  ) {
    this.init();
  }
  async init() {
    return await this.storage.create();
  }
}
