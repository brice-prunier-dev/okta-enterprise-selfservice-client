import {ListDataModel, StoreManager, RuntimeEntry, IRuntimeContext} from 'joe-viewmodels';
import {UserDocData, UserDocType} from 'intact-models';
import {GroupLinkView, PROJECT_STORE, GROUP_ME_ID} from 'intact-models';
import {ProjectsService} from '../services/projects.service';
import {GlobalState} from '../services/global.state';

export class GroupMembersViewModel extends ListDataModel<UserDocData> {
    constructor(entry: RuntimeEntry, parentContext?: IRuntimeContext) {
        super(entry, UserDocType, parentContext);
        this.contextname = 'Group Members';
    }
    public group!: GroupLinkView;

    public loadOp(userState?: GlobalState): Promise<any> {
        const self = this;
        const proxy = StoreManager.INSTANCE.store<ProjectsService>(PROJECT_STORE);
        if (this.group.oid !== GROUP_ME_ID) {
            this.runningOp = 'Loading users...';
            return proxy
                .getGroupMembersAsync(this.group.oid)
                .then((r) => {
                    self.setView(r);
                })
                .catch((err) => {
                    self.setError(err);
                });
        } else if (userState) {
            this.setView([
                {
                    status: 'ACTIVE',
                    created: '',
                    activated: '',
                    lastLogin: '',
                    profile: {
                        login: userState.login,
                        firstName: userState.userName.split(' ')[0],
                        lastName: userState.userName.substring(1 + userState.userName.indexOf(' ')),
                        email: userState.mail,
                        secondEmail: '',
                        userType: 'I',
                        locale: '',
                        legalEntityId: '',
                        accountId: '',
                        preferredLanguage: '',
                        locationId: ''
                    },
                    groupNames: [],
                    b2e: false
                }
            ]);
            return Promise.resolve(true);
        } else {
            return Promise.resolve(true);
        }
    }
}
