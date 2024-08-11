import { join } from 'path';
import { Transport, ClientProviderOptions } from '@nestjs/microservices';

export const grpcClientOptions: ClientProviderOptions = {
  name: 'POST_SERVICE',
  transport: Transport.GRPC,
  options: {
    package: 'posts',
    protoPath: join(__dirname, '../grpc/posts.proto'),
    url: 'localhost:50052',
    maxReceiveMessageLength: 20 * 1024 * 1024,
    maxSendMessageLength: 20 * 1024 * 1024,
  },
};
