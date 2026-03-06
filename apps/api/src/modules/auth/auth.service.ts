import { randomBytes, randomUUID } from 'node:crypto';

import {
  AuthTokenEntity,
  AuthTokenType,
  RefreshSessionEntity,
  UserEntity,
  UserStatus,
} from '@app/db';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectDataSource } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { DataSource, IsNull } from 'typeorm';

import { Err } from '@/common/errors/app-error';
import { sha256 } from '@/common/utils';
import { AuthConfig } from '@/config';

type AccessTokenPayload = {
  sub: string;
  email: string;
  typ: 'access';
};

type RefreshTokenPayload = {
  sub: string;
  email: string;
  jti: string;
  typ: 'refresh';
};

type TokenMeta = {
  ip: string | null;
  userAgent: string | null;
};

type AuthTokens = {
  accessToken: string;
  refreshToken: string;
};

type SignUpPayload = {
  email: string;
  password: string;
  fullName?: string;
};

type SignInPayload = {
  email: string;
  password: string;
};

type GoogleExchangePayload = {
  code: string;
  codeVerifier: string;
  redirectUri: string;
};

@Injectable()
export class AuthService {
  readonly refreshCookieName = 'refresh_token';

  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async signIn(payload: SignInPayload, meta: TokenMeta): Promise<AuthTokens> {
    const email = this.normalizeEmail(payload.email);
    const userRepository = this.dataSource.getRepository(UserEntity);
    const user = await userRepository.findOne({
      where: { email, status: UserStatus.Active },
    });

    if (!user?.passwordHash) {
      throw Err.unauthorized();
    }

    const authConfig = this.getAuthConfig();
    if (!authConfig.skipEmailConfirm && !user.emailConfirmed) {
      throw Err.forbidden('Email is not confirmed.');
    }

    const isValid = await bcrypt.compare(payload.password, user.passwordHash);
    if (!isValid) {
      throw Err.unauthorized();
    }

    return this.issueTokens(user, meta);
  }

  async signUp(payload: SignUpPayload, meta: TokenMeta): Promise<AuthTokens> {
    const email = this.normalizeEmail(payload.email);
    const userRepository = this.dataSource.getRepository(UserEntity);
    const authConfig = this.getAuthConfig();

    const existing = await userRepository.findOne({ where: { email } });
    if (existing) {
      throw Err.conflict('Email already exists.');
    }

    const passwordHash = await bcrypt.hash(payload.password, 12);
    const { firstName, lastName } = this.splitFullName(payload.fullName);

    const now = new Date();
    const user = userRepository.create({
      email,
      passwordHash,
      firstName,
      lastName,
      status: UserStatus.Active,
      emailConfirmed: authConfig.skipEmailConfirm,
      emailConfirmedAt: authConfig.skipEmailConfirm ? now : null,
    });

    const saved = await userRepository.save(user);
    if (authConfig.skipEmailConfirm) {
      return this.issueTokens(saved, meta);
    }

    await this.sendEmailConfirmation(saved);
    return { accessToken: '', refreshToken: '' };
  }

  async refreshToken(
    refreshToken: string | null,
    meta: TokenMeta,
  ): Promise<AuthTokens> {
    if (!refreshToken) {
      throw Err.unauthorized();
    }

    const payload = await this.verifyRefreshToken(refreshToken);

    const userRepository = this.dataSource.getRepository(UserEntity);
    const user = await userRepository.findOne({
      where: { id: payload.sub, status: UserStatus.Active },
    });

    if (!user) {
      await this.revokeAllUserSessions(payload.sub);
      throw Err.unauthorized();
    }

    return this.rotateRefreshSession(user, refreshToken, payload, meta);
  }

  async forgotPassword(email: string): Promise<void> {
    const userRepository = this.dataSource.getRepository(UserEntity);
    const normalized = this.normalizeEmail(email);
    const user = await userRepository.findOne({
      where: { email: normalized },
    });

    if (!user) {
      return;
    }

    if (user.status !== UserStatus.Active) {
      return;
    }

    await this.sendPasswordReset(user);
  }

  async emailExists(email: string) {
    const userRepository = this.dataSource.getRepository(UserEntity);
    const normalized = this.normalizeEmail(email);
    const exists = await userRepository.exists({
      where: { email: normalized },
    });
    return exists;
  }

  async signOut(refreshToken: string | null): Promise<void> {
    if (!refreshToken) {
      return;
    }

    const payload = await this.tryVerifyRefreshToken(refreshToken);
    if (!payload) {
      return;
    }

    const refreshRepository =
      this.dataSource.getRepository(RefreshSessionEntity);
    await refreshRepository.update(
      { id: payload.jti },
      { revokedAt: new Date() },
    );
  }

  async confirmForgotPassword(payload: {
    token: string;
    newPassword: string;
  }): Promise<void> {
    const { token, newPassword } = payload;
    const tokenEntity = await this.findValidToken(
      token,
      AuthTokenType.PasswordReset,
    );

    if (!tokenEntity) {
      throw Err.badRequest('Invalid or expired token');
    }

    await this.dataSource.transaction(async (manager) => {
      const userRepository = manager.getRepository(UserEntity);
      const authTokenRepository = manager.getRepository(AuthTokenEntity);

      const user = await userRepository.findOne({
        where: { id: tokenEntity.userId },
      });

      if (!user || user.status !== UserStatus.Active) {
        throw Err.unauthorized();
      }

      user.passwordHash = await bcrypt.hash(newPassword, 12);
      await userRepository.save(user);

      await authTokenRepository.update(
        { id: tokenEntity.id },
        { usedAt: new Date() },
      );

      const refreshRepository = manager.getRepository(RefreshSessionEntity);
      await refreshRepository.update(
        { userId: user.id, revokedAt: IsNull() },
        { revokedAt: new Date() },
      );
    });
  }

  async confirmEmail(token: string, meta: TokenMeta): Promise<AuthTokens> {
    const authConfig = this.getAuthConfig();
    if (authConfig.skipEmailConfirm) {
      throw Err.badRequest('Email confirmation is disabled');
    }

    const tokenEntity = await this.findValidToken(
      token,
      AuthTokenType.EmailConfirm,
    );

    if (!tokenEntity) {
      throw Err.badRequest('Invalid or expired token');
    }

    const user = await this.dataSource.transaction(async (manager) => {
      const userRepository = manager.getRepository(UserEntity);
      const authTokenRepository = manager.getRepository(AuthTokenEntity);

      const userEntity = await userRepository.findOne({
        where: { id: tokenEntity.userId },
      });

      if (!userEntity || userEntity.status !== UserStatus.Active) {
        throw Err.unauthorized();
      }

      if (!userEntity.emailConfirmed) {
        userEntity.emailConfirmed = true;
        userEntity.emailConfirmedAt = new Date();
        await userRepository.save(userEntity);
      }

      await authTokenRepository.update(
        { id: tokenEntity.id },
        { usedAt: new Date() },
      );

      return userEntity;
    });

    return this.issueTokens(user, meta);
  }

  async resendEmailConfirmation(email: string): Promise<void> {
    const authConfig = this.getAuthConfig();
    if (authConfig.skipEmailConfirm) {
      return;
    }

    const userRepository = this.dataSource.getRepository(UserEntity);
    const normalized = this.normalizeEmail(email);
    const user = await userRepository.findOne({
      where: { email: normalized },
    });

    if (!user || user.status !== UserStatus.Active) {
      return;
    }

    if (user.emailConfirmed) {
      return;
    }

    const rateLimited = await this.isEmailConfirmRateLimited(user.id);
    if (rateLimited) {
      return;
    }

    await this.markTokensUsed(user.id, AuthTokenType.EmailConfirm);
    await this.sendEmailConfirmation(user);
  }

  async changePassword(
    userId: string,
    payload: { oldPassword: string; newPassword: string },
  ): Promise<void> {
    const userRepository = this.dataSource.getRepository(UserEntity);
    const user = await userRepository.findOne({
      where: { id: userId, status: UserStatus.Active },
    });

    if (!user?.passwordHash) {
      throw Err.badRequest('Password is not set');
    }

    const isValid = await bcrypt.compare(payload.oldPassword, user.passwordHash);
    if (!isValid) {
      throw Err.unauthorized();
    }

    user.passwordHash = await bcrypt.hash(payload.newPassword, 12);
    await userRepository.save(user);

    await this.revokeAllUserSessions(user.id);
  }

  async exchangeGoogleCode(
    payload: GoogleExchangePayload,
    meta: TokenMeta,
  ): Promise<AuthTokens> {
    const authConfig = this.getAuthConfig();

    if (!authConfig.googleClientId) {
      throw Err.internal('GOOGLE_CLIENT_ID is not set');
    }

    const tokenResponse = await this.exchangeGoogleToken(payload);
    const profile = await this.fetchGoogleProfile(tokenResponse.id_token);

    if (profile.aud !== authConfig.googleClientId) {
      throw Err.unauthorized('Invalid Google token audience');
    }

    const emailVerified =
      profile.email_verified === 'true' || profile.email_verified === true;

    if (!emailVerified) {
      throw Err.unauthorized('Google email is not verified');
    }

    const email = this.normalizeEmail(profile.email);
    const userRepository = this.dataSource.getRepository(UserEntity);
    let user = await userRepository.findOne({
      where: { email },
    });

    if (user && user.status !== UserStatus.Active) {
      throw Err.unauthorized();
    }

    if (!user) {
      const { firstName, lastName } = this.splitFullName(profile.name);
      user = userRepository.create({
        email,
        firstName,
        lastName,
        status: UserStatus.Active,
        emailConfirmed: true,
        emailConfirmedAt: new Date(),
      });
      user = await userRepository.save(user);
    } else if (!user.emailConfirmed) {
      user.emailConfirmed = true;
      user.emailConfirmedAt = new Date();
      user = await userRepository.save(user);
    }

    return this.issueTokens(user, meta);
  }

  getRefreshCookieOptions() {
    const authConfig = this.getAuthConfig();
    const sameSite = this.normalizeSameSite(authConfig.cookieSameSite) as
      | 'strict'
      | 'lax'
      | 'none';
    const maxAge = authConfig.refreshTtlDays * 24 * 60 * 60;

    return {
      httpOnly: true,
      secure: authConfig.cookieSecure,
      sameSite,
      domain: authConfig.cookieDomain,
      path: authConfig.cookiePath,
      maxAge,
    };
  }

  private async issueTokens(
    user: UserEntity,
    meta: TokenMeta,
  ): Promise<AuthTokens> {
    const accessToken = await this.signAccessToken(user);
    const refreshToken = await this.signRefreshToken(user);
    await this.persistRefreshSession(user, refreshToken, meta);

    return { accessToken, refreshToken };
  }

  private async rotateRefreshSession(
    user: UserEntity,
    refreshToken: string,
    payload: RefreshTokenPayload,
    meta: TokenMeta,
  ): Promise<AuthTokens> {
    const refreshRepository =
      this.dataSource.getRepository(RefreshSessionEntity);
    const tokenHash = sha256(refreshToken);
    const existing = await refreshRepository.findOne({
      where: { id: payload.jti },
    });

    if (!existing || existing.userId !== user.id) {
      await this.revokeAllUserSessions(user.id);
      throw Err.unauthorized();
    }

    if (existing.revokedAt || existing.expiresAt <= new Date()) {
      await this.revokeAllUserSessions(user.id);
      throw Err.unauthorized();
    }

    if (existing.tokenHash !== tokenHash) {
      await this.revokeAllUserSessions(user.id);
      throw Err.unauthorized();
    }

    return this.dataSource.transaction(async (manager) => {
      const refreshRepo = manager.getRepository(RefreshSessionEntity);
      const newRefreshToken = await this.signRefreshToken(user);
      const newSession = refreshRepo.create({
        id: this.extractJti(newRefreshToken),
        userId: user.id,
        tokenHash: sha256(newRefreshToken),
        expiresAt: this.getRefreshExpiryDate(),
        userAgent: meta.userAgent,
        ip: meta.ip,
      });

      await refreshRepo.save(newSession);

      await refreshRepo.update(
        { id: existing.id },
        { revokedAt: new Date(), replacedById: newSession.id },
      );

      const accessToken = await this.signAccessToken(user);
      return { accessToken, refreshToken: newRefreshToken };
    });
  }

  private async persistRefreshSession(
    user: UserEntity,
    refreshToken: string,
    meta: TokenMeta,
  ) {
    const refreshRepository =
      this.dataSource.getRepository(RefreshSessionEntity);
    const session = refreshRepository.create({
      id: this.extractJti(refreshToken),
      userId: user.id,
      tokenHash: sha256(refreshToken),
      expiresAt: this.getRefreshExpiryDate(),
      userAgent: meta.userAgent,
      ip: meta.ip,
    });

    await refreshRepository.save(session);
  }

  private async sendEmailConfirmation(user: UserEntity) {
    const authConfig = this.getAuthConfig();
    if (!authConfig.resendApiKey || !authConfig.resendFrom) {
      throw Err.internal('Resend email config is missing');
    }

    if (!authConfig.confirmEmailUrl) {
      throw Err.internal('AUTH_CONFIRM_EMAIL_URL is not set');
    }

    const token = await this.createAuthToken(
      user.id,
      AuthTokenType.EmailConfirm,
      authConfig.confirmEmailTtlHours,
    );

    const url = this.withToken(authConfig.confirmEmailUrl, token);

    const subject = 'Confirm your email';
    const html = `
      <p>Confirm your email address:</p>
      <p><a href="${url}">Confirm email</a></p>
      <p>If you did not request this, ignore this email.</p>
    `;

    await this.sendEmail(user.email, subject, html);
  }

  private async sendPasswordReset(user: UserEntity) {
    const authConfig = this.getAuthConfig();
    if (!authConfig.resendApiKey || !authConfig.resendFrom) {
      throw Err.internal('Resend email config is missing');
    }

    if (!authConfig.resetPasswordUrl) {
      throw Err.internal('AUTH_RESET_PASSWORD_URL is not set');
    }

    const token = await this.createAuthToken(
      user.id,
      AuthTokenType.PasswordReset,
      authConfig.resetPasswordTtlHours,
    );

    const url = this.withToken(authConfig.resetPasswordUrl, token);

    const subject = 'Reset your password';
    const html = `
      <p>Reset your password:</p>
      <p><a href="${url}">Reset password</a></p>
      <p>If you did not request this, ignore this email.</p>
    `;

    await this.sendEmail(user.email, subject, html);
  }

  private async createAuthToken(
    userId: string,
    type: AuthTokenType,
    ttlHours: number,
  ): Promise<string> {
    const rawToken = randomBytes(32).toString('hex');
    const tokenHash = sha256(rawToken);
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + ttlHours);

    const repository = this.dataSource.getRepository(AuthTokenEntity);
    const entity = repository.create({
      userId,
      tokenHash,
      type,
      expiresAt,
    });

    await repository.save(entity);
    return rawToken;
  }

  private async findValidToken(token: string, type: AuthTokenType) {
    const tokenHash = sha256(token);
    const repository = this.dataSource.getRepository(AuthTokenEntity);
    const entity = await repository.findOne({
      where: { tokenHash, type, usedAt: IsNull() },
    });

    if (!entity) {
      return null;
    }

    if (entity.expiresAt <= new Date()) {
      return null;
    }

    return entity;
  }

  private async isEmailConfirmRateLimited(userId: string): Promise<boolean> {
    const repository = this.dataSource.getRepository(AuthTokenEntity);
    const latest = await repository.findOne({
      where: { userId, type: AuthTokenType.EmailConfirm },
      order: { createdAt: 'DESC' },
    });

    if (!latest) {
      return false;
    }

    const now = Date.now();
    const created = latest.createdAt.getTime();
    return now - created < 60_000;
  }

  private async markTokensUsed(userId: string, type: AuthTokenType) {
    const repository = this.dataSource.getRepository(AuthTokenEntity);
    await repository.update(
      { userId, type, usedAt: IsNull() },
      { usedAt: new Date() },
    );
  }

  private withToken(baseUrl: string, token: string) {
    try {
      const url = new URL(baseUrl);
      url.searchParams.set('token', token);
      return url.toString();
    } catch {
      const separator = baseUrl.includes('?') ? '&' : '?';
      return `${baseUrl}${separator}token=${encodeURIComponent(token)}`;
    }
  }

  private async sendEmail(to: string, subject: string, html: string) {
    const authConfig = this.getAuthConfig();
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${authConfig.resendApiKey}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        from: authConfig.resendFrom,
        to,
        subject,
        html,
      }),
    });

    if (!response.ok) {
      throw Err.internal('Failed to send email via Resend');
    }
  }

  private async signAccessToken(user: UserEntity): Promise<string> {
    const authConfig = this.getAuthConfig();
    if (!authConfig.accessSecret) {
      throw Err.internal('AUTH_ACCESS_SECRET is not set');
    }

    const payload: AccessTokenPayload = {
      sub: user.id,
      email: user.email,
      typ: 'access',
    };

    return this.jwtService.signAsync(payload, {
      secret: authConfig.accessSecret,
      expiresIn: `${authConfig.accessTtlMinutes}m`,
    });
  }

  private async signRefreshToken(user: UserEntity): Promise<string> {
    const authConfig = this.getAuthConfig();
    if (!authConfig.refreshSecret) {
      throw Err.internal('AUTH_REFRESH_SECRET is not set');
    }

    const payload: RefreshTokenPayload = {
      sub: user.id,
      email: user.email,
      jti: randomUUID(),
      typ: 'refresh',
    };

    return this.jwtService.signAsync(payload, {
      secret: authConfig.refreshSecret,
      expiresIn: `${authConfig.refreshTtlDays}d`,
    });
  }

  private async verifyRefreshToken(
    refreshToken: string,
  ): Promise<RefreshTokenPayload> {
    const authConfig = this.getAuthConfig();
    if (!authConfig.refreshSecret) {
      throw Err.internal('AUTH_REFRESH_SECRET is not set');
    }

    try {
      const payload = await this.jwtService.verifyAsync<RefreshTokenPayload>(
        refreshToken,
        {
          secret: authConfig.refreshSecret,
        },
      );

      if (payload.typ !== 'refresh') {
        throw Err.unauthorized();
      }

      return payload;
    } catch {
      throw Err.unauthorized();
    }
  }

  private async tryVerifyRefreshToken(
    refreshToken: string,
  ): Promise<RefreshTokenPayload | null> {
    try {
      return await this.verifyRefreshToken(refreshToken);
    } catch {
      return null;
    }
  }

  private extractJti(refreshToken: string): string {
    const payload = this.jwtService.decode(refreshToken) as RefreshTokenPayload;
    if (!payload?.jti) {
      throw Err.unauthorized();
    }
    return payload.jti;
  }

  private getRefreshExpiryDate(): Date {
    const authConfig = this.getAuthConfig();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + authConfig.refreshTtlDays);
    return expiresAt;
  }

  private normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
  }

  private splitFullName(fullName?: string) {
    if (!fullName) {
      return { firstName: null, lastName: null };
    }

    const parts = fullName.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) {
      return { firstName: null, lastName: null };
    }

    return {
      firstName: parts[0] ?? null,
      lastName: parts.slice(1).join(' ') || null,
    };
  }

  private async revokeAllUserSessions(userId: string) {
    const refreshRepository =
      this.dataSource.getRepository(RefreshSessionEntity);
    await refreshRepository.update(
      { userId, revokedAt: IsNull() },
      { revokedAt: new Date() },
    );
  }

  private normalizeSameSite(value: string) {
    if (value === 'none' || value === 'strict' || value === 'lax') {
      return value;
    }
    return 'lax';
  }

  private getAuthConfig(): AuthConfig {
    const config = this.configService.get<AuthConfig>('auth');
    if (!config) {
      throw Err.internal('Auth config is missing');
    }
    return config;
  }

  private async exchangeGoogleToken(payload: GoogleExchangePayload) {
    const authConfig = this.getAuthConfig();
    const body = new URLSearchParams({
      code: payload.code,
      client_id: authConfig.googleClientId ?? '',
      redirect_uri: payload.redirectUri,
      grant_type: 'authorization_code',
      code_verifier: payload.codeVerifier,
    });

    if (authConfig.googleClientSecret) {
      body.append('client_secret', authConfig.googleClientSecret);
    }

    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'content-type': 'application/x-www-form-urlencoded',
      },
      body,
    });

    if (!response.ok) {
      throw Err.unauthorized('Google token exchange failed');
    }

    const payloadJson = (await response.json()) as {
      access_token: string;
      id_token: string;
    };

    if (!payloadJson.id_token) {
      throw Err.unauthorized('Google token exchange failed');
    }

    return payloadJson;
  }

  private async fetchGoogleProfile(idToken: string) {
    const response = await fetch(
      `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(
        idToken,
      )}`,
    );

    if (!response.ok) {
      throw Err.unauthorized('Google token verification failed');
    }

    return (await response.json()) as {
      aud: string;
      email: string;
      email_verified: string | boolean;
      name: string;
    };
  }
}
