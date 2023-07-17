import '@angular/common/locales/global/en';
import { MediaMatcher } from '@angular/cdk/layout';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import { CDH_UNIT } from 'intact-models';

import { DateAdapter, MAT_DATE_LOCALE, MAT_DATE_FORMATS } from '@angular/material/core';
import {
    MAT_MOMENT_DATE_ADAPTER_OPTIONS,
    MomentDateAdapter
} from '@angular/material-moment-adapter';
import { AppUsagesBaseComponent } from '../app-usages.base.component';
import 'moment/locale/en-gb';

// const moment = _rollupMoment || _moment;
// See the Moment.js docs for the meaning of these formats:
// https://momentjs.com/docs/#/displaying/format/
export const DT_MY_FORMATS = {
    parse: {
        dateInput: 'YYYY-MM'
    },
    display: {
        dateInput: 'YYYY-MM',
        monthYearLabel: 'YYYY MMM',
        dateA11yLabel: 'LL',
        monthYearA11yLabel: 'YYYY MMMM'
    }
};

@Component({
    selector: 'iam-app-usages-daily',
    templateUrl: './app-usages-daily.component.html',
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

        { provide: MAT_DATE_FORMATS, useValue: DT_MY_FORMATS }
    ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppUsagesDailyComponent extends AppUsagesBaseComponent {
    constructor(cd: ChangeDetectorRef, media: MediaMatcher) {
        super(cd, media);
        this.unit = CDH_UNIT.countPerDay;
    }
}
