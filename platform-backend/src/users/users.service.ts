import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import * as jwt from "jsonwebtoken";
import { CreateAccountInput } from "./dtos/create-account.dto";
import { LoginInput } from "./dtos/login.dto";
import { User } from "./entities/user.entity";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "src/jwt/jwt.service";
import { EditProfileInput } from "./dtos/edit-profile.dto";

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User) private readonly users: Repository<User>,
        private readonly jwtService: JwtService
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

            const token = this.jwtService.sign(user.id);

            return {
                ok: true, 
                token
            };
        } catch(error) {
            return {
                ok: false, 
                error
            };
        }
    }

    async findById(id: number): Promise<User> {
        return this.users.findOne({ id });
    }

    async editProfile(
        userId: number,
        { email, password }: EditProfileInput
        ): Promise<User> {
        const user = await this.users.findOne(userId);
        if(email) {
            user.email = email;
        }
        if(password) {
            user.password = password;
        }
        return this.users.save(user);
    }
}