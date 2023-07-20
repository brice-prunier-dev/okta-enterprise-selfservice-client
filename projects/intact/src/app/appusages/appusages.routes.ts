import {Routes} from "@angular/router";
import {AuthGuard} from "../_core";
import {AppUsagesResolver} from "./data/app-usages.resolver";
import {AppUsagesDetailComponent} from "./ui/app-usages-detail.component";

export const APPUSAGES_ROUTES: Routes = [
    {
        path: '',
        component: AppUsagesDetailComponent,
        resolve: { inputs: AppUsagesResolver },
        canActivate: [AuthGuard]
    }
];