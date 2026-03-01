// arken/packages/node/types/mongo.d.ts

import 'mongoose';
import type { Query as MongooseQuery, QueryWithHelpers as MongooseQueryWithHelpers } from 'mongoose';

declare module 'mongoose' {
  // Mongoose 8+ Query generic signature
  interface Query<ResultType, DocType, THelpers = {}, RawDocType = DocType, QueryOp = any, DocTypeFromQuery = DocType> {
    asJSON(): Promise<any>;
  }

  // Some APIs use QueryWithHelpers, so augment that too to be safe
  interface QueryWithHelpers<
    ResultType,
    DocType,
    THelpers = {},
    RawDocType = DocType,
    QueryOp = any,
    DocTypeFromQuery = DocType
  > {
    asJSON(): Promise<any>;
  }
}
