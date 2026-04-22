import { AngularTiptapEditorComponent, AteEditorConfig } from '@flogeez/angular-tiptap-editor';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-notion-editor',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AngularTiptapEditorComponent, ReactiveFormsModule],
  template: `
    <div class="notion-page">
      <input
        class="notion-title"
        type="text"
        [value]="title()"
        (input)="title.set($any($event.target).value)"
        placeholder="Untitled"
        aria-label="Document title"
      />
      <angular-tiptap-editor [formControl]="content" [config]="editorConfig" />
    </div>
  `,
  styles: [`
    :host { display: block; }

    .notion-page {
      max-width: 720px;
      margin: 0 auto;
      padding: 48px 96px;
    }

    .notion-title {
      display: block;
      width: 100%;
      border: none;
      outline: none;
      background: transparent;
      font-size: 2.5rem;
      font-weight: 700;
      margin-bottom: 24px;
      color: inherit;
      padding: 0;
    }

    .notion-title::placeholder {
      color: rgba(55, 53, 47, 0.4);
    }
  `],
})
export class NotionEditorComponent {
  title = signal('');
  content = new FormControl('');

  editorConfig: AteEditorConfig = {
    mode: 'seamless',
    placeholder: "Type '/' for commands...",
    blockControls: 'outside',
    autofocus: 'end',
    showFooter: true,
    showWordCount: true,
    slashCommands: {
      heading1: true,
      heading2: true,
      heading3: true,
      bulletList: true,
      orderedList: true,
      blockquote: true,
      code: true,
      image: true,
      horizontalRule: true,
      table: true,
    },
  };
}
