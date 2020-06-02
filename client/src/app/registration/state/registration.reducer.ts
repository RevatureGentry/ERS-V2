import * as fromRoot from '../../app.reducer';
import {Message} from '../../domain/dto/message.dto';
import {RegistrationActions, RegistrationActionTypes} from './registration.actions';
import {createFeatureSelector, createSelector} from '@ngrx/store';

export interface State extends fromRoot.State {
  registration: RegistrationState;
}

export interface RegistrationState {
  usernameAvailable: boolean | undefined;
  checkingUsername: boolean;
  passwordValid: boolean | undefined;
  operationSuccessful: boolean | undefined;
  message: Message;
}

const initialState: RegistrationState = {
  usernameAvailable: undefined,
  checkingUsername: false,
  passwordValid: undefined,
  operationSuccessful: undefined,
  message: undefined
};

const getRegistrationState = createFeatureSelector<RegistrationState>("registration");

export const usernameAvailabilityHasBeenChecked = createSelector(
  getRegistrationState,
  state => state && state.usernameAvailable !== undefined
);

export const isCheckingUsername = createSelector(
  getRegistrationState,
  state => state && state.checkingUsername
);

export const isUsernameAvailable = createSelector(
  getRegistrationState,
  state => state && state.usernameAvailable
);

export const isUsernameValid = createSelector(
  getRegistrationState,
  state => state && { usernameAvailable: state.usernameAvailable }
);

export const wasRegistrationAttemptSuccessful = createSelector(
  getRegistrationState,
  state => state && state.operationSuccessful
);

export const registrationMessage = createSelector(
  getRegistrationState,
  state => state && state.message
);

export function reducer(state = initialState, action: RegistrationActions): RegistrationState {
  switch (action.type) {
    case RegistrationActionTypes.CHECK_USERNAME_AVAILABILITY:
      return { ...state, checkingUsername: true };
    case RegistrationActionTypes.USERNAME_IS_AVAILABLE:
      return { ...state, usernameAvailable: true, checkingUsername: false };
    case RegistrationActionTypes.USERNAME_IS_NOT_AVAILABLE:
      return { ...state, usernameAvailable: false, checkingUsername: false };
    case RegistrationActionTypes.REGISTRATION_SUCCESSFUL:
      return { ...state, operationSuccessful: true, message: action.message };
    case RegistrationActionTypes.REGISTRATION_FAILURE:
      return { ...state, operationSuccessful: false, message: action.message };
    case RegistrationActionTypes.CLEAR_REGISTRATION_STATE:
      return initialState;
    default:
      return state;
  }
}
