import { Body, Controller, Post, Req, Res } from '@nestjs/common';
import type { FastifyReply, FastifyRequest } from 'fastify';

import { Protected, User } from '@/modules/auth';
import { AuthService } from '@/modules/auth';

import {
  ChangePasswordRequestDto,
  ConfirmEmailRequestDto,
  ConfirmForgotPasswordDto,
  EmailExistsRequestDto,
  ForgotPasswordDto,
  GoogleExchangeRequestDto,
  ResendConfirmationCodeDto,
  SignInRequestDto,
  SignUpRequestDto,
} from './dtos';

@Controller('/')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/register')
  async signUp(
    @Body() body: SignUpRequestDto,
    @Req() request: FastifyRequest,
    @Res({ passthrough: true }) reply: FastifyReply,
  ) {
    const tokens = await this.authService.signUp(body, {
      ip: request.ip,
      userAgent: this.getUserAgent(request),
    });
    if (tokens.refreshToken) {
      this.setRefreshCookie(reply, tokens.refreshToken);
      return { accessToken: tokens.accessToken };
    }

    return { accessToken: null, requiresEmailConfirmation: true };
  }

  @Post('/login')
  async signIn(
    @Body() body: SignInRequestDto,
    @Req() request: FastifyRequest,
    @Res({ passthrough: true }) reply: FastifyReply,
  ) {
    const tokens = await this.authService.signIn(body, {
      ip: request.ip,
      userAgent: this.getUserAgent(request),
    });
    this.setRefreshCookie(reply, tokens.refreshToken);
    return { accessToken: tokens.accessToken };
  }

  @Post('/refresh')
  async refreshToken(
    @Req() request: FastifyRequest,
    @Res({ passthrough: true }) reply: FastifyReply,
  ) {
    const refreshToken = this.extractRefreshCookie(request);
    const tokens = await this.authService.refreshToken(refreshToken, {
      ip: request.ip,
      userAgent: this.getUserAgent(request),
    });
    this.setRefreshCookie(reply, tokens.refreshToken);
    return { accessToken: tokens.accessToken };
  }

  @Post('/forgot-password')
  async forgotPassword(@Body() body: ForgotPasswordDto) {
    await this.authService.forgotPassword(body.email);
    return { success: true };
  }

  @Post('/confirm-forgot-password')
  async confirmForgotPassword(@Body() body: ConfirmForgotPasswordDto) {
    await this.authService.confirmForgotPassword(body);
    return { success: true };
  }

  @Post('/resend-confirmation')
  async resendConfirmation(@Body() body: ResendConfirmationCodeDto) {
    await this.authService.resendEmailConfirmation(body.email);
    return { success: true };
  }

  @Post('/confirm-email')
  async confirmEmail(
    @Body() body: ConfirmEmailRequestDto,
    @Req() request: FastifyRequest,
    @Res({ passthrough: true }) reply: FastifyReply,
  ) {
    const tokens = await this.authService.confirmEmail(body.token, {
      ip: request.ip,
      userAgent: this.getUserAgent(request),
    });
    this.setRefreshCookie(reply, tokens.refreshToken);
    return { accessToken: tokens.accessToken };
  }

  @Post('/change-password')
  @Protected()
  async changePassword(
    @Body() body: ChangePasswordRequestDto,
    @User() user: User,
  ) {
    const userId = user.id;
    await this.authService.changePassword(userId, body);
    return { success: true };
  }

  @Post('logout')
  async signOut(
    @Req() request: FastifyRequest,
    @Res({ passthrough: true }) reply: FastifyReply,
  ) {
    const refreshToken = this.extractRefreshCookie(request);
    await this.authService.signOut(refreshToken);
    this.clearRefreshCookie(reply);
  }

  @Post('email-exists')
  async emailExists(@Body() body: EmailExistsRequestDto) {
    const exists = await this.authService.emailExists(body.email);
    return { exists };
  }

  @Post('google/exchange')
  async googleExchange(
    @Body() body: GoogleExchangeRequestDto,
    @Req() request: FastifyRequest,
    @Res({ passthrough: true }) reply: FastifyReply,
  ) {
    const tokens = await this.authService.exchangeGoogleCode(body, {
      ip: request.ip,
      userAgent: this.getUserAgent(request),
    });
    this.setRefreshCookie(reply, tokens.refreshToken);
    return { accessToken: tokens.accessToken };
  }

  private extractRefreshCookie(request: FastifyRequest): string | null {
    const token =
      (request as FastifyRequest & { cookies?: Record<string, string> })
        .cookies?.[this.authService.refreshCookieName] ?? null;

    return token;
  }

  private setRefreshCookie(reply: FastifyReply, token: string) {
    reply.setCookie(
      this.authService.refreshCookieName,
      token,
      this.authService.getRefreshCookieOptions(),
    );
  }

  private clearRefreshCookie(reply: FastifyReply) {
    reply.clearCookie(
      this.authService.refreshCookieName,
      this.authService.getRefreshCookieOptions(),
    );
  }

  private getUserAgent(request: FastifyRequest): string | null {
    const userAgent = request.headers['user-agent'];
    if (Array.isArray(userAgent)) {
      return userAgent[0] ?? null;
    }
    return userAgent ?? null;
  }
}
