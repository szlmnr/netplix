const TMDB_BASE_URL = 'https://api.themoviedb.org/3'

// Mengubah default language ke en-US agar Tokusatsu dipaksa menggunakan Alphabet Inggris bukan Aksara Jepang asli
async function fetchFromTMDB(endpoint: string, params: string = '', language = 'en-US') {
  const TMDB_API_KEY = process.env.TMDB_API_KEY
  if (!TMDB_API_KEY) throw new Error("TMDB_API_KEY belum dikonfigurasi")

  const url = `${TMDB_BASE_URL}${endpoint}?api_key=${TMDB_API_KEY}&language=${language}&append_to_response=credits${params}`
  const res = await fetch(url, { next: { revalidate: 86400 } })
  if (!res.ok) throw new Error(`Gagal fetch TMDB: ${endpoint}`)
  return res.json()
}

export const tmdb = {
  searchContent: async (query: string, type: 'movie' | 'tv', language = 'en-US') => {
    const endpoint = type === 'movie' ? '/search/movie' : '/search/tv'
    const data = await fetchFromTMDB(endpoint, `&query=${encodeURIComponent(query)}`, language)
    return data.results
  },

  getMovieDetails: async (tmdbId: string) => {
    const data = await fetchFromTMDB(`/movie/${tmdbId}`)
    const director = data.credits?.crew?.find((p: any) => p.job === 'Director')?.name || 'Unknown'
    return {
      title:         data.title,
      originalTitle: data.original_title,
      overview:      data.overview,
      posterPath:    data.poster_path    ? `https://image.tmdb.org/t/p/w500${data.poster_path}`      : null,
      backdropPath:  data.backdrop_path  ? `https://image.tmdb.org/t/p/original${data.backdrop_path}` : null,
      releaseDate:   data.release_date,
      tagline:       data.tagline,
      director,
      genres:        (data.genres || []).map((g: any) => g.name),
    }
  },

  getSeriesDetails: async (tmdbId: string) => {
    const data = await fetchFromTMDB(`/tv/${tmdbId}`)
    const creator = data.created_by?.[0]?.name || 'Unknown'
    return {
      title:            data.name,
      originalTitle:    data.original_name,
      overview:         data.overview,
      posterPath:       data.poster_path   ? `https://image.tmdb.org/t/p/w500${data.poster_path}`      : null,
      backdropPath:     data.backdrop_path ? `https://image.tmdb.org/t/p/original${data.backdrop_path}` : null,
      firstAirDate:     data.first_air_date,
      tagline:          data.tagline,
      creator,
      numberOfSeasons:  data.number_of_seasons,
      numberOfEpisodes: data.number_of_episodes,
      genres:           (data.genres || []).map((g: any) => g.name),
    }
  }
}