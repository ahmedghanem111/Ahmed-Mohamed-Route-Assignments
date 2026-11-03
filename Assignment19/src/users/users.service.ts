import { Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { CreateUserDto } from './dto/create-user.dto.js';

export interface User extends CreateUserDto {
  id: string;
}

@Injectable()
export class UsersService {
  private readonly users = new Map<string, User>();

  async createUser(data: CreateUserDto): Promise<User> {
    const user: User = { id: randomUUID(), ...data };
    this.users.set(user.id, user);
    return user;
  }

  async findAll(): Promise<User[]> {
    return [...this.users.values()];
  }

  async findOne(id: string): Promise<User> {
    const user = this.users.get(id);
    if (!user) {
      throw new NotFoundException(`User with id "${id}" was not found`);
    }
    return user;
  }

  async updateUser(id: string, data: Partial<CreateUserDto>): Promise<User> {
    const user = await this.findOne(id);
    const updatedUser = { ...user, ...data };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async deleteUser(id: string): Promise<void> {
    await this.findOne(id);
    this.users.delete(id);
  }
}
