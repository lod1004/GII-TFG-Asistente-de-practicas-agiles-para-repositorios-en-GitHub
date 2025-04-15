import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { RepositoryInputModule } from '../modules/repository-input/repository-input.module';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    RepositoryInputModule,
    AppRoutingModule
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
