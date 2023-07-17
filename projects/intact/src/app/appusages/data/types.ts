import { AppViewModel } from '../../apps';
import { ProjectDetailViewModel } from '../../projectsnav';
import { AppUsagesContext } from './app-usages.context';
import { UserUsagesContext } from './user-usage.context';
export type AppUsagesDataInput = [
    ProjectDetailViewModel,
    AppViewModel,
    AppUsagesContext,
    UserUsagesContext
];
