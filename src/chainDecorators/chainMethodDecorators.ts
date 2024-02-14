export function chainMethodDecorators(
  ...decorators: MethodDecorator[]
): MethodDecorator {
  return (target, propertyKey, descriptor) =>
    decorators.reduce((descriptor, decorator) => {
      return decorator(target, propertyKey, descriptor) || descriptor;
    }, descriptor);
}
