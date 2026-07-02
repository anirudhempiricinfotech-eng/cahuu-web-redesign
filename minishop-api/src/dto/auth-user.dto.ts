import { IsEmail, IsEnum, IsOptional, IsPhoneNumber, IsString, IsStrongPassword, IsUUID, Length, Matches, MaxLength, MinLength } from 'class-validator';
import { UserRole } from '../common/enums';

export class RegisterDto {
  @IsEmail() email!: string;
  @IsStrongPassword({ minLength: 12, minUppercase: 1, minNumbers: 1, minSymbols: 1 }) password!: string;
  @IsString() @Length(2, 60) displayName!: string;
  @IsOptional() @IsPhoneNumber('IN') phone?: string;
}
export class LoginDto { @IsEmail() email!: string; @IsString() @MinLength(12) password!: string; }
export class RefreshTokenDto { @IsString() @MinLength(32) refreshToken!: string; }
export class UpdateUserDto {
  @IsOptional() @IsString() @Length(2,60) displayName?: string;
  @IsOptional() @IsPhoneNumber('IN') phone?: string;
  @IsOptional() @IsString() @MaxLength(160) bio?: string;
}
export class ChangeRoleDto { @IsEnum(UserRole) role!: UserRole; }
export class AddressDto {
  @IsString() @Length(2,70) recipient!: string;
  @IsString() @Length(8,120) line1!: string;
  @IsOptional() @IsString() @MaxLength(120) line2?: string;
  @IsString() @Matches(/^[1-9][0-9]{5}$/) postalCode!: string;
  @IsString() @Length(2,80) city!: string;
  @IsString() @Length(2,80) state!: string;
  @IsString() @Length(2,2) countryCode!: string;
}
export class UserResponseDto { @IsUUID() id!: string; @IsEmail() email!: string; @IsString() displayName!: string; @IsEnum(UserRole) role!: UserRole; }
