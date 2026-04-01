
/**
 * Client
**/

import * as runtime from './runtime/library.js';
import $Types = runtime.Types // general types
import $Public = runtime.Types.Public
import $Utils = runtime.Types.Utils
import $Extensions = runtime.Types.Extensions
import $Result = runtime.Types.Result

export type PrismaPromise<T> = $Public.PrismaPromise<T>


/**
 * Model User
 * 
 */
export type User = $Result.DefaultSelection<Prisma.$UserPayload>
/**
 * Model Follower
 * 
 */
export type Follower = $Result.DefaultSelection<Prisma.$FollowerPayload>
/**
 * Model Rating
 * 
 */
export type Rating = $Result.DefaultSelection<Prisma.$RatingPayload>
/**
 * Model Game
 * 
 */
export type Game = $Result.DefaultSelection<Prisma.$GamePayload>
/**
 * Model Tactic
 * 
 */
export type Tactic = $Result.DefaultSelection<Prisma.$TacticPayload>
/**
 * Model UserTactic
 * 
 */
export type UserTactic = $Result.DefaultSelection<Prisma.$UserTacticPayload>
/**
 * Model UserOpening
 * 
 */
export type UserOpening = $Result.DefaultSelection<Prisma.$UserOpeningPayload>

/**
 * ##  Prisma Client ʲˢ
 *
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient()
 * // Fetch zero or more Users
 * const users = await prisma.user.findMany()
 * ```
 *
 *
 * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
 */
export class PrismaClient<
  ClientOptions extends Prisma.PrismaClientOptions = Prisma.PrismaClientOptions,
  const U = 'log' extends keyof ClientOptions ? ClientOptions['log'] extends Array<Prisma.LogLevel | Prisma.LogDefinition> ? Prisma.GetEvents<ClientOptions['log']> : never : never,
  ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
> {
  [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['other'] }

    /**
   * ##  Prisma Client ʲˢ
   *
   * Type-safe database client for TypeScript & Node.js
   * @example
   * ```
   * const prisma = new PrismaClient()
   * // Fetch zero or more Users
   * const users = await prisma.user.findMany()
   * ```
   *
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
   */

  constructor(optionsArg ?: Prisma.Subset<ClientOptions, Prisma.PrismaClientOptions>);
  $on<V extends U>(eventType: V, callback: (event: V extends 'query' ? Prisma.QueryEvent : Prisma.LogEvent) => void): PrismaClient;

  /**
   * Connect with the database
   */
  $connect(): $Utils.JsPromise<void>;

  /**
   * Disconnect from the database
   */
  $disconnect(): $Utils.JsPromise<void>;

/**
   * Executes a prepared raw query and returns the number of affected rows.
   * @example
   * ```
   * const result = await prisma.$executeRaw`UPDATE User SET cool = ${true} WHERE email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Executes a raw query and returns the number of affected rows.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$executeRawUnsafe('UPDATE User SET cool = $1 WHERE email = $2 ;', true, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Performs a prepared raw query and returns the `SELECT` data.
   * @example
   * ```
   * const result = await prisma.$queryRaw`SELECT * FROM User WHERE id = ${1} OR email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<T>;

  /**
   * Performs a raw query and returns the `SELECT` data.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$queryRawUnsafe('SELECT * FROM User WHERE id = $1 OR email = $2;', 1, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<T>;


  /**
   * Allows the running of a sequence of read/write operations that are guaranteed to either succeed or fail as a whole.
   * @example
   * ```
   * const [george, bob, alice] = await prisma.$transaction([
   *   prisma.user.create({ data: { name: 'George' } }),
   *   prisma.user.create({ data: { name: 'Bob' } }),
   *   prisma.user.create({ data: { name: 'Alice' } }),
   * ])
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/concepts/components/prisma-client/transactions).
   */
  $transaction<P extends Prisma.PrismaPromise<any>[]>(arg: [...P], options?: { isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<runtime.Types.Utils.UnwrapTuple<P>>

  $transaction<R>(fn: (prisma: Omit<PrismaClient, runtime.ITXClientDenyList>) => $Utils.JsPromise<R>, options?: { maxWait?: number, timeout?: number, isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<R>


  $extends: $Extensions.ExtendsHook<"extends", Prisma.TypeMapCb<ClientOptions>, ExtArgs, $Utils.Call<Prisma.TypeMapCb<ClientOptions>, {
    extArgs: ExtArgs
  }>>

      /**
   * `prisma.user`: Exposes CRUD operations for the **User** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Users
    * const users = await prisma.user.findMany()
    * ```
    */
  get user(): Prisma.UserDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.follower`: Exposes CRUD operations for the **Follower** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Followers
    * const followers = await prisma.follower.findMany()
    * ```
    */
  get follower(): Prisma.FollowerDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.rating`: Exposes CRUD operations for the **Rating** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Ratings
    * const ratings = await prisma.rating.findMany()
    * ```
    */
  get rating(): Prisma.RatingDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.game`: Exposes CRUD operations for the **Game** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Games
    * const games = await prisma.game.findMany()
    * ```
    */
  get game(): Prisma.GameDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.tactic`: Exposes CRUD operations for the **Tactic** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Tactics
    * const tactics = await prisma.tactic.findMany()
    * ```
    */
  get tactic(): Prisma.TacticDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.userTactic`: Exposes CRUD operations for the **UserTactic** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more UserTactics
    * const userTactics = await prisma.userTactic.findMany()
    * ```
    */
  get userTactic(): Prisma.UserTacticDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.userOpening`: Exposes CRUD operations for the **UserOpening** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more UserOpenings
    * const userOpenings = await prisma.userOpening.findMany()
    * ```
    */
  get userOpening(): Prisma.UserOpeningDelegate<ExtArgs, ClientOptions>;
}

export namespace Prisma {
  export import DMMF = runtime.DMMF

  export type PrismaPromise<T> = $Public.PrismaPromise<T>

  /**
   * Validator
   */
  export import validator = runtime.Public.validator

  /**
   * Prisma Errors
   */
  export import PrismaClientKnownRequestError = runtime.PrismaClientKnownRequestError
  export import PrismaClientUnknownRequestError = runtime.PrismaClientUnknownRequestError
  export import PrismaClientRustPanicError = runtime.PrismaClientRustPanicError
  export import PrismaClientInitializationError = runtime.PrismaClientInitializationError
  export import PrismaClientValidationError = runtime.PrismaClientValidationError

  /**
   * Re-export of sql-template-tag
   */
  export import sql = runtime.sqltag
  export import empty = runtime.empty
  export import join = runtime.join
  export import raw = runtime.raw
  export import Sql = runtime.Sql



  /**
   * Decimal.js
   */
  export import Decimal = runtime.Decimal

  export type DecimalJsLike = runtime.DecimalJsLike

  /**
   * Metrics
   */
  export type Metrics = runtime.Metrics
  export type Metric<T> = runtime.Metric<T>
  export type MetricHistogram = runtime.MetricHistogram
  export type MetricHistogramBucket = runtime.MetricHistogramBucket

  /**
  * Extensions
  */
  export import Extension = $Extensions.UserArgs
  export import getExtensionContext = runtime.Extensions.getExtensionContext
  export import Args = $Public.Args
  export import Payload = $Public.Payload
  export import Result = $Public.Result
  export import Exact = $Public.Exact

  /**
   * Prisma Client JS version: 6.19.2
   * Query Engine version: c2990dca591cba766e3b7ef5d9e8a84796e47ab7
   */
  export type PrismaVersion = {
    client: string
  }

  export const prismaVersion: PrismaVersion

  /**
   * Utility Types
   */


  export import Bytes = runtime.Bytes
  export import JsonObject = runtime.JsonObject
  export import JsonArray = runtime.JsonArray
  export import JsonValue = runtime.JsonValue
  export import InputJsonObject = runtime.InputJsonObject
  export import InputJsonArray = runtime.InputJsonArray
  export import InputJsonValue = runtime.InputJsonValue

  /**
   * Types of the values used to represent different kinds of `null` values when working with JSON fields.
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  namespace NullTypes {
    /**
    * Type of `Prisma.DbNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.DbNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class DbNull {
      private DbNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.JsonNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.JsonNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class JsonNull {
      private JsonNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.AnyNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.AnyNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class AnyNull {
      private AnyNull: never
      private constructor()
    }
  }

  /**
   * Helper for filtering JSON entries that have `null` on the database (empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const DbNull: NullTypes.DbNull

  /**
   * Helper for filtering JSON entries that have JSON `null` values (not empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const JsonNull: NullTypes.JsonNull

  /**
   * Helper for filtering JSON entries that are `Prisma.DbNull` or `Prisma.JsonNull`
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const AnyNull: NullTypes.AnyNull

  type SelectAndInclude = {
    select: any
    include: any
  }

  type SelectAndOmit = {
    select: any
    omit: any
  }

  /**
   * Get the type of the value, that the Promise holds.
   */
  export type PromiseType<T extends PromiseLike<any>> = T extends PromiseLike<infer U> ? U : T;

  /**
   * Get the return type of a function which returns a Promise.
   */
  export type PromiseReturnType<T extends (...args: any) => $Utils.JsPromise<any>> = PromiseType<ReturnType<T>>

  /**
   * From T, pick a set of properties whose keys are in the union K
   */
  type Prisma__Pick<T, K extends keyof T> = {
      [P in K]: T[P];
  };


  export type Enumerable<T> = T | Array<T>;

  export type RequiredKeys<T> = {
    [K in keyof T]-?: {} extends Prisma__Pick<T, K> ? never : K
  }[keyof T]

  export type TruthyKeys<T> = keyof {
    [K in keyof T as T[K] extends false | undefined | null ? never : K]: K
  }

  export type TrueKeys<T> = TruthyKeys<Prisma__Pick<T, RequiredKeys<T>>>

  /**
   * Subset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection
   */
  export type Subset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
  };

  /**
   * SelectSubset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection.
   * Additionally, it validates, if both select and include are present. If the case, it errors.
   */
  export type SelectSubset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    (T extends SelectAndInclude
      ? 'Please either choose `select` or `include`.'
      : T extends SelectAndOmit
        ? 'Please either choose `select` or `omit`.'
        : {})

  /**
   * Subset + Intersection
   * @desc From `T` pick properties that exist in `U` and intersect `K`
   */
  export type SubsetIntersection<T, U, K> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    K

  type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };

  /**
   * XOR is needed to have a real mutually exclusive union type
   * https://stackoverflow.com/questions/42123407/does-typescript-support-mutually-exclusive-types
   */
  type XOR<T, U> =
    T extends object ?
    U extends object ?
      (Without<T, U> & U) | (Without<U, T> & T)
    : U : T


  /**
   * Is T a Record?
   */
  type IsObject<T extends any> = T extends Array<any>
  ? False
  : T extends Date
  ? False
  : T extends Uint8Array
  ? False
  : T extends BigInt
  ? False
  : T extends object
  ? True
  : False


  /**
   * If it's T[], return T
   */
  export type UnEnumerate<T extends unknown> = T extends Array<infer U> ? U : T

  /**
   * From ts-toolbelt
   */

  type __Either<O extends object, K extends Key> = Omit<O, K> &
    {
      // Merge all but K
      [P in K]: Prisma__Pick<O, P & keyof O> // With K possibilities
    }[K]

  type EitherStrict<O extends object, K extends Key> = Strict<__Either<O, K>>

  type EitherLoose<O extends object, K extends Key> = ComputeRaw<__Either<O, K>>

  type _Either<
    O extends object,
    K extends Key,
    strict extends Boolean
  > = {
    1: EitherStrict<O, K>
    0: EitherLoose<O, K>
  }[strict]

  type Either<
    O extends object,
    K extends Key,
    strict extends Boolean = 1
  > = O extends unknown ? _Either<O, K, strict> : never

  export type Union = any

  type PatchUndefined<O extends object, O1 extends object> = {
    [K in keyof O]: O[K] extends undefined ? At<O1, K> : O[K]
  } & {}

  /** Helper Types for "Merge" **/
  export type IntersectOf<U extends Union> = (
    U extends unknown ? (k: U) => void : never
  ) extends (k: infer I) => void
    ? I
    : never

  export type Overwrite<O extends object, O1 extends object> = {
      [K in keyof O]: K extends keyof O1 ? O1[K] : O[K];
  } & {};

  type _Merge<U extends object> = IntersectOf<Overwrite<U, {
      [K in keyof U]-?: At<U, K>;
  }>>;

  type Key = string | number | symbol;
  type AtBasic<O extends object, K extends Key> = K extends keyof O ? O[K] : never;
  type AtStrict<O extends object, K extends Key> = O[K & keyof O];
  type AtLoose<O extends object, K extends Key> = O extends unknown ? AtStrict<O, K> : never;
  export type At<O extends object, K extends Key, strict extends Boolean = 1> = {
      1: AtStrict<O, K>;
      0: AtLoose<O, K>;
  }[strict];

  export type ComputeRaw<A extends any> = A extends Function ? A : {
    [K in keyof A]: A[K];
  } & {};

  export type OptionalFlat<O> = {
    [K in keyof O]?: O[K];
  } & {};

  type _Record<K extends keyof any, T> = {
    [P in K]: T;
  };

  // cause typescript not to expand types and preserve names
  type NoExpand<T> = T extends unknown ? T : never;

  // this type assumes the passed object is entirely optional
  type AtLeast<O extends object, K extends string> = NoExpand<
    O extends unknown
    ? | (K extends keyof O ? { [P in K]: O[P] } & O : O)
      | {[P in keyof O as P extends K ? P : never]-?: O[P]} & O
    : never>;

  type _Strict<U, _U = U> = U extends unknown ? U & OptionalFlat<_Record<Exclude<Keys<_U>, keyof U>, never>> : never;

  export type Strict<U extends object> = ComputeRaw<_Strict<U>>;
  /** End Helper Types for "Merge" **/

  export type Merge<U extends object> = ComputeRaw<_Merge<Strict<U>>>;

  /**
  A [[Boolean]]
  */
  export type Boolean = True | False

  // /**
  // 1
  // */
  export type True = 1

  /**
  0
  */
  export type False = 0

  export type Not<B extends Boolean> = {
    0: 1
    1: 0
  }[B]

  export type Extends<A1 extends any, A2 extends any> = [A1] extends [never]
    ? 0 // anything `never` is false
    : A1 extends A2
    ? 1
    : 0

  export type Has<U extends Union, U1 extends Union> = Not<
    Extends<Exclude<U1, U>, U1>
  >

  export type Or<B1 extends Boolean, B2 extends Boolean> = {
    0: {
      0: 0
      1: 1
    }
    1: {
      0: 1
      1: 1
    }
  }[B1][B2]

  export type Keys<U extends Union> = U extends unknown ? keyof U : never

  type Cast<A, B> = A extends B ? A : B;

  export const type: unique symbol;



  /**
   * Used by group by
   */

  export type GetScalarType<T, O> = O extends object ? {
    [P in keyof T]: P extends keyof O
      ? O[P]
      : never
  } : never

  type FieldPaths<
    T,
    U = Omit<T, '_avg' | '_sum' | '_count' | '_min' | '_max'>
  > = IsObject<T> extends True ? U : T

  type GetHavingFields<T> = {
    [K in keyof T]: Or<
      Or<Extends<'OR', K>, Extends<'AND', K>>,
      Extends<'NOT', K>
    > extends True
      ? // infer is only needed to not hit TS limit
        // based on the brilliant idea of Pierre-Antoine Mills
        // https://github.com/microsoft/TypeScript/issues/30188#issuecomment-478938437
        T[K] extends infer TK
        ? GetHavingFields<UnEnumerate<TK> extends object ? Merge<UnEnumerate<TK>> : never>
        : never
      : {} extends FieldPaths<T[K]>
      ? never
      : K
  }[keyof T]

  /**
   * Convert tuple to union
   */
  type _TupleToUnion<T> = T extends (infer E)[] ? E : never
  type TupleToUnion<K extends readonly any[]> = _TupleToUnion<K>
  type MaybeTupleToUnion<T> = T extends any[] ? TupleToUnion<T> : T

  /**
   * Like `Pick`, but additionally can also accept an array of keys
   */
  type PickEnumerable<T, K extends Enumerable<keyof T> | keyof T> = Prisma__Pick<T, MaybeTupleToUnion<K>>

  /**
   * Exclude all keys with underscores
   */
  type ExcludeUnderscoreKeys<T extends string> = T extends `_${string}` ? never : T


  export type FieldRef<Model, FieldType> = runtime.FieldRef<Model, FieldType>

  type FieldRefInputType<Model, FieldType> = Model extends never ? never : FieldRef<Model, FieldType>


  export const ModelName: {
    User: 'User',
    Follower: 'Follower',
    Rating: 'Rating',
    Game: 'Game',
    Tactic: 'Tactic',
    UserTactic: 'UserTactic',
    UserOpening: 'UserOpening'
  };

  export type ModelName = (typeof ModelName)[keyof typeof ModelName]


  export type Datasources = {
    db?: Datasource
  }

  interface TypeMapCb<ClientOptions = {}> extends $Utils.Fn<{extArgs: $Extensions.InternalArgs }, $Utils.Record<string, any>> {
    returns: Prisma.TypeMap<this['params']['extArgs'], ClientOptions extends { omit: infer OmitOptions } ? OmitOptions : {}>
  }

  export type TypeMap<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> = {
    globalOmitOptions: {
      omit: GlobalOmitOptions
    }
    meta: {
      modelProps: "user" | "follower" | "rating" | "game" | "tactic" | "userTactic" | "userOpening"
      txIsolationLevel: Prisma.TransactionIsolationLevel
    }
    model: {
      User: {
        payload: Prisma.$UserPayload<ExtArgs>
        fields: Prisma.UserFieldRefs
        operations: {
          findUnique: {
            args: Prisma.UserFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.UserFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          findFirst: {
            args: Prisma.UserFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.UserFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          findMany: {
            args: Prisma.UserFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>[]
          }
          create: {
            args: Prisma.UserCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          createMany: {
            args: Prisma.UserCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.UserCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>[]
          }
          delete: {
            args: Prisma.UserDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          update: {
            args: Prisma.UserUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          deleteMany: {
            args: Prisma.UserDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.UserUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.UserUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>[]
          }
          upsert: {
            args: Prisma.UserUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          aggregate: {
            args: Prisma.UserAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateUser>
          }
          groupBy: {
            args: Prisma.UserGroupByArgs<ExtArgs>
            result: $Utils.Optional<UserGroupByOutputType>[]
          }
          count: {
            args: Prisma.UserCountArgs<ExtArgs>
            result: $Utils.Optional<UserCountAggregateOutputType> | number
          }
        }
      }
      Follower: {
        payload: Prisma.$FollowerPayload<ExtArgs>
        fields: Prisma.FollowerFieldRefs
        operations: {
          findUnique: {
            args: Prisma.FollowerFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FollowerPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.FollowerFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FollowerPayload>
          }
          findFirst: {
            args: Prisma.FollowerFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FollowerPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.FollowerFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FollowerPayload>
          }
          findMany: {
            args: Prisma.FollowerFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FollowerPayload>[]
          }
          create: {
            args: Prisma.FollowerCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FollowerPayload>
          }
          createMany: {
            args: Prisma.FollowerCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.FollowerCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FollowerPayload>[]
          }
          delete: {
            args: Prisma.FollowerDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FollowerPayload>
          }
          update: {
            args: Prisma.FollowerUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FollowerPayload>
          }
          deleteMany: {
            args: Prisma.FollowerDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.FollowerUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.FollowerUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FollowerPayload>[]
          }
          upsert: {
            args: Prisma.FollowerUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FollowerPayload>
          }
          aggregate: {
            args: Prisma.FollowerAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateFollower>
          }
          groupBy: {
            args: Prisma.FollowerGroupByArgs<ExtArgs>
            result: $Utils.Optional<FollowerGroupByOutputType>[]
          }
          count: {
            args: Prisma.FollowerCountArgs<ExtArgs>
            result: $Utils.Optional<FollowerCountAggregateOutputType> | number
          }
        }
      }
      Rating: {
        payload: Prisma.$RatingPayload<ExtArgs>
        fields: Prisma.RatingFieldRefs
        operations: {
          findUnique: {
            args: Prisma.RatingFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RatingPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.RatingFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RatingPayload>
          }
          findFirst: {
            args: Prisma.RatingFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RatingPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.RatingFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RatingPayload>
          }
          findMany: {
            args: Prisma.RatingFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RatingPayload>[]
          }
          create: {
            args: Prisma.RatingCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RatingPayload>
          }
          createMany: {
            args: Prisma.RatingCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.RatingCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RatingPayload>[]
          }
          delete: {
            args: Prisma.RatingDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RatingPayload>
          }
          update: {
            args: Prisma.RatingUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RatingPayload>
          }
          deleteMany: {
            args: Prisma.RatingDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.RatingUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.RatingUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RatingPayload>[]
          }
          upsert: {
            args: Prisma.RatingUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RatingPayload>
          }
          aggregate: {
            args: Prisma.RatingAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateRating>
          }
          groupBy: {
            args: Prisma.RatingGroupByArgs<ExtArgs>
            result: $Utils.Optional<RatingGroupByOutputType>[]
          }
          count: {
            args: Prisma.RatingCountArgs<ExtArgs>
            result: $Utils.Optional<RatingCountAggregateOutputType> | number
          }
        }
      }
      Game: {
        payload: Prisma.$GamePayload<ExtArgs>
        fields: Prisma.GameFieldRefs
        operations: {
          findUnique: {
            args: Prisma.GameFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GamePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.GameFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GamePayload>
          }
          findFirst: {
            args: Prisma.GameFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GamePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.GameFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GamePayload>
          }
          findMany: {
            args: Prisma.GameFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GamePayload>[]
          }
          create: {
            args: Prisma.GameCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GamePayload>
          }
          createMany: {
            args: Prisma.GameCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.GameCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GamePayload>[]
          }
          delete: {
            args: Prisma.GameDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GamePayload>
          }
          update: {
            args: Prisma.GameUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GamePayload>
          }
          deleteMany: {
            args: Prisma.GameDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.GameUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.GameUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GamePayload>[]
          }
          upsert: {
            args: Prisma.GameUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GamePayload>
          }
          aggregate: {
            args: Prisma.GameAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateGame>
          }
          groupBy: {
            args: Prisma.GameGroupByArgs<ExtArgs>
            result: $Utils.Optional<GameGroupByOutputType>[]
          }
          count: {
            args: Prisma.GameCountArgs<ExtArgs>
            result: $Utils.Optional<GameCountAggregateOutputType> | number
          }
        }
      }
      Tactic: {
        payload: Prisma.$TacticPayload<ExtArgs>
        fields: Prisma.TacticFieldRefs
        operations: {
          findUnique: {
            args: Prisma.TacticFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TacticPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.TacticFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TacticPayload>
          }
          findFirst: {
            args: Prisma.TacticFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TacticPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.TacticFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TacticPayload>
          }
          findMany: {
            args: Prisma.TacticFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TacticPayload>[]
          }
          create: {
            args: Prisma.TacticCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TacticPayload>
          }
          createMany: {
            args: Prisma.TacticCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.TacticCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TacticPayload>[]
          }
          delete: {
            args: Prisma.TacticDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TacticPayload>
          }
          update: {
            args: Prisma.TacticUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TacticPayload>
          }
          deleteMany: {
            args: Prisma.TacticDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.TacticUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.TacticUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TacticPayload>[]
          }
          upsert: {
            args: Prisma.TacticUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TacticPayload>
          }
          aggregate: {
            args: Prisma.TacticAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateTactic>
          }
          groupBy: {
            args: Prisma.TacticGroupByArgs<ExtArgs>
            result: $Utils.Optional<TacticGroupByOutputType>[]
          }
          count: {
            args: Prisma.TacticCountArgs<ExtArgs>
            result: $Utils.Optional<TacticCountAggregateOutputType> | number
          }
        }
      }
      UserTactic: {
        payload: Prisma.$UserTacticPayload<ExtArgs>
        fields: Prisma.UserTacticFieldRefs
        operations: {
          findUnique: {
            args: Prisma.UserTacticFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserTacticPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.UserTacticFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserTacticPayload>
          }
          findFirst: {
            args: Prisma.UserTacticFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserTacticPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.UserTacticFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserTacticPayload>
          }
          findMany: {
            args: Prisma.UserTacticFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserTacticPayload>[]
          }
          create: {
            args: Prisma.UserTacticCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserTacticPayload>
          }
          createMany: {
            args: Prisma.UserTacticCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.UserTacticCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserTacticPayload>[]
          }
          delete: {
            args: Prisma.UserTacticDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserTacticPayload>
          }
          update: {
            args: Prisma.UserTacticUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserTacticPayload>
          }
          deleteMany: {
            args: Prisma.UserTacticDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.UserTacticUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.UserTacticUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserTacticPayload>[]
          }
          upsert: {
            args: Prisma.UserTacticUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserTacticPayload>
          }
          aggregate: {
            args: Prisma.UserTacticAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateUserTactic>
          }
          groupBy: {
            args: Prisma.UserTacticGroupByArgs<ExtArgs>
            result: $Utils.Optional<UserTacticGroupByOutputType>[]
          }
          count: {
            args: Prisma.UserTacticCountArgs<ExtArgs>
            result: $Utils.Optional<UserTacticCountAggregateOutputType> | number
          }
        }
      }
      UserOpening: {
        payload: Prisma.$UserOpeningPayload<ExtArgs>
        fields: Prisma.UserOpeningFieldRefs
        operations: {
          findUnique: {
            args: Prisma.UserOpeningFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserOpeningPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.UserOpeningFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserOpeningPayload>
          }
          findFirst: {
            args: Prisma.UserOpeningFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserOpeningPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.UserOpeningFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserOpeningPayload>
          }
          findMany: {
            args: Prisma.UserOpeningFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserOpeningPayload>[]
          }
          create: {
            args: Prisma.UserOpeningCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserOpeningPayload>
          }
          createMany: {
            args: Prisma.UserOpeningCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.UserOpeningCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserOpeningPayload>[]
          }
          delete: {
            args: Prisma.UserOpeningDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserOpeningPayload>
          }
          update: {
            args: Prisma.UserOpeningUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserOpeningPayload>
          }
          deleteMany: {
            args: Prisma.UserOpeningDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.UserOpeningUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.UserOpeningUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserOpeningPayload>[]
          }
          upsert: {
            args: Prisma.UserOpeningUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserOpeningPayload>
          }
          aggregate: {
            args: Prisma.UserOpeningAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateUserOpening>
          }
          groupBy: {
            args: Prisma.UserOpeningGroupByArgs<ExtArgs>
            result: $Utils.Optional<UserOpeningGroupByOutputType>[]
          }
          count: {
            args: Prisma.UserOpeningCountArgs<ExtArgs>
            result: $Utils.Optional<UserOpeningCountAggregateOutputType> | number
          }
        }
      }
    }
  } & {
    other: {
      payload: any
      operations: {
        $executeRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $executeRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
        $queryRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $queryRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
      }
    }
  }
  export const defineExtension: $Extensions.ExtendsHook<"define", Prisma.TypeMapCb, $Extensions.DefaultArgs>
  export type DefaultPrismaClient = PrismaClient
  export type ErrorFormat = 'pretty' | 'colorless' | 'minimal'
  export interface PrismaClientOptions {
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasources?: Datasources
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasourceUrl?: string
    /**
     * @default "colorless"
     */
    errorFormat?: ErrorFormat
    /**
     * @example
     * ```
     * // Shorthand for `emit: 'stdout'`
     * log: ['query', 'info', 'warn', 'error']
     * 
     * // Emit as events only
     * log: [
     *   { emit: 'event', level: 'query' },
     *   { emit: 'event', level: 'info' },
     *   { emit: 'event', level: 'warn' }
     *   { emit: 'event', level: 'error' }
     * ]
     * 
     * / Emit as events and log to stdout
     * og: [
     *  { emit: 'stdout', level: 'query' },
     *  { emit: 'stdout', level: 'info' },
     *  { emit: 'stdout', level: 'warn' }
     *  { emit: 'stdout', level: 'error' }
     * 
     * ```
     * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/logging#the-log-option).
     */
    log?: (LogLevel | LogDefinition)[]
    /**
     * The default values for transactionOptions
     * maxWait ?= 2000
     * timeout ?= 5000
     */
    transactionOptions?: {
      maxWait?: number
      timeout?: number
      isolationLevel?: Prisma.TransactionIsolationLevel
    }
    /**
     * Instance of a Driver Adapter, e.g., like one provided by `@prisma/adapter-planetscale`
     */
    adapter?: runtime.SqlDriverAdapterFactory | null
    /**
     * Global configuration for omitting model fields by default.
     * 
     * @example
     * ```
     * const prisma = new PrismaClient({
     *   omit: {
     *     user: {
     *       password: true
     *     }
     *   }
     * })
     * ```
     */
    omit?: Prisma.GlobalOmitConfig
  }
  export type GlobalOmitConfig = {
    user?: UserOmit
    follower?: FollowerOmit
    rating?: RatingOmit
    game?: GameOmit
    tactic?: TacticOmit
    userTactic?: UserTacticOmit
    userOpening?: UserOpeningOmit
  }

  /* Types for Logging */
  export type LogLevel = 'info' | 'query' | 'warn' | 'error'
  export type LogDefinition = {
    level: LogLevel
    emit: 'stdout' | 'event'
  }

  export type CheckIsLogLevel<T> = T extends LogLevel ? T : never;

  export type GetLogType<T> = CheckIsLogLevel<
    T extends LogDefinition ? T['level'] : T
  >;

  export type GetEvents<T extends any[]> = T extends Array<LogLevel | LogDefinition>
    ? GetLogType<T[number]>
    : never;

  export type QueryEvent = {
    timestamp: Date
    query: string
    params: string
    duration: number
    target: string
  }

  export type LogEvent = {
    timestamp: Date
    message: string
    target: string
  }
  /* End Types for Logging */


  export type PrismaAction =
    | 'findUnique'
    | 'findUniqueOrThrow'
    | 'findMany'
    | 'findFirst'
    | 'findFirstOrThrow'
    | 'create'
    | 'createMany'
    | 'createManyAndReturn'
    | 'update'
    | 'updateMany'
    | 'updateManyAndReturn'
    | 'upsert'
    | 'delete'
    | 'deleteMany'
    | 'executeRaw'
    | 'queryRaw'
    | 'aggregate'
    | 'count'
    | 'runCommandRaw'
    | 'findRaw'
    | 'groupBy'

  // tested in getLogLevel.test.ts
  export function getLogLevel(log: Array<LogLevel | LogDefinition>): LogLevel | undefined;

  /**
   * `PrismaClient` proxy available in interactive transactions.
   */
  export type TransactionClient = Omit<Prisma.DefaultPrismaClient, runtime.ITXClientDenyList>

  export type Datasource = {
    url?: string
  }

  /**
   * Count Types
   */


  /**
   * Count Type UserCountOutputType
   */

  export type UserCountOutputType = {
    followers: number
    following: number
    ratings: number
    whiteGames: number
    blackGames: number
    tactics: number
    openings: number
  }

  export type UserCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    followers?: boolean | UserCountOutputTypeCountFollowersArgs
    following?: boolean | UserCountOutputTypeCountFollowingArgs
    ratings?: boolean | UserCountOutputTypeCountRatingsArgs
    whiteGames?: boolean | UserCountOutputTypeCountWhiteGamesArgs
    blackGames?: boolean | UserCountOutputTypeCountBlackGamesArgs
    tactics?: boolean | UserCountOutputTypeCountTacticsArgs
    openings?: boolean | UserCountOutputTypeCountOpeningsArgs
  }

  // Custom InputTypes
  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserCountOutputType
     */
    select?: UserCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountFollowersArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: FollowerWhereInput
  }

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountFollowingArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: FollowerWhereInput
  }

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountRatingsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: RatingWhereInput
  }

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountWhiteGamesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: GameWhereInput
  }

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountBlackGamesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: GameWhereInput
  }

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountTacticsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: UserTacticWhereInput
  }

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountOpeningsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: UserOpeningWhereInput
  }


  /**
   * Count Type TacticCountOutputType
   */

  export type TacticCountOutputType = {
    userTactic: number
  }

  export type TacticCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    userTactic?: boolean | TacticCountOutputTypeCountUserTacticArgs
  }

  // Custom InputTypes
  /**
   * TacticCountOutputType without action
   */
  export type TacticCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TacticCountOutputType
     */
    select?: TacticCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * TacticCountOutputType without action
   */
  export type TacticCountOutputTypeCountUserTacticArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: UserTacticWhereInput
  }


  /**
   * Models
   */

  /**
   * Model User
   */

  export type AggregateUser = {
    _count: UserCountAggregateOutputType | null
    _min: UserMinAggregateOutputType | null
    _max: UserMaxAggregateOutputType | null
  }

  export type UserMinAggregateOutputType = {
    id: string | null
    email: string | null
    name: string | null
    bio: string | null
  }

  export type UserMaxAggregateOutputType = {
    id: string | null
    email: string | null
    name: string | null
    bio: string | null
  }

  export type UserCountAggregateOutputType = {
    id: number
    email: number
    name: number
    bio: number
    _all: number
  }


  export type UserMinAggregateInputType = {
    id?: true
    email?: true
    name?: true
    bio?: true
  }

  export type UserMaxAggregateInputType = {
    id?: true
    email?: true
    name?: true
    bio?: true
  }

  export type UserCountAggregateInputType = {
    id?: true
    email?: true
    name?: true
    bio?: true
    _all?: true
  }

  export type UserAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which User to aggregate.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Users
    **/
    _count?: true | UserCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: UserMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: UserMaxAggregateInputType
  }

  export type GetUserAggregateType<T extends UserAggregateArgs> = {
        [P in keyof T & keyof AggregateUser]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateUser[P]>
      : GetScalarType<T[P], AggregateUser[P]>
  }




  export type UserGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: UserWhereInput
    orderBy?: UserOrderByWithAggregationInput | UserOrderByWithAggregationInput[]
    by: UserScalarFieldEnum[] | UserScalarFieldEnum
    having?: UserScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: UserCountAggregateInputType | true
    _min?: UserMinAggregateInputType
    _max?: UserMaxAggregateInputType
  }

  export type UserGroupByOutputType = {
    id: string
    email: string
    name: string | null
    bio: string | null
    _count: UserCountAggregateOutputType | null
    _min: UserMinAggregateOutputType | null
    _max: UserMaxAggregateOutputType | null
  }

  type GetUserGroupByPayload<T extends UserGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<UserGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof UserGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], UserGroupByOutputType[P]>
            : GetScalarType<T[P], UserGroupByOutputType[P]>
        }
      >
    >


  export type UserSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    email?: boolean
    name?: boolean
    bio?: boolean
    followers?: boolean | User$followersArgs<ExtArgs>
    following?: boolean | User$followingArgs<ExtArgs>
    ratings?: boolean | User$ratingsArgs<ExtArgs>
    whiteGames?: boolean | User$whiteGamesArgs<ExtArgs>
    blackGames?: boolean | User$blackGamesArgs<ExtArgs>
    tactics?: boolean | User$tacticsArgs<ExtArgs>
    openings?: boolean | User$openingsArgs<ExtArgs>
    _count?: boolean | UserCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["user"]>

  export type UserSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    email?: boolean
    name?: boolean
    bio?: boolean
  }, ExtArgs["result"]["user"]>

  export type UserSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    email?: boolean
    name?: boolean
    bio?: boolean
  }, ExtArgs["result"]["user"]>

  export type UserSelectScalar = {
    id?: boolean
    email?: boolean
    name?: boolean
    bio?: boolean
  }

  export type UserOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "email" | "name" | "bio", ExtArgs["result"]["user"]>
  export type UserInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    followers?: boolean | User$followersArgs<ExtArgs>
    following?: boolean | User$followingArgs<ExtArgs>
    ratings?: boolean | User$ratingsArgs<ExtArgs>
    whiteGames?: boolean | User$whiteGamesArgs<ExtArgs>
    blackGames?: boolean | User$blackGamesArgs<ExtArgs>
    tactics?: boolean | User$tacticsArgs<ExtArgs>
    openings?: boolean | User$openingsArgs<ExtArgs>
    _count?: boolean | UserCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type UserIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}
  export type UserIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $UserPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "User"
    objects: {
      followers: Prisma.$FollowerPayload<ExtArgs>[]
      following: Prisma.$FollowerPayload<ExtArgs>[]
      ratings: Prisma.$RatingPayload<ExtArgs>[]
      whiteGames: Prisma.$GamePayload<ExtArgs>[]
      blackGames: Prisma.$GamePayload<ExtArgs>[]
      tactics: Prisma.$UserTacticPayload<ExtArgs>[]
      openings: Prisma.$UserOpeningPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      email: string
      name: string | null
      bio: string | null
    }, ExtArgs["result"]["user"]>
    composites: {}
  }

  type UserGetPayload<S extends boolean | null | undefined | UserDefaultArgs> = $Result.GetResult<Prisma.$UserPayload, S>

  type UserCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<UserFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: UserCountAggregateInputType | true
    }

  export interface UserDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['User'], meta: { name: 'User' } }
    /**
     * Find zero or one User that matches the filter.
     * @param {UserFindUniqueArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends UserFindUniqueArgs>(args: SelectSubset<T, UserFindUniqueArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one User that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {UserFindUniqueOrThrowArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends UserFindUniqueOrThrowArgs>(args: SelectSubset<T, UserFindUniqueOrThrowArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first User that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindFirstArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends UserFindFirstArgs>(args?: SelectSubset<T, UserFindFirstArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first User that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindFirstOrThrowArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends UserFindFirstOrThrowArgs>(args?: SelectSubset<T, UserFindFirstOrThrowArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Users that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Users
     * const users = await prisma.user.findMany()
     * 
     * // Get first 10 Users
     * const users = await prisma.user.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const userWithIdOnly = await prisma.user.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends UserFindManyArgs>(args?: SelectSubset<T, UserFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a User.
     * @param {UserCreateArgs} args - Arguments to create a User.
     * @example
     * // Create one User
     * const User = await prisma.user.create({
     *   data: {
     *     // ... data to create a User
     *   }
     * })
     * 
     */
    create<T extends UserCreateArgs>(args: SelectSubset<T, UserCreateArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Users.
     * @param {UserCreateManyArgs} args - Arguments to create many Users.
     * @example
     * // Create many Users
     * const user = await prisma.user.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends UserCreateManyArgs>(args?: SelectSubset<T, UserCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Users and returns the data saved in the database.
     * @param {UserCreateManyAndReturnArgs} args - Arguments to create many Users.
     * @example
     * // Create many Users
     * const user = await prisma.user.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Users and only return the `id`
     * const userWithIdOnly = await prisma.user.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends UserCreateManyAndReturnArgs>(args?: SelectSubset<T, UserCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a User.
     * @param {UserDeleteArgs} args - Arguments to delete one User.
     * @example
     * // Delete one User
     * const User = await prisma.user.delete({
     *   where: {
     *     // ... filter to delete one User
     *   }
     * })
     * 
     */
    delete<T extends UserDeleteArgs>(args: SelectSubset<T, UserDeleteArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one User.
     * @param {UserUpdateArgs} args - Arguments to update one User.
     * @example
     * // Update one User
     * const user = await prisma.user.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends UserUpdateArgs>(args: SelectSubset<T, UserUpdateArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Users.
     * @param {UserDeleteManyArgs} args - Arguments to filter Users to delete.
     * @example
     * // Delete a few Users
     * const { count } = await prisma.user.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends UserDeleteManyArgs>(args?: SelectSubset<T, UserDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Users.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Users
     * const user = await prisma.user.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends UserUpdateManyArgs>(args: SelectSubset<T, UserUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Users and returns the data updated in the database.
     * @param {UserUpdateManyAndReturnArgs} args - Arguments to update many Users.
     * @example
     * // Update many Users
     * const user = await prisma.user.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Users and only return the `id`
     * const userWithIdOnly = await prisma.user.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends UserUpdateManyAndReturnArgs>(args: SelectSubset<T, UserUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one User.
     * @param {UserUpsertArgs} args - Arguments to update or create a User.
     * @example
     * // Update or create a User
     * const user = await prisma.user.upsert({
     *   create: {
     *     // ... data to create a User
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the User we want to update
     *   }
     * })
     */
    upsert<T extends UserUpsertArgs>(args: SelectSubset<T, UserUpsertArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Users.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserCountArgs} args - Arguments to filter Users to count.
     * @example
     * // Count the number of Users
     * const count = await prisma.user.count({
     *   where: {
     *     // ... the filter for the Users we want to count
     *   }
     * })
    **/
    count<T extends UserCountArgs>(
      args?: Subset<T, UserCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], UserCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a User.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends UserAggregateArgs>(args: Subset<T, UserAggregateArgs>): Prisma.PrismaPromise<GetUserAggregateType<T>>

    /**
     * Group by User.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends UserGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: UserGroupByArgs['orderBy'] }
        : { orderBy?: UserGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, UserGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetUserGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the User model
   */
  readonly fields: UserFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for User.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__UserClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    followers<T extends User$followersArgs<ExtArgs> = {}>(args?: Subset<T, User$followersArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$FollowerPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    following<T extends User$followingArgs<ExtArgs> = {}>(args?: Subset<T, User$followingArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$FollowerPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    ratings<T extends User$ratingsArgs<ExtArgs> = {}>(args?: Subset<T, User$ratingsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$RatingPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    whiteGames<T extends User$whiteGamesArgs<ExtArgs> = {}>(args?: Subset<T, User$whiteGamesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$GamePayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    blackGames<T extends User$blackGamesArgs<ExtArgs> = {}>(args?: Subset<T, User$blackGamesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$GamePayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    tactics<T extends User$tacticsArgs<ExtArgs> = {}>(args?: Subset<T, User$tacticsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserTacticPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    openings<T extends User$openingsArgs<ExtArgs> = {}>(args?: Subset<T, User$openingsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserOpeningPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the User model
   */
  interface UserFieldRefs {
    readonly id: FieldRef<"User", 'String'>
    readonly email: FieldRef<"User", 'String'>
    readonly name: FieldRef<"User", 'String'>
    readonly bio: FieldRef<"User", 'String'>
  }
    

  // Custom InputTypes
  /**
   * User findUnique
   */
  export type UserFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User findUniqueOrThrow
   */
  export type UserFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User findFirst
   */
  export type UserFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Users.
     */
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * User findFirstOrThrow
   */
  export type UserFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Users.
     */
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * User findMany
   */
  export type UserFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which Users to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * User create
   */
  export type UserCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * The data needed to create a User.
     */
    data: XOR<UserCreateInput, UserUncheckedCreateInput>
  }

  /**
   * User createMany
   */
  export type UserCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Users.
     */
    data: UserCreateManyInput | UserCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * User createManyAndReturn
   */
  export type UserCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * The data used to create many Users.
     */
    data: UserCreateManyInput | UserCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * User update
   */
  export type UserUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * The data needed to update a User.
     */
    data: XOR<UserUpdateInput, UserUncheckedUpdateInput>
    /**
     * Choose, which User to update.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User updateMany
   */
  export type UserUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Users.
     */
    data: XOR<UserUpdateManyMutationInput, UserUncheckedUpdateManyInput>
    /**
     * Filter which Users to update
     */
    where?: UserWhereInput
    /**
     * Limit how many Users to update.
     */
    limit?: number
  }

  /**
   * User updateManyAndReturn
   */
  export type UserUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * The data used to update Users.
     */
    data: XOR<UserUpdateManyMutationInput, UserUncheckedUpdateManyInput>
    /**
     * Filter which Users to update
     */
    where?: UserWhereInput
    /**
     * Limit how many Users to update.
     */
    limit?: number
  }

  /**
   * User upsert
   */
  export type UserUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * The filter to search for the User to update in case it exists.
     */
    where: UserWhereUniqueInput
    /**
     * In case the User found by the `where` argument doesn't exist, create a new User with this data.
     */
    create: XOR<UserCreateInput, UserUncheckedCreateInput>
    /**
     * In case the User was found with the provided `where` argument, update it with this data.
     */
    update: XOR<UserUpdateInput, UserUncheckedUpdateInput>
  }

  /**
   * User delete
   */
  export type UserDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter which User to delete.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User deleteMany
   */
  export type UserDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Users to delete
     */
    where?: UserWhereInput
    /**
     * Limit how many Users to delete.
     */
    limit?: number
  }

  /**
   * User.followers
   */
  export type User$followersArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Follower
     */
    select?: FollowerSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Follower
     */
    omit?: FollowerOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FollowerInclude<ExtArgs> | null
    where?: FollowerWhereInput
    orderBy?: FollowerOrderByWithRelationInput | FollowerOrderByWithRelationInput[]
    cursor?: FollowerWhereUniqueInput
    take?: number
    skip?: number
    distinct?: FollowerScalarFieldEnum | FollowerScalarFieldEnum[]
  }

  /**
   * User.following
   */
  export type User$followingArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Follower
     */
    select?: FollowerSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Follower
     */
    omit?: FollowerOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FollowerInclude<ExtArgs> | null
    where?: FollowerWhereInput
    orderBy?: FollowerOrderByWithRelationInput | FollowerOrderByWithRelationInput[]
    cursor?: FollowerWhereUniqueInput
    take?: number
    skip?: number
    distinct?: FollowerScalarFieldEnum | FollowerScalarFieldEnum[]
  }

  /**
   * User.ratings
   */
  export type User$ratingsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Rating
     */
    select?: RatingSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Rating
     */
    omit?: RatingOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RatingInclude<ExtArgs> | null
    where?: RatingWhereInput
    orderBy?: RatingOrderByWithRelationInput | RatingOrderByWithRelationInput[]
    cursor?: RatingWhereUniqueInput
    take?: number
    skip?: number
    distinct?: RatingScalarFieldEnum | RatingScalarFieldEnum[]
  }

  /**
   * User.whiteGames
   */
  export type User$whiteGamesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Game
     */
    select?: GameSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Game
     */
    omit?: GameOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GameInclude<ExtArgs> | null
    where?: GameWhereInput
    orderBy?: GameOrderByWithRelationInput | GameOrderByWithRelationInput[]
    cursor?: GameWhereUniqueInput
    take?: number
    skip?: number
    distinct?: GameScalarFieldEnum | GameScalarFieldEnum[]
  }

  /**
   * User.blackGames
   */
  export type User$blackGamesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Game
     */
    select?: GameSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Game
     */
    omit?: GameOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GameInclude<ExtArgs> | null
    where?: GameWhereInput
    orderBy?: GameOrderByWithRelationInput | GameOrderByWithRelationInput[]
    cursor?: GameWhereUniqueInput
    take?: number
    skip?: number
    distinct?: GameScalarFieldEnum | GameScalarFieldEnum[]
  }

  /**
   * User.tactics
   */
  export type User$tacticsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserTactic
     */
    select?: UserTacticSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserTactic
     */
    omit?: UserTacticOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserTacticInclude<ExtArgs> | null
    where?: UserTacticWhereInput
    orderBy?: UserTacticOrderByWithRelationInput | UserTacticOrderByWithRelationInput[]
    cursor?: UserTacticWhereUniqueInput
    take?: number
    skip?: number
    distinct?: UserTacticScalarFieldEnum | UserTacticScalarFieldEnum[]
  }

  /**
   * User.openings
   */
  export type User$openingsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserOpening
     */
    select?: UserOpeningSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserOpening
     */
    omit?: UserOpeningOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserOpeningInclude<ExtArgs> | null
    where?: UserOpeningWhereInput
    orderBy?: UserOpeningOrderByWithRelationInput | UserOpeningOrderByWithRelationInput[]
    cursor?: UserOpeningWhereUniqueInput
    take?: number
    skip?: number
    distinct?: UserOpeningScalarFieldEnum | UserOpeningScalarFieldEnum[]
  }

  /**
   * User without action
   */
  export type UserDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
  }


  /**
   * Model Follower
   */

  export type AggregateFollower = {
    _count: FollowerCountAggregateOutputType | null
    _min: FollowerMinAggregateOutputType | null
    _max: FollowerMaxAggregateOutputType | null
  }

  export type FollowerMinAggregateOutputType = {
    id: string | null
    followerId: string | null
    followingId: string | null
  }

  export type FollowerMaxAggregateOutputType = {
    id: string | null
    followerId: string | null
    followingId: string | null
  }

  export type FollowerCountAggregateOutputType = {
    id: number
    followerId: number
    followingId: number
    _all: number
  }


  export type FollowerMinAggregateInputType = {
    id?: true
    followerId?: true
    followingId?: true
  }

  export type FollowerMaxAggregateInputType = {
    id?: true
    followerId?: true
    followingId?: true
  }

  export type FollowerCountAggregateInputType = {
    id?: true
    followerId?: true
    followingId?: true
    _all?: true
  }

  export type FollowerAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Follower to aggregate.
     */
    where?: FollowerWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Followers to fetch.
     */
    orderBy?: FollowerOrderByWithRelationInput | FollowerOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: FollowerWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Followers from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Followers.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Followers
    **/
    _count?: true | FollowerCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: FollowerMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: FollowerMaxAggregateInputType
  }

  export type GetFollowerAggregateType<T extends FollowerAggregateArgs> = {
        [P in keyof T & keyof AggregateFollower]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateFollower[P]>
      : GetScalarType<T[P], AggregateFollower[P]>
  }




  export type FollowerGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: FollowerWhereInput
    orderBy?: FollowerOrderByWithAggregationInput | FollowerOrderByWithAggregationInput[]
    by: FollowerScalarFieldEnum[] | FollowerScalarFieldEnum
    having?: FollowerScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: FollowerCountAggregateInputType | true
    _min?: FollowerMinAggregateInputType
    _max?: FollowerMaxAggregateInputType
  }

  export type FollowerGroupByOutputType = {
    id: string
    followerId: string
    followingId: string
    _count: FollowerCountAggregateOutputType | null
    _min: FollowerMinAggregateOutputType | null
    _max: FollowerMaxAggregateOutputType | null
  }

  type GetFollowerGroupByPayload<T extends FollowerGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<FollowerGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof FollowerGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], FollowerGroupByOutputType[P]>
            : GetScalarType<T[P], FollowerGroupByOutputType[P]>
        }
      >
    >


  export type FollowerSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    followerId?: boolean
    followingId?: boolean
    follower?: boolean | UserDefaultArgs<ExtArgs>
    following?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["follower"]>

  export type FollowerSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    followerId?: boolean
    followingId?: boolean
    follower?: boolean | UserDefaultArgs<ExtArgs>
    following?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["follower"]>

  export type FollowerSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    followerId?: boolean
    followingId?: boolean
    follower?: boolean | UserDefaultArgs<ExtArgs>
    following?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["follower"]>

  export type FollowerSelectScalar = {
    id?: boolean
    followerId?: boolean
    followingId?: boolean
  }

  export type FollowerOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "followerId" | "followingId", ExtArgs["result"]["follower"]>
  export type FollowerInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    follower?: boolean | UserDefaultArgs<ExtArgs>
    following?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type FollowerIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    follower?: boolean | UserDefaultArgs<ExtArgs>
    following?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type FollowerIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    follower?: boolean | UserDefaultArgs<ExtArgs>
    following?: boolean | UserDefaultArgs<ExtArgs>
  }

  export type $FollowerPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Follower"
    objects: {
      follower: Prisma.$UserPayload<ExtArgs>
      following: Prisma.$UserPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      followerId: string
      followingId: string
    }, ExtArgs["result"]["follower"]>
    composites: {}
  }

  type FollowerGetPayload<S extends boolean | null | undefined | FollowerDefaultArgs> = $Result.GetResult<Prisma.$FollowerPayload, S>

  type FollowerCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<FollowerFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: FollowerCountAggregateInputType | true
    }

  export interface FollowerDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Follower'], meta: { name: 'Follower' } }
    /**
     * Find zero or one Follower that matches the filter.
     * @param {FollowerFindUniqueArgs} args - Arguments to find a Follower
     * @example
     * // Get one Follower
     * const follower = await prisma.follower.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends FollowerFindUniqueArgs>(args: SelectSubset<T, FollowerFindUniqueArgs<ExtArgs>>): Prisma__FollowerClient<$Result.GetResult<Prisma.$FollowerPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Follower that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {FollowerFindUniqueOrThrowArgs} args - Arguments to find a Follower
     * @example
     * // Get one Follower
     * const follower = await prisma.follower.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends FollowerFindUniqueOrThrowArgs>(args: SelectSubset<T, FollowerFindUniqueOrThrowArgs<ExtArgs>>): Prisma__FollowerClient<$Result.GetResult<Prisma.$FollowerPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Follower that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FollowerFindFirstArgs} args - Arguments to find a Follower
     * @example
     * // Get one Follower
     * const follower = await prisma.follower.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends FollowerFindFirstArgs>(args?: SelectSubset<T, FollowerFindFirstArgs<ExtArgs>>): Prisma__FollowerClient<$Result.GetResult<Prisma.$FollowerPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Follower that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FollowerFindFirstOrThrowArgs} args - Arguments to find a Follower
     * @example
     * // Get one Follower
     * const follower = await prisma.follower.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends FollowerFindFirstOrThrowArgs>(args?: SelectSubset<T, FollowerFindFirstOrThrowArgs<ExtArgs>>): Prisma__FollowerClient<$Result.GetResult<Prisma.$FollowerPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Followers that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FollowerFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Followers
     * const followers = await prisma.follower.findMany()
     * 
     * // Get first 10 Followers
     * const followers = await prisma.follower.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const followerWithIdOnly = await prisma.follower.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends FollowerFindManyArgs>(args?: SelectSubset<T, FollowerFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$FollowerPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Follower.
     * @param {FollowerCreateArgs} args - Arguments to create a Follower.
     * @example
     * // Create one Follower
     * const Follower = await prisma.follower.create({
     *   data: {
     *     // ... data to create a Follower
     *   }
     * })
     * 
     */
    create<T extends FollowerCreateArgs>(args: SelectSubset<T, FollowerCreateArgs<ExtArgs>>): Prisma__FollowerClient<$Result.GetResult<Prisma.$FollowerPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Followers.
     * @param {FollowerCreateManyArgs} args - Arguments to create many Followers.
     * @example
     * // Create many Followers
     * const follower = await prisma.follower.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends FollowerCreateManyArgs>(args?: SelectSubset<T, FollowerCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Followers and returns the data saved in the database.
     * @param {FollowerCreateManyAndReturnArgs} args - Arguments to create many Followers.
     * @example
     * // Create many Followers
     * const follower = await prisma.follower.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Followers and only return the `id`
     * const followerWithIdOnly = await prisma.follower.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends FollowerCreateManyAndReturnArgs>(args?: SelectSubset<T, FollowerCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$FollowerPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Follower.
     * @param {FollowerDeleteArgs} args - Arguments to delete one Follower.
     * @example
     * // Delete one Follower
     * const Follower = await prisma.follower.delete({
     *   where: {
     *     // ... filter to delete one Follower
     *   }
     * })
     * 
     */
    delete<T extends FollowerDeleteArgs>(args: SelectSubset<T, FollowerDeleteArgs<ExtArgs>>): Prisma__FollowerClient<$Result.GetResult<Prisma.$FollowerPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Follower.
     * @param {FollowerUpdateArgs} args - Arguments to update one Follower.
     * @example
     * // Update one Follower
     * const follower = await prisma.follower.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends FollowerUpdateArgs>(args: SelectSubset<T, FollowerUpdateArgs<ExtArgs>>): Prisma__FollowerClient<$Result.GetResult<Prisma.$FollowerPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Followers.
     * @param {FollowerDeleteManyArgs} args - Arguments to filter Followers to delete.
     * @example
     * // Delete a few Followers
     * const { count } = await prisma.follower.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends FollowerDeleteManyArgs>(args?: SelectSubset<T, FollowerDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Followers.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FollowerUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Followers
     * const follower = await prisma.follower.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends FollowerUpdateManyArgs>(args: SelectSubset<T, FollowerUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Followers and returns the data updated in the database.
     * @param {FollowerUpdateManyAndReturnArgs} args - Arguments to update many Followers.
     * @example
     * // Update many Followers
     * const follower = await prisma.follower.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Followers and only return the `id`
     * const followerWithIdOnly = await prisma.follower.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends FollowerUpdateManyAndReturnArgs>(args: SelectSubset<T, FollowerUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$FollowerPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Follower.
     * @param {FollowerUpsertArgs} args - Arguments to update or create a Follower.
     * @example
     * // Update or create a Follower
     * const follower = await prisma.follower.upsert({
     *   create: {
     *     // ... data to create a Follower
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Follower we want to update
     *   }
     * })
     */
    upsert<T extends FollowerUpsertArgs>(args: SelectSubset<T, FollowerUpsertArgs<ExtArgs>>): Prisma__FollowerClient<$Result.GetResult<Prisma.$FollowerPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Followers.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FollowerCountArgs} args - Arguments to filter Followers to count.
     * @example
     * // Count the number of Followers
     * const count = await prisma.follower.count({
     *   where: {
     *     // ... the filter for the Followers we want to count
     *   }
     * })
    **/
    count<T extends FollowerCountArgs>(
      args?: Subset<T, FollowerCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], FollowerCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Follower.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FollowerAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends FollowerAggregateArgs>(args: Subset<T, FollowerAggregateArgs>): Prisma.PrismaPromise<GetFollowerAggregateType<T>>

    /**
     * Group by Follower.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FollowerGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends FollowerGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: FollowerGroupByArgs['orderBy'] }
        : { orderBy?: FollowerGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, FollowerGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetFollowerGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Follower model
   */
  readonly fields: FollowerFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Follower.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__FollowerClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    follower<T extends UserDefaultArgs<ExtArgs> = {}>(args?: Subset<T, UserDefaultArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    following<T extends UserDefaultArgs<ExtArgs> = {}>(args?: Subset<T, UserDefaultArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Follower model
   */
  interface FollowerFieldRefs {
    readonly id: FieldRef<"Follower", 'String'>
    readonly followerId: FieldRef<"Follower", 'String'>
    readonly followingId: FieldRef<"Follower", 'String'>
  }
    

  // Custom InputTypes
  /**
   * Follower findUnique
   */
  export type FollowerFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Follower
     */
    select?: FollowerSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Follower
     */
    omit?: FollowerOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FollowerInclude<ExtArgs> | null
    /**
     * Filter, which Follower to fetch.
     */
    where: FollowerWhereUniqueInput
  }

  /**
   * Follower findUniqueOrThrow
   */
  export type FollowerFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Follower
     */
    select?: FollowerSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Follower
     */
    omit?: FollowerOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FollowerInclude<ExtArgs> | null
    /**
     * Filter, which Follower to fetch.
     */
    where: FollowerWhereUniqueInput
  }

  /**
   * Follower findFirst
   */
  export type FollowerFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Follower
     */
    select?: FollowerSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Follower
     */
    omit?: FollowerOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FollowerInclude<ExtArgs> | null
    /**
     * Filter, which Follower to fetch.
     */
    where?: FollowerWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Followers to fetch.
     */
    orderBy?: FollowerOrderByWithRelationInput | FollowerOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Followers.
     */
    cursor?: FollowerWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Followers from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Followers.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Followers.
     */
    distinct?: FollowerScalarFieldEnum | FollowerScalarFieldEnum[]
  }

  /**
   * Follower findFirstOrThrow
   */
  export type FollowerFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Follower
     */
    select?: FollowerSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Follower
     */
    omit?: FollowerOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FollowerInclude<ExtArgs> | null
    /**
     * Filter, which Follower to fetch.
     */
    where?: FollowerWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Followers to fetch.
     */
    orderBy?: FollowerOrderByWithRelationInput | FollowerOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Followers.
     */
    cursor?: FollowerWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Followers from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Followers.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Followers.
     */
    distinct?: FollowerScalarFieldEnum | FollowerScalarFieldEnum[]
  }

  /**
   * Follower findMany
   */
  export type FollowerFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Follower
     */
    select?: FollowerSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Follower
     */
    omit?: FollowerOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FollowerInclude<ExtArgs> | null
    /**
     * Filter, which Followers to fetch.
     */
    where?: FollowerWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Followers to fetch.
     */
    orderBy?: FollowerOrderByWithRelationInput | FollowerOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Followers.
     */
    cursor?: FollowerWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Followers from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Followers.
     */
    skip?: number
    distinct?: FollowerScalarFieldEnum | FollowerScalarFieldEnum[]
  }

  /**
   * Follower create
   */
  export type FollowerCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Follower
     */
    select?: FollowerSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Follower
     */
    omit?: FollowerOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FollowerInclude<ExtArgs> | null
    /**
     * The data needed to create a Follower.
     */
    data: XOR<FollowerCreateInput, FollowerUncheckedCreateInput>
  }

  /**
   * Follower createMany
   */
  export type FollowerCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Followers.
     */
    data: FollowerCreateManyInput | FollowerCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Follower createManyAndReturn
   */
  export type FollowerCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Follower
     */
    select?: FollowerSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Follower
     */
    omit?: FollowerOmit<ExtArgs> | null
    /**
     * The data used to create many Followers.
     */
    data: FollowerCreateManyInput | FollowerCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FollowerIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Follower update
   */
  export type FollowerUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Follower
     */
    select?: FollowerSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Follower
     */
    omit?: FollowerOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FollowerInclude<ExtArgs> | null
    /**
     * The data needed to update a Follower.
     */
    data: XOR<FollowerUpdateInput, FollowerUncheckedUpdateInput>
    /**
     * Choose, which Follower to update.
     */
    where: FollowerWhereUniqueInput
  }

  /**
   * Follower updateMany
   */
  export type FollowerUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Followers.
     */
    data: XOR<FollowerUpdateManyMutationInput, FollowerUncheckedUpdateManyInput>
    /**
     * Filter which Followers to update
     */
    where?: FollowerWhereInput
    /**
     * Limit how many Followers to update.
     */
    limit?: number
  }

  /**
   * Follower updateManyAndReturn
   */
  export type FollowerUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Follower
     */
    select?: FollowerSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Follower
     */
    omit?: FollowerOmit<ExtArgs> | null
    /**
     * The data used to update Followers.
     */
    data: XOR<FollowerUpdateManyMutationInput, FollowerUncheckedUpdateManyInput>
    /**
     * Filter which Followers to update
     */
    where?: FollowerWhereInput
    /**
     * Limit how many Followers to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FollowerIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * Follower upsert
   */
  export type FollowerUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Follower
     */
    select?: FollowerSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Follower
     */
    omit?: FollowerOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FollowerInclude<ExtArgs> | null
    /**
     * The filter to search for the Follower to update in case it exists.
     */
    where: FollowerWhereUniqueInput
    /**
     * In case the Follower found by the `where` argument doesn't exist, create a new Follower with this data.
     */
    create: XOR<FollowerCreateInput, FollowerUncheckedCreateInput>
    /**
     * In case the Follower was found with the provided `where` argument, update it with this data.
     */
    update: XOR<FollowerUpdateInput, FollowerUncheckedUpdateInput>
  }

  /**
   * Follower delete
   */
  export type FollowerDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Follower
     */
    select?: FollowerSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Follower
     */
    omit?: FollowerOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FollowerInclude<ExtArgs> | null
    /**
     * Filter which Follower to delete.
     */
    where: FollowerWhereUniqueInput
  }

  /**
   * Follower deleteMany
   */
  export type FollowerDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Followers to delete
     */
    where?: FollowerWhereInput
    /**
     * Limit how many Followers to delete.
     */
    limit?: number
  }

  /**
   * Follower without action
   */
  export type FollowerDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Follower
     */
    select?: FollowerSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Follower
     */
    omit?: FollowerOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FollowerInclude<ExtArgs> | null
  }


  /**
   * Model Rating
   */

  export type AggregateRating = {
    _count: RatingCountAggregateOutputType | null
    _avg: RatingAvgAggregateOutputType | null
    _sum: RatingSumAggregateOutputType | null
    _min: RatingMinAggregateOutputType | null
    _max: RatingMaxAggregateOutputType | null
  }

  export type RatingAvgAggregateOutputType = {
    value: number | null
  }

  export type RatingSumAggregateOutputType = {
    value: number | null
  }

  export type RatingMinAggregateOutputType = {
    id: string | null
    userId: string | null
    type: string | null
    value: number | null
    createdAt: Date | null
  }

  export type RatingMaxAggregateOutputType = {
    id: string | null
    userId: string | null
    type: string | null
    value: number | null
    createdAt: Date | null
  }

  export type RatingCountAggregateOutputType = {
    id: number
    userId: number
    type: number
    value: number
    createdAt: number
    _all: number
  }


  export type RatingAvgAggregateInputType = {
    value?: true
  }

  export type RatingSumAggregateInputType = {
    value?: true
  }

  export type RatingMinAggregateInputType = {
    id?: true
    userId?: true
    type?: true
    value?: true
    createdAt?: true
  }

  export type RatingMaxAggregateInputType = {
    id?: true
    userId?: true
    type?: true
    value?: true
    createdAt?: true
  }

  export type RatingCountAggregateInputType = {
    id?: true
    userId?: true
    type?: true
    value?: true
    createdAt?: true
    _all?: true
  }

  export type RatingAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Rating to aggregate.
     */
    where?: RatingWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Ratings to fetch.
     */
    orderBy?: RatingOrderByWithRelationInput | RatingOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: RatingWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Ratings from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Ratings.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Ratings
    **/
    _count?: true | RatingCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: RatingAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: RatingSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: RatingMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: RatingMaxAggregateInputType
  }

  export type GetRatingAggregateType<T extends RatingAggregateArgs> = {
        [P in keyof T & keyof AggregateRating]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateRating[P]>
      : GetScalarType<T[P], AggregateRating[P]>
  }




  export type RatingGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: RatingWhereInput
    orderBy?: RatingOrderByWithAggregationInput | RatingOrderByWithAggregationInput[]
    by: RatingScalarFieldEnum[] | RatingScalarFieldEnum
    having?: RatingScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: RatingCountAggregateInputType | true
    _avg?: RatingAvgAggregateInputType
    _sum?: RatingSumAggregateInputType
    _min?: RatingMinAggregateInputType
    _max?: RatingMaxAggregateInputType
  }

  export type RatingGroupByOutputType = {
    id: string
    userId: string
    type: string
    value: number
    createdAt: Date
    _count: RatingCountAggregateOutputType | null
    _avg: RatingAvgAggregateOutputType | null
    _sum: RatingSumAggregateOutputType | null
    _min: RatingMinAggregateOutputType | null
    _max: RatingMaxAggregateOutputType | null
  }

  type GetRatingGroupByPayload<T extends RatingGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<RatingGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof RatingGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], RatingGroupByOutputType[P]>
            : GetScalarType<T[P], RatingGroupByOutputType[P]>
        }
      >
    >


  export type RatingSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    type?: boolean
    value?: boolean
    createdAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["rating"]>

  export type RatingSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    type?: boolean
    value?: boolean
    createdAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["rating"]>

  export type RatingSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    type?: boolean
    value?: boolean
    createdAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["rating"]>

  export type RatingSelectScalar = {
    id?: boolean
    userId?: boolean
    type?: boolean
    value?: boolean
    createdAt?: boolean
  }

  export type RatingOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "userId" | "type" | "value" | "createdAt", ExtArgs["result"]["rating"]>
  export type RatingInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type RatingIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type RatingIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }

  export type $RatingPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Rating"
    objects: {
      user: Prisma.$UserPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      userId: string
      type: string
      value: number
      createdAt: Date
    }, ExtArgs["result"]["rating"]>
    composites: {}
  }

  type RatingGetPayload<S extends boolean | null | undefined | RatingDefaultArgs> = $Result.GetResult<Prisma.$RatingPayload, S>

  type RatingCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<RatingFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: RatingCountAggregateInputType | true
    }

  export interface RatingDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Rating'], meta: { name: 'Rating' } }
    /**
     * Find zero or one Rating that matches the filter.
     * @param {RatingFindUniqueArgs} args - Arguments to find a Rating
     * @example
     * // Get one Rating
     * const rating = await prisma.rating.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends RatingFindUniqueArgs>(args: SelectSubset<T, RatingFindUniqueArgs<ExtArgs>>): Prisma__RatingClient<$Result.GetResult<Prisma.$RatingPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Rating that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {RatingFindUniqueOrThrowArgs} args - Arguments to find a Rating
     * @example
     * // Get one Rating
     * const rating = await prisma.rating.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends RatingFindUniqueOrThrowArgs>(args: SelectSubset<T, RatingFindUniqueOrThrowArgs<ExtArgs>>): Prisma__RatingClient<$Result.GetResult<Prisma.$RatingPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Rating that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RatingFindFirstArgs} args - Arguments to find a Rating
     * @example
     * // Get one Rating
     * const rating = await prisma.rating.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends RatingFindFirstArgs>(args?: SelectSubset<T, RatingFindFirstArgs<ExtArgs>>): Prisma__RatingClient<$Result.GetResult<Prisma.$RatingPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Rating that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RatingFindFirstOrThrowArgs} args - Arguments to find a Rating
     * @example
     * // Get one Rating
     * const rating = await prisma.rating.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends RatingFindFirstOrThrowArgs>(args?: SelectSubset<T, RatingFindFirstOrThrowArgs<ExtArgs>>): Prisma__RatingClient<$Result.GetResult<Prisma.$RatingPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Ratings that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RatingFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Ratings
     * const ratings = await prisma.rating.findMany()
     * 
     * // Get first 10 Ratings
     * const ratings = await prisma.rating.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const ratingWithIdOnly = await prisma.rating.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends RatingFindManyArgs>(args?: SelectSubset<T, RatingFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$RatingPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Rating.
     * @param {RatingCreateArgs} args - Arguments to create a Rating.
     * @example
     * // Create one Rating
     * const Rating = await prisma.rating.create({
     *   data: {
     *     // ... data to create a Rating
     *   }
     * })
     * 
     */
    create<T extends RatingCreateArgs>(args: SelectSubset<T, RatingCreateArgs<ExtArgs>>): Prisma__RatingClient<$Result.GetResult<Prisma.$RatingPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Ratings.
     * @param {RatingCreateManyArgs} args - Arguments to create many Ratings.
     * @example
     * // Create many Ratings
     * const rating = await prisma.rating.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends RatingCreateManyArgs>(args?: SelectSubset<T, RatingCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Ratings and returns the data saved in the database.
     * @param {RatingCreateManyAndReturnArgs} args - Arguments to create many Ratings.
     * @example
     * // Create many Ratings
     * const rating = await prisma.rating.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Ratings and only return the `id`
     * const ratingWithIdOnly = await prisma.rating.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends RatingCreateManyAndReturnArgs>(args?: SelectSubset<T, RatingCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$RatingPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Rating.
     * @param {RatingDeleteArgs} args - Arguments to delete one Rating.
     * @example
     * // Delete one Rating
     * const Rating = await prisma.rating.delete({
     *   where: {
     *     // ... filter to delete one Rating
     *   }
     * })
     * 
     */
    delete<T extends RatingDeleteArgs>(args: SelectSubset<T, RatingDeleteArgs<ExtArgs>>): Prisma__RatingClient<$Result.GetResult<Prisma.$RatingPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Rating.
     * @param {RatingUpdateArgs} args - Arguments to update one Rating.
     * @example
     * // Update one Rating
     * const rating = await prisma.rating.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends RatingUpdateArgs>(args: SelectSubset<T, RatingUpdateArgs<ExtArgs>>): Prisma__RatingClient<$Result.GetResult<Prisma.$RatingPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Ratings.
     * @param {RatingDeleteManyArgs} args - Arguments to filter Ratings to delete.
     * @example
     * // Delete a few Ratings
     * const { count } = await prisma.rating.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends RatingDeleteManyArgs>(args?: SelectSubset<T, RatingDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Ratings.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RatingUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Ratings
     * const rating = await prisma.rating.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends RatingUpdateManyArgs>(args: SelectSubset<T, RatingUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Ratings and returns the data updated in the database.
     * @param {RatingUpdateManyAndReturnArgs} args - Arguments to update many Ratings.
     * @example
     * // Update many Ratings
     * const rating = await prisma.rating.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Ratings and only return the `id`
     * const ratingWithIdOnly = await prisma.rating.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends RatingUpdateManyAndReturnArgs>(args: SelectSubset<T, RatingUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$RatingPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Rating.
     * @param {RatingUpsertArgs} args - Arguments to update or create a Rating.
     * @example
     * // Update or create a Rating
     * const rating = await prisma.rating.upsert({
     *   create: {
     *     // ... data to create a Rating
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Rating we want to update
     *   }
     * })
     */
    upsert<T extends RatingUpsertArgs>(args: SelectSubset<T, RatingUpsertArgs<ExtArgs>>): Prisma__RatingClient<$Result.GetResult<Prisma.$RatingPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Ratings.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RatingCountArgs} args - Arguments to filter Ratings to count.
     * @example
     * // Count the number of Ratings
     * const count = await prisma.rating.count({
     *   where: {
     *     // ... the filter for the Ratings we want to count
     *   }
     * })
    **/
    count<T extends RatingCountArgs>(
      args?: Subset<T, RatingCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], RatingCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Rating.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RatingAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends RatingAggregateArgs>(args: Subset<T, RatingAggregateArgs>): Prisma.PrismaPromise<GetRatingAggregateType<T>>

    /**
     * Group by Rating.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RatingGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends RatingGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: RatingGroupByArgs['orderBy'] }
        : { orderBy?: RatingGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, RatingGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetRatingGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Rating model
   */
  readonly fields: RatingFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Rating.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__RatingClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    user<T extends UserDefaultArgs<ExtArgs> = {}>(args?: Subset<T, UserDefaultArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Rating model
   */
  interface RatingFieldRefs {
    readonly id: FieldRef<"Rating", 'String'>
    readonly userId: FieldRef<"Rating", 'String'>
    readonly type: FieldRef<"Rating", 'String'>
    readonly value: FieldRef<"Rating", 'Int'>
    readonly createdAt: FieldRef<"Rating", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Rating findUnique
   */
  export type RatingFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Rating
     */
    select?: RatingSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Rating
     */
    omit?: RatingOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RatingInclude<ExtArgs> | null
    /**
     * Filter, which Rating to fetch.
     */
    where: RatingWhereUniqueInput
  }

  /**
   * Rating findUniqueOrThrow
   */
  export type RatingFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Rating
     */
    select?: RatingSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Rating
     */
    omit?: RatingOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RatingInclude<ExtArgs> | null
    /**
     * Filter, which Rating to fetch.
     */
    where: RatingWhereUniqueInput
  }

  /**
   * Rating findFirst
   */
  export type RatingFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Rating
     */
    select?: RatingSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Rating
     */
    omit?: RatingOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RatingInclude<ExtArgs> | null
    /**
     * Filter, which Rating to fetch.
     */
    where?: RatingWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Ratings to fetch.
     */
    orderBy?: RatingOrderByWithRelationInput | RatingOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Ratings.
     */
    cursor?: RatingWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Ratings from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Ratings.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Ratings.
     */
    distinct?: RatingScalarFieldEnum | RatingScalarFieldEnum[]
  }

  /**
   * Rating findFirstOrThrow
   */
  export type RatingFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Rating
     */
    select?: RatingSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Rating
     */
    omit?: RatingOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RatingInclude<ExtArgs> | null
    /**
     * Filter, which Rating to fetch.
     */
    where?: RatingWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Ratings to fetch.
     */
    orderBy?: RatingOrderByWithRelationInput | RatingOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Ratings.
     */
    cursor?: RatingWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Ratings from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Ratings.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Ratings.
     */
    distinct?: RatingScalarFieldEnum | RatingScalarFieldEnum[]
  }

  /**
   * Rating findMany
   */
  export type RatingFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Rating
     */
    select?: RatingSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Rating
     */
    omit?: RatingOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RatingInclude<ExtArgs> | null
    /**
     * Filter, which Ratings to fetch.
     */
    where?: RatingWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Ratings to fetch.
     */
    orderBy?: RatingOrderByWithRelationInput | RatingOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Ratings.
     */
    cursor?: RatingWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Ratings from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Ratings.
     */
    skip?: number
    distinct?: RatingScalarFieldEnum | RatingScalarFieldEnum[]
  }

  /**
   * Rating create
   */
  export type RatingCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Rating
     */
    select?: RatingSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Rating
     */
    omit?: RatingOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RatingInclude<ExtArgs> | null
    /**
     * The data needed to create a Rating.
     */
    data: XOR<RatingCreateInput, RatingUncheckedCreateInput>
  }

  /**
   * Rating createMany
   */
  export type RatingCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Ratings.
     */
    data: RatingCreateManyInput | RatingCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Rating createManyAndReturn
   */
  export type RatingCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Rating
     */
    select?: RatingSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Rating
     */
    omit?: RatingOmit<ExtArgs> | null
    /**
     * The data used to create many Ratings.
     */
    data: RatingCreateManyInput | RatingCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RatingIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Rating update
   */
  export type RatingUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Rating
     */
    select?: RatingSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Rating
     */
    omit?: RatingOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RatingInclude<ExtArgs> | null
    /**
     * The data needed to update a Rating.
     */
    data: XOR<RatingUpdateInput, RatingUncheckedUpdateInput>
    /**
     * Choose, which Rating to update.
     */
    where: RatingWhereUniqueInput
  }

  /**
   * Rating updateMany
   */
  export type RatingUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Ratings.
     */
    data: XOR<RatingUpdateManyMutationInput, RatingUncheckedUpdateManyInput>
    /**
     * Filter which Ratings to update
     */
    where?: RatingWhereInput
    /**
     * Limit how many Ratings to update.
     */
    limit?: number
  }

  /**
   * Rating updateManyAndReturn
   */
  export type RatingUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Rating
     */
    select?: RatingSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Rating
     */
    omit?: RatingOmit<ExtArgs> | null
    /**
     * The data used to update Ratings.
     */
    data: XOR<RatingUpdateManyMutationInput, RatingUncheckedUpdateManyInput>
    /**
     * Filter which Ratings to update
     */
    where?: RatingWhereInput
    /**
     * Limit how many Ratings to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RatingIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * Rating upsert
   */
  export type RatingUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Rating
     */
    select?: RatingSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Rating
     */
    omit?: RatingOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RatingInclude<ExtArgs> | null
    /**
     * The filter to search for the Rating to update in case it exists.
     */
    where: RatingWhereUniqueInput
    /**
     * In case the Rating found by the `where` argument doesn't exist, create a new Rating with this data.
     */
    create: XOR<RatingCreateInput, RatingUncheckedCreateInput>
    /**
     * In case the Rating was found with the provided `where` argument, update it with this data.
     */
    update: XOR<RatingUpdateInput, RatingUncheckedUpdateInput>
  }

  /**
   * Rating delete
   */
  export type RatingDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Rating
     */
    select?: RatingSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Rating
     */
    omit?: RatingOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RatingInclude<ExtArgs> | null
    /**
     * Filter which Rating to delete.
     */
    where: RatingWhereUniqueInput
  }

  /**
   * Rating deleteMany
   */
  export type RatingDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Ratings to delete
     */
    where?: RatingWhereInput
    /**
     * Limit how many Ratings to delete.
     */
    limit?: number
  }

  /**
   * Rating without action
   */
  export type RatingDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Rating
     */
    select?: RatingSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Rating
     */
    omit?: RatingOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RatingInclude<ExtArgs> | null
  }


  /**
   * Model Game
   */

  export type AggregateGame = {
    _count: GameCountAggregateOutputType | null
    _avg: GameAvgAggregateOutputType | null
    _sum: GameSumAggregateOutputType | null
    _min: GameMinAggregateOutputType | null
    _max: GameMaxAggregateOutputType | null
  }

  export type GameAvgAggregateOutputType = {
    whiteRating: number | null
    blackRating: number | null
    openingNr: number | null
  }

  export type GameSumAggregateOutputType = {
    whiteRating: number | null
    blackRating: number | null
    openingNr: number | null
  }

  export type GameMinAggregateOutputType = {
    id: string | null
    whiteId: string | null
    blackId: string | null
    whiteRating: number | null
    blackRating: number | null
    type: string | null
    isRated: boolean | null
    playedAt: Date | null
    pgn: string | null
    openingNr: number | null
    result: string | null
  }

  export type GameMaxAggregateOutputType = {
    id: string | null
    whiteId: string | null
    blackId: string | null
    whiteRating: number | null
    blackRating: number | null
    type: string | null
    isRated: boolean | null
    playedAt: Date | null
    pgn: string | null
    openingNr: number | null
    result: string | null
  }

  export type GameCountAggregateOutputType = {
    id: number
    whiteId: number
    blackId: number
    whiteRating: number
    blackRating: number
    type: number
    isRated: number
    playedAt: number
    pgn: number
    openingNr: number
    result: number
    _all: number
  }


  export type GameAvgAggregateInputType = {
    whiteRating?: true
    blackRating?: true
    openingNr?: true
  }

  export type GameSumAggregateInputType = {
    whiteRating?: true
    blackRating?: true
    openingNr?: true
  }

  export type GameMinAggregateInputType = {
    id?: true
    whiteId?: true
    blackId?: true
    whiteRating?: true
    blackRating?: true
    type?: true
    isRated?: true
    playedAt?: true
    pgn?: true
    openingNr?: true
    result?: true
  }

  export type GameMaxAggregateInputType = {
    id?: true
    whiteId?: true
    blackId?: true
    whiteRating?: true
    blackRating?: true
    type?: true
    isRated?: true
    playedAt?: true
    pgn?: true
    openingNr?: true
    result?: true
  }

  export type GameCountAggregateInputType = {
    id?: true
    whiteId?: true
    blackId?: true
    whiteRating?: true
    blackRating?: true
    type?: true
    isRated?: true
    playedAt?: true
    pgn?: true
    openingNr?: true
    result?: true
    _all?: true
  }

  export type GameAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Game to aggregate.
     */
    where?: GameWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Games to fetch.
     */
    orderBy?: GameOrderByWithRelationInput | GameOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: GameWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Games from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Games.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Games
    **/
    _count?: true | GameCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: GameAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: GameSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: GameMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: GameMaxAggregateInputType
  }

  export type GetGameAggregateType<T extends GameAggregateArgs> = {
        [P in keyof T & keyof AggregateGame]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateGame[P]>
      : GetScalarType<T[P], AggregateGame[P]>
  }




  export type GameGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: GameWhereInput
    orderBy?: GameOrderByWithAggregationInput | GameOrderByWithAggregationInput[]
    by: GameScalarFieldEnum[] | GameScalarFieldEnum
    having?: GameScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: GameCountAggregateInputType | true
    _avg?: GameAvgAggregateInputType
    _sum?: GameSumAggregateInputType
    _min?: GameMinAggregateInputType
    _max?: GameMaxAggregateInputType
  }

  export type GameGroupByOutputType = {
    id: string
    whiteId: string
    blackId: string
    whiteRating: number
    blackRating: number
    type: string
    isRated: boolean
    playedAt: Date
    pgn: string
    openingNr: number
    result: string
    _count: GameCountAggregateOutputType | null
    _avg: GameAvgAggregateOutputType | null
    _sum: GameSumAggregateOutputType | null
    _min: GameMinAggregateOutputType | null
    _max: GameMaxAggregateOutputType | null
  }

  type GetGameGroupByPayload<T extends GameGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<GameGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof GameGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], GameGroupByOutputType[P]>
            : GetScalarType<T[P], GameGroupByOutputType[P]>
        }
      >
    >


  export type GameSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    whiteId?: boolean
    blackId?: boolean
    whiteRating?: boolean
    blackRating?: boolean
    type?: boolean
    isRated?: boolean
    playedAt?: boolean
    pgn?: boolean
    openingNr?: boolean
    result?: boolean
    white?: boolean | UserDefaultArgs<ExtArgs>
    black?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["game"]>

  export type GameSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    whiteId?: boolean
    blackId?: boolean
    whiteRating?: boolean
    blackRating?: boolean
    type?: boolean
    isRated?: boolean
    playedAt?: boolean
    pgn?: boolean
    openingNr?: boolean
    result?: boolean
    white?: boolean | UserDefaultArgs<ExtArgs>
    black?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["game"]>

  export type GameSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    whiteId?: boolean
    blackId?: boolean
    whiteRating?: boolean
    blackRating?: boolean
    type?: boolean
    isRated?: boolean
    playedAt?: boolean
    pgn?: boolean
    openingNr?: boolean
    result?: boolean
    white?: boolean | UserDefaultArgs<ExtArgs>
    black?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["game"]>

  export type GameSelectScalar = {
    id?: boolean
    whiteId?: boolean
    blackId?: boolean
    whiteRating?: boolean
    blackRating?: boolean
    type?: boolean
    isRated?: boolean
    playedAt?: boolean
    pgn?: boolean
    openingNr?: boolean
    result?: boolean
  }

  export type GameOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "whiteId" | "blackId" | "whiteRating" | "blackRating" | "type" | "isRated" | "playedAt" | "pgn" | "openingNr" | "result", ExtArgs["result"]["game"]>
  export type GameInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    white?: boolean | UserDefaultArgs<ExtArgs>
    black?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type GameIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    white?: boolean | UserDefaultArgs<ExtArgs>
    black?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type GameIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    white?: boolean | UserDefaultArgs<ExtArgs>
    black?: boolean | UserDefaultArgs<ExtArgs>
  }

  export type $GamePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Game"
    objects: {
      white: Prisma.$UserPayload<ExtArgs>
      black: Prisma.$UserPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      whiteId: string
      blackId: string
      whiteRating: number
      blackRating: number
      type: string
      isRated: boolean
      playedAt: Date
      pgn: string
      openingNr: number
      result: string
    }, ExtArgs["result"]["game"]>
    composites: {}
  }

  type GameGetPayload<S extends boolean | null | undefined | GameDefaultArgs> = $Result.GetResult<Prisma.$GamePayload, S>

  type GameCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<GameFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: GameCountAggregateInputType | true
    }

  export interface GameDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Game'], meta: { name: 'Game' } }
    /**
     * Find zero or one Game that matches the filter.
     * @param {GameFindUniqueArgs} args - Arguments to find a Game
     * @example
     * // Get one Game
     * const game = await prisma.game.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends GameFindUniqueArgs>(args: SelectSubset<T, GameFindUniqueArgs<ExtArgs>>): Prisma__GameClient<$Result.GetResult<Prisma.$GamePayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Game that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {GameFindUniqueOrThrowArgs} args - Arguments to find a Game
     * @example
     * // Get one Game
     * const game = await prisma.game.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends GameFindUniqueOrThrowArgs>(args: SelectSubset<T, GameFindUniqueOrThrowArgs<ExtArgs>>): Prisma__GameClient<$Result.GetResult<Prisma.$GamePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Game that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GameFindFirstArgs} args - Arguments to find a Game
     * @example
     * // Get one Game
     * const game = await prisma.game.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends GameFindFirstArgs>(args?: SelectSubset<T, GameFindFirstArgs<ExtArgs>>): Prisma__GameClient<$Result.GetResult<Prisma.$GamePayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Game that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GameFindFirstOrThrowArgs} args - Arguments to find a Game
     * @example
     * // Get one Game
     * const game = await prisma.game.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends GameFindFirstOrThrowArgs>(args?: SelectSubset<T, GameFindFirstOrThrowArgs<ExtArgs>>): Prisma__GameClient<$Result.GetResult<Prisma.$GamePayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Games that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GameFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Games
     * const games = await prisma.game.findMany()
     * 
     * // Get first 10 Games
     * const games = await prisma.game.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const gameWithIdOnly = await prisma.game.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends GameFindManyArgs>(args?: SelectSubset<T, GameFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$GamePayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Game.
     * @param {GameCreateArgs} args - Arguments to create a Game.
     * @example
     * // Create one Game
     * const Game = await prisma.game.create({
     *   data: {
     *     // ... data to create a Game
     *   }
     * })
     * 
     */
    create<T extends GameCreateArgs>(args: SelectSubset<T, GameCreateArgs<ExtArgs>>): Prisma__GameClient<$Result.GetResult<Prisma.$GamePayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Games.
     * @param {GameCreateManyArgs} args - Arguments to create many Games.
     * @example
     * // Create many Games
     * const game = await prisma.game.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends GameCreateManyArgs>(args?: SelectSubset<T, GameCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Games and returns the data saved in the database.
     * @param {GameCreateManyAndReturnArgs} args - Arguments to create many Games.
     * @example
     * // Create many Games
     * const game = await prisma.game.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Games and only return the `id`
     * const gameWithIdOnly = await prisma.game.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends GameCreateManyAndReturnArgs>(args?: SelectSubset<T, GameCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$GamePayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Game.
     * @param {GameDeleteArgs} args - Arguments to delete one Game.
     * @example
     * // Delete one Game
     * const Game = await prisma.game.delete({
     *   where: {
     *     // ... filter to delete one Game
     *   }
     * })
     * 
     */
    delete<T extends GameDeleteArgs>(args: SelectSubset<T, GameDeleteArgs<ExtArgs>>): Prisma__GameClient<$Result.GetResult<Prisma.$GamePayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Game.
     * @param {GameUpdateArgs} args - Arguments to update one Game.
     * @example
     * // Update one Game
     * const game = await prisma.game.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends GameUpdateArgs>(args: SelectSubset<T, GameUpdateArgs<ExtArgs>>): Prisma__GameClient<$Result.GetResult<Prisma.$GamePayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Games.
     * @param {GameDeleteManyArgs} args - Arguments to filter Games to delete.
     * @example
     * // Delete a few Games
     * const { count } = await prisma.game.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends GameDeleteManyArgs>(args?: SelectSubset<T, GameDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Games.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GameUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Games
     * const game = await prisma.game.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends GameUpdateManyArgs>(args: SelectSubset<T, GameUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Games and returns the data updated in the database.
     * @param {GameUpdateManyAndReturnArgs} args - Arguments to update many Games.
     * @example
     * // Update many Games
     * const game = await prisma.game.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Games and only return the `id`
     * const gameWithIdOnly = await prisma.game.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends GameUpdateManyAndReturnArgs>(args: SelectSubset<T, GameUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$GamePayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Game.
     * @param {GameUpsertArgs} args - Arguments to update or create a Game.
     * @example
     * // Update or create a Game
     * const game = await prisma.game.upsert({
     *   create: {
     *     // ... data to create a Game
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Game we want to update
     *   }
     * })
     */
    upsert<T extends GameUpsertArgs>(args: SelectSubset<T, GameUpsertArgs<ExtArgs>>): Prisma__GameClient<$Result.GetResult<Prisma.$GamePayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Games.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GameCountArgs} args - Arguments to filter Games to count.
     * @example
     * // Count the number of Games
     * const count = await prisma.game.count({
     *   where: {
     *     // ... the filter for the Games we want to count
     *   }
     * })
    **/
    count<T extends GameCountArgs>(
      args?: Subset<T, GameCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], GameCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Game.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GameAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends GameAggregateArgs>(args: Subset<T, GameAggregateArgs>): Prisma.PrismaPromise<GetGameAggregateType<T>>

    /**
     * Group by Game.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GameGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends GameGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: GameGroupByArgs['orderBy'] }
        : { orderBy?: GameGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, GameGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetGameGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Game model
   */
  readonly fields: GameFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Game.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__GameClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    white<T extends UserDefaultArgs<ExtArgs> = {}>(args?: Subset<T, UserDefaultArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    black<T extends UserDefaultArgs<ExtArgs> = {}>(args?: Subset<T, UserDefaultArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Game model
   */
  interface GameFieldRefs {
    readonly id: FieldRef<"Game", 'String'>
    readonly whiteId: FieldRef<"Game", 'String'>
    readonly blackId: FieldRef<"Game", 'String'>
    readonly whiteRating: FieldRef<"Game", 'Int'>
    readonly blackRating: FieldRef<"Game", 'Int'>
    readonly type: FieldRef<"Game", 'String'>
    readonly isRated: FieldRef<"Game", 'Boolean'>
    readonly playedAt: FieldRef<"Game", 'DateTime'>
    readonly pgn: FieldRef<"Game", 'String'>
    readonly openingNr: FieldRef<"Game", 'Int'>
    readonly result: FieldRef<"Game", 'String'>
  }
    

  // Custom InputTypes
  /**
   * Game findUnique
   */
  export type GameFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Game
     */
    select?: GameSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Game
     */
    omit?: GameOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GameInclude<ExtArgs> | null
    /**
     * Filter, which Game to fetch.
     */
    where: GameWhereUniqueInput
  }

  /**
   * Game findUniqueOrThrow
   */
  export type GameFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Game
     */
    select?: GameSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Game
     */
    omit?: GameOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GameInclude<ExtArgs> | null
    /**
     * Filter, which Game to fetch.
     */
    where: GameWhereUniqueInput
  }

  /**
   * Game findFirst
   */
  export type GameFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Game
     */
    select?: GameSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Game
     */
    omit?: GameOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GameInclude<ExtArgs> | null
    /**
     * Filter, which Game to fetch.
     */
    where?: GameWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Games to fetch.
     */
    orderBy?: GameOrderByWithRelationInput | GameOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Games.
     */
    cursor?: GameWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Games from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Games.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Games.
     */
    distinct?: GameScalarFieldEnum | GameScalarFieldEnum[]
  }

  /**
   * Game findFirstOrThrow
   */
  export type GameFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Game
     */
    select?: GameSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Game
     */
    omit?: GameOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GameInclude<ExtArgs> | null
    /**
     * Filter, which Game to fetch.
     */
    where?: GameWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Games to fetch.
     */
    orderBy?: GameOrderByWithRelationInput | GameOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Games.
     */
    cursor?: GameWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Games from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Games.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Games.
     */
    distinct?: GameScalarFieldEnum | GameScalarFieldEnum[]
  }

  /**
   * Game findMany
   */
  export type GameFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Game
     */
    select?: GameSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Game
     */
    omit?: GameOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GameInclude<ExtArgs> | null
    /**
     * Filter, which Games to fetch.
     */
    where?: GameWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Games to fetch.
     */
    orderBy?: GameOrderByWithRelationInput | GameOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Games.
     */
    cursor?: GameWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Games from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Games.
     */
    skip?: number
    distinct?: GameScalarFieldEnum | GameScalarFieldEnum[]
  }

  /**
   * Game create
   */
  export type GameCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Game
     */
    select?: GameSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Game
     */
    omit?: GameOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GameInclude<ExtArgs> | null
    /**
     * The data needed to create a Game.
     */
    data: XOR<GameCreateInput, GameUncheckedCreateInput>
  }

  /**
   * Game createMany
   */
  export type GameCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Games.
     */
    data: GameCreateManyInput | GameCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Game createManyAndReturn
   */
  export type GameCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Game
     */
    select?: GameSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Game
     */
    omit?: GameOmit<ExtArgs> | null
    /**
     * The data used to create many Games.
     */
    data: GameCreateManyInput | GameCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GameIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Game update
   */
  export type GameUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Game
     */
    select?: GameSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Game
     */
    omit?: GameOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GameInclude<ExtArgs> | null
    /**
     * The data needed to update a Game.
     */
    data: XOR<GameUpdateInput, GameUncheckedUpdateInput>
    /**
     * Choose, which Game to update.
     */
    where: GameWhereUniqueInput
  }

  /**
   * Game updateMany
   */
  export type GameUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Games.
     */
    data: XOR<GameUpdateManyMutationInput, GameUncheckedUpdateManyInput>
    /**
     * Filter which Games to update
     */
    where?: GameWhereInput
    /**
     * Limit how many Games to update.
     */
    limit?: number
  }

  /**
   * Game updateManyAndReturn
   */
  export type GameUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Game
     */
    select?: GameSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Game
     */
    omit?: GameOmit<ExtArgs> | null
    /**
     * The data used to update Games.
     */
    data: XOR<GameUpdateManyMutationInput, GameUncheckedUpdateManyInput>
    /**
     * Filter which Games to update
     */
    where?: GameWhereInput
    /**
     * Limit how many Games to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GameIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * Game upsert
   */
  export type GameUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Game
     */
    select?: GameSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Game
     */
    omit?: GameOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GameInclude<ExtArgs> | null
    /**
     * The filter to search for the Game to update in case it exists.
     */
    where: GameWhereUniqueInput
    /**
     * In case the Game found by the `where` argument doesn't exist, create a new Game with this data.
     */
    create: XOR<GameCreateInput, GameUncheckedCreateInput>
    /**
     * In case the Game was found with the provided `where` argument, update it with this data.
     */
    update: XOR<GameUpdateInput, GameUncheckedUpdateInput>
  }

  /**
   * Game delete
   */
  export type GameDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Game
     */
    select?: GameSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Game
     */
    omit?: GameOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GameInclude<ExtArgs> | null
    /**
     * Filter which Game to delete.
     */
    where: GameWhereUniqueInput
  }

  /**
   * Game deleteMany
   */
  export type GameDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Games to delete
     */
    where?: GameWhereInput
    /**
     * Limit how many Games to delete.
     */
    limit?: number
  }

  /**
   * Game without action
   */
  export type GameDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Game
     */
    select?: GameSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Game
     */
    omit?: GameOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GameInclude<ExtArgs> | null
  }


  /**
   * Model Tactic
   */

  export type AggregateTactic = {
    _count: TacticCountAggregateOutputType | null
    _avg: TacticAvgAggregateOutputType | null
    _sum: TacticSumAggregateOutputType | null
    _min: TacticMinAggregateOutputType | null
    _max: TacticMaxAggregateOutputType | null
  }

  export type TacticAvgAggregateOutputType = {
    id: number | null
    rating: number | null
    openingNr: number | null
    moveNr: number | null
  }

  export type TacticSumAggregateOutputType = {
    id: number | null
    rating: number | null
    openingNr: number | null
    moveNr: number | null
  }

  export type TacticMinAggregateOutputType = {
    id: number | null
    fen: string | null
    rating: number | null
    openingNr: number | null
    moveNr: number | null
  }

  export type TacticMaxAggregateOutputType = {
    id: number | null
    fen: string | null
    rating: number | null
    openingNr: number | null
    moveNr: number | null
  }

  export type TacticCountAggregateOutputType = {
    id: number
    fen: number
    rating: number
    openingNr: number
    moveNr: number
    _all: number
  }


  export type TacticAvgAggregateInputType = {
    id?: true
    rating?: true
    openingNr?: true
    moveNr?: true
  }

  export type TacticSumAggregateInputType = {
    id?: true
    rating?: true
    openingNr?: true
    moveNr?: true
  }

  export type TacticMinAggregateInputType = {
    id?: true
    fen?: true
    rating?: true
    openingNr?: true
    moveNr?: true
  }

  export type TacticMaxAggregateInputType = {
    id?: true
    fen?: true
    rating?: true
    openingNr?: true
    moveNr?: true
  }

  export type TacticCountAggregateInputType = {
    id?: true
    fen?: true
    rating?: true
    openingNr?: true
    moveNr?: true
    _all?: true
  }

  export type TacticAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Tactic to aggregate.
     */
    where?: TacticWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Tactics to fetch.
     */
    orderBy?: TacticOrderByWithRelationInput | TacticOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: TacticWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Tactics from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Tactics.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Tactics
    **/
    _count?: true | TacticCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: TacticAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: TacticSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: TacticMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: TacticMaxAggregateInputType
  }

  export type GetTacticAggregateType<T extends TacticAggregateArgs> = {
        [P in keyof T & keyof AggregateTactic]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateTactic[P]>
      : GetScalarType<T[P], AggregateTactic[P]>
  }




  export type TacticGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: TacticWhereInput
    orderBy?: TacticOrderByWithAggregationInput | TacticOrderByWithAggregationInput[]
    by: TacticScalarFieldEnum[] | TacticScalarFieldEnum
    having?: TacticScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: TacticCountAggregateInputType | true
    _avg?: TacticAvgAggregateInputType
    _sum?: TacticSumAggregateInputType
    _min?: TacticMinAggregateInputType
    _max?: TacticMaxAggregateInputType
  }

  export type TacticGroupByOutputType = {
    id: number
    fen: string
    rating: number
    openingNr: number
    moveNr: number
    _count: TacticCountAggregateOutputType | null
    _avg: TacticAvgAggregateOutputType | null
    _sum: TacticSumAggregateOutputType | null
    _min: TacticMinAggregateOutputType | null
    _max: TacticMaxAggregateOutputType | null
  }

  type GetTacticGroupByPayload<T extends TacticGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<TacticGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof TacticGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], TacticGroupByOutputType[P]>
            : GetScalarType<T[P], TacticGroupByOutputType[P]>
        }
      >
    >


  export type TacticSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    fen?: boolean
    rating?: boolean
    openingNr?: boolean
    moveNr?: boolean
    userTactic?: boolean | Tactic$userTacticArgs<ExtArgs>
    _count?: boolean | TacticCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["tactic"]>

  export type TacticSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    fen?: boolean
    rating?: boolean
    openingNr?: boolean
    moveNr?: boolean
  }, ExtArgs["result"]["tactic"]>

  export type TacticSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    fen?: boolean
    rating?: boolean
    openingNr?: boolean
    moveNr?: boolean
  }, ExtArgs["result"]["tactic"]>

  export type TacticSelectScalar = {
    id?: boolean
    fen?: boolean
    rating?: boolean
    openingNr?: boolean
    moveNr?: boolean
  }

  export type TacticOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "fen" | "rating" | "openingNr" | "moveNr", ExtArgs["result"]["tactic"]>
  export type TacticInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    userTactic?: boolean | Tactic$userTacticArgs<ExtArgs>
    _count?: boolean | TacticCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type TacticIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}
  export type TacticIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $TacticPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Tactic"
    objects: {
      userTactic: Prisma.$UserTacticPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: number
      fen: string
      rating: number
      openingNr: number
      moveNr: number
    }, ExtArgs["result"]["tactic"]>
    composites: {}
  }

  type TacticGetPayload<S extends boolean | null | undefined | TacticDefaultArgs> = $Result.GetResult<Prisma.$TacticPayload, S>

  type TacticCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<TacticFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: TacticCountAggregateInputType | true
    }

  export interface TacticDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Tactic'], meta: { name: 'Tactic' } }
    /**
     * Find zero or one Tactic that matches the filter.
     * @param {TacticFindUniqueArgs} args - Arguments to find a Tactic
     * @example
     * // Get one Tactic
     * const tactic = await prisma.tactic.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends TacticFindUniqueArgs>(args: SelectSubset<T, TacticFindUniqueArgs<ExtArgs>>): Prisma__TacticClient<$Result.GetResult<Prisma.$TacticPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Tactic that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {TacticFindUniqueOrThrowArgs} args - Arguments to find a Tactic
     * @example
     * // Get one Tactic
     * const tactic = await prisma.tactic.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends TacticFindUniqueOrThrowArgs>(args: SelectSubset<T, TacticFindUniqueOrThrowArgs<ExtArgs>>): Prisma__TacticClient<$Result.GetResult<Prisma.$TacticPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Tactic that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TacticFindFirstArgs} args - Arguments to find a Tactic
     * @example
     * // Get one Tactic
     * const tactic = await prisma.tactic.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends TacticFindFirstArgs>(args?: SelectSubset<T, TacticFindFirstArgs<ExtArgs>>): Prisma__TacticClient<$Result.GetResult<Prisma.$TacticPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Tactic that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TacticFindFirstOrThrowArgs} args - Arguments to find a Tactic
     * @example
     * // Get one Tactic
     * const tactic = await prisma.tactic.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends TacticFindFirstOrThrowArgs>(args?: SelectSubset<T, TacticFindFirstOrThrowArgs<ExtArgs>>): Prisma__TacticClient<$Result.GetResult<Prisma.$TacticPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Tactics that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TacticFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Tactics
     * const tactics = await prisma.tactic.findMany()
     * 
     * // Get first 10 Tactics
     * const tactics = await prisma.tactic.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const tacticWithIdOnly = await prisma.tactic.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends TacticFindManyArgs>(args?: SelectSubset<T, TacticFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TacticPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Tactic.
     * @param {TacticCreateArgs} args - Arguments to create a Tactic.
     * @example
     * // Create one Tactic
     * const Tactic = await prisma.tactic.create({
     *   data: {
     *     // ... data to create a Tactic
     *   }
     * })
     * 
     */
    create<T extends TacticCreateArgs>(args: SelectSubset<T, TacticCreateArgs<ExtArgs>>): Prisma__TacticClient<$Result.GetResult<Prisma.$TacticPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Tactics.
     * @param {TacticCreateManyArgs} args - Arguments to create many Tactics.
     * @example
     * // Create many Tactics
     * const tactic = await prisma.tactic.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends TacticCreateManyArgs>(args?: SelectSubset<T, TacticCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Tactics and returns the data saved in the database.
     * @param {TacticCreateManyAndReturnArgs} args - Arguments to create many Tactics.
     * @example
     * // Create many Tactics
     * const tactic = await prisma.tactic.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Tactics and only return the `id`
     * const tacticWithIdOnly = await prisma.tactic.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends TacticCreateManyAndReturnArgs>(args?: SelectSubset<T, TacticCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TacticPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Tactic.
     * @param {TacticDeleteArgs} args - Arguments to delete one Tactic.
     * @example
     * // Delete one Tactic
     * const Tactic = await prisma.tactic.delete({
     *   where: {
     *     // ... filter to delete one Tactic
     *   }
     * })
     * 
     */
    delete<T extends TacticDeleteArgs>(args: SelectSubset<T, TacticDeleteArgs<ExtArgs>>): Prisma__TacticClient<$Result.GetResult<Prisma.$TacticPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Tactic.
     * @param {TacticUpdateArgs} args - Arguments to update one Tactic.
     * @example
     * // Update one Tactic
     * const tactic = await prisma.tactic.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends TacticUpdateArgs>(args: SelectSubset<T, TacticUpdateArgs<ExtArgs>>): Prisma__TacticClient<$Result.GetResult<Prisma.$TacticPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Tactics.
     * @param {TacticDeleteManyArgs} args - Arguments to filter Tactics to delete.
     * @example
     * // Delete a few Tactics
     * const { count } = await prisma.tactic.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends TacticDeleteManyArgs>(args?: SelectSubset<T, TacticDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Tactics.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TacticUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Tactics
     * const tactic = await prisma.tactic.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends TacticUpdateManyArgs>(args: SelectSubset<T, TacticUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Tactics and returns the data updated in the database.
     * @param {TacticUpdateManyAndReturnArgs} args - Arguments to update many Tactics.
     * @example
     * // Update many Tactics
     * const tactic = await prisma.tactic.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Tactics and only return the `id`
     * const tacticWithIdOnly = await prisma.tactic.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends TacticUpdateManyAndReturnArgs>(args: SelectSubset<T, TacticUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TacticPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Tactic.
     * @param {TacticUpsertArgs} args - Arguments to update or create a Tactic.
     * @example
     * // Update or create a Tactic
     * const tactic = await prisma.tactic.upsert({
     *   create: {
     *     // ... data to create a Tactic
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Tactic we want to update
     *   }
     * })
     */
    upsert<T extends TacticUpsertArgs>(args: SelectSubset<T, TacticUpsertArgs<ExtArgs>>): Prisma__TacticClient<$Result.GetResult<Prisma.$TacticPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Tactics.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TacticCountArgs} args - Arguments to filter Tactics to count.
     * @example
     * // Count the number of Tactics
     * const count = await prisma.tactic.count({
     *   where: {
     *     // ... the filter for the Tactics we want to count
     *   }
     * })
    **/
    count<T extends TacticCountArgs>(
      args?: Subset<T, TacticCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], TacticCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Tactic.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TacticAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends TacticAggregateArgs>(args: Subset<T, TacticAggregateArgs>): Prisma.PrismaPromise<GetTacticAggregateType<T>>

    /**
     * Group by Tactic.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TacticGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends TacticGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: TacticGroupByArgs['orderBy'] }
        : { orderBy?: TacticGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, TacticGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetTacticGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Tactic model
   */
  readonly fields: TacticFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Tactic.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__TacticClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    userTactic<T extends Tactic$userTacticArgs<ExtArgs> = {}>(args?: Subset<T, Tactic$userTacticArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserTacticPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Tactic model
   */
  interface TacticFieldRefs {
    readonly id: FieldRef<"Tactic", 'Int'>
    readonly fen: FieldRef<"Tactic", 'String'>
    readonly rating: FieldRef<"Tactic", 'Int'>
    readonly openingNr: FieldRef<"Tactic", 'Int'>
    readonly moveNr: FieldRef<"Tactic", 'Int'>
  }
    

  // Custom InputTypes
  /**
   * Tactic findUnique
   */
  export type TacticFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tactic
     */
    select?: TacticSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Tactic
     */
    omit?: TacticOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TacticInclude<ExtArgs> | null
    /**
     * Filter, which Tactic to fetch.
     */
    where: TacticWhereUniqueInput
  }

  /**
   * Tactic findUniqueOrThrow
   */
  export type TacticFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tactic
     */
    select?: TacticSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Tactic
     */
    omit?: TacticOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TacticInclude<ExtArgs> | null
    /**
     * Filter, which Tactic to fetch.
     */
    where: TacticWhereUniqueInput
  }

  /**
   * Tactic findFirst
   */
  export type TacticFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tactic
     */
    select?: TacticSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Tactic
     */
    omit?: TacticOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TacticInclude<ExtArgs> | null
    /**
     * Filter, which Tactic to fetch.
     */
    where?: TacticWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Tactics to fetch.
     */
    orderBy?: TacticOrderByWithRelationInput | TacticOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Tactics.
     */
    cursor?: TacticWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Tactics from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Tactics.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Tactics.
     */
    distinct?: TacticScalarFieldEnum | TacticScalarFieldEnum[]
  }

  /**
   * Tactic findFirstOrThrow
   */
  export type TacticFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tactic
     */
    select?: TacticSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Tactic
     */
    omit?: TacticOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TacticInclude<ExtArgs> | null
    /**
     * Filter, which Tactic to fetch.
     */
    where?: TacticWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Tactics to fetch.
     */
    orderBy?: TacticOrderByWithRelationInput | TacticOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Tactics.
     */
    cursor?: TacticWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Tactics from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Tactics.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Tactics.
     */
    distinct?: TacticScalarFieldEnum | TacticScalarFieldEnum[]
  }

  /**
   * Tactic findMany
   */
  export type TacticFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tactic
     */
    select?: TacticSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Tactic
     */
    omit?: TacticOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TacticInclude<ExtArgs> | null
    /**
     * Filter, which Tactics to fetch.
     */
    where?: TacticWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Tactics to fetch.
     */
    orderBy?: TacticOrderByWithRelationInput | TacticOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Tactics.
     */
    cursor?: TacticWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Tactics from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Tactics.
     */
    skip?: number
    distinct?: TacticScalarFieldEnum | TacticScalarFieldEnum[]
  }

  /**
   * Tactic create
   */
  export type TacticCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tactic
     */
    select?: TacticSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Tactic
     */
    omit?: TacticOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TacticInclude<ExtArgs> | null
    /**
     * The data needed to create a Tactic.
     */
    data: XOR<TacticCreateInput, TacticUncheckedCreateInput>
  }

  /**
   * Tactic createMany
   */
  export type TacticCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Tactics.
     */
    data: TacticCreateManyInput | TacticCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Tactic createManyAndReturn
   */
  export type TacticCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tactic
     */
    select?: TacticSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Tactic
     */
    omit?: TacticOmit<ExtArgs> | null
    /**
     * The data used to create many Tactics.
     */
    data: TacticCreateManyInput | TacticCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Tactic update
   */
  export type TacticUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tactic
     */
    select?: TacticSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Tactic
     */
    omit?: TacticOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TacticInclude<ExtArgs> | null
    /**
     * The data needed to update a Tactic.
     */
    data: XOR<TacticUpdateInput, TacticUncheckedUpdateInput>
    /**
     * Choose, which Tactic to update.
     */
    where: TacticWhereUniqueInput
  }

  /**
   * Tactic updateMany
   */
  export type TacticUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Tactics.
     */
    data: XOR<TacticUpdateManyMutationInput, TacticUncheckedUpdateManyInput>
    /**
     * Filter which Tactics to update
     */
    where?: TacticWhereInput
    /**
     * Limit how many Tactics to update.
     */
    limit?: number
  }

  /**
   * Tactic updateManyAndReturn
   */
  export type TacticUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tactic
     */
    select?: TacticSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Tactic
     */
    omit?: TacticOmit<ExtArgs> | null
    /**
     * The data used to update Tactics.
     */
    data: XOR<TacticUpdateManyMutationInput, TacticUncheckedUpdateManyInput>
    /**
     * Filter which Tactics to update
     */
    where?: TacticWhereInput
    /**
     * Limit how many Tactics to update.
     */
    limit?: number
  }

  /**
   * Tactic upsert
   */
  export type TacticUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tactic
     */
    select?: TacticSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Tactic
     */
    omit?: TacticOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TacticInclude<ExtArgs> | null
    /**
     * The filter to search for the Tactic to update in case it exists.
     */
    where: TacticWhereUniqueInput
    /**
     * In case the Tactic found by the `where` argument doesn't exist, create a new Tactic with this data.
     */
    create: XOR<TacticCreateInput, TacticUncheckedCreateInput>
    /**
     * In case the Tactic was found with the provided `where` argument, update it with this data.
     */
    update: XOR<TacticUpdateInput, TacticUncheckedUpdateInput>
  }

  /**
   * Tactic delete
   */
  export type TacticDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tactic
     */
    select?: TacticSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Tactic
     */
    omit?: TacticOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TacticInclude<ExtArgs> | null
    /**
     * Filter which Tactic to delete.
     */
    where: TacticWhereUniqueInput
  }

  /**
   * Tactic deleteMany
   */
  export type TacticDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Tactics to delete
     */
    where?: TacticWhereInput
    /**
     * Limit how many Tactics to delete.
     */
    limit?: number
  }

  /**
   * Tactic.userTactic
   */
  export type Tactic$userTacticArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserTactic
     */
    select?: UserTacticSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserTactic
     */
    omit?: UserTacticOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserTacticInclude<ExtArgs> | null
    where?: UserTacticWhereInput
    orderBy?: UserTacticOrderByWithRelationInput | UserTacticOrderByWithRelationInput[]
    cursor?: UserTacticWhereUniqueInput
    take?: number
    skip?: number
    distinct?: UserTacticScalarFieldEnum | UserTacticScalarFieldEnum[]
  }

  /**
   * Tactic without action
   */
  export type TacticDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tactic
     */
    select?: TacticSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Tactic
     */
    omit?: TacticOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TacticInclude<ExtArgs> | null
  }


  /**
   * Model UserTactic
   */

  export type AggregateUserTactic = {
    _count: UserTacticCountAggregateOutputType | null
    _avg: UserTacticAvgAggregateOutputType | null
    _sum: UserTacticSumAggregateOutputType | null
    _min: UserTacticMinAggregateOutputType | null
    _max: UserTacticMaxAggregateOutputType | null
  }

  export type UserTacticAvgAggregateOutputType = {
    tacticId: number | null
  }

  export type UserTacticSumAggregateOutputType = {
    tacticId: number | null
  }

  export type UserTacticMinAggregateOutputType = {
    id: string | null
    userId: string | null
    tacticId: number | null
    solved: boolean | null
    finished: Date | null
  }

  export type UserTacticMaxAggregateOutputType = {
    id: string | null
    userId: string | null
    tacticId: number | null
    solved: boolean | null
    finished: Date | null
  }

  export type UserTacticCountAggregateOutputType = {
    id: number
    userId: number
    tacticId: number
    solved: number
    finished: number
    _all: number
  }


  export type UserTacticAvgAggregateInputType = {
    tacticId?: true
  }

  export type UserTacticSumAggregateInputType = {
    tacticId?: true
  }

  export type UserTacticMinAggregateInputType = {
    id?: true
    userId?: true
    tacticId?: true
    solved?: true
    finished?: true
  }

  export type UserTacticMaxAggregateInputType = {
    id?: true
    userId?: true
    tacticId?: true
    solved?: true
    finished?: true
  }

  export type UserTacticCountAggregateInputType = {
    id?: true
    userId?: true
    tacticId?: true
    solved?: true
    finished?: true
    _all?: true
  }

  export type UserTacticAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which UserTactic to aggregate.
     */
    where?: UserTacticWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of UserTactics to fetch.
     */
    orderBy?: UserTacticOrderByWithRelationInput | UserTacticOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: UserTacticWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` UserTactics from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` UserTactics.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned UserTactics
    **/
    _count?: true | UserTacticCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: UserTacticAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: UserTacticSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: UserTacticMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: UserTacticMaxAggregateInputType
  }

  export type GetUserTacticAggregateType<T extends UserTacticAggregateArgs> = {
        [P in keyof T & keyof AggregateUserTactic]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateUserTactic[P]>
      : GetScalarType<T[P], AggregateUserTactic[P]>
  }




  export type UserTacticGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: UserTacticWhereInput
    orderBy?: UserTacticOrderByWithAggregationInput | UserTacticOrderByWithAggregationInput[]
    by: UserTacticScalarFieldEnum[] | UserTacticScalarFieldEnum
    having?: UserTacticScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: UserTacticCountAggregateInputType | true
    _avg?: UserTacticAvgAggregateInputType
    _sum?: UserTacticSumAggregateInputType
    _min?: UserTacticMinAggregateInputType
    _max?: UserTacticMaxAggregateInputType
  }

  export type UserTacticGroupByOutputType = {
    id: string
    userId: string
    tacticId: number
    solved: boolean | null
    finished: Date | null
    _count: UserTacticCountAggregateOutputType | null
    _avg: UserTacticAvgAggregateOutputType | null
    _sum: UserTacticSumAggregateOutputType | null
    _min: UserTacticMinAggregateOutputType | null
    _max: UserTacticMaxAggregateOutputType | null
  }

  type GetUserTacticGroupByPayload<T extends UserTacticGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<UserTacticGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof UserTacticGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], UserTacticGroupByOutputType[P]>
            : GetScalarType<T[P], UserTacticGroupByOutputType[P]>
        }
      >
    >


  export type UserTacticSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    tacticId?: boolean
    solved?: boolean
    finished?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
    tactic?: boolean | TacticDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["userTactic"]>

  export type UserTacticSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    tacticId?: boolean
    solved?: boolean
    finished?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
    tactic?: boolean | TacticDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["userTactic"]>

  export type UserTacticSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    tacticId?: boolean
    solved?: boolean
    finished?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
    tactic?: boolean | TacticDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["userTactic"]>

  export type UserTacticSelectScalar = {
    id?: boolean
    userId?: boolean
    tacticId?: boolean
    solved?: boolean
    finished?: boolean
  }

  export type UserTacticOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "userId" | "tacticId" | "solved" | "finished", ExtArgs["result"]["userTactic"]>
  export type UserTacticInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
    tactic?: boolean | TacticDefaultArgs<ExtArgs>
  }
  export type UserTacticIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
    tactic?: boolean | TacticDefaultArgs<ExtArgs>
  }
  export type UserTacticIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
    tactic?: boolean | TacticDefaultArgs<ExtArgs>
  }

  export type $UserTacticPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "UserTactic"
    objects: {
      user: Prisma.$UserPayload<ExtArgs>
      tactic: Prisma.$TacticPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      userId: string
      tacticId: number
      solved: boolean | null
      finished: Date | null
    }, ExtArgs["result"]["userTactic"]>
    composites: {}
  }

  type UserTacticGetPayload<S extends boolean | null | undefined | UserTacticDefaultArgs> = $Result.GetResult<Prisma.$UserTacticPayload, S>

  type UserTacticCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<UserTacticFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: UserTacticCountAggregateInputType | true
    }

  export interface UserTacticDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['UserTactic'], meta: { name: 'UserTactic' } }
    /**
     * Find zero or one UserTactic that matches the filter.
     * @param {UserTacticFindUniqueArgs} args - Arguments to find a UserTactic
     * @example
     * // Get one UserTactic
     * const userTactic = await prisma.userTactic.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends UserTacticFindUniqueArgs>(args: SelectSubset<T, UserTacticFindUniqueArgs<ExtArgs>>): Prisma__UserTacticClient<$Result.GetResult<Prisma.$UserTacticPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one UserTactic that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {UserTacticFindUniqueOrThrowArgs} args - Arguments to find a UserTactic
     * @example
     * // Get one UserTactic
     * const userTactic = await prisma.userTactic.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends UserTacticFindUniqueOrThrowArgs>(args: SelectSubset<T, UserTacticFindUniqueOrThrowArgs<ExtArgs>>): Prisma__UserTacticClient<$Result.GetResult<Prisma.$UserTacticPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first UserTactic that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserTacticFindFirstArgs} args - Arguments to find a UserTactic
     * @example
     * // Get one UserTactic
     * const userTactic = await prisma.userTactic.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends UserTacticFindFirstArgs>(args?: SelectSubset<T, UserTacticFindFirstArgs<ExtArgs>>): Prisma__UserTacticClient<$Result.GetResult<Prisma.$UserTacticPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first UserTactic that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserTacticFindFirstOrThrowArgs} args - Arguments to find a UserTactic
     * @example
     * // Get one UserTactic
     * const userTactic = await prisma.userTactic.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends UserTacticFindFirstOrThrowArgs>(args?: SelectSubset<T, UserTacticFindFirstOrThrowArgs<ExtArgs>>): Prisma__UserTacticClient<$Result.GetResult<Prisma.$UserTacticPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more UserTactics that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserTacticFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all UserTactics
     * const userTactics = await prisma.userTactic.findMany()
     * 
     * // Get first 10 UserTactics
     * const userTactics = await prisma.userTactic.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const userTacticWithIdOnly = await prisma.userTactic.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends UserTacticFindManyArgs>(args?: SelectSubset<T, UserTacticFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserTacticPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a UserTactic.
     * @param {UserTacticCreateArgs} args - Arguments to create a UserTactic.
     * @example
     * // Create one UserTactic
     * const UserTactic = await prisma.userTactic.create({
     *   data: {
     *     // ... data to create a UserTactic
     *   }
     * })
     * 
     */
    create<T extends UserTacticCreateArgs>(args: SelectSubset<T, UserTacticCreateArgs<ExtArgs>>): Prisma__UserTacticClient<$Result.GetResult<Prisma.$UserTacticPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many UserTactics.
     * @param {UserTacticCreateManyArgs} args - Arguments to create many UserTactics.
     * @example
     * // Create many UserTactics
     * const userTactic = await prisma.userTactic.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends UserTacticCreateManyArgs>(args?: SelectSubset<T, UserTacticCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many UserTactics and returns the data saved in the database.
     * @param {UserTacticCreateManyAndReturnArgs} args - Arguments to create many UserTactics.
     * @example
     * // Create many UserTactics
     * const userTactic = await prisma.userTactic.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many UserTactics and only return the `id`
     * const userTacticWithIdOnly = await prisma.userTactic.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends UserTacticCreateManyAndReturnArgs>(args?: SelectSubset<T, UserTacticCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserTacticPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a UserTactic.
     * @param {UserTacticDeleteArgs} args - Arguments to delete one UserTactic.
     * @example
     * // Delete one UserTactic
     * const UserTactic = await prisma.userTactic.delete({
     *   where: {
     *     // ... filter to delete one UserTactic
     *   }
     * })
     * 
     */
    delete<T extends UserTacticDeleteArgs>(args: SelectSubset<T, UserTacticDeleteArgs<ExtArgs>>): Prisma__UserTacticClient<$Result.GetResult<Prisma.$UserTacticPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one UserTactic.
     * @param {UserTacticUpdateArgs} args - Arguments to update one UserTactic.
     * @example
     * // Update one UserTactic
     * const userTactic = await prisma.userTactic.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends UserTacticUpdateArgs>(args: SelectSubset<T, UserTacticUpdateArgs<ExtArgs>>): Prisma__UserTacticClient<$Result.GetResult<Prisma.$UserTacticPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more UserTactics.
     * @param {UserTacticDeleteManyArgs} args - Arguments to filter UserTactics to delete.
     * @example
     * // Delete a few UserTactics
     * const { count } = await prisma.userTactic.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends UserTacticDeleteManyArgs>(args?: SelectSubset<T, UserTacticDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more UserTactics.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserTacticUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many UserTactics
     * const userTactic = await prisma.userTactic.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends UserTacticUpdateManyArgs>(args: SelectSubset<T, UserTacticUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more UserTactics and returns the data updated in the database.
     * @param {UserTacticUpdateManyAndReturnArgs} args - Arguments to update many UserTactics.
     * @example
     * // Update many UserTactics
     * const userTactic = await prisma.userTactic.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more UserTactics and only return the `id`
     * const userTacticWithIdOnly = await prisma.userTactic.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends UserTacticUpdateManyAndReturnArgs>(args: SelectSubset<T, UserTacticUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserTacticPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one UserTactic.
     * @param {UserTacticUpsertArgs} args - Arguments to update or create a UserTactic.
     * @example
     * // Update or create a UserTactic
     * const userTactic = await prisma.userTactic.upsert({
     *   create: {
     *     // ... data to create a UserTactic
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the UserTactic we want to update
     *   }
     * })
     */
    upsert<T extends UserTacticUpsertArgs>(args: SelectSubset<T, UserTacticUpsertArgs<ExtArgs>>): Prisma__UserTacticClient<$Result.GetResult<Prisma.$UserTacticPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of UserTactics.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserTacticCountArgs} args - Arguments to filter UserTactics to count.
     * @example
     * // Count the number of UserTactics
     * const count = await prisma.userTactic.count({
     *   where: {
     *     // ... the filter for the UserTactics we want to count
     *   }
     * })
    **/
    count<T extends UserTacticCountArgs>(
      args?: Subset<T, UserTacticCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], UserTacticCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a UserTactic.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserTacticAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends UserTacticAggregateArgs>(args: Subset<T, UserTacticAggregateArgs>): Prisma.PrismaPromise<GetUserTacticAggregateType<T>>

    /**
     * Group by UserTactic.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserTacticGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends UserTacticGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: UserTacticGroupByArgs['orderBy'] }
        : { orderBy?: UserTacticGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, UserTacticGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetUserTacticGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the UserTactic model
   */
  readonly fields: UserTacticFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for UserTactic.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__UserTacticClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    user<T extends UserDefaultArgs<ExtArgs> = {}>(args?: Subset<T, UserDefaultArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    tactic<T extends TacticDefaultArgs<ExtArgs> = {}>(args?: Subset<T, TacticDefaultArgs<ExtArgs>>): Prisma__TacticClient<$Result.GetResult<Prisma.$TacticPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the UserTactic model
   */
  interface UserTacticFieldRefs {
    readonly id: FieldRef<"UserTactic", 'String'>
    readonly userId: FieldRef<"UserTactic", 'String'>
    readonly tacticId: FieldRef<"UserTactic", 'Int'>
    readonly solved: FieldRef<"UserTactic", 'Boolean'>
    readonly finished: FieldRef<"UserTactic", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * UserTactic findUnique
   */
  export type UserTacticFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserTactic
     */
    select?: UserTacticSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserTactic
     */
    omit?: UserTacticOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserTacticInclude<ExtArgs> | null
    /**
     * Filter, which UserTactic to fetch.
     */
    where: UserTacticWhereUniqueInput
  }

  /**
   * UserTactic findUniqueOrThrow
   */
  export type UserTacticFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserTactic
     */
    select?: UserTacticSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserTactic
     */
    omit?: UserTacticOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserTacticInclude<ExtArgs> | null
    /**
     * Filter, which UserTactic to fetch.
     */
    where: UserTacticWhereUniqueInput
  }

  /**
   * UserTactic findFirst
   */
  export type UserTacticFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserTactic
     */
    select?: UserTacticSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserTactic
     */
    omit?: UserTacticOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserTacticInclude<ExtArgs> | null
    /**
     * Filter, which UserTactic to fetch.
     */
    where?: UserTacticWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of UserTactics to fetch.
     */
    orderBy?: UserTacticOrderByWithRelationInput | UserTacticOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for UserTactics.
     */
    cursor?: UserTacticWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` UserTactics from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` UserTactics.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of UserTactics.
     */
    distinct?: UserTacticScalarFieldEnum | UserTacticScalarFieldEnum[]
  }

  /**
   * UserTactic findFirstOrThrow
   */
  export type UserTacticFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserTactic
     */
    select?: UserTacticSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserTactic
     */
    omit?: UserTacticOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserTacticInclude<ExtArgs> | null
    /**
     * Filter, which UserTactic to fetch.
     */
    where?: UserTacticWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of UserTactics to fetch.
     */
    orderBy?: UserTacticOrderByWithRelationInput | UserTacticOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for UserTactics.
     */
    cursor?: UserTacticWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` UserTactics from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` UserTactics.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of UserTactics.
     */
    distinct?: UserTacticScalarFieldEnum | UserTacticScalarFieldEnum[]
  }

  /**
   * UserTactic findMany
   */
  export type UserTacticFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserTactic
     */
    select?: UserTacticSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserTactic
     */
    omit?: UserTacticOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserTacticInclude<ExtArgs> | null
    /**
     * Filter, which UserTactics to fetch.
     */
    where?: UserTacticWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of UserTactics to fetch.
     */
    orderBy?: UserTacticOrderByWithRelationInput | UserTacticOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing UserTactics.
     */
    cursor?: UserTacticWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` UserTactics from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` UserTactics.
     */
    skip?: number
    distinct?: UserTacticScalarFieldEnum | UserTacticScalarFieldEnum[]
  }

  /**
   * UserTactic create
   */
  export type UserTacticCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserTactic
     */
    select?: UserTacticSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserTactic
     */
    omit?: UserTacticOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserTacticInclude<ExtArgs> | null
    /**
     * The data needed to create a UserTactic.
     */
    data: XOR<UserTacticCreateInput, UserTacticUncheckedCreateInput>
  }

  /**
   * UserTactic createMany
   */
  export type UserTacticCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many UserTactics.
     */
    data: UserTacticCreateManyInput | UserTacticCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * UserTactic createManyAndReturn
   */
  export type UserTacticCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserTactic
     */
    select?: UserTacticSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the UserTactic
     */
    omit?: UserTacticOmit<ExtArgs> | null
    /**
     * The data used to create many UserTactics.
     */
    data: UserTacticCreateManyInput | UserTacticCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserTacticIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * UserTactic update
   */
  export type UserTacticUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserTactic
     */
    select?: UserTacticSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserTactic
     */
    omit?: UserTacticOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserTacticInclude<ExtArgs> | null
    /**
     * The data needed to update a UserTactic.
     */
    data: XOR<UserTacticUpdateInput, UserTacticUncheckedUpdateInput>
    /**
     * Choose, which UserTactic to update.
     */
    where: UserTacticWhereUniqueInput
  }

  /**
   * UserTactic updateMany
   */
  export type UserTacticUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update UserTactics.
     */
    data: XOR<UserTacticUpdateManyMutationInput, UserTacticUncheckedUpdateManyInput>
    /**
     * Filter which UserTactics to update
     */
    where?: UserTacticWhereInput
    /**
     * Limit how many UserTactics to update.
     */
    limit?: number
  }

  /**
   * UserTactic updateManyAndReturn
   */
  export type UserTacticUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserTactic
     */
    select?: UserTacticSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the UserTactic
     */
    omit?: UserTacticOmit<ExtArgs> | null
    /**
     * The data used to update UserTactics.
     */
    data: XOR<UserTacticUpdateManyMutationInput, UserTacticUncheckedUpdateManyInput>
    /**
     * Filter which UserTactics to update
     */
    where?: UserTacticWhereInput
    /**
     * Limit how many UserTactics to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserTacticIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * UserTactic upsert
   */
  export type UserTacticUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserTactic
     */
    select?: UserTacticSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserTactic
     */
    omit?: UserTacticOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserTacticInclude<ExtArgs> | null
    /**
     * The filter to search for the UserTactic to update in case it exists.
     */
    where: UserTacticWhereUniqueInput
    /**
     * In case the UserTactic found by the `where` argument doesn't exist, create a new UserTactic with this data.
     */
    create: XOR<UserTacticCreateInput, UserTacticUncheckedCreateInput>
    /**
     * In case the UserTactic was found with the provided `where` argument, update it with this data.
     */
    update: XOR<UserTacticUpdateInput, UserTacticUncheckedUpdateInput>
  }

  /**
   * UserTactic delete
   */
  export type UserTacticDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserTactic
     */
    select?: UserTacticSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserTactic
     */
    omit?: UserTacticOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserTacticInclude<ExtArgs> | null
    /**
     * Filter which UserTactic to delete.
     */
    where: UserTacticWhereUniqueInput
  }

  /**
   * UserTactic deleteMany
   */
  export type UserTacticDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which UserTactics to delete
     */
    where?: UserTacticWhereInput
    /**
     * Limit how many UserTactics to delete.
     */
    limit?: number
  }

  /**
   * UserTactic without action
   */
  export type UserTacticDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserTactic
     */
    select?: UserTacticSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserTactic
     */
    omit?: UserTacticOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserTacticInclude<ExtArgs> | null
  }


  /**
   * Model UserOpening
   */

  export type AggregateUserOpening = {
    _count: UserOpeningCountAggregateOutputType | null
    _avg: UserOpeningAvgAggregateOutputType | null
    _sum: UserOpeningSumAggregateOutputType | null
    _min: UserOpeningMinAggregateOutputType | null
    _max: UserOpeningMaxAggregateOutputType | null
  }

  export type UserOpeningAvgAggregateOutputType = {
    openingNr: number | null
    evalCp: number | null
    evalHistory: number | null
  }

  export type UserOpeningSumAggregateOutputType = {
    openingNr: number | null
    evalCp: number | null
    evalHistory: number[]
  }

  export type UserOpeningMinAggregateOutputType = {
    id: string | null
    userId: string | null
    openingNr: number | null
    color: string | null
    pgn: string | null
    evalCp: number | null
    finished: Date | null
  }

  export type UserOpeningMaxAggregateOutputType = {
    id: string | null
    userId: string | null
    openingNr: number | null
    color: string | null
    pgn: string | null
    evalCp: number | null
    finished: Date | null
  }

  export type UserOpeningCountAggregateOutputType = {
    id: number
    userId: number
    openingNr: number
    color: number
    pgn: number
    evalCp: number
    finished: number
    evalHistory: number
    _all: number
  }


  export type UserOpeningAvgAggregateInputType = {
    openingNr?: true
    evalCp?: true
    evalHistory?: true
  }

  export type UserOpeningSumAggregateInputType = {
    openingNr?: true
    evalCp?: true
    evalHistory?: true
  }

  export type UserOpeningMinAggregateInputType = {
    id?: true
    userId?: true
    openingNr?: true
    color?: true
    pgn?: true
    evalCp?: true
    finished?: true
  }

  export type UserOpeningMaxAggregateInputType = {
    id?: true
    userId?: true
    openingNr?: true
    color?: true
    pgn?: true
    evalCp?: true
    finished?: true
  }

  export type UserOpeningCountAggregateInputType = {
    id?: true
    userId?: true
    openingNr?: true
    color?: true
    pgn?: true
    evalCp?: true
    finished?: true
    evalHistory?: true
    _all?: true
  }

  export type UserOpeningAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which UserOpening to aggregate.
     */
    where?: UserOpeningWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of UserOpenings to fetch.
     */
    orderBy?: UserOpeningOrderByWithRelationInput | UserOpeningOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: UserOpeningWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` UserOpenings from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` UserOpenings.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned UserOpenings
    **/
    _count?: true | UserOpeningCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: UserOpeningAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: UserOpeningSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: UserOpeningMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: UserOpeningMaxAggregateInputType
  }

  export type GetUserOpeningAggregateType<T extends UserOpeningAggregateArgs> = {
        [P in keyof T & keyof AggregateUserOpening]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateUserOpening[P]>
      : GetScalarType<T[P], AggregateUserOpening[P]>
  }




  export type UserOpeningGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: UserOpeningWhereInput
    orderBy?: UserOpeningOrderByWithAggregationInput | UserOpeningOrderByWithAggregationInput[]
    by: UserOpeningScalarFieldEnum[] | UserOpeningScalarFieldEnum
    having?: UserOpeningScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: UserOpeningCountAggregateInputType | true
    _avg?: UserOpeningAvgAggregateInputType
    _sum?: UserOpeningSumAggregateInputType
    _min?: UserOpeningMinAggregateInputType
    _max?: UserOpeningMaxAggregateInputType
  }

  export type UserOpeningGroupByOutputType = {
    id: string
    userId: string
    openingNr: number
    color: string
    pgn: string | null
    evalCp: number | null
    finished: Date | null
    evalHistory: number[]
    _count: UserOpeningCountAggregateOutputType | null
    _avg: UserOpeningAvgAggregateOutputType | null
    _sum: UserOpeningSumAggregateOutputType | null
    _min: UserOpeningMinAggregateOutputType | null
    _max: UserOpeningMaxAggregateOutputType | null
  }

  type GetUserOpeningGroupByPayload<T extends UserOpeningGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<UserOpeningGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof UserOpeningGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], UserOpeningGroupByOutputType[P]>
            : GetScalarType<T[P], UserOpeningGroupByOutputType[P]>
        }
      >
    >


  export type UserOpeningSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    openingNr?: boolean
    color?: boolean
    pgn?: boolean
    evalCp?: boolean
    finished?: boolean
    evalHistory?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["userOpening"]>

  export type UserOpeningSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    openingNr?: boolean
    color?: boolean
    pgn?: boolean
    evalCp?: boolean
    finished?: boolean
    evalHistory?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["userOpening"]>

  export type UserOpeningSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    openingNr?: boolean
    color?: boolean
    pgn?: boolean
    evalCp?: boolean
    finished?: boolean
    evalHistory?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["userOpening"]>

  export type UserOpeningSelectScalar = {
    id?: boolean
    userId?: boolean
    openingNr?: boolean
    color?: boolean
    pgn?: boolean
    evalCp?: boolean
    finished?: boolean
    evalHistory?: boolean
  }

  export type UserOpeningOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "userId" | "openingNr" | "color" | "pgn" | "evalCp" | "finished" | "evalHistory", ExtArgs["result"]["userOpening"]>
  export type UserOpeningInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type UserOpeningIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type UserOpeningIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }

  export type $UserOpeningPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "UserOpening"
    objects: {
      user: Prisma.$UserPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      userId: string
      openingNr: number
      color: string
      pgn: string | null
      evalCp: number | null
      finished: Date | null
      evalHistory: number[]
    }, ExtArgs["result"]["userOpening"]>
    composites: {}
  }

  type UserOpeningGetPayload<S extends boolean | null | undefined | UserOpeningDefaultArgs> = $Result.GetResult<Prisma.$UserOpeningPayload, S>

  type UserOpeningCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<UserOpeningFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: UserOpeningCountAggregateInputType | true
    }

  export interface UserOpeningDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['UserOpening'], meta: { name: 'UserOpening' } }
    /**
     * Find zero or one UserOpening that matches the filter.
     * @param {UserOpeningFindUniqueArgs} args - Arguments to find a UserOpening
     * @example
     * // Get one UserOpening
     * const userOpening = await prisma.userOpening.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends UserOpeningFindUniqueArgs>(args: SelectSubset<T, UserOpeningFindUniqueArgs<ExtArgs>>): Prisma__UserOpeningClient<$Result.GetResult<Prisma.$UserOpeningPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one UserOpening that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {UserOpeningFindUniqueOrThrowArgs} args - Arguments to find a UserOpening
     * @example
     * // Get one UserOpening
     * const userOpening = await prisma.userOpening.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends UserOpeningFindUniqueOrThrowArgs>(args: SelectSubset<T, UserOpeningFindUniqueOrThrowArgs<ExtArgs>>): Prisma__UserOpeningClient<$Result.GetResult<Prisma.$UserOpeningPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first UserOpening that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserOpeningFindFirstArgs} args - Arguments to find a UserOpening
     * @example
     * // Get one UserOpening
     * const userOpening = await prisma.userOpening.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends UserOpeningFindFirstArgs>(args?: SelectSubset<T, UserOpeningFindFirstArgs<ExtArgs>>): Prisma__UserOpeningClient<$Result.GetResult<Prisma.$UserOpeningPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first UserOpening that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserOpeningFindFirstOrThrowArgs} args - Arguments to find a UserOpening
     * @example
     * // Get one UserOpening
     * const userOpening = await prisma.userOpening.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends UserOpeningFindFirstOrThrowArgs>(args?: SelectSubset<T, UserOpeningFindFirstOrThrowArgs<ExtArgs>>): Prisma__UserOpeningClient<$Result.GetResult<Prisma.$UserOpeningPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more UserOpenings that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserOpeningFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all UserOpenings
     * const userOpenings = await prisma.userOpening.findMany()
     * 
     * // Get first 10 UserOpenings
     * const userOpenings = await prisma.userOpening.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const userOpeningWithIdOnly = await prisma.userOpening.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends UserOpeningFindManyArgs>(args?: SelectSubset<T, UserOpeningFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserOpeningPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a UserOpening.
     * @param {UserOpeningCreateArgs} args - Arguments to create a UserOpening.
     * @example
     * // Create one UserOpening
     * const UserOpening = await prisma.userOpening.create({
     *   data: {
     *     // ... data to create a UserOpening
     *   }
     * })
     * 
     */
    create<T extends UserOpeningCreateArgs>(args: SelectSubset<T, UserOpeningCreateArgs<ExtArgs>>): Prisma__UserOpeningClient<$Result.GetResult<Prisma.$UserOpeningPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many UserOpenings.
     * @param {UserOpeningCreateManyArgs} args - Arguments to create many UserOpenings.
     * @example
     * // Create many UserOpenings
     * const userOpening = await prisma.userOpening.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends UserOpeningCreateManyArgs>(args?: SelectSubset<T, UserOpeningCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many UserOpenings and returns the data saved in the database.
     * @param {UserOpeningCreateManyAndReturnArgs} args - Arguments to create many UserOpenings.
     * @example
     * // Create many UserOpenings
     * const userOpening = await prisma.userOpening.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many UserOpenings and only return the `id`
     * const userOpeningWithIdOnly = await prisma.userOpening.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends UserOpeningCreateManyAndReturnArgs>(args?: SelectSubset<T, UserOpeningCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserOpeningPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a UserOpening.
     * @param {UserOpeningDeleteArgs} args - Arguments to delete one UserOpening.
     * @example
     * // Delete one UserOpening
     * const UserOpening = await prisma.userOpening.delete({
     *   where: {
     *     // ... filter to delete one UserOpening
     *   }
     * })
     * 
     */
    delete<T extends UserOpeningDeleteArgs>(args: SelectSubset<T, UserOpeningDeleteArgs<ExtArgs>>): Prisma__UserOpeningClient<$Result.GetResult<Prisma.$UserOpeningPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one UserOpening.
     * @param {UserOpeningUpdateArgs} args - Arguments to update one UserOpening.
     * @example
     * // Update one UserOpening
     * const userOpening = await prisma.userOpening.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends UserOpeningUpdateArgs>(args: SelectSubset<T, UserOpeningUpdateArgs<ExtArgs>>): Prisma__UserOpeningClient<$Result.GetResult<Prisma.$UserOpeningPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more UserOpenings.
     * @param {UserOpeningDeleteManyArgs} args - Arguments to filter UserOpenings to delete.
     * @example
     * // Delete a few UserOpenings
     * const { count } = await prisma.userOpening.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends UserOpeningDeleteManyArgs>(args?: SelectSubset<T, UserOpeningDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more UserOpenings.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserOpeningUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many UserOpenings
     * const userOpening = await prisma.userOpening.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends UserOpeningUpdateManyArgs>(args: SelectSubset<T, UserOpeningUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more UserOpenings and returns the data updated in the database.
     * @param {UserOpeningUpdateManyAndReturnArgs} args - Arguments to update many UserOpenings.
     * @example
     * // Update many UserOpenings
     * const userOpening = await prisma.userOpening.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more UserOpenings and only return the `id`
     * const userOpeningWithIdOnly = await prisma.userOpening.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends UserOpeningUpdateManyAndReturnArgs>(args: SelectSubset<T, UserOpeningUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserOpeningPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one UserOpening.
     * @param {UserOpeningUpsertArgs} args - Arguments to update or create a UserOpening.
     * @example
     * // Update or create a UserOpening
     * const userOpening = await prisma.userOpening.upsert({
     *   create: {
     *     // ... data to create a UserOpening
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the UserOpening we want to update
     *   }
     * })
     */
    upsert<T extends UserOpeningUpsertArgs>(args: SelectSubset<T, UserOpeningUpsertArgs<ExtArgs>>): Prisma__UserOpeningClient<$Result.GetResult<Prisma.$UserOpeningPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of UserOpenings.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserOpeningCountArgs} args - Arguments to filter UserOpenings to count.
     * @example
     * // Count the number of UserOpenings
     * const count = await prisma.userOpening.count({
     *   where: {
     *     // ... the filter for the UserOpenings we want to count
     *   }
     * })
    **/
    count<T extends UserOpeningCountArgs>(
      args?: Subset<T, UserOpeningCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], UserOpeningCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a UserOpening.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserOpeningAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends UserOpeningAggregateArgs>(args: Subset<T, UserOpeningAggregateArgs>): Prisma.PrismaPromise<GetUserOpeningAggregateType<T>>

    /**
     * Group by UserOpening.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserOpeningGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends UserOpeningGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: UserOpeningGroupByArgs['orderBy'] }
        : { orderBy?: UserOpeningGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, UserOpeningGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetUserOpeningGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the UserOpening model
   */
  readonly fields: UserOpeningFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for UserOpening.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__UserOpeningClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    user<T extends UserDefaultArgs<ExtArgs> = {}>(args?: Subset<T, UserDefaultArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the UserOpening model
   */
  interface UserOpeningFieldRefs {
    readonly id: FieldRef<"UserOpening", 'String'>
    readonly userId: FieldRef<"UserOpening", 'String'>
    readonly openingNr: FieldRef<"UserOpening", 'Int'>
    readonly color: FieldRef<"UserOpening", 'String'>
    readonly pgn: FieldRef<"UserOpening", 'String'>
    readonly evalCp: FieldRef<"UserOpening", 'Int'>
    readonly finished: FieldRef<"UserOpening", 'DateTime'>
    readonly evalHistory: FieldRef<"UserOpening", 'Int[]'>
  }
    

  // Custom InputTypes
  /**
   * UserOpening findUnique
   */
  export type UserOpeningFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserOpening
     */
    select?: UserOpeningSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserOpening
     */
    omit?: UserOpeningOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserOpeningInclude<ExtArgs> | null
    /**
     * Filter, which UserOpening to fetch.
     */
    where: UserOpeningWhereUniqueInput
  }

  /**
   * UserOpening findUniqueOrThrow
   */
  export type UserOpeningFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserOpening
     */
    select?: UserOpeningSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserOpening
     */
    omit?: UserOpeningOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserOpeningInclude<ExtArgs> | null
    /**
     * Filter, which UserOpening to fetch.
     */
    where: UserOpeningWhereUniqueInput
  }

  /**
   * UserOpening findFirst
   */
  export type UserOpeningFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserOpening
     */
    select?: UserOpeningSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserOpening
     */
    omit?: UserOpeningOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserOpeningInclude<ExtArgs> | null
    /**
     * Filter, which UserOpening to fetch.
     */
    where?: UserOpeningWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of UserOpenings to fetch.
     */
    orderBy?: UserOpeningOrderByWithRelationInput | UserOpeningOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for UserOpenings.
     */
    cursor?: UserOpeningWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` UserOpenings from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` UserOpenings.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of UserOpenings.
     */
    distinct?: UserOpeningScalarFieldEnum | UserOpeningScalarFieldEnum[]
  }

  /**
   * UserOpening findFirstOrThrow
   */
  export type UserOpeningFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserOpening
     */
    select?: UserOpeningSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserOpening
     */
    omit?: UserOpeningOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserOpeningInclude<ExtArgs> | null
    /**
     * Filter, which UserOpening to fetch.
     */
    where?: UserOpeningWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of UserOpenings to fetch.
     */
    orderBy?: UserOpeningOrderByWithRelationInput | UserOpeningOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for UserOpenings.
     */
    cursor?: UserOpeningWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` UserOpenings from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` UserOpenings.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of UserOpenings.
     */
    distinct?: UserOpeningScalarFieldEnum | UserOpeningScalarFieldEnum[]
  }

  /**
   * UserOpening findMany
   */
  export type UserOpeningFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserOpening
     */
    select?: UserOpeningSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserOpening
     */
    omit?: UserOpeningOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserOpeningInclude<ExtArgs> | null
    /**
     * Filter, which UserOpenings to fetch.
     */
    where?: UserOpeningWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of UserOpenings to fetch.
     */
    orderBy?: UserOpeningOrderByWithRelationInput | UserOpeningOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing UserOpenings.
     */
    cursor?: UserOpeningWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` UserOpenings from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` UserOpenings.
     */
    skip?: number
    distinct?: UserOpeningScalarFieldEnum | UserOpeningScalarFieldEnum[]
  }

  /**
   * UserOpening create
   */
  export type UserOpeningCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserOpening
     */
    select?: UserOpeningSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserOpening
     */
    omit?: UserOpeningOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserOpeningInclude<ExtArgs> | null
    /**
     * The data needed to create a UserOpening.
     */
    data: XOR<UserOpeningCreateInput, UserOpeningUncheckedCreateInput>
  }

  /**
   * UserOpening createMany
   */
  export type UserOpeningCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many UserOpenings.
     */
    data: UserOpeningCreateManyInput | UserOpeningCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * UserOpening createManyAndReturn
   */
  export type UserOpeningCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserOpening
     */
    select?: UserOpeningSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the UserOpening
     */
    omit?: UserOpeningOmit<ExtArgs> | null
    /**
     * The data used to create many UserOpenings.
     */
    data: UserOpeningCreateManyInput | UserOpeningCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserOpeningIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * UserOpening update
   */
  export type UserOpeningUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserOpening
     */
    select?: UserOpeningSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserOpening
     */
    omit?: UserOpeningOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserOpeningInclude<ExtArgs> | null
    /**
     * The data needed to update a UserOpening.
     */
    data: XOR<UserOpeningUpdateInput, UserOpeningUncheckedUpdateInput>
    /**
     * Choose, which UserOpening to update.
     */
    where: UserOpeningWhereUniqueInput
  }

  /**
   * UserOpening updateMany
   */
  export type UserOpeningUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update UserOpenings.
     */
    data: XOR<UserOpeningUpdateManyMutationInput, UserOpeningUncheckedUpdateManyInput>
    /**
     * Filter which UserOpenings to update
     */
    where?: UserOpeningWhereInput
    /**
     * Limit how many UserOpenings to update.
     */
    limit?: number
  }

  /**
   * UserOpening updateManyAndReturn
   */
  export type UserOpeningUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserOpening
     */
    select?: UserOpeningSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the UserOpening
     */
    omit?: UserOpeningOmit<ExtArgs> | null
    /**
     * The data used to update UserOpenings.
     */
    data: XOR<UserOpeningUpdateManyMutationInput, UserOpeningUncheckedUpdateManyInput>
    /**
     * Filter which UserOpenings to update
     */
    where?: UserOpeningWhereInput
    /**
     * Limit how many UserOpenings to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserOpeningIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * UserOpening upsert
   */
  export type UserOpeningUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserOpening
     */
    select?: UserOpeningSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserOpening
     */
    omit?: UserOpeningOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserOpeningInclude<ExtArgs> | null
    /**
     * The filter to search for the UserOpening to update in case it exists.
     */
    where: UserOpeningWhereUniqueInput
    /**
     * In case the UserOpening found by the `where` argument doesn't exist, create a new UserOpening with this data.
     */
    create: XOR<UserOpeningCreateInput, UserOpeningUncheckedCreateInput>
    /**
     * In case the UserOpening was found with the provided `where` argument, update it with this data.
     */
    update: XOR<UserOpeningUpdateInput, UserOpeningUncheckedUpdateInput>
  }

  /**
   * UserOpening delete
   */
  export type UserOpeningDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserOpening
     */
    select?: UserOpeningSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserOpening
     */
    omit?: UserOpeningOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserOpeningInclude<ExtArgs> | null
    /**
     * Filter which UserOpening to delete.
     */
    where: UserOpeningWhereUniqueInput
  }

  /**
   * UserOpening deleteMany
   */
  export type UserOpeningDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which UserOpenings to delete
     */
    where?: UserOpeningWhereInput
    /**
     * Limit how many UserOpenings to delete.
     */
    limit?: number
  }

  /**
   * UserOpening without action
   */
  export type UserOpeningDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserOpening
     */
    select?: UserOpeningSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserOpening
     */
    omit?: UserOpeningOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserOpeningInclude<ExtArgs> | null
  }


  /**
   * Enums
   */

  export const TransactionIsolationLevel: {
    ReadUncommitted: 'ReadUncommitted',
    ReadCommitted: 'ReadCommitted',
    RepeatableRead: 'RepeatableRead',
    Serializable: 'Serializable'
  };

  export type TransactionIsolationLevel = (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel]


  export const UserScalarFieldEnum: {
    id: 'id',
    email: 'email',
    name: 'name',
    bio: 'bio'
  };

  export type UserScalarFieldEnum = (typeof UserScalarFieldEnum)[keyof typeof UserScalarFieldEnum]


  export const FollowerScalarFieldEnum: {
    id: 'id',
    followerId: 'followerId',
    followingId: 'followingId'
  };

  export type FollowerScalarFieldEnum = (typeof FollowerScalarFieldEnum)[keyof typeof FollowerScalarFieldEnum]


  export const RatingScalarFieldEnum: {
    id: 'id',
    userId: 'userId',
    type: 'type',
    value: 'value',
    createdAt: 'createdAt'
  };

  export type RatingScalarFieldEnum = (typeof RatingScalarFieldEnum)[keyof typeof RatingScalarFieldEnum]


  export const GameScalarFieldEnum: {
    id: 'id',
    whiteId: 'whiteId',
    blackId: 'blackId',
    whiteRating: 'whiteRating',
    blackRating: 'blackRating',
    type: 'type',
    isRated: 'isRated',
    playedAt: 'playedAt',
    pgn: 'pgn',
    openingNr: 'openingNr',
    result: 'result'
  };

  export type GameScalarFieldEnum = (typeof GameScalarFieldEnum)[keyof typeof GameScalarFieldEnum]


  export const TacticScalarFieldEnum: {
    id: 'id',
    fen: 'fen',
    rating: 'rating',
    openingNr: 'openingNr',
    moveNr: 'moveNr'
  };

  export type TacticScalarFieldEnum = (typeof TacticScalarFieldEnum)[keyof typeof TacticScalarFieldEnum]


  export const UserTacticScalarFieldEnum: {
    id: 'id',
    userId: 'userId',
    tacticId: 'tacticId',
    solved: 'solved',
    finished: 'finished'
  };

  export type UserTacticScalarFieldEnum = (typeof UserTacticScalarFieldEnum)[keyof typeof UserTacticScalarFieldEnum]


  export const UserOpeningScalarFieldEnum: {
    id: 'id',
    userId: 'userId',
    openingNr: 'openingNr',
    color: 'color',
    pgn: 'pgn',
    evalCp: 'evalCp',
    finished: 'finished',
    evalHistory: 'evalHistory'
  };

  export type UserOpeningScalarFieldEnum = (typeof UserOpeningScalarFieldEnum)[keyof typeof UserOpeningScalarFieldEnum]


  export const SortOrder: {
    asc: 'asc',
    desc: 'desc'
  };

  export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder]


  export const QueryMode: {
    default: 'default',
    insensitive: 'insensitive'
  };

  export type QueryMode = (typeof QueryMode)[keyof typeof QueryMode]


  export const NullsOrder: {
    first: 'first',
    last: 'last'
  };

  export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder]


  /**
   * Field references
   */


  /**
   * Reference to a field of type 'String'
   */
  export type StringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String'>
    


  /**
   * Reference to a field of type 'String[]'
   */
  export type ListStringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String[]'>
    


  /**
   * Reference to a field of type 'Int'
   */
  export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>
    


  /**
   * Reference to a field of type 'Int[]'
   */
  export type ListIntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int[]'>
    


  /**
   * Reference to a field of type 'DateTime'
   */
  export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime'>
    


  /**
   * Reference to a field of type 'DateTime[]'
   */
  export type ListDateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime[]'>
    


  /**
   * Reference to a field of type 'Boolean'
   */
  export type BooleanFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Boolean'>
    


  /**
   * Reference to a field of type 'Float'
   */
  export type FloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float'>
    


  /**
   * Reference to a field of type 'Float[]'
   */
  export type ListFloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float[]'>
    
  /**
   * Deep Input Types
   */


  export type UserWhereInput = {
    AND?: UserWhereInput | UserWhereInput[]
    OR?: UserWhereInput[]
    NOT?: UserWhereInput | UserWhereInput[]
    id?: StringFilter<"User"> | string
    email?: StringFilter<"User"> | string
    name?: StringNullableFilter<"User"> | string | null
    bio?: StringNullableFilter<"User"> | string | null
    followers?: FollowerListRelationFilter
    following?: FollowerListRelationFilter
    ratings?: RatingListRelationFilter
    whiteGames?: GameListRelationFilter
    blackGames?: GameListRelationFilter
    tactics?: UserTacticListRelationFilter
    openings?: UserOpeningListRelationFilter
  }

  export type UserOrderByWithRelationInput = {
    id?: SortOrder
    email?: SortOrder
    name?: SortOrderInput | SortOrder
    bio?: SortOrderInput | SortOrder
    followers?: FollowerOrderByRelationAggregateInput
    following?: FollowerOrderByRelationAggregateInput
    ratings?: RatingOrderByRelationAggregateInput
    whiteGames?: GameOrderByRelationAggregateInput
    blackGames?: GameOrderByRelationAggregateInput
    tactics?: UserTacticOrderByRelationAggregateInput
    openings?: UserOpeningOrderByRelationAggregateInput
  }

  export type UserWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    email?: string
    AND?: UserWhereInput | UserWhereInput[]
    OR?: UserWhereInput[]
    NOT?: UserWhereInput | UserWhereInput[]
    name?: StringNullableFilter<"User"> | string | null
    bio?: StringNullableFilter<"User"> | string | null
    followers?: FollowerListRelationFilter
    following?: FollowerListRelationFilter
    ratings?: RatingListRelationFilter
    whiteGames?: GameListRelationFilter
    blackGames?: GameListRelationFilter
    tactics?: UserTacticListRelationFilter
    openings?: UserOpeningListRelationFilter
  }, "id" | "email">

  export type UserOrderByWithAggregationInput = {
    id?: SortOrder
    email?: SortOrder
    name?: SortOrderInput | SortOrder
    bio?: SortOrderInput | SortOrder
    _count?: UserCountOrderByAggregateInput
    _max?: UserMaxOrderByAggregateInput
    _min?: UserMinOrderByAggregateInput
  }

  export type UserScalarWhereWithAggregatesInput = {
    AND?: UserScalarWhereWithAggregatesInput | UserScalarWhereWithAggregatesInput[]
    OR?: UserScalarWhereWithAggregatesInput[]
    NOT?: UserScalarWhereWithAggregatesInput | UserScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"User"> | string
    email?: StringWithAggregatesFilter<"User"> | string
    name?: StringNullableWithAggregatesFilter<"User"> | string | null
    bio?: StringNullableWithAggregatesFilter<"User"> | string | null
  }

  export type FollowerWhereInput = {
    AND?: FollowerWhereInput | FollowerWhereInput[]
    OR?: FollowerWhereInput[]
    NOT?: FollowerWhereInput | FollowerWhereInput[]
    id?: StringFilter<"Follower"> | string
    followerId?: StringFilter<"Follower"> | string
    followingId?: StringFilter<"Follower"> | string
    follower?: XOR<UserScalarRelationFilter, UserWhereInput>
    following?: XOR<UserScalarRelationFilter, UserWhereInput>
  }

  export type FollowerOrderByWithRelationInput = {
    id?: SortOrder
    followerId?: SortOrder
    followingId?: SortOrder
    follower?: UserOrderByWithRelationInput
    following?: UserOrderByWithRelationInput
  }

  export type FollowerWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: FollowerWhereInput | FollowerWhereInput[]
    OR?: FollowerWhereInput[]
    NOT?: FollowerWhereInput | FollowerWhereInput[]
    followerId?: StringFilter<"Follower"> | string
    followingId?: StringFilter<"Follower"> | string
    follower?: XOR<UserScalarRelationFilter, UserWhereInput>
    following?: XOR<UserScalarRelationFilter, UserWhereInput>
  }, "id">

  export type FollowerOrderByWithAggregationInput = {
    id?: SortOrder
    followerId?: SortOrder
    followingId?: SortOrder
    _count?: FollowerCountOrderByAggregateInput
    _max?: FollowerMaxOrderByAggregateInput
    _min?: FollowerMinOrderByAggregateInput
  }

  export type FollowerScalarWhereWithAggregatesInput = {
    AND?: FollowerScalarWhereWithAggregatesInput | FollowerScalarWhereWithAggregatesInput[]
    OR?: FollowerScalarWhereWithAggregatesInput[]
    NOT?: FollowerScalarWhereWithAggregatesInput | FollowerScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Follower"> | string
    followerId?: StringWithAggregatesFilter<"Follower"> | string
    followingId?: StringWithAggregatesFilter<"Follower"> | string
  }

  export type RatingWhereInput = {
    AND?: RatingWhereInput | RatingWhereInput[]
    OR?: RatingWhereInput[]
    NOT?: RatingWhereInput | RatingWhereInput[]
    id?: StringFilter<"Rating"> | string
    userId?: StringFilter<"Rating"> | string
    type?: StringFilter<"Rating"> | string
    value?: IntFilter<"Rating"> | number
    createdAt?: DateTimeFilter<"Rating"> | Date | string
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
  }

  export type RatingOrderByWithRelationInput = {
    id?: SortOrder
    userId?: SortOrder
    type?: SortOrder
    value?: SortOrder
    createdAt?: SortOrder
    user?: UserOrderByWithRelationInput
  }

  export type RatingWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: RatingWhereInput | RatingWhereInput[]
    OR?: RatingWhereInput[]
    NOT?: RatingWhereInput | RatingWhereInput[]
    userId?: StringFilter<"Rating"> | string
    type?: StringFilter<"Rating"> | string
    value?: IntFilter<"Rating"> | number
    createdAt?: DateTimeFilter<"Rating"> | Date | string
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
  }, "id">

  export type RatingOrderByWithAggregationInput = {
    id?: SortOrder
    userId?: SortOrder
    type?: SortOrder
    value?: SortOrder
    createdAt?: SortOrder
    _count?: RatingCountOrderByAggregateInput
    _avg?: RatingAvgOrderByAggregateInput
    _max?: RatingMaxOrderByAggregateInput
    _min?: RatingMinOrderByAggregateInput
    _sum?: RatingSumOrderByAggregateInput
  }

  export type RatingScalarWhereWithAggregatesInput = {
    AND?: RatingScalarWhereWithAggregatesInput | RatingScalarWhereWithAggregatesInput[]
    OR?: RatingScalarWhereWithAggregatesInput[]
    NOT?: RatingScalarWhereWithAggregatesInput | RatingScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Rating"> | string
    userId?: StringWithAggregatesFilter<"Rating"> | string
    type?: StringWithAggregatesFilter<"Rating"> | string
    value?: IntWithAggregatesFilter<"Rating"> | number
    createdAt?: DateTimeWithAggregatesFilter<"Rating"> | Date | string
  }

  export type GameWhereInput = {
    AND?: GameWhereInput | GameWhereInput[]
    OR?: GameWhereInput[]
    NOT?: GameWhereInput | GameWhereInput[]
    id?: StringFilter<"Game"> | string
    whiteId?: StringFilter<"Game"> | string
    blackId?: StringFilter<"Game"> | string
    whiteRating?: IntFilter<"Game"> | number
    blackRating?: IntFilter<"Game"> | number
    type?: StringFilter<"Game"> | string
    isRated?: BoolFilter<"Game"> | boolean
    playedAt?: DateTimeFilter<"Game"> | Date | string
    pgn?: StringFilter<"Game"> | string
    openingNr?: IntFilter<"Game"> | number
    result?: StringFilter<"Game"> | string
    white?: XOR<UserScalarRelationFilter, UserWhereInput>
    black?: XOR<UserScalarRelationFilter, UserWhereInput>
  }

  export type GameOrderByWithRelationInput = {
    id?: SortOrder
    whiteId?: SortOrder
    blackId?: SortOrder
    whiteRating?: SortOrder
    blackRating?: SortOrder
    type?: SortOrder
    isRated?: SortOrder
    playedAt?: SortOrder
    pgn?: SortOrder
    openingNr?: SortOrder
    result?: SortOrder
    white?: UserOrderByWithRelationInput
    black?: UserOrderByWithRelationInput
  }

  export type GameWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: GameWhereInput | GameWhereInput[]
    OR?: GameWhereInput[]
    NOT?: GameWhereInput | GameWhereInput[]
    whiteId?: StringFilter<"Game"> | string
    blackId?: StringFilter<"Game"> | string
    whiteRating?: IntFilter<"Game"> | number
    blackRating?: IntFilter<"Game"> | number
    type?: StringFilter<"Game"> | string
    isRated?: BoolFilter<"Game"> | boolean
    playedAt?: DateTimeFilter<"Game"> | Date | string
    pgn?: StringFilter<"Game"> | string
    openingNr?: IntFilter<"Game"> | number
    result?: StringFilter<"Game"> | string
    white?: XOR<UserScalarRelationFilter, UserWhereInput>
    black?: XOR<UserScalarRelationFilter, UserWhereInput>
  }, "id">

  export type GameOrderByWithAggregationInput = {
    id?: SortOrder
    whiteId?: SortOrder
    blackId?: SortOrder
    whiteRating?: SortOrder
    blackRating?: SortOrder
    type?: SortOrder
    isRated?: SortOrder
    playedAt?: SortOrder
    pgn?: SortOrder
    openingNr?: SortOrder
    result?: SortOrder
    _count?: GameCountOrderByAggregateInput
    _avg?: GameAvgOrderByAggregateInput
    _max?: GameMaxOrderByAggregateInput
    _min?: GameMinOrderByAggregateInput
    _sum?: GameSumOrderByAggregateInput
  }

  export type GameScalarWhereWithAggregatesInput = {
    AND?: GameScalarWhereWithAggregatesInput | GameScalarWhereWithAggregatesInput[]
    OR?: GameScalarWhereWithAggregatesInput[]
    NOT?: GameScalarWhereWithAggregatesInput | GameScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Game"> | string
    whiteId?: StringWithAggregatesFilter<"Game"> | string
    blackId?: StringWithAggregatesFilter<"Game"> | string
    whiteRating?: IntWithAggregatesFilter<"Game"> | number
    blackRating?: IntWithAggregatesFilter<"Game"> | number
    type?: StringWithAggregatesFilter<"Game"> | string
    isRated?: BoolWithAggregatesFilter<"Game"> | boolean
    playedAt?: DateTimeWithAggregatesFilter<"Game"> | Date | string
    pgn?: StringWithAggregatesFilter<"Game"> | string
    openingNr?: IntWithAggregatesFilter<"Game"> | number
    result?: StringWithAggregatesFilter<"Game"> | string
  }

  export type TacticWhereInput = {
    AND?: TacticWhereInput | TacticWhereInput[]
    OR?: TacticWhereInput[]
    NOT?: TacticWhereInput | TacticWhereInput[]
    id?: IntFilter<"Tactic"> | number
    fen?: StringFilter<"Tactic"> | string
    rating?: IntFilter<"Tactic"> | number
    openingNr?: IntFilter<"Tactic"> | number
    moveNr?: IntFilter<"Tactic"> | number
    userTactic?: UserTacticListRelationFilter
  }

  export type TacticOrderByWithRelationInput = {
    id?: SortOrder
    fen?: SortOrder
    rating?: SortOrder
    openingNr?: SortOrder
    moveNr?: SortOrder
    userTactic?: UserTacticOrderByRelationAggregateInput
  }

  export type TacticWhereUniqueInput = Prisma.AtLeast<{
    id?: number
    AND?: TacticWhereInput | TacticWhereInput[]
    OR?: TacticWhereInput[]
    NOT?: TacticWhereInput | TacticWhereInput[]
    fen?: StringFilter<"Tactic"> | string
    rating?: IntFilter<"Tactic"> | number
    openingNr?: IntFilter<"Tactic"> | number
    moveNr?: IntFilter<"Tactic"> | number
    userTactic?: UserTacticListRelationFilter
  }, "id">

  export type TacticOrderByWithAggregationInput = {
    id?: SortOrder
    fen?: SortOrder
    rating?: SortOrder
    openingNr?: SortOrder
    moveNr?: SortOrder
    _count?: TacticCountOrderByAggregateInput
    _avg?: TacticAvgOrderByAggregateInput
    _max?: TacticMaxOrderByAggregateInput
    _min?: TacticMinOrderByAggregateInput
    _sum?: TacticSumOrderByAggregateInput
  }

  export type TacticScalarWhereWithAggregatesInput = {
    AND?: TacticScalarWhereWithAggregatesInput | TacticScalarWhereWithAggregatesInput[]
    OR?: TacticScalarWhereWithAggregatesInput[]
    NOT?: TacticScalarWhereWithAggregatesInput | TacticScalarWhereWithAggregatesInput[]
    id?: IntWithAggregatesFilter<"Tactic"> | number
    fen?: StringWithAggregatesFilter<"Tactic"> | string
    rating?: IntWithAggregatesFilter<"Tactic"> | number
    openingNr?: IntWithAggregatesFilter<"Tactic"> | number
    moveNr?: IntWithAggregatesFilter<"Tactic"> | number
  }

  export type UserTacticWhereInput = {
    AND?: UserTacticWhereInput | UserTacticWhereInput[]
    OR?: UserTacticWhereInput[]
    NOT?: UserTacticWhereInput | UserTacticWhereInput[]
    id?: StringFilter<"UserTactic"> | string
    userId?: StringFilter<"UserTactic"> | string
    tacticId?: IntFilter<"UserTactic"> | number
    solved?: BoolNullableFilter<"UserTactic"> | boolean | null
    finished?: DateTimeNullableFilter<"UserTactic"> | Date | string | null
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
    tactic?: XOR<TacticScalarRelationFilter, TacticWhereInput>
  }

  export type UserTacticOrderByWithRelationInput = {
    id?: SortOrder
    userId?: SortOrder
    tacticId?: SortOrder
    solved?: SortOrderInput | SortOrder
    finished?: SortOrderInput | SortOrder
    user?: UserOrderByWithRelationInput
    tactic?: TacticOrderByWithRelationInput
  }

  export type UserTacticWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: UserTacticWhereInput | UserTacticWhereInput[]
    OR?: UserTacticWhereInput[]
    NOT?: UserTacticWhereInput | UserTacticWhereInput[]
    userId?: StringFilter<"UserTactic"> | string
    tacticId?: IntFilter<"UserTactic"> | number
    solved?: BoolNullableFilter<"UserTactic"> | boolean | null
    finished?: DateTimeNullableFilter<"UserTactic"> | Date | string | null
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
    tactic?: XOR<TacticScalarRelationFilter, TacticWhereInput>
  }, "id">

  export type UserTacticOrderByWithAggregationInput = {
    id?: SortOrder
    userId?: SortOrder
    tacticId?: SortOrder
    solved?: SortOrderInput | SortOrder
    finished?: SortOrderInput | SortOrder
    _count?: UserTacticCountOrderByAggregateInput
    _avg?: UserTacticAvgOrderByAggregateInput
    _max?: UserTacticMaxOrderByAggregateInput
    _min?: UserTacticMinOrderByAggregateInput
    _sum?: UserTacticSumOrderByAggregateInput
  }

  export type UserTacticScalarWhereWithAggregatesInput = {
    AND?: UserTacticScalarWhereWithAggregatesInput | UserTacticScalarWhereWithAggregatesInput[]
    OR?: UserTacticScalarWhereWithAggregatesInput[]
    NOT?: UserTacticScalarWhereWithAggregatesInput | UserTacticScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"UserTactic"> | string
    userId?: StringWithAggregatesFilter<"UserTactic"> | string
    tacticId?: IntWithAggregatesFilter<"UserTactic"> | number
    solved?: BoolNullableWithAggregatesFilter<"UserTactic"> | boolean | null
    finished?: DateTimeNullableWithAggregatesFilter<"UserTactic"> | Date | string | null
  }

  export type UserOpeningWhereInput = {
    AND?: UserOpeningWhereInput | UserOpeningWhereInput[]
    OR?: UserOpeningWhereInput[]
    NOT?: UserOpeningWhereInput | UserOpeningWhereInput[]
    id?: StringFilter<"UserOpening"> | string
    userId?: StringFilter<"UserOpening"> | string
    openingNr?: IntFilter<"UserOpening"> | number
    color?: StringFilter<"UserOpening"> | string
    pgn?: StringNullableFilter<"UserOpening"> | string | null
    evalCp?: IntNullableFilter<"UserOpening"> | number | null
    finished?: DateTimeNullableFilter<"UserOpening"> | Date | string | null
    evalHistory?: IntNullableListFilter<"UserOpening">
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
  }

  export type UserOpeningOrderByWithRelationInput = {
    id?: SortOrder
    userId?: SortOrder
    openingNr?: SortOrder
    color?: SortOrder
    pgn?: SortOrderInput | SortOrder
    evalCp?: SortOrderInput | SortOrder
    finished?: SortOrderInput | SortOrder
    evalHistory?: SortOrder
    user?: UserOrderByWithRelationInput
  }

  export type UserOpeningWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: UserOpeningWhereInput | UserOpeningWhereInput[]
    OR?: UserOpeningWhereInput[]
    NOT?: UserOpeningWhereInput | UserOpeningWhereInput[]
    userId?: StringFilter<"UserOpening"> | string
    openingNr?: IntFilter<"UserOpening"> | number
    color?: StringFilter<"UserOpening"> | string
    pgn?: StringNullableFilter<"UserOpening"> | string | null
    evalCp?: IntNullableFilter<"UserOpening"> | number | null
    finished?: DateTimeNullableFilter<"UserOpening"> | Date | string | null
    evalHistory?: IntNullableListFilter<"UserOpening">
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
  }, "id">

  export type UserOpeningOrderByWithAggregationInput = {
    id?: SortOrder
    userId?: SortOrder
    openingNr?: SortOrder
    color?: SortOrder
    pgn?: SortOrderInput | SortOrder
    evalCp?: SortOrderInput | SortOrder
    finished?: SortOrderInput | SortOrder
    evalHistory?: SortOrder
    _count?: UserOpeningCountOrderByAggregateInput
    _avg?: UserOpeningAvgOrderByAggregateInput
    _max?: UserOpeningMaxOrderByAggregateInput
    _min?: UserOpeningMinOrderByAggregateInput
    _sum?: UserOpeningSumOrderByAggregateInput
  }

  export type UserOpeningScalarWhereWithAggregatesInput = {
    AND?: UserOpeningScalarWhereWithAggregatesInput | UserOpeningScalarWhereWithAggregatesInput[]
    OR?: UserOpeningScalarWhereWithAggregatesInput[]
    NOT?: UserOpeningScalarWhereWithAggregatesInput | UserOpeningScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"UserOpening"> | string
    userId?: StringWithAggregatesFilter<"UserOpening"> | string
    openingNr?: IntWithAggregatesFilter<"UserOpening"> | number
    color?: StringWithAggregatesFilter<"UserOpening"> | string
    pgn?: StringNullableWithAggregatesFilter<"UserOpening"> | string | null
    evalCp?: IntNullableWithAggregatesFilter<"UserOpening"> | number | null
    finished?: DateTimeNullableWithAggregatesFilter<"UserOpening"> | Date | string | null
    evalHistory?: IntNullableListFilter<"UserOpening">
  }

  export type UserCreateInput = {
    id?: string
    email: string
    name?: string | null
    bio?: string | null
    followers?: FollowerCreateNestedManyWithoutFollowerInput
    following?: FollowerCreateNestedManyWithoutFollowingInput
    ratings?: RatingCreateNestedManyWithoutUserInput
    whiteGames?: GameCreateNestedManyWithoutWhiteInput
    blackGames?: GameCreateNestedManyWithoutBlackInput
    tactics?: UserTacticCreateNestedManyWithoutUserInput
    openings?: UserOpeningCreateNestedManyWithoutUserInput
  }

  export type UserUncheckedCreateInput = {
    id?: string
    email: string
    name?: string | null
    bio?: string | null
    followers?: FollowerUncheckedCreateNestedManyWithoutFollowerInput
    following?: FollowerUncheckedCreateNestedManyWithoutFollowingInput
    ratings?: RatingUncheckedCreateNestedManyWithoutUserInput
    whiteGames?: GameUncheckedCreateNestedManyWithoutWhiteInput
    blackGames?: GameUncheckedCreateNestedManyWithoutBlackInput
    tactics?: UserTacticUncheckedCreateNestedManyWithoutUserInput
    openings?: UserOpeningUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    bio?: NullableStringFieldUpdateOperationsInput | string | null
    followers?: FollowerUpdateManyWithoutFollowerNestedInput
    following?: FollowerUpdateManyWithoutFollowingNestedInput
    ratings?: RatingUpdateManyWithoutUserNestedInput
    whiteGames?: GameUpdateManyWithoutWhiteNestedInput
    blackGames?: GameUpdateManyWithoutBlackNestedInput
    tactics?: UserTacticUpdateManyWithoutUserNestedInput
    openings?: UserOpeningUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    bio?: NullableStringFieldUpdateOperationsInput | string | null
    followers?: FollowerUncheckedUpdateManyWithoutFollowerNestedInput
    following?: FollowerUncheckedUpdateManyWithoutFollowingNestedInput
    ratings?: RatingUncheckedUpdateManyWithoutUserNestedInput
    whiteGames?: GameUncheckedUpdateManyWithoutWhiteNestedInput
    blackGames?: GameUncheckedUpdateManyWithoutBlackNestedInput
    tactics?: UserTacticUncheckedUpdateManyWithoutUserNestedInput
    openings?: UserOpeningUncheckedUpdateManyWithoutUserNestedInput
  }

  export type UserCreateManyInput = {
    id?: string
    email: string
    name?: string | null
    bio?: string | null
  }

  export type UserUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    bio?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type UserUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    bio?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type FollowerCreateInput = {
    id?: string
    follower: UserCreateNestedOneWithoutFollowersInput
    following: UserCreateNestedOneWithoutFollowingInput
  }

  export type FollowerUncheckedCreateInput = {
    id?: string
    followerId: string
    followingId: string
  }

  export type FollowerUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    follower?: UserUpdateOneRequiredWithoutFollowersNestedInput
    following?: UserUpdateOneRequiredWithoutFollowingNestedInput
  }

  export type FollowerUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    followerId?: StringFieldUpdateOperationsInput | string
    followingId?: StringFieldUpdateOperationsInput | string
  }

  export type FollowerCreateManyInput = {
    id?: string
    followerId: string
    followingId: string
  }

  export type FollowerUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
  }

  export type FollowerUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    followerId?: StringFieldUpdateOperationsInput | string
    followingId?: StringFieldUpdateOperationsInput | string
  }

  export type RatingCreateInput = {
    id?: string
    type: string
    value: number
    createdAt?: Date | string
    user: UserCreateNestedOneWithoutRatingsInput
  }

  export type RatingUncheckedCreateInput = {
    id?: string
    userId: string
    type: string
    value: number
    createdAt?: Date | string
  }

  export type RatingUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    type?: StringFieldUpdateOperationsInput | string
    value?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    user?: UserUpdateOneRequiredWithoutRatingsNestedInput
  }

  export type RatingUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    type?: StringFieldUpdateOperationsInput | string
    value?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type RatingCreateManyInput = {
    id?: string
    userId: string
    type: string
    value: number
    createdAt?: Date | string
  }

  export type RatingUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    type?: StringFieldUpdateOperationsInput | string
    value?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type RatingUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    type?: StringFieldUpdateOperationsInput | string
    value?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type GameCreateInput = {
    id?: string
    whiteRating: number
    blackRating: number
    type: string
    isRated?: boolean
    playedAt?: Date | string
    pgn: string
    openingNr: number
    result: string
    white: UserCreateNestedOneWithoutWhiteGamesInput
    black: UserCreateNestedOneWithoutBlackGamesInput
  }

  export type GameUncheckedCreateInput = {
    id?: string
    whiteId: string
    blackId: string
    whiteRating: number
    blackRating: number
    type: string
    isRated?: boolean
    playedAt?: Date | string
    pgn: string
    openingNr: number
    result: string
  }

  export type GameUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    whiteRating?: IntFieldUpdateOperationsInput | number
    blackRating?: IntFieldUpdateOperationsInput | number
    type?: StringFieldUpdateOperationsInput | string
    isRated?: BoolFieldUpdateOperationsInput | boolean
    playedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    pgn?: StringFieldUpdateOperationsInput | string
    openingNr?: IntFieldUpdateOperationsInput | number
    result?: StringFieldUpdateOperationsInput | string
    white?: UserUpdateOneRequiredWithoutWhiteGamesNestedInput
    black?: UserUpdateOneRequiredWithoutBlackGamesNestedInput
  }

  export type GameUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    whiteId?: StringFieldUpdateOperationsInput | string
    blackId?: StringFieldUpdateOperationsInput | string
    whiteRating?: IntFieldUpdateOperationsInput | number
    blackRating?: IntFieldUpdateOperationsInput | number
    type?: StringFieldUpdateOperationsInput | string
    isRated?: BoolFieldUpdateOperationsInput | boolean
    playedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    pgn?: StringFieldUpdateOperationsInput | string
    openingNr?: IntFieldUpdateOperationsInput | number
    result?: StringFieldUpdateOperationsInput | string
  }

  export type GameCreateManyInput = {
    id?: string
    whiteId: string
    blackId: string
    whiteRating: number
    blackRating: number
    type: string
    isRated?: boolean
    playedAt?: Date | string
    pgn: string
    openingNr: number
    result: string
  }

  export type GameUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    whiteRating?: IntFieldUpdateOperationsInput | number
    blackRating?: IntFieldUpdateOperationsInput | number
    type?: StringFieldUpdateOperationsInput | string
    isRated?: BoolFieldUpdateOperationsInput | boolean
    playedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    pgn?: StringFieldUpdateOperationsInput | string
    openingNr?: IntFieldUpdateOperationsInput | number
    result?: StringFieldUpdateOperationsInput | string
  }

  export type GameUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    whiteId?: StringFieldUpdateOperationsInput | string
    blackId?: StringFieldUpdateOperationsInput | string
    whiteRating?: IntFieldUpdateOperationsInput | number
    blackRating?: IntFieldUpdateOperationsInput | number
    type?: StringFieldUpdateOperationsInput | string
    isRated?: BoolFieldUpdateOperationsInput | boolean
    playedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    pgn?: StringFieldUpdateOperationsInput | string
    openingNr?: IntFieldUpdateOperationsInput | number
    result?: StringFieldUpdateOperationsInput | string
  }

  export type TacticCreateInput = {
    id: number
    fen: string
    rating: number
    openingNr: number
    moveNr: number
    userTactic?: UserTacticCreateNestedManyWithoutTacticInput
  }

  export type TacticUncheckedCreateInput = {
    id: number
    fen: string
    rating: number
    openingNr: number
    moveNr: number
    userTactic?: UserTacticUncheckedCreateNestedManyWithoutTacticInput
  }

  export type TacticUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    fen?: StringFieldUpdateOperationsInput | string
    rating?: IntFieldUpdateOperationsInput | number
    openingNr?: IntFieldUpdateOperationsInput | number
    moveNr?: IntFieldUpdateOperationsInput | number
    userTactic?: UserTacticUpdateManyWithoutTacticNestedInput
  }

  export type TacticUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    fen?: StringFieldUpdateOperationsInput | string
    rating?: IntFieldUpdateOperationsInput | number
    openingNr?: IntFieldUpdateOperationsInput | number
    moveNr?: IntFieldUpdateOperationsInput | number
    userTactic?: UserTacticUncheckedUpdateManyWithoutTacticNestedInput
  }

  export type TacticCreateManyInput = {
    id: number
    fen: string
    rating: number
    openingNr: number
    moveNr: number
  }

  export type TacticUpdateManyMutationInput = {
    id?: IntFieldUpdateOperationsInput | number
    fen?: StringFieldUpdateOperationsInput | string
    rating?: IntFieldUpdateOperationsInput | number
    openingNr?: IntFieldUpdateOperationsInput | number
    moveNr?: IntFieldUpdateOperationsInput | number
  }

  export type TacticUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    fen?: StringFieldUpdateOperationsInput | string
    rating?: IntFieldUpdateOperationsInput | number
    openingNr?: IntFieldUpdateOperationsInput | number
    moveNr?: IntFieldUpdateOperationsInput | number
  }

  export type UserTacticCreateInput = {
    id?: string
    solved?: boolean | null
    finished?: Date | string | null
    user: UserCreateNestedOneWithoutTacticsInput
    tactic: TacticCreateNestedOneWithoutUserTacticInput
  }

  export type UserTacticUncheckedCreateInput = {
    id?: string
    userId: string
    tacticId: number
    solved?: boolean | null
    finished?: Date | string | null
  }

  export type UserTacticUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    solved?: NullableBoolFieldUpdateOperationsInput | boolean | null
    finished?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    user?: UserUpdateOneRequiredWithoutTacticsNestedInput
    tactic?: TacticUpdateOneRequiredWithoutUserTacticNestedInput
  }

  export type UserTacticUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    tacticId?: IntFieldUpdateOperationsInput | number
    solved?: NullableBoolFieldUpdateOperationsInput | boolean | null
    finished?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type UserTacticCreateManyInput = {
    id?: string
    userId: string
    tacticId: number
    solved?: boolean | null
    finished?: Date | string | null
  }

  export type UserTacticUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    solved?: NullableBoolFieldUpdateOperationsInput | boolean | null
    finished?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type UserTacticUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    tacticId?: IntFieldUpdateOperationsInput | number
    solved?: NullableBoolFieldUpdateOperationsInput | boolean | null
    finished?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type UserOpeningCreateInput = {
    id?: string
    openingNr: number
    color: string
    pgn?: string | null
    evalCp?: number | null
    finished?: Date | string | null
    evalHistory?: UserOpeningCreateevalHistoryInput | number[]
    user: UserCreateNestedOneWithoutOpeningsInput
  }

  export type UserOpeningUncheckedCreateInput = {
    id?: string
    userId: string
    openingNr: number
    color: string
    pgn?: string | null
    evalCp?: number | null
    finished?: Date | string | null
    evalHistory?: UserOpeningCreateevalHistoryInput | number[]
  }

  export type UserOpeningUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    openingNr?: IntFieldUpdateOperationsInput | number
    color?: StringFieldUpdateOperationsInput | string
    pgn?: NullableStringFieldUpdateOperationsInput | string | null
    evalCp?: NullableIntFieldUpdateOperationsInput | number | null
    finished?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    evalHistory?: UserOpeningUpdateevalHistoryInput | number[]
    user?: UserUpdateOneRequiredWithoutOpeningsNestedInput
  }

  export type UserOpeningUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    openingNr?: IntFieldUpdateOperationsInput | number
    color?: StringFieldUpdateOperationsInput | string
    pgn?: NullableStringFieldUpdateOperationsInput | string | null
    evalCp?: NullableIntFieldUpdateOperationsInput | number | null
    finished?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    evalHistory?: UserOpeningUpdateevalHistoryInput | number[]
  }

  export type UserOpeningCreateManyInput = {
    id?: string
    userId: string
    openingNr: number
    color: string
    pgn?: string | null
    evalCp?: number | null
    finished?: Date | string | null
    evalHistory?: UserOpeningCreateevalHistoryInput | number[]
  }

  export type UserOpeningUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    openingNr?: IntFieldUpdateOperationsInput | number
    color?: StringFieldUpdateOperationsInput | string
    pgn?: NullableStringFieldUpdateOperationsInput | string | null
    evalCp?: NullableIntFieldUpdateOperationsInput | number | null
    finished?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    evalHistory?: UserOpeningUpdateevalHistoryInput | number[]
  }

  export type UserOpeningUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    openingNr?: IntFieldUpdateOperationsInput | number
    color?: StringFieldUpdateOperationsInput | string
    pgn?: NullableStringFieldUpdateOperationsInput | string | null
    evalCp?: NullableIntFieldUpdateOperationsInput | number | null
    finished?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    evalHistory?: UserOpeningUpdateevalHistoryInput | number[]
  }

  export type StringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type StringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type FollowerListRelationFilter = {
    every?: FollowerWhereInput
    some?: FollowerWhereInput
    none?: FollowerWhereInput
  }

  export type RatingListRelationFilter = {
    every?: RatingWhereInput
    some?: RatingWhereInput
    none?: RatingWhereInput
  }

  export type GameListRelationFilter = {
    every?: GameWhereInput
    some?: GameWhereInput
    none?: GameWhereInput
  }

  export type UserTacticListRelationFilter = {
    every?: UserTacticWhereInput
    some?: UserTacticWhereInput
    none?: UserTacticWhereInput
  }

  export type UserOpeningListRelationFilter = {
    every?: UserOpeningWhereInput
    some?: UserOpeningWhereInput
    none?: UserOpeningWhereInput
  }

  export type SortOrderInput = {
    sort: SortOrder
    nulls?: NullsOrder
  }

  export type FollowerOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type RatingOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type GameOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type UserTacticOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type UserOpeningOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type UserCountOrderByAggregateInput = {
    id?: SortOrder
    email?: SortOrder
    name?: SortOrder
    bio?: SortOrder
  }

  export type UserMaxOrderByAggregateInput = {
    id?: SortOrder
    email?: SortOrder
    name?: SortOrder
    bio?: SortOrder
  }

  export type UserMinOrderByAggregateInput = {
    id?: SortOrder
    email?: SortOrder
    name?: SortOrder
    bio?: SortOrder
  }

  export type StringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type StringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type UserScalarRelationFilter = {
    is?: UserWhereInput
    isNot?: UserWhereInput
  }

  export type FollowerCountOrderByAggregateInput = {
    id?: SortOrder
    followerId?: SortOrder
    followingId?: SortOrder
  }

  export type FollowerMaxOrderByAggregateInput = {
    id?: SortOrder
    followerId?: SortOrder
    followingId?: SortOrder
  }

  export type FollowerMinOrderByAggregateInput = {
    id?: SortOrder
    followerId?: SortOrder
    followingId?: SortOrder
  }

  export type IntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type DateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type RatingCountOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    type?: SortOrder
    value?: SortOrder
    createdAt?: SortOrder
  }

  export type RatingAvgOrderByAggregateInput = {
    value?: SortOrder
  }

  export type RatingMaxOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    type?: SortOrder
    value?: SortOrder
    createdAt?: SortOrder
  }

  export type RatingMinOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    type?: SortOrder
    value?: SortOrder
    createdAt?: SortOrder
  }

  export type RatingSumOrderByAggregateInput = {
    value?: SortOrder
  }

  export type IntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type DateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type BoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type GameCountOrderByAggregateInput = {
    id?: SortOrder
    whiteId?: SortOrder
    blackId?: SortOrder
    whiteRating?: SortOrder
    blackRating?: SortOrder
    type?: SortOrder
    isRated?: SortOrder
    playedAt?: SortOrder
    pgn?: SortOrder
    openingNr?: SortOrder
    result?: SortOrder
  }

  export type GameAvgOrderByAggregateInput = {
    whiteRating?: SortOrder
    blackRating?: SortOrder
    openingNr?: SortOrder
  }

  export type GameMaxOrderByAggregateInput = {
    id?: SortOrder
    whiteId?: SortOrder
    blackId?: SortOrder
    whiteRating?: SortOrder
    blackRating?: SortOrder
    type?: SortOrder
    isRated?: SortOrder
    playedAt?: SortOrder
    pgn?: SortOrder
    openingNr?: SortOrder
    result?: SortOrder
  }

  export type GameMinOrderByAggregateInput = {
    id?: SortOrder
    whiteId?: SortOrder
    blackId?: SortOrder
    whiteRating?: SortOrder
    blackRating?: SortOrder
    type?: SortOrder
    isRated?: SortOrder
    playedAt?: SortOrder
    pgn?: SortOrder
    openingNr?: SortOrder
    result?: SortOrder
  }

  export type GameSumOrderByAggregateInput = {
    whiteRating?: SortOrder
    blackRating?: SortOrder
    openingNr?: SortOrder
  }

  export type BoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type TacticCountOrderByAggregateInput = {
    id?: SortOrder
    fen?: SortOrder
    rating?: SortOrder
    openingNr?: SortOrder
    moveNr?: SortOrder
  }

  export type TacticAvgOrderByAggregateInput = {
    id?: SortOrder
    rating?: SortOrder
    openingNr?: SortOrder
    moveNr?: SortOrder
  }

  export type TacticMaxOrderByAggregateInput = {
    id?: SortOrder
    fen?: SortOrder
    rating?: SortOrder
    openingNr?: SortOrder
    moveNr?: SortOrder
  }

  export type TacticMinOrderByAggregateInput = {
    id?: SortOrder
    fen?: SortOrder
    rating?: SortOrder
    openingNr?: SortOrder
    moveNr?: SortOrder
  }

  export type TacticSumOrderByAggregateInput = {
    id?: SortOrder
    rating?: SortOrder
    openingNr?: SortOrder
    moveNr?: SortOrder
  }

  export type BoolNullableFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel> | null
    not?: NestedBoolNullableFilter<$PrismaModel> | boolean | null
  }

  export type DateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type TacticScalarRelationFilter = {
    is?: TacticWhereInput
    isNot?: TacticWhereInput
  }

  export type UserTacticCountOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    tacticId?: SortOrder
    solved?: SortOrder
    finished?: SortOrder
  }

  export type UserTacticAvgOrderByAggregateInput = {
    tacticId?: SortOrder
  }

  export type UserTacticMaxOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    tacticId?: SortOrder
    solved?: SortOrder
    finished?: SortOrder
  }

  export type UserTacticMinOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    tacticId?: SortOrder
    solved?: SortOrder
    finished?: SortOrder
  }

  export type UserTacticSumOrderByAggregateInput = {
    tacticId?: SortOrder
  }

  export type BoolNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel> | null
    not?: NestedBoolNullableWithAggregatesFilter<$PrismaModel> | boolean | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedBoolNullableFilter<$PrismaModel>
    _max?: NestedBoolNullableFilter<$PrismaModel>
  }

  export type DateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }

  export type IntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type IntNullableListFilter<$PrismaModel = never> = {
    equals?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    has?: number | IntFieldRefInput<$PrismaModel> | null
    hasEvery?: number[] | ListIntFieldRefInput<$PrismaModel>
    hasSome?: number[] | ListIntFieldRefInput<$PrismaModel>
    isEmpty?: boolean
  }

  export type UserOpeningCountOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    openingNr?: SortOrder
    color?: SortOrder
    pgn?: SortOrder
    evalCp?: SortOrder
    finished?: SortOrder
    evalHistory?: SortOrder
  }

  export type UserOpeningAvgOrderByAggregateInput = {
    openingNr?: SortOrder
    evalCp?: SortOrder
    evalHistory?: SortOrder
  }

  export type UserOpeningMaxOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    openingNr?: SortOrder
    color?: SortOrder
    pgn?: SortOrder
    evalCp?: SortOrder
    finished?: SortOrder
  }

  export type UserOpeningMinOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    openingNr?: SortOrder
    color?: SortOrder
    pgn?: SortOrder
    evalCp?: SortOrder
    finished?: SortOrder
  }

  export type UserOpeningSumOrderByAggregateInput = {
    openingNr?: SortOrder
    evalCp?: SortOrder
    evalHistory?: SortOrder
  }

  export type IntNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedIntNullableFilter<$PrismaModel>
    _max?: NestedIntNullableFilter<$PrismaModel>
  }

  export type FollowerCreateNestedManyWithoutFollowerInput = {
    create?: XOR<FollowerCreateWithoutFollowerInput, FollowerUncheckedCreateWithoutFollowerInput> | FollowerCreateWithoutFollowerInput[] | FollowerUncheckedCreateWithoutFollowerInput[]
    connectOrCreate?: FollowerCreateOrConnectWithoutFollowerInput | FollowerCreateOrConnectWithoutFollowerInput[]
    createMany?: FollowerCreateManyFollowerInputEnvelope
    connect?: FollowerWhereUniqueInput | FollowerWhereUniqueInput[]
  }

  export type FollowerCreateNestedManyWithoutFollowingInput = {
    create?: XOR<FollowerCreateWithoutFollowingInput, FollowerUncheckedCreateWithoutFollowingInput> | FollowerCreateWithoutFollowingInput[] | FollowerUncheckedCreateWithoutFollowingInput[]
    connectOrCreate?: FollowerCreateOrConnectWithoutFollowingInput | FollowerCreateOrConnectWithoutFollowingInput[]
    createMany?: FollowerCreateManyFollowingInputEnvelope
    connect?: FollowerWhereUniqueInput | FollowerWhereUniqueInput[]
  }

  export type RatingCreateNestedManyWithoutUserInput = {
    create?: XOR<RatingCreateWithoutUserInput, RatingUncheckedCreateWithoutUserInput> | RatingCreateWithoutUserInput[] | RatingUncheckedCreateWithoutUserInput[]
    connectOrCreate?: RatingCreateOrConnectWithoutUserInput | RatingCreateOrConnectWithoutUserInput[]
    createMany?: RatingCreateManyUserInputEnvelope
    connect?: RatingWhereUniqueInput | RatingWhereUniqueInput[]
  }

  export type GameCreateNestedManyWithoutWhiteInput = {
    create?: XOR<GameCreateWithoutWhiteInput, GameUncheckedCreateWithoutWhiteInput> | GameCreateWithoutWhiteInput[] | GameUncheckedCreateWithoutWhiteInput[]
    connectOrCreate?: GameCreateOrConnectWithoutWhiteInput | GameCreateOrConnectWithoutWhiteInput[]
    createMany?: GameCreateManyWhiteInputEnvelope
    connect?: GameWhereUniqueInput | GameWhereUniqueInput[]
  }

  export type GameCreateNestedManyWithoutBlackInput = {
    create?: XOR<GameCreateWithoutBlackInput, GameUncheckedCreateWithoutBlackInput> | GameCreateWithoutBlackInput[] | GameUncheckedCreateWithoutBlackInput[]
    connectOrCreate?: GameCreateOrConnectWithoutBlackInput | GameCreateOrConnectWithoutBlackInput[]
    createMany?: GameCreateManyBlackInputEnvelope
    connect?: GameWhereUniqueInput | GameWhereUniqueInput[]
  }

  export type UserTacticCreateNestedManyWithoutUserInput = {
    create?: XOR<UserTacticCreateWithoutUserInput, UserTacticUncheckedCreateWithoutUserInput> | UserTacticCreateWithoutUserInput[] | UserTacticUncheckedCreateWithoutUserInput[]
    connectOrCreate?: UserTacticCreateOrConnectWithoutUserInput | UserTacticCreateOrConnectWithoutUserInput[]
    createMany?: UserTacticCreateManyUserInputEnvelope
    connect?: UserTacticWhereUniqueInput | UserTacticWhereUniqueInput[]
  }

  export type UserOpeningCreateNestedManyWithoutUserInput = {
    create?: XOR<UserOpeningCreateWithoutUserInput, UserOpeningUncheckedCreateWithoutUserInput> | UserOpeningCreateWithoutUserInput[] | UserOpeningUncheckedCreateWithoutUserInput[]
    connectOrCreate?: UserOpeningCreateOrConnectWithoutUserInput | UserOpeningCreateOrConnectWithoutUserInput[]
    createMany?: UserOpeningCreateManyUserInputEnvelope
    connect?: UserOpeningWhereUniqueInput | UserOpeningWhereUniqueInput[]
  }

  export type FollowerUncheckedCreateNestedManyWithoutFollowerInput = {
    create?: XOR<FollowerCreateWithoutFollowerInput, FollowerUncheckedCreateWithoutFollowerInput> | FollowerCreateWithoutFollowerInput[] | FollowerUncheckedCreateWithoutFollowerInput[]
    connectOrCreate?: FollowerCreateOrConnectWithoutFollowerInput | FollowerCreateOrConnectWithoutFollowerInput[]
    createMany?: FollowerCreateManyFollowerInputEnvelope
    connect?: FollowerWhereUniqueInput | FollowerWhereUniqueInput[]
  }

  export type FollowerUncheckedCreateNestedManyWithoutFollowingInput = {
    create?: XOR<FollowerCreateWithoutFollowingInput, FollowerUncheckedCreateWithoutFollowingInput> | FollowerCreateWithoutFollowingInput[] | FollowerUncheckedCreateWithoutFollowingInput[]
    connectOrCreate?: FollowerCreateOrConnectWithoutFollowingInput | FollowerCreateOrConnectWithoutFollowingInput[]
    createMany?: FollowerCreateManyFollowingInputEnvelope
    connect?: FollowerWhereUniqueInput | FollowerWhereUniqueInput[]
  }

  export type RatingUncheckedCreateNestedManyWithoutUserInput = {
    create?: XOR<RatingCreateWithoutUserInput, RatingUncheckedCreateWithoutUserInput> | RatingCreateWithoutUserInput[] | RatingUncheckedCreateWithoutUserInput[]
    connectOrCreate?: RatingCreateOrConnectWithoutUserInput | RatingCreateOrConnectWithoutUserInput[]
    createMany?: RatingCreateManyUserInputEnvelope
    connect?: RatingWhereUniqueInput | RatingWhereUniqueInput[]
  }

  export type GameUncheckedCreateNestedManyWithoutWhiteInput = {
    create?: XOR<GameCreateWithoutWhiteInput, GameUncheckedCreateWithoutWhiteInput> | GameCreateWithoutWhiteInput[] | GameUncheckedCreateWithoutWhiteInput[]
    connectOrCreate?: GameCreateOrConnectWithoutWhiteInput | GameCreateOrConnectWithoutWhiteInput[]
    createMany?: GameCreateManyWhiteInputEnvelope
    connect?: GameWhereUniqueInput | GameWhereUniqueInput[]
  }

  export type GameUncheckedCreateNestedManyWithoutBlackInput = {
    create?: XOR<GameCreateWithoutBlackInput, GameUncheckedCreateWithoutBlackInput> | GameCreateWithoutBlackInput[] | GameUncheckedCreateWithoutBlackInput[]
    connectOrCreate?: GameCreateOrConnectWithoutBlackInput | GameCreateOrConnectWithoutBlackInput[]
    createMany?: GameCreateManyBlackInputEnvelope
    connect?: GameWhereUniqueInput | GameWhereUniqueInput[]
  }

  export type UserTacticUncheckedCreateNestedManyWithoutUserInput = {
    create?: XOR<UserTacticCreateWithoutUserInput, UserTacticUncheckedCreateWithoutUserInput> | UserTacticCreateWithoutUserInput[] | UserTacticUncheckedCreateWithoutUserInput[]
    connectOrCreate?: UserTacticCreateOrConnectWithoutUserInput | UserTacticCreateOrConnectWithoutUserInput[]
    createMany?: UserTacticCreateManyUserInputEnvelope
    connect?: UserTacticWhereUniqueInput | UserTacticWhereUniqueInput[]
  }

  export type UserOpeningUncheckedCreateNestedManyWithoutUserInput = {
    create?: XOR<UserOpeningCreateWithoutUserInput, UserOpeningUncheckedCreateWithoutUserInput> | UserOpeningCreateWithoutUserInput[] | UserOpeningUncheckedCreateWithoutUserInput[]
    connectOrCreate?: UserOpeningCreateOrConnectWithoutUserInput | UserOpeningCreateOrConnectWithoutUserInput[]
    createMany?: UserOpeningCreateManyUserInputEnvelope
    connect?: UserOpeningWhereUniqueInput | UserOpeningWhereUniqueInput[]
  }

  export type StringFieldUpdateOperationsInput = {
    set?: string
  }

  export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null
  }

  export type FollowerUpdateManyWithoutFollowerNestedInput = {
    create?: XOR<FollowerCreateWithoutFollowerInput, FollowerUncheckedCreateWithoutFollowerInput> | FollowerCreateWithoutFollowerInput[] | FollowerUncheckedCreateWithoutFollowerInput[]
    connectOrCreate?: FollowerCreateOrConnectWithoutFollowerInput | FollowerCreateOrConnectWithoutFollowerInput[]
    upsert?: FollowerUpsertWithWhereUniqueWithoutFollowerInput | FollowerUpsertWithWhereUniqueWithoutFollowerInput[]
    createMany?: FollowerCreateManyFollowerInputEnvelope
    set?: FollowerWhereUniqueInput | FollowerWhereUniqueInput[]
    disconnect?: FollowerWhereUniqueInput | FollowerWhereUniqueInput[]
    delete?: FollowerWhereUniqueInput | FollowerWhereUniqueInput[]
    connect?: FollowerWhereUniqueInput | FollowerWhereUniqueInput[]
    update?: FollowerUpdateWithWhereUniqueWithoutFollowerInput | FollowerUpdateWithWhereUniqueWithoutFollowerInput[]
    updateMany?: FollowerUpdateManyWithWhereWithoutFollowerInput | FollowerUpdateManyWithWhereWithoutFollowerInput[]
    deleteMany?: FollowerScalarWhereInput | FollowerScalarWhereInput[]
  }

  export type FollowerUpdateManyWithoutFollowingNestedInput = {
    create?: XOR<FollowerCreateWithoutFollowingInput, FollowerUncheckedCreateWithoutFollowingInput> | FollowerCreateWithoutFollowingInput[] | FollowerUncheckedCreateWithoutFollowingInput[]
    connectOrCreate?: FollowerCreateOrConnectWithoutFollowingInput | FollowerCreateOrConnectWithoutFollowingInput[]
    upsert?: FollowerUpsertWithWhereUniqueWithoutFollowingInput | FollowerUpsertWithWhereUniqueWithoutFollowingInput[]
    createMany?: FollowerCreateManyFollowingInputEnvelope
    set?: FollowerWhereUniqueInput | FollowerWhereUniqueInput[]
    disconnect?: FollowerWhereUniqueInput | FollowerWhereUniqueInput[]
    delete?: FollowerWhereUniqueInput | FollowerWhereUniqueInput[]
    connect?: FollowerWhereUniqueInput | FollowerWhereUniqueInput[]
    update?: FollowerUpdateWithWhereUniqueWithoutFollowingInput | FollowerUpdateWithWhereUniqueWithoutFollowingInput[]
    updateMany?: FollowerUpdateManyWithWhereWithoutFollowingInput | FollowerUpdateManyWithWhereWithoutFollowingInput[]
    deleteMany?: FollowerScalarWhereInput | FollowerScalarWhereInput[]
  }

  export type RatingUpdateManyWithoutUserNestedInput = {
    create?: XOR<RatingCreateWithoutUserInput, RatingUncheckedCreateWithoutUserInput> | RatingCreateWithoutUserInput[] | RatingUncheckedCreateWithoutUserInput[]
    connectOrCreate?: RatingCreateOrConnectWithoutUserInput | RatingCreateOrConnectWithoutUserInput[]
    upsert?: RatingUpsertWithWhereUniqueWithoutUserInput | RatingUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: RatingCreateManyUserInputEnvelope
    set?: RatingWhereUniqueInput | RatingWhereUniqueInput[]
    disconnect?: RatingWhereUniqueInput | RatingWhereUniqueInput[]
    delete?: RatingWhereUniqueInput | RatingWhereUniqueInput[]
    connect?: RatingWhereUniqueInput | RatingWhereUniqueInput[]
    update?: RatingUpdateWithWhereUniqueWithoutUserInput | RatingUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: RatingUpdateManyWithWhereWithoutUserInput | RatingUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: RatingScalarWhereInput | RatingScalarWhereInput[]
  }

  export type GameUpdateManyWithoutWhiteNestedInput = {
    create?: XOR<GameCreateWithoutWhiteInput, GameUncheckedCreateWithoutWhiteInput> | GameCreateWithoutWhiteInput[] | GameUncheckedCreateWithoutWhiteInput[]
    connectOrCreate?: GameCreateOrConnectWithoutWhiteInput | GameCreateOrConnectWithoutWhiteInput[]
    upsert?: GameUpsertWithWhereUniqueWithoutWhiteInput | GameUpsertWithWhereUniqueWithoutWhiteInput[]
    createMany?: GameCreateManyWhiteInputEnvelope
    set?: GameWhereUniqueInput | GameWhereUniqueInput[]
    disconnect?: GameWhereUniqueInput | GameWhereUniqueInput[]
    delete?: GameWhereUniqueInput | GameWhereUniqueInput[]
    connect?: GameWhereUniqueInput | GameWhereUniqueInput[]
    update?: GameUpdateWithWhereUniqueWithoutWhiteInput | GameUpdateWithWhereUniqueWithoutWhiteInput[]
    updateMany?: GameUpdateManyWithWhereWithoutWhiteInput | GameUpdateManyWithWhereWithoutWhiteInput[]
    deleteMany?: GameScalarWhereInput | GameScalarWhereInput[]
  }

  export type GameUpdateManyWithoutBlackNestedInput = {
    create?: XOR<GameCreateWithoutBlackInput, GameUncheckedCreateWithoutBlackInput> | GameCreateWithoutBlackInput[] | GameUncheckedCreateWithoutBlackInput[]
    connectOrCreate?: GameCreateOrConnectWithoutBlackInput | GameCreateOrConnectWithoutBlackInput[]
    upsert?: GameUpsertWithWhereUniqueWithoutBlackInput | GameUpsertWithWhereUniqueWithoutBlackInput[]
    createMany?: GameCreateManyBlackInputEnvelope
    set?: GameWhereUniqueInput | GameWhereUniqueInput[]
    disconnect?: GameWhereUniqueInput | GameWhereUniqueInput[]
    delete?: GameWhereUniqueInput | GameWhereUniqueInput[]
    connect?: GameWhereUniqueInput | GameWhereUniqueInput[]
    update?: GameUpdateWithWhereUniqueWithoutBlackInput | GameUpdateWithWhereUniqueWithoutBlackInput[]
    updateMany?: GameUpdateManyWithWhereWithoutBlackInput | GameUpdateManyWithWhereWithoutBlackInput[]
    deleteMany?: GameScalarWhereInput | GameScalarWhereInput[]
  }

  export type UserTacticUpdateManyWithoutUserNestedInput = {
    create?: XOR<UserTacticCreateWithoutUserInput, UserTacticUncheckedCreateWithoutUserInput> | UserTacticCreateWithoutUserInput[] | UserTacticUncheckedCreateWithoutUserInput[]
    connectOrCreate?: UserTacticCreateOrConnectWithoutUserInput | UserTacticCreateOrConnectWithoutUserInput[]
    upsert?: UserTacticUpsertWithWhereUniqueWithoutUserInput | UserTacticUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: UserTacticCreateManyUserInputEnvelope
    set?: UserTacticWhereUniqueInput | UserTacticWhereUniqueInput[]
    disconnect?: UserTacticWhereUniqueInput | UserTacticWhereUniqueInput[]
    delete?: UserTacticWhereUniqueInput | UserTacticWhereUniqueInput[]
    connect?: UserTacticWhereUniqueInput | UserTacticWhereUniqueInput[]
    update?: UserTacticUpdateWithWhereUniqueWithoutUserInput | UserTacticUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: UserTacticUpdateManyWithWhereWithoutUserInput | UserTacticUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: UserTacticScalarWhereInput | UserTacticScalarWhereInput[]
  }

  export type UserOpeningUpdateManyWithoutUserNestedInput = {
    create?: XOR<UserOpeningCreateWithoutUserInput, UserOpeningUncheckedCreateWithoutUserInput> | UserOpeningCreateWithoutUserInput[] | UserOpeningUncheckedCreateWithoutUserInput[]
    connectOrCreate?: UserOpeningCreateOrConnectWithoutUserInput | UserOpeningCreateOrConnectWithoutUserInput[]
    upsert?: UserOpeningUpsertWithWhereUniqueWithoutUserInput | UserOpeningUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: UserOpeningCreateManyUserInputEnvelope
    set?: UserOpeningWhereUniqueInput | UserOpeningWhereUniqueInput[]
    disconnect?: UserOpeningWhereUniqueInput | UserOpeningWhereUniqueInput[]
    delete?: UserOpeningWhereUniqueInput | UserOpeningWhereUniqueInput[]
    connect?: UserOpeningWhereUniqueInput | UserOpeningWhereUniqueInput[]
    update?: UserOpeningUpdateWithWhereUniqueWithoutUserInput | UserOpeningUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: UserOpeningUpdateManyWithWhereWithoutUserInput | UserOpeningUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: UserOpeningScalarWhereInput | UserOpeningScalarWhereInput[]
  }

  export type FollowerUncheckedUpdateManyWithoutFollowerNestedInput = {
    create?: XOR<FollowerCreateWithoutFollowerInput, FollowerUncheckedCreateWithoutFollowerInput> | FollowerCreateWithoutFollowerInput[] | FollowerUncheckedCreateWithoutFollowerInput[]
    connectOrCreate?: FollowerCreateOrConnectWithoutFollowerInput | FollowerCreateOrConnectWithoutFollowerInput[]
    upsert?: FollowerUpsertWithWhereUniqueWithoutFollowerInput | FollowerUpsertWithWhereUniqueWithoutFollowerInput[]
    createMany?: FollowerCreateManyFollowerInputEnvelope
    set?: FollowerWhereUniqueInput | FollowerWhereUniqueInput[]
    disconnect?: FollowerWhereUniqueInput | FollowerWhereUniqueInput[]
    delete?: FollowerWhereUniqueInput | FollowerWhereUniqueInput[]
    connect?: FollowerWhereUniqueInput | FollowerWhereUniqueInput[]
    update?: FollowerUpdateWithWhereUniqueWithoutFollowerInput | FollowerUpdateWithWhereUniqueWithoutFollowerInput[]
    updateMany?: FollowerUpdateManyWithWhereWithoutFollowerInput | FollowerUpdateManyWithWhereWithoutFollowerInput[]
    deleteMany?: FollowerScalarWhereInput | FollowerScalarWhereInput[]
  }

  export type FollowerUncheckedUpdateManyWithoutFollowingNestedInput = {
    create?: XOR<FollowerCreateWithoutFollowingInput, FollowerUncheckedCreateWithoutFollowingInput> | FollowerCreateWithoutFollowingInput[] | FollowerUncheckedCreateWithoutFollowingInput[]
    connectOrCreate?: FollowerCreateOrConnectWithoutFollowingInput | FollowerCreateOrConnectWithoutFollowingInput[]
    upsert?: FollowerUpsertWithWhereUniqueWithoutFollowingInput | FollowerUpsertWithWhereUniqueWithoutFollowingInput[]
    createMany?: FollowerCreateManyFollowingInputEnvelope
    set?: FollowerWhereUniqueInput | FollowerWhereUniqueInput[]
    disconnect?: FollowerWhereUniqueInput | FollowerWhereUniqueInput[]
    delete?: FollowerWhereUniqueInput | FollowerWhereUniqueInput[]
    connect?: FollowerWhereUniqueInput | FollowerWhereUniqueInput[]
    update?: FollowerUpdateWithWhereUniqueWithoutFollowingInput | FollowerUpdateWithWhereUniqueWithoutFollowingInput[]
    updateMany?: FollowerUpdateManyWithWhereWithoutFollowingInput | FollowerUpdateManyWithWhereWithoutFollowingInput[]
    deleteMany?: FollowerScalarWhereInput | FollowerScalarWhereInput[]
  }

  export type RatingUncheckedUpdateManyWithoutUserNestedInput = {
    create?: XOR<RatingCreateWithoutUserInput, RatingUncheckedCreateWithoutUserInput> | RatingCreateWithoutUserInput[] | RatingUncheckedCreateWithoutUserInput[]
    connectOrCreate?: RatingCreateOrConnectWithoutUserInput | RatingCreateOrConnectWithoutUserInput[]
    upsert?: RatingUpsertWithWhereUniqueWithoutUserInput | RatingUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: RatingCreateManyUserInputEnvelope
    set?: RatingWhereUniqueInput | RatingWhereUniqueInput[]
    disconnect?: RatingWhereUniqueInput | RatingWhereUniqueInput[]
    delete?: RatingWhereUniqueInput | RatingWhereUniqueInput[]
    connect?: RatingWhereUniqueInput | RatingWhereUniqueInput[]
    update?: RatingUpdateWithWhereUniqueWithoutUserInput | RatingUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: RatingUpdateManyWithWhereWithoutUserInput | RatingUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: RatingScalarWhereInput | RatingScalarWhereInput[]
  }

  export type GameUncheckedUpdateManyWithoutWhiteNestedInput = {
    create?: XOR<GameCreateWithoutWhiteInput, GameUncheckedCreateWithoutWhiteInput> | GameCreateWithoutWhiteInput[] | GameUncheckedCreateWithoutWhiteInput[]
    connectOrCreate?: GameCreateOrConnectWithoutWhiteInput | GameCreateOrConnectWithoutWhiteInput[]
    upsert?: GameUpsertWithWhereUniqueWithoutWhiteInput | GameUpsertWithWhereUniqueWithoutWhiteInput[]
    createMany?: GameCreateManyWhiteInputEnvelope
    set?: GameWhereUniqueInput | GameWhereUniqueInput[]
    disconnect?: GameWhereUniqueInput | GameWhereUniqueInput[]
    delete?: GameWhereUniqueInput | GameWhereUniqueInput[]
    connect?: GameWhereUniqueInput | GameWhereUniqueInput[]
    update?: GameUpdateWithWhereUniqueWithoutWhiteInput | GameUpdateWithWhereUniqueWithoutWhiteInput[]
    updateMany?: GameUpdateManyWithWhereWithoutWhiteInput | GameUpdateManyWithWhereWithoutWhiteInput[]
    deleteMany?: GameScalarWhereInput | GameScalarWhereInput[]
  }

  export type GameUncheckedUpdateManyWithoutBlackNestedInput = {
    create?: XOR<GameCreateWithoutBlackInput, GameUncheckedCreateWithoutBlackInput> | GameCreateWithoutBlackInput[] | GameUncheckedCreateWithoutBlackInput[]
    connectOrCreate?: GameCreateOrConnectWithoutBlackInput | GameCreateOrConnectWithoutBlackInput[]
    upsert?: GameUpsertWithWhereUniqueWithoutBlackInput | GameUpsertWithWhereUniqueWithoutBlackInput[]
    createMany?: GameCreateManyBlackInputEnvelope
    set?: GameWhereUniqueInput | GameWhereUniqueInput[]
    disconnect?: GameWhereUniqueInput | GameWhereUniqueInput[]
    delete?: GameWhereUniqueInput | GameWhereUniqueInput[]
    connect?: GameWhereUniqueInput | GameWhereUniqueInput[]
    update?: GameUpdateWithWhereUniqueWithoutBlackInput | GameUpdateWithWhereUniqueWithoutBlackInput[]
    updateMany?: GameUpdateManyWithWhereWithoutBlackInput | GameUpdateManyWithWhereWithoutBlackInput[]
    deleteMany?: GameScalarWhereInput | GameScalarWhereInput[]
  }

  export type UserTacticUncheckedUpdateManyWithoutUserNestedInput = {
    create?: XOR<UserTacticCreateWithoutUserInput, UserTacticUncheckedCreateWithoutUserInput> | UserTacticCreateWithoutUserInput[] | UserTacticUncheckedCreateWithoutUserInput[]
    connectOrCreate?: UserTacticCreateOrConnectWithoutUserInput | UserTacticCreateOrConnectWithoutUserInput[]
    upsert?: UserTacticUpsertWithWhereUniqueWithoutUserInput | UserTacticUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: UserTacticCreateManyUserInputEnvelope
    set?: UserTacticWhereUniqueInput | UserTacticWhereUniqueInput[]
    disconnect?: UserTacticWhereUniqueInput | UserTacticWhereUniqueInput[]
    delete?: UserTacticWhereUniqueInput | UserTacticWhereUniqueInput[]
    connect?: UserTacticWhereUniqueInput | UserTacticWhereUniqueInput[]
    update?: UserTacticUpdateWithWhereUniqueWithoutUserInput | UserTacticUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: UserTacticUpdateManyWithWhereWithoutUserInput | UserTacticUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: UserTacticScalarWhereInput | UserTacticScalarWhereInput[]
  }

  export type UserOpeningUncheckedUpdateManyWithoutUserNestedInput = {
    create?: XOR<UserOpeningCreateWithoutUserInput, UserOpeningUncheckedCreateWithoutUserInput> | UserOpeningCreateWithoutUserInput[] | UserOpeningUncheckedCreateWithoutUserInput[]
    connectOrCreate?: UserOpeningCreateOrConnectWithoutUserInput | UserOpeningCreateOrConnectWithoutUserInput[]
    upsert?: UserOpeningUpsertWithWhereUniqueWithoutUserInput | UserOpeningUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: UserOpeningCreateManyUserInputEnvelope
    set?: UserOpeningWhereUniqueInput | UserOpeningWhereUniqueInput[]
    disconnect?: UserOpeningWhereUniqueInput | UserOpeningWhereUniqueInput[]
    delete?: UserOpeningWhereUniqueInput | UserOpeningWhereUniqueInput[]
    connect?: UserOpeningWhereUniqueInput | UserOpeningWhereUniqueInput[]
    update?: UserOpeningUpdateWithWhereUniqueWithoutUserInput | UserOpeningUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: UserOpeningUpdateManyWithWhereWithoutUserInput | UserOpeningUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: UserOpeningScalarWhereInput | UserOpeningScalarWhereInput[]
  }

  export type UserCreateNestedOneWithoutFollowersInput = {
    create?: XOR<UserCreateWithoutFollowersInput, UserUncheckedCreateWithoutFollowersInput>
    connectOrCreate?: UserCreateOrConnectWithoutFollowersInput
    connect?: UserWhereUniqueInput
  }

  export type UserCreateNestedOneWithoutFollowingInput = {
    create?: XOR<UserCreateWithoutFollowingInput, UserUncheckedCreateWithoutFollowingInput>
    connectOrCreate?: UserCreateOrConnectWithoutFollowingInput
    connect?: UserWhereUniqueInput
  }

  export type UserUpdateOneRequiredWithoutFollowersNestedInput = {
    create?: XOR<UserCreateWithoutFollowersInput, UserUncheckedCreateWithoutFollowersInput>
    connectOrCreate?: UserCreateOrConnectWithoutFollowersInput
    upsert?: UserUpsertWithoutFollowersInput
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutFollowersInput, UserUpdateWithoutFollowersInput>, UserUncheckedUpdateWithoutFollowersInput>
  }

  export type UserUpdateOneRequiredWithoutFollowingNestedInput = {
    create?: XOR<UserCreateWithoutFollowingInput, UserUncheckedCreateWithoutFollowingInput>
    connectOrCreate?: UserCreateOrConnectWithoutFollowingInput
    upsert?: UserUpsertWithoutFollowingInput
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutFollowingInput, UserUpdateWithoutFollowingInput>, UserUncheckedUpdateWithoutFollowingInput>
  }

  export type UserCreateNestedOneWithoutRatingsInput = {
    create?: XOR<UserCreateWithoutRatingsInput, UserUncheckedCreateWithoutRatingsInput>
    connectOrCreate?: UserCreateOrConnectWithoutRatingsInput
    connect?: UserWhereUniqueInput
  }

  export type IntFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string
  }

  export type UserUpdateOneRequiredWithoutRatingsNestedInput = {
    create?: XOR<UserCreateWithoutRatingsInput, UserUncheckedCreateWithoutRatingsInput>
    connectOrCreate?: UserCreateOrConnectWithoutRatingsInput
    upsert?: UserUpsertWithoutRatingsInput
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutRatingsInput, UserUpdateWithoutRatingsInput>, UserUncheckedUpdateWithoutRatingsInput>
  }

  export type UserCreateNestedOneWithoutWhiteGamesInput = {
    create?: XOR<UserCreateWithoutWhiteGamesInput, UserUncheckedCreateWithoutWhiteGamesInput>
    connectOrCreate?: UserCreateOrConnectWithoutWhiteGamesInput
    connect?: UserWhereUniqueInput
  }

  export type UserCreateNestedOneWithoutBlackGamesInput = {
    create?: XOR<UserCreateWithoutBlackGamesInput, UserUncheckedCreateWithoutBlackGamesInput>
    connectOrCreate?: UserCreateOrConnectWithoutBlackGamesInput
    connect?: UserWhereUniqueInput
  }

  export type BoolFieldUpdateOperationsInput = {
    set?: boolean
  }

  export type UserUpdateOneRequiredWithoutWhiteGamesNestedInput = {
    create?: XOR<UserCreateWithoutWhiteGamesInput, UserUncheckedCreateWithoutWhiteGamesInput>
    connectOrCreate?: UserCreateOrConnectWithoutWhiteGamesInput
    upsert?: UserUpsertWithoutWhiteGamesInput
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutWhiteGamesInput, UserUpdateWithoutWhiteGamesInput>, UserUncheckedUpdateWithoutWhiteGamesInput>
  }

  export type UserUpdateOneRequiredWithoutBlackGamesNestedInput = {
    create?: XOR<UserCreateWithoutBlackGamesInput, UserUncheckedCreateWithoutBlackGamesInput>
    connectOrCreate?: UserCreateOrConnectWithoutBlackGamesInput
    upsert?: UserUpsertWithoutBlackGamesInput
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutBlackGamesInput, UserUpdateWithoutBlackGamesInput>, UserUncheckedUpdateWithoutBlackGamesInput>
  }

  export type UserTacticCreateNestedManyWithoutTacticInput = {
    create?: XOR<UserTacticCreateWithoutTacticInput, UserTacticUncheckedCreateWithoutTacticInput> | UserTacticCreateWithoutTacticInput[] | UserTacticUncheckedCreateWithoutTacticInput[]
    connectOrCreate?: UserTacticCreateOrConnectWithoutTacticInput | UserTacticCreateOrConnectWithoutTacticInput[]
    createMany?: UserTacticCreateManyTacticInputEnvelope
    connect?: UserTacticWhereUniqueInput | UserTacticWhereUniqueInput[]
  }

  export type UserTacticUncheckedCreateNestedManyWithoutTacticInput = {
    create?: XOR<UserTacticCreateWithoutTacticInput, UserTacticUncheckedCreateWithoutTacticInput> | UserTacticCreateWithoutTacticInput[] | UserTacticUncheckedCreateWithoutTacticInput[]
    connectOrCreate?: UserTacticCreateOrConnectWithoutTacticInput | UserTacticCreateOrConnectWithoutTacticInput[]
    createMany?: UserTacticCreateManyTacticInputEnvelope
    connect?: UserTacticWhereUniqueInput | UserTacticWhereUniqueInput[]
  }

  export type UserTacticUpdateManyWithoutTacticNestedInput = {
    create?: XOR<UserTacticCreateWithoutTacticInput, UserTacticUncheckedCreateWithoutTacticInput> | UserTacticCreateWithoutTacticInput[] | UserTacticUncheckedCreateWithoutTacticInput[]
    connectOrCreate?: UserTacticCreateOrConnectWithoutTacticInput | UserTacticCreateOrConnectWithoutTacticInput[]
    upsert?: UserTacticUpsertWithWhereUniqueWithoutTacticInput | UserTacticUpsertWithWhereUniqueWithoutTacticInput[]
    createMany?: UserTacticCreateManyTacticInputEnvelope
    set?: UserTacticWhereUniqueInput | UserTacticWhereUniqueInput[]
    disconnect?: UserTacticWhereUniqueInput | UserTacticWhereUniqueInput[]
    delete?: UserTacticWhereUniqueInput | UserTacticWhereUniqueInput[]
    connect?: UserTacticWhereUniqueInput | UserTacticWhereUniqueInput[]
    update?: UserTacticUpdateWithWhereUniqueWithoutTacticInput | UserTacticUpdateWithWhereUniqueWithoutTacticInput[]
    updateMany?: UserTacticUpdateManyWithWhereWithoutTacticInput | UserTacticUpdateManyWithWhereWithoutTacticInput[]
    deleteMany?: UserTacticScalarWhereInput | UserTacticScalarWhereInput[]
  }

  export type UserTacticUncheckedUpdateManyWithoutTacticNestedInput = {
    create?: XOR<UserTacticCreateWithoutTacticInput, UserTacticUncheckedCreateWithoutTacticInput> | UserTacticCreateWithoutTacticInput[] | UserTacticUncheckedCreateWithoutTacticInput[]
    connectOrCreate?: UserTacticCreateOrConnectWithoutTacticInput | UserTacticCreateOrConnectWithoutTacticInput[]
    upsert?: UserTacticUpsertWithWhereUniqueWithoutTacticInput | UserTacticUpsertWithWhereUniqueWithoutTacticInput[]
    createMany?: UserTacticCreateManyTacticInputEnvelope
    set?: UserTacticWhereUniqueInput | UserTacticWhereUniqueInput[]
    disconnect?: UserTacticWhereUniqueInput | UserTacticWhereUniqueInput[]
    delete?: UserTacticWhereUniqueInput | UserTacticWhereUniqueInput[]
    connect?: UserTacticWhereUniqueInput | UserTacticWhereUniqueInput[]
    update?: UserTacticUpdateWithWhereUniqueWithoutTacticInput | UserTacticUpdateWithWhereUniqueWithoutTacticInput[]
    updateMany?: UserTacticUpdateManyWithWhereWithoutTacticInput | UserTacticUpdateManyWithWhereWithoutTacticInput[]
    deleteMany?: UserTacticScalarWhereInput | UserTacticScalarWhereInput[]
  }

  export type UserCreateNestedOneWithoutTacticsInput = {
    create?: XOR<UserCreateWithoutTacticsInput, UserUncheckedCreateWithoutTacticsInput>
    connectOrCreate?: UserCreateOrConnectWithoutTacticsInput
    connect?: UserWhereUniqueInput
  }

  export type TacticCreateNestedOneWithoutUserTacticInput = {
    create?: XOR<TacticCreateWithoutUserTacticInput, TacticUncheckedCreateWithoutUserTacticInput>
    connectOrCreate?: TacticCreateOrConnectWithoutUserTacticInput
    connect?: TacticWhereUniqueInput
  }

  export type NullableBoolFieldUpdateOperationsInput = {
    set?: boolean | null
  }

  export type NullableDateTimeFieldUpdateOperationsInput = {
    set?: Date | string | null
  }

  export type UserUpdateOneRequiredWithoutTacticsNestedInput = {
    create?: XOR<UserCreateWithoutTacticsInput, UserUncheckedCreateWithoutTacticsInput>
    connectOrCreate?: UserCreateOrConnectWithoutTacticsInput
    upsert?: UserUpsertWithoutTacticsInput
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutTacticsInput, UserUpdateWithoutTacticsInput>, UserUncheckedUpdateWithoutTacticsInput>
  }

  export type TacticUpdateOneRequiredWithoutUserTacticNestedInput = {
    create?: XOR<TacticCreateWithoutUserTacticInput, TacticUncheckedCreateWithoutUserTacticInput>
    connectOrCreate?: TacticCreateOrConnectWithoutUserTacticInput
    upsert?: TacticUpsertWithoutUserTacticInput
    connect?: TacticWhereUniqueInput
    update?: XOR<XOR<TacticUpdateToOneWithWhereWithoutUserTacticInput, TacticUpdateWithoutUserTacticInput>, TacticUncheckedUpdateWithoutUserTacticInput>
  }

  export type UserOpeningCreateevalHistoryInput = {
    set: number[]
  }

  export type UserCreateNestedOneWithoutOpeningsInput = {
    create?: XOR<UserCreateWithoutOpeningsInput, UserUncheckedCreateWithoutOpeningsInput>
    connectOrCreate?: UserCreateOrConnectWithoutOpeningsInput
    connect?: UserWhereUniqueInput
  }

  export type NullableIntFieldUpdateOperationsInput = {
    set?: number | null
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type UserOpeningUpdateevalHistoryInput = {
    set?: number[]
    push?: number | number[]
  }

  export type UserUpdateOneRequiredWithoutOpeningsNestedInput = {
    create?: XOR<UserCreateWithoutOpeningsInput, UserUncheckedCreateWithoutOpeningsInput>
    connectOrCreate?: UserCreateOrConnectWithoutOpeningsInput
    upsert?: UserUpsertWithoutOpeningsInput
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutOpeningsInput, UserUpdateWithoutOpeningsInput>, UserUncheckedUpdateWithoutOpeningsInput>
  }

  export type NestedStringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type NestedStringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type NestedStringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type NestedIntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type NestedStringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type NestedIntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type NestedDateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type NestedIntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type NestedFloatFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatFilter<$PrismaModel> | number
  }

  export type NestedDateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type NestedBoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type NestedBoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type NestedBoolNullableFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel> | null
    not?: NestedBoolNullableFilter<$PrismaModel> | boolean | null
  }

  export type NestedDateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type NestedBoolNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel> | null
    not?: NestedBoolNullableWithAggregatesFilter<$PrismaModel> | boolean | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedBoolNullableFilter<$PrismaModel>
    _max?: NestedBoolNullableFilter<$PrismaModel>
  }

  export type NestedDateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }

  export type NestedIntNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedIntNullableFilter<$PrismaModel>
    _max?: NestedIntNullableFilter<$PrismaModel>
  }

  export type NestedFloatNullableFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableFilter<$PrismaModel> | number | null
  }

  export type FollowerCreateWithoutFollowerInput = {
    id?: string
    following: UserCreateNestedOneWithoutFollowingInput
  }

  export type FollowerUncheckedCreateWithoutFollowerInput = {
    id?: string
    followingId: string
  }

  export type FollowerCreateOrConnectWithoutFollowerInput = {
    where: FollowerWhereUniqueInput
    create: XOR<FollowerCreateWithoutFollowerInput, FollowerUncheckedCreateWithoutFollowerInput>
  }

  export type FollowerCreateManyFollowerInputEnvelope = {
    data: FollowerCreateManyFollowerInput | FollowerCreateManyFollowerInput[]
    skipDuplicates?: boolean
  }

  export type FollowerCreateWithoutFollowingInput = {
    id?: string
    follower: UserCreateNestedOneWithoutFollowersInput
  }

  export type FollowerUncheckedCreateWithoutFollowingInput = {
    id?: string
    followerId: string
  }

  export type FollowerCreateOrConnectWithoutFollowingInput = {
    where: FollowerWhereUniqueInput
    create: XOR<FollowerCreateWithoutFollowingInput, FollowerUncheckedCreateWithoutFollowingInput>
  }

  export type FollowerCreateManyFollowingInputEnvelope = {
    data: FollowerCreateManyFollowingInput | FollowerCreateManyFollowingInput[]
    skipDuplicates?: boolean
  }

  export type RatingCreateWithoutUserInput = {
    id?: string
    type: string
    value: number
    createdAt?: Date | string
  }

  export type RatingUncheckedCreateWithoutUserInput = {
    id?: string
    type: string
    value: number
    createdAt?: Date | string
  }

  export type RatingCreateOrConnectWithoutUserInput = {
    where: RatingWhereUniqueInput
    create: XOR<RatingCreateWithoutUserInput, RatingUncheckedCreateWithoutUserInput>
  }

  export type RatingCreateManyUserInputEnvelope = {
    data: RatingCreateManyUserInput | RatingCreateManyUserInput[]
    skipDuplicates?: boolean
  }

  export type GameCreateWithoutWhiteInput = {
    id?: string
    whiteRating: number
    blackRating: number
    type: string
    isRated?: boolean
    playedAt?: Date | string
    pgn: string
    openingNr: number
    result: string
    black: UserCreateNestedOneWithoutBlackGamesInput
  }

  export type GameUncheckedCreateWithoutWhiteInput = {
    id?: string
    blackId: string
    whiteRating: number
    blackRating: number
    type: string
    isRated?: boolean
    playedAt?: Date | string
    pgn: string
    openingNr: number
    result: string
  }

  export type GameCreateOrConnectWithoutWhiteInput = {
    where: GameWhereUniqueInput
    create: XOR<GameCreateWithoutWhiteInput, GameUncheckedCreateWithoutWhiteInput>
  }

  export type GameCreateManyWhiteInputEnvelope = {
    data: GameCreateManyWhiteInput | GameCreateManyWhiteInput[]
    skipDuplicates?: boolean
  }

  export type GameCreateWithoutBlackInput = {
    id?: string
    whiteRating: number
    blackRating: number
    type: string
    isRated?: boolean
    playedAt?: Date | string
    pgn: string
    openingNr: number
    result: string
    white: UserCreateNestedOneWithoutWhiteGamesInput
  }

  export type GameUncheckedCreateWithoutBlackInput = {
    id?: string
    whiteId: string
    whiteRating: number
    blackRating: number
    type: string
    isRated?: boolean
    playedAt?: Date | string
    pgn: string
    openingNr: number
    result: string
  }

  export type GameCreateOrConnectWithoutBlackInput = {
    where: GameWhereUniqueInput
    create: XOR<GameCreateWithoutBlackInput, GameUncheckedCreateWithoutBlackInput>
  }

  export type GameCreateManyBlackInputEnvelope = {
    data: GameCreateManyBlackInput | GameCreateManyBlackInput[]
    skipDuplicates?: boolean
  }

  export type UserTacticCreateWithoutUserInput = {
    id?: string
    solved?: boolean | null
    finished?: Date | string | null
    tactic: TacticCreateNestedOneWithoutUserTacticInput
  }

  export type UserTacticUncheckedCreateWithoutUserInput = {
    id?: string
    tacticId: number
    solved?: boolean | null
    finished?: Date | string | null
  }

  export type UserTacticCreateOrConnectWithoutUserInput = {
    where: UserTacticWhereUniqueInput
    create: XOR<UserTacticCreateWithoutUserInput, UserTacticUncheckedCreateWithoutUserInput>
  }

  export type UserTacticCreateManyUserInputEnvelope = {
    data: UserTacticCreateManyUserInput | UserTacticCreateManyUserInput[]
    skipDuplicates?: boolean
  }

  export type UserOpeningCreateWithoutUserInput = {
    id?: string
    openingNr: number
    color: string
    pgn?: string | null
    evalCp?: number | null
    finished?: Date | string | null
    evalHistory?: UserOpeningCreateevalHistoryInput | number[]
  }

  export type UserOpeningUncheckedCreateWithoutUserInput = {
    id?: string
    openingNr: number
    color: string
    pgn?: string | null
    evalCp?: number | null
    finished?: Date | string | null
    evalHistory?: UserOpeningCreateevalHistoryInput | number[]
  }

  export type UserOpeningCreateOrConnectWithoutUserInput = {
    where: UserOpeningWhereUniqueInput
    create: XOR<UserOpeningCreateWithoutUserInput, UserOpeningUncheckedCreateWithoutUserInput>
  }

  export type UserOpeningCreateManyUserInputEnvelope = {
    data: UserOpeningCreateManyUserInput | UserOpeningCreateManyUserInput[]
    skipDuplicates?: boolean
  }

  export type FollowerUpsertWithWhereUniqueWithoutFollowerInput = {
    where: FollowerWhereUniqueInput
    update: XOR<FollowerUpdateWithoutFollowerInput, FollowerUncheckedUpdateWithoutFollowerInput>
    create: XOR<FollowerCreateWithoutFollowerInput, FollowerUncheckedCreateWithoutFollowerInput>
  }

  export type FollowerUpdateWithWhereUniqueWithoutFollowerInput = {
    where: FollowerWhereUniqueInput
    data: XOR<FollowerUpdateWithoutFollowerInput, FollowerUncheckedUpdateWithoutFollowerInput>
  }

  export type FollowerUpdateManyWithWhereWithoutFollowerInput = {
    where: FollowerScalarWhereInput
    data: XOR<FollowerUpdateManyMutationInput, FollowerUncheckedUpdateManyWithoutFollowerInput>
  }

  export type FollowerScalarWhereInput = {
    AND?: FollowerScalarWhereInput | FollowerScalarWhereInput[]
    OR?: FollowerScalarWhereInput[]
    NOT?: FollowerScalarWhereInput | FollowerScalarWhereInput[]
    id?: StringFilter<"Follower"> | string
    followerId?: StringFilter<"Follower"> | string
    followingId?: StringFilter<"Follower"> | string
  }

  export type FollowerUpsertWithWhereUniqueWithoutFollowingInput = {
    where: FollowerWhereUniqueInput
    update: XOR<FollowerUpdateWithoutFollowingInput, FollowerUncheckedUpdateWithoutFollowingInput>
    create: XOR<FollowerCreateWithoutFollowingInput, FollowerUncheckedCreateWithoutFollowingInput>
  }

  export type FollowerUpdateWithWhereUniqueWithoutFollowingInput = {
    where: FollowerWhereUniqueInput
    data: XOR<FollowerUpdateWithoutFollowingInput, FollowerUncheckedUpdateWithoutFollowingInput>
  }

  export type FollowerUpdateManyWithWhereWithoutFollowingInput = {
    where: FollowerScalarWhereInput
    data: XOR<FollowerUpdateManyMutationInput, FollowerUncheckedUpdateManyWithoutFollowingInput>
  }

  export type RatingUpsertWithWhereUniqueWithoutUserInput = {
    where: RatingWhereUniqueInput
    update: XOR<RatingUpdateWithoutUserInput, RatingUncheckedUpdateWithoutUserInput>
    create: XOR<RatingCreateWithoutUserInput, RatingUncheckedCreateWithoutUserInput>
  }

  export type RatingUpdateWithWhereUniqueWithoutUserInput = {
    where: RatingWhereUniqueInput
    data: XOR<RatingUpdateWithoutUserInput, RatingUncheckedUpdateWithoutUserInput>
  }

  export type RatingUpdateManyWithWhereWithoutUserInput = {
    where: RatingScalarWhereInput
    data: XOR<RatingUpdateManyMutationInput, RatingUncheckedUpdateManyWithoutUserInput>
  }

  export type RatingScalarWhereInput = {
    AND?: RatingScalarWhereInput | RatingScalarWhereInput[]
    OR?: RatingScalarWhereInput[]
    NOT?: RatingScalarWhereInput | RatingScalarWhereInput[]
    id?: StringFilter<"Rating"> | string
    userId?: StringFilter<"Rating"> | string
    type?: StringFilter<"Rating"> | string
    value?: IntFilter<"Rating"> | number
    createdAt?: DateTimeFilter<"Rating"> | Date | string
  }

  export type GameUpsertWithWhereUniqueWithoutWhiteInput = {
    where: GameWhereUniqueInput
    update: XOR<GameUpdateWithoutWhiteInput, GameUncheckedUpdateWithoutWhiteInput>
    create: XOR<GameCreateWithoutWhiteInput, GameUncheckedCreateWithoutWhiteInput>
  }

  export type GameUpdateWithWhereUniqueWithoutWhiteInput = {
    where: GameWhereUniqueInput
    data: XOR<GameUpdateWithoutWhiteInput, GameUncheckedUpdateWithoutWhiteInput>
  }

  export type GameUpdateManyWithWhereWithoutWhiteInput = {
    where: GameScalarWhereInput
    data: XOR<GameUpdateManyMutationInput, GameUncheckedUpdateManyWithoutWhiteInput>
  }

  export type GameScalarWhereInput = {
    AND?: GameScalarWhereInput | GameScalarWhereInput[]
    OR?: GameScalarWhereInput[]
    NOT?: GameScalarWhereInput | GameScalarWhereInput[]
    id?: StringFilter<"Game"> | string
    whiteId?: StringFilter<"Game"> | string
    blackId?: StringFilter<"Game"> | string
    whiteRating?: IntFilter<"Game"> | number
    blackRating?: IntFilter<"Game"> | number
    type?: StringFilter<"Game"> | string
    isRated?: BoolFilter<"Game"> | boolean
    playedAt?: DateTimeFilter<"Game"> | Date | string
    pgn?: StringFilter<"Game"> | string
    openingNr?: IntFilter<"Game"> | number
    result?: StringFilter<"Game"> | string
  }

  export type GameUpsertWithWhereUniqueWithoutBlackInput = {
    where: GameWhereUniqueInput
    update: XOR<GameUpdateWithoutBlackInput, GameUncheckedUpdateWithoutBlackInput>
    create: XOR<GameCreateWithoutBlackInput, GameUncheckedCreateWithoutBlackInput>
  }

  export type GameUpdateWithWhereUniqueWithoutBlackInput = {
    where: GameWhereUniqueInput
    data: XOR<GameUpdateWithoutBlackInput, GameUncheckedUpdateWithoutBlackInput>
  }

  export type GameUpdateManyWithWhereWithoutBlackInput = {
    where: GameScalarWhereInput
    data: XOR<GameUpdateManyMutationInput, GameUncheckedUpdateManyWithoutBlackInput>
  }

  export type UserTacticUpsertWithWhereUniqueWithoutUserInput = {
    where: UserTacticWhereUniqueInput
    update: XOR<UserTacticUpdateWithoutUserInput, UserTacticUncheckedUpdateWithoutUserInput>
    create: XOR<UserTacticCreateWithoutUserInput, UserTacticUncheckedCreateWithoutUserInput>
  }

  export type UserTacticUpdateWithWhereUniqueWithoutUserInput = {
    where: UserTacticWhereUniqueInput
    data: XOR<UserTacticUpdateWithoutUserInput, UserTacticUncheckedUpdateWithoutUserInput>
  }

  export type UserTacticUpdateManyWithWhereWithoutUserInput = {
    where: UserTacticScalarWhereInput
    data: XOR<UserTacticUpdateManyMutationInput, UserTacticUncheckedUpdateManyWithoutUserInput>
  }

  export type UserTacticScalarWhereInput = {
    AND?: UserTacticScalarWhereInput | UserTacticScalarWhereInput[]
    OR?: UserTacticScalarWhereInput[]
    NOT?: UserTacticScalarWhereInput | UserTacticScalarWhereInput[]
    id?: StringFilter<"UserTactic"> | string
    userId?: StringFilter<"UserTactic"> | string
    tacticId?: IntFilter<"UserTactic"> | number
    solved?: BoolNullableFilter<"UserTactic"> | boolean | null
    finished?: DateTimeNullableFilter<"UserTactic"> | Date | string | null
  }

  export type UserOpeningUpsertWithWhereUniqueWithoutUserInput = {
    where: UserOpeningWhereUniqueInput
    update: XOR<UserOpeningUpdateWithoutUserInput, UserOpeningUncheckedUpdateWithoutUserInput>
    create: XOR<UserOpeningCreateWithoutUserInput, UserOpeningUncheckedCreateWithoutUserInput>
  }

  export type UserOpeningUpdateWithWhereUniqueWithoutUserInput = {
    where: UserOpeningWhereUniqueInput
    data: XOR<UserOpeningUpdateWithoutUserInput, UserOpeningUncheckedUpdateWithoutUserInput>
  }

  export type UserOpeningUpdateManyWithWhereWithoutUserInput = {
    where: UserOpeningScalarWhereInput
    data: XOR<UserOpeningUpdateManyMutationInput, UserOpeningUncheckedUpdateManyWithoutUserInput>
  }

  export type UserOpeningScalarWhereInput = {
    AND?: UserOpeningScalarWhereInput | UserOpeningScalarWhereInput[]
    OR?: UserOpeningScalarWhereInput[]
    NOT?: UserOpeningScalarWhereInput | UserOpeningScalarWhereInput[]
    id?: StringFilter<"UserOpening"> | string
    userId?: StringFilter<"UserOpening"> | string
    openingNr?: IntFilter<"UserOpening"> | number
    color?: StringFilter<"UserOpening"> | string
    pgn?: StringNullableFilter<"UserOpening"> | string | null
    evalCp?: IntNullableFilter<"UserOpening"> | number | null
    finished?: DateTimeNullableFilter<"UserOpening"> | Date | string | null
    evalHistory?: IntNullableListFilter<"UserOpening">
  }

  export type UserCreateWithoutFollowersInput = {
    id?: string
    email: string
    name?: string | null
    bio?: string | null
    following?: FollowerCreateNestedManyWithoutFollowingInput
    ratings?: RatingCreateNestedManyWithoutUserInput
    whiteGames?: GameCreateNestedManyWithoutWhiteInput
    blackGames?: GameCreateNestedManyWithoutBlackInput
    tactics?: UserTacticCreateNestedManyWithoutUserInput
    openings?: UserOpeningCreateNestedManyWithoutUserInput
  }

  export type UserUncheckedCreateWithoutFollowersInput = {
    id?: string
    email: string
    name?: string | null
    bio?: string | null
    following?: FollowerUncheckedCreateNestedManyWithoutFollowingInput
    ratings?: RatingUncheckedCreateNestedManyWithoutUserInput
    whiteGames?: GameUncheckedCreateNestedManyWithoutWhiteInput
    blackGames?: GameUncheckedCreateNestedManyWithoutBlackInput
    tactics?: UserTacticUncheckedCreateNestedManyWithoutUserInput
    openings?: UserOpeningUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserCreateOrConnectWithoutFollowersInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutFollowersInput, UserUncheckedCreateWithoutFollowersInput>
  }

  export type UserCreateWithoutFollowingInput = {
    id?: string
    email: string
    name?: string | null
    bio?: string | null
    followers?: FollowerCreateNestedManyWithoutFollowerInput
    ratings?: RatingCreateNestedManyWithoutUserInput
    whiteGames?: GameCreateNestedManyWithoutWhiteInput
    blackGames?: GameCreateNestedManyWithoutBlackInput
    tactics?: UserTacticCreateNestedManyWithoutUserInput
    openings?: UserOpeningCreateNestedManyWithoutUserInput
  }

  export type UserUncheckedCreateWithoutFollowingInput = {
    id?: string
    email: string
    name?: string | null
    bio?: string | null
    followers?: FollowerUncheckedCreateNestedManyWithoutFollowerInput
    ratings?: RatingUncheckedCreateNestedManyWithoutUserInput
    whiteGames?: GameUncheckedCreateNestedManyWithoutWhiteInput
    blackGames?: GameUncheckedCreateNestedManyWithoutBlackInput
    tactics?: UserTacticUncheckedCreateNestedManyWithoutUserInput
    openings?: UserOpeningUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserCreateOrConnectWithoutFollowingInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutFollowingInput, UserUncheckedCreateWithoutFollowingInput>
  }

  export type UserUpsertWithoutFollowersInput = {
    update: XOR<UserUpdateWithoutFollowersInput, UserUncheckedUpdateWithoutFollowersInput>
    create: XOR<UserCreateWithoutFollowersInput, UserUncheckedCreateWithoutFollowersInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutFollowersInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutFollowersInput, UserUncheckedUpdateWithoutFollowersInput>
  }

  export type UserUpdateWithoutFollowersInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    bio?: NullableStringFieldUpdateOperationsInput | string | null
    following?: FollowerUpdateManyWithoutFollowingNestedInput
    ratings?: RatingUpdateManyWithoutUserNestedInput
    whiteGames?: GameUpdateManyWithoutWhiteNestedInput
    blackGames?: GameUpdateManyWithoutBlackNestedInput
    tactics?: UserTacticUpdateManyWithoutUserNestedInput
    openings?: UserOpeningUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateWithoutFollowersInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    bio?: NullableStringFieldUpdateOperationsInput | string | null
    following?: FollowerUncheckedUpdateManyWithoutFollowingNestedInput
    ratings?: RatingUncheckedUpdateManyWithoutUserNestedInput
    whiteGames?: GameUncheckedUpdateManyWithoutWhiteNestedInput
    blackGames?: GameUncheckedUpdateManyWithoutBlackNestedInput
    tactics?: UserTacticUncheckedUpdateManyWithoutUserNestedInput
    openings?: UserOpeningUncheckedUpdateManyWithoutUserNestedInput
  }

  export type UserUpsertWithoutFollowingInput = {
    update: XOR<UserUpdateWithoutFollowingInput, UserUncheckedUpdateWithoutFollowingInput>
    create: XOR<UserCreateWithoutFollowingInput, UserUncheckedCreateWithoutFollowingInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutFollowingInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutFollowingInput, UserUncheckedUpdateWithoutFollowingInput>
  }

  export type UserUpdateWithoutFollowingInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    bio?: NullableStringFieldUpdateOperationsInput | string | null
    followers?: FollowerUpdateManyWithoutFollowerNestedInput
    ratings?: RatingUpdateManyWithoutUserNestedInput
    whiteGames?: GameUpdateManyWithoutWhiteNestedInput
    blackGames?: GameUpdateManyWithoutBlackNestedInput
    tactics?: UserTacticUpdateManyWithoutUserNestedInput
    openings?: UserOpeningUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateWithoutFollowingInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    bio?: NullableStringFieldUpdateOperationsInput | string | null
    followers?: FollowerUncheckedUpdateManyWithoutFollowerNestedInput
    ratings?: RatingUncheckedUpdateManyWithoutUserNestedInput
    whiteGames?: GameUncheckedUpdateManyWithoutWhiteNestedInput
    blackGames?: GameUncheckedUpdateManyWithoutBlackNestedInput
    tactics?: UserTacticUncheckedUpdateManyWithoutUserNestedInput
    openings?: UserOpeningUncheckedUpdateManyWithoutUserNestedInput
  }

  export type UserCreateWithoutRatingsInput = {
    id?: string
    email: string
    name?: string | null
    bio?: string | null
    followers?: FollowerCreateNestedManyWithoutFollowerInput
    following?: FollowerCreateNestedManyWithoutFollowingInput
    whiteGames?: GameCreateNestedManyWithoutWhiteInput
    blackGames?: GameCreateNestedManyWithoutBlackInput
    tactics?: UserTacticCreateNestedManyWithoutUserInput
    openings?: UserOpeningCreateNestedManyWithoutUserInput
  }

  export type UserUncheckedCreateWithoutRatingsInput = {
    id?: string
    email: string
    name?: string | null
    bio?: string | null
    followers?: FollowerUncheckedCreateNestedManyWithoutFollowerInput
    following?: FollowerUncheckedCreateNestedManyWithoutFollowingInput
    whiteGames?: GameUncheckedCreateNestedManyWithoutWhiteInput
    blackGames?: GameUncheckedCreateNestedManyWithoutBlackInput
    tactics?: UserTacticUncheckedCreateNestedManyWithoutUserInput
    openings?: UserOpeningUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserCreateOrConnectWithoutRatingsInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutRatingsInput, UserUncheckedCreateWithoutRatingsInput>
  }

  export type UserUpsertWithoutRatingsInput = {
    update: XOR<UserUpdateWithoutRatingsInput, UserUncheckedUpdateWithoutRatingsInput>
    create: XOR<UserCreateWithoutRatingsInput, UserUncheckedCreateWithoutRatingsInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutRatingsInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutRatingsInput, UserUncheckedUpdateWithoutRatingsInput>
  }

  export type UserUpdateWithoutRatingsInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    bio?: NullableStringFieldUpdateOperationsInput | string | null
    followers?: FollowerUpdateManyWithoutFollowerNestedInput
    following?: FollowerUpdateManyWithoutFollowingNestedInput
    whiteGames?: GameUpdateManyWithoutWhiteNestedInput
    blackGames?: GameUpdateManyWithoutBlackNestedInput
    tactics?: UserTacticUpdateManyWithoutUserNestedInput
    openings?: UserOpeningUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateWithoutRatingsInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    bio?: NullableStringFieldUpdateOperationsInput | string | null
    followers?: FollowerUncheckedUpdateManyWithoutFollowerNestedInput
    following?: FollowerUncheckedUpdateManyWithoutFollowingNestedInput
    whiteGames?: GameUncheckedUpdateManyWithoutWhiteNestedInput
    blackGames?: GameUncheckedUpdateManyWithoutBlackNestedInput
    tactics?: UserTacticUncheckedUpdateManyWithoutUserNestedInput
    openings?: UserOpeningUncheckedUpdateManyWithoutUserNestedInput
  }

  export type UserCreateWithoutWhiteGamesInput = {
    id?: string
    email: string
    name?: string | null
    bio?: string | null
    followers?: FollowerCreateNestedManyWithoutFollowerInput
    following?: FollowerCreateNestedManyWithoutFollowingInput
    ratings?: RatingCreateNestedManyWithoutUserInput
    blackGames?: GameCreateNestedManyWithoutBlackInput
    tactics?: UserTacticCreateNestedManyWithoutUserInput
    openings?: UserOpeningCreateNestedManyWithoutUserInput
  }

  export type UserUncheckedCreateWithoutWhiteGamesInput = {
    id?: string
    email: string
    name?: string | null
    bio?: string | null
    followers?: FollowerUncheckedCreateNestedManyWithoutFollowerInput
    following?: FollowerUncheckedCreateNestedManyWithoutFollowingInput
    ratings?: RatingUncheckedCreateNestedManyWithoutUserInput
    blackGames?: GameUncheckedCreateNestedManyWithoutBlackInput
    tactics?: UserTacticUncheckedCreateNestedManyWithoutUserInput
    openings?: UserOpeningUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserCreateOrConnectWithoutWhiteGamesInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutWhiteGamesInput, UserUncheckedCreateWithoutWhiteGamesInput>
  }

  export type UserCreateWithoutBlackGamesInput = {
    id?: string
    email: string
    name?: string | null
    bio?: string | null
    followers?: FollowerCreateNestedManyWithoutFollowerInput
    following?: FollowerCreateNestedManyWithoutFollowingInput
    ratings?: RatingCreateNestedManyWithoutUserInput
    whiteGames?: GameCreateNestedManyWithoutWhiteInput
    tactics?: UserTacticCreateNestedManyWithoutUserInput
    openings?: UserOpeningCreateNestedManyWithoutUserInput
  }

  export type UserUncheckedCreateWithoutBlackGamesInput = {
    id?: string
    email: string
    name?: string | null
    bio?: string | null
    followers?: FollowerUncheckedCreateNestedManyWithoutFollowerInput
    following?: FollowerUncheckedCreateNestedManyWithoutFollowingInput
    ratings?: RatingUncheckedCreateNestedManyWithoutUserInput
    whiteGames?: GameUncheckedCreateNestedManyWithoutWhiteInput
    tactics?: UserTacticUncheckedCreateNestedManyWithoutUserInput
    openings?: UserOpeningUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserCreateOrConnectWithoutBlackGamesInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutBlackGamesInput, UserUncheckedCreateWithoutBlackGamesInput>
  }

  export type UserUpsertWithoutWhiteGamesInput = {
    update: XOR<UserUpdateWithoutWhiteGamesInput, UserUncheckedUpdateWithoutWhiteGamesInput>
    create: XOR<UserCreateWithoutWhiteGamesInput, UserUncheckedCreateWithoutWhiteGamesInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutWhiteGamesInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutWhiteGamesInput, UserUncheckedUpdateWithoutWhiteGamesInput>
  }

  export type UserUpdateWithoutWhiteGamesInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    bio?: NullableStringFieldUpdateOperationsInput | string | null
    followers?: FollowerUpdateManyWithoutFollowerNestedInput
    following?: FollowerUpdateManyWithoutFollowingNestedInput
    ratings?: RatingUpdateManyWithoutUserNestedInput
    blackGames?: GameUpdateManyWithoutBlackNestedInput
    tactics?: UserTacticUpdateManyWithoutUserNestedInput
    openings?: UserOpeningUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateWithoutWhiteGamesInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    bio?: NullableStringFieldUpdateOperationsInput | string | null
    followers?: FollowerUncheckedUpdateManyWithoutFollowerNestedInput
    following?: FollowerUncheckedUpdateManyWithoutFollowingNestedInput
    ratings?: RatingUncheckedUpdateManyWithoutUserNestedInput
    blackGames?: GameUncheckedUpdateManyWithoutBlackNestedInput
    tactics?: UserTacticUncheckedUpdateManyWithoutUserNestedInput
    openings?: UserOpeningUncheckedUpdateManyWithoutUserNestedInput
  }

  export type UserUpsertWithoutBlackGamesInput = {
    update: XOR<UserUpdateWithoutBlackGamesInput, UserUncheckedUpdateWithoutBlackGamesInput>
    create: XOR<UserCreateWithoutBlackGamesInput, UserUncheckedCreateWithoutBlackGamesInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutBlackGamesInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutBlackGamesInput, UserUncheckedUpdateWithoutBlackGamesInput>
  }

  export type UserUpdateWithoutBlackGamesInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    bio?: NullableStringFieldUpdateOperationsInput | string | null
    followers?: FollowerUpdateManyWithoutFollowerNestedInput
    following?: FollowerUpdateManyWithoutFollowingNestedInput
    ratings?: RatingUpdateManyWithoutUserNestedInput
    whiteGames?: GameUpdateManyWithoutWhiteNestedInput
    tactics?: UserTacticUpdateManyWithoutUserNestedInput
    openings?: UserOpeningUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateWithoutBlackGamesInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    bio?: NullableStringFieldUpdateOperationsInput | string | null
    followers?: FollowerUncheckedUpdateManyWithoutFollowerNestedInput
    following?: FollowerUncheckedUpdateManyWithoutFollowingNestedInput
    ratings?: RatingUncheckedUpdateManyWithoutUserNestedInput
    whiteGames?: GameUncheckedUpdateManyWithoutWhiteNestedInput
    tactics?: UserTacticUncheckedUpdateManyWithoutUserNestedInput
    openings?: UserOpeningUncheckedUpdateManyWithoutUserNestedInput
  }

  export type UserTacticCreateWithoutTacticInput = {
    id?: string
    solved?: boolean | null
    finished?: Date | string | null
    user: UserCreateNestedOneWithoutTacticsInput
  }

  export type UserTacticUncheckedCreateWithoutTacticInput = {
    id?: string
    userId: string
    solved?: boolean | null
    finished?: Date | string | null
  }

  export type UserTacticCreateOrConnectWithoutTacticInput = {
    where: UserTacticWhereUniqueInput
    create: XOR<UserTacticCreateWithoutTacticInput, UserTacticUncheckedCreateWithoutTacticInput>
  }

  export type UserTacticCreateManyTacticInputEnvelope = {
    data: UserTacticCreateManyTacticInput | UserTacticCreateManyTacticInput[]
    skipDuplicates?: boolean
  }

  export type UserTacticUpsertWithWhereUniqueWithoutTacticInput = {
    where: UserTacticWhereUniqueInput
    update: XOR<UserTacticUpdateWithoutTacticInput, UserTacticUncheckedUpdateWithoutTacticInput>
    create: XOR<UserTacticCreateWithoutTacticInput, UserTacticUncheckedCreateWithoutTacticInput>
  }

  export type UserTacticUpdateWithWhereUniqueWithoutTacticInput = {
    where: UserTacticWhereUniqueInput
    data: XOR<UserTacticUpdateWithoutTacticInput, UserTacticUncheckedUpdateWithoutTacticInput>
  }

  export type UserTacticUpdateManyWithWhereWithoutTacticInput = {
    where: UserTacticScalarWhereInput
    data: XOR<UserTacticUpdateManyMutationInput, UserTacticUncheckedUpdateManyWithoutTacticInput>
  }

  export type UserCreateWithoutTacticsInput = {
    id?: string
    email: string
    name?: string | null
    bio?: string | null
    followers?: FollowerCreateNestedManyWithoutFollowerInput
    following?: FollowerCreateNestedManyWithoutFollowingInput
    ratings?: RatingCreateNestedManyWithoutUserInput
    whiteGames?: GameCreateNestedManyWithoutWhiteInput
    blackGames?: GameCreateNestedManyWithoutBlackInput
    openings?: UserOpeningCreateNestedManyWithoutUserInput
  }

  export type UserUncheckedCreateWithoutTacticsInput = {
    id?: string
    email: string
    name?: string | null
    bio?: string | null
    followers?: FollowerUncheckedCreateNestedManyWithoutFollowerInput
    following?: FollowerUncheckedCreateNestedManyWithoutFollowingInput
    ratings?: RatingUncheckedCreateNestedManyWithoutUserInput
    whiteGames?: GameUncheckedCreateNestedManyWithoutWhiteInput
    blackGames?: GameUncheckedCreateNestedManyWithoutBlackInput
    openings?: UserOpeningUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserCreateOrConnectWithoutTacticsInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutTacticsInput, UserUncheckedCreateWithoutTacticsInput>
  }

  export type TacticCreateWithoutUserTacticInput = {
    id: number
    fen: string
    rating: number
    openingNr: number
    moveNr: number
  }

  export type TacticUncheckedCreateWithoutUserTacticInput = {
    id: number
    fen: string
    rating: number
    openingNr: number
    moveNr: number
  }

  export type TacticCreateOrConnectWithoutUserTacticInput = {
    where: TacticWhereUniqueInput
    create: XOR<TacticCreateWithoutUserTacticInput, TacticUncheckedCreateWithoutUserTacticInput>
  }

  export type UserUpsertWithoutTacticsInput = {
    update: XOR<UserUpdateWithoutTacticsInput, UserUncheckedUpdateWithoutTacticsInput>
    create: XOR<UserCreateWithoutTacticsInput, UserUncheckedCreateWithoutTacticsInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutTacticsInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutTacticsInput, UserUncheckedUpdateWithoutTacticsInput>
  }

  export type UserUpdateWithoutTacticsInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    bio?: NullableStringFieldUpdateOperationsInput | string | null
    followers?: FollowerUpdateManyWithoutFollowerNestedInput
    following?: FollowerUpdateManyWithoutFollowingNestedInput
    ratings?: RatingUpdateManyWithoutUserNestedInput
    whiteGames?: GameUpdateManyWithoutWhiteNestedInput
    blackGames?: GameUpdateManyWithoutBlackNestedInput
    openings?: UserOpeningUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateWithoutTacticsInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    bio?: NullableStringFieldUpdateOperationsInput | string | null
    followers?: FollowerUncheckedUpdateManyWithoutFollowerNestedInput
    following?: FollowerUncheckedUpdateManyWithoutFollowingNestedInput
    ratings?: RatingUncheckedUpdateManyWithoutUserNestedInput
    whiteGames?: GameUncheckedUpdateManyWithoutWhiteNestedInput
    blackGames?: GameUncheckedUpdateManyWithoutBlackNestedInput
    openings?: UserOpeningUncheckedUpdateManyWithoutUserNestedInput
  }

  export type TacticUpsertWithoutUserTacticInput = {
    update: XOR<TacticUpdateWithoutUserTacticInput, TacticUncheckedUpdateWithoutUserTacticInput>
    create: XOR<TacticCreateWithoutUserTacticInput, TacticUncheckedCreateWithoutUserTacticInput>
    where?: TacticWhereInput
  }

  export type TacticUpdateToOneWithWhereWithoutUserTacticInput = {
    where?: TacticWhereInput
    data: XOR<TacticUpdateWithoutUserTacticInput, TacticUncheckedUpdateWithoutUserTacticInput>
  }

  export type TacticUpdateWithoutUserTacticInput = {
    id?: IntFieldUpdateOperationsInput | number
    fen?: StringFieldUpdateOperationsInput | string
    rating?: IntFieldUpdateOperationsInput | number
    openingNr?: IntFieldUpdateOperationsInput | number
    moveNr?: IntFieldUpdateOperationsInput | number
  }

  export type TacticUncheckedUpdateWithoutUserTacticInput = {
    id?: IntFieldUpdateOperationsInput | number
    fen?: StringFieldUpdateOperationsInput | string
    rating?: IntFieldUpdateOperationsInput | number
    openingNr?: IntFieldUpdateOperationsInput | number
    moveNr?: IntFieldUpdateOperationsInput | number
  }

  export type UserCreateWithoutOpeningsInput = {
    id?: string
    email: string
    name?: string | null
    bio?: string | null
    followers?: FollowerCreateNestedManyWithoutFollowerInput
    following?: FollowerCreateNestedManyWithoutFollowingInput
    ratings?: RatingCreateNestedManyWithoutUserInput
    whiteGames?: GameCreateNestedManyWithoutWhiteInput
    blackGames?: GameCreateNestedManyWithoutBlackInput
    tactics?: UserTacticCreateNestedManyWithoutUserInput
  }

  export type UserUncheckedCreateWithoutOpeningsInput = {
    id?: string
    email: string
    name?: string | null
    bio?: string | null
    followers?: FollowerUncheckedCreateNestedManyWithoutFollowerInput
    following?: FollowerUncheckedCreateNestedManyWithoutFollowingInput
    ratings?: RatingUncheckedCreateNestedManyWithoutUserInput
    whiteGames?: GameUncheckedCreateNestedManyWithoutWhiteInput
    blackGames?: GameUncheckedCreateNestedManyWithoutBlackInput
    tactics?: UserTacticUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserCreateOrConnectWithoutOpeningsInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutOpeningsInput, UserUncheckedCreateWithoutOpeningsInput>
  }

  export type UserUpsertWithoutOpeningsInput = {
    update: XOR<UserUpdateWithoutOpeningsInput, UserUncheckedUpdateWithoutOpeningsInput>
    create: XOR<UserCreateWithoutOpeningsInput, UserUncheckedCreateWithoutOpeningsInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutOpeningsInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutOpeningsInput, UserUncheckedUpdateWithoutOpeningsInput>
  }

  export type UserUpdateWithoutOpeningsInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    bio?: NullableStringFieldUpdateOperationsInput | string | null
    followers?: FollowerUpdateManyWithoutFollowerNestedInput
    following?: FollowerUpdateManyWithoutFollowingNestedInput
    ratings?: RatingUpdateManyWithoutUserNestedInput
    whiteGames?: GameUpdateManyWithoutWhiteNestedInput
    blackGames?: GameUpdateManyWithoutBlackNestedInput
    tactics?: UserTacticUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateWithoutOpeningsInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    bio?: NullableStringFieldUpdateOperationsInput | string | null
    followers?: FollowerUncheckedUpdateManyWithoutFollowerNestedInput
    following?: FollowerUncheckedUpdateManyWithoutFollowingNestedInput
    ratings?: RatingUncheckedUpdateManyWithoutUserNestedInput
    whiteGames?: GameUncheckedUpdateManyWithoutWhiteNestedInput
    blackGames?: GameUncheckedUpdateManyWithoutBlackNestedInput
    tactics?: UserTacticUncheckedUpdateManyWithoutUserNestedInput
  }

  export type FollowerCreateManyFollowerInput = {
    id?: string
    followingId: string
  }

  export type FollowerCreateManyFollowingInput = {
    id?: string
    followerId: string
  }

  export type RatingCreateManyUserInput = {
    id?: string
    type: string
    value: number
    createdAt?: Date | string
  }

  export type GameCreateManyWhiteInput = {
    id?: string
    blackId: string
    whiteRating: number
    blackRating: number
    type: string
    isRated?: boolean
    playedAt?: Date | string
    pgn: string
    openingNr: number
    result: string
  }

  export type GameCreateManyBlackInput = {
    id?: string
    whiteId: string
    whiteRating: number
    blackRating: number
    type: string
    isRated?: boolean
    playedAt?: Date | string
    pgn: string
    openingNr: number
    result: string
  }

  export type UserTacticCreateManyUserInput = {
    id?: string
    tacticId: number
    solved?: boolean | null
    finished?: Date | string | null
  }

  export type UserOpeningCreateManyUserInput = {
    id?: string
    openingNr: number
    color: string
    pgn?: string | null
    evalCp?: number | null
    finished?: Date | string | null
    evalHistory?: UserOpeningCreateevalHistoryInput | number[]
  }

  export type FollowerUpdateWithoutFollowerInput = {
    id?: StringFieldUpdateOperationsInput | string
    following?: UserUpdateOneRequiredWithoutFollowingNestedInput
  }

  export type FollowerUncheckedUpdateWithoutFollowerInput = {
    id?: StringFieldUpdateOperationsInput | string
    followingId?: StringFieldUpdateOperationsInput | string
  }

  export type FollowerUncheckedUpdateManyWithoutFollowerInput = {
    id?: StringFieldUpdateOperationsInput | string
    followingId?: StringFieldUpdateOperationsInput | string
  }

  export type FollowerUpdateWithoutFollowingInput = {
    id?: StringFieldUpdateOperationsInput | string
    follower?: UserUpdateOneRequiredWithoutFollowersNestedInput
  }

  export type FollowerUncheckedUpdateWithoutFollowingInput = {
    id?: StringFieldUpdateOperationsInput | string
    followerId?: StringFieldUpdateOperationsInput | string
  }

  export type FollowerUncheckedUpdateManyWithoutFollowingInput = {
    id?: StringFieldUpdateOperationsInput | string
    followerId?: StringFieldUpdateOperationsInput | string
  }

  export type RatingUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    type?: StringFieldUpdateOperationsInput | string
    value?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type RatingUncheckedUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    type?: StringFieldUpdateOperationsInput | string
    value?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type RatingUncheckedUpdateManyWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    type?: StringFieldUpdateOperationsInput | string
    value?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type GameUpdateWithoutWhiteInput = {
    id?: StringFieldUpdateOperationsInput | string
    whiteRating?: IntFieldUpdateOperationsInput | number
    blackRating?: IntFieldUpdateOperationsInput | number
    type?: StringFieldUpdateOperationsInput | string
    isRated?: BoolFieldUpdateOperationsInput | boolean
    playedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    pgn?: StringFieldUpdateOperationsInput | string
    openingNr?: IntFieldUpdateOperationsInput | number
    result?: StringFieldUpdateOperationsInput | string
    black?: UserUpdateOneRequiredWithoutBlackGamesNestedInput
  }

  export type GameUncheckedUpdateWithoutWhiteInput = {
    id?: StringFieldUpdateOperationsInput | string
    blackId?: StringFieldUpdateOperationsInput | string
    whiteRating?: IntFieldUpdateOperationsInput | number
    blackRating?: IntFieldUpdateOperationsInput | number
    type?: StringFieldUpdateOperationsInput | string
    isRated?: BoolFieldUpdateOperationsInput | boolean
    playedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    pgn?: StringFieldUpdateOperationsInput | string
    openingNr?: IntFieldUpdateOperationsInput | number
    result?: StringFieldUpdateOperationsInput | string
  }

  export type GameUncheckedUpdateManyWithoutWhiteInput = {
    id?: StringFieldUpdateOperationsInput | string
    blackId?: StringFieldUpdateOperationsInput | string
    whiteRating?: IntFieldUpdateOperationsInput | number
    blackRating?: IntFieldUpdateOperationsInput | number
    type?: StringFieldUpdateOperationsInput | string
    isRated?: BoolFieldUpdateOperationsInput | boolean
    playedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    pgn?: StringFieldUpdateOperationsInput | string
    openingNr?: IntFieldUpdateOperationsInput | number
    result?: StringFieldUpdateOperationsInput | string
  }

  export type GameUpdateWithoutBlackInput = {
    id?: StringFieldUpdateOperationsInput | string
    whiteRating?: IntFieldUpdateOperationsInput | number
    blackRating?: IntFieldUpdateOperationsInput | number
    type?: StringFieldUpdateOperationsInput | string
    isRated?: BoolFieldUpdateOperationsInput | boolean
    playedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    pgn?: StringFieldUpdateOperationsInput | string
    openingNr?: IntFieldUpdateOperationsInput | number
    result?: StringFieldUpdateOperationsInput | string
    white?: UserUpdateOneRequiredWithoutWhiteGamesNestedInput
  }

  export type GameUncheckedUpdateWithoutBlackInput = {
    id?: StringFieldUpdateOperationsInput | string
    whiteId?: StringFieldUpdateOperationsInput | string
    whiteRating?: IntFieldUpdateOperationsInput | number
    blackRating?: IntFieldUpdateOperationsInput | number
    type?: StringFieldUpdateOperationsInput | string
    isRated?: BoolFieldUpdateOperationsInput | boolean
    playedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    pgn?: StringFieldUpdateOperationsInput | string
    openingNr?: IntFieldUpdateOperationsInput | number
    result?: StringFieldUpdateOperationsInput | string
  }

  export type GameUncheckedUpdateManyWithoutBlackInput = {
    id?: StringFieldUpdateOperationsInput | string
    whiteId?: StringFieldUpdateOperationsInput | string
    whiteRating?: IntFieldUpdateOperationsInput | number
    blackRating?: IntFieldUpdateOperationsInput | number
    type?: StringFieldUpdateOperationsInput | string
    isRated?: BoolFieldUpdateOperationsInput | boolean
    playedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    pgn?: StringFieldUpdateOperationsInput | string
    openingNr?: IntFieldUpdateOperationsInput | number
    result?: StringFieldUpdateOperationsInput | string
  }

  export type UserTacticUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    solved?: NullableBoolFieldUpdateOperationsInput | boolean | null
    finished?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    tactic?: TacticUpdateOneRequiredWithoutUserTacticNestedInput
  }

  export type UserTacticUncheckedUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    tacticId?: IntFieldUpdateOperationsInput | number
    solved?: NullableBoolFieldUpdateOperationsInput | boolean | null
    finished?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type UserTacticUncheckedUpdateManyWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    tacticId?: IntFieldUpdateOperationsInput | number
    solved?: NullableBoolFieldUpdateOperationsInput | boolean | null
    finished?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type UserOpeningUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    openingNr?: IntFieldUpdateOperationsInput | number
    color?: StringFieldUpdateOperationsInput | string
    pgn?: NullableStringFieldUpdateOperationsInput | string | null
    evalCp?: NullableIntFieldUpdateOperationsInput | number | null
    finished?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    evalHistory?: UserOpeningUpdateevalHistoryInput | number[]
  }

  export type UserOpeningUncheckedUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    openingNr?: IntFieldUpdateOperationsInput | number
    color?: StringFieldUpdateOperationsInput | string
    pgn?: NullableStringFieldUpdateOperationsInput | string | null
    evalCp?: NullableIntFieldUpdateOperationsInput | number | null
    finished?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    evalHistory?: UserOpeningUpdateevalHistoryInput | number[]
  }

  export type UserOpeningUncheckedUpdateManyWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    openingNr?: IntFieldUpdateOperationsInput | number
    color?: StringFieldUpdateOperationsInput | string
    pgn?: NullableStringFieldUpdateOperationsInput | string | null
    evalCp?: NullableIntFieldUpdateOperationsInput | number | null
    finished?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    evalHistory?: UserOpeningUpdateevalHistoryInput | number[]
  }

  export type UserTacticCreateManyTacticInput = {
    id?: string
    userId: string
    solved?: boolean | null
    finished?: Date | string | null
  }

  export type UserTacticUpdateWithoutTacticInput = {
    id?: StringFieldUpdateOperationsInput | string
    solved?: NullableBoolFieldUpdateOperationsInput | boolean | null
    finished?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    user?: UserUpdateOneRequiredWithoutTacticsNestedInput
  }

  export type UserTacticUncheckedUpdateWithoutTacticInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    solved?: NullableBoolFieldUpdateOperationsInput | boolean | null
    finished?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type UserTacticUncheckedUpdateManyWithoutTacticInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    solved?: NullableBoolFieldUpdateOperationsInput | boolean | null
    finished?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }



  /**
   * Batch Payload for updateMany & deleteMany & createMany
   */

  export type BatchPayload = {
    count: number
  }

  /**
   * DMMF
   */
  export const dmmf: runtime.BaseDMMF
}