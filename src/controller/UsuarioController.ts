import {getRepository, getManager} from "typeorm";
import {Request,Response} from "express";
import config from "../config/config";
import * as jwt from 'jsonwebtoken';
import {validate} from "class-validator";
import {Usuario} from "../entity/Usuario";
import * as console from "console";

class UsuarioController {


     //aqui estoy definiendo el método login que recibe un request req,  y devuelve un response res
     static  login = async  (req:Request,res:Response) => {

         /* parametros del login (body) */
         const {username, password} = req.body;

         /*  si username y password no existen entonces envie respuesta con codigo de error 400*/
         if (!(username && password)) {
               return  res.status(400).json({message: 'Ususario y password son requeridos'});
         }         

         /*  Creo  un repositorio de la clase  Usuario  */
         const usuarioRepositorio = getRepository(Usuario);

         /* creo un objeto usuario de la clase Usuario */
         let  usuario:Usuario;

         /*  aqui valido si encontró el usuario */
         try{
            /* esto devuelve el primer user que encuentre en la bd, pero solo valida por el userid, no por el password */
            usuario = await usuarioRepositorio.findOneOrFail({where:{documento:username}});
            /* creo un objeto user de la clase User */
         }
         catch(err){
            return  res.status(400).json({message:'Usuario incorrecto',
            error: err.message});
         }

         /*  aqui valido  que el password que ingresaron coincida con el que está encriptado en la bd */
         if(!usuario.checkPassword(password)){
            return res.status(400).json({messaje:'Password  incorrecto'});
         } 
        
         const token = jwt.sign({userId: usuario.documento},config.jwtSecret, {expiresIn:'120h'});

         /*  en caso que_todo vaya bien devolvemos el usuario   */
         res.json({message:'OK',
                  token, 
                  documento:usuario.documento,
                  rol:usuario.rol, 
                  nombre:usuario.nombre});

     };

     
     // aqui  defino el metodo para cambiar password
     static cambiarPassword = async (req:Request,res:Response) => {
      const {userId} = res.locals.jwtPayload;
      const {oldPassword,newPassword}= req.body;

         // valido que password nuevo y viejo estén llenos
         if(!(oldPassword && newPassword)){
            res.status(400).json({message:'Password nuevo y viejo son requeridos'});
         }

            /*  Creo  un repositorio de la clase  Usuario  */
            const usuarioRepositorio = getRepository(Usuario);

            /* creo un objeto usuario de la clase Usuario */
            let  usuario:Usuario;

         try{

            usuario = await usuarioRepositorio.findOneOrFail(userId);

         } 
         catch(err){
            res.status(400).json({message:'No se pudo cambiar el password',
            error: err.message});
         }

         if (!usuario.checkPassword(oldPassword)){
            return res.status(401).json({message:'Acceso denegado, verifique su viejo password'});
         }

         usuario.password = newPassword;

         const validationOptions = {validationError:{target: false, value:false}};
         const errors = await  validate(usuario,validationOptions);

         if(errors.length>0){
            return res.status(400).json({message:'ocurrio el siguiente error',errors});
        }

         //Hash password
        usuario.hashPassword();
        usuarioRepositorio.save(usuario);

        res.json({message:`El password se ha cambiado satisfactoriamente` });

     };


     //obtiene todos los usuarios
     static mostrarUsuarios =async (req:Request,res:Response) => {

         const entityManager = getManager();
         const usuarios = await entityManager.find('usuario', {
         select: ['documento', 'nombre', 'apellido', 'rol']
         });      
         /*  Creo  un repositorio de la clase  Usuario  */
         // const usuarioRepositorio = getRepository(Usuario);
         //hacemos un select * de todos los usuarios
         // const usuarios = await usuarioRepositorio.find();

         if(usuarios.length >0){
            res.send(usuarios);
         }
         else
         {
            res.status(404).json({messsage: 'no hay usuarios registrados'});
         }

     };


     //crea un nuevo usuario
     static nuevoUsuario = async (req:Request,res:Response) => {

         //defino el body
         const {
                  documento,
                  nombre,
                  apellido,
                  password,
                  rol
               
               } = req.body;

               
           /*  nuevo objeto de la entidad Usuario */    
          const usuario = new Usuario();
          
          usuario.documento = documento;
          usuario.nombre = nombre;
          usuario.apellido = apellido;
          usuario.password = password,
          usuario.rol = rol;


          //variable validationOption es un objeto con target y valor
         const validationOption = {validationError:{target:false, value:false}};
         
         //Validate
        const errors = await validate(usuario,validationOption);


         //si hay errores entonces que haga
        if(errors.length > 0){
            return res.status(400).json(errors);
        }

        //creo un repositorio 
        const usuarioRepositorio = getRepository(Usuario);

        try {
         usuario.hashPassword();
         await usuarioRepositorio.save(usuario)
        }
        catch(err){
            return res.status(409).json({
               status: 'Error',
               message: 'Usuario no creado',
               error: err.message});
        }

        res.send({ status: 'OK',
                   message: 'Usuario creado'});

     
     };
     
     
     //buscar usuario por Id
     static buscarUsuarioPorId = async (req:Request,res:Response) => {

         //elemento que irá via get
         const {id} = req.params;
         //creo un repositorio de la clase usuario
         const usuarioRepositorio = getRepository(Usuario);

         try{

            const usuario = await  usuarioRepositorio.findOneOrFail(id);
            console.log('busqueda por id:', usuario );
            res.send({documento: usuario.documento,
                      nombre: usuario.nombre,
                      apellido: usuario.apellido,
                      rol: usuario.rol});
         }
         catch(err){
            res.status(404).json({message: 'No hay Registros para mostrar',
                                  error:err.message});
         }


     };


     //editar usuario específico
     static editarUsuario = async (req:Request,res:Response) => {

      
      let usuario
      
      //defino el id del usuario a actualizar
      const {id} = req.params;

       //defino el body
       const {
         nombre,
         apellido,
         rol
      
      } = req.body;

      const usuarioRepositorio = getRepository(Usuario);
      const entityManager = getManager();

      //busco el usuario
      try{
        
          usuario = await entityManager.findOne('usuario', {
            where: {
              documento: id
            }
          });


         // usuario = await usuarioRepositorio.findOneOrFail(id);

         //leno el objeto usuario con los nuevos datos
         // usuario.documento = id;
         usuario.nombre = nombre;
         usuario.apellido = apellido;
         usuario .rol = rol;        


      }
      catch(err){

          return res.status(404).json({ message: 'Usuario no encontrado',
                                                     error: err.message});
      }

      //variable validationOption es un objeto con target y valor
      const validationOption = {validationError:{target:false, value:false}};

      //Validate
      const errors = await validate(usuario,validationOption);

      //si hay errores entonces que haga
      if(errors.length > 0){
            return res.status(400).json(errors);
      };

      //graba en la tabla usuarios
      try{

         await entityManager.save(usuario);

         // await usuarioRepositorio.save(usuario)
      }
      catch(err){
         return res.status(409).json({status: 'Error',
                message: 'No se pudo guardar la información',
                error:err.message})
      }

      res.status(201).json({message: 'Usuario se ha modificado'});

     };


     //borrar usuario
     static borrarUsuario = async (req:Request,res:Response) =>{

       //elemento que irá via get
       const {id} = req.params;
       //creo un repositorio de la clase usuario
       const usuarioRepositorio = getRepository(Usuario);

       //valido que el usuario exista:
       try{
         const usuario = await  usuarioRepositorio.findOneOrFail(id);
         usuarioRepositorio.delete(usuario);
         
       }
       catch(err){
         res.status(404).json({message: 'el usuario no existe',
         error:err.message});
       }

       res.send({
               message: 'Usuario Eliminado'
       });

     }



}

export default  UsuarioController;