import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { RepositoryInputComponent } from '../modules/repository-input/repository-input.component';
import { StatisticsComponent } from '../modules/statistics/statistics.component';
import { StatisticsListComponent } from '../modules/statistics/statistics-list/statistics-list.component';
import { ResultsComponent } from '../modules/results/results.component';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    RepositoryInputComponent,
    ResultsComponent,
    StatisticsComponent,
    StatisticsListComponent
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
