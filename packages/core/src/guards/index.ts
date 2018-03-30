import { Request } from "../interfaces";

export interface AbyssalGuards {
  isAuthorize(req: Request): boolean;
}
