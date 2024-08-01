import nodemailer from 'nodemailer';
import * as dotenv from 'dotenv';

dotenv.config();

async function sendEmail(recipient: string, subject: string, body: string): Promise<void> {
  return;
  // // Create a transporter object using the default SMTP transport
  // const transporter = nodemailer.createTransport({
  //   service: 'gmail',
  //   auth: {
  //     user: process.env.GMAIL_APP_EMAIL,
  //     pass: process.env.GMAIL_APP_PASSWORD
  //   }
  // });

  // // Email options
  // const mailOptions = {
  //   from: 'jansipkovsky2@gmail.com', // Sender address
  //   to: recipient, // List of recipients
  //   subject: subject, // Subject line
  //   text: body, // Plain text body
  //   html: body // HTML body content
  // };

  // // Send email
  // try {
  //   const info = await transporter.sendMail(mailOptions);
  //   console.log('Message sent: %s', info.messageId);
  //   // Optionally, you could return the messageId or another success indicator to the caller
  // } catch (error) {
  //   console.error('Error sending email: ', error);
  //   throw error; // Rethrow the error to handle it in the calling context
  // }
}

export { sendEmail };
