import { bootstrapApplication } from "@angular/platform-browser";
import { provideRouter } from "@angular/router";
import { provideHttpClient, withInterceptors } from "@angular/common/http";
import { provideAteEditor } from "@flogeez/angular-tiptap-editor";

import { AppComponent } from "./app/app.component";
import { routes } from "./app/app.routes";
import { provideApiConfiguration } from "./app/core/api/api-configuration";
import { credentialsInterceptor } from "./app/core/interceptors/credentials.interceptor";

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptors([credentialsInterceptor])),
    provideApiConfiguration(""),
    provideAteEditor(),
  ],
});
