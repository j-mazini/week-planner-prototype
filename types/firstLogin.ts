/**
 * Form values for the “First Login” step: user sets an initial password before signing in normally.
 */
export interface FirstLoginData {
  email: string;
  password: string;
  confirmPassword: string;
}
