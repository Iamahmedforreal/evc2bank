import dotenv from 'dotenv';

import path from 'path';

const envFilee = `.env.${process.env.NODE_ENV || 'development'}`;

dotenv.config({path: path.resolve(process.cwd(), envFilee)});

function getEnv(key , fallback ) {

    const value = process.env[key];
    console.log(`Key: ${key}, Value: ${value}`);
    if (value === undefined){
        if(fallback !== undefined) return fallback;
        throw new Error(`Environment variable ${key} is not defined`);
    }
    return value;

}

export const config = {
  nodeEnv: getEnv("NODE_ENV", "development"),
  port: getEnv("PORT", 4000),

  postgres: {
    host: getEnv("POSTGRES_HOST", "localhost"),
    port: getEnv("POSTGRES_PORT", 5432),
    user: getEnv("POSTGRES_USER", "postgres"),
    password: getEnv("POSTGRES_PASSWORD", "password"),
    database: getEnv("POSTGRES_DB", "mydb"),
  },


};

