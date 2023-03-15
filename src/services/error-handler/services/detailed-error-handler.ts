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

/**
 * It logs the error, sends an email to the admin and throws a BadRequestError
 * @param options - {
 * @param options.errorContext //nome del file o eventuali aiuti per trovare l'esatta locazione dell'errore nell'ide
 * @param options.emailBody //testo della mail
 * @param options.error //errore verificato (ottenibile facendo catch)
 */
export const detailedErrorHandler = async (options: {
  errorContext: string;
  emailBody: string;
  error: Error;
}) => {
  const message = await errorLogger(options);

  throw new BadRequestError(message);
};

export const errorLogger = async (options: {
  errorContext: string;
  emailBody: string;
  error: Error;
}) => {
  const error = options.error;

  console.error(`${error} ${options.errorContext} - ${options.emailBody}`);

  const message =
    error && error.message
      ? `ERRORE ${options.errorContext}: ${error.message}`
      : `ERRORE ${options.errorContext}: <br /> ${JSON.stringify(error)}`;

  const emailAdmin = process.env.EMAIL_ADMIN;
  const emailModerator = process.env.EMAIL_MOD || '';

  if (emailAdmin) {
    await sendEmail(
      [emailAdmin, emailModerator],
      `ERRORE: ${options.errorContext}`,
      `${options.emailBody} <br /> INFO ERRORE: ${
        error.message || JSON.stringify(error)
      }`
    );
  }

  return message;
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
      console.error(error);
    });

  return email;
};
