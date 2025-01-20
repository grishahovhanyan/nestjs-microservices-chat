import { ClientProvider, Transport } from '@nestjs/microservices'

export function getTcpConnectionOptions(host: string, port: number): ClientProvider {
  return {
    transport: Transport.TCP,
    options: {
      host,
      port
    }
  }
}

export function getGrpcConnectionOptions(url: string, protoPath: string, packageName: string): ClientProvider {
  return {
    transport: Transport.GRPC,
    options: {
      url,
      protoPath,
      package: packageName
    }
  }
}
