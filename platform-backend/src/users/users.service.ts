import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CreateAccountInput } from "./dtos/create-account.dto";
import { LoginInput } from "./dtos/login.dto";
import { User } from "./entities/user.entity";

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User) private readonly users: Repository<User>
    ) {}

    async createAccount({email, password, role}: CreateAccountInput): Promise<{ ok: boolean, error?: string }> {
        try {
            const exists = await this.users.findOne({ email });
            if(exists) {
                return {
                    ok: false, 
                    error: 'Пользователь с такой почтой уже существует'
                };
            }

            await this.users.save(this.users.create({ email, password, role }));
            return {
                ok: true
            };
        } catch(e) {
            return {
                ok: false, 
                error: 'Не получается создать аккаунт'
            };
        }
    }

    async login({email, password}: LoginInput): Promise<{ ok: boolean, error?: string, token?: string }> {
        try {
            const user = await this.users.findOne({ email });
            if(!user) {
                return {
                    ok: false, 
                    error: 'Пользователя не существует'
                };
            }

            const passwordCorrect = await user.checkPassword(password);
            if(!passwordCorrect) {
                return {
                    ok: false, 
                    error: 'Неверный пароль'
                };
            }

            return {
                ok: true, 
                token: 'good job!'
            };
        } catch(error) {
            return {
                ok: false, 
                error: error
            };
        }
    }
}