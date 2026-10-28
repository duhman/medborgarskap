import type { OfficialSource } from '../config/pathwaySources.js'

export type FaqEntry = {
  id: string
  question: string
  /** Svar i stycken. Samma text används i FAQPage JSON-LD, så håll den synlig och ordagrann. */
  answer: string[]
  sources: Array<OfficialSource | { publisher: 'Prova medborgarskap'; label: string; url: string; checkedAt: string }>
}

const CHECKED = '2026-10-24'

const UHR_OM = 'https://www.uhr.se/medborgarskapsprovet/om-medborgarskapsprovet/'
const UHR_MATERIAL = 'https://www.uhr.se/medborgarskapsprovet/utbildningsmaterial/'
const UHR_ANPASSNINGAR = 'https://www.uhr.se/medborgarskapsprovet/anpassningar/'
const MV_VUXNA =
  'https://www.migrationsverket.se/du-vill-ansoka/svenskt-medborgarskap/medborgarskap-for-vuxna/medborgarskap-for-vuxna.html'
const MV_SVENSKA_NYHET =
  'https://www.migrationsverket.se/nyhetsarkiv/medborgarskapsprovetisvenskakanflyttasfram.5.15b2309e1a04e5ed2071cc5.html'

const uhrOm: OfficialSource = { publisher: 'UHR', label: 'Om medborgarskapsprovet', url: UHR_OM, checkedAt: CHECKED }
const uhrMaterial: OfficialSource = {
  publisher: 'UHR',
  label: 'Utbildningsmaterial',
  url: UHR_MATERIAL,
  checkedAt: CHECKED,
}
const mvVuxna: OfficialSource = {
  publisher: 'Migrationsverket',
  label: 'Medborgarskap för vuxna',
  url: MV_VUXNA,
  checkedAt: CHECKED,
}

/**
 * Provregler återger myndighetskällorna; webbplatsens funktioner har egna källor.
 * Gissa aldrig: står det "kommer" hos UHR, skriv det.
 */
const siteSource = (path: string, label: string): FaqEntry['sources'] => [
  { publisher: 'Prova medborgarskap', label, url: `https://provamedborgarskap.se${path}`, checkedAt: '2026-10-28' },
]

export const faqEntries: FaqEntry[] = [
  {
    id: 'nasta-prov',
    question: 'När är nästa medborgarskapsprov?',
    answer: [
      'Enligt UHR planeras nästa prov i samhällskunskap under perioden april-maj 2027. Datum och plats är inte publicerade ännu.',
      'Anmälan är stängd. UHR har meddelat att information om när anmälan öppnar kommer.',
    ],
    sources: [uhrOm],
  },
  {
    id: 'hur-ser-provet-ut',
    question: 'Hur ser medborgarskapsprovet ut?',
    answer: [
      'Provet är på svenska, skrivs på papper och består av flervalsfrågor med fyra svarsalternativ, där ett svar är rätt.',
      'UHR har ännu inte publicerat provtid, antal frågor eller avgift för nästa tillfälle. Provet i augusti 2026 var ett utprövningsprov.',
    ],
    sources: [uhrOm],
  },
  {
    id: 'vem-maste',
    question: 'Vem måste skriva medborgarskapsprovet?',
    answer: [
      'Kravet på kunskaper om det svenska samhället gäller dig som är mellan 16 och 66 år och ansöker om svenskt medborgarskap. Provet skrivs av den som inte kan visa kunskaperna på något annat sätt.',
      'Det är Migrationsverket som avgör vem som får skriva provet. Du kan bara anmäla dig om du har fått ett brev från Migrationsverket.',
    ],
    sources: [mvVuxna, uhrOm],
  },
  {
    id: 'visa-kunskaper-pa-annat-satt',
    question: 'Kan jag visa kunskaper om samhället utan att skriva provet?',
    answer: [
      'Ja. Migrationsverket godtar ett godkänt betyg i samhällskunskap eller grundläggande samhällsorienterande ämnen från årskurs 9 i grundskolan, från gymnasieskolan eller folkhögskolestudier på gymnasial nivå, eller från kommunal vuxenutbildning (Komvux).',
      'SFI räknas för kravet på kunskaper i svenska, inte för kravet på kunskaper om samhället.',
    ],
    sources: [mvVuxna],
  },
  {
    id: 'prov-i-svenska',
    question: 'Finns det ett prov i svenska också?',
    answer: [
      'Kravet på kunskaper i svenska finns kvar, men provet i svenska kan införas senare än planerat. Tills vidare kan du visa kunskaperna på andra sätt, till exempel med godkänt betyg i den högsta kursen i SFI, godkänt betyg i svenska från Komvux eller godkänt resultat på Tisus.',
      'Under övergångsperioden godtas också ett annat kunskapsprov som visar funktionell nivå, till exempel Swedex. Nivån som krävs är B1 för läs- och hörförståelse och A2 för muntlig och skriftlig färdighet.',
    ],
    sources: [
      mvVuxna,
      {
        publisher: 'Migrationsverket',
        label: 'Medborgarskapsprovet i svenska kan flyttas fram',
        url: MV_SVENSKA_NYHET,
        checkedAt: CHECKED,
      },
    ],
  },
  {
    id: 'andra-krav',
    question: 'Vilka andra krav finns för att bli svensk medborgare?',
    answer: [
      'Kunskapskraven är bara en del. Sedan 6 juni 2026 ska du som huvudregel ha bott i Sverige sammanhängande i minst åtta år. Du ska kunna styrka din identitet, kunna försörja dig (minst tre inkomstbasbelopp om året, 250 200 kronor före skatt för 2026) och ha levt ett skötsamt och hederligt liv.',
      'Du behöver också permanent uppehållstillstånd, uppehållsstatus, uppehållsrätt eller medborgarskap i ett annat nordiskt land, men det finns undantag. Kortare hemvisttid gäller i vissa fall, till exempel för nordiska medborgare. Läs vad som gäller just dig hos Migrationsverket innan du lägger tid på att plugga.',
    ],
    sources: [mvVuxna],
  },
  {
    id: 'vad-ska-jag-lasa',
    question: 'Vad ska jag läsa inför provet?',
    answer: [
      'UHR har tagit fram utbildningsmaterialet Sverige i fokus, som finns gratis som PDF och som ljudfiler. Det är det material som provet bygger på.',
      'UHR står inte bakom övningsprov som andra har gjort, och det gäller också den här sidan. Våra övningsfrågor bygger på Sverige i fokus och visar var i materialet svaret står, men de är ett komplement till att läsa materialet.',
    ],
    sources: [uhrMaterial],
  },
  {
    id: 'kostnad',
    question: 'Vad kostar det?',
    answer: [
      'Att ansöka om svenskt medborgarskap kostar 2 900 kronor. UHR har ännu inte publicerat någon anmälningsavgift för provet.',
      'Övningarna på den här sidan är gratis, utan konto och utan reklam.',
    ],
    sources: [mvVuxna, uhrOm],
  },
  {
    id: 'trana-smart',
    question: 'Hur fungerar Träna smart och vyn över mina framsteg?',
    answer: [
      'Träna smart blandar nya frågor med frågor du har svarat fel på och frågor som är dags att repetera. Du väljer 10, 20 eller 40 frågor. När du svarar rätt flera gånger ökar tiden till nästa repetition.',
      'Översikten per kapitel bygger bara på dina svar här på webbplatsen. Den är studiehjälp, inte ett officiellt provresultat eller en garanti för att du klarar medborgarskapsprovet. Historiken sparas i din webbläsare. ChatGPT-integrationen kan inte läsa den.',
    ],
    sources: siteSource('/ovning/smart', 'Träna smart'),
  },
  {
    id: 'studieplan',
    question: 'Hur gör jag en studieplan inför medborgarskapsprovet?',
    answer: [
      'På sidan Studieplan kan du välja 4, 8, 12 eller 16 veckor. Planen fördelar de 13 kapitlen i Sverige i fokus vecka för vecka och lägger in repetition på slutet. Kapitel bockas av när du har övat dem här.',
      'Planens startdag och antal veckor sparas bara i din webbläsare. En plan fram till den planerade provperioden är inte ett bekräftat provdatum eller en anmälan till provet. ChatGPT-integrationen kan förklara funktionen men inte läsa eller ändra din plan.',
    ],
    sources: siteSource('/studieplan', 'Studieplan'),
  },
  {
    id: 'lyssna',
    question: 'Kan jag lyssna på frågor och lätt svenska?',
    answer: [
      'Ja, när din webbläsare har en svensk röst visas knappar för att läsa upp frågor, förklaringar, lätt svenska och ordkort. Uppläsningen använder webbläsarens talfunktion. Om knappen saknas behöver du en svensk röst på enheten. Tillgång utan internet beror på enhetens röst.',
      'Kapitelsidorna länkar också till UHR:s ljudfiler för Sverige i fokus. De är separata från webbplatsens uppläsning av övningstext. Webbplatsens övningsfrågor och lätt svenska är fristående studiehjälp, inte UHR:s officiella prov.',
    ],
    sources: [...siteSource('/kapitel/landet-sverige', 'Kapitel med ljud, lätt svenska och ordkort'), uhrMaterial],
  },
  {
    id: 'ordkort',
    question: 'Hur övar jag viktiga ord med ordkort?',
    answer: [
      'Öppna ett kapitel och välj Öva orden med kort. Se ett ord, tänk på betydelsen och visa sedan förklaringen. Svara om du kunde ordet. Ord du inte kunde kommer tillbaka i samma omgång.',
      'Ordkorten använder kapitlets ordlista. Den pågående omgången sparas inte när du lämnar sidan och påverkar inte historiken i Träna smart. Du kan lyssna på kortet om en svensk röst finns i webbläsaren.',
    ],
    sources: siteSource('/kapitel/landet-sverige#ordkort', 'Öva orden med kort'),
  },
  {
    id: 'anpassningar',
    question: 'Kan jag få hjälp eller anpassningar på provet?',
    answer: [
      'Ja. Om du behöver särskilt stöd kan du ansöka om anpassning hos UHR. Det finns två typer: anpassning av själva provet och anpassning av den fysiska provmiljön.',
    ],
    sources: [{ publisher: 'UHR', label: 'Anpassningar', url: UHR_ANPASSNINGAR, checkedAt: CHECKED }],
  },
]
