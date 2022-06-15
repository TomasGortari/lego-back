import { Accountability } from '@directus/shared/types';
import { Query } from '@directus/shared/types';
import { SchemaOverview } from '@directus/shared/types';

export {};

declare global {
  namespace Express {
    export interface Request {
      token: string | null;
      collection: string;
      sanitizedQuery: Query;
      schema: SchemaOverview;
      accountability?: Accountability;
      singleton?: boolean;
    }
  }
}
