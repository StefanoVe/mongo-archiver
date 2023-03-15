import * as nodemailer from 'nodemailer';
import { Attachment } from 'nodemailer/lib/mailer/index.js';
import { colorfulLog, declareEnvs } from './service.utils.js';

const { SMTP_HOST, SMTP_PORT, SMTP_SECURE, SMTP_USER, SMTP_PASSWORD } =
  declareEnvs([
    'SMTP_HOST',
    'SMTP_PORT',
    'SMTP_SECURE',
    'SMTP_USER',
    'SMTP_PASSWORD',
    'SMTP_FROM',
  ]);
export interface ISendEmailOptions {
  emails: string[];
  subject: string;
  text?: string;
  attachments?: { path: string; filename: string; cid?: string }[];
  transporter?: {
    fromLabel: string;
    host: string;
    port: number;
    secure: boolean;
    auth: { user: string; pass: string };
    replyTo?: string;
  };
}

//aggiungere funzione che manda email di conferma operazione all'email che ha richiesto il servizio.
const defaultTransporter = nodemailer.createTransport({
  host: String(SMTP_HOST),
  port: Number(SMTP_PORT),
  secure: Boolean(SMTP_SECURE),
  auth: {
    user: String(SMTP_USER),
    pass: String(SMTP_PASSWORD),
  },
});

export const sendEmail = async (
  emails: string[],
  title: string,
  text?: string,
  attachments?: Attachment[],
  transporter?: {
    fromLabel: string;
    host: string;
    port: number;
    secure: boolean;
    auth: { user: string; pass: string };
    replyTo?: string;
  }
) => {
  const activeTransporter = transporter
    ? nodemailer.createTransport(transporter)
    : defaultTransporter;

  console.log(activeTransporter);

  const email = await activeTransporter
    .sendMail({
      from: transporter?.fromLabel || process.env.SMTP_FROM,
      to: emails.join(', '),
      subject: title,
      html:
        text +
        `<br><br><i><small>Questa è una mail automatica, non è pertanto garantito un riscontro in caso di risposta</small></i><br>`,
      attachments,
    })
    .catch((error) => {
      colorfulLog(error, 'error');
    });

  return email;
};
