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
} from "../reflection-types";

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

export class Application {
  constructor(options: ApplicationOptions = { port: 8000 }) {
    this.options = options;
    // Setup application
    this.app = express();
    this.registerAppMiddleware(this.app);
    // Get all controllers registred in application
    this.controllers =
      (Reflect.getMetadata(APP_CONTROLLERS, this) as any[]) || [];
    // Get all services registred in application
    this.services = (Reflect.getMetadata(APP_SERVICES, this) as any[]) || [];
    // Get all plugins registred in application
    this.plugins = (Reflect.getMetadata(APP_PLUGINS, this) as any[]) || [];
  }

  public start() {
    this.registerPlugins();
    this.registerControllers();
    this.app.listen(this.options.port, () =>
      /* tslint:disable-next-line */
      console.log(`> Server running on http://localhost:${this.options.port}`),
    );
  }

  public registerAppMiddleware(app: express.Express) {
    app.use(bodyParser.json());
  }

  private registerControllers(): void {
    this.controllers.forEach((controller: any) => {
      // Create a new router for this controller
      const router: express.Router & { [key: string]: any } = express.Router();

      // Get routes defined in controller
      const routes: IRouteDef[] = Reflect.getMetadata(
        CONTROLLER_ROUTES,
        controller,
      );

      // Inject service to controller
      const injector = ReflectiveInjector.resolveAndCreate([
        controller,
        ...this.services,
      ]);

      // Get instance of controller with service injected
      const injectedController = injector.get(controller);

      // Register each route to the router
      routes.forEach(({ method, url, fnName, middlewares }: IRouteDef) => {
        router[method](
          url,
          ...middlewares,
          (
            req: express.Request,
            res: express.Response,
            next: express.NextFunction,
          ) => {
            injectedController[fnName](req, res, next);
          },
        );
      });

      // Attach router to application
      this.app.use(router);
    });
  }

  private registerPlugins(): void {
    this.plugins.forEach((plugin: AbyssalPlugin) => {
      plugin.init(this.app);
    });
  }
}
