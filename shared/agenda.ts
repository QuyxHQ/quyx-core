import Agenda from 'agenda';
import env from './env';

const agenda = new Agenda({
    db: { address: env.MONGODB_URI, collection: 'jobs' },
});

export default agenda;
