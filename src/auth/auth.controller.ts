import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { AuthCredentialsDto } from './dto/auth-credentials.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({
    summary: 'Registrar un nuevo usuario (Opcional en Backend)',
    description:
      'Registra un nuevo usuario en Supabase Auth directamente desde la API para pruebas o uso interno.',
  })
  @ApiResponse({ status: 201, description: 'Usuario creado exitosamente.' })
  @ApiResponse({
    status: 400,
    description: 'Datos inválidos o el usuario ya existe.',
  })
  register(@Body() dto: AuthCredentialsDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  @ApiOperation({
    summary: 'Iniciar sesión (Obtener access_token)',
    description:
      'Inicia sesión con correo y contraseña. Devuelve un access_token que puedes usar en el botón "Authorize" de Swagger para probar endpoints protegidos.',
  })
  @ApiResponse({
    status: 200,
    description: 'Inicio de sesión exitoso, devuelve tokens.',
  })
  @ApiResponse({ status: 401, description: 'Credenciales inválidas.' })
  login(@Body() dto: AuthCredentialsDto) {
    return this.authService.login(dto);
  }
}
