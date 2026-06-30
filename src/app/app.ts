import { Component, signal } from '@angular/core';
import { IonApp } from '@ionic/angular/standalone';
import { UINavbarComponent } from './components/ui-navbar/ui-navbar';
import { UIHeroComponent } from './components/ui-hero/ui-hero';
import { UIFooterComponent } from './components/ui-footer/ui-footer';
@Component({
  selector: 'app-root',
  imports: [IonApp, UINavbarComponent, UIHeroComponent, UIFooterComponent],
  templateUrl: './app.html',
})
export class App {
  protected readonly title = signal('temp-project');

  handlePrimary() { }
  handleSecondary() { }

}
