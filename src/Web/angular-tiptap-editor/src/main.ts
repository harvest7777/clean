import { bootstrapApplication } from "@angular/platform-browser";
import { provideRouter } from "@angular/router";
import { provideHttpClient, withInterceptors } from "@angular/common/http";
import { provideAteEditor } from "angular-tiptap-editor";

import { AppComponent } from "./app/app.component";
import { routes } from "./app/app.routes";
import { provideApiConfiguration } from "./app/core/api/api-configuration";

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptors([])),
    provideApiConfiguration(""),
    provideAteEditor(),
  ],
});
