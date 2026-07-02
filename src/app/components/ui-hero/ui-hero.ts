import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

import { UiBadgeComponent } from '../ui-badge/ui-badge';
import { UiButtonComponent } from '../ui-button/ui-button';

@Component({
  selector: 'app-ui-hero',
  standalone: true,
  imports: [CommonModule, UiBadgeComponent, UiButtonComponent],
  templateUrl: './ui-hero.html',
})
export class UiHeroComponent {
  @Input() eyebrow = '';
  @Input() title = '';
  @Input() description = '';
  @Input() imageSrc = '';
  @Input() imageAlt = '';
  @Input() primaryBtnText = '';
  @Input() secondaryBtnText = '';
  @Input() highlights: ReadonlyArray<string> = ['','','',];

  @Output() onPrimaryAction = new EventEmitter<void>();
  @Output() onSecondaryAction = new EventEmitter<void>();
}
