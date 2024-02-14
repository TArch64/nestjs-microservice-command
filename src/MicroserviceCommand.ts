import { firstValueFrom } from 'rxjs';
import { ClientProxy } from '@nestjs/microservices';
import { MicroserviceCommandStatus } from './MicroserviceCommandStatus';

export type AnyCommand = MicroserviceCommand<unknown, unknown>;

export abstract class MicroserviceCommand<
  Input = null,
  Output = MicroserviceCommandStatus,
> {
  $input!: Input;
  $output!: Output;

  constructor(public input: Input) {}

  send(client: ClientProxy): Promise<Output> {
    return firstValueFrom(client.send<Output, Input>(this.pattern, this.input));
  }

  get pattern(): object {
    return { cmd: this.constructor.name };
  }
}
