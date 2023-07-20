import {Routes} from "@angular/router";
import {ApiSubscriptionsResolver} from "./data/app-subscriptions.resolver";
import {AppSubscriptionsPage} from "./ui/app-apis.page";

export const APPAPIS_ROUTES: Routes = [
    { path: '', component: AppSubscriptionsPage, resolve: { inputs: ApiSubscriptionsResolver } }
];