import { Component, OnInit } from '@angular/core';

import { 
  IonContent, 
  IonCard, 
  IonCardHeader, 
  IonCardTitle, 
  IonCardContent, 
  IonButton 
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-landing',
  templateUrl: './landing.html',
  standalone: true,
  imports: [
    IonContent, 
    IonButton
  ]
})
export class LandingComponent  implements OnInit {

  constructor() { }

  ngOnInit() {}

}
