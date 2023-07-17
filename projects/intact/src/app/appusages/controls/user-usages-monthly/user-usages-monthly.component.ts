import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { UserUsagesBaseComponent } from '../user-usages.base.component';
import { MediaMatcher } from '@angular/cdk/layout';
import { CDH_UNIT } from 'intact-models';

import '@angular/common/locales/global/en';
import { ChangeDetectionStrategy } from '@angular/core';
import {
    MAT_MOMENT_DATE_ADAPTER_OPTIONS,
    MomentDateAdapter
} from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE, MatOptionModule } from '@angular/material/core';
import { NgChartsModule } from 'ng2-charts';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { NgStyle, NgIf, NgFor, AsyncPipe } from '@angular/common';
import 'moment/locale/en-gb';

// See the Moment.js docs for the meaning of these formats:
// https://momentjs.com/docs/#/displaying/format/
export const DT_Y_FORMATS = {
    parse: {
        dateInput: 'YYYY'
    },
    display: {
        dateInput: 'YYYY',
        monthYearLabel: 'YYYY',
        dateA11yLabel: 'LL',
        monthYearA11yLabel: 'YYYY'
    }
};

@Component({
    selector: 'iam-user-usages-monthly',
    templateUrl: './user-usages-monthly.component.html',
    styleUrls: ['../usages.base.component.scss'],
    providers: [
        { provide: MAT_MOMENT_DATE_ADAPTER_OPTIONS, useValue: 'en-gb' },
        // { provide: MAT_MOMENT_DATE_ADAPTER_OPTIONS, useValue: { useUtc: true } },
        // `MomentDateAdapter` can be automatically provided by importing `MomentDateModule` in your
        // application's root module. We provide it at the component level here, due to limitations of
        // our example generation script.
        {
            provide: DateAdapter,
            useClass: MomentDateAdapter,
            deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS]
        },
        { provide: MAT_DATE_FORMATS, useValue: DT_Y_FORMATS }
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [NgStyle, MatProgressBarModule, NgIf, MatFormFieldModule, MatInputModule, FormsModule, MatAutocompleteModule, NgFor, MatOptionModule, MatDatepickerModule, MatButtonModule, MatTooltipModule, MatIconModule, MatPaginatorModule, NgChartsModule, AsyncPipe]
})
export class UserUsagesMonthlyComponent extends UserUsagesBaseComponent {
    constructor(cd: ChangeDetectorRef, media: MediaMatcher) {
        super(cd, media);
        this.unit = CDH_UNIT.countPerMonth;
    }
}
