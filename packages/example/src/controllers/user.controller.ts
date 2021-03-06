import { Controller, Get } from "@abyssaljs/core";
import { Request } from "express";
import { Response } from "express-serve-static-core";

import { UserGuard } from "./user.guard";
import { AdminGuard } from "./admin.guard";
import { UserService } from "../services/user.service";

@Controller({
  path: "/users",
  guards: [UserGuard],
})
export class UserController {
  constructor(private service: UserService) {}

  @Get("/", {
    guards: [AdminGuard],
  })
  public retrieve(req: Request, res: Response) {
    const isAdmin = this.service.isAdmin();
    return res.json({ isAdmin });
  }
}
