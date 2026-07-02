import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

import { UiBadgeComponent } from '../ui-badge/ui-badge';

@Component({
  selector: 'app-ui-card',
  standalone: true,
  imports: [CommonModule, UiBadgeComponent],
  templateUrl: './ui-card.html',
})
export class UiCardComponent {
  @Input() title = '';
  @Input() description = '';
  @Input() badge = '';
  @Input() imageSrc = '';
  @Input() imageAlt = '';
  @Input() compact = false;
  @Input() hoverable = true;

  get cardClasses(): string {
    const classes = ['card', 'bg-base-100', 'shadow-sm', 'border', 'border-base-200'];

    if (this.compact) {
      classes.push('card-compact');
    }

    if (this.hoverable) {
      classes.push('transition-shadow', 'hover:shadow-md');
    }

    return classes.join(' ');
  }
}
