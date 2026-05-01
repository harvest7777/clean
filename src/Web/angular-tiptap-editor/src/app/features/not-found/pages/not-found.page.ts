import { Component } from "@angular/core";
import { RouterLink } from "@angular/router";
import { AppRouteUrls } from "../../../core/routing/app-routes";

@Component({
  selector: "app-not-found-page",
  imports: [RouterLink],
  template: `
    <section class="not-found">
      <p class="eyebrow">404</p>
      <h1>Page not found</h1>
      <p>The page you requested does not exist.</p>
      <a [routerLink]="routes.home">Return home</a>
    </section>
  `,
})
export class NotFoundPageComponent {
  protected readonly routes = AppRouteUrls;
}
