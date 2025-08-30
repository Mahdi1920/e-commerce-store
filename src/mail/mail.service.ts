import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}

  async sendUserActivationEmail(email: string, activationLink: string) {
    await this.mailerService.sendMail({
      to: email,
      subject: 'Activate your NextShop account',
      html: `
        <h3>Welcome to NextShop!</h3>
        <p>Please click the link below to activate your account:</p>
        <a href="${activationLink}">${activationLink}</a>
      `,
    });
  }

  async sendPasswordResetEmail(email: string, resetLink: string) {
    await this.mailerService.sendMail({
      to: email,
      subject: 'Reset your password',
      html: `
        <h3>Password Reset Request</h3>
        <p>You requested to reset your password. Click below to continue:</p>
        <a href="${resetLink}">${resetLink}</a>
      `,
    });
  }
}
