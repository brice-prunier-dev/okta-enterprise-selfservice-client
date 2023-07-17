import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import { MediaMatcher } from '@angular/cdk/layout';

import { CDH_UNIT } from 'intact-models';
import { AppUsagesBaseComponent } from '../app-usages.base.component';

import { DateAdapter, MAT_DATE_LOCALE, MAT_DATE_FORMATS } from '@angular/material/core';
import {
    MAT_MOMENT_DATE_ADAPTER_OPTIONS,
    MomentDateAdapter
} from '@angular/material-moment-adapter';
import 'moment/locale/en-gb';

// See the Moment.js docs for the meaning of these formats:
// https://momentjs.com/docs/#/displaying/format/
export const DT_YMD_FORMATS = {
    parse: {
        dateInput: 'YYYY-MM-DD'
    },
    display: {
        dateInput: 'YYYY-MM-DD',
        monthYearLabel: 'YYYY MM DD',
        dateA11yLabel: 'LL',
        monthYearA11yLabel: 'YYYY MM DDD'
    }
};

@Component({
    selector: 'iam-app-usages-hourly',
    templateUrl: './app-usages-hourly.component.html',
    styleUrls: ['../usages.base.component.scss'],
    providers: [
         { provide: MAT_MOMENT_DATE_ADAPTER_OPTIONS, useValue: 'en-gb'},
        // { provide: MAT_MOMENT_DATE_ADAPTER_OPTIONS, useValue: { useUtc: true } },
        // `MomentDateAdapter` can be automatically provided by importing `MomentDateModule` in your
        // application's root module. We provide it at the component level here, due to limitations of
        // our example generation script.
        {
            provide: DateAdapter,
            useClass: MomentDateAdapter,
            deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS]
        },

        { provide: MAT_DATE_FORMATS, useValue: DT_YMD_FORMATS }
    ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppUsagesHourlyComponent extends AppUsagesBaseComponent {
    constructor(cd: ChangeDetectorRef, media: MediaMatcher) {
        super(cd, media);
        this.unit = CDH_UNIT.countPerHour;
    }
}
