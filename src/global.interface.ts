import http from 'http';
import { URLSearchParams } from 'url';
import { IUser } from './db/users';

export type HttpRequest<
  ReqBody extends Record<string, unknown> = Record<string, unknown>,
  ReqParams extends Record<string, string> = Record<string, string>,
> = http.IncomingMessage & {
  pathname: string;
  query: URLSearchParams;
  params: ReqParams;
  body: ReqBody;
};
export type HttpResponse = http.ServerResponse<http.IncomingMessage> & {
  req: http.IncomingMessage;
  locals?: Record<string, unknown>;
};

export interface HttpResponseWithUserInLocals extends HttpResponse {
  locals: {
    user: Omit<IUser, 'password'>;
  };
}
