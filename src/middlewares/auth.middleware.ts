import { HttpRequest, HttpResponse } from '../global.interface';
import { JwtService } from '../services/jwt.service';
import { CookieKey, CookieService } from '../services/cookie.service';
import { Users } from '../db/users';

export class AuthMiddleware {
  private readonly jwtService: JwtService;
  private readonly cookieService: CookieService;
  private readonly userRepository: Users;
  constructor() {
    this.jwtService = new JwtService();
    this.cookieService = new CookieService();
    this.userRepository = new Users();
  }

  public async check(req: HttpRequest, res: HttpResponse, next: () => void) {
    try {
      const jwt = this.cookieService.retrieveCookieValue(
        req?.headers?.cookie || '',
        CookieKey.JWT,
      );
      if (!jwt) {
        res.writeHead(401, 'Unauthorised');
        res.setHeader(
          'Set-Cookie',
          this.cookieService.createCookie(CookieKey.JWT, ''),
        );
        res.end();
        return;
      }

      const validatedUser = this.jwtService.validateJWT(jwt);
      if (!validatedUser?.email || typeof validatedUser.email !== 'string') {
        console.error({ validatedUser });
        res.writeHead(401, 'Unauthorised');
        res.setHeader(
          'Set-Cookie',
          this.cookieService.createCookie(CookieKey.JWT, ''),
        );
        res.end();
        return;
      }

      const foundUser = await this.userRepository.findUserByEmail(
        validatedUser.email,
      );

      if (!foundUser) {
        console.error({ foundUser });
        res.writeHead(401, 'Unauthorised');
        res.setHeader(
          'Set-Cookie',
          this.cookieService.createCookie(CookieKey.JWT, ''),
        );
        res.end();
        return;
      }

      res.locals = { user: foundUser };
      next();
    } catch (e) {
      console.error(e);
      res.writeHead(401, 'Unauthorised');
      res.setHeader(
        'Set-Cookie',
        this.cookieService.createCookie(CookieKey.JWT, ''),
      );
      res.end();
      return;
    }
  }
}
