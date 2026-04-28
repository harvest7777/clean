# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## Commands

```bash
# Install dependencies
npm install

# Run the demo app (dev server at localhost:4200)
npm start

# Build library only (outputs to dist/angular-tiptap-editor/)
npm run build:lib

# Watch-mode library build + demo app in parallel
npm run dev

# Run e2e tests (requires demo app running or uses webServer auto-start)
npm run test:e2e

# Run a single e2e test file
npx playwright test tests/toolbar.spec.ts

# Lint
npm run lint

# Format
npm run format

# Build demo app for production
npm run build:demo
```

---

## Repository Layout

This is an Angular **library workspace** with two distinct parts:

```
projects/angular-tiptap-editor/   ← the publishable NPM library
src/                               ← the interactive demo app
tests/                             ← Playwright e2e tests (run against demo app)
```

### Library (`projects/angular-tiptap-editor/src/lib/`)

The library is aliased as `angular-tiptap-editor` in `tsconfig.json` so the demo
can import it as if it were an installed package.

Key subdirectories:

| Path | Purpose |
|------|---------|
| `components/editor/` | `AngularTiptapEditorComponent` — the single public-facing component |
| `components/bubble-menus/` | Context-aware bubble menus (text, image, link, color, table, cell) |
| `components/toolbar/` | Top toolbar |
| `components/slash-commands/` | `/`-triggered command palette |
| `extensions/` | Custom Tiptap extensions (resizable image, table, block controls, state bridge) |
| `extensions/calculators/` | Pure functions (`AteStateCalculator`) that derive reactive editor state snapshots |
| `node-view/` | Angular-component-as-Tiptap-node infrastructure |
| `services/` | `AteEditorCommandsService` (state + imperative API), `AteI18nService`, `AteImageService`, `AteColorPickerService`, `AteLinkService` |
| `models/` | All public TypeScript types and interfaces |
| `config/` | Default configs and the `ATE_GLOBAL_CONFIG` injection token |

### Reactive State Architecture

Editor state flows through `AteTiptapStateExtension`, a ProseMirror plugin that runs
**state calculators** on every transaction. Calculators are pure functions
`(editor: Editor) => Partial<AteEditorStateSnapshot>`. Results are fast-merged into a
flat snapshot and pushed into `AteEditorCommandsService.editorState` (a signal).

To add reactive state for a new feature: create a calculator in `extensions/calculators/`
and pass it via `stateCalculators` input or `AteEditorConfig.stateCalculators`.

### Configuration Priority

`[individual inputs]` > `[config]` input object > `provideAteEditor()` global config > defaults

All merging happens inside the `effectiveConfig` computed property in
`AngularTiptapEditorComponent`. When adding a new option, follow this pattern.

### Angular Node Views

Angular components can be embedded as Tiptap nodes via `angularNodes` config or
`registerAngularComponent()`. The node-view infrastructure (`node-view/`) bridges
ProseMirror's node view lifecycle to Angular's change detection. Components should
extend `AteAngularNodeView` to access `editor`, `node`, and `updateAttributes` signals.

---

## Role

You write modern Angular (v17+). You default to the architecture and patterns
below without being asked. Never suggest alternatives unless the user explicitly
asks for options.

---

## Project Structure

Every feature lives under `features/<name>/` and is self-contained:

```
app/
├── features/
│   └── <feature>/
│       ├── pages/           ← smart (container) components
│       ├── components/      ← dumb (presentational) components
│       ├── services/        ← business logic + state
│       ├── types/           ← interfaces, enums, DTOs
│       └── <feature>.routes.ts
└── core/                    ← strictly feature-agnostic (guards, interceptors,
                                shared pipes, global tokens, app-wide services)
```

Rules:
- All components are standalone. Never use NgModules.
- Every feature is lazy-loaded via `loadChildren` from `app.routes.ts`.
- `core/` contains nothing that references a specific feature.
- If something is only used in one feature, it lives inside that feature.

---

## Signal-Based State Management

Services own and manage all state. Components only read it.

**Service pattern:**

```typescript
@Injectable({ providedIn: 'root' })
export class TaskService {
  private readonly _tasks = signal<Task[]>([]);

  readonly tasks = this._tasks.asReadonly();
  readonly completedCount = computed(() =>
    this._tasks().filter(t => t.done).length
  );

  complete(id: string): void {
    this._tasks.update(tasks =>
      tasks.map(t => t.id === id ? { ...t, done: true } : t)
    );
  }
}
```

**Bridging HTTP to signals:**

`HttpClient` returns observables. Convert them to signals at the service
boundary using `toSignal()`. Components never see or subscribe to observables.

```typescript
@Injectable({ providedIn: 'root' })
export class TaskService {
  private readonly http = inject(HttpClient);

  readonly tasks = toSignal(
    this.http.get<Task[]>('/api/tasks'),
    { initialValue: [] }
  );
}
```

Rules:
- Services expose `Signal<T>` (read-only) to the outside. Internal mutable
  state is `WritableSignal<T>` and never exposed directly.
- Use `computed()` for all derived state. Never duplicate state manually.
- Use `toSignal()` inside services to convert observables. Components
  consume signals only — never call `.subscribe()` in a component.
- Use `effect()` only for true side effects (e.g., persisting to
  localStorage, triggering analytics). Never use it to derive or transform
  state — that is `computed()`'s job.

**Never use:**
- `BehaviorSubject` or `Subject` for UI state
- Manual `.subscribe()` inside components
- Storing derived values as separate writable signals

---

## Component Contract: Smart vs. Dumb

### Smart components (`pages/`)
- Inject services via `inject()`
- Read signals from services and pass data down to children via `input()`
- Define all action handlers (e.g., what happens when a task is completed)
- Pass those handlers down by binding to child `output()` events
- No business logic beyond wiring — no calculations, no data transformation

### Dumb components (`components/`)
- Accept data only via `input()`
- Signal actions upward only via `output()`
- Zero service injection
- Zero business logic
- Know only how to render what they are given

**The core rule:** A presentational component renders. It does not act.
If it has a clickable action — like completing a task — it emits an
`output()` event with the relevant data. The parent defines what happens.
The component never defines or owns that logic.

```typescript
// CORRECT — card component renders and emits, nothing more
@Component({ selector: 'app-task-card', standalone: true, ... })
export class TaskCardComponent {
  task = input.required<Task>();
  complete = output<string>();  // emits the task id upward

  onCompleteClick(): void {
    this.complete.emit(this.task().id);
  }
}
```

```typescript
// CORRECT — page component owns the logic and wires everything
@Component({ selector: 'app-task-page', standalone: true, ... })
export class TaskPageComponent {
  private taskService = inject(TaskService);

  tasks = this.taskService.tasks;

  onComplete(id: string): void {
    this.taskService.complete(id);
  }
}
```

```html
<!-- page template passes data down and handles events up -->
@for (task of tasks(); track task.id) {
  <app-task-card [task]="task" (complete)="onComplete($event)" />
}
```

**Never do this in a dumb component:**

```typescript
// WRONG — component reaches into a service; it now owns business logic
@Component({ ... })
export class TaskCardComponent {
  private taskService = inject(TaskService);     // ← never inject in a dumb component
  complete(): void { this.taskService.complete(this.task().id); }  // ← never
}
```

---

## When to Use `model()`

Use `model()` only when a component **is itself a form control** — a leaf UI
element whose value the parent needs to read and write two-way (e.g., a custom
input, toggle, slider, or date-picker).

```typescript
// CORRECT — custom toggle that is a form control
export class ToggleComponent {
  checked = model<boolean>(false);
}
```

```html
<!-- parent uses two-way binding -->
<app-toggle [(checked)]="isEnabled" />
```

For all other parent-child communication — passing display data down, emitting
actions up — use `input()` + `output()`. When in doubt, default to
`input()` + `output()`.

---

## Modern Syntax — Always Use

| Use | Never use |
|-----|-----------|
| `@if` / `@for` / `@switch` | `*ngIf` / `*ngFor` / `*ngSwitch` |
| `input()` / `output()` / `model()` | `@Input()` / `@Output()` decorators |
| `inject()` | Constructor injection |
| `takeUntilDestroyed()` | Manual `ngOnDestroy` or `.unsubscribe()` for cleanup |
| Functional guards and interceptors | Class-based guards and interceptors |
| `@defer` for heavy or below-fold UI | Eager loading of large components |

---

## What Never To Do

- Create NgModules
- Use `BehaviorSubject` or `Subject` for state that belongs in a signal
- Call `.subscribe()` inside any component
- Inject services into dumb (presentational) components
- Write business logic inside component class methods — it belongs in a service
- Use old template syntax (`*ngIf`, `*ngFor`, `@Input()`, `@Output()`)
- Put feature-specific code inside `core/`
- Duplicate state — if a value can be derived from existing state, it must be
  a `computed()`, not a separate signal
