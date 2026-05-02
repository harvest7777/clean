import { Component } from "@angular/core";
import { AppRouteUrls } from "../../../core/routing/app-routes";
import { RouterLink } from "@angular/router";

@Component({
  selector: "app-landing-page",
  standalone: true,
  imports: [RouterLink],
  templateUrl: "./landing.page.html",
})
export class LandingPageComponent {
  protected readonly routes = AppRouteUrls;
}
