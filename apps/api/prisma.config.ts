// Config del CLI de Prisma (migrate, studio, generate). Con este archivo
// presente Prisma NO carga `.env` por su cuenta: usamos el mismo cargador que la
// app (env.txt + .env con expansión de ${PGUSER}/${PGPASSWORD}).
import './src/config/load-env';
import { defineConfig } from 'prisma/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',
});
