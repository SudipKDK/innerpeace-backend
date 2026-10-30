import { Test, TestingModule } from '@nestjs/testing';
import { MailService } from './service/mail.service';
import { MailerService } from '@nestjs-modules/mailer';

describe('MailService', () => {
  let service: MailService;
  let mailerService: jest.Mocked<Partial<MailerService>>;

  beforeEach(async () => {
    mailerService = {
      sendMail: jest.fn().mockResolvedValue({ messageId: '123' }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MailService,
        { provide: MailerService, useValue: mailerService },
      ],
    }).compile();

    service = module.get<MailService>(MailService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('sendResetPassword', () => {
    it('should call mailerService.sendMail with proper template and context', async () => {
      const email = 'user@example.com';
      const link = 'http://localhost/reset?token=abc';

      const result = await service.sendResetPassword(email, link);

      expect(mailerService.sendMail).toHaveBeenCalledWith({
        to: email,
        subject: 'Reset Your Password',
        template: 'reset-password',
        context: {
          resetLink: link,
          expiresIn: '15 minutes',
        },
      });
      expect(result).toEqual({ messageId: '123' });
    });
  });
});
