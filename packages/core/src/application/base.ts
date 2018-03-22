import "reflect-metadata";
import * as express from "express";
import { Injectable, ReflectiveInjector } from "injection-js";
import * as bodyParser from "body-parser";

import { AbyssalPlugin } from "../plugin";
import { IRouteDef } from "../controllers";
import {
  APP_CONTROLLERS,
  APP_SERVICES,
  APP_PLUGINS,
  CONTROLLER_ROUTES,
  CONTROLLER_GUARDS,
} from "../reflection-types";
import { AbyssalGuards } from "../guards";

export interface ApplicationOptions {
  port: number;
}

export interface Application {
  app: express.Express;
  options: ApplicationOptions;
  controllers: any[];
  services: any[];
  plugins: any[];
}

const defaultApplicationOptions: ApplicationOptions = {
  port: parseInt(process.env.PORT, 10) || 8000,
};

export class Application {
  constructor(options: ApplicationOptions = defaultApplicationOptions) {
    this.options = options;
    // Setup application
    this.app = express();
    // Get all controllers registred in application
    this.controllers =
      (Reflect.getMetadata(APP_CONTROLLERS, this) as any[]) || [];
    // Get all services registred in application
    this.services = (Reflect.getMetadata(APP_SERVICES, this) as any[]) || [];
    // Get all plugins registred in application
    this.plugins = (Reflect.getMetadata(APP_PLUGINS, this) as any[]) || [];
  }

  public start() {
    this.registerMiddlewares(this.app);
    this.registerPlugins();
    this.registerControllers();
    this.app.listen(this.options.port, () =>
      /* tslint:disable-next-line */
      console.log(`> Server running on http://localhost:${this.options.port}`),
    );
  }

  public registerMiddlewares(app: express.Express) {
    app.use(bodyParser.json());
  }

  private registerControllers(): void {
    this.controllers.forEach((controller: any) => {
      // Create a new router for this controller
      const router: express.Router & { [key: string]: any } = express.Router();

      // Setup guard for router attached to a controller
      const guards = Reflect.getMetadata(CONTROLLER_GUARDS, controller);
      this.setupGuards(guards, router);

      // Get routes defined in controller
      const routes: IRouteDef[] = Reflect.getMetadata(
        CONTROLLER_ROUTES,
        controller,
      );
      // Instantiate controller & inject services
      const injectedController = this.instantiateController(controller);
      this.setupRoutes(routes, injectedController, router);

      // Attach router to application
      this.app.use(router);
    });
  }

  private validateGuard(guard: any): void {
    const isValidGuard = (guard as AbyssalGuards).isAuthorize !== undefined;
    if (!isValidGuard) {
      throw new Error(`Invalid guard`);
    }
  }

  private setupGuards(guards: any[], router: express.Router): void {
    const guardsMiddleware = guards.map(guard => {
      const inj = ReflectiveInjector.resolveAndCreate([
        guard,
        ...this.services,
      ]);
      const injectedGuard = inj.get(guard) as AbyssalGuards;

      this.validateGuard(injectedGuard);

      return (
        req: express.Request,
        res: express.Response,
        next: express.NextFunction,
      ) => {
        if (!injectedGuard.isAuthorize(req)) {
          return res.status(403).json({ error: "403 Forbidden" });
        }
        next();
      };
    });

    router.use(...guardsMiddleware);
  }

  private instantiateController(controller: any): void {
    const injector = ReflectiveInjector.resolveAndCreate([
      controller,
      ...this.services,
    ]);

    // Get instance of controller with service injected
    return injector.get(controller);
  }

  private setupRoutes(
    routes: IRouteDef[],
    controller: any,
    router: express.Router & { [key: string]: any },
  ): void {
    routes.forEach(({ method, url, fnName, middlewares }: IRouteDef) => {
      router[method](
        url,
        ...middlewares,
        (
          req: express.Request,
          res: express.Response,
          next: express.NextFunction,
        ) => {
          controller[fnName](req, res, next);
        },
      );
    });
  }

  private registerPlugins(): void {
    this.plugins.forEach((plugin: AbyssalPlugin) => {
      plugin.init(this.app);
    });
  }
}
