import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

// Create the connection instance
const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  logging: false,
});

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ PostgreSQL Connected Successfully.');
    
    await sequelize.sync(); 
    console.log('✅ Database Synced.');
    
  } catch (error) {
    console.error('❌ Database Connection Failed:', error);
    process.exit(1);
  }
};

// Named exports
export { sequelize, connectDB };