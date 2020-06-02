import {Action} from "@ngrx/store";
import {RegistrationForm} from "../../domain/dto/registration-form";
import {Message} from "../../domain/dto/message.dto";

export enum RegistrationActionTypes {
  ATTEMPT_REGISTRATION = "[Registration] Attempting to register",
  REGISTRATION_SUCCESSFUL = "[Registration] Action Success",
  REGISTRATION_FAILURE = "[Registration] Action Failed",
  CHECK_USERNAME_AVAILABILITY = "[Registration] Checking Username Available",
  USERNAME_IS_AVAILABLE = "[Registration] Username Is Available",
  USERNAME_IS_NOT_AVAILABLE = "[Registration] Username Is Not Available",
  CLEAR_REGISTRATION_STATE = "[Registration] Clear State"
}

export class AttemptRegistrationAction implements Action {
  readonly type = RegistrationActionTypes.ATTEMPT_REGISTRATION;

  constructor(public form: RegistrationForm) {}
}

export class RegistrationSuccessAction implements Action {
  readonly type = RegistrationActionTypes.REGISTRATION_SUCCESSFUL;

  constructor(public message: Message) {}
}

export class RegistrationFailureAction implements Action {
  readonly type = RegistrationActionTypes.REGISTRATION_FAILURE;

  constructor(public message: Message) {}
}

export class CheckUsernameAvailabilityAction implements Action {
  readonly type = RegistrationActionTypes.CHECK_USERNAME_AVAILABILITY;

  constructor(public username: string) {}
}

export class UsernameAvailableAction implements Action {
  readonly type = RegistrationActionTypes.USERNAME_IS_AVAILABLE;

  constructor() {}
}

export class UsernameIsNotAvailableAction implements Action {
  readonly type = RegistrationActionTypes.USERNAME_IS_NOT_AVAILABLE;

  constructor() {}
}

export class ClearRegistrationState implements Action {
  readonly type = RegistrationActionTypes.CLEAR_REGISTRATION_STATE;

  constructor() {}
}

export type RegistrationActions = AttemptRegistrationAction |
  RegistrationSuccessAction |
  RegistrationFailureAction |
  CheckUsernameAvailabilityAction |
  UsernameAvailableAction |
  UsernameIsNotAvailableAction |
  ClearRegistrationState;
