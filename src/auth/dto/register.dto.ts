import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail({}, { message: 'Debe ser un correo electrónico válido' })
  @IsNotEmpty({ message: 'El correo es obligatorio' })
  email: string;

  @ApiProperty({ example: 'password123', minLength: 6 })
  @IsString()
  @IsNotEmpty({ message: 'La contraseña es obligatoria' })
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  password: string;

  @ApiProperty({ example: 'Carlos' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(45)
  nombre: string;

  @ApiProperty({ example: 'Acosta' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(45)
  apellido: string;

  @ApiPropertyOptional({ example: '+573001234567' })
  @IsString()
  @IsOptional()
  @MaxLength(20)
  telefono?: string;

  @ApiPropertyOptional({ example: 'Masculino' })
  @IsString()
  @IsOptional()
  @MaxLength(30)
  genero?: string;

  @ApiPropertyOptional({ example: '1990-01-01' })
  @IsString()
  @IsOptional()
  fechanacimiento?: string;
}
