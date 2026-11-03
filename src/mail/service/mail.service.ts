import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}

  async sendResetPassword(
    email: string,
    resetLink: string,
  ): Promise<Record<string, any>> {
    return (await this.mailerService.sendMail({
      to: email,
      subject: 'Reset Your Password',
      template: 'reset-password',
      context: {
        resetLink,
        expiresIn: '15 minutes',
      },
    })) as Record<string, any>;
  }
}
