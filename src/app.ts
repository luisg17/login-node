import { envs } from './config/envs';
import { MongoDatabase } from './data';
import { AppRoutes } from './auth/presentation/routes';
import { Server } from './auth/presentation/server';

//funcion asincrina autoinvocada
(async()=> {
  main();
})();


async function main() {

  await MongoDatabase.connect({
    dbName: envs.MONGO_DB_NAME,
    mongoUrl: envs.MONGO_URL,
  });

  const server = new Server({
    port: envs.PORT,
    routes: AppRoutes.routes,
  });

  server.start();
}