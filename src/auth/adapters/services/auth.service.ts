import { JwtAdapter, bcryptAdapter } from '../../../config';
import { CustomError } from '../../validations/errors/custom.error';
import { envs } from '../../../config';
import { User, UserRepository } from '../../../data/mongo/models/user.model';

export class AuthService {
  private userRepository: UserRepository;
  private readonly VALID_API_KEY = envs.API_KEY;

  constructor(userRepository: UserRepository) {
    this.userRepository = userRepository;
  }

  public async registerUser(userData: Omit<User, '_id'>) {
    const existUser = await this.userRepository.findByEmail(userData.email);
    if (existUser) throw CustomError.badRequest('El correo ya existe');

    try {
      // Encriptar la contraseña antes de guardarla
      userData.password = bcryptAdapter.hash(userData.password);

      const user = await this.userRepository.create(userData);

      // Generar el token
      const token = await JwtAdapter.generateToken({ id: user._id, email: user.email });

      // Omitir la contraseña en la respuesta
      const { password, ...userEntity } = user;

      return {
        user: userEntity,
        token
      };
    } catch (error) {
      throw CustomError.internalServer(`${error}`);
    }
  }

  public async loginUser(email: string, password: string, duration: string) {
    const user = await this.userRepository.findByEmail(email);
    if (!user) throw CustomError.badRequest('El correo no existe');

    const isMatching = bcryptAdapter.compare(password, user.password);
    if (!isMatching) throw CustomError.badRequest('La contraseña no es válida');

    const token = await JwtAdapter.generateToken({ id: user._id, email: user.email }, duration);
    if (!token) throw CustomError.internalServer('Error al crear token');

    const { password: _, ...userEntity } = user;

    return {
      user: userEntity,
      token
    };
  }

  public validateApiKey(apiKey: string | undefined) {
    if (!apiKey) throw CustomError.badRequest('El API key es requerido');
    if (apiKey !== this.VALID_API_KEY) throw CustomError.badRequest('API key no válida');
  }

  public validateExpiration(expiration: string) {
    const regex = /^(\d{1,2}d\s*)?(\d{1,2}h\s*)?(\d{1,2}m\s*)?$/;
    if (!regex.test(expiration)) {
      throw CustomError.badRequest(
        'Formato de duración inválido. Use combinaciones como "1d", "3h", "25m", "1d 3h 25m".'
      );
    }

    let days = 0, hours = 0, minutes = 0;

    expiration.match(/(\d{1,2})d/)?.[1] && (days = parseInt(expiration.match(/(\d{1,2})d/)![1], 10));
    expiration.match(/(\d{1,2})h/)?.[1] && (hours = parseInt(expiration.match(/(\d{1,2})h/)![1], 10));
    expiration.match(/(\d{1,2})m/)?.[1] && (minutes = parseInt(expiration.match(/(\d{1,2})m/)![1], 10));

    if (days === 0 && hours === 0 && minutes === 0) {
      throw CustomError.badRequest('Debe especificar al menos una unidad de tiempo.');
    }
    if (days > 730) throw CustomError.badRequest('Duración máxima: 2 años (730 días).');
    if (hours > 23) throw CustomError.badRequest('Las horas deben estar entre 0 y 23.');
    if (minutes > 59) throw CustomError.badRequest('Los minutos deben estar entre 0 y 59.');

    return { days, hours, minutes };
  }
}
