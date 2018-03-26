import { Request } from "express";

export interface AbyssalGuards {
  isAuthorize(req: Request): boolean;
}
