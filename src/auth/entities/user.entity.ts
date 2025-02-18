import { CustomError } from '../validations/errors/custom.error';

export class UserEntity {
  constructor(
    public email: string,
    public password: string,
    public role?: ['root'],
    public name?: string,
    public emailValidated?: false,
    public img?: string
  ) {}

  static create(object: { [key: string]: any }): [string | null, UserEntity | null] {
    try {
      return [null, UserEntity.fromObject(object)];
    } catch (error) {
      return [error instanceof CustomError ? error.message : 'Invalid data', null];
    }
  }

  static fromObject(object: { [key: string]: any }): UserEntity {
    const {  name, email, emailValidated, password, role, img } = object;

    if (!name) throw CustomError.badRequest('Missing name');
    if (!email) throw CustomError.badRequest('Missing email');
    if (!password) throw CustomError.badRequest('Missing password');

    return new UserEntity( name, email, password, role, emailValidated,img);
  }
}
