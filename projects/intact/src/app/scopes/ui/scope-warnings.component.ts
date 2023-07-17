import { ChangeDetectorRef, Component, OnDestroy } from "@angular/core";
import { ActivatedRoute, Data } from "@angular/router";
import { Subscription } from "rxjs";
import { ProjectDetailViewModel } from "../../projectsnav";
import { MyKpiListViewModel } from "../../_app/data/my-kpi-list.viewmodel";
import { ProjectsViewModel } from "../../_core";
import { NgIf } from "@angular/common";

@Component({
    styles: [`
    @import '../../../styles/colors';

    div.tab-page {
      padding: 0px;
    }

    .warnings p {
      padding: 20px 45px;
      margin-bottom: 0px;
      width: 100%;
      cursor: default;
    }

    .warnings p:not(:last-child) {
      border-bottom: solid $gray-300 1px;
    }
  `],
    template: `
    <div *ngIf="initialized" class="tab-page">
      <div class="warnings">
        <p *ngIf="getWarnings().uselessScope">
          This Scope is <strong>not used</strong> anywhere
        </p>
      </div>
    </div>
  `,
    selector: 'scope-warnings',
    standalone: true,
    imports: [NgIf],
})
export class ScopeWarningsComponent implements OnDestroy {
  private _subscriptions = new Subscription();
  public projListVm!: ProjectsViewModel;
  public projVm!: ProjectDetailViewModel;
  public scopeId!: string;
  public myKpisVm!: MyKpiListViewModel;
  constructor(
    private _cd: ChangeDetectorRef,
    route: ActivatedRoute
  ){
    this._subscriptions.add(
      route.data.subscribe(this._inputsObserver.bind(this))
    );
  }

  _inputsObserver(d: Data) {
    this.projListVm = d.inputs[0];
    this.projVm = d.inputs[1];
    this.scopeId = d.inputs[2];
    this.myKpisVm = d.myKpis;
    this._cd.markForCheck();
    this._subscriptions.add(this.myKpisVm.onStateChanged.subscribe(() => this._cd.markForCheck()));
    this._subscriptions.add(this.projListVm.onStateChanged.subscribe(() => this._cd.markForCheck()));
  }

  get initialized() {
    return this.myKpisVm?.view !== undefined && this.projListVm?.view !== undefined;
  }

  getWarnings() {
    return this.myKpisVm.scopeWarnings(this.projVm.view, this.scopeId, this.projListVm.view);
  }

  ngOnDestroy(): void {
    this._subscriptions.unsubscribe();
  }

}
