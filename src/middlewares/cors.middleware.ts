import { HttpRequest, HttpResponse } from '../global.interface';
import { config } from '../helpers/loadEnv';

export class CorsMiddleware {
  apply(req: HttpRequest, res: HttpResponse, next: () => void) {
    res.setHeader('Access-Control-Allow-Origin', config.CLIENT_BASE_URL);
    res.setHeader(
      'Access-Control-Allow-Methods',
      'GET, POST, PUT, PATCH, DELETE, OPTIONS',
    );
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader(
      'Access-Control-Allow-Headers',
      'Content-Type, Authorization',
    );
    if (req.method === 'OPTIONS') {
      res.writeHead(200);
      res.end();
      return;
    }
    next();
  }
}
