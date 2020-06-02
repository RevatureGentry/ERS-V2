import {ChangeDetectionStrategy, Component, OnInit} from '@angular/core';
import * as fromManager from '../../state/manager.reducer';
import * as managerActions from '../../state/manager.actions';
import {select, Store} from "@ngrx/store";
import {
  FindAllReimbursementsAction,
  ResolveReimbursementAction,
  StaleManagerStateAction
} from "../../state/manager.actions";
import {BehaviorSubject, Observable, of} from "rxjs";
import {Reimbursement, ReimbursementStatus} from "../../../domain/dto/reimbursement.dto";
import {CollectionViewer, DataSource} from "@angular/cdk/collections";

@Component({
  selector: 'app-resolve-reimbursements',
  templateUrl: './resolve-reimbursements.component.html',
  styleUrls: ['./resolve-reimbursements.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ResolveReimbursementsComponent implements OnInit {

  pending$: Observable<Reimbursement[]>;
  resolved$: Observable<Reimbursement[]>;
  shouldDisplayPending: boolean = true;
  isLoading: Observable<boolean>;

  constructor(
    private store: Store<fromManager.State>,
  ) { }

  ngOnInit() {
    this.isLoading = this.store.pipe(select(fromManager.isLoadingManagerModule));
    this.pending$ = this.store.pipe(select(fromManager.getAllPendingReimbursements));
    this.resolved$ = this.store.pipe(select(fromManager.getAllResolvedReimbursements));
  }

  handleToggle() {
    this.shouldDisplayPending = !this.shouldDisplayPending;
  }

  getTableHeaders() {
    if (this.shouldDisplayPending) {
      return ["status", "expenseDate", "createdBy", "type", "amount", "description", "action"];
    } else {
      return ["status", "expenseDate", "createdBy", "type", "amount", "description", "resolvedBy", "resolvedOn"];
    }
  }

  refreshDataSource(reimbursements: Reimbursement[]): DataSource<Reimbursement> {
    if (reimbursements && reimbursements.length > 0) {
      return new class extends DataSource<Reimbursement> {
        connect(collectionViewer: CollectionViewer): Observable<Reimbursement[]> {
          return new BehaviorSubject(reimbursements);
        }

        disconnect(collectionViewer: CollectionViewer): void {
        }
      }
    } else {
      return new class extends DataSource<Reimbursement> {
        connect(collectionViewer: CollectionViewer): Observable<Reimbursement[]> {
          return new BehaviorSubject([]);
        }

        disconnect(collectionViewer: CollectionViewer): void {
        }
      }
    }
  }

  handleApproval(reimbursement: Reimbursement) {
    this.store.dispatch(new ResolveReimbursementAction({ id: reimbursement.id, status: ReimbursementStatus.APPROVED }))
  }

  handleRejection(reimbursement: Reimbursement) {
    this.store.dispatch(new ResolveReimbursementAction({ id: reimbursement.id, status: ReimbursementStatus.REJECTED }))
  }
}
