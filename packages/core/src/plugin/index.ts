import { Express } from "express";

export interface AbyssalPlugin {
  init(app: Express): any;
}
