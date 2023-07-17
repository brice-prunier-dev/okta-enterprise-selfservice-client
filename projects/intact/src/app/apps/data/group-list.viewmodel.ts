import {IRuntimeContext, RuntimeEntry, ListDataModel} from 'joe-viewmodels';
import {GroupLinkData, GroupLinkType} from 'intact-models';

export class GroupsViewModel extends ListDataModel<GroupLinkData> {
    // #region Properties Public (1)

    public selected!: GroupLinkData;

    // #endregion Properties Public (1)

    // #region Constructors (1)

    constructor(entry: RuntimeEntry, parentContext?: IRuntimeContext) {
        super(entry, GroupLinkType, parentContext);
        this.contextname = 'Group List';
    }

    // #endregion Constructors (1)
}
