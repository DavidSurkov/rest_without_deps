import {
  HttpRequest,
  HttpResponse,
  HttpResponseWithUserInLocals,
} from '../global.interface';
import { Users } from '../db/users';
import { JwtService } from '../services/jwt.service';
import { CookieKey, CookieService } from '../services/cookie.service';

export class UserController {
  private readonly userRepository: Users;
  private readonly jwtService: JwtService;
  private readonly cookieService: CookieService;

  constructor() {
    this.userRepository = new Users();
    this.jwtService = new JwtService();
    this.cookieService = new CookieService();
  }
  public async register(
    req: HttpRequest<{ name: string; email: string; password: string }>,
    res: HttpResponse,
  ) {
    if (!req.body) {
      res.writeHead(400, 'Bad request');
      res.end('Data must be provided');
      return;
    }
    let errorMessage = '';
    const { name, password, email } = req.body;
    if (!email) {
      errorMessage = 'Email';
    }
    if (!password) {
      errorMessage = `${errorMessage} Password`;
    }
    if (!name) {
      errorMessage = `${errorMessage} Name`;
    }
    if (!!errorMessage) {
      res.writeHead(400, 'Bad request');
      res.end(`${errorMessage} must be provided`);
      return;
    }

    const createdUser = await this.userRepository.createUser(req.body);
    res.writeHead(201, 'Created');
    res.end(JSON.stringify(createdUser));
  }

  public async getMyself(_req: HttpRequest, res: HttpResponseWithUserInLocals) {
    const user = res.locals.user;
    res.writeHead(200, 'OK');
    res.end(JSON.stringify(user));
  }

  public async signOut(_req: HttpRequest, res: HttpResponseWithUserInLocals) {
    res.setHeader(
      'Set-Cookie',
      this.cookieService.createCookie(CookieKey.JWT, ''),
    );
    res.writeHead(204, 'No Content');
    res.end();
  }

  public async signIn(
    req: HttpRequest<{ email: string; password: string }>,
    res: HttpResponse,
  ) {
    if (!req.body) {
      res.writeHead(400, 'Bad request');
      res.end('Data must be provided');
      return;
    }
    let errorMessage = '';
    const { password, email } = req.body;
    if (!email) {
      errorMessage = 'Email';
    }
    if (!password) {
      errorMessage = `${errorMessage} Password`;
    }
    if (!!errorMessage) {
      res.writeHead(400, 'Bad request');
      res.end(`${errorMessage} must be provided`);
      return;
    }

    const signedInUser = await this.userRepository.signIn({ email, password });
    if (!signedInUser) {
      res.writeHead(401, 'Unauthorised');
      res.end('Wrong email or password');
      return;
    }

    const jwt = this.jwtService.createJWT(signedInUser);
    res.setHeader(
      'Set-Cookie',
      this.cookieService.createCookie(CookieKey.JWT, jwt),
    );
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Cookie set');
  }
}
