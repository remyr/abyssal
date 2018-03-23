import "reflect-metadata";
import * as urlJoin from "url-join";

import { AbyssalGuards } from "../guards";
import {
  CONTROLLER_ROUTES,
  ROUTE_DEF,
  CONTROLLER_GUARDS,
} from "../reflection-types";

export interface IControllerDecoratorOptions {
  path: string;
  guards?: any[];
}

export interface IRouteDef {
  method: string;
  url: string;
  fnName: string;
  middlewares: any[];
  guards: any[];
}

export function Controller(options: IControllerDecoratorOptions) {
  return (target: any) => {
    const routeDef: IRouteDef[] = Reflect.getMetadata(ROUTE_DEF, target).map(
      (route: any) => {
        const { method, path, middlewares, fnName, guards } = route;
        const url = urlJoin(options.path, path);
        return { method, middlewares, fnName, url, guards };
      },
    );

    Reflect.defineMetadata(CONTROLLER_ROUTES, routeDef, target);
    Reflect.defineMetadata(CONTROLLER_GUARDS, options.guards || [], target);
  };
}
