import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuthCredentialsDto } from './dto/auth-credentials.dto';

describe('AuthController', () => {
  let authController: AuthController;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            signin: jest.fn(),
          },
        },
      ],
    }).compile();

    authController = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  describe('signin', () => {
    it('should return an access token', async () => {
      const authCredentialsDto: AuthCredentialsDto = { username: 'test', password: 'test' };
      const result = { accessToken: 'testToken' };

      jest.spyOn(authService, 'signin').mockResolvedValue(result);

      expect(await authController.signin(authCredentialsDto)).toBe(result);
    });
  });
});
