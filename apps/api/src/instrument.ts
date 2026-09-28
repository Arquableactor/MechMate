// Side-effect: inicializa Sentry. main.ts lo importa justo después de cargar el
// entorno y ANTES que el resto, para que el SDK instrumente los módulos.
import { initSentry } from './observability/sentry';

initSentry(process.env);
