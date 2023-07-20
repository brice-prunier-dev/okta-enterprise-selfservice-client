import {Routes} from "@angular/router";
import {AuthGuard} from "../_core";
import {ProjectDetailResolver} from "../projectsnav";
import {ProjectHomeComponent} from "./ui/project-home.component";

export const PROJECTS_ROUTES: Routes = [
    {
        path: '',
        component: ProjectHomeComponent,
        resolve: { inputs: ProjectDetailResolver },
        canActivate: [ AuthGuard ]
    }
];