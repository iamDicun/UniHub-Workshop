import amqp from 'amqplib';
import dotenv from 'dotenv';

dotenv.config();

let connection = null;
let channel = null;

export const connectRabbitMQ = async (retryCount = 5) => {
  try {
    connection = await amqp.connect(process.env.RABBITMQ_URL || 'amqp://localhost:5672');
    channel = await connection.createChannel();
    console.log('RabbitMQ connected');
    
    connection.on('error', (err) => {
      console.error('RabbitMQ Connection Error', err);
    });
    
    connection.on('close', () => {
      console.warn('RabbitMQ Connection Closed. Attempting to reconnect...');
      setTimeout(() => connectRabbitMQ(), 5000);
    });

  } catch (error) {
    console.error(`RabbitMQ Connection Failed. Retries left: ${retryCount}`, error.message);
    if (retryCount > 0) {
      console.log('Retrying in 5 seconds...');
      await new Promise(resolve => setTimeout(resolve, 5000));
      return connectRabbitMQ(retryCount - 1);
    } else {
      console.error('RabbitMQ Connection failed after maximum retries');
      // In a real production app, you might want to exit the process here
      // process.exit(1);
    }
  }
};

export const getChannel = () => channel;
