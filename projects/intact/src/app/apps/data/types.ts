import {ProjectsViewModel} from '../../_core';
import {ProjectDetailViewModel} from '../../projectsnav';
import {AppViewModel} from './app.viewmodel';
import {AppNewViewModel} from './app-new.viewmodel';
export type AppDataInput = [ProjectsViewModel, ProjectDetailViewModel, AppViewModel];
export type AppNewDataInput = [AppNewViewModel, ProjectsViewModel, ProjectDetailViewModel];
