import {Routes} from "@angular/router";
import {AppResolver} from "../apps";
import {AppGroupLinkComponent} from "./ui/appgroup-link.component";

export const APPGROUPS_ROUTES: Routes = [
    {
        path: '',
        component: AppGroupLinkComponent,
        resolve: { inputs: AppResolver },
    },
];
