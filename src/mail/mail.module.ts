import { MailerModule } from '@nestjs-modules/mailer';
import { Module } from '@nestjs/common';
import { MailService } from './mail.service';

@Module({
  imports: [
    MailerModule.forRoot({
      transport: {
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: process.env.SMTP_PORT || 587,
        secure: process.env.SMTP_SECURE || false, // true for 465, false for other ports
        auth: {
          user: process.env.MAIL_USERNAME || 'nextshop.a@gmail.com',
          pass: process.env.MAIL_PASSWORD || 'ydwq mgxp lfjg atzf',
        },
      },
      defaults: {
        from: `<${process.env.MAIL_USERNAME || 'nextshop.a@gmail.com'}>`,
      },
    }),
  ],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
