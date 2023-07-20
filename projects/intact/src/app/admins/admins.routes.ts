import {Routes} from "@angular/router";
import {AuthGuard} from "../_core";
import {AdminsResolver} from "./data/admins.resolver";
import {AdminListComponent} from "./ui/admin-list.component";

export const ADMINS_ROUTES: Routes = [
    { path: '', component: AdminListComponent, resolve: { inputs: AdminsResolver }, canActivate: [ AuthGuard ] },
  ];
  