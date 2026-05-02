import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AppRouteUrls } from '../../../core/routing/app-routes';

@Component({
  selector: 'app-unavailable-page',
  imports: [RouterLink],
  template: `
    <section class="unavailable">
      <p class="eyebrow">Temporary issue</p>
      <h1>We are having trouble reaching the server</h1>
      <p>Please try again in a moment.</p>
      <p><a [routerLink]="routes.home">Go home</a></p>
    </section>
  `,
})
export class UnavailablePageComponent {
  protected readonly routes = AppRouteUrls;
}
