import {
    Component,
    ChangeDetectionStrategy,
    OnChanges,
    Input,
    ChangeDetectorRef
} from '@angular/core';
import { ProjectsService, ProjectHistory } from '../../../_core';
import { ProjectDetailViewModel } from '../../../projectsnav';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { BehaviorSubject, Subject, switchMap, takeUntil } from 'rxjs';
import { MatTableModule } from '@angular/material/table';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { NgIf, NgClass, DatePipe } from '@angular/common';

@Component({
    selector: 'iam-project-history',
    templateUrl: './project-history.component.html',
    styleUrls: ['./project-history.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    animations: [
        trigger('detailExpand', [
            state('collapsed', style({ height: '0px', minHeight: '0', display: 'none' })),
            state('expanded', style({ height: '*' })),
            transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
        ]),
    ],
    standalone: true,
    imports: [
        NgIf,
        MatProgressBarModule,
        MatTableModule,
        NgClass,
        DatePipe,
    ],
})
export class ProjectHistoryComponent implements OnChanges {
    @Input() public vm!: ProjectDetailViewModel;

    constructor(private _cd: ChangeDetectorRef, private _projectSvc: ProjectsService) {}

    public displayedColumns: string[] = ['date', 'user', 'operation', 'description'];

    public records: ProjectHistory[] | undefined;
    public expandedRow: any;
    
    private shutdown$ = new Subject<void>();
    private projectId$ = new BehaviorSubject<string>('');

    public get loading(): boolean {
        return this.records === undefined;
    }

    public get withHistory(): boolean {
        return (this.records?.length || 0) > 0;
    }

    public ngOnInit() {
        this.fetchHistory();
    }

    public ngOnChanges() {
        const projectId = this.vm.entry.query.id as string;
        this.projectId$.next(projectId);
    }

    public ngOnDestroy(): void {
        this.shutdown$.next();
        this.shutdown$.complete()
    }

    private fetchHistory() {
        this.projectId$
        .pipe(
            takeUntil(this.shutdown$),
            switchMap((projectId) => {
                this.records = undefined;
                return this._projectSvc.getHistoryAsync(projectId);
            })
        )
        .subscribe(
            (result) => {
                this.records = result;
                this._cd.markForCheck();
            },
            (err) => {
                this.records = [];
            }
        );
    }

}
