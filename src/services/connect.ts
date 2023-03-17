import mongoose, { connect } from 'mongoose';
import { colorfulLog, declareEnvs } from './service.utils.js';

const { MAIN_MONGO_URI } = declareEnvs(['MAIN_MONGO_URI']);

export const connectToMainDB = async () => {
  // Tenta di connettersi a MongoDB
  await connect(MAIN_MONGO_URI || '').catch(async (error) =>
    // Se ci sono errori li mostra in console
    {
      colorfulLog(error, 'error');

      await connectToMainDB();
    }
  );

  // Altrimenti mostra in console un messaggio di avvenuta connessione
  colorfulLog('Connected to main DB', 'success');
};

export const testConnection = async (uri: string, timeout = 5000) => {
  const _connection = mongoose.createConnection(uri, {
    connectTimeoutMS: timeout,
    socketTimeoutMS: timeout,
    serverSelectionTimeoutMS: timeout,
  });

  let success = true;

  await _connection
    .getClient()
    .connect()
    .catch(() => {
      colorfulLog('Connection failed', 'error');
      success = false;
    });

  if (!success) {
    return false;
  }

  await _connection.close();

  return true;
};
