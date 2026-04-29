import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserStatus } from './entities/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(email: string, password: string, fullName: string): Promise<User> {
    const existing = await this.userRepository.findOne({ where: { email } });
    if (existing) {
      throw new ConflictException('User already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User();
    user.email = email;
    user.password = hashedPassword;
    user.full_name = fullName;

    return this.userRepository.save(user);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ 
      where: { email },
      select: ['id', 'email', 'password', 'full_name', 'status', 'avatar_url', 'role', 'metadata'] 
    });
  }

  async findById(id: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async updateStatus(id: string, status: UserStatus): Promise<User> {
    const user = await this.findById(id);
    user.status = status;
    return this.userRepository.save(user);
  }

  async updateProfile(id: string, data: Partial<User>): Promise<User> {
    const user = await this.findById(id);
    Object.assign(user, data);
    return this.userRepository.save(user);
  }

  async findAll(): Promise<User[]> {
    return this.userRepository.find();
  }
}
