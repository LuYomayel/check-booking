import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  async sendEmail(dateString: string) {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      secure: false,
      auth: {
        user: 'mailsauto235@gmail.com',
        pass: 'hrqqhugiegqyzfdj',
      },
    });

    const mailOptions = {
      from: 'mailsauto235@gmail.com',
      to: 'yomayelluciano@gmail.com',
      subject: 'Booking available within allowed range',
      text: `Date ${dateString} is within the allowed range`,
    };

    await transporter.sendMail(mailOptions);
  }
}
