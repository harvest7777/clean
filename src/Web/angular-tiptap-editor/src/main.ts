import { bootstrapApplication } from "@angular/platform-browser";
import { provideRouter } from "@angular/router";
import { provideHttpClient, withInterceptors } from "@angular/common/http";
import { APP_INITIALIZER } from "@angular/core";
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
    {
      provide: APP_INITIALIZER,
      useFactory: (auth: AuthService) => () => auth.loadCurrentUser(),
      deps: [AuthService],
      multi: true,
    },
  ],
});
