import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiCookieAuth,
  ApiExcludeEndpoint,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtAuthGuard } from './jwt-auth.guard';
import { GoogleOAuthGuard } from './guards/google-oauth.guard';
import { FacebookOAuthGuard } from './guards/facebook-oauth.guard';
import type { GoogleProfile } from './strategies/google.strategy';
import type { FacebookProfile } from './strategies/facebook.strategy';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Registrar un nuevo usuario' })
  @ApiResponse({ status: 201, description: 'Usuario creado exitosamente.' })
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Iniciar sesión' })
  async login(@Req() req: any, @Res({ passthrough: true }) res: any) {
    const loginResult = await this.authService.login(req.user);

    this.setAuthCookies(
      res,
      loginResult.access_token,
      loginResult.refresh_token,
    );

    return {
      message: 'Inicio de sesión exitoso',
      user: loginResult.user,
    };
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refrescar access token usando cookie HttpOnly' })
  async refresh(@Req() req: any, @Res({ passthrough: true }) res: any) {
    const refreshToken = req.cookies['refresh_token'];

    const refreshResult = await this.authService.refreshToken(refreshToken);

    this.setAuthCookies(
      res,
      refreshResult.access_token,
      refreshResult.refresh_token,
    );

    return { message: 'Token refrescado exitosamente' };
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Cerrar sesión y revocar tokens' })
  async logout(@Req() req: any, @Res({ passthrough: true }) res: any) {
    const refreshToken = req.cookies['refresh_token'];
    await this.authService.logout(refreshToken);

    res.clearCookie('access_token', {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
    });
    res.clearCookie('refresh_token', {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      path: '/api/v1/auth/refresh',
    });

    return { message: 'Sesión cerrada exitosamente' };
  }

  // ─── Google OAuth ──────────────────────────────────────────────────────────

  @Get('google')
  @UseGuards(GoogleOAuthGuard)
  @ApiOperation({ summary: 'Iniciar flujo OAuth con Google' })
  @ApiResponse({ status: 302, description: 'Redirige a Google.' })
  googleAuth() {
    // El guard de Passport intercepta este endpoint y redirige a Google
  }

  @Get('google/callback')
  @UseGuards(GoogleOAuthGuard)
  @ApiExcludeEndpoint()
  async googleAuthCallback(@Req() req: any, @Res() res: any) {
    const profile = req.user as GoogleProfile;
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

    try {
      const loginResult =
        await this.authService.findOrCreateGoogleUser(profile);
      this.setAuthCookies(
        res,
        loginResult.access_token,
        loginResult.refresh_token,
      );
      res.redirect(`${frontendUrl}/dashboard`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'oauth_error';
      res.redirect(`${frontendUrl}/login?error=${encodeURIComponent(message)}`);
    }
  }

  // ─── Facebook OAuth ────────────────────────────────────────────────────────

  @Get('facebook')
  @UseGuards(FacebookOAuthGuard)
  @ApiOperation({ summary: 'Iniciar flujo OAuth con Facebook' })
  @ApiResponse({ status: 302, description: 'Redirige a Facebook.' })
  facebookAuth() {
    // El guard de Passport intercepta este endpoint y redirige a Facebook
  }

  @Get('facebook/callback')
  @UseGuards(FacebookOAuthGuard)
  @ApiExcludeEndpoint()
  async facebookAuthCallback(@Req() req: any, @Res() res: any) {
    const profile = req.user as FacebookProfile;
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

    try {
      const loginResult =
        await this.authService.findOrCreateFacebookUser(profile);
      this.setAuthCookies(
        res,
        loginResult.access_token,
        loginResult.refresh_token,
      );
      res.redirect(`${frontendUrl}/dashboard`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'oauth_error';
      res.redirect(`${frontendUrl}/login?error=${encodeURIComponent(message)}`);
    }
  }

  private setAuthCookies(res: any, accessToken: string, refreshToken: string) {
    res.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 15 * 60 * 1000, // 15 mins
    });

    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/api/v1/auth/refresh',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
  }
}
