import { Component, inject, viewChild, effect, computed } from "@angular/core";
import { Extension, Node, Mark } from "@tiptap/core";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import {
  AngularTiptapEditorComponent,
  AteEditorConfig,
  AteAngularNode,
  AteI18nService,
} from "angular-tiptap-editor";

import { EditorActionsComponent } from "../components/editor-actions.component";
import { CodeViewComponent } from "../components/code-view.component";
import { ConfigurationPanelComponent } from "../components/configuration-panel.component";
import { ThemeCustomizerComponent } from "../components/theme-customizer.component";
import { StateDebugComponent } from "../components/state-debug.component";
import { ToastContainerComponent } from "../components/toast-container.component";
import { DiscoveryHintsComponent } from "../components/discovery-hints.component";
import { TaskList, TaskItem } from "../extensions/task.extension";
import {
  AI_LOADING_CONF,
  COUNTER_CONF,
  AI_BLOCK_CONF,
  WARNING_BOX_CONF,
} from "../extensions/angular-showcase.extensions";
import { EditorConfigurationService } from "../services/editor-configuration.service";

@Component({
  selector: "app-text-editor-page",
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    AngularTiptapEditorComponent,
    EditorActionsComponent,
    CodeViewComponent,
    ConfigurationPanelComponent,
    ThemeCustomizerComponent,
    StateDebugComponent,
    ToastContainerComponent,
    DiscoveryHintsComponent,
  ],
  template: `
    <div class="app" #appRef data-testid="app-root" [class.dark]="editorState().darkMode">
      <app-theme-customizer />

      <div
        class="container"
        [class.theme-panel-open]="editorState().activePanel === 'theme'"
        [class.config-panel-open]="
          editorState().activePanel === 'config' || editorState().isTransitioning
        ">
        <main class="editor-main">
          <app-editor-actions />

          <div class="main-content">
            @if (!editorState().showCodeMode) {
              <div
                class="editor-view"
                [class.fill-container-active]="editorState().fillContainer"
                (mouseenter)="onEditorHover(true)"
                (mouseleave)="onEditorHover(false)">
                <angular-tiptap-editor
                  #editorRef
                  [content]="demoContent()"
                  [config]="editorConfig()"
                  (contentChange)="onContentChange($event)"
                  (editableChange)="onEditableChange($event)" />
              </div>
            } @else {
              <app-code-view />
            }
          </div>
        </main>

        <app-configuration-panel />
      </div>

      <app-state-debug />
      <app-toast-container />
      <app-discovery-hints />
    </div>
  `,
  styles: [
    `
      @import "../styles/task-list.css";

      * {
        box-sizing: border-box;
        margin: 0;
        padding: 0;
      }

      body {
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        line-height: 1.5;
        color: var(--text-main);
        background: var(--app-bg);
        font-size: 14px;
      }

      .app {
        min-height: 100vh;
        background: var(--app-bg);
        position: relative;
        transition: background 0.3s ease, color 0.3s ease;
      }

      .app.dark .editor-main {
        background: var(--app-bg);
      }

      .container {
        display: block;
        min-height: 100vh;
      }

      .editor-main {
        width: var(--editor-width);
        max-width: 800px;
        margin: 0 auto;
        padding: 2rem;
        background: var(--app-bg);
        min-height: 100vh;
        position: relative;
        transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        transform: translateX(0);
      }

      .config-panel-open .editor-main {
        width: var(--editor-width-with-panel);
        max-width: 800px;
        transform: translateX(calc((-2 * var(--panel-width)) + 50%));
      }

      .theme-panel-open .editor-main {
        width: var(--editor-width-with-panel);
        max-width: 800px;
        transform: translateX(calc((2 * var(--panel-width)) - 50%));
      }

      @media (min-width: 769px) and (max-width: 1199px) {
        .config-panel-open .editor-main {
          transform: translateX(calc(-50vw + 50% + 2rem));
        }
        .theme-panel-open .editor-main {
          transform: translateX(calc(50vw - 50% - 2rem));
        }
      }

      @media (max-width: 768px) {
        .editor-main {
          width: var(--editor-width);
          max-width: 100%;
          margin: 0 auto;
          transform: none;
          padding: 1rem;
        }

        .config-panel-open .editor-main,
        .theme-panel-open .editor-main {
          width: var(--editor-width);
          max-width: 100%;
          margin: 0 auto;
          transform: none;
          transition-delay: 0s;
        }
      }

      .main-content {
        transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        padding-top: 5rem;
      }

      .editor-view {
        animation: fadeIn 0.15s cubic-bezier(0.4, 0, 0.2, 1);
      }

      .editor-view.fill-container-active {
        position: relative;
        border: 2px dashed var(--primary-color);
        border-radius: 12px;
        padding: 8px;
        padding-top: 20px;
        background: rgba(99, 102, 241, 0.03);
        animation: fadeIn 0.15s cubic-bezier(0.4, 0, 0.2, 1),
          fillContainerPulse 2s ease-in-out infinite;
        height: 450px;
        margin-top: 16px;
      }

      .editor-view.fill-container-active::before {
        content: "fillContainer: true • height: 450px";
        position: absolute;
        top: -12px;
        left: 12px;
        background: var(--primary-gradient);
        color: white;
        font-size: 11px;
        font-weight: 600;
        padding: 4px 12px;
        border-radius: 10px;
        z-index: 10;
        letter-spacing: 0.3px;
        box-shadow: 0 2px 8px rgba(99, 102, 241, 0.3);
      }

      @keyframes fillContainerPulse {
        0%, 100% {
          border-color: var(--primary-color);
          box-shadow: 0 0 0 0 rgba(var(--primary-color-rgb), 0.1);
        }
        50% {
          border-color: var(--primary-color);
          box-shadow: 0 0 0 4px rgba(var(--primary-color-rgb), 0.1);
        }
      }

      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
      }
    `,
  ],
})
export class TextEditorPageComponent {
  private editorRef = viewChild<AngularTiptapEditorComponent>("editorRef");
  private configService = inject(EditorConfigurationService);
  private i18nService = inject(AteI18nService);

  readonly editorState = this.configService.editorState;
  readonly demoContent = this.configService.demoContent;
  readonly toolbarConfig = this.configService.toolbarConfig;
  readonly bubbleMenuConfig = this.configService.bubbleMenuConfig;
  readonly slashCommandsConfig = this.configService.slashCommandsConfig;
  readonly currentLocale = this.i18nService.currentLocale;

  readonly finalAngularNodes = computed(
    () => {
      const nodes: AteAngularNode[] = [AI_LOADING_CONF];
      if (this.configService.isCounterEnabled()) nodes.push(COUNTER_CONF);
      if (this.configService.isWarningBoxEnabled()) nodes.push(WARNING_BOX_CONF);
      if (this.configService.isAiBlockEnabled()) nodes.push(AI_BLOCK_CONF);
      return nodes;
    },
    { equal: (a, b) => a.length === b.length && a.every((v, i) => v === b[i]) }
  );

  readonly finalTiptapExtensions = computed(
    () => {
      const exts: (Extension | Node | Mark)[] = [];
      if (this.editorState().enableTaskExtension) exts.push(TaskList, TaskItem);
      return exts;
    },
    { equal: (a, b) => a.length === b.length && a.every((v, i) => v === b[i]) }
  );

  readonly editorConfig = computed(() => {
    const state = this.editorState();
    const config: AteEditorConfig = {
      theme: state.darkMode ? "dark" : "light",
      mode: state.seamless ? "seamless" : "classic",
      height: state.height ? `${state.height}px` : undefined,
      autofocus: state.autofocus,
      placeholder: state.placeholder,
      editable: state.editable,
      minHeight: state.minHeight ? `${state.minHeight}px` : undefined,
      maxHeight: state.maxHeight ? `${state.maxHeight}px` : undefined,
      fillContainer: state.fillContainer,
      disabled: state.disabled,
      locale: this.currentLocale(),
      showToolbar: state.showToolbar,
      showFooter: state.showFooter,
      showCharacterCount: state.showCharacterCount,
      showWordCount: state.showWordCount,
      showEditToggle: state.showEditToggle,
      maxCharacters: state.maxCharacters,
      toolbar: this.toolbarConfig(),
      bubbleMenu: this.bubbleMenuConfig(),
      slashCommands: this.slashCommandsConfig(),
      floatingToolbar: state.floatingToolbar,
      showBubbleMenu: state.showBubbleMenu,
      showImageBubbleMenu: state.showImageBubbleMenu,
      showTableMenu: state.showTableBubbleMenu,
      showCellMenu: state.showCellBubbleMenu,
      enableSlashCommands: state.enableSlashCommands,
      angularNodes: this.finalAngularNodes(),
      tiptapExtensions: this.finalTiptapExtensions(),
      blockControls: state.blockControls,
    };
    return config;
  });

  constructor() {
    effect(() => {
      const editor = this.editorRef()?.editor();
      const commands = this.editorRef()?.editorCommandsService;
      if (editor && commands) {
        this.configService.setEditorReferences(editor, commands);
      }
    });

    effect(() => {
      const state = this.editorRef()?.editorState();
      if (state) this.configService.setLiveEditorState(state);
    });

    effect(() => {
      const isDark = this.editorState().darkMode;
      document.body.classList.toggle("dark", isDark);
    });
  }

  onContentChange(content: string) {
    this.configService.updateDemoContent(content);
  }

  onEditableChange(editable: boolean) {
    this.configService.updateEditorState({ editable });
  }

  onEditorHover(hovered: boolean) {
    this.configService.setEditorHovered(hovered);
  }
}
