import { Request, Response } from 'express';
import { AuthService } from '../../adapters/services/auth.service';
import { regularExps } from '../../../config';
import { CustomError } from '../../validations/errors/custom.error';

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
      const { name, email, password, img, role } = req.body;

      if (!name) return res.status(400).json({ error: 'El nombre es requerido' });
      if (!email) return res.status(400).json({ error: 'El correo es requerido' });
      if (!regularExps.email.test(email)) return res.status(400).json({ error: 'El correo no es válido' });
      if (!password) return res.status(400).json({ error: 'La contraseña es requerida' });

      const user = await this.authService.registerUser({ name, email, password, img, role, emailValidated :false });
      res.json(user);
    } catch (error) {
      this.handleError(error, res);
    }
  };

  loginUser = async (req: Request, res: Response) => {
    try {
      const apiKey = req.headers['x-api-key'] as string | undefined;
      const duration = req.headers['x-expiracion'] as string;
      const { email, password } = req.body;

      if (!apiKey) return res.status(403).json({ error: 'API key is required' });
      this.authService.validateApiKey(apiKey);

      if (!duration) return res.status(400).json({ error: 'Duración es requerida' });
      this.authService.validateExpiration(duration);

      if (!email) return res.status(400).json({ error: 'El correo es requerido' });
      if (!regularExps.email.test(email)) return res.status(400).json({ error: 'El correo no es válido' });
      if (!password) return res.status(400).json({ error: 'La contraseña es requerida' });

      const user = await this.authService.loginUser(email, password, duration);
      res.json(user);
    } catch (error) {
      this.handleError(error, res);
    }
  };

  validateEmail = (req: Request, res: Response) => {
    res.json('validateEmail');
  };
}
