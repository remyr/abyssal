import { Controller, Get } from "@abyssal/core";
import { Request } from "express";
import { Response } from "express-serve-static-core";

@Controller({
  path: "/users",
})
export class UserController {
  @Get("/")
  public retrieve(req: Request, res: Response) {
    return res.json({ users: true });
  }
}
