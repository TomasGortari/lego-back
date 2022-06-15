import { defineEndpoint } from '@directus/extensions-sdk';
import { ItemsService, MetaService } from 'directus';
import { Query } from '@directus/shared/types';

interface IRequestBody {
  fields: string[];
  tags: number[];
  price: [number, number];
  query: Query;
  name: string;
}

export default defineEndpoint((router, ctx) => {
  const { InvalidPayloadException, ItemsService, MetaService } = ctx.services;

  router.get('/', async (_req, res, next) => {
    /** Check for body */
    if (!_req.body)
      return next(new InvalidPayloadException('Please provide a body'));
    const body = {
      name: _req.query?.name || '',
      minPrice: Number(_req.query?.minPrice) || 0,
      maxPrice: Number(_req.query?.maxPrice) || 100000000,
      tags: (_req.query?.tags as string[])?.map((tag) => Number(tag)) || [],
      fields: _req.query?.fields || ['*.*.*'],
    };

    // /** Init announcements service */
    const announcementsService: ItemsService = new ItemsService(
      'announcement',
      {
        schema: _req.schema,
        accountability: _req.accountability,
        knex: ctx.database,
      }
    );

    // const metaService: MetaService = new MetaService({
    //   accountability: _req.accountability,
    //   knex: ctx.database,
    //   schema: _req.schema,
    // });

    // /** Get properties from DB using req body and catch errors */
    const announcements = await announcementsService
      .readByQuery({
        fields: body.fields as string[],
        filter: {
          _and: (body?.tags as number[])?.map((tagId) => ({
            tags: {
              tags_id: {
                _eq: tagId,
              },
            },
          })),
          price: {
            _between: [body.minPrice, body.maxPrice],
          },
          _or: [
            {
              name: {
                _icontains: body.name as string,
              },
            },

            {
              user: {
                first_name: { _icontains: body.name as string },
              },
            },
            {
              user: {
                last_name: { _icontains: body.name as string },
              },
            },
            {
              user: {
                email: { _icontains: body.name as string },
              },
            },
          ],
        },
      })
      .then((res) => res)
      .catch((err) => {
        ctx.logger.error({ msg: '[SEARCH][READ_BY_QUERY]', err });
      });

    if (!announcements?.length) return res.send({ data: [] });
    // const meta = await metaService.getMetaForQuery('announcement', {
    //   ...body,
    //   meta: ['filter_count'],
    // });

    return res.send({
      data: announcements,
    });
  });
});
