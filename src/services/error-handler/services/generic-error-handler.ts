import { Logger } from '@golden/logger';
import * as nodemailer from 'nodemailer';
import { BadRequestError, RequiredEnvVariableError } from '../errors/index.js';

const requiredEnvVariables = [
  'SMTP_HOST',
  'SMTP_PORT',
  'SMTP_SECURE',
  'SMTP_USER',
  'SMTP_PASSWORD',
  'SMTP_FROM',
  'EMAIL_ADMIN',
  'PRODUZIONE',
  'EMAIL_MOD',
];

requiredEnvVariables.forEach((envVariable) => {
  if (!process.env[envVariable]) {
    throw new RequiredEnvVariableError(envVariable);
  }
});

//aggiungere funzione che manda email di conferma operazione all'email che ha richiesto il servizio.
const transporter = nodemailer.createTransport({
  host: String(process.env.SMTP_HOST),
  port: Number(process.env.SMTP_PORT),
  secure: Boolean(process.env.SMTP_SECURE),
  auth: {
    user: String(process.env.SMTP_USER),
    pass: String(process.env.SMTP_PASSWORD),
  },
});

export const genericErrorHandler = async (error: Error, inviaMail = true) => {
  Logger.warn(error);

  const message =
    error && error.message
      ? error.message
      : `Errore generico ${JSON.stringify(error)}`;

  const emailAdmin = process.env.EMAIL_ADMIN;
  const emailMod = process.env.EMAIL_MOD || '';
  const produzione = 'true' === process.env.PRODUZIONE;

  if (emailAdmin && produzione && inviaMail) {
    await sendEmail([emailAdmin, emailMod], 'Errore generico app', message);
  }

  throw new BadRequestError(message);
};

const sendEmail = async (emails: string[], subject: string, text: string) => {
  const email = await transporter
    .sendMail({
      from: process.env.SMTP_FROM,
      to: emails.join(', '),
      subject,
      html: text,
    })
    .catch((error) => {
      Logger.error(error);
    });

  return email;
};
