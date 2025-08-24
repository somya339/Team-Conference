import { Body, Controller, HttpCode, Post, Logger } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private authService: AuthService) {}

  @Post('register')
  @ApiResponse({ status: 201, description: 'User successfully registered.' })
  @ApiResponse({ status: 400, description: 'Validation error.' })
  async register(@Body() registerDto: RegisterDto) {
    this.logger.log(`POST /auth/register - Registration request for email: ${registerDto.email}`);
    try {
      const result = await this.authService.register(registerDto);
      this.logger.log(`POST /auth/register - Registration successful for email: ${registerDto.email}`);
      return result;
    } catch (error) {
      this.logger.error(`POST /auth/register - Registration failed for email: ${registerDto.email}`, error.stack);
      throw error;
    }
  }

  @Post('login')
  @HttpCode(200)
  @ApiResponse({ status: 200, description: 'User successfully logged in.' })
  @ApiResponse({ status: 400, description: 'Invalid credentials.' })
  async login(@Body() loginDto: LoginDto) {
    this.logger.log(`POST /auth/login - Login request for email: ${loginDto.email}`);
    try {
      const result = await this.authService.login(loginDto);
      this.logger.log(`POST /auth/login - Login successful for email: ${loginDto.email}`);
      return result;
    } catch (error) {
      this.logger.error(`POST /auth/login - Login failed for email: ${loginDto.email}`, error.stack);
      throw error;
    }
  }
}
