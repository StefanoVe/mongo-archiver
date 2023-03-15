import { app } from './routes/app.js';
import { connectToMainDB } from './services/connect.js';
import { colorfulLog, declareEnvs } from './services/service.utils.js';

connectToMainDB();

const { PORT } = declareEnvs(['PORT']);

colorfulLog(`Starting web server`, 'info');

const server = app.listen(PORT || 3000, () => {
  colorfulLog(`Listening on PORT ${PORT}`, 'success');
});

server.on('error', console.error);
