import { NextFunction, Request, Response } from "express";
import { ROUTES_PREFIX } from "../reflection-types";

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
    target[`${ROUTES_PREFIX}${name}`] = { method: "get", path, middlewares };
  };
}

export function Post(path: string = "", middlewares: Middleware[] = []) {
  return (target: ICls, name: string) => {
    target[`${ROUTES_PREFIX}${name}`] = { method: "post", path, middlewares };
  };
}

export function Put(path: string = "", middlewares: Middleware[] = []) {
  return (target: ICls, name: string) => {
    target[`${ROUTES_PREFIX}${name}`] = { method: "put", path, middlewares };
  };
}

export function Patch(path: string = "", middlewares: Middleware[] = []) {
  return (target: ICls, name: string) => {
    target[`${ROUTES_PREFIX}${name}`] = { method: "patch", path, middlewares };
  };
}

export function Delete(path: string = "", middlewares: Middleware[] = []) {
  return (target: ICls, name: string) => {
    target[`${ROUTES_PREFIX}${name}`] = { method: "delete", path, middlewares };
  };
}
