import { Component, OnInit } from '@angular/core';

import {
    IonHeader,
    IonToolbar
} from '@ionic/angular/standalone';

@Component({
    selector: 'app-ui-navbar',
    templateUrl: './ui-navbar.html',
    standalone: true,
    imports: [
        IonHeader,
        IonToolbar
    ]
})
export class UINavbarComponent implements OnInit {

    constructor() { }

    ngOnInit() { }

}
