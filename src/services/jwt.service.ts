import { createHmac } from 'crypto';

export class JwtService {
  private readonly header = {
    alg: 'HS256',
    typ: 'JWT',
  } as const;

  private readonly secret = 'someSecretTobePlacedToENVLater';

  private base64Url<T extends Record<string, unknown>>(source: T) {
    const encoded = Buffer.from(JSON.stringify(source)).toString('base64');
    return encoded.replace(/=+$/, '').replace(/\+/g, '-').replace(/\//g, '_');
  }

  private sign(input: string, secret: string) {
    return createHmac('sha256', secret)
      .update(input)
      .digest('base64')
      .replace(/=+$/, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');
  }

  private base64urlDecode(str: string) {
    // Add base64 padding to the string and replace URL-safe characters with their standard counterparts
    let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
    // Pad the base64 string
    while (base64.length % 4) {
      base64 += '=';
    }
    return Buffer.from(base64, 'base64').toString();
  }

  private verifySignature(
    encodedHeader: string,
    encodedPayload: string,
    signature: string,
    secret: string,
  ) {
    // Generate the signature to be compared with the incoming signature
    const expectedSignature = this.sign(
      `${encodedHeader}.${encodedPayload}`,
      secret,
    );
    return signature === expectedSignature;
  }

  public validateJWT(token: string, secret: string = this.secret) {
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new Error('Invalid JWT: should consist of 3 parts');
    }

    const [encodedHeader, encodedPayload, signature] = parts;
    const header = JSON.parse(this.base64urlDecode(encodedHeader));
    const payload = JSON.parse(this.base64urlDecode(encodedPayload));

    if (
      !this.verifySignature(encodedHeader, encodedPayload, signature, secret)
    ) {
      throw new Error('Invalid JWT: signature does not match');
    }

    if (payload.exp && Date.now() >= payload.exp * 1000) {
      throw new Error('Invalid JWT: token has expired');
    }

    return payload;
  }

  public createJWT<T extends Record<string, unknown>>(payload: T): string {
    const encodedHeader = this.base64Url(this.header);
    const encodedPayload = this.base64Url({ ...payload, iat: Date.now() });
    const signature = this.sign(
      `${encodedHeader}.${encodedPayload}`,
      this.secret,
    );
    return `${encodedHeader}.${encodedPayload}.${signature}`;
  }
}
