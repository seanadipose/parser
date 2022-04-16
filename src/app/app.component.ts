import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-root',
  template: `
    <mat-grid-list cols="2" rowHeight="2:1">
      <mat-grid-tile>
        <textarea (keyup)="codeChange()" [(ngModel)]="code"></textarea>
      </mat-grid-tile>
      <mat-grid-tile>
        <div>Result: {{ result }}</div>
      </mat-grid-tile>
    </mat-grid-list>
  `,
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  worker!: Worker;
  code = '';
  result: any;
  title = 'parser';

  codeChange() {
    this.worker.postMessage(this.code);
  }

  constructor() {
    if (typeof Worker !== 'undefined') {
      // Create a new
      this.worker = new Worker(new URL('./app.worker', import.meta.url));
      this.worker.onmessage = ({ data }) => {
        this.result = data;
      };
    } else {
      // Web Workers are not supported in this environment.
      // You should add a fallback so that your program still executes correctly.
    }
  }
}
