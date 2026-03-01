export function toTitleCase(str: string): string {
  return str
    .toLowerCase() // Convert entire string to lowercase first
    .split(' ') // Split the string into an array of words
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1)) // Capitalize first letter of each word
    .join(' '); // Join the array of words back into a single string
}

export const toCamelCase = (str: string): string => {
  if (!str) return str;

  return str
    .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => (index === 0 ? word.toLowerCase() : word.toUpperCase()))
    .replace(/[\s:,()&/\-\+]+/g, '');
};

export const toPlural = (singular: string, plural: string, count: number, showCount = true, zero = ''): string => {
  if (count === 0 && zero) return zero;

  const output = count === 1 ? singular : plural || `${singular}s`;

  return showCount ? `${count} ${output}` : output;
};

export const toPascalCase = (str) => {
  return str.replace(/(^\w|_\w)/g, (match) => match.replace('_', '').toUpperCase());
};

export const camelize = toCamelCase;
export const pascalize = toPascalCase;
export const pluralize = toPlural;

export const getFirstName = (str: string): string => str.split(' ')[0];

export const getNameInitials = (str: string): string => {
  const words = str.split(' ');
  return words.length > 1
    ? `${words[0][0].toUpperCase()}${words[words.length - 1][0].toUpperCase()}`
    : words[0][0].toUpperCase();
};

export function removeComments(str) {
  // Regular expression for removing single-line and multi-line comments
  const regex = /\/\/.*|\/\*[^]*?\*\//g;
  return str.replace(regex, '');
}

export function cleanJSON(str) {
  return removeComments(
    str
      .replace('```json\n', '')
      .replace('\n```', '')
      .replace(/\/\/.*|\/\*[^]*?\*\//g, '')
  );
}

// List of 100+ unique fantasy and anime names
const allNames: string[] = [
  'Aragorn',
  'Legolas',
  'Gimli',
  'Frodo',
  'Gandalf',
  'Boromir',
  'Samwise',
  'Merry',
  'Pippin',
  'Elrond',
  'Galadriel',
  'Saruman',
  'Sauron',
  'Bilbo',
  'Thorin',
  'Eowyn',
  'Faramir',
  'Denethor',
  'Treebeard',
  'Gollum',

  'Gon Freecss',
  'Killua Zoldyck',
  'Kurapika',
  'Leorio Paradinight',
  'Hisoka Morow',
  'Chrollo Lucilfer',
  'Illumi Zoldyck',
  'Mito Freecss',
  'Meruem',
  'Isaac Netero',
  'Zushi',
  'Komugi',
  'Feitan Portor',
  'Shizuku Murasaki',
  'Shalnark',
  'Wing',
  'Biscuit Krueger',
  'Palm Siberia',
  'Neferpitou',

  'Naruto Uzumaki',
  'Sasuke Uchiha',
  'Sakura Haruno',
  'Kakashi Hatake',
  'Itachi Uchiha',
  'Hinata Hyuga',
  'Shikamaru Nara',
  'Gaara',
  'Rock Lee',
  'Tsunade',
  'Jiraiya',
  'Minato Namikaze',
  'Tobirama Senju',
  'Obito Uchiha',
  'Kiba Inuzuka',
  'Temari',
  'Kankuro',
  'Deidara',
  'Sasori',
  'Kisame Hoshigaki',
  'Tenten',

  'Monkey D. Luffy',
  'Roronoa Zoro',
  'Nami',
  'Usopp',
  'Sanji',
  'Tony Tony Chopper',
  'Nico Robin',
  'Franky',
  'Brook',
  'Jinbe',
  'Portgas D. Ace',
  'Sabo',
  'Shanks',
  'Blackbeard',
  'Boa Hancock',
  'Trafalgar D. Water Law',
  'Eustass Kid',
  'Charlotte Katakuri',
  'Donquixote Doflamingo',
  'Dracule Mihawk',

  'Goku',
  'Vegeta',
  'Gohan',
  'Piccolo',
  'Trunks',
  'Goten',
  'Bulma',
  'Frieza',
  'Cell',
  'Majin Buu',
  'Krillin',
  'Android 18',
  'Tien Shinhan',
  'Yamcha',
  'Chi-Chi',
  'Videl',
  'Beerus',
  'Whis',
  'Zamasu',
  'Hit',
  'Jiren',

  'Eren Yeager',
  'Mikasa Ackerman',
  'Armin Arlert',
  'Levi Ackerman',
  'Erwin Smith',
  'Historia Reiss',
  'Hange Zoë',
  'Reiner Braun',
  'Annie Leonhart',
  'Jean Kirstein',
  'Connie Springer',
  'Sasha Blouse',
  'Zeke Yeager',
  'Gabi Braun',
  'Falco Grice',
  'Ymir',
  'Bertolt Hoover',
  'Marco Bott',
  'Grisha Yeager',

  'Natsu Dragneel',
  'Lucy Heartfilia',
  'Gray Fullbuster',
  'Erza Scarlet',
  'Wendy Marvell',
  'Gajeel Redfox',
  'Happy',
  'Mirajane Strauss',
  'Laxus Dreyar',
  'Juvia Lockser',
  'Elfman Strauss',
  'Cana Alberona',
  'Gildarts Clive',
  'Makarov Dreyar',
  'Loki',
  'Ultear Milkovich',
  'Rufus Lore',
  'Sting Eucliffe',
  'Freed Justine',
  'Boss Makarov',

  'Edward Elric',
  'Alphonse Elric',
  'Roy Mustang',
  'Riza Hawkeye',
  'Winry Rockbell',
  'Scar',
  'Maes Hughes',
  'Alex Louis Armstrong',
  'Lust',
  'Envy',
  'Gluttony',
  'Sloth',
  'Greed',
  'Father',
  'Izumi Curtis',
  'Van Hohenheim',
  'Shou Tucker',
  'Ling Yao',
  'Lan Fan',
  'Sig Curtis',
  'Vanilla Ice',

  'Izuku Midoriya',
  'Katsuki Bakugo',
  'Ochaco Uraraka',
  'Shoto Todoroki',
  'Tenya Iida',
  'All Might',
  'Shota Aizawa',
  'Momo Yaoyorozu',
  'Tsuyu Asui',
  'Fumikage Tokoyami',
  'Denki Kaminari',
  'Kirishima Eijiro',
  'Mina Ashido',
  'Nejire Hado',
  'Hanta Sero',
  'Eijiro Kirishima',
  'Todoroki Fuyumi',
  'Froppy (Tsuyu Asui)',
  'Minoru Mineta',
  'Mirio Togata',

  'Kirito',
  'Asuna Yuuki',
  'Klein',
  'Leafa',
  'Sinon',
  'Yui',
  'Agil',
  'Silica',
  'Eugeo',
  'Alice Zuberg',
  'Lisbeth',
  'Suguha Kirigaya',
  'Licht (Death Gun)',
  'Elder Ayana',
  'Diabel',
  'Yuri Nara',
  'Shino Asada',

  'Tanjiro Kamado',
  'Nezuko Kamado',
  'Zenitsu Agatsuma',
  'Inosuke Hashibira',
  'Kanao Tsuyuri',
  'Rengoku Kyojuro',
  'Tengen Uzui',
  'Muzan Kibutsuji',
  'Giyu Tomioka',
  'Shinobu Kocho',
  'Obanai Iguro',
  'Sanemi Shinazugawa',
  'Muichiro Tokito',
  'Gyomei Himejima',
  'Kyojuro Rengoku',
  'Tomioka Giyu',
  'Asta',
  'Yuno',
  'Noelle Silva',
  'Julius Novachrono',
  'Luck Voltia',
  'Tank Gandalf',

  'Vash the Stampede',
  'Spike Spiegel',
  'Alucard',
  'Simon',
  'Kamina',
  'Yoko Littner',
  'Lelouch Lamperouge',
  'C.C.',
  'Kallen Kozuki',
  'Saber (Artoria Pendragon)',
  'Shirou Emiya',
  'Rin Tohsaka',
  'Kiritsugu Emiya',
  'Saitama',
  'Genos',
  'Tatsumaki',
  'Bang',
  'Fubuki',
  'King',
  'Orochimaru',
  'Madara Uchiha',
  'Hashirama Senju',
  'Kushina Uzumaki',
  'Shikamaru Nara',
  'Might Guy',
  'Neji Hyuga',
  'Choji Akimichi',
  'Ino Yamanaka',
  'Shino Aburame',
];

// Remove any duplicates to ensure uniqueness
const uniqueNames: string[] = Array.from(new Set(allNames));

// Fisher-Yates Shuffle Algorithm to randomize the array
function shuffle(array: string[]): void {
  for (let i = array.length - 1; i > 0; i--) {
    const j: number = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

// Initialize remainingNames with a shuffled copy of uniqueNames
let remainingNames: string[] = [...uniqueNames];
shuffle(remainingNames);

export function randomName(): string {
  return remainingNames.pop()!;
}

// helper.ts

export interface ParsedCookie {
  name: string;
  value: string;
  domain: string;
  path: string;
  secure: boolean;
  httpOnly?: boolean;
  sameSite?: 'Strict' | 'Lax' | 'None';
}

/**
 * Parses a document.cookie string into an array of unique cookie objects compatible with Puppeteer.
 * Filters out non-essential and problematic cookies to prevent conflicts.
 * @param cookieString - The raw cookie string from document.cookie
 * @param url - The URL for which the cookies are valid (e.g., 'https://my.wealthsimple.com')
 * @returns Array of parsed and unique cookies
 */
export function parseAndFilterCookies(cookieString: string, domain: string): ParsedCookie[] {
  // Define non-essential and problematic cookies to exclude
  const excludeCookies = new Set([
    // '_ga',
    // '_gcl_au',
    // '_tt_enable_cookie',
    // '_ttp',
    // '_rdt_uuid',
    // '_ScCbts',
    // '_sctr',
    // 'ajs_user_id',
    // 'ajs_anonymous_id',
    // '_dd_s',
    // '_oauth2_access_v2', // Exclude this problematic cookie for now
    // Add any other non-essential or problematic cookie names here
  ]);

  // Split the cookie string into individual cookies
  const cookieArray = cookieString.split('; ').map((cookie) => {
    const [name, ...rest] = cookie.split('=');
    const value = rest.join('=');
    return { name: decodeURIComponent(name), value: value }; // Do not decode value
  });

  // Filter out non-essential and problematic cookies
  const essentialCookies = cookieArray.filter((cookie) => !excludeCookies.has(cookie.name));

  // Eliminate duplicates by name, keeping last occurrence
  const uniqueCookiesMap: Map<string, ParsedCookie> = new Map();

  essentialCookies.forEach((cookie) => {
    uniqueCookiesMap.set(cookie.name, {
      name: cookie.name,
      value: cookie.value,
      domain: domain,
      path: '/',
      secure: true, // As per your tip
    });
  });

  return Array.from(uniqueCookiesMap.values());
}
