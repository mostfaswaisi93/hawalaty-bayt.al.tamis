import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

interface FeatureCard {
  icon: string;
  link: string;
  titleKey: string;
  descKey: string;
}

@Component({
  selector: 'app-help',
  imports: [RouterLink, TranslateModule],
  templateUrl: './help.html',
})
export class Help {
  protected readonly features: FeatureCard[] = [
    { icon: 'dashboard', link: '/dashboard', titleKey: 'nav.dashboard', descKey: 'help.features.dashboard' },
    { icon: 'send', link: '/transfers', titleKey: 'nav.transfers', descKey: 'help.features.transfers' },
    { icon: 'history', link: '/history', titleKey: 'nav.history', descKey: 'help.features.history' },
    { icon: 'account_balance', link: '/banks', titleKey: 'nav.banks', descKey: 'help.features.banks' },
    { icon: 'restaurant_menu', link: '/menu', titleKey: 'nav.foodMenu', descKey: 'help.features.menu' },
    { icon: 'assessment', link: '/reports', titleKey: 'nav.reports', descKey: 'help.features.reports' },
    { icon: 'settings', link: '/settings', titleKey: 'nav.settings', descKey: 'help.features.settings' },
  ];

  protected readonly faqKeys = ['newOrder', 'addCategory', 'exportReport', 'language', 'banksVsWallets'];
  protected readonly openFaq = signal<string | null>(null);

  protected toggleFaq(key: string): void {
    this.openFaq.set(this.openFaq() === key ? null : key);
  }
}
