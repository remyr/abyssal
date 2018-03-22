import { AbyssalGuards } from "@abyssal/core";
import * as e from "express";

export class UserGuard implements AbyssalGuards {
  public isAuthorize(req: e.Request): boolean {
    return true;
  }
}
