import { regularExps } from '../../../config';

export class User {
  constructor(
    public readonly email: string,
    private _password: string
  ) {
    if (!regularExps.email.test(email)) {
      throw new Error('El correo no es válido');
    }
    if (_password.length < 6) {
      throw new Error('La contraseña debe tener al menos 6 caracteres');
    }
  }

  get password(): string {
    return this._password;
  }

  changePassword(newPassword: string) {
    if (newPassword.length < 6) {
      throw new Error('La contraseña debe tener al menos 6 caracteres');
    }
    this._password = newPassword;
  }
}
