export type Config = {
  context: Record<string, unknown>;
  handlers: Record<string, {payload: unknown; pixiObj: unknown}>;
};

export type Context<Cfg extends Config> = Cfg['context'];

export type HandlerType<Cfg extends Config> = keyof Cfg['handlers'] & string;
export type DeclarativeObjPayload<
  Cfg extends Config,
  Type extends HandlerType<Cfg>
> = Cfg['handlers'][Type]['payload'];
export type PixiObject<
  Cfg extends Config,
  Type extends HandlerType<Cfg>
> = Cfg['handlers'][Type]['pixiObj'];
export type AnyPixiObject<Cfg extends Config> = PixiObject<
  Cfg,
  HandlerType<Cfg>
>;

export type DeclarativeObjectId = string;
export type DeclarativeObject<
  Cfg extends Config,
  HT extends HandlerType<Cfg>
> = {
  id: DeclarativeObjectId;
  type: HT;
  payload: DeclarativeObjPayload<Cfg, HT>;
};

export type AnyDeclarativeObj<Cfg extends Config> = DeclarativeObject<
  Cfg,
  HandlerType<Cfg>
>;

export type PixiContainerLike<Cfg extends Config> = {
  addChild(child: AnyPixiObject<Cfg>): unknown;
  removeChild(child: AnyPixiObject<Cfg>): unknown;
};

export interface Handler<Cfg extends Config, HT extends HandlerType<Cfg>> {
  createPixiObject(
    decObj: DeclarativeObject<Cfg, HT>,
    context: Context<Cfg>
  ): PixiObject<Cfg, HT>;

  shouldUpdate(
    newDecObj: DeclarativeObject<Cfg, HT>,
    oldDecObj: DeclarativeObject<Cfg, HT>,
    pixiObj: PixiObject<Cfg, HT>,
    context: Context<Cfg>
  ): boolean;

  update(
    decObj: DeclarativeObject<Cfg, HT>,
    pixiObj: PixiObject<Cfg, HT>,
    context: Context<Cfg>
  ): void;

  destroyed(
    decObj: DeclarativeObject<Cfg, HT>,
    pixiObj: PixiObject<Cfg, HT>,
    context: Context<Cfg>
  ): void;
}

export type Handlers<Cfg extends Config> = {
  [HT in HandlerType<Cfg>]: Handler<Cfg, HT>;
};

type ObjectState<Cfg extends Config, HT extends HandlerType<Cfg>> = Map<
  DeclarativeObjectId,
  {
    decObj: DeclarativeObject<Cfg, HT>;
    pixiObj: PixiObject<Cfg, HT>;
  }
>;
type ObjectsState<Cfg extends Config> = {
  [HT in HandlerType<Cfg>]: ObjectState<Cfg, HT>;
};

export class DeclarativePixi<Cfg extends Config> {
  private readonly handlerTypes: HandlerType<Cfg>[];
  private readonly state: ObjectsState<Cfg>;

  constructor(
    readonly container: PixiContainerLike<Cfg>,
    private readonly handlers: Handlers<Cfg>
  ) {
    this.handlerTypes = Object.keys(this.handlers) as HandlerType<Cfg>[];
    this.state = Object.fromEntries(
      this.handlerTypes.map(k => [k, new Map()])
    ) as ObjectsState<Cfg>;
  }

  update(decObjs: AnyDeclarativeObj<Cfg>[], context: Context<Cfg>): void {
    for (const ht of this.handlerTypes) {
      const handler = this.handlers[ht];
      const state = this.state[ht];
      const objects = decObjs.filter(obj => obj.type === ht);
      this.updateAt(objects, context, handler, state);
    }
  }

  private updateAt<HT extends HandlerType<Cfg>>(
    decObjs: DeclarativeObject<Cfg, HT>[],
    context: Context<Cfg>,
    handler: Handler<Cfg, HT>,
    state: ObjectState<Cfg, HT>
  ): void {
    const notUsed = new Set<DeclarativeObjectId>(state.keys());

    for (const decObj of decObjs) {
      notUsed.delete(decObj.id);
      const prevObj =
        state.get(decObj.id) ??
        this.createNewObj(decObj, context, handler, state);

      const shouldUpdate = handler.shouldUpdate(
        decObj,
        prevObj.decObj,
        prevObj.pixiObj,
        context
      );
      if (shouldUpdate) {
        handler.update(decObj, prevObj.pixiObj, context);
      }
    }

    for (const idNotUsed of notUsed.keys()) {
      const prevObj = state.get(idNotUsed);
      if (prevObj === undefined) continue;
      this.getPixiContainer().removeChild(prevObj.pixiObj);
      state.delete(idNotUsed);
      handler.destroyed(prevObj.decObj, prevObj.pixiObj, context);
    }
  }

  private createNewObj<HT extends HandlerType<Cfg>>(
    decObj: DeclarativeObject<Cfg, HT>,
    context: Context<Cfg>,
    handler: Handler<Cfg, HT>,
    state: ObjectState<Cfg, HT>
  ): {
    decObj: DeclarativeObject<Cfg, HT>;
    pixiObj: PixiObject<Cfg, HT>;
  } {
    const pixiObj = handler.createPixiObject(decObj, context);
    this.getPixiContainer().addChild(pixiObj);
    state.set(decObj.id, {decObj, pixiObj});
    return {decObj, pixiObj};
  }

  private getPixiContainer(): PixiContainerLike<Cfg> {
    return this.container;
  }
}
