import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../users/entity/user.entity';
import { Role } from '../common/enum/role.enum';
import * as bcrypt from 'bcrypt';
import type { Repository } from 'typeorm';

async function seedAdmin() {
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn'],
  });

  try {
    const userRepo = app.get<Repository<User>>(getRepositoryToken(User));

    const email = process.env.ADMIN_EMAIL || 'admin@innerpeace.local';
    const username = process.env.ADMIN_USERNAME || 'admin';
    const password = process.env.ADMIN_PASSWORD || 'Admin@1234!';

    let user = await userRepo.findOne({ where: [{ email }, { username }] });

    const hashedPassword = await bcrypt.hash(password, 10);

    if (user) {
      user.email = email;
      user.username = username;
      user.password = hashedPassword;
      user.role = Role.ADMIN;
      await userRepo.save(user);
      console.log(`\nExisting user updated to ADMIN.`);
    } else {
      user = userRepo.create({
        username,
        email,
        password: hashedPassword,
        role: Role.ADMIN,
      });
      await userRepo.save(user);
      console.log(`\nNew ADMIN user successfully created.`);
    }

    console.log(`-----------------------------------------------`);
    console.log(`Admin Email:    ${email}`);
    console.log(`Admin Password: ${password}`);
    console.log(`Role:           ${Role.ADMIN}`);
    console.log(`-----------------------------------------------\n`);
  } catch (error) {
    console.error('Failed to seed admin user:', error);
  } finally {
    await app.close();
  }
}

void seedAdmin();
