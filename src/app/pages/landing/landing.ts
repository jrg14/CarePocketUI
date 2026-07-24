import { DOCUMENT } from '@angular/common';
import { Component, inject } from '@angular/core';

import { UiBadgeComponent } from '../../components/ui-badge/ui-badge';
import { UiButtonComponent } from '../../components/ui-button/ui-button';
import { UiCardComponent } from '../../components/ui-card/ui-card';
import { UiHeroComponent } from '../../components/ui-hero/ui-hero';
import { UiInputComponent } from '../../components/ui-input/ui-input';
import { UiSectionComponent } from '../../components/ui-section/ui-section';
import { UiTextareaComponent } from '../../components/ui-textarea/ui-textarea';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [
    UiBadgeComponent,
    UiButtonComponent,
    UiCardComponent,
    UiHeroComponent,
    UiInputComponent,
    UiSectionComponent,
    UiTextareaComponent,
  ],
  templateUrl: './landing.html',
})
export class LandingComponent {
  private readonly document = inject(DOCUMENT);
  readonly heroImageSrc = '';
  readonly heroImageAlt = 'Equipo revisando analítica financiera';

  readonly insightCards = [
    {
      badge: 'Patrones',
      title: 'Detecta hábitos repetidos',
      description:
        'Identifica categorías, horarios y picos de gasto que se repiten sin que el usuario los vea a simple vista.',
    },
    {
      badge: 'Predicción',
      title: 'Anticipa escenarios futuros',
      description:
        'Proyecta cómo evolucionarán ingresos, ahorro y liquidez si el comportamiento actual se mantiene.',
    },
    {
      badge: 'Acción',
      title: 'Recomienda decisiones concretas',
      description:
        'Traduce el análisis en pasos claros para ahorrar más, reducir riesgo y mejorar la salud financiera.',
    },
  ];

  readonly questionCards = [
    {
      title: '¿En que estoy gastando más?',
      description:
        'CarePocket ataca la raíz del problema: conecta tus gastos, hábitos y cambios de rutina para decirte exactamente por qué estás gastando más.',
    },
    {
      title: '¿Qué hábitos me frenan?',
      description:
        'Detecta fugas pequeñas pero constantes, compras impulsivas y patrones que erosionan tu capacidad de ahorro.',
    },
    {
      title: '¿Qué pasará si no cambio nada?',
      description:
        'Simula el impacto de mantener tus hábitos actuales y estima cómo afectarán al ahorro en los próximos meses.',
    },
  ];

  readonly riskSignals = [
    'Gasto recurrente por encima del promedio en ocio y delivery.',
    'Ahorro mensual sensible a compras no planificadas.',
    'Margen de liquidez estrecho si aparece un gasto imprevisto.',
  ];

  monthlyIncome = 2400;
  fixedExpenses = 1380;
  variableExpenses = 520;

  scrollTo(id: string): void {
    const element = this.document.getElementById(id);

    element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}
