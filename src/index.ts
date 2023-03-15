import { app } from './routes/app.js';
import { colorfulLog, declareEnvs } from './services/service.utils.js';

const { PORT } = declareEnvs(['PORT']);

colorfulLog(`Starting web server`, 'info');

const server = app.listen(PORT || 3000, () => {
  colorfulLog(`Listening on PORT ${PORT}`, 'success');
});

server.on('error', console.error);
