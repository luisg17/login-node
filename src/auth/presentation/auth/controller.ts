import { Request, Response } from 'express';
import { CustomError, User, RegisterUserDto } from '../../../domain';
import { AuthService } from '../services/auth.service';
import { regularExps } from '../../../config';




export class AuthController {

  // DI
  constructor(
    public readonly authService: AuthService,
  ) {}

  private handleError = (error: unknown, res: Response ) => {
    if ( error instanceof CustomError ) {
      return res.status(error.statusCode).json({ error: error.message });
    }

    console.log(`${ error }`);
    return res.status(500).json({ error: 'Internal server error' })
  } 


  registerUser = (req: Request, res: Response) => {
    const [error, registerDto] = RegisterUserDto.create(req.body);
    if ( error ) return res.status(400).json({error})


    this.authService.registerUser(registerDto!)
      .then( (user) => res.json(user) )
      .catch( error => this.handleError(error, res) );
      
  }



  loginUser = async (req: Request, res: Response) =>  {

    const apiKey = req.headers['x-api-key'] as string | undefined;
    console.log(apiKey);
    this.authService.validateApiKey(apiKey); 


    const { email, password } = req.body;
      if (!email) return res.status(400).json({ error: 'El correo es requerido' });
      if (!regularExps.email.test(email)) return res.status(400).json({ error: 'El correo no es válido' });
      if (!password) return res.status(400).json({ error: 'La contraseña es requerida' });


      const user = await this.authService.loginUser(new User(email, password));
      res.json(user);
      
  }



  validateEmail = (req: Request, res: Response) => {

    res.json('validateEmail');
  }



}