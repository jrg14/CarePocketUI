import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

import { UiButtonComponent } from '../ui-button/ui-button';

@Component({
  selector: 'app-ui-hero',
  standalone: true,
  imports: [CommonModule, UiButtonComponent],
  templateUrl: './ui-hero.html',
})
export class UiHeroComponent {
  @Input() eyebrow = '';
  @Input() title = '';
  @Input() description = '';
  @Input() imageSrc = '';
  @Input() imageAlt = '';
  @Input() imageOverlayClass = 'bg-neutral/70';
  @Input() primaryBtnText = '';
  @Input() secondaryBtnText = '';
  @Input() highlights: ReadonlyArray<string> = [];
  @Input() centered = true;
  @Input() minHeightClass = 'min-h-[70vh]';

  @Output() onPrimaryAction = new EventEmitter<void>();
  @Output() onSecondaryAction = new EventEmitter<void>();

  get heroClasses(): string[] {
    return ['hero', 'overflow-hidden', 'rounded-3xl', 'bg-base-200', this.minHeightClass];
  }

  get contentClasses(): string[] {
    const classes = ['hero-content', 'w-full', 'px-6', 'py-10', 'sm:px-10', 'lg:px-16'];

    if (this.imageSrc) {
      classes.push('text-neutral-content');
    }

    return classes;
  }

  get contentGridClasses(): string[] {
    const classes = ['grid', 'w-full', 'max-w-6xl', 'items-center', 'gap-10'];

    if (this.centered) {
      classes.push('text-center');
    }

    return classes;
  }

  get heroStyle(): Record<string, string> {
    return this.imageSrc ? { backgroundImage: `url(${this.imageSrc})` } : {};
  }
}
