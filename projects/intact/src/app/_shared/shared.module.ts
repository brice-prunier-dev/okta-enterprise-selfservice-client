// ────────────────────────────────────────────────────────────────────────────────
import { ObserversModule } from '@angular/cdk/observers';
import { PlatformModule } from '@angular/cdk/platform';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { ClipboardModule } from '@angular/cdk/clipboard';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
// ────────────────────────────────────────────────────────────────────────────────
// tslint:disable-next-line:max-line-length
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatCommonModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule } from '@angular/material/dialog';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatNativeDateModule, MatRippleModule } from '@angular/material/core';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSliderModule } from '@angular/material/slider';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatStepperModule } from '@angular/material/stepper';
import { MatTabsModule } from '@angular/material/tabs';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTableModule } from '@angular/material/table';
import { MatTreeModule } from '@angular/material/tree';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MAT_DATE_FORMATS } from '@angular/material/core';

// ────────────────────────────────────────────────────────────────────────────────
import { ArrayLabelPipe } from './pipes/arraylabel.pipe';
import { DashPartPipe } from './pipes/dashpart.pipe';
import { DefaultPipe } from './pipes/default.pipe';
import { EmptyListPipe } from './pipes/emptylist.pipe';
import { ValidationMessagePipe } from './pipes/valmsg.pipe';
import { ValidationMessageListPipe } from './pipes/valmsglst.pipe';
import { UserTypePipe } from './pipes/usrtyp.pipe';
import { PascalCasePipe } from './pipes/pascal-case.pipe';
import { FilterPipe } from './pipes/filter';

// ────────────────────────────────────────────────────────────────────────────────

import { AppMenuComponent } from './ui/app-menu.component';
import { ValidationComponent } from './ui/app-validation.component';
import { ErrorComponent } from './ui/app-error.component';
import { JoeLogger } from 'joe-fx';

import { ConfirmService } from './services/confirm.service';
import { ConfirmDialogComponent } from './ui/confirm-dialog.component';
import { InputService } from './services/input.service';
import { InputDialogComponent } from './ui/input-dialog.component';
// ────────────────────────────────────────────────────────────────────────────────
@NgModule({
    imports: [
        RouterModule,
        CommonModule,
        MatAutocompleteModule,
        MatBadgeModule,
        MatBottomSheetModule,
        MatButtonModule,
        MatButtonToggleModule,
        MatCardModule,
        MatCheckboxModule,
        MatChipsModule,
        MatCommonModule,
        MatDatepickerModule,
        MatDialogModule,
        MatExpansionModule,
        FormsModule,
        MatFormFieldModule,
        MatGridListModule,
        MatIconModule,
        MatInputModule,
        MatListModule,
        MatMenuModule,
        MatNativeDateModule,
        MatPaginatorModule,
        MatProgressBarModule,
        MatProgressSpinnerModule,
        MatRadioModule,
        MatRippleModule,
        MatSelectModule,
        MatSidenavModule,
        MatSlideToggleModule,
        MatSliderModule,
        MatProgressBarModule,
        MatSnackBarModule,
        MatStepperModule,
        MatToolbarModule,
        MatTooltipModule,
        MatTabsModule,
        MatTableModule,
        MatTreeModule,
        ObserversModule,
        ReactiveFormsModule,
        ClipboardModule,
        ScrollingModule,
        PlatformModule,
        AppMenuComponent,
        ErrorComponent,
        ValidationComponent,
        DashPartPipe,
        DefaultPipe,
        EmptyListPipe,
        FilterPipe,
        ValidationMessagePipe,
        ValidationMessageListPipe,
        ArrayLabelPipe,
        UserTypePipe,
        PascalCasePipe,
        ConfirmDialogComponent,
        InputDialogComponent
    ],
    exports: [
        RouterModule,
        MatAutocompleteModule,
        MatBadgeModule,
        MatBottomSheetModule,
        MatButtonModule,
        MatButtonToggleModule,
        MatCardModule,
        MatCheckboxModule,
        MatChipsModule,
        MatCommonModule,
        MatDatepickerModule,
        MatDialogModule,
        FormsModule,
        MatFormFieldModule,
        MatExpansionModule,
        MatGridListModule,
        MatIconModule,
        MatInputModule,
        MatListModule,
        MatMenuModule,
        MatNativeDateModule,
        MatPaginatorModule,
        MatProgressBarModule,
        MatProgressSpinnerModule,
        MatRadioModule,
        MatRippleModule,
        MatSelectModule,
        MatSlideToggleModule,
        MatSliderModule,
        MatSnackBarModule,
        MatStepperModule,
        MatSidenavModule,
        MatTabsModule,
        MatToolbarModule,
        MatTooltipModule,
        MatTableModule,
        MatTreeModule,
        ReactiveFormsModule,
        ObserversModule,
        PlatformModule,
        ClipboardModule,
        ScrollingModule,
        ArrayLabelPipe,
        UserTypePipe,
        FilterPipe,
        AppMenuComponent,
        ErrorComponent,
        DashPartPipe,
        DefaultPipe,
        EmptyListPipe,
        PascalCasePipe,
        ValidationMessagePipe,
        ValidationMessageListPipe,
        ValidationComponent,
        ConfirmDialogComponent
    ],
    providers: [ConfirmService, InputService]
})
export class SharedModule {}
