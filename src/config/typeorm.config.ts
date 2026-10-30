import { Injectable } from "@nestjs/common";
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from "@nestjs/typeorm";


@Injectable()
export class TypeOrmConfigService implements TypeOrmOptionsFactory {
    createTypeOrmOptions(connectionName?: string): Promise<TypeOrmModuleOptions> | TypeOrmModuleOptions {
        const port = parseInt(process.env.DB_PORT || '5432', 10);

        if (!process.env.DB_HOST || !process.env.DB_USER || !process.env.DB_NAME) {
            throw new Error('Database environment variables are not set correctly');
        }
        return {
            type: 'postgres',
            host: process.env.DB_HOST,
            port,
            username: process.env.DB_USER,
            password: process.env.DB_PASS,
            database: process.env.DB_NAME,
            autoLoadEntities: true,
            //not to use sync in prod
            synchronize: process.env.NODE_ENV !== 'production',


            ssl:
                process.env.DB_SSL === 'true'
                    ? { rejectUnauthorized: false }
                    : false,

        }
    }
}