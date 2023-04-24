import { Entity, PrimaryGeneratedColumn,  PrimaryColumn, Column, Unique } from "typeorm";
import {MinLength, IsNotEmpty} from "class-validator";
import * as bcrypt from 'bcryptjs';


@Entity()
export class Usuario {


    @PrimaryColumn()
    documento:number

    @Column()
    nombre: string

    @Column()
    apellido: string

    
    @Column()
    @MinLength(6)
    password: string;

    @Column()
    @IsNotEmpty()
    rol: string;



    /*  con esto estoy hasheando password */
    hashPassword():void {
        const salt = bcrypt.genSaltSync(10);
        this.password = bcrypt.hashSync(this.password,salt);
    }

    /*  Este método valida que un valor que yo le ingrese sea igual al valor del password ya encriptado, devuelve true o false */
    checkPassword(password:string ):boolean{
        return bcrypt.compareSync(password,this.password);
    }


}
