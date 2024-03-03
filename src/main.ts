import http from 'http';
import { Router } from './router/abstract/router';
import { NotesController } from './controllers/notes.controller';
import { UserController } from './controllers/user.controller';
import { AuthMiddleware } from './middlewares/auth.middleware';
import { CorsMiddleware } from './middlewares/cors.middleware';
import { loadEnv, checkRequiredEnvVariables } from './helpers/loadEnv';
import * as process from 'process';

// !important should be first as it loads envs
loadEnv();
const requiredVars = ['CLIENT_BASE_URL', 'PORT'] as const;
checkRequiredEnvVariables(requiredVars);

const noteController = new NotesController();
const userController = new UserController();
const authMiddleware = new AuthMiddleware();
const corsMiddleware = new CorsMiddleware();
const router = new Router();

router.get('/notes', noteController.findAll.bind(noteController), [
  authMiddleware.check.bind(authMiddleware),
]);
router.get('/notes/:id', noteController.findOne.bind(noteController), [
  authMiddleware.check.bind(authMiddleware),
]);
router.delete('/notes/:id', noteController.deleteOne.bind(noteController), [
  authMiddleware.check.bind(authMiddleware),
]);
router.delete(
  '/notes/todo/:id',
  noteController.deleteOneTodo.bind(noteController),
  [authMiddleware.check.bind(authMiddleware)],
);
router.post('/notes', noteController.createOne.bind(noteController), [
  authMiddleware.check.bind(authMiddleware),
]);
router.post('/notes/todo', noteController.addTodo.bind(noteController), [
  authMiddleware.check.bind(authMiddleware),
]);
router.patch('/notes/:id', noteController.updateOne.bind(noteController), [
  authMiddleware.check.bind(authMiddleware),
]);

router.get('/user', userController.getMyself.bind(userController), [
  authMiddleware.check.bind(authMiddleware),
]);
router.post('/user/register', userController.register.bind(userController));
router.post('/user/sign-in', userController.signIn.bind(userController));
router.delete('/user/sign-out', userController.signOut.bind(userController));

const server = http.createServer(async (req, res) => {
  corsMiddleware.apply(req as never, res, () => {
    router.handleRequest(req as never, res);
  });
});
server.listen(process.env.PORT, () => {
  console.log('Server is listening on port', process.env.PORT);
});
