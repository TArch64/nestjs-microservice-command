export function chainClassDecorators(
  ...decorators: ClassDecorator[]
): ClassDecorator {
  return (target) =>
    decorators.reduce(
      (target, decorator) => decorator(target) || target,
      target,
    );
}
