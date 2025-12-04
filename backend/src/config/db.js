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
    
    // --- CHANGE THIS LINE ---
    // force: true drops the tables and re-creates them. 
    // This fixes the "column contains null values" error.
    await sequelize.sync({ force: true }); 
    console.log('✅ Database Synced .');
    
  } catch (error) {
    console.error('❌ Database Connection Failed:', error);
    process.exit(1);
  }
};

// Named exports
export { sequelize, connectDB };