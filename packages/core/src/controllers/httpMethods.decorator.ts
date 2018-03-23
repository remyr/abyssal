import "reflect-metadata";
import { NextFunction, Request, Response } from "express";
import { ROUTE_DEF } from "../reflection-types";
import { IRouteDef } from ".";

export interface ICls extends Object {
  [key: string]: any;
}

export type Middleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => void;

export interface HttpMethodOptions {
  middlewares?: Middleware[];
  guards?: any[];
}

export function Get(path: string = "", options?: HttpMethodOptions) {
  return (target: ICls, name: string) => {
    const { middlewares = [], guards = [] } = options;
    const routeDef: IRouteDef[] =
      Reflect.getMetadata(ROUTE_DEF, target.constructor) || [];

    Reflect.defineMetadata(
      ROUTE_DEF,
      [...routeDef, { method: "get", path, middlewares, fnName: name, guards }],
      target.constructor,
    );
  };
}

export function Post(path: string = "", options?: HttpMethodOptions) {
  return (target: ICls, name: string) => {
    const { middlewares = [], guards = [] } = options;
    const routeDef = Reflect.getMetadata(ROUTE_DEF, target.constructor) || [];
    Reflect.defineMetadata(
      ROUTE_DEF,
      [
        ...routeDef,
        { method: "post", path, middlewares, fnName: name, guards },
      ],
      target.constructor,
    );
  };
}

export function Put(path: string = "", options?: HttpMethodOptions) {
  return (target: ICls, name: string) => {
    const { middlewares = [], guards = [] } = options;
    const routeDef = Reflect.getMetadata(ROUTE_DEF, target.constructor) || [];
    Reflect.defineMetadata(
      ROUTE_DEF,
      [...routeDef, { method: "put", path, middlewares, fnName: name, guards }],
      target.constructor,
    );
  };
}

export function Patch(path: string = "", options?: HttpMethodOptions) {
  return (target: ICls, name: string) => {
    const { middlewares = [], guards = [] } = options;
    const routeDef = Reflect.getMetadata(ROUTE_DEF, target.constructor) || [];
    Reflect.defineMetadata(
      ROUTE_DEF,
      [
        ...routeDef,
        { method: "patch", path, middlewares, fnName: name, guards },
      ],
      target.constructor,
    );
  };
}

export function Delete(path: string = "", options?: HttpMethodOptions) {
  return (target: ICls, name: string) => {
    const { middlewares = [], guards = [] } = options;
    const routeDef = Reflect.getMetadata(ROUTE_DEF, target.constructor) || [];
    Reflect.defineMetadata(
      ROUTE_DEF,
      [
        ...routeDef,
        { method: "delete", path, middlewares, fnName: name, guards },
      ],
      target.constructor,
    );
  };
}
