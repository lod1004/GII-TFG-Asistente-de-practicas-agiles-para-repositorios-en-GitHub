import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { RepositoryInputComponent } from '../modules/repository-input/repository-input.component';
import { StatisticsComponent } from '../modules/statistics/statistics.component';
import { StatisticsListComponent } from '../modules/statistics/statistics-list/statistics-list.component';
import { ResultsComponent } from '../modules/results/results.component';
import { HeaderComponent } from '../modules/shared/header/header.component';
import { HeaderTabsComponent } from '../modules/shared/header/header-tabs/header-tabs.component';
import { FooterComponent } from '../modules/shared/footer/footer.component';
import { HttpClientModule } from '@angular/common/http';
import { TranslocoRootModule } from './transloco-root.module';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FooterComponent,
    HeaderComponent,
    HeaderTabsComponent,
    RepositoryInputComponent,
    ResultsComponent,
    StatisticsComponent,
    StatisticsListComponent,
    HttpClientModule,
    TranslocoRootModule,
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
