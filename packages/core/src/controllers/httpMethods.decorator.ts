import "reflect-metadata";
import { NextFunction, Request, Response } from "express";
import { ROUTE_DEF } from "../reflection-types";

export interface ICls extends Object {
  [key: string]: any;
}

export type Middleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => void;

export function Get(path: string = "", middlewares: Middleware[] = []) {
  return (target: ICls, name: string) => {
    const routeDef = Reflect.getMetadata(ROUTE_DEF, target.constructor) || [];
    Reflect.defineMetadata(
      ROUTE_DEF,
      [...routeDef, { method: "get", path, middlewares, fnName: name }],
      target.constructor,
    );
  };
}

export function Post(path: string = "", middlewares: Middleware[] = []) {
  return (target: ICls, name: string) => {
    const routeDef = Reflect.getMetadata(ROUTE_DEF, target.constructor) || [];
    Reflect.defineMetadata(
      ROUTE_DEF,
      [...routeDef, { method: "post", path, middlewares, fnName: name }],
      target.constructor,
    );
  };
}

export function Put(path: string = "", middlewares: Middleware[] = []) {
  return (target: ICls, name: string) => {
    const routeDef = Reflect.getMetadata(ROUTE_DEF, target.constructor) || [];
    Reflect.defineMetadata(
      ROUTE_DEF,
      [...routeDef, { method: "put", path, middlewares, fnName: name }],
      target.constructor,
    );
  };
}

export function Patch(path: string = "", middlewares: Middleware[] = []) {
  return (target: ICls, name: string) => {
    const routeDef = Reflect.getMetadata(ROUTE_DEF, target.constructor) || [];
    Reflect.defineMetadata(
      ROUTE_DEF,
      [...routeDef, { method: "patch", path, middlewares, fnName: name }],
      target.constructor,
    );
  };
}

export function Delete(path: string = "", middlewares: Middleware[] = []) {
  return (target: ICls, name: string) => {
    const routeDef = Reflect.getMetadata(ROUTE_DEF, target.constructor) || [];
    Reflect.defineMetadata(
      ROUTE_DEF,
      [...routeDef, { method: "delete", path, middlewares, fnName: name }],
      target.constructor,
    );
  };
}
