// arken/node/db
// 
import { ReplaySubject } from 'rxjs';
import Loki from 'lokijs';
// import * as jetpack from 'fs-jetpack';
import mongoose, {
  ConnectOptions,
  Model as MongooseModel,
  Schema,
  Document,
  Types,
  Connection,
  Mongoose,
  Query,
} from 'mongoose';
import { Model } from './mongo';
import safeStringify from 'fast-safe-stringify';
import fsPath from 'path';

import { v4 as uuidv4 } from 'uuid';
import _ from 'lodash';

export function isPostgresError(error: unknown): boolean {
  if (!error) {
    return false;
  }

  return _.every(['severity', 'code', 'detail', 'internalQuery', 'routine'], (attr) => _.has(error as object, attr));
}

export function isUniqueConstraintViolation(error) {
  return isPostgresError(error) && error.code === '23505';
}

export function generateLongId(): string {
  return uuidv4().toUpperCase();
}

export function generateShortId() {
  const timestamp = ((new Date().getTime() / 1000) | 0).toString(16);
  return timestamp + 'xxxxxxxxxxxxxxxx'.replace(/[x]/g, () => ((Math.random() * 16) | 0).toString(16)).toLowerCase();
}

export const uuidFormat = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx';

export function generateLongId2(): string {
  return uuidFormat
    .replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    })
    .toUpperCase();
}

export function decodeRequest(data: any): any {
  if (
    data === undefined ||
    data === null ||
    typeof data === 'string' ||
    typeof data === 'number' ||
    typeof data === 'boolean'
  )
    return data;

  if (Array.isArray(data)) {
    return data.map(decodeRequest);
  }

  if (typeof data !== 'object') return data;

  const res: any = {};

  for (const key in data) {
    if (key === 'set') {
      return data[key];
    } else if (['create', 'connectOrCreate', 'upsert'].includes(key)) {
      return decodeRequest(data[key]);
    } else {
      res[key] = decodeRequest(data[key]);
    }
  }

  return Object.keys(res).length === 0 ? null : res;
}

export function escapeStringRegexp(string: string): string {
  if (typeof string !== 'string') {
    throw new TypeError('Expected a string');
  }

  return string.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&').replace(/-/g, '\\x2d');
}

let app: any;
let log: (...msgs: any[]) => void;

const isObject = (obj: any): obj is Record<string, any> => obj && typeof obj === 'object';

const createNestedProxy = <T extends Record<string, any>>(obj: T): T =>
  new Proxy(obj, {
    // @ts-ignore
    get(target, prop: keyof T) {
      if (prop in target) {
        // @ts-ignore
        if (isObject(target[prop]) && !(target[prop] instanceof Promise)) {
          return createNestedProxy(target[prop]);
        }
        return target[prop];
      } else {
        (target as any)[prop] = {};
        return createNestedProxy((target as any)[prop]);
      }
    },
  });

// const applicationExcludedModels = ['Omniverse', 'Metaverse', 'Application'];

// export class Model<T extends Document> {
//   protected model: MongooseModel<T>;
//   protected schema: Schema;

//   constructor(model: MongooseModel<T>) {
//     this.model = model;
//     this.schema = model.schema;
//   }

//   aggregate(...props: any[]): any {
//     return this.model.aggregate(...props);
//   }

//   where(...props: [any, any]): any {
//     return this.model.where(...props);
//   }

//   find(filter: Record<string, any> = {}, options: Record<string, any> = {}): Query<T[], T> {
//     if (!applicationExcludedModels.includes(this.model.modelName)) {
//       filter.applicationId = app.filters.applicationId;
//     }

//     if (filter.applicationId && typeof filter.applicationId === 'string') {
//       filter.applicationId = filter.applicationId;
//     }

//     return this.model.find(filter, options);
//   }

//   findAll(): Query<T[], T> {
//     return this.model.find();
//   }

//   async upsert(
//     filter: Record<string, any> = {},
//     create: Record<string, any> = {},
//     update: Record<string, any> = {},
//     options: Record<string, any> = {}
//   ): Promise<any> {
//     console.log('Trying to find model with filter', filter, options);
//     const res = await this.findOne(filter, options).exec();
//     console.log('Result of findOne', res);
//     if (res) {
//       await this.update(filter, update, options);
//       return await this.findOne(filter, options).exec();
//     } else {
//       return await this.create(create);
//     }
//   }

//   findOne(filter: Record<string, any> = {}, options: Record<string, any> = {}): Query<T | null, T> {
//     console.log(this.model.modelName);
//     if (!applicationExcludedModels.includes(this.model.modelName)) {
//       filter.applicationId = app.filters.applicationId;
//     }

//     if (filter.applicationId && typeof filter.applicationId === 'string') {
//       filter.applicationId = filter.applicationId;
//     }

//     return this.model.findOne(filter, options);
//   }

//   create(data: Record<string, any>): any {
//     console.log(this.model.modelName);
//     if (!applicationExcludedModels.includes(this.model.modelName)) {
//       data.applicationId = app.filters.applicationId;
//     }

//     if (data.applicationId && typeof data.applicationId === 'string') {
//       data.applicationId = data.applicationId;
//     }

//     const res = this.model.create(data);

//     const createHandler = <U extends object>(path: string[] = []): ProxyHandler<U> => ({
//       // @ts-ignore
//       get: (target: U, key: keyof U): any => {
//         if (key === 'isProxy') return true;
//         if (typeof target[key] === 'object' && target[key] != null) {
//           // @ts-ignore
//           return new Proxy(target[key], createHandler([...path, key as string]));
//         }
//         return target[key];
//       },
//       // @ts-ignore
//       set: (target: U, key: keyof U, value: any): boolean => {
//         console.log(`Setting ${[...path, key]} to: `, value);
//         target[key] = value;
//         return true;
//       },
//     });

//     if ((res as any).meta) (res as any).meta = new Proxy((res as any).meta, createHandler<any>());

//     return res;
//   }

//   update(filter: Record<string, any>, update: Record<string, any>, options: Record<string, any> = {}): any {
//     if (!applicationExcludedModels.includes(this.model.modelName)) {
//       filter.applicationId = app.filters.applicationId;
//       update.applicationId = app.filters.applicationId; // Ensure the update object includes applicationId
//     }

//     if (filter.applicationId && typeof filter.applicationId === 'string') {
//       filter.applicationId = filter.applicationId;
//     }

//     if (update.applicationId && typeof update.applicationId === 'string') {
//       update.applicationId = update.applicationId;
//     }

//     return this.model.updateOne(filter, update, options);
//   }

//   updateOne(...props: [any, any]): any {
//     return this.update(...props);
//   }

//   countDocuments(): any {
//     return this.model.countDocuments();
//   }
// }

class Database {
  // @ts-ignore
  public loki: Loki | null = null;
  public mongoose: Connection;
  public collections: Record<string, any>[] = [];
  public channel = {
    log: new ReplaySubject<any[]>(10),
  };
  public data = {
    model: {} as Record<string, Model<Document>>,
  };

  constructor() {}

  log(...msgs: any[]) {
    this.channel.log.next(msgs);
  }

  Schema = mongoose.Schema;
  schema: Record<string, Schema> = {};

  async initLoki() {
    this.loki = new Loki(null, {
      autoload: false,
      autosave: false,
    });

    this.restoreData();

    setInterval(this.saveData.bind(this), 30 * 1000);
  }

  async initMongoose() {
    this.mongoose = await mongoose
      .connect(process.env.MONGO_ENDPOINT!, {
        retryWrites: false,
        useNewUrlParser: true,
        useUnifiedTopology: true,
        ssl: false,
        tls: false,
        serverSelectionTimeoutMS: 5000,
        directConnection: true,
      } as ConnectOptions)
      .then((conn) => conn.connection);

    // const mongoose: any = await Mongoose.connect(config.db.endpoint, {
    // useNewUrlParser: true,
    // useUnifiedTopology: true,
    // replicaSet: 'myReplicaSetName',
    // } as ConnectOptions);

    // mongoose.connection.on('connected', function () {
    // console.log('Mongoose connection open to ' + config.db.endpoint);
    // });

    // // If the connection throws an error
    // mongoose.connection.on('error', function (err) {
    // console.log('Mongoose connection error: ' + err);
    // });

    // // When the connection is disconnected
    // mongoose.connection.on('disconnected', function () {
    // console.log('Mongoose connection disconnected');
    // });

    // // if the Node process ends, close the Mongoose connection
    // process.on('SIGINT', function () {
    // mongoose.connection.close(function () {
    //     console.log('Mongoose connection disconnected through app termination');
    // });
    // setTimeout(function () {
    //     process.exit(0);
    // }, 50);
    // });
    // // if the Node process ends, close the Mongoose connection
    // process.on('SIGTERM', function () {
    // mongoose.connection.close(function () {
    //     console.log('Mongoose connection disconnected through app termination');
    // });
    // setTimeout(function () {
    //     process.exit(0);
    // }, 50);
    // });

    // this.mongoose.connection.on('connected', () => {
    //   log('Mongoose connection open to ' + process.env.MONGO_ENDPOINT);
    // });

    // this.mongoose.connection.on('error', err => {
    //   log('Mongoose connection error: ' + err);
    // });

    // this.mongoose.connection.on('disconnected', () => {
    //   log('Mongoose connection disconnected');
    // });

    process.on('SIGINT', async () => {
      // @ts-ignore
      if (this.mongoose?.connection)
        // @ts-ignore
        await this.mongoose.connection.close();

      console.log('Mongoose connection disconnected through app termination');
      process.exit(0);
    });
  }

  model<T extends Document>(key: string, schema?: Schema): Model<T> | undefined {
    if (schema) {
      // @ts-ignore
      this.data.model[key] = new Model<T>(mongoose.model<T>(key, schema, key));
    }

    if (!this.data.model[key]) {
      log(`DB Model not found: ${key}`);
    }

    // @ts-ignore
    return this.data.model[key] as Model<T>;
  }

  initCollection(name: string, key: string, data: Record<string, any>) {
    if (!this.collections[name]) this.collections[name] = {};

    if (!this.collections[name][key]) {
      this.collections[name][key] = this.loki!.addCollection(`${name}.${key}`);
    }

    if (key === 'config') {
      delete data.meta;
      delete data.$loki;

      if (!this.collections[name][key].length) {
        this.collections[name][key].insert(data);
      }

      for (const k in data) {
        if (this.collections[name][key].data[0][k] === undefined && data[k] !== undefined) {
          this.collections[name][key].data[0][k] = data[k];
        }
      }

      for (const k in this.collections[name][key].data[0]) {
        if (Object.prototype.hasOwnProperty.call(this.collections[name][key].data[0], k)) {
          if (this.collections[name][key][k] === undefined) {
            Object.defineProperty(this.collections[name][key], k, {
              get() {
                return this.collections[name][key].data[0][k];
              },
              set(x) {
                this.collections[name][key].data[0][k] = x;
              },
            });
          }
        }
      }
    } else {
      for (const i in data) {
        const item = data[i];
        delete item.meta;
        delete item.$loki;

        if (!this.collections[name][key].data.length) {
          this.collections[name][key].insert(item);
        }

        for (const k in item) {
          if (typeof this.collections[name][key].data[i] === 'undefined') this.collections[name][key].data[i] = {};

          if (this.collections[name][key].data[i][k] === undefined && item[k] !== undefined) {
            this.collections[name][key].data[i][k] = item[k];
          }
        }
      }
    }

    this.collections[name][key].ensureId();
    this.collections[name][key].ensureAllIndexes(true);
  }

  initCollections(name: string, data: Record<string, any>) {
    log(`Adding collection: ${name}`);

    for (const key in data) {
      this.initCollection(name, key, data[key]);
    }

    return this.collections[name];
  }

  getCollections(name: string) {
    return this.collections[name];
  }

  saveData() {
    log('Saving data', ['p1']);

    const data: Record<string, any> = {};

    // for (const name in this.collections) {
    //     data[name] = {}

    //     for (const key in this.collections[name]) {
    //         if (key === 'config') {
    //             delete this.collections[name][key].data[0].meta
    //             delete this.collections[name][key].data[0].$loki
    //             data[name].config = this.collections[name][key].data[0]
    //         } else {
    //             data[name][key] = Object.keys(this.collections[name][key].data).map(k => {
    //                 const item = this.collections[name][key].data[k]
    //                 delete item.meta
    //                 delete item.$loki
    //                 return item
    //             })
    //         }

    //         jetpack.write(`data/db/${name}/${key}.json`, this.beautify(data[name][key]))
    //         jetpack.write(`data/db/${name}/${key}.json.backup`, this.beautify(data[name][key]))
    //     }
    // }
  }

  restoreData() {
    log('Restoring data', ['p1']);

    // const files = jetpack.find(fsPath.join(__dirname, 'data/db'), { matching: '**/*.json' });

    // for (const file of files) {
    //   log(`Found file: ${file}`);

    //   try {
    //     const data = jetpack.read(file, 'json');
    //     const [name, key] = file.replace('data/db/', '').replace('.json', '').split('/');

    //     this.initCollection(name, key, data as Record<string, any>);
    //   } catch (e) {
    //     if (e.toString().indexOf('JSON parsing failed') !== -1) {
    //       log(`File corrupt, loading backup: ${file}`);

    //       const data = jetpack.read(`${file}.backup`, 'json');
    //       const [name, key] = file.replace('data/db/', '').replace('.json', '').split('/');

    //       this.initCollection(name, key, data as Record<string, any>);
    //     }
    //   }
    // }
  }

  beautify(data: any) {
    return JSON.stringify(JSON.parse(safeStringify(data)), null, 4);
  }
}

export const db = new Database();

export async function init(props: { app: any }) {
  app = props.app;
  log = db.log.bind(db);

  await db.initLoki();
  await db.initMongoose();

  return db;
}
