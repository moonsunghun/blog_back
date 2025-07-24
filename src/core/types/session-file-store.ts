declare module 'session-file-store' {
  import * as session from 'express-session';

  interface FileStoreOptions {
    path?: string;
    ttl?: number;
    retries?: number;
  }

  function FileStore(session: typeof import('express-session')): {
    new (options?: FileStoreOptions): session.Store;
  };

  export = FileStore;
}
