import sgMail from '@sendgrid/mail';

import { env } from '../config/env';

sgMail.setApiKey(env.sendgridApiKey);

export async function sendVerificationEmail(to: string, code: string) {
  const message = {
    to,
    from: env.sendgridFromEmail,
    subject: 'Verify your BetsCycle account',
    text: `Your verification code is ${code}. It expires in 10 minutes.`,
    html: `
      <div>
        <p>Your verification code is:</p>
        <h2>${code}</h2>
        <p>This code expires in 10 minutes.</p>
      </div>
    `,
  };

  await sgMail.send(message);
}

