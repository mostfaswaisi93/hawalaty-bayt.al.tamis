import { Component, input } from '@angular/core';
import { AbstractControl } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

/**
 * Renders a translated validation message for the first error on a control.
 * Keeps validation strings out of components and templates.
 *
 * Uses plain methods (not computed signals) so the message re-evaluates on
 * every change-detection pass — control validity changes do not alter the
 * control reference, so a signal dependency would never re-fire.
 */
@Component({
  selector: 'app-field-error',
  imports: [TranslateModule],
  template: `
    @if (isVisible()) {
      <span class="mt-1 block text-xs text-red-600">
        {{ error().key | translate: error().params }}
      </span>
    }
  `,
})
export class FieldError {
  readonly control = input<AbstractControl | null>(null);

  protected isVisible(): boolean {
    const c = this.control();
    return !!c && c.invalid && (c.touched || c.dirty);
  }

  protected error(): { key: string; params: Record<string, unknown> } {
    const errors = this.control()?.errors ?? {};
    const first = Object.keys(errors)[0];

    switch (first) {
      case 'required':
        return { key: 'validation.required', params: {} };
      case 'email':
        return { key: 'validation.email', params: {} };
      case 'minlength':
        return { key: 'validation.minlength', params: { count: errors['minlength'].requiredLength } };
      case 'maxlength':
        return { key: 'validation.maxlength', params: { count: errors['maxlength'].requiredLength } };
      case 'min':
        return { key: 'validation.min', params: { min: errors['min'].min } };
      case 'max':
        return { key: 'validation.max', params: { max: errors['max'].max } };
      default:
        return { key: 'validation.pattern', params: {} };
    }
  }
}
