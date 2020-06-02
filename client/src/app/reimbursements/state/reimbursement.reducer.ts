import {Reimbursement, ReimbursementStatus} from '../../domain/dto/reimbursement.dto';
import * as fromRoot from '../../app.reducer';
import {ReimbursementActions, ReimbursementActionTypes} from './reimbursement.actions';
import {createFeatureSelector, createSelector} from '@ngrx/store';

export interface State extends fromRoot.State {
  reimbursementState: ReimbursementsState;
}

export interface ReimbursementsState {
  reimbursements: Reimbursement[];
  hasBeenLoaded: boolean;
  isLoading: boolean;
  selected: Reimbursement;
  isCreating: boolean;
  wasLastCreatedReimbursementSuccessful: boolean;
  updateRequestSubmitted: boolean;
  wasLastUpdateSuccessful: boolean;
  createReimbursementErrorMessage: string;
}

const initialState: ReimbursementsState = {
  reimbursements: [],
  hasBeenLoaded: false,
  isLoading: false,
  selected: undefined,
  isCreating: false,
  wasLastCreatedReimbursementSuccessful: false,
  wasLastUpdateSuccessful: undefined,
  updateRequestSubmitted: false,
  createReimbursementErrorMessage: undefined
};

const getReimbursementState = createFeatureSelector<ReimbursementsState>('reimbursements');

export const getPendingReimbursements = createSelector(
  getReimbursementState,
  reimbursementState => reimbursementState.reimbursements && reimbursementState.reimbursements.filter(reimbursement => reimbursement.status === ReimbursementStatus.PENDING)
);

export const getApprovedReimbursements = createSelector(
  getReimbursementState,
  reimbursementState => reimbursementState.reimbursements && reimbursementState.reimbursements.filter(reimbursement => reimbursement.status === ReimbursementStatus.APPROVED)
);

export const getRejectedReimbursements = createSelector(
  getReimbursementState,
  reimbursementState => reimbursementState.reimbursements && reimbursementState.reimbursements.filter(reimbursement => reimbursement.status === ReimbursementStatus.REJECTED)
);

export const lastCreatedReimbursementStatus = createSelector(
  getReimbursementState,
  reimbursementState => !(reimbursementState.isCreating && reimbursementState.wasLastCreatedReimbursementSuccessful)
);

export const isUpdating = createSelector(
  getReimbursementState,
  state => state && state.updateRequestSubmitted
);

export const wasLastUpdateSuccessful = createSelector(
  getReimbursementState,
  state => state && !state.updateRequestSubmitted && state.wasLastUpdateSuccessful
);

export const lastCreateReimbursementErrorMessage = createSelector(
  getReimbursementState,
  reimbursementState => reimbursementState.createReimbursementErrorMessage
);

export const isLoadingMyReimbursements = createSelector(
  getReimbursementState,
  state => state.hasBeenLoaded && state.isLoading
);

export function reducer(state = initialState, action: ReimbursementActions): ReimbursementsState {
  switch (action.type) {
    case ReimbursementActionTypes.GET_MY_REIMBURSEMENTS:
      return { ...state, isLoading: true };
    case ReimbursementActionTypes.SUCCESSFUL_RETRIEVAL_OF_MY_REIMBURSEMENTS:
      const reimbursements: Reimbursement[] = Boolean(action.reimbursements) && Boolean(action.reimbursements.length) ? action.reimbursements : [];
      return { ...state, reimbursements, isLoading: false, hasBeenLoaded: true };
    case ReimbursementActionTypes.CREATE_REIMBURSEMENT:
      return { ...state, isCreating: true };
    case ReimbursementActionTypes.CREATE_REIMBURSEMENT_SUCCESS:
      return { ...state, wasLastCreatedReimbursementSuccessful: true, isCreating: false, createReimbursementErrorMessage: undefined };
    case ReimbursementActionTypes.CREATE_REIMBURSEMENT_FAILURE:
      return { ...state, wasLastCreatedReimbursementSuccessful: false, isCreating: false, createReimbursementErrorMessage: action.errorMessage };
    case ReimbursementActionTypes.UPDATE_REIMBURSEMENT_SUCCESS:
      const reimbursementsWithUpdated: Reimbursement[] = state.reimbursements.map((reim, index) => reim.id === action.reimbursement.id ? action.reimbursement : reim);
      return { ...state, reimbursements: reimbursementsWithUpdated, wasLastUpdateSuccessful: true, updateRequestSubmitted: false };
    case ReimbursementActionTypes.UPDATE_REIMBURSEMENT:
      return { ...state, updateRequestSubmitted: true };
    default:
      return state;
  }
}
