import {ErrorHandler, NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {AppComponent} from './app.component';
import {AppRoutingModule} from './app-routing.module';
import {UploadComponent} from './components/upload/upload.component';
import {EventService} from './services/app.event.service';
import {AgmCoreModule} from '@agm/core';
import {DashboardComponent} from './components/dashboard/dashboard.component';
import {AboutComponent} from './components/about/about.component';
import {EventActionsComponent} from 'app/components/event-actions/event.actions.component';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {EventCardChartComponent} from './components/cards/event/chart/event.card.chart.component';
import {EventCardLapsComponent} from './components/cards/event/laps/event.card.laps.component';
import {
  MatButtonModule,
  MatButtonToggleModule,
  MatCardModule,
  MatChipsModule,
  MatCommonModule,
  MatExpansionModule,
  MatGridListModule,
  MatIconModule,
  MatMenuModule,
  MatProgressBarModule,
  MatSidenavModule,
  MatTableModule,
  MatTabsModule,
  MatToolbarModule,
  MatCheckboxModule,
  MatSliderModule,
  MatSnackBarModule,
  MatInputModule,
  MatListModule,
  MatSortModule, MatTooltipModule, MatDialogModule, MatSlideToggleModule,
} from '@angular/material';
import 'hammerjs';
import {EventCardComponent} from './components/cards/event/event.card.component';
import {SideNavComponent} from './components/sidenav/sidenav.component';
import {WeatherUndergroundWeatherService} from './services/weather/app.weather-underground.weather.service';
import {Angular2FontawesomeModule} from 'angular2-fontawesome';
import {CdkTableModule} from '@angular/cdk/table';
import {EventTableComponent} from './components/event-table/event.table.component';
import {ActionButtonService} from './services/action-buttons/app.action-button.service';
import {EventCardMapAGMComponent} from './components/cards/event/map/agm/event.card.map.agm.component';
import {GeoLocationInfoService} from './services/geo-location/app.geo-location-info.service';
import {EventLocalStorageService} from './services/storage/app.event.local.storage.service';
import {EventCardStatsComponent} from './components/cards/event/stats/event.card.stats.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {ActivityIconComponent} from './components/activity-icon/activity-icon.component';
import {ActivitiesCheckboxesComponent} from './components/acitvities-checkboxes/activities-checkboxes.component';
import {AppEventColorService} from './services/color/app.event.color.service';
import {UploadInfoComponent} from './components/upload-info/upload-info.component';
import {EventCardToolsComponent} from './components/cards/event/tools/event.card.tools.component';
import {ActivityHeaderComponent} from './components/activity-header/activity-header.component';
import * as Raven from 'raven-js';
import {environment} from '../environments/environment';
import {HttpClientModule} from '@angular/common/http';
import {EventFormComponent} from './components/event-form/event.form.component';
import {ActivityActionsComponent} from './components/activity-actions/activity.actions.component';
import {ActivityFormComponent} from './components/activity-form/activity.form.component';
import {MapActionsComponent} from './components/map-actions/map.actions.component';
import {AmChartsModule} from '@amcharts/amcharts3-angular';
import {MapSettingsLocalStorageService} from './services/storage/app.map.settings.local.storage.service';
import {MapSettingsService} from './services/app.map.settings.service';

Raven
  .config('https://e6aa6074f13d49c299f8c81bf162d88c@sentry.io/1194244', {
    environment: environment.production ? 'Production' : 'Development',
    shouldSendCallback: function () {
      return environment.production;
    }
  })
  .install();

export class RavenErrorHandler implements ErrorHandler {
  handleError(err: any): void {
    Raven.captureException(err);
  }
}

@NgModule({
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    HttpClientModule,
    AgmCoreModule.forRoot({
      apiKey: 'AIzaSyAV0ilIsl02eRaIibidoeZ2SX03a5ud-bQ',
      apiVersion: '3.31'
    }),
    AmChartsModule,
    ReactiveFormsModule,
    MatExpansionModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatCardModule,
    MatIconModule,
    MatCommonModule,
    MatMenuModule,
    MatTabsModule,
    MatSidenavModule,
    MatToolbarModule,
    MatGridListModule,
    MatTableModule,
    CdkTableModule,
    MatChipsModule,
    MatCheckboxModule,
    MatSliderModule,
    MatSnackBarModule,
    MatInputModule,
    MatListModule,
    FormsModule,
    Angular2FontawesomeModule,
    MatProgressBarModule,
    MatTableModule,
    MatSortModule,
    MatTooltipModule,
    MatDialogModule,
    MatSlideToggleModule,
  ],
  declarations: [
    AppComponent,
    SideNavComponent,
    DashboardComponent,
    UploadComponent,
    ActivityIconComponent,
    ActivitiesCheckboxesComponent,
    EventCardComponent,
    EventActionsComponent,
    EventTableComponent,
    EventCardMapAGMComponent,
    EventCardStatsComponent,
    EventActionsComponent,
    EventCardLapsComponent,
    EventCardChartComponent,
    EventCardToolsComponent,
    AboutComponent,
    UploadInfoComponent,
    ActivityHeaderComponent,
    EventFormComponent,
    ActivityFormComponent,
    ActivityActionsComponent,
    MapActionsComponent,
  ],
  entryComponents: [
    EventFormComponent,
    ActivityFormComponent,
  ],
  providers: [
    EventLocalStorageService,
    MapSettingsLocalStorageService,
    MapSettingsService,
    EventService,
    ActionButtonService,
    WeatherUndergroundWeatherService,
    GeoLocationInfoService,
    AppEventColorService,
    // {provide: ErrorHandler, useClass: RavenErrorHandler}
    {provide: ErrorHandler, useClass: environment.production ? RavenErrorHandler : ErrorHandler}
  ],
  bootstrap: [AppComponent]
})

export class AppModule {
}
