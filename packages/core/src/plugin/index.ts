import { Server } from "../interfaces";

export interface AbyssalPlugin {
  init(app: Server): any;
}
