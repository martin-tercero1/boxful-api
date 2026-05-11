import { 
  IsEmail, 
  IsString, 
  MinLength, 
  MaxLength, 
  IsEnum, 
  Matches,
  ValidateIf
} from 'class-validator';

export class SignupDto {
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  firstName: string;

  @IsString()
  @MinLength(2)
  @MaxLength(50)
  lastName: string;

  @IsEnum(['Masculino', 'Femenino'])
  sex: string;

  @IsString()
  dateOfBirth: string;

  @IsEmail()
  @MaxLength(100)
  email: string;

  @IsString()
  @Matches(/^\+?[1-9]\d{1,14}$/, { message: 'Please provide a valid WhatsApp phone number with country code' })
  phone: string;

  @IsString()
  @MinLength(8)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/, {
    message: 'Password must contain at least 8 characters, one uppercase letter, one lowercase letter, and one number'
  })
  password: string;

  @IsString()
  @ValidateIf(o => o.password)
  passwordRepeat: string;
}