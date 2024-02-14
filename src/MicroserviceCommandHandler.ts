import {Injectable, Type} from "@nestjs/common";
import {chainClassDecorators} from "@minimo/core/decorators";
import { AnyCommand } from "./MicroserviceCommand";
import {defineHandlerMetadata} from "./MicroserviceCommandHandlerMetadata";

export interface IMicroserviceCommandHandler<C extends AnyCommand = AnyCommand, I = C['$input'], O = C['$output']> {
  handle(input: I): Promise<O>;
}

export function MicroserviceCommandHandler<C extends AnyCommand>(commandType: Type<C>): ClassDecorator {
  return chainClassDecorators((target) => {
    defineHandlerMetadata<C>(target, commandType)
    return target;
    }, Injectable());
}
