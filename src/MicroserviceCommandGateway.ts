import {ModuleRef} from "@nestjs/core";
import {Controller, Inject, Type, UseFilters} from "@nestjs/common";
import {MessagePattern} from "@nestjs/microservices";
import {chainClassDecorators, chainMethodDecorators} from "@minimo/core/decorators";
import {IMicroserviceCommandHandler} from "./MicroserviceCommandHandler";
import {AnyCommand} from "./MicroserviceCommand";
import {getHandlerMetadata} from "./MicroserviceCommandHandlerMetadata";
import {MicroserviceExceptionFilter} from "../MicroserviceExceptionFilter";

const buildPrefixedName = (...parts: string[]) => ['$gateway'].concat(parts).join('__');

function defineMethod(target: Function, name: string, method: Function): string {
  const scropedName = buildPrefixedName(name);
  target.prototype[scropedName] = method;
  return scropedName;
}

function decorateMethod(target: Function, name: string, decorator: MethodDecorator)  {
  const descriptor = Object.getOwnPropertyDescriptor(target.prototype, name);
  const decorated = decorator(target, name, descriptor) || descriptor;
  Object.defineProperty(target.prototype, name, decorated);
}

export function MicroserviceCommandGateway(handlers: Type<IMicroserviceCommandHandler>[]): ClassDecorator {
  return chainClassDecorators((target) => {
    // @ts-expect-error
    class GatewayImpl extends target {
      @Inject()
      private $gateway__ModuleRef: ModuleRef
      private $gateway__ResolverCache = new WeakMap<Type<unknown>, unknown>();

      private async $gateway__Resolve<Obj>(handler: Type<Obj>): Promise<Obj> {
        if (!this.$gateway__ResolverCache.has(handler)) {
          const instance = await this.$gateway__ModuleRef.create(handler);
          this.$gateway__ResolverCache.set(handler, instance);
        }
        return this.$gateway__ResolverCache.get(handler) as Obj
      }
    }

    for (const handler of handlers) {
      const metadata = getHandlerMetadata<AnyCommand>(handler);
  
      if (!metadata) {
        throw new Error('Command handler should be decorated with MicroserviceCommandHandler decorator');
      }
  
      const handlerCommand = async function(input: unknown): Promise<unknown> {
        const handlerInstance: IMicroserviceCommandHandler = await this.$gateway__Resolve(handler);
        return handlerInstance.handle(input);
      };

      const commandName = defineMethod(GatewayImpl, metadata.commandType.name, handlerCommand);

      decorateMethod(GatewayImpl, commandName, chainMethodDecorators(
        UseFilters(MicroserviceExceptionFilter),
        MessagePattern(metadata.pattern)
      ));
    }

    Object.defineProperty(GatewayImpl, 'name', { value: target.name + 'Impl' });
    return GatewayImpl as unknown as typeof target;
  }, Controller());
}
