import {Routes} from "@angular/router";
import {OktaProfileComponent} from "./ui/okta-profile.component";

export const LOGIN_ROUTES: Routes = [
    { path: '', pathMatch: 'full', component: OktaProfileComponent },
];