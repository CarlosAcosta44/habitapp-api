
import { Controller, Post, Put, Body, Req, Res, HttpStatus, HttpCode, UseGuards } from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { RegisterDto } from '../dto/register.dto';
import { LoginDto } from '../dto/login.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../core/common/guards/jwt-auth.guard';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Registrar un nuevo usuario' })
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Iniciar sesión' })
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: any) {
    const result = await this.authService.login(dto);
    res.cookie('access_token', result.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 1000 * 60 * 60 * 24 * 7,
    });
    if (result.refresh_token) {
      res.cookie('refresh_token', result.refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 1000 * 60 * 60 * 24 * 7,
      });
    }
    return result;
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Renovar access token JWT' })
  @ApiResponse({ status: 200, description: 'Token renovado exitosamente.' })
  @ApiResponse({ status: 401, description: 'Refresh token expirado o inválido.' })
  async refresh(
    @Req() req: any,
    @Body('refreshToken') bodyToken?: string,
    @Res({ passthrough: true }) res?: any,
  ) {
    const token = req.cookies?.refresh_token || bodyToken;
    const result = await this.authService.refreshToken(token);
    if (res) {
      res.cookie('access_token', result.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 1000 * 60 * 15, // 15 minutos
      });
      res.cookie('refresh_token', result.refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 días
      });
    }
    return result;
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cerrar sesión' })
  async logout(@Req() req: any, @Res({ passthrough: true }) res: any) {
    res.clearCookie('access_token');
    res.clearCookie('refresh_token');
    return this.authService.logout(req.user.userId);
  }

  @Post('google')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Iniciar sesión o Registrarse con Google' })
  async loginWithGoogle(@Body('idToken') idToken: string, @Res({ passthrough: true }) res: any) {
    const result = await this.authService.loginWithGoogle(idToken);
    res.cookie('access_token', result.access_token, { httpOnly: true, sameSite: 'lax', maxAge: 1000 * 60 * 60 * 24 * 7 });
    return result;
  }

  @Post('facebook')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Iniciar sesión o Registrarse con Facebook' })
  async loginWithFacebook(@Body('accessToken') accessToken: string, @Res({ passthrough: true }) res: any) {
    const result = await this.authService.loginWithFacebook(accessToken);
    res.cookie('access_token', result.access_token, { httpOnly: true, sameSite: 'lax', maxAge: 1000 * 60 * 60 * 24 * 7 });
    return result;
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Solicitar recuperación de contraseña (Envia correo)' })
  async resetPassword(@Body('email') email: string) {
    return this.authService.resetPassword(email);
  }

  @Put('update-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Actualizar contraseña con el token de recuperación' })
  async updatePassword(@Body('token') token: string, @Body('newPassword') newPassword: string) {
    return this.authService.updatePassword(token, newPassword);
  }
}
