import { affinityDb, db, send } from './_shared.js';
const TITLE_ALIASES = {"the grand budapest hotel":"grand budapest hotel","el gran hotel budapest":"grand budapest hotel","everything everywhere all at once":"everything everywhere","todo al mismo tiempo en todas partes":"everything everywhere","todo a la vez en todas partes":"everything everywhere","nine queens":"nine queens","nueve reinas":"nine queens","9 reinas":"nine queens","wishplash":"whiplash","whiplash":"whiplash","the godfather":"godfather","el padrino":"godfather","the florida project":"florida project","the florida proyect":"florida project","the secret in their eyes":"secret in their eyes","el secreto de sus ojos":"secret in their eyes","scott pilgrim vs the world":"scott pilgrim","scott pilgrim contra el mundo":"scott pilgrim","uncut gems":"uncut gems","diamantes en bruto":"uncut gems","amelie":"amelie","el show de truman":"truman show","the truman show":"truman show","the holdovers":"holdovers","los que se quedan":"holdovers","little miss sunshine":"little miss sunshine","pequena miss sunshine":"little miss sunshine","the lobster":"lobster","langosta":"lobster","the wolf house":"wolf house","la casa lobo":"wolf house","fantastic mr fox":"fantastic mr fox","fantastico sr fox":"fantastic mr fox","the tale of the princess kaguya":"princess kaguya","el cuento de la princesa kaguya":"princess kaguya","the mitchells vs the machines":"mitchells machines","los mitchell contra las maquinas":"mitchells machines","memoir of a snail":"memoir of a snail","memorias de un caracol":"memoir of a snail","severance":"severance","separacion":"severance","the rehearsal":"the rehearsal","los ensayos":"the rehearsal","when harry met sally":"when harry met sally","cuando harry encontro a sally":"when harry met sally","the worst person in the world":"worst person in the world","la peor persona del mundo":"worst person in the world"};
const normalize = s => String(s||'').normalize('NFD').replace(/[\\u0300-\\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
const canonical = s => TITLE_ALIASES[normalize(s)] || normalize(s);

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
      const watched = new Set(watchedRows.map(x => canonical(x.title)));
      const allowed = new Set(["her","grand budapest hotel","whiplash","la la land","nine queens","godfather","the apartment","florida project","uncut gems","everything everywhere","amelie","sing street","scott pilgrim","truman show","perfect days","past lives","worst person in the world","aftersun","holdovers","little miss sunshine","lobster","the menu","parasite","secret in their eyes","machuca","wolf house","beast","memoir of a snail","mary and max","fantastic mr fox","isle of dogs","princess kaguya","spirited away","mitchells machines","paddington 2","palm springs","about time","when harry met sally","fleabag","barry","the bear","severance","ted lasso","the studio","los simuladores","okupas","the rehearsal"]);
      const movies = allMovies.filter(movie => {
        const key = canonical(movie.title);
        return allowed.has(key) && !watched.has(key);
      });
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