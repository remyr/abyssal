import "reflect-metadata";
import { CONTROLLER_ROUTES, ROUTES_PREFIX } from "../reflection-types";

export interface IControllerDecoratorOptions {
  path: string;
}

export interface IRouteDef {
  method: string;
  url: string;
  fnName: string;
  middlewares: any[];
}

export function Controller(options: IControllerDecoratorOptions) {
  return (target: any) => {
    const $routes: IRouteDef[] = Object.getOwnPropertyNames(target.prototype)
      .filter(prop => prop.indexOf(ROUTES_PREFIX) === 0)
      .map(prop => {
        const { method, path, middlewares } = target.prototype[prop];
        const url = `${options.path}${path}`;
        const fnName = prop.substring(ROUTES_PREFIX.length);
        return { method, url, fnName, middlewares };
      });
    Reflect.defineMetadata(CONTROLLER_ROUTES, $routes, target);
  };
}
