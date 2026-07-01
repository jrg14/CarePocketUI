import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { IonApp } from '@ionic/angular/standalone';

@Component({
  selector: 'app-root',
  imports: [IonApp, RouterOutlet],
  templateUrl: './app.html',
})
export class AppComponent {
}
