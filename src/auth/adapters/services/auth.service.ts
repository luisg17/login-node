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
  
  public validateExpiration(expiration: string) {
    const regex = /^(\d{1,2}d\s*)?(\d{1,2}h\s*)?(\d{1,2}m\s*)?$/;
    if (!regex.test(expiration)) {
        throw CustomError.badRequest(
            'El formato de duración no es válido. Por favor, use combinaciones como:\n' +
            '- "1d" para 1 día\n' +
            '- "3h" para 3 horas\n' +
            '- "25m" para 25 minutos\n' +
            '- "1d 3h 25m" para combinaciones'
        );
    }

    let days = 0;
    let hours = 0;
    let minutes = 0;

    const dayMatch = expiration.match(/(\d{1,2})d/);
    const hourMatch = expiration.match(/(\d{1,2})h/);
    const minuteMatch = expiration.match(/(\d{1,2})m/);

    if (dayMatch) {
        days = parseInt(dayMatch[1], 10);
    }
    if (hourMatch) {
        hours = parseInt(hourMatch[1], 10);
    }
    if (minuteMatch) {
        minutes = parseInt(minuteMatch[1], 10);
    }

    if (days === 0 && hours === 0 && minutes === 0) {
        throw CustomError.badRequest(
            'Debe especificar al menos una unidad de tiempo. Por ejemplo:\n' +
            '- Días (1d, 2d, etc.)\n' +
            '- Horas (1h, 2h, etc.)\n' +
            '- Minutos (1m, 2m, etc.)'
        );
    }

    if (days < 0 || days > 730) {
        throw CustomError.badRequest(
            'La duración máxima no puede exceder 2 años (730 días).\n' +
            `Días especificados: ${days}`
        );
    }

    if (hours < 0 || hours > 23) {
        throw CustomError.badRequest(
            'Las horas deben estar entre 0 y 23.\n' +
            `Horas especificadas: ${hours}`
        );
    }

    if (minutes < 0 || minutes > 59) {
        throw CustomError.badRequest(
            'Los minutos deben estar entre 0 y 59.\n' +
            `Minutos especificados: ${minutes}`
        );
    }

    return {
        days,
        hours,
        minutes,
    };
}


  public async loginUser( UserEntity: UserEntity, duration: string) {
    const user = await UserModel.findOne({ email: UserEntity.email });
    if (!user) throw CustomError.badRequest('El correo no existe');

    const isMatching = bcryptAdapter.compare( UserEntity.password, user.password );
    if ( !isMatching ) throw CustomError.badRequest('La contrasena no es valida');


    const { password, ...userEntity} = UserEntity;
    
    const token = await JwtAdapter.generateToken({ id: user.id, email: user.email ,}, duration);
    if ( !token ) throw CustomError.internalServer('Error al crear token');

    return {
      user: userEntity,
      token: token,
    }
  }


}