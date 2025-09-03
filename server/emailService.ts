import sgMail from '@sendgrid/mail';

interface EmailParams {
  to: string;
  subject: string;
  html: string;
}

export class EmailService {
  constructor() {
    if (process.env.SENDGRID_API_KEY) {
      sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    }
  }

  async sendEmail(params: EmailParams): Promise<boolean> {
    if (!process.env.SENDGRID_API_KEY) {
      console.error('SENDGRID_API_KEY not configured');
      return false;
    }

    try {
      await sgMail.send({
        to: params.to,
        from: 'no-reply@thedramjournal.com', // You'll need to verify this domain with SendGrid
        subject: params.subject,
        html: params.html,
      });
      return true;
    } catch (error) {
      console.error('Email sending failed:', error);
      return false;
    }
  }

  async sendVerificationEmail(email: string, verificationToken: string, baseUrl: string): Promise<boolean> {
    const verificationUrl = `${baseUrl}/verify-email?token=${verificationToken}`;
    
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Verify Your Email - The Dram Journal</title>
          <style>
            body { font-family: 'Georgia', serif; background-color: #0f1419; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 0 auto; background-color: #1a1f29; padding: 40px; }
            .header { text-align: center; margin-bottom: 30px; }
            .logo { color: #d4af37; font-size: 28px; font-weight: bold; margin-bottom: 10px; }
            .subtitle { color: #8b9dc3; font-size: 16px; }
            .content { color: #dfe2e9; line-height: 1.6; margin-bottom: 30px; }
            .button { display: inline-block; background-color: #d4af37; color: #0f1419; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 20px 0; }
            .footer { color: #666; font-size: 14px; text-align: center; margin-top: 30px; }
            .link { color: #d4af37; word-break: break-all; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">🥃 The Dram Journal</div>
              <div class="subtitle">Verify Your Email Address</div>
            </div>
            
            <div class="content">
              <p>Welcome to The Dram Journal!</p>
              
              <p>Please verify your email address to complete your account setup and start building your whisky collection.</p>
              
              <p style="text-align: center;">
                <a href="${verificationUrl}" class="button">Verify Email Address</a>
              </p>
              
              <p>If the button above doesn't work, you can copy and paste this link into your browser:</p>
              <p class="link">${verificationUrl}</p>
              
              <p>This verification link will expire in 24 hours for security reasons.</p>
              
              <p>If you didn't create an account with The Dram Journal, you can safely ignore this email.</p>
            </div>
            
            <div class="footer">
              <p>Happy whisky journaling!<br>The Dram Journal Team</p>
            </div>
          </div>
        </body>
      </html>
    `;

    return this.sendEmail({
      to: email,
      subject: 'Verify Your Email - The Dram Journal',
      html
    });
  }
}

export const emailService = new EmailService();