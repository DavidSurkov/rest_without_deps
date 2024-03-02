import { HttpRequest, HttpResponse } from '../../global.interface';
import { URL } from 'url';
import { StringDecoder } from 'string_decoder';
export enum Method {
  GET = 'get',
  POST = 'post',
  PUT = 'put',
  PATCH = 'patch',
  DELETE = 'delete',
}

type RouteHandler = (
  req: HttpRequest,
  res: HttpResponse,
  next?: () => void,
) => void;

type Middleware = (
  req: HttpRequest,
  res: HttpResponse,
  next: () => void,
) => void;

interface Route {
  method: Method;
  handler: RouteHandler;
  regex: RegExp;
  tokens: string[];
  middlewares?: Middleware[];
}

export class Router {
  private routes: Route[] = [];

  private addRoute(
    method: Method,
    path: string,
    handler: RouteHandler,
    middlewares?: Middleware[],
  ) {
    const tokens = path.split('/').filter((token) => !!token);
    const regexPattern = tokens
      .map((token) => {
        if (token.startsWith(':')) {
          // Dynamic segment
          return '([^\\/]+)';
        } else {
          // Static segment, escape special regex characters
          return token.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
        }
      })
      .join('\\/');
    const regex = new RegExp(`^\\/${regexPattern}\\/?$`);
    this.routes.push({ method, regex, handler, tokens, middlewares });
  }

  public get(path: string, handler: RouteHandler, middlewares?: Middleware[]) {
    this.addRoute(Method.GET, path, handler, middlewares);
  }

  public post(path: string, handler: RouteHandler, middlewares?: Middleware[]) {
    this.addRoute(Method.POST, path, handler, middlewares);
  }

  public put(path: string, handler: RouteHandler, middlewares?: Middleware[]) {
    this.addRoute(Method.PUT, path, handler, middlewares);
  }

  public patch(
    path: string,
    handler: RouteHandler,
    middlewares?: Middleware[],
  ) {
    this.addRoute(Method.PATCH, path, handler, middlewares);
  }

  public delete(
    path: string,
    handler: RouteHandler,
    middlewares?: Middleware[],
  ) {
    this.addRoute(Method.DELETE, path, handler, middlewares);
  }

  private runMiddlewares(
    middlewares: Middleware[],
    index: number,
    req: HttpRequest,
    res: HttpResponse,
    done: (req: HttpRequest, res: HttpResponse) => void,
  ) {
    if (index >= middlewares.length) {
      done(req, res);
    } else {
      const middleware = middlewares[index];
      middleware(req, res, () =>
        this.runMiddlewares(middlewares, index + 1, req, res, done),
      );
    }
  }

  public handleRequest(req: HttpRequest, res: HttpResponse) {
    try {
      const parsedUrl = new URL(req.url || '', `http://${req.headers.host}`);
      req.pathname = parsedUrl.pathname;
      req.query = parsedUrl.searchParams; // Add query params to req object
      const requestedMethod = req?.method?.toLowerCase();

      for (const route of this.routes) {
        const match = req.pathname.match(route.regex);
        if (match && requestedMethod === route.method) {
          req.params = {}; // Initialize params in req object
          let paramIndex = 0; // Index to keep track of dynamic segments
          route.tokens.forEach((token) => {
            if (token.startsWith(':')) {
              // Increment paramIndex for each dynamic segment and use it to access the correct match
              // match[0] is the full match, so dynamic segments start from match[1] onwards
              req.params[token.substring(1)] = match[++paramIndex];
            }
          });

          // Handle body parsing for applicable methods
          if (['post', 'put', 'patch'].includes(requestedMethod)) {
            const decoder = new StringDecoder('utf-8');
            let buffer = '';

            req.on('data', (data) => {
              buffer += decoder.write(data);
            });

            req.on('end', () => {
              buffer += decoder.end();
              if (buffer) {
                try {
                  req.body = JSON.parse(buffer); // Add body to req object, assuming JSON
                } catch (error) {
                  res.statusCode = 400;
                  return res.end('Invalid JSON');
                }
              }

              if (route.middlewares) {
                this.runMiddlewares(
                  route.middlewares,
                  0,
                  req,
                  res,
                  route.handler,
                );
              } else {
                // Proceed to the handler now that req is fully prepared
                route.handler(req, res);
              }
            });
          } else {
            if (route.middlewares) {
              this.runMiddlewares(
                route.middlewares,
                0,
                req,
                res,
                route.handler,
              );
            } else {
              // If there's no body to parse, proceed directly to the handler
              route.handler(req, res);
            }
          }
          return;
        }
      }
      res.statusCode = 404;
      res.end('Not Found');
    } catch (e) {
      console.error(e);
      res.statusCode = 500;
      res.end('Internal Server Error');
    }
  }
}
