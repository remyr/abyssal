import { Controller, Get } from "@abyssal/core";
import { Request } from "express";
import { Response } from "express-serve-static-core";

import { UserGuard } from "./user.guard";
import { AdminGuard } from "./admin.guard";

@Controller({
  path: "/users",
  guards: [UserGuard],
})
export class UserController {
  @Get("/", {
    guards: [AdminGuard],
  })
  public retrieve(req: Request, res: Response) {
    const isAdmin = this.service.isAdmin();
    return res.json({ isAdmin });
  }
}
