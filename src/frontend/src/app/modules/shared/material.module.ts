import { NgModule } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatExpansionModule } from "@angular/material/expansion";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from "@angular/material/table";
import {MatMenuModule} from '@angular/material/menu';

@NgModule({
  declarations: [
  ],
  imports: [
    MatFormFieldModule,
    MatInputModule,
    MatTableModule,
    MatMenuModule,
    MatExpansionModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatButtonModule,
  ],
  exports: [
    MatFormFieldModule,
    MatInputModule,
    MatTableModule,
    MatMenuModule,
    MatExpansionModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatButtonModule
  ],
  bootstrap: []
})
export class MaterialModule { }
