import { Controller, Get } from "@abyssal/core";
import { Request } from "express";
import { Response } from "express-serve-static-core";

import { UserService } from "../services/user.service";

@Controller({
  path: "/users",
})
export class UserController {
  constructor(private service: UserService) {}

  @Get("/")
  public retrieve(req: Request, res: Response) {
    const isAdmin = this.service.isAdmin();
    return res.json({ isAdmin });
  }
}
