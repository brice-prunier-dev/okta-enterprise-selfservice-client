import { Component, Input, Output, EventEmitter } from '@angular/core';
import type { AdministratedItemData, AppLinkView, ReferenceChangesData } from 'intact-models';
import { GroupLinkView } from 'intact-models';
import { isBlank, Objview, Setview } from 'joe-fx';
import { GlobalState } from '../../../_core';
import { MatSelectionListChange, MatListModule } from '@angular/material/list';
import { NgFor, NgIf } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { ValidationComponent } from '../../../_shared/ui/app-validation.component';

@Component({
    selector: 'iam-item-admin-list',
    templateUrl: './item-admin-list.component.html',
    styleUrls: ['./item-admin-list.component.scss'],
    standalone: true,
    imports: [ValidationComponent, MatIconModule, MatListModule, NgFor, NgIf]
})
export class ItemAdminListComponent {
    @Input() public view!: Objview & AdministratedItemData;
    @Input() public groups!: GroupLinkView[];
    @Input() public services: AppLinkView[] | undefined;
    @Input() public editable!: boolean;
    @Output() public changes = new EventEmitter<ReferenceChangesData>();

    constructor(private _userState: GlobalState) {}

    public get viewGroups(): GroupLinkView[] {
        return this.initialized
            ? this.editable
                ? this.groups
                : this.groups.filter((g) => this.isSelected(g.oid))
            : [];
    }

    public get viewServices(): AppLinkView[] {
        return this.initialized && this.withServices()
            ? this.editable
                ? this.services!.filter((s) => s.type === 'service')
                : this.services!.filter((s) => s.type === 'service' && this.isSelected(s.oid))
            : [];
    }

    public withServices(): boolean {
        return !isBlank(this.services) && this.services!.length > 0;
    }

    public get initialized(): boolean {
        return !!this.view && !!this.groups;
    }

    public isSelected(oid: string): boolean {
        return this.initialized ? this.view.admins.includes(oid) : false;
    }

    public adminsChanged(arg: MatSelectionListChange) {
        const changes: ReferenceChangesData = { added: [] as string[], removed: [] as string[]};
        const option = arg.options[0];
        const oid = option.value as string;
        if (option.selected) {
            changes.added.push(oid);
            if (!this.view.admins.includes(oid)) {
                (this.view.admins as Setview<string>).add(oid);
            }
        } else {
            changes.removed.push(oid);
            if (this.view.admins.includes(oid)) {
                (this.view.admins as Setview<string>).remove(oid);
            }
        }
        this.changes.emit(changes);
    }
}
