import { affinityDb, db, send } from './_shared.js';

function identify(req) {
  const member = String(req.headers['x-sebs-affinity-member'] || req.query?.member || '');
  return ['Juanma', 'Pouk'].includes(member) ? member : null;
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  try {
    const member = identify(req);
    if (!member) return send(res, 400, { error: 'Elegí el perfil Juanma o Pouk para continuar.' });

    if (req.method === 'GET') {
      const [allMovies, votes, watchedRows] = await Promise.all([
        affinityDb('affinity_movies', '?select=*&order=id.asc'),
        affinityDb('affinity_votes', '?select=movie_id,member,vote'),
        db('?select=title&limit=2000')
      ]);
      const normalize = s => String(s || '').normalize('NFD').replace(/[\\u0300-\\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
      const watched = new Set(watchedRows.map(x => normalize(x.title)));
      const movies = allMovies.filter(movie => !watched.has(normalize(movie.title)));
      const visibleIds = new Set(movies.map(movie => String(movie.id)));
      const myVotes = votes.filter(v => v.member === member && visibleIds.has(String(v.movie_id)));
      const matches = movies.filter(movie =>
        votes.some(v => String(v.movie_id) === String(movie.id) && v.member === 'Juanma' && v.vote === 'like') &&
        votes.some(v => String(v.movie_id) === String(movie.id) && v.member === 'Pouk' && v.vote === 'like')
      );
      return send(res, 200, { member, movies, myVotes, matches });
    }

    if (req.method === 'POST') {
      const movieId = Number(req.body?.movie_id);
      const vote = req.body?.vote;
      if (!Number.isSafeInteger(movieId) || movieId <= 0 || !['like', 'pass'].includes(vote))
        return send(res, 400, { error: 'Voto inválido' });
      const exists = await affinityDb('affinity_movies', '?id=eq.' + movieId + '&select=id');
      if (!exists.length) return send(res, 404, { error: 'Película inexistente' });
      await affinityDb('affinity_votes', '?on_conflict=movie_id,member', {
        method: 'POST',
        headers: { Prefer: 'resolution=merge-duplicates' },
        body: JSON.stringify({ movie_id: movieId, member, vote })
      });
      const votes = await affinityDb('affinity_votes', '?movie_id=eq.' + movieId + '&select=member,vote');
      const match = ['Juanma', 'Pouk'].every(name => votes.some(v => v.member === name && v.vote === 'like'));
      return send(res, 200, { ok: true, match });
    }
    return send(res, 405, { error: 'Método no permitido' });
  } catch (error) {
    console.error('Afinidades API:', error);
    return send(res, 500, { error: error.message || 'No se pudo procesar la solicitud' });
  }
}