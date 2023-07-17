import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from '../_core';
import { ProjectHomeComponent } from './ui/project-home.component';
import { ProjectDetailResolver } from '../projectsnav';

const routes: Routes = [
    {
        path: '',
        component: ProjectHomeComponent,
        resolve: { inputs: ProjectDetailResolver },
        canActivate: [ AuthGuard ],
    }
];


@NgModule( {
    imports: [ RouterModule.forChild( routes ) ],
    exports: [ RouterModule ]
} )
export class ProjectsRoutingModule { }

