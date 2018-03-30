// tslint:disable no-empty-interface
import * as e from "express";

export interface Server extends e.Express {}

export interface Request extends e.Request {}

export interface Response extends e.Response {}

export interface NextFunction extends e.NextFunction {}

export type Middleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => void;
