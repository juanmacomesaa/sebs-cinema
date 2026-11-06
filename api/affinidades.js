
import { timingSafeEqual } from 'node:crypto';
import { db, send } from './_shared.js';

function same(a, b) {
  if (!a || !b) return false;
  const x = Buffer.from(String(a));
  const y = Buffer.from(String(b));
  return x.length === y.length && timingSafeEqual(x, y);
}

function identify(req) {
  const code = req.headers['x-sebs-affinity-code'];
  if (same(code, process.env.SEBS_JUANMA_AFFINITIES_CODE)) {
    return 'Juanma';
  }
  if (same(code, process.env.SEBS_POUK_AFFINITIES_CODE)) {
    return 'Pouk';
  }
  return null;
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');

  try {
    const member = identify(req);

    if (!member) {
      return send(res, 401, {
        error: 'Código de Afinidades incorrecto'
      });
    }

    if (req.method === 'GET') {
      const movies = await db(
        '/affinity_movies?select=*&order=id.asc'
      );
      const votes = await db(
        '/affinity_votes?select=movie_id,member,vote'
      );

      const myVotes = votes.filter(v => v.member === member);
      const matches = movies.filter(movie =>
        votes.some(v =>
          v.movie_id === movie.id &&
          v.member === 'Juanma' &&
          v.vote === 'like'
        ) &&
        votes.some(v =>
          v.movie_id === movie.id &&
          v.member === 'Pouk' &&
          v.vote === 'like'
        )
      );

      return send(res, 200, {
        member,
        movies,
        myVotes,
        matches
      });
    }

    if (req.method === 'POST') {
      const movieId = Number(req.body?.movie_id);
      const vote = req.body?.vote;

      if (!Number.isSafeInteger(movieId) || movieId <= 0 ||
          !['like', 'pass'].includes(vote)) {
        return send(res, 400, { error: 'Voto inválido' });
      }

      const movies = await db(
        '/affinity_movies?id=eq.' + movieId + '&select=id'
      );

      if (!movies.length) {
        return send(res, 404, { error: 'Película inexistente' });
      }

      await db('/affinity_votes?on_conflict=movie_id,member', {
        method: 'POST',
        headers: { Prefer: 'resolution=merge-duplicates' },
        body: JSON.stringify({
          movie_id: movieId,
          member,
          vote
        })
      });

      const votes = await db(
        '/affinity_votes?movie_id=eq.' + movieId +
        '&select=member,vote'
      );

      const match = ['Juanma', 'Pouk'].every(name =>
        votes.some(v => v.member === name && v.vote === 'like')
      );

      return send(res, 200, { ok: true, match });
    }

    return send(res, 405, { error: 'Método no permitido' });

  } catch (error) {
    console.error('Afinidades API:', error);
    return send(res, 500, {
      error: 'No se pudo procesar la solicitud'
    });
  }
}
