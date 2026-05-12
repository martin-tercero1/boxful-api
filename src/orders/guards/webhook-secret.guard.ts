import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class WebhookSecretGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    const secret = req.headers['x-webhook-secret'];

    if (secret !== process.env.WEBHOOK_SECRET) {
      throw new UnauthorizedException('Invalid webhook secret');
    }
    return true;
  }
}