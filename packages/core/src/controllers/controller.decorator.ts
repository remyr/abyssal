import "reflect-metadata";
import * as urlJoin from "url-join";

import { CONTROLLER_ROUTES, ROUTE_DEF } from "../reflection-types";

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
    const routeDef: IRouteDef[] = Reflect.getMetadata(ROUTE_DEF, target).map(
      (route: any) => {
        const { method, path, middlewares, fnName } = route;
        const url = urlJoin(options.path, path);
        return { method, middlewares, fnName, url };
      },
    );

    Reflect.defineMetadata(CONTROLLER_ROUTES, routeDef, target);
  };
}
