import amqp from 'amqplib';
import dotenv from 'dotenv';

dotenv.config();

let connection = null;
let channel = null;

export const connectRabbitMQ = async () => {
  try {
    connection = await amqp.connect(process.env.RABBITMQ_URL || 'amqp://localhost:5672');
    channel = await connection.createChannel();
    console.log('RabbitMQ connected');
  } catch (error) {
    console.error('RabbitMQ Error', error);
  }
};

export const getChannel = () => channel;
