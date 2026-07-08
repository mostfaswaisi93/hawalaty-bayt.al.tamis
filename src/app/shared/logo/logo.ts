import { Component, input } from '@angular/core';

/** The app's icon mark: a tinted wallet glyph in a rounded square, reused everywhere "حوالاتي" appears. */
@Component({
  selector: 'app-logo',
  template: `
    <div
      class="flex flex-shrink-0 items-center justify-center bg-primary text-on-primary shadow-lg"
      [class.h-10]="size() === 'sm'"
      [class.w-10]="size() === 'sm'"
      [class.rounded-xl]="size() === 'sm'"
      [class.h-24]="size() === 'lg'"
      [class.w-24]="size() === 'lg'"
      [class.rounded-3xl]="size() === 'lg'"
      [class.rotate-3]="tilt()">
      <span
        class="material-symbols-outlined"
        [class.text-2xl]="size() === 'sm'"
        [class.text-5xl]="size() === 'lg'"
        style="font-variation-settings: 'FILL' 1">account_balance_wallet</span>
    </div>
  `,
})
export class Logo {
  readonly size = input<'sm' | 'lg'>('sm');
  readonly tilt = input(false);
}
