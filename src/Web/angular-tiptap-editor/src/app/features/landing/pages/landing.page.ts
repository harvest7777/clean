import { Component } from "@angular/core";
import { AppRouteUrls } from "../../../core/routing/app-routes";
import { RouterLink } from "@angular/router";
import { AuthButtonContainerComponent } from "../../../core/auth/components/auth-button-container/auth-button-container.component";

@Component({
  selector: "app-landing-page",
  standalone: true,
  imports: [RouterLink, AuthButtonContainerComponent],
  templateUrl: "./landing.page.html",
})
export class LandingPageComponent {
  protected readonly routes = AppRouteUrls;
}
