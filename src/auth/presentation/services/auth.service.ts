import { JwtAdapter, bcryptAdapter } from '../../../config';
import { UserModel } from '../../../data';
import { CustomError } from '../../validations/errors/custom.error';
import { UserEntity } from '../../entities/user.entity';
import { envs } from '../../../config';

export class AuthService {

  constructor() {}


  public async registerUser( UserEntity: UserEntity ) {

    const existUser = await UserModel.findOne({ email: UserEntity.email });
    if ( existUser ) throw CustomError.badRequest('El correo ya existe');

    try {
      const user = new UserModel(UserEntity);
      
      // Encriptar la contraseña
      user.password = bcryptAdapter.hash( UserEntity.password );
      
      await user.save();
      // JWT <---- para mantener la autenticación del usuario

      // Email de confirmación

      const { password, ...userEntity } = UserEntity;


      return { 
        user: userEntity, 
        token: 'ABC' 
      };

    } catch (error) {
      throw CustomError.internalServer(`${ error }`);
    }

  }
  private readonly VALID_API_KEY = envs.API_KEY;

  public validateApiKey(apiKey: string | undefined) {
    if (!apiKey) {
      throw CustomError.badRequest('el Api key es requerido');
    }
    
    if (apiKey !== this.VALID_API_KEY) {
      throw CustomError.badRequest('Api key no valido');
    }
  }

  public async loginUser( UserEntity: UserEntity) {
    const user = await UserModel.findOne({ email: UserEntity.email });
    if (!user) throw CustomError.badRequest('El correo no existe');

    const isMatching = bcryptAdapter.compare( UserEntity.password, user.password );
    if ( !isMatching ) throw CustomError.badRequest('La contrasena no es valida');


    const { password, ...userEntity} = UserEntity;
    
    const token = await JwtAdapter.generateToken({ id: user.id, email: user.email });
    if ( !token ) throw CustomError.internalServer('Error al crear token');

    return {
      user: userEntity,
      token: token,
    }



  }


}