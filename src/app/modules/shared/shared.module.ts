import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [],
  imports: [CommonModule, FormsModule, ReactiveFormsModule, FontAwesomeModule],
  exports: [CommonModule, FormsModule, ReactiveFormsModule, FontAwesomeModule],
})
export class SharedModule {}
