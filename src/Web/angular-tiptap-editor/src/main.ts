import { bootstrapApplication } from "@angular/platform-browser";
import { provideRouter } from "@angular/router";
import { provideHttpClient, withInterceptors } from "@angular/common/http";
import { inject, provideAppInitializer } from "@angular/core";
import { provideAteEditor } from "angular-tiptap-editor";

import { AppComponent } from "./app/app.component";
import { routes } from "./app/app.routes";
import { provideApiConfiguration } from "./app/core/api/api-configuration";
import { authInterceptor } from "./app/features/auth/interceptors/auth.interceptor";
import { AuthService } from "./app/features/auth/services/auth.service";

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor])),
    provideApiConfiguration(""),
    provideAteEditor(),
    provideAppInitializer(() => {
      const auth = inject(AuthService);
      return auth.loadCurrentUser();
    }),
  ],
});
