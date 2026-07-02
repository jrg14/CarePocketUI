import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-ui-section',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ui-section.html',
})
export class UiSectionComponent {
  @Input() id = '';
  @Input() eyebrow = '';
  @Input() title = '';
  @Input() description = '';
  @Input() centered = false;
}
