import "reflect-metadata";
import * as express from "express";
import { Injectable, ReflectiveInjector } from "injection-js";
import * as bodyParser from "body-parser";

import {
  APP_CONTROLLERS,
  APP_SERVICES,
  APP_PLUGINS,
  CONTROLLER_ROUTES,
  CONTROLLER_GUARDS,
} from "../reflection-types";
import { IRouteDef } from "../controllers";
import { AbyssalPlugin } from "../plugin";
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
      const injectedController = this.instantiateInjectable(controller);
      this.setupRoutes(routes, injectedController, router);

      // Attach router to application
      this.app.use(router);
    });
  }

  /**
   * Method to construct express middleware from an array of guards
   * The middleware test the return of isAuthorize function from guard
   * If return false, return a 403 Forbidden response
   * If return true, pass to the next middleware
   * @param {Array} guards Array of guards
   */
  private constructGuardsMiddlewares(guards: any[]) {
    return guards.map(guard => {
      const injectedGuard = this.instantiateInjectable<AbyssalGuards>(guard);
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
  }

  /**
   * Method to validate guard.
   * A guard must implement a isAuthorize function, if not, throw an Error
   * @param guard Guard to validate
   */
  private validateGuard(guard: any): void {
    const isValidGuard = (guard as AbyssalGuards).isAuthorize !== undefined;
    if (!isValidGuard) {
      throw new Error(`Invalid guard`);
    }
  }

  /**
   * Setup guard from controller to the router used by this controller
   * @param {Array} guards Array of guards
   * @param router An express router
   */
  private setupGuards(guards: any[], router: express.Router): void {
    const guardsMiddleware = this.constructGuardsMiddlewares(guards);
    if (guardsMiddleware.length > 0) {
      router.use(...guardsMiddleware);
    }
  }

  /**
   * Method to instantiate a class and inject services registred in the application
   * @param injectable Class to instantiate
   */
  private instantiateInjectable<T>(injectable: any): T {
    const injector = ReflectiveInjector.resolveAndCreate([
      injectable,
      ...this.services,
    ]);

    return injector.get(injectable) as T;
  }

  private setupRoutes(
    routes: IRouteDef[],
    controller: any,
    router: express.Router & { [key: string]: any },
  ): void {
    routes.forEach(
      ({ method, url, fnName, middlewares, guards }: IRouteDef) => {
        const guardsMiddlewares = this.constructGuardsMiddlewares(guards);

        router[method](
          url,
          ...guardsMiddlewares,
          ...middlewares,
          (
            req: express.Request,
            res: express.Response,
            next: express.NextFunction,
          ) => {
            controller[fnName](req, res, next);
          },
        );
      },
    );
  }

  private registerPlugins(): void {
    this.plugins.forEach((plugin: AbyssalPlugin) => {
      plugin.init(this.app);
    });
  }
}
