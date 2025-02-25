import { Router } from 'express';
import { AuthController } from './controller';
import { AuthService } from '../../adapters/services/auth.service';
import { UserRepository } from '../../../data/mongo/models/user.model';
import { MongoDatabase } from '../../../data';

export class AuthRoutes {
  static get routes(): Router {
    const router = Router();

    const db = MongoDatabase.getDatabase();
    const userRepository = new UserRepository(db);
    const authService = new AuthService(userRepository);
    const controller = new AuthController(authService);

    // Definir las rutas
    router.post('/login', controller.loginUser);
    router.post('/register', controller.registerUser);
    router.get('/validate-email/:token', controller.validateEmail);

    return router;
  }
}
