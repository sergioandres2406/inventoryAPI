import UsuarioController from '../controller/UsuarioController';
import { Router } from 'express';
import { checkJwt } from '../middlewares/jwt';
import { checkRole } from '../middlewares/role';

const router = Router();


//primer creación de usuario sin seguridad
router.post('/first', UsuarioController.nuevoUsuario);

//logueo
router.post('/login',UsuarioController.login);

//cambiar password
router.post('/cambiopassword',[checkJwt,checkRole(['Admin'])],UsuarioController.cambiarPassword);

//mostrar usuarios
router.get('/',[checkJwt,checkRole(['Admin'])],UsuarioController.mostrarUsuarios);

//nuevo usuario
router.post('/',[checkJwt,checkRole(['Admin'])],UsuarioController.nuevoUsuario);

//busca usuario por documento
router.get('/:id',[checkJwt,checkRole(['Admin'])],UsuarioController.buscarUsuarioPorId);

//editar un usuario
router.patch('/:id',[checkJwt,checkRole(['Admin'])],UsuarioController.editarUsuario);

//borrar usuario
router.delete('/:id',[checkJwt,checkRole(['Admin'])],UsuarioController.borrarUsuario);


export default router;