import { Component, OnInit } from '@angular/core';
import { MarkdownService, MarkdownModule } from 'ngx-markdown';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { JoeLogger } from 'joe-fx';
import { NgIf } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

// tslint:disable:max-line-length
@Component({
    selector: 'iam-help',
    templateUrl: './iam-help.component.html',
    styleUrls: ['./iam-help.component.scss'],
    standalone: true,
    imports: [RouterLink, MatIconModule, NgIf, MarkdownModule]
})
export class IamHelpComponent implements OnInit {
    private readonly markdownPath = '/guides/';
    public filename = 'getting_started';

    constructor(route: ActivatedRoute, private markdownService: MarkdownService) {
        route.params.subscribe((p) => (this.filename = p.helpId || 'getting_started'));
    }

    ngOnInit() {
        this.initMarkdown();
    }

    public get filepath() {
        return this.markdownPath + this.filename + '.md';
    }

    public close(event: any) {
        JoeLogger.debug(event);
    }

    public onLoad(event: any) {
        JoeLogger.debug(event);
    }

    public onError(event: any) {
        JoeLogger.debug(event);
    }

    private initMarkdown() {
        this.markdownService.renderer.heading = (text: string, level: number) => {
            const escapedText = text.toLowerCase().replace(/[^\w]+/g, '-');
            return (
                '<h' +
                level +
                '>' +
                '<a name="' +
                escapedText +
                '" class="anchor" href="#' +
                escapedText +
                '">' +
                '<span class="header-link"></span>' +
                '</a>' +
                text +
                '</h' +
                level +
                '>'
            );
        };
    }
}
