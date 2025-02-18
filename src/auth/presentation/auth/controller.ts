import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { regularExps } from '../../../config';
import { CustomError } from '../../validations/errors/custom.error';
import { UserEntity } from '../../entities/user.entity';

export class AuthController {
  constructor(public readonly authService: AuthService) {}

  private handleError = (error: unknown, res: Response) => {
    if (error instanceof CustomError) {
      return res.status(error.statusCode).json({ error: error.message });
    }

    console.error(error);
    return res.status(500).json({ error: 'Internal server error' });
  };

  registerUser = async (req: Request, res: Response) => {
    try {
      const [error, registerDto] = UserEntity.create(req.body);
      
      if (error || !registerDto) {
        return res.status(400).json({ error: error || 'Invalid user data' });
      }
  
      const user = await this.authService.registerUser(registerDto);
      res.json(user);
    } catch (error) {
      this.handleError(error, res);
    }
  };
  

  loginUser = async (req: Request, res: Response) => {
    try {
      const apiKey = req.headers['x-api-key'] as string | undefined;
      if (!apiKey) {
        return res.status(403).json({ error: 'API key is required' });
      }

      await this.authService.validateApiKey(apiKey);

      const { email, password } = req.body;
      if (!email) return res.status(400).json({ error: 'El correo es requerido' });
      if (!regularExps.email.test(email)) return res.status(400).json({ error: 'El correo no es válido' });
      if (!password) return res.status(400).json({ error: 'La contraseña es requerida' });

      const user = await this.authService.loginUser(new UserEntity('', '', email, false, password, []));
      res.json(user);
    } catch (error) {
      this.handleError(error, res);
    }
  };

  validateEmail = (req: Request, res: Response) => {
    res.json('validateEmail');
  };
}
