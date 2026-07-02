import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-ui-badge',
  standalone: true,
  templateUrl: './ui-badge.html',
})
export class UiBadgeComponent {
  @Input() variant: 'neutral' | 'primary' | 'secondary' | 'accent' | 'ghost' | 'success' | 'warning' | 'error' = 'neutral';
  @Input() size: 'xs' | 'sm' | 'md' | 'lg' = 'md';
  @Input() outline = false;

  get badgeClasses(): string {
    const classes = ['badge', `badge-${this.size}`];

    if (this.outline) {
      classes.push('badge-outline');
    } else {
      classes.push(`badge-${this.variant}`);
    }

    return classes.join(' ');
  }
}
