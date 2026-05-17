const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE_URL = process.env.TMDB_BASE_URL;

// Fungsi dasar untuk fetch data ke TMDB agar tidak menulis fetch berulang-ulang
async function fetchFromTMDB(endpoint: string, params: string = '') {
  if (!TMDB_API_KEY) {
    throw new Error("TMDB_API_KEY belum dikonfigurasi di .env.local");
  }
  
  const url = `${TMDB_BASE_URL}${endpoint}?api_key=${TMDB_API_KEY}&language=id-ID&append_to_response=credits${params}`;
  
  const res = await fetch(url, { next: { revalidate: 86400 } }); // Cache data TMDB selama 1 hari untuk menghemat kuota API
  if (!res.ok) {
    throw new Error(`Gagal mengambil data dari TMDB untuk endpoint: ${endpoint}`);
  }
  
  return res.json();
}

export const tmdb = {
  // 1. Mencari Film/Series berdasarkan judul (Dipakai di komponen Finder Admin)
  searchContent: async (query: string, type: 'movie' | 'tv') => {
    const endpoint = type === 'movie' ? '/search/movie' : '/search/tv';
    const data = await fetchFromTMDB(endpoint, `&query=${encodeURIComponent(query)}`);
    return data.results; // Mengembalikan list hasil pencarian
  },

  // 2. Mengambil Detail Film (Sinopsis, Judul, Sutradara, Poster)
  getMovieDetails: async (tmdbId: string) => {
    const data = await fetchFromTMDB(`/movie/${tmdbId}`);
    
    // Cari nama sutradara dari data crew/credits
    const director = data.credits?.crew?.find((person: any) => person.job === 'Director')?.name || 'Unknown';

    return {
      title: data.title,
      overview: data.overview,
      posterPath: data.poster_path ? `https://image.tmdb.org/t/p/w500${data.poster_path}` : null,
      backdropPath: data.backdrop_path ? `https://image.tmdb.org/t/p/original${data.backdrop_path}` : null,
      releaseDate: data.release_date,
      tagline: data.tagline,
      director: director,
    };
  },

  // 3. Mengambil Detail TV Series
  getSeriesDetails: async (tmdbId: string) => {
    const data = await fetchFromTMDB(`/tv/${tmdbId}`);
    const creator = data.created_by?.[0]?.name || 'Unknown';

    return {
      title: data.name,
      overview: data.overview,
      posterPath: data.poster_path ? `https://image.tmdb.org/t/p/w500${data.poster_path}` : null,
      backdropPath: data.backdrop_path ? `https://image.tmdb.org/t/p/original${data.backdrop_path}` : null,
      firstAirDate: data.first_air_date,
      tagline: data.tagline,
      creator: creator,
      numberOfSeasons: data.number_of_seasons,
      numberOfEpisodes: data.number_of_episodes,
    };
  }
};