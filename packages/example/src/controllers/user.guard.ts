import { AbyssalGuards } from "@abyssaljs/core";
import * as e from "express";

export class UserGuard implements AbyssalGuards {
  public isAuthorize(req: e.Request): boolean {
    return true;
  }
}
