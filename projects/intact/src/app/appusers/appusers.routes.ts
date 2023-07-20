import {Routes} from "@angular/router";
import {AppUserListResolver} from "./data/appuser-list.resolver";
import {AppUserListComponent} from "./ui/appuser-list.component";

export const APPUSERS_ROUTES: Routes = [
    { path: '', component: AppUserListComponent, resolve: { inputs: AppUserListResolver } },
  ];