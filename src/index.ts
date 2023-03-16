import { app } from './routes/app.js';
import { connectToMainDB } from './services/connect.js';
import { runSchedule } from './services/cron.schedule.js';
import { colorfulLog, declareEnvs } from './services/service.utils.js';

connectToMainDB();

runSchedule();

const { PORT } = declareEnvs(['PORT']);

colorfulLog(`STARTING SERVER`, 'start');

const server = app.listen(PORT || 3000, () => {
  colorfulLog(`Listening on PORT ${PORT}`, 'success');
});

server.on('error', console.error);
