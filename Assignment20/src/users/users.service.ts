import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from './entities/user.entity.js';

@Injectable()
export class UsersService {
  constructor(@InjectRepository(UserEntity) private readonly users: Repository<UserEntity>) {}

  create(data: Pick<UserEntity, 'email' | 'passwordHash'>): Promise<UserEntity> {
    return this.users.save(this.users.create(data));
  }

  findByEmail(email: string): Promise<UserEntity | null> {
    return this.users.findOne({ where: { email: email.toLowerCase() } });
  }

  findByEmailWithPassword(email: string): Promise<UserEntity | null> {
    return this.users
      .createQueryBuilder('user')
      .addSelect('user.passwordHash')
      .where('user.email = :email', { email: email.toLowerCase() })
      .getOne();
  }

  async findById(id: string): Promise<UserEntity> {
    const user = await this.users.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async markEmailVerified(id: string): Promise<UserEntity> {
    await this.users.update({ id }, { isEmailVerified: true });
    return this.findById(id);
  }

  async updatePassword(id: string, passwordHash: string): Promise<void> {
    await this.users
      .createQueryBuilder()
      .update(UserEntity)
      .set({ passwordHash, tokenVersion: () => '"token_version" + 1' })
      .where('id = :id', { id })
      .execute();
  }

  findAll(): Promise<UserEntity[]> {
    return this.users.find();
  }

  async deleteUser(id: string): Promise<{ deleted: true }> {
    const user = await this.findById(id);
    await this.users.remove(user);
    return { deleted: true };
  }
}
