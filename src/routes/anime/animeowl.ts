import { FastifyRequest, FastifyReply, FastifyInstance, RegisterOptions } from 'fastify';
import { ANIME } from '@consumet/extensions';

const routes = async (fastify: FastifyInstance, options: RegisterOptions) => {
  const animeowl = new ANIME.AnimeOwl();

  fastify.get('/', (_, rp) => {
    rp.status(200).send({
      intro:
        "Welcome to the animeowl provider: check out the provider's website @ https://animeowl.me/",
      routes: [
        '/:query',
        '/info/:id',
        '/watch/:episodeId',
        '/top-airing',
        '/recent-episodes',
        '/movies',
        '/tv',
        '/ova',
        '/ona',
        '/special',
        '/spotlight',
        '/genres',
        '/genre/:genre',
        '/suggestions/:query'
      ],
      documentation: 'https://docs.consumet.org/#tag/animeowl',
    });
  });

  fastify.get('/:query', async (request: FastifyRequest, reply: FastifyReply) => {
    const query = (request.params as { query: string }).query;
    const page = (request.query as { page: number }).page;

    try {
      const res = await animeowl.search(query, page);
      reply.status(200).send(res);
    } catch (err) {
      reply
        .status(500)
        .send({ message: 'Something went wrong. Contact developer for help.' });
    }
  });

  fastify.get('/info/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    const id = decodeURIComponent((request.params as { id: string }).id);

    try {
      const res = await animeowl
        .fetchAnimeInfo(id)
        .catch((err) => reply.status(404).send({ message: err }));

      reply.status(200).send(res);
    } catch (err) {
      reply
        .status(500)
        .send({ message: 'Something went wrong. Contact developer for help.' });
    }
  });

  fastify.get('/watch', async (request: FastifyRequest, reply: FastifyReply) => {
    const episodeId = (request.query as { episodeId: string }).episodeId;
    const server = (request.query as { server: string }).server;
    const subOrDub = (request.query as { subOrDub: string }).subOrDub;

    try {
      const res = await animeowl.fetchEpisodeSources(episodeId, server, subOrDub);
      reply.status(200).send(res);
    } catch (err) {
      console.log(err);
      reply
        .status(500)
        .send({ message: 'Something went wrong. Contact developer for help.' });
    }
  });

  fastify.get('/servers/:episodeId', async (request: FastifyRequest, reply: FastifyReply) => {
    const episodeId = decodeURIComponent((request.params as { episodeId: string }).episodeId);
    const subOrDub = (request.query as { subOrDub: string }).subOrDub;

    try {
      const res = await animeowl.fetchEpisodeServers(episodeId, subOrDub);
      reply.status(200).send(res);
    } catch (err) {
      console.log(err);
      reply
        .status(500)
        .send({ message: 'Something went wrong. Contact developer for help.' });
    }
  });

  fastify.get('/top-airing', async (request: FastifyRequest, reply: FastifyReply) => {
    const page = (request.query as { page: number }).page;

    try {
      const res = await animeowl.fetchTopAiring(page);
      reply.status(200).send(res);
    } catch (err) {
      reply
        .status(500)
        .send({ message: 'Something went wrong. Contact developer for help.' });
    }
  });

  fastify.get('/recent-episodes', async (request: FastifyRequest, reply: FastifyReply) => {
    const page = (request.query as { page: number }).page;

    try {
      const res = await animeowl.fetchRecentlyUpdated(page);
      reply.status(200).send(res);
    } catch (err) {
      reply
        .status(500)
        .send({ message: 'Something went wrong. Contact developer for help.' });
    }
  });

  fastify.get('/movies', async (request: FastifyRequest, reply: FastifyReply) => {
    const page = (request.query as { page: number }).page;

    try {
      const res = await animeowl.fetchMovie(page);
      reply.status(200).send(res);
    } catch (err) {
      reply
        .status(500)
        .send({ message: 'Something went wrong. Contact developer for help.' });
    }
  });

  fastify.get('/tv', async (request: FastifyRequest, reply: FastifyReply) => {
    const page = (request.query as { page: number }).page;

    try {
      const res = await animeowl.fetchTV(page);
      reply.status(200).send(res);
    } catch (err) {
      reply
        .status(500)
        .send({ message: 'Something went wrong. Contact developer for help.' });
    }
  });

  fastify.get('/ova', async (request: FastifyRequest, reply: FastifyReply) => {
    const page = (request.query as { page: number }).page;

    try {
      const res = await animeowl.fetchOVA(page);
      reply.status(200).send(res);
    } catch (err) {
      reply
        .status(500)
        .send({ message: 'Something went wrong. Contact developer for help.' });
    }
  });

  fastify.get('/ona', async (request: FastifyRequest, reply: FastifyReply) => {
    const page = (request.query as { page: number }).page;

    try {
      const res = await animeowl.fetchONA(page);
      reply.status(200).send(res);
    } catch (err) {
      reply
        .status(500)
        .send({ message: 'Something went wrong. Contact developer for help.' });
    }
  });

  fastify.get('/special', async (request: FastifyRequest, reply: FastifyReply) => {
    const page = (request.query as { page: number }).page;

    try {
      const res = await animeowl.fetchSpecial(page);
      reply.status(200).send(res);
    } catch (err) {
      reply
        .status(500)
        .send({ message: 'Something went wrong. Contact developer for help.' });
    }
  });

  fastify.get('/spotlight', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const res = await animeowl.fetchSpotlight();
      reply.status(200).send(res);
    } catch (err) {
      reply
        .status(500)
        .send({ message: 'Something went wrong. Contact developer for help.' });
    }
  });

  fastify.get('/genres', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const res = await animeowl.fetchGenres();
      reply.status(200).send(res);
    } catch (err) {
      reply
        .status(500)
        .send({ message: 'Something went wrong. Contact developer for help.' });
    }
  });

  fastify.get('/genre/:genre', async (request: FastifyRequest, reply: FastifyReply) => {
    const genre = (request.params as { genre: string }).genre;
    const page = (request.query as { page: number }).page;

    try {
      const res = await animeowl.genreSearch(genre, page);
      reply.status(200).send(res);
    } catch (err) {
      reply
        .status(500)
        .send({ message: 'Something went wrong. Contact developer for help.' });
    }
  });

  fastify.get('/suggestions/:query', async (request: FastifyRequest, reply: FastifyReply) => {
    const query = (request.params as { query: string }).query;

    try {
      const res = await animeowl.fetchSearchSuggestions(query);
      reply.status(200).send(res);
    } catch (err) {
      reply
        .status(500)
        .send({ message: 'Something went wrong. Contact developer for help.' });
    }
  });
};

export default routes;
