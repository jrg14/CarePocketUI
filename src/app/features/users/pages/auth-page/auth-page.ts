import { CommonModule } from '@angular/common';
import { Component, computed, effect, inject } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { ActivatedRoute, Params, Router, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';

import { UiButtonComponent } from '../../../../components/ui-button/ui-button';
import { UiCardComponent } from '../../../../components/ui-card/ui-card';
import { AuthMode } from '../../models/auth.models';
import { AuthService } from '../../data-services/users-auth.service';

@Component({
  selector: 'app-auth-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, UiButtonComponent, UiCardComponent],
  templateUrl: './auth-page.html',
})
export class AuthPageComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly formBuilder = inject(NonNullableFormBuilder);

  private readonly routeData = toSignal(this.route.data, {
    initialValue: this.route.snapshot.data as Record<string, unknown>,
  });
  private readonly queryParams = toSignal(this.route.queryParams, {
    initialValue: this.route.snapshot.queryParams as Params,
  });

  readonly mode = computed<AuthMode>(() =>
    this.routeData()?.['mode'] === 'register' ? 'register' : 'login',
  );
  readonly isLogin = computed(() => this.mode() === 'login');
  readonly pageTitle = computed(() =>
    this.isLogin()
      ? 'Accede a tus análisis financieros'
      : 'Crea tu cuenta para empezar a analizar tu dinero',
  );
  readonly pageDescription = computed(() =>
    this.isLogin()
      ? 'Entra con tu correo y contraseña para ver tus escenarios, recomendaciones y señales de gasto.'
      : 'Regístrate para guardar tu progreso, activar el análisis y volver después a tu historial financiero.',
  );
  readonly modeBadge = computed(() => (this.isLogin() ? 'Inicio de sesión' : 'Registro'));
  readonly switchText = computed(() =>
    this.isLogin() ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?',
  );
  readonly switchLabel = computed(() => (this.isLogin() ? 'Crear cuenta' : 'Iniciar sesión'));
  readonly switchHref = computed(() => (this.isLogin() ? '/auth/register' : '/auth/login'));
  readonly returnUrl = computed(() => {
    const value = this.queryParams()['returnUrl'];

    if (typeof value === 'string' && value.trim()) {
      return value;
    }

    return '/dashboard';
  });
  readonly registered = computed(() => this.queryParams()['registered'] === '1');
  readonly prefilledEmail = computed(() => {
    const value = this.queryParams()['email'];

    return typeof value === 'string' ? value : '';
  });
  readonly authError = this.authService.error;
  readonly authBusy = this.authService.isBusy;

  private readonly passwordsMatchValidator: ValidatorFn = (
    control,
  ): ValidationErrors | null => {
    const password = control.get('password')?.value;
    const confirmPassword = control.get('confirmPassword')?.value;

    if (!password || !confirmPassword) {
      return null;
    }

    return password === confirmPassword ? null : { passwordMismatch: true };
  };

  readonly loginForm = this.formBuilder.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
  });

  readonly registerForm = this.formBuilder.group(
    {
      fullName: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]],
    },
    {
      validators: [this.passwordsMatchValidator],
    },
  );

  readonly proofPoints = [
    'JWT bearer token conectado al backend de CarePocket.',
    'Persistencia local para mantener la sesión al recargar.',
    'Acceso protegido a la zona privada y a tu perfil /users/me.',
  ];

  readonly loginHighlights = [
    'Revisa patrones de gasto.',
    'Abre simulaciones financieras.',
    'Consulta recomendaciones accionables.',
  ];

  readonly registerHighlights = [
    'Guarda tu progreso.',
    'Mantén tu sesión entre recargas.',
    'Empieza con tu perfil financiero completo.',
  ];

  constructor() {
    effect(() => {
      const email = this.prefilledEmail();

      if (email) {
        this.loginForm.controls.email.setValue(email, { emitEvent: false });
        this.registerForm.controls.email.setValue(email, { emitEvent: false });
      }
    });
  }

  submitLogin(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.authService.login(this.loginForm.getRawValue()).subscribe({
      next: () => {
        void this.router.navigateByUrl(this.returnUrl());
      },
      error: () => void 0,
    });
  }

  submitRegister(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    const { fullName, email, password } = this.registerForm.getRawValue();

    this.authService.register({ fullName, email, password }).subscribe({
      next: () => {
        void this.router.navigate(['/auth/login'], {
          queryParams: {
            registered: '1',
            email,
            returnUrl: this.returnUrl(),
          },
        });
      },
      error: () => void 0,
    });
  }

  loginControlError(controlName: 'email' | 'password'): string | null {
    const control = this.loginForm.controls[controlName];

    if (!control.touched && !control.dirty) {
      return null;
    }

    if (control.hasError('required')) {
      return 'Este campo es obligatorio.';
    }

    if (controlName === 'email' && control.hasError('email')) {
      return 'Introduce un correo válido.';
    }

    if (controlName === 'password' && control.hasError('minlength')) {
      return 'La contraseña debe tener al menos 8 caracteres.';
    }

    return null;
  }

  registerControlError(
    controlName: 'fullName' | 'email' | 'password' | 'confirmPassword',
  ): string | null {
    const control = this.registerForm.controls[controlName];

    if (!control.touched && !control.dirty) {
      return null;
    }

    if (control.hasError('required')) {
      return 'Este campo es obligatorio.';
    }

    if (controlName === 'fullName' && control.hasError('minlength')) {
      return 'Escribe tu nombre completo.';
    }

    if (controlName === 'email' && control.hasError('email')) {
      return 'Introduce un correo válido.';
    }

    if (controlName === 'password' && control.hasError('minlength')) {
      return 'La contraseña debe tener al menos 8 caracteres.';
    }

    return null;
  }

  registerPasswordMismatch(): boolean {
    return this.registerForm.touched && this.registerForm.hasError('passwordMismatch');
  }
}
