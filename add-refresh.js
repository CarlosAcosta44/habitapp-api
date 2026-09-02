const fs = require('fs');

let authService = fs.readFileSync('src/auth/auth.service.ts', 'utf8');
const refreshServiceMethod = `
  async refreshToken(refreshToken: string) {
    if (!refreshToken) {
      throw new BadRequestException('El refresh_token es requerido');
    }
    
    const { data, error } = await this.supabaseService.getClient().auth.refreshSession({ refresh_token: refreshToken });
    
    if (error || !data.session) {
      throw new UnauthorizedException('Refresh token inválido o expirado');
    }

    return {
      message: 'Token refrescado exitosamente',
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
      user: data.user,
    };
  }
}
`;
authService = authService.replace(/}\s*$/, refreshServiceMethod);
fs.writeFileSync('src/auth/auth.service.ts', authService);

let authController = fs.readFileSync('src/auth/auth.controller.ts', 'utf8');
const refreshControllerMethod = `
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refrescar sesión con refresh_token (Vía Supabase Auth)' })
  async refresh(@Body('refresh_token') refreshToken: string) {
    return this.authService.refreshToken(refreshToken);
  }
}
`;
authController = authController.replace(/}\s*$/, refreshControllerMethod);
fs.writeFileSync('src/auth/auth.controller.ts', authController);
