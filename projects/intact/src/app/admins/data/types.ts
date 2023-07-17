import { ProjectsViewModel } from '../../_core';
import { PROJECTITEM_TYPE, AdministratedItemData } from 'intact-models';
import { Objview } from 'joe-fx';
import { OidData } from 'joe-models';

export type AdminListInput =
    | [ProjectsViewModel, PROJECTITEM_TYPE, Objview & OidData & AdministratedItemData]
    | [ProjectsViewModel, PROJECTITEM_TYPE, string];
