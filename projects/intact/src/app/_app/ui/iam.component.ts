import { Component, NgModule, Output, EventEmitter, Input } from '@angular/core';

import { JoeLogger } from 'joe-fx';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { ViewModelManager } from 'joe-viewmodels';

@Component({
    selector: 'iam-root',
    templateUrl: './iam.component.html',
    styleUrls: ['./iam.component.scss']
})
export class IamComponent {
    title = 'IAM APIs';

    constructor(iconRegistry: MatIconRegistry, sanitizer: DomSanitizer, private router: Router) {
        JoeLogger.header('IamComponent');

        iconRegistry.addSvgIcon('add', sanitizer.bypassSecurityTrustResourceUrl('assets/add.svg'));
        iconRegistry.addSvgIcon(
            'arrow_down',
            sanitizer.bypassSecurityTrustResourceUrl('assets/arrow_down.svg')
        );
        iconRegistry.addSvgIcon('api', sanitizer.bypassSecurityTrustResourceUrl('assets/api.svg'));
        iconRegistry.addSvgIcon(
            'api-small',
            sanitizer.bypassSecurityTrustResourceUrl('assets/api-2.svg')
        );
        iconRegistry.addSvgIcon(
            'api_sub',
            sanitizer.bypassSecurityTrustResourceUrl('assets/API-Sub.svg')
        );
        iconRegistry.addSvgIcon('app', sanitizer.bypassSecurityTrustResourceUrl('assets/app.svg'));
        iconRegistry.addSvgIcon(
            'client',
            sanitizer.bypassSecurityTrustResourceUrl('assets/ic_new_app.svg')
        );
        iconRegistry.addSvgIcon(
            'close',
            sanitizer.bypassSecurityTrustResourceUrl('assets/close.svg')
        );
        iconRegistry.addSvgIcon(
            'da',
            sanitizer.bypassSecurityTrustResourceUrl('assets/ic_da_svg.svg')
        );
        iconRegistry.addSvgIcon(
            'edit',
            sanitizer.bypassSecurityTrustResourceUrl('assets/edit.svg')
        );
        iconRegistry.addSvgIcon(
            'gem_menu',
            sanitizer.bypassSecurityTrustResourceUrl('assets/gem.svg')
        );
        iconRegistry.addSvgIcon(
            'grp',
            sanitizer.bypassSecurityTrustResourceUrl('assets/group.svg')
        );
        iconRegistry.addSvgIcon(
            'id',
            sanitizer.bypassSecurityTrustResourceUrl('assets/identity.svg')
        );
        iconRegistry.addSvgIcon(
            'intact',
            sanitizer.bypassSecurityTrustResourceUrl('assets/logo_intact.svg')
        );
        iconRegistry.addSvgIcon(
            'lock',
            sanitizer.bypassSecurityTrustResourceUrl('assets/lock.svg')
        );
        iconRegistry.addSvgIcon(
            'logo',
            sanitizer.bypassSecurityTrustResourceUrl('assets/logo.svg')
        );
        iconRegistry.addSvgIcon(
            'logout',
            sanitizer.bypassSecurityTrustResourceUrl('assets/shut_down.svg')
        );
        iconRegistry.addSvgIcon(
            'prj',
            sanitizer.bypassSecurityTrustResourceUrl('assets/project.svg')
        );
        iconRegistry.addSvgIcon(
            'project_menu',
            sanitizer.bypassSecurityTrustResourceUrl('assets/project-white.svg')
        );
        iconRegistry.addSvgIcon(
            'scp',
            sanitizer.bypassSecurityTrustResourceUrl('assets/scope.svg')
        );
        iconRegistry.addSvgIcon(
            'search',
            sanitizer.bypassSecurityTrustResourceUrl('assets/zoom.svg')
        );
        iconRegistry.addSvgIcon(
            'usr',
            sanitizer.bypassSecurityTrustResourceUrl('assets/profil.svg')
        );
        iconRegistry.addSvgIcon(
            'usr-provisioned',
            sanitizer.bypassSecurityTrustResourceUrl('assets/profil-provisioned.svg')
        );
        iconRegistry.addSvgIcon(
            'usr-inactive',
            sanitizer.bypassSecurityTrustResourceUrl('assets/profil-inactive.svg')
        );
        iconRegistry.addSvgIcon(
            'user',
            sanitizer.bypassSecurityTrustResourceUrl('assets/user.svg')
        );
        iconRegistry.addSvgIcon(
            'home',
            sanitizer.bypassSecurityTrustResourceUrl('assets/home.svg')
        );
        iconRegistry.addSvgIcon(
            'help',
            sanitizer.bypassSecurityTrustResourceUrl('assets/markdown.svg')
        );
        iconRegistry.addSvgIcon(
            'ws',
            sanitizer.bypassSecurityTrustResourceUrl('assets/web_service.svg')
        );
        iconRegistry.addSvgIcon(
            'is-swagger',
            sanitizer.bypassSecurityTrustResourceUrl('assets/is-swagger.svg')
        );
        iconRegistry.addSvgIcon('money_off', sanitizer.bypassSecurityTrustResourceUrl('assets/money_off.svg'));
        iconRegistry.addSvgIcon('person_off', sanitizer.bypassSecurityTrustResourceUrl('assets/person_off.svg'));

        iconRegistry.addSvgIcon('lock-light', sanitizer.bypassSecurityTrustResourceUrl('assets/lock-light.svg'));
      iconRegistry.addSvgIcon('launch-light', sanitizer.bypassSecurityTrustResourceUrl('assets/launch-light.svg'));

        router.events
            .pipe(filter((e) => e instanceof NavigationEnd))
            .subscribe({next: (v) => ViewModelManager.runGC()});
    }

    public contentClass() {
        return this.router.url.indexOf('projects') > 0
            ? ['main-outlet', 'side-nav-outlet']
            : ['main-outlet'];
    }
}
