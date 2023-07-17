import { MediaMatcher } from '@angular/cdk/layout';
import {
    ChangeDetectorRef,
    Component,
    Input,
    OnChanges,
    OnDestroy,
    OnInit,
    SimpleChanges,
    ViewChild
} from '@angular/core';
import { MatDatepicker } from '@angular/material/datepicker';
import { CDH_UNIT, UsageFormat, UserDocData } from 'intact-models';
import { Subscription } from 'rxjs';
import { ChartConfiguration, ChartEvent, ChartType } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { DataOrigin, isBlank, isStringAssigned } from 'joe-fx';

import * as _moment from 'moment';
// tslint:disable-next-line:no-duplicate-imports
import {default as _rollupMoment} from 'moment';

const moment = _rollupMoment || _moment;


import { PageEvent } from '@angular/material/paginator';
import { UserUsagesContext } from '../data/user-usage.context';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';

@Component({ template: '' })
export abstract class UserUsagesBaseComponent implements OnInit, OnDestroy, OnChanges {
    // #region Properties

    private _momentDate: moment.Moment | undefined;
    private _selectedUser: string | undefined;
    private _stringDate: string | undefined;
    private subscribtions = new Subscription();

    protected unit: CDH_UNIT = CDH_UNIT.countPerMonth;

    readonly pageSize = 20;

    @Input() usrCdhCtx!: UserUsagesContext;
    @ViewChild(BaseChartDirective) chart!: BaseChartDirective;

    datasetCount: number = 0;
    lineChartData: ChartConfiguration['data'] = {
        datasets: [],
        labels: []
    };
    public lineChartOptions: ChartConfiguration['options'] = {
        // responsive: true,
        maintainAspectRatio: false,
        elements: {
            line: {
                tension: 0.5
            }
        },
        scales: {
            // We use this empty structure as a placeholder for dynamic theming.
            x: {},
            'y-axis-0': {
                position: 'left'
            }
        },
        plugins: {
            legend: { display: true }
        }
    };
    public lineChartType: ChartType = 'line';
    pageEvent: PageEvent | undefined;
    pageSizeOptions: number[] = [20];

    // #endregion Properties

    // #region Public Accessors

    get canvasWidth(): number {
        if (this.media.matchMedia('(max-width: 600px)')) {
            return 600;
        } else if (this.media.matchMedia('(max-width: 1200px)')) {
            return 700;
        } else if (this.media.matchMedia('(max-width: 1600px)')) {
            return 800;
        } else {
            return 900;
        }
    }

    userName: string | null = null;
    get email(): string {
        return this.usrCdhCtx?.query.userId || '';
    }

    emailChanged(value: string) {
        this.userName = null;
        this.usrCdhCtx.userFilter.next(value);
        this.usrCdhCtx.query.userId = value;
    }

    onUserSelection(arg: MatAutocompleteSelectedEvent) {
        const usr = arg.option.value as UserDocData;
        this.emailChanged(usr.profile.login);
        this.userName = usr.profile.firstName + ' ' + usr.profile.lastName;
    }

    get stringDate(): string {
        if (this._stringDate === undefined) {
            this._stringDate = this.usrCdhCtx.query.getStringDate();
        }
        return this._stringDate!;
    }

    set stringDate(value: string) {
        this._stringDate = value;
        const dateParts = value.split('-');
        this.usrCdhCtx.query.year = Number.parseInt(dateParts[0] || '2022');
        if (dateParts.length > 1) {
            this.usrCdhCtx.query.month = Number.parseInt(dateParts[1] || '1');
        }
        if (dateParts.length > 2) {
            this.usrCdhCtx.query.day = Number.parseInt(dateParts[2] || '1');
        }
    }

    get momentDate(): moment.Moment {
        const y = this._momentDate?.year() || 0;
        const _m = this._momentDate?.month();
        const m = ( _m === undefined ) ? -1 :  _m;
        const d = this._momentDate?.date() || 0;
        switch (this.unit) {
            case CDH_UNIT.countPerMonth:
                if (y === 0 || y != this.usrCdhCtx.query.year) {
                    this.momentDate = moment(this.usrCdhCtx.query.getStringDate());
                }
                break;

            case CDH_UNIT.countPerDay:
                if (
                    y === 0 ||
                    y != this.usrCdhCtx.query.year ||
                    m != this.usrCdhCtx.query.month
                ) {
                    this.momentDate = moment(this.usrCdhCtx.query.getStringDate());
                }
                break;

            default:
                if (
                    y === 0 ||
                    y != this.usrCdhCtx.query.year ||
                    m != this.usrCdhCtx.query.month ||
                    d != this.usrCdhCtx.query.day
                ) {
                    this.momentDate = moment(this.usrCdhCtx.query.getStringDate());
                }
        }
        return this._momentDate!;
    }

    set momentDate(value: moment.Moment) {
        this._momentDate = value;
        switch (this.unit) {
            case CDH_UNIT.countPerMonth:
                this.usrCdhCtx.query.$assign(
                    {
                        year: value.year()
                    },
                    true
                );
                break;

            case CDH_UNIT.countPerDay:
                this.usrCdhCtx.query.$assign(
                    {
                        year: value.year(),
                        month: value.month()
                    },
                    true
                );
                break;

            default:
                this.usrCdhCtx.query.$assign(
                    {
                        year: value.year(),
                        month: value.month(),
                        day: value.date()
                    },
                    true
                );
                break;
        }
    }

    // #endregion Public Accessors

    // #region Constructors

    constructor(private cd: ChangeDetectorRef, private media: MediaMatcher) {}

    // #endregion Constructors

    // #region Private Methods

    private refreshChart(): void {
        this.chart.update();
        this.refreshUI();
    }

    // #endregion Private Methods

    // #region Protected Methods

    protected refreshUI() {
        const self = this;
        setTimeout(() => self.cd.detectChanges(), 0);
    }

    // #endregion Protected Methods

    // #region Public Methods

    chartClicked(e: any): void {
        // if (e.active.length > 0) {
        //     const chart = e.active[0]._chart;
        //     const activePoints = chart.getElementAtEvent(e.event);
        //     if (activePoints.length > 0) {
        //         // get the internal index of slice in pie chart
        //         const clickedElementIndex = activePoints[0]._index;
        //         const label = chart.data.labels[clickedElementIndex];
        //         // get value by index
        //         const value = chart.data.datasets[0].data[clickedElementIndex];
        //         console.log(clickedElementIndex, label, value);
        //     }
        // }
        console.log(e);
    }

    chartHovered(e: any): void {
        console.log(e);
    }

    chosenMonthHandler(newDate: moment.Moment, datepicker: MatDatepicker<moment.Moment>) {
        this._momentDate = undefined;
        this.usrCdhCtx.query.$assign(
            {
                year: newDate.year(),
                month: newDate.month()
            },
            true
        );

        datepicker.close();
    }

    chosenYearHandler(newDate: moment.Moment, datepicker: MatDatepicker<moment.Moment>) {
        this._momentDate = undefined;
        this.usrCdhCtx.query.$assign(
            {
                year: newDate.year()
            },
            true
        );
        datepicker.close();
        this.refreshUI();
    }

    public cmdClear(): void {
        this.usrCdhCtx.clearQueries(this.unit);
        this.usrCdhCtx.setError(undefined);
        this.resetChartData();
    }

    public cmdHideAll(): void {
        for (let index = 0; index < this.lineChartData.datasets.length; index++) {
            this.chart.hideDataset(index, true);
        }
        this.refreshChart();
    }

    public cmdRunQuery(): void {
        if (this.cmdRunQueryEnabled()) {
            this.cmdClear();
            this.runQuery();
        }
    }

    public cmdRunQueryEnabled(): boolean {
        return (
            isStringAssigned(this.usrCdhCtx.query.label) &&
            !this.usrCdhCtx.query.$validation.withError() &&
            (this._momentDate != undefined || this._stringDate != undefined)
        );
    }

    public graphWithDatasets(): boolean {
        return this.lineChartData?.datasets?.length > 0;
    }

    ngOnChanges(changes: SimpleChanges) {
        if (this.usrCdhCtx?.loaded) {
            this.usrCdhCtx.query.unit = this.unit;
            console.debug('ApiUsageMonthlyComponent Initialized');
            const self = this;
            this.subscribtions.add(
                this.usrCdhCtx.query.$editor!.onViewChanged!.subscribe((p) => {
                    if (p.origin === DataOrigin.code) {
                        self.refreshUI();
                    }
                })
            );
            // this.refreshUI();
        }
    }

    ngOnDestroy(): void {
        this.subscribtions.unsubscribe();
    }

    ngOnInit(): void {
        //  this.resetChartData();
        console.debug('ApiUsageMonthlyComponent Init');
    }

    onPageChanged(newPage: PageEvent) {
        this.pageEvent = newPage;
        this.resetChartData();
    }

    public resetChartData(): void {
        this.lineChartData.datasets = [];
        const usageDataSet = this.usrCdhCtx.getUsageData(this.unit);
        if (usageDataSet.length > 0) {
            const usageData = usageDataSet[0];
            this.lineChartData.labels = usageData.response.labels;
            let index = 1;

            if (!isBlank(this._selectedUser) && usageData.pages) {
                usageData.response = usageData.pages[this._selectedUser!];
            }

            this.datasetCount = usageData.response.datasets.length;
            const pageIndex = this.pageEvent?.pageIndex || 0;
            const datasetPage =
                this.datasetCount > this.pageSize
                    ? usageData.response.datasets.slice(
                          pageIndex * this.pageSize,
                          (pageIndex + 1) * this.pageSize
                      )
                    : usageData.response.datasets;

            this.lineChartData.datasets = datasetPage;
        }
        this.refreshChart();
    }

    public runQuery(): void {
        const self = this;
        // const usageDataSet = this.usrCdhCtx.getUsageData(this.unit);
        this.usrCdhCtx.runningOp = 'Quering...';
        this.cd.markForCheck();
        this.usrCdhCtx.runQuery(this.unit)
            .then((r) => {
                self.usrCdhCtx.runningOp = undefined;
                self.resetChartData();
                })
            .catch((err) => {
                self.usrCdhCtx.setError(err );
                self.refreshUI();
            });
    }

    // #endregion Public Methods
}
