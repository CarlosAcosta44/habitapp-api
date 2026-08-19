import {
  Body,
  Controller,
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
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtAuthGuard } from './jwt-auth.guard';

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
