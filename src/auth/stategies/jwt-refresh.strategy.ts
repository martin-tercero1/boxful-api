import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_REFRESH_SECRET!,
      passReqToCallback: true, // so we can extract the raw token
    });
  }

  async validate(req: Request, payload: { userId: string; email: string; type: string }) {
    const refreshToken = req.headers.authorization?.replace('Bearer ', '');
    return { sub: payload.userId, userId: payload.userId, email: payload.email, refreshToken };
    // refreshToken is attached so auth.service.refresh() can verify it
  }
}