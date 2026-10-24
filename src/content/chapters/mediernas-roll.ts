import type { ChapterContent } from '../types'

export const mediernasRoll: ChapterContent = {
  slug: 'mediernas-roll',
  number: 6,
  title: 'Mediernas roll',
  mp3Url:
    'https://www.uhr.se/globalassets/_uhr.se/medborgarskapsprovet/utbildningsmaterial/07_mediernas-roll.mp3',
  intro:
    'Medier sprider nyheter, kunskap och information som påverkar alla i samhället. Kapitlet beskriver fria medier och offentlighetsprincipen, olika slags medier som public service, och varför det är viktigt att vara källkritisk.',
  bullets: [
    'Tryckfrihetsförordningen och yttrandefrihetsgrundlagen skyddar fria medier. Staten kan inte bestämma vad som sägs i medierna.',
    'Offentlighetsprincipen gör att vem som helst kan ta del av allmänna handlingar som inte är hemliga.',
    'SR, SVT och UR är public service. De ska vara oberoende och finansieras genom en avgift via skatten, inte med reklam.',
    'Den som lämnar uppgifter till medier har rätt att vara anonym. En ansvarig utgivare är juridiskt ansvarig för det som publiceras.',
    'Att vara källkritisk betyder att ifrågasätta och kontrollera om information är korrekt.',
  ],
  summaryEasy: [
    'Medier är till exempel tidningar, radio, tv, internet och sociala medier. I medierna sprids nyheter och information. Medierna påverkar alla människor i samhället.',
    'I Sverige är medierna fria. Två grundlagar skyddar rätten att säga vad vi tycker. Staten får inte bestämma vad medierna säger. Journalister ska kunna granska politiker och andra som har makt.',
    'Offentlighetsprincipen betyder att handlingar hos myndigheter är öppna. Vem som helst får läsa dem, om de inte är hemliga. Det kallas sekretess när en handling är hemlig. Den som berättar något för en tidning får vara anonym. Det betyder att man inte behöver säga sitt namn.',
    'Många medier ägs av privata företag. De tjänar pengar på reklam och på att folk köper eller prenumererar på tidningen. Sveriges Radio, Sveriges Television och Utbildningsradion kallas public service. De har ingen reklam. De betalas med en avgift som tas ut via skatten. De ska vara neutrala och inte välja sida.',
    'Vem som helst kan skriva på webben och i sociala medier. Det som står där kontrolleras inte alltid. Falska uppgifter kan spridas snabbt. Därför ska man vara källkritisk. Det betyder att man kontrollerar om det man läser, ser eller hör är sant.',
  ],
  glossary: [
    {
      term: 'medier',
      sv: 'Sätt att sprida information, till exempel tidningar, radio, tv och internet.',
      en: 'Media: newspapers, radio, TV, the internet and social media.',
    },
    {
      term: 'tryckfrihetsförordningen',
      sv: 'Grundlagen som skyddar det fria ordet i tidningar och böcker.',
      en: 'Freedom of the Press Act: fundamental law protecting printed media.',
    },
    {
      term: 'yttrandefrihetsgrundlagen',
      sv: 'Grundlagen som skyddar rätten att säga vad man tycker i till exempel radio och tv.',
      en: 'Fundamental Law on Freedom of Expression: protects free speech in radio, TV and similar media.',
    },
    {
      term: 'offentlighetsprincipen',
      sv: 'Regeln att alla får läsa myndigheters handlingar om de inte är hemliga.',
      en: 'Principle of public access to official documents.',
    },
    {
      term: 'allmänna handlingar',
      sv: 'Papper och e-post som finns hos en myndighet.',
      en: 'Official documents held by a public authority.',
    },
    {
      term: 'sekretess',
      sv: 'När en handling är hemlig och inte får lämnas ut.',
      en: 'Secrecy / confidentiality: when a document may not be released.',
    },
    {
      term: 'anonym',
      sv: 'Att ingen får veta vem man är.',
      en: 'Anonymous: your identity is not revealed.',
    },
    {
      term: 'ansvarig utgivare',
      sv: 'Den person som har juridiskt ansvar för det som publiceras i en tidning, i radio eller i tv.',
      en: 'Responsible publisher: the person legally responsible for what a medium publishes.',
    },
    {
      term: 'kommersiella kanaler',
      sv: 'Radio- och tv-kanaler som tjänar pengar på reklam eller på att man betalar för dem.',
      en: 'Commercial channels: funded by advertising or subscriptions.',
    },
    {
      term: 'public service',
      sv: 'Radio och tv från SR, SVT och UR, utan reklam, som ska vara oberoende.',
      en: 'Public service broadcasting (SR, SVT, UR), funded by a fee through taxes.',
    },
    {
      term: 'sociala medier',
      sv: 'Webbplatser och appar där vem som helst kan lägga ut eget innehåll.',
      en: 'Social media: platforms where anyone can publish content.',
    },
    {
      term: 'källkritisk',
      sv: 'Att kontrollera om information är sann innan man tror på den.',
      en: 'Critical of sources: checking whether information is correct.',
    },
  ],
  questions: [
    {
      id: 'k6-q1',
      prompt: 'Vilka grundlagar skyddar fria medier i Sverige?',
      options: [
        { id: 'A', text: 'Regeringsformen och successionsordningen' },
        { id: 'B', text: 'Tryckfrihetsförordningen och yttrandefrihetsgrundlagen' },
        { id: 'C', text: 'Successionsordningen och tryckfrihetsförordningen' },
        { id: 'D', text: 'Yttrandefrihetsgrundlagen och successionsordningen' },
      ],
      correctOptionId: 'B',
      explanationSv:
        'Tryckfrihetsförordningen och yttrandefrihetsgrundlagen skyddar rätten att fritt säga det vi tycker och att sprida åsikter.',
      explanationEn:
        'The Freedom of the Press Act and the Fundamental Law on Freedom of Expression protect the right to say what we think and to spread opinions.',
      source: {
        chapter: 6,
        page: 20,
        quote:
          'Grundlagarna tryckfrihetsförordningen och yttrandefrihetsgrundlagen skyddar rätten att fritt få säga det vi tycker och att sprida åsikter.',
      },
    },
    {
      id: 'k6-q2',
      prompt: 'Vem har rätt att ta del av allmänna handlingar från myndigheter?',
      options: [
        { id: 'A', text: 'Journalister som har fått ett särskilt tillstånd' },
        { id: 'B', text: 'Ledamöter i riksdagen och i regeringen' },
        { id: 'C', text: 'Vem som helst, om de inte är hemliga' },
        { id: 'D', text: 'Personer som arbetar på myndigheten' },
      ],
      correctOptionId: 'C',
      explanationSv:
        'Offentlighetsprincipen betyder att allmänna handlingar från myndigheter är offentliga. Vem som helst har rätt att ta del av dem om de inte är hemliga.',
      explanationEn:
        'Under the principle of public access, anyone may read official documents from authorities unless they are secret.',
      source: {
        chapter: 6,
        page: 20,
        quote: 'Vem som helst har rätt att ta del av dem om de inte är hemliga',
      },
    },
    {
      id: 'k6-q3',
      prompt: 'Vilka tre medieföretag kallas public service i Sverige?',
      options: [
        { id: 'A', text: 'SR, SVT och UR' },
        { id: 'B', text: 'SR, SVT och TV4' },
        { id: 'C', text: 'SVT, UR och TT' },
        { id: 'D', text: 'SR, UR och TV4' },
      ],
      correctOptionId: 'A',
      explanationSv:
        'Sveriges Radio (SR), Sveriges Television (SVT) och Utbildningsradion (UR) kallas public service. De har ett speciellt uppdrag.',
      explanationEn:
        'Sveriges Radio (SR), Sveriges Television (SVT) and Utbildningsradion (UR) are called public service.',
      source: {
        chapter: 6,
        page: 21,
        quote: 'SR, SVT och UR kallas för public service.',
      },
    },
    {
      id: 'k6-q4',
      prompt: 'Hur finansieras public service-företagen?',
      options: [
        { id: 'A', text: 'Genom att sälja reklam i sina program' },
        { id: 'B', text: 'Genom att tittarna köper en prenumeration' },
        { id: 'C', text: 'Genom bidrag från de politiska partierna' },
        { id: 'D', text: 'Genom en avgift som tas ut via skatten' },
      ],
      correctOptionId: 'D',
      explanationSv:
        'Public service-företagen får inte tjäna pengar på reklam. De finansieras istället genom en avgift som tas ut via skatten.',
      explanationEn:
        'Public service companies may not earn money from advertising. They are funded by a fee collected through taxes.',
      source: {
        chapter: 6,
        page: 21,
        quote:
          'De får inte tjäna pengar på reklam. De finansieras istället genom en avgift som tas ut via skatten.',
      },
    },
    {
      id: 'k6-q5',
      prompt: 'Vad kallas det att kontrollera och granska information?',
      options: [
        { id: 'A', text: 'Att vara anonym' },
        { id: 'B', text: 'Att vara källkritisk' },
        { id: 'C', text: 'Att vara ansvarig utgivare' },
        { id: 'D', text: 'Att ha sekretess' },
      ],
      correctOptionId: 'B',
      explanationSv:
        'Att kontrollera och granska information kallas för att vara källkritisk.',
      explanationEn: 'Checking and examining information is called being critical of sources.',
      source: {
        chapter: 6,
        page: 21,
        quote: 'Att kontrollera och granska information kallas för att vara källkritisk.',
      },
    },
    {
      id: 'k6-q6',
      prompt: 'Vem är juridiskt ansvarig för det som publiceras i en tidning, i radio eller i tv?',
      options: [
        { id: 'A', text: 'Den ansvarige utgivaren' },
        { id: 'B', text: 'Läsarna och tittarna' },
        { id: 'C', text: 'Riksdagens talman' },
        { id: 'D', text: 'Myndigheten som ger stöd' },
      ],
      correctOptionId: 'A',
      explanationSv:
        'Tidningar, radio och tv har en ansvarig utgivare som är juridiskt ansvarig för vad som publiceras. Utgivaren måste följa lagar som skyddar mot förtal och kränkningar.',
      explanationEn:
        'Newspapers, radio and TV have a responsible publisher who is legally responsible for what is published.',
      source: {
        chapter: 6,
        page: 20,
        quote:
          'Tidningar, radio och tv har en ansvarig utgivare som är juridiskt ansvarig för vad som publiceras.',
      },
    },
    {
      id: 'k6-q7',
      prompt: 'Vilket alternativ beskriver bäst statens roll när det gäller vad som sägs i medierna?',
      options: [
        { id: 'A', text: 'Staten granskar alla nyheter innan de får publiceras' },
        { id: 'B', text: 'Staten bestämmer vilka åsikter som får sändas i tv' },
        { id: 'C', text: 'Staten kan inte bestämma eller påverka vad som sägs' },
        { id: 'D', text: 'Staten får stoppa texter som kritiserar regeringen' },
      ],
      correctOptionId: 'C',
      explanationSv:
        'I en demokrati som Sverige är medierna fria. Staten kan inte bestämma eller påverka vad som sägs i medierna.',
      explanationEn:
        'In a democracy like Sweden the media are free. The state cannot decide or influence what is said in the media.',
      source: {
        chapter: 6,
        page: 20,
        quote: 'Staten kan inte bestämma eller påverka vad som sägs i medierna.',
      },
    },
    {
      id: 'k6-q8',
      prompt: 'Vilken uppgift har medierna i samhället enligt kapitlet?',
      options: [
        { id: 'A', text: 'De bestämmer vilka lagar som riksdagen ska stifta' },
        { id: 'B', text: 'De utser vilka politiker som ska sitta i regeringen' },
        { id: 'C', text: 'De dömer personer som har brutit mot lagen' },
        { id: 'D', text: 'De informerar om nyheter och är en plats för fri debatt' },
      ],
      correctOptionId: 'D',
      explanationSv:
        'Medierna informerar om nyheter. De är också en plats där människor fritt kan diskutera samhället, och de är viktiga för nöje och underhållning.',
      explanationEn:
        'The media report news and are a place where people can freely discuss society. They are also important for entertainment.',
      source: {
        chapter: 6,
        page: 20,
        quote:
          'Medierna informerar om nyheter och de fungerar som en plats där människor fritt kan diskutera samhället',
      },
    },
    {
      id: 'k6-q9',
      prompt: 'Varför finns offentlighetsprincipen enligt kapitlet?',
      options: [
        { id: 'A', text: 'För att journalister ska kunna granska personer som har makt' },
        { id: 'B', text: 'För att myndigheter ska kunna hålla alla sina beslut hemliga' },
        { id: 'C', text: 'För att staten ska kunna kontrollera vad tidningarna skriver' },
        { id: 'D', text: 'För att politikerna ska kunna läsa journalisternas e-post' },
      ],
      correctOptionId: 'A',
      explanationSv:
        'Journalister ska kunna granska politiker och andra personer som har makt. Därför finns offentlighetsprincipen, som underlättar den granskningen.',
      explanationEn:
        'Journalists must be able to scrutinise politicians and others in power. The principle of public access exists to make this easier.',
      source: {
        chapter: 6,
        page: 20,
        quote:
          'Journalisterna ska kunna granska politiker och andra personer som har makt. Därför finns offentlighetsprincipen',
      },
    },
    {
      id: 'k6-q10',
      prompt:
        'En journalist vill ta reda på hur en myndighet fattade ett viktigt beslut. Vad kan journalisten göra?',
      options: [
        { id: 'A', text: 'Hon måste först få ett tillstånd från regeringen' },
        { id: 'B', text: 'Hon kan begära ut e-post och andra handlingar' },
        { id: 'C', text: 'Hon får läsa det som myndigheten själv väljer att visa' },
        { id: 'D', text: 'Hon får fråga chefen, men inte se några handlingar' },
      ],
      correctOptionId: 'B',
      explanationSv:
        'Offentlighetsprincipen gör att journalister kan begära ut e-post och andra handlingar från myndigheter för att granska hur beslut har fattats, om handlingarna inte är hemliga.',
      explanationEn:
        'Thanks to the principle of public access, journalists can request emails and other documents from authorities to see how decisions were made.',
      source: {
        chapter: 6,
        page: 20,
        quote:
          'journalister kan begära ut e-post och andra handlingar från myndigheter för att granska hur beslut har fattats.',
      },
    },
    {
      id: 'k6-q11',
      prompt: 'Vad kallas det när en allmän handling är hemlig och inte får lämnas ut?',
      options: [
        { id: 'A', text: 'Källkritik' },
        { id: 'B', text: 'Censur' },
        { id: 'C', text: 'Förtal' },
        { id: 'D', text: 'Sekretess' },
      ],
      correctOptionId: 'D',
      explanationSv:
        'Allmänna handlingar är offentliga om de inte är hemliga. När en handling är hemlig säger man att den är under sekretess.',
      explanationEn: 'When an official document is secret, it is said to be under secrecy (sekretess).',
      source: {
        chapter: 6,
        page: 20,
        quote: 'om de inte är hemliga (under sekretess).',
      },
    },
    {
      id: 'k6-q12',
      prompt: 'Varför ger staten ekonomiskt stöd till nyhetsmedier och dagstidningar?',
      options: [
        { id: 'A', text: 'För att staten ska kunna bestämma vad de skriver' },
        { id: 'B', text: 'För att tidningarna ska slippa sälja reklam' },
        { id: 'C', text: 'För att det ska finnas många olika nyhetsmedier' },
        { id: 'D', text: 'För att alla tidningar ska ha samma åsikter' },
      ],
      correctOptionId: 'C',
      explanationSv:
        'Det är viktigt att det finns många olika medier som ger oss nyheter. Därför ger staten ekonomiskt stöd till nyhetsmedier och dagstidningar.',
      explanationEn:
        'It is important that there are many different news media, so the state gives financial support to news media and daily newspapers.',
      source: {
        chapter: 6,
        page: 20,
        quote:
          'Det är också viktigt att det finns många olika medier som ger oss nyheter. Staten ger därför ekonomiskt stöd till nyhetsmedier och dagstidningar.',
      },
    },
    {
      id: 'k6-q13',
      prompt:
        'Erik vill berätta för en radiokanal om ett problem i sin stad, men han vill inte att någon ska få veta vem han är. Vad gäller?',
      options: [
        { id: 'A', text: 'Han kan straffas om han lämnar uppgifterna' },
        { id: 'B', text: 'Han har rätt att lämna uppgifter och vara anonym' },
        { id: 'C', text: 'Han måste först få lov av kommunen att berätta' },
        { id: 'D', text: 'Hans namn måste publiceras med uppgifterna' },
      ],
      correctOptionId: 'B',
      explanationSv:
        'En person har rätt att lämna uppgifter till tidningar, radio och tv utan att straffas för det. Den som lämnar uppgifter har också rätt att vara anonym.',
      explanationEn:
        'A person has the right to give information to newspapers, radio and TV without being punished, and has the right to remain anonymous.',
      source: {
        chapter: 6,
        page: 20,
        quote: 'Den som meddelar uppgifter till media har också rätt att vara anonym.',
      },
    },
    {
      id: 'k6-q14',
      prompt: 'Hur ska journalister arbeta med de uppgifter de får?',
      options: [
        { id: 'A', text: 'De ska använda de uppgifter som politiker ger dem' },
        { id: 'B', text: 'De ska publicera snabbt och kontrollera uppgifterna senare' },
        { id: 'C', text: 'De ska låta myndigheterna godkänna texten först' },
        { id: 'D', text: 'De ska kontrollera uppgifterna med flera oberoende källor' },
      ],
      correctOptionId: 'D',
      explanationSv:
        'Journalister ska kontrollera uppgifter med flera oberoende källor och se till att källorna är pålitliga.',
      explanationEn:
        'Journalists should check information with several independent sources and make sure the sources are reliable.',
      source: {
        chapter: 6,
        page: 21,
        quote:
          'Journalister ska kontrollera uppgifter med flera oberoende källor och kontrollera att källorna är pålitliga.',
      },
    },
    {
      id: 'k6-q15',
      prompt: 'Hur får kommersiella radio- och tv-kanaler sina inkomster?',
      options: [
        { id: 'A', text: 'Genom reklam eller genom att tittarna betalar för kanalen' },
        { id: 'B', text: 'Genom en avgift som alla betalar via skatten varje år' },
        { id: 'C', text: 'Genom bidrag från de politiska partierna i riksdagen' },
        { id: 'D', text: 'Genom pengar från kommunerna där kanalerna sänder' },
      ],
      correctOptionId: 'A',
      explanationSv:
        'Kommersiella radio- och tv-kanaler får sina inkomster från att sälja reklamplats, eller genom att människor betalar för att se en viss kanal.',
      explanationEn:
        'Commercial radio and TV channels earn money by selling advertising space or by people paying to watch a channel.',
      source: {
        chapter: 6,
        page: 21,
        quote:
          'som får sina inkomster från att sälja reklamplats på sina kanaler eller genom att människor betalar för att kunna se en särskild tv-kanal.',
      },
    },
    {
      id: 'k6-q16',
      prompt: 'Vem driver oftast de medier som finansieras med reklam?',
      options: [
        { id: 'A', text: 'Staten' },
        { id: 'B', text: 'Kommunerna' },
        { id: 'C', text: 'Privata företag' },
        { id: 'D', text: 'Politiska partier' },
      ],
      correctOptionId: 'C',
      explanationSv: 'Medier som finansieras med reklam drivs ofta av privata företag, till exempel många dagstidningar.',
      explanationEn: 'Media funded by advertising are often run by private companies.',
      source: {
        chapter: 6,
        page: 21,
        quote: 'Medier som finansieras med reklam drivs ofta av privata företag.',
      },
    },
    {
      id: 'k6-q17',
      prompt: 'Vilket alternativ beskriver bäst hur de flesta tidningar fungerar idag?',
      options: [
        { id: 'A', text: 'De kommer ut på papper en gång i veckan' },
        { id: 'B', text: 'De finns också på internet och uppdateras ofta' },
        { id: 'C', text: 'De får inte ha någon reklam på sina sidor' },
        { id: 'D', text: 'De säljs i butiker men går inte att prenumerera på' },
      ],
      correctOptionId: 'B',
      explanationSv:
        'Idag finns de flesta tidningar också på internet och uppdateras med nyheter flera gånger per dag. Tidningarna får också inkomster från reklam.',
      explanationEn:
        'Today most newspapers are also online and are updated with news several times a day.',
      source: {
        chapter: 6,
        page: 21,
        quote:
          'Idag finns de flesta tidningar också på internet och uppdateras med nyheter flera gånger per dag.',
      },
    },
    {
      id: 'k6-q18',
      prompt: 'Vilket alternativ beskriver bäst hur public service ska rapportera om samhället?',
      options: [
        { id: 'A', text: 'De ska stödja regeringens politik i sina nyheter' },
        { id: 'B', text: 'De ska låta de största partierna tala mest i nyheterna' },
        { id: 'C', text: 'De ska välja det parti som har de bästa förslagen' },
        { id: 'D', text: 'De ska låta olika åsikter komma fram utan att välja sida' },
      ],
      correctOptionId: 'D',
      explanationSv:
        'Public service-företagen ska vara oberoende av politiska och andra intressen. De ska låta olika åsikter komma till tals utan att välja sida.',
      explanationEn:
        'Public service companies must be independent of political and other interests and let different opinions be heard without taking sides.',
      source: {
        chapter: 6,
        page: 21,
        quote:
          'De ska rapportera om samhället och låta olika åsikter komma till tals utan att välja sida.',
      },
    },
    {
      id: 'k6-q19',
      prompt: 'Vad är syftet med public service enligt kapitlet?',
      options: [
        { id: 'A', text: 'Att staten ska kunna styra vilka nyheter som sänds' },
        { id: 'B', text: 'Att alla ska få saklig information, var de än bor' },
        { id: 'C', text: 'Att de som betalar mest skatt ska få se fler program' },
        { id: 'D', text: 'Att kanalerna ska tjäna så mycket pengar som möjligt' },
      ],
      correctOptionId: 'B',
      explanationSv:
        'Syftet är att alla i landet ska ha tillgång till saklig information, oavsett var man bor eller hur mycket pengar man har.',
      explanationEn:
        'The aim is that everyone in the country has access to factual information, wherever they live and however much money they have.',
      source: {
        chapter: 6,
        page: 21,
        quote:
          'Syftet är att alla i landet ska ha tillgång till saklig information, oavsett var man bor eller hur mycket pengar man har.',
      },
    },
    {
      id: 'k6-q20',
      prompt: 'Vilka slags program ska public service erbjuda?',
      options: [
        { id: 'A', text: 'Nyheter, sport, underhållning och kultur' },
        { id: 'B', text: 'Nyheter och politik men ingen underhållning' },
        { id: 'C', text: 'Barnprogram och utbildning men inga nyheter' },
        { id: 'D', text: 'Underhållning och reklam men ingen kultur' },
      ],
      correctOptionId: 'A',
      explanationSv:
        'Public service ska erbjuda många olika typer av program. De ska ha ett brett utbud med nyheter, sport, underhållning och kultur.',
      explanationEn:
        'Public service must offer a wide range of programmes with news, sport, entertainment and culture.',
      source: {
        chapter: 6,
        page: 21,
        quote: 'De ska också ha ett brett utbud av program med nyheter, sport, underhållning och kultur.',
      },
    },
    {
      id: 'k6-q21',
      prompt: 'Vilket alternativ beskriver bäst innehållet på webben och i sociala medier?',
      options: [
        { id: 'A', text: 'Journalister skapar det, och en ansvarig utgivare granskar allt' },
        { id: 'B', text: 'Staten kontrollerar det, och allt måste godkännas i förväg' },
        { id: 'C', text: 'Vem som helst kan skapa det, och det kontrolleras inte lika noga' },
        { id: 'D', text: 'Företag skapar det, och public service kontrollerar det noga' },
      ],
      correctOptionId: 'C',
      explanationSv:
        'Vem som helst kan skapa innehåll på webben och i sociala medier. Därför kontrolleras innehållet inte på samma sätt som i andra medier.',
      explanationEn:
        'Anyone can create content on the web and in social media, so it is not checked in the same way as content in other media.',
      source: {
        chapter: 6,
        page: 21,
        quote:
          'Det innebär att innehållet som sprids där inte kontrolleras på samma sätt som innehållet i andra medier.',
      },
    },
    {
      id: 'k6-q22',
      prompt: 'Varför är det viktigt att vara källkritisk enligt kapitlet?',
      options: [
        { id: 'A', text: 'För att staten vill att alla i landet ska ha samma åsikter' },
        { id: 'B', text: 'För att public service är ensamt om att sända nyheter i Sverige' },
        { id: 'C', text: 'För att alla tidningar först måste godkännas av staten' },
        { id: 'D', text: 'För att falska uppgifter kan spridas snabbt och påverka oss' },
      ],
      correctOptionId: 'D',
      explanationSv:
        'Allt som publiceras i medierna är inte alltid korrekt. Falska uppgifter kan spridas snabbt och påverka människors åsikter.',
      explanationEn:
        'Not everything published in the media is correct. False information can spread quickly and influence people\'s opinions.',
      source: {
        chapter: 6,
        page: 21,
        quote:
          'Men allt som publiceras i medierna är inte alltid korrekt. Falska uppgifter kan spridas snabbt och påverka människors åsikter.',
      },
    },
    {
      id: 'k6-q23',
      prompt:
        'Amina ser en video på en webbplats med en chockerande nyhet om hennes kommun. Vad är ett källkritiskt sätt att göra?',
      options: [
        { id: 'A', text: 'Skicka videon vidare direkt så att fler får veta' },
        { id: 'B', text: 'Tro på nyheten eftersom många redan har sett den' },
        { id: 'C', text: 'Kontrollera om nyheten stämmer innan hon tror på den' },
        { id: 'D', text: 'Tro på nyheten eftersom den finns på en webbplats' },
      ],
      correctOptionId: 'C',
      explanationSv:
        'Att vara källkritisk innebär att ifrågasätta och kontrollera om det man läser, ser eller hör är korrekt.',
      explanationEn:
        'Being critical of sources means questioning and checking whether what you read, see or hear is correct.',
      source: {
        chapter: 6,
        page: 21,
        quote: 'Det innebär att ifrågasätta och kontrollera om det man läser, ser eller hör är korrekt.',
      },
    },
  ],
  review: { reviewedAt: '2026-10-24', pdfVersion: '2026-08-10' },
}
