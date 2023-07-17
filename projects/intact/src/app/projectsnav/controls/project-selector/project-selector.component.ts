import { Router } from '@angular/router';
import { MatAutocompleteSelectedEvent, MatAutocompleteModule } from '@angular/material/autocomplete';
import { ProjectsViewModel } from '../../../_core';
import { ProjectDetailViewModel } from '../../data/project-detail.viewmodel';
import {
    Component,
    ChangeDetectionStrategy,
    Input,
    ChangeDetectorRef,
    SimpleChanges,
    OnChanges
} from '@angular/core';
import { pascalCase } from 'joe-types';
import { JoeLogger } from 'joe-fx';
import { PascalCasePipe } from '../../../_shared/pipes/pascal-case.pipe';
import { MatOptionModule } from '@angular/material/core';
import { NgClass, NgFor } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
    selector: 'iam-project-selector',
    templateUrl: './project-selector.component.html',
    styleUrls: ['./project-selector.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [MatButtonModule, MatIconModule, MatFormFieldModule, MatInputModule, MatAutocompleteModule, FormsModule, NgClass, NgFor, MatOptionModule, PascalCasePipe]
})
export class ProjectSelectorComponent implements OnChanges {
    // #region Properties (8)
    @Input() public projListVm!: ProjectsViewModel;
    @Input() public vm!: ProjectDetailViewModel;

    public get myViewNames(): string[] {
        return this.projListVm ? this.projListVm.myViewNames : [];
    }

    public get currentProject(): string {
        return pascalCase(this.vm.entry.query.id as string);
    }

    // #endregion Private
    // #region Constructors (1)

    constructor(public router: Router, private _cd: ChangeDetectorRef) {}

    // #endregion Constructors (1)

    // #region Public Accessors (6)

    public onProjectSelection(arg: MatAutocompleteSelectedEvent) {
        const input = arg.option.value;
        if (this.vm && this.vm.loaded && this.vm.view.id !== input) {
            const router = this.router;
            router
                .navigateByUrl('/home', { skipLocationChange: true })
                .then(() => router.navigateByUrl('/projects/' + input + '/home'));
        }
        this._cd.markForCheck();
    }
    // #endregion Public Accessors (6)

    // #region Public Methods (7)

    public ngOnChanges(changements: SimpleChanges) {
        if (this.projListVm && this.vm && this.projListVm.currentProject === this.vm) {
            this._cd.markForCheck();
        }
    }

    public get homeUrl() {
        return '/projects/' + this.vm.view.id + '/home';
    }

    public ux() {
        return JoeLogger.env.startsWith('prod') ? ['nav', 'primary'] : ['nav', 'dark'];
    }
}
