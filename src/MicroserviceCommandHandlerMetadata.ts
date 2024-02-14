import {Type} from "@nestjs/common";
import {AnyCommand} from "./MicroserviceCommand";

const MetadataKey = Symbol('MicroserviceCommandHandlerMetadata');

export interface IMicroserviceCommandHandlerMetadata<C extends AnyCommand> {
  commandType: Type<C>;
  pattern: object;
  $input: C['$input'];
  $output: C['$output'];
}

export function defineHandlerMetadata<C extends AnyCommand>(handler: Function, commandType: Type<C>): void {
  const metadata: IMicroserviceCommandHandlerMetadata<C> = {
    commandType,
    pattern: { cmd: commandType.name },
    $input: null!,
    $output: null!
  }
  Reflect.defineMetadata(MetadataKey, metadata, handler);
}

export function getHandlerMetadata<C extends AnyCommand>(target: Function): IMicroserviceCommandHandlerMetadata<C> | null {
  return Reflect.getMetadata(MetadataKey, target) || null;
}
