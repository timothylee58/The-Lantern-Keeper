import raw from './codex.json';
export type Region = 'MY' | 'SG' | 'ID';
export type Mechanic = 'chase' | 'lantern-light' | 'pattern';
export interface Spirit {
  id: string;
  name: string;
  subtitle: string;
  tag: string;
  regions: string[];
  level: string;
  art: number;
  color: string;
  summary: string;
  lore: string;
  variants: string[][];
  clue: string;
  brief: string;
  source: string[];
}
export interface Neighbor {
  id: string;
  name: string;
  community: string;
  title: string;
  problem: string;
  item: string;
  spirit: string;
  mechanic: Mechanic;
  intro: string;
  reply: string;
  thanks: string;
  addition: string;
  x: number;
  y: number;
  seed: number;
}
export const SPIRITS: Spirit[] = raw.spirits;
export const VOICES = raw.voices;
export const SIGHTINGS = raw.sightings;
export const REGIONS: Record<string, string> = {
  ALL: 'All regions',
  MY: 'Malaysia',
  SG: 'Singapore',
  ID: 'Indonesia',
};
export const NEIGHBORS: Neighbor[] = [
  {
    id: 'mei-lin',
    name: 'Mei Lin',
    community: 'Chinese · Singapore & Malaysia',
    title: 'Little lights, big plans.',
    problem:
      'The storm scattered the lantern workshop’s painted panels. A very small collector has mistaken them for a new roof.',
    item: 'Lantern panels',
    spirit: 'toyol',
    mechanic: 'chase',
    intro:
      'Grandpa saved the frame. Now we just need its panels. That little fellow has excellent taste in stationery.',
    reply: 'I thought they were tiny umbrellas! My button collection gets soggy.',
    thanks:
      'The lantern is glowing again. There’s a little paper umbrella for our new friend, too.',
    addition: 'Lanterns light the courtyard',
    x: 24,
    y: 36,
    seed: 1,
  },
  {
    id: 'kavitha',
    name: 'Kavitha',
    community: 'Tamil Indian · Singapore & Malaysia',
    title: 'One dot at a time.',
    problem:
      'Rain washed the doorstep clean. Kavitha’s pattern notebook is tucked near a shy forest visitor who dislikes a bright lantern.',
    item: 'Pattern notebook',
    spirit: 'pontianak',
    mechanic: 'lantern-light',
    intro:
      'I can make a new kolam, but my notebook is missing. Give our shy neighbor a little space and a softer light.',
    reply:
      'Oh! I wasn’t hiding the notebook. I was hiding behind it. Your lantern is very enthusiastic.',
    thanks:
      'A dry doorstep, a familiar notebook, and room to begin again. Please walk around the drawing.',
    addition: 'A welcoming doorstep pattern',
    x: 48,
    y: 28,
    seed: 2,
  },
  {
    id: 'daniel',
    name: 'Daniel',
    community: 'Eurasian · Singapore & Melaka',
    title: 'Room for one more.',
    problem:
      'Daniel’s dance recording is somewhere along a playful rhythm trail. Repeat the forest’s simple light sequence to find it.',
    item: 'Dance recording',
    spirit: 'orang-bunian',
    mechanic: 'pattern',
    intro:
      'The gathering needs a dance for beginners. First, can you follow these glowing clues? Even my left foot is curious.',
    reply:
      'We borrowed the recording to practise. We have discovered that invisible feet can still step on each other.',
    thanks: 'The branyo practice can begin. Come as you are; we’ll learn together.',
    addition: 'A space for everyone to dance',
    x: 72,
    y: 37,
    seed: 3,
  },
  {
    id: 'farah',
    name: 'Farah',
    community: 'Malay · Malaysia & Singapore',
    title: 'A verse worth saving.',
    problem:
      'Farah’s pantun pages were soaked. Find her grandmother’s recording in the canopy so she can write a fresh welcome.',
    item: 'Pantun recording',
    spirit: 'langsuir',
    mechanic: 'lantern-light',
    intro:
      'Nenek says a welcome should have heart, not perfect handwriting. Let’s rescue her recording before I invent a rhyme for “mud”.',
    reply:
      'I only borrowed the recording to learn the welcome. The trees are a very quiet audience.',
    thanks: 'The recording is safe. Now I can answer her pantun in my own words.',
    addition: 'A welcome shared in verse',
    x: 17,
    y: 65,
    seed: 4,
  },
  {
    id: 'suri',
    name: 'Suri',
    community: 'Iban · Sarawak, Borneo',
    title: 'A shelter for stories.',
    problem:
      'Rain has reached Suri’s aunt’s loom. Retrieve the small repair kit a hopping visitor has carried along the path.',
    item: 'Shelter repair kit',
    spirit: 'pocong',
    mechanic: 'chase',
    intro:
      'Auntie chooses the stories she shares through weaving. My job today is simpler: keep her loom dry.',
    reply: 'I was helping! Then I discovered that hopping while carrying a toolkit is not a plan.',
    thanks: 'The shelter is repaired. Auntie can show the weaving on her own terms.',
    addition: 'A dry weaving corner',
    x: 38,
    y: 56,
    seed: 5,
  },
  {
    id: 'lina',
    name: 'Lina',
    community: 'Kadazandusun · Sabah, Borneo',
    title: 'First, we listen.',
    problem:
      'Lina’s recorder is in the gentle giant’s collection of interesting sounds. Follow its abstract light pattern to ask for it back.',
    item: 'Borrowed recorder',
    spirit: 'hantu-raya',
    mechanic: 'pattern',
    intro:
      'When I get the recorder back, I’ll ask before recording the sompoton practice. Listening comes first.',
    reply: 'I recorded my sneeze. The playback scared a coconut. I am very sorry to the coconut.',
    thanks: 'The musician said yes. We’ll listen carefully, and keep his story with the recording.',
    addition: 'A listening corner for music',
    x: 61,
    y: 63,
    seed: 6,
  },
  {
    id: 'dina',
    name: 'Dina',
    community: 'Melanau · Sarawak, Borneo',
    title: 'A place at the table.',
    problem:
      'Dina’s sago ingredient cards blew toward the river. A tiny collector has filed them under “delicious-looking paper”.',
    item: 'Ingredient cards',
    spirit: 'toyol',
    mechanic: 'chase',
    intro:
      'A good gathering lets everyone ask what’s in the food. Those cards are more useful on the table than in a tree.',
    reply: 'I organised them by tastiness. I did not taste them. Much.',
    thanks: 'The sago dishes have their ingredient cards again. Pull up a chair.',
    addition: 'Sago dishes and clear ingredient cards',
    x: 80,
    y: 72,
    seed: 7,
  },
  {
    id: 'amina',
    name: 'Amina',
    community: 'Bruneian Malay · Brunei',
    title: 'Many threads. One evening.',
    problem:
      'Amina’s jong sarat display needs a dry home. Follow the hidden neighbors’ soft lights to recover the courtyard route markers.',
    item: 'Courtyard route markers',
    spirit: 'orang-bunian',
    mechanic: 'lantern-light',
    intro:
      'These textiles carry my family’s stories. Help me find a sheltered route, and I’ll bring them to the gathering.',
    reply: 'We made a shortcut. Then a shorter shortcut. We may have made a circle.',
    thanks:
      'The display is safe beneath the shelter. I can share my family’s story beside everyone else’s.',
    addition: 'A sheltered textile display',
    x: 85,
    y: 24,
    seed: 8,
  },
];
export const STORY_ORDER = [
  'farah',
  'mei-lin',
  'kavitha',
  'daniel',
  'suri',
  'lina',
  'dina',
  'amina',
];
export const storyNeighbors = STORY_ORDER.map((id) => NEIGHBORS.find((n) => n.id === id)!);
export function filterSpirits(
  query = '',
  region = 'ALL',
  collectedOnly = false,
  collected: string[] = [],
) {
  const q = query.toLowerCase().trim();
  return SPIRITS.filter(
    (s) =>
      (region === 'ALL' || s.regions.includes(region)) &&
      (!collectedOnly || collected.includes(s.id)) &&
      `${s.name} ${s.subtitle} ${s.variants.map((v) => v[1]).join(' ')} ${s.id === 'langsuir' ? 'langsuan' : ''}`
        .toLowerCase()
        .includes(q),
  );
}
