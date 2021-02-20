export interface Channel {
  name: string;
  logo?: string;
  url?: string;
  category: string;
  languages: Language[];
  countries: Country[];
  tvg: Tvg[];
}

interface Tvg {
  id?: string;
  name?: string;
  url?: string;
}

interface Country {
  code: string;
  name: string;
}

interface Language {
  code: string;
  name: string;
}
