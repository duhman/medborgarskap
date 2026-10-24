import type { ChapterContent } from '../types'

export const politiskaValOchPartier: ChapterContent = {
  slug: 'politiska-val-och-partier',
  number: 4,
  title: 'Politiska val och partier',
  mp3Url:
    'https://www.uhr.se/globalassets/_uhr.se/medborgarskapsprovet/utbildningsmaterial/05_politiska-val-och-partier.mp3',
  intro:
    'Politiska partier samlar människor med gemensamma idéer om hur landet ska styras och försöker få väljarnas stöd. Kapitlet går igenom när val hålls, vem som får rösta, hur det går till att rösta och hur proportionella val fungerar.',
  bullets: [
    'Val till riksdag, regionfullmäktige och kommunfullmäktige hålls vart fjärde år, val till EU-parlamentet vart femte år.',
    'Man måste ha fyllt 18 år för att rösta, och i riksdagsvalet måste man vara svensk medborgare.',
    'Valen är hemliga: alla röstar bakom en skärm.',
    'Valen är proportionella, och ett parti behöver minst fyra procent av rösterna för att komma in i riksdagen.',
    'Folkomröstningar är rådgivande, och år 2003 röstade folket nej till euron.',
  ],
  summaryEasy: [
    'I Sverige är det val vart fjärde år. Då väljer man politiker till riksdagen, regionen och kommunen. Val till EU-parlamentet är vart femte år. Man röstar på det parti som man tycker har bäst politik.',
    'Man måste vara 18 år för att få rösta. I riksdagsvalet måste man också vara svensk medborgare. I kommunvalet och regionvalet behöver man inte vara svensk medborgare. Då finns andra regler, till exempel om hur länge man har varit folkbokförd i Sverige. Folkbokförd betyder att man är registrerad som boende i Sverige.',
    'Ibland är det folkomröstning om en viss fråga. En folkomröstning är rådgivande. Det betyder att politikerna inte måste följa resultatet. År 2003 röstade folket nej till euron. Sverige har kvar kronan.',
    'Före valet får man ett röstkort hem. Där står vilken vallokal man ska gå till. Man kan också rösta i förväg. Valet är hemligt. Alla röstar bakom en skärm, så ingen ser vad man väljer.',
    'Ett politiskt parti är en grupp med gemensamma idéer om samhället. Alla kan bli medlemmar i ett parti. Man kan också starta ett nytt parti. Före valet försöker partierna vinna väljarnas röster med debatter, möten och reklam.',
    'Valen är proportionella. Det betyder att ett parti får lika stor del av platserna som av rösterna. Ett parti måste få minst fyra procent av rösterna för att komma in i riksdagen. Partierna behöver ofta samarbeta för att få majoritet.',
  ],
  glossary: [
    {
      term: 'rösträtt',
      sv: 'Rätten att rösta i ett val.',
      en: 'Right to vote.',
    },
    {
      term: 'folkbokförd',
      sv: 'Registrerad hos Skatteverket som boende i Sverige.',
      en: 'Registered as a resident in the Swedish population register.',
    },
    {
      term: 'riksdagsval',
      sv: 'Valet där man väljer politiker till riksdagen.',
      en: 'Parliamentary election.',
    },
    {
      term: 'EU-parlamentet',
      sv: 'EU:s parlament, som man väljer ledamöter till vart femte år.',
      en: 'The European Parliament, elected every five years.',
    },
    {
      term: 'folkomröstning',
      sv: 'En omröstning där folket säger vad de tycker om en särskild fråga.',
      en: 'Referendum, a vote by the people on one specific question.',
    },
    {
      term: 'rådgivande',
      sv: 'Resultatet är ett råd, och politikerna måste inte följa det.',
      en: 'Advisory: the result is advice and politicians do not have to follow it.',
    },
    {
      term: 'röstkort',
      sv: 'Ett kort som skickas hem före valet och visar vilken vallokal man ska gå till.',
      en: 'Voting card, sent home before the election, showing your polling station.',
    },
    {
      term: 'vallokal',
      sv: 'Platsen där man går och röstar på valdagen.',
      en: 'Polling station, the place where you vote.',
    },
    {
      term: 'valsedel',
      sv: 'Ett papper med ett partis namn som man lägger sin röst med.',
      en: 'Ballot paper for a party.',
    },
    {
      term: 'hemliga val',
      sv: 'Ingen annan får se vad man röstar på, därför röstar man bakom en skärm.',
      en: 'Secret ballot: nobody else may see how you vote.',
    },
    {
      term: 'politiskt parti',
      sv: 'En grupp människor med gemensamma idéer om hur samhället ska styras.',
      en: 'Political party, a group with shared ideas about how society should be run.',
    },
    {
      term: 'valrörelse',
      sv: 'Tiden före ett val när partierna försöker få väljarnas röster.',
      en: 'Election campaign, the period before an election when parties seek votes.',
    },
    {
      term: 'proportionella val',
      sv: 'Partierna får platser efter hur stor andel av rösterna de får.',
      en: 'Proportional elections: seats are shared out by each party\'s share of the vote.',
    },
    {
      term: 'majoritet',
      sv: 'Fler än hälften av rösterna eller platserna.',
      en: 'Majority, more than half of the votes or seats.',
    },
  ],
  review: { reviewedAt: '2026-10-24', pdfVersion: '2026-08-10' },
  questions: [
    {
      id: 'k4-q1',
      prompt: 'Hur ofta hålls val till riksdag, regionfullmäktige och kommunfullmäktige?',
      options: [
        { id: 'A', text: 'Vart fjärde år' },
        { id: 'B', text: 'Vart femte år' },
        { id: 'C', text: 'Vart tredje år' },
        { id: 'D', text: 'Vart sjätte år' },
      ],
      correctOptionId: 'A',
      explanationSv:
        'Val till riksdag, regionfullmäktige och kommunfullmäktige hålls vart fjärde år. Det är valet till EU-parlamentet som hålls vart femte år.',
      explanationEn:
        'Elections to parliament, regional councils and municipal councils are held every four years. European Parliament elections are every five years.',
      source: {
        chapter: 4,
        page: 14,
        quote: 'Val till riksdag, regionfullmäktige och kommunfullmäktige hålls vart fjärde år.',
      },
    },
    {
      id: 'k4-q2',
      prompt: 'Vad innebär det att valen i Sverige är proportionella?',
      options: [
        { id: 'A', text: 'Partiet med flest röster får alla platser i riksdagen' },
        { id: 'B', text: 'Partierna får platser utifrån den andel röster de har fått' },
        { id: 'C', text: 'Varje kommun får lika många platser i riksdagen' },
        { id: 'D', text: 'De två största partierna delar på alla platser' },
      ],
      correctOptionId: 'B',
      explanationSv:
        'Proportionella val betyder att partierna får platser utifrån sin andel av rösterna. Får ett parti tjugo procent av rösterna, så får det tjugo procent av platserna.',
      explanationEn:
        'Proportional elections mean parties get seats according to their share of the vote. A party with twenty percent of the votes gets twenty percent of the seats.',
      source: {
        chapter: 4,
        page: 15,
        quote:
          'Proportionella val betyder att partierna får platser i riksdagen eller i region- och kommunfullmäktige utifrån den andel röster de fått.',
      },
    },
    {
      id: 'k4-q3',
      prompt: 'Hur stor andel av rösterna måste ett parti minst få för att komma in i riksdagen?',
      options: [
        { id: 'A', text: 'Två procent' },
        { id: 'B', text: 'Tre procent' },
        { id: 'C', text: 'Fyra procent' },
        { id: 'D', text: 'Tio procent' },
      ],
      correctOptionId: 'C',
      explanationSv:
        'Ett parti måste få minst fyra procent av rösterna i valet för att komma in i riksdagen.',
      explanationEn: 'A party must get at least four percent of the votes to enter parliament.',
      source: {
        chapter: 4,
        page: 15,
        quote:
          'För att ett parti ska komma in i riksdagen måste det få minst fyra procent av rösterna i valet.',
      },
    },
    {
      id: 'k4-q4',
      prompt: 'Vad blev resultatet av folkomröstningen om euron år 2003?',
      options: [
        { id: 'A', text: 'Folket röstade ja och Sverige bytte till euro' },
        { id: 'B', text: 'Omröstningen ställdes in och frågan avgjordes av EU' },
        { id: 'C', text: 'Folket röstade ja, men riksdagen sa nej till euron' },
        { id: 'D', text: 'Folket röstade nej och Sverige behöll kronan' },
      ],
      correctOptionId: 'D',
      explanationSv:
        'År 2003 röstade folket nej till att byta ut den svenska kronan mot euro. Sverige behöll därför kronan.',
      explanationEn:
        'In 2003 the people voted no to replacing the Swedish krona with the euro, so Sweden kept the krona.',
      source: {
        chapter: 4,
        page: 14,
        quote:
          'Folket röstade nej till att byta ut den svenska kronan mot euro och Sverige behöll den svenska kronan.',
      },
    },
    {
      id: 'k4-q5',
      prompt: 'Vad krävs, utöver att ha fyllt 18 år, för att få rösta i riksdagsvalet?',
      options: [
        { id: 'A', text: 'Att man är svensk medborgare' },
        { id: 'B', text: 'Att man är medlem i ett parti' },
        { id: 'C', text: 'Att man är medborgare i ett EU-land' },
        { id: 'D', text: 'Att man har ett arbete i Sverige' },
      ],
      correctOptionId: 'A',
      explanationSv:
        'För att rösta i riksdagsvalet måste man ha fyllt 18 år och vara svensk medborgare. I kommun- och regionvalen gäller andra regler.',
      explanationEn:
        'To vote in the parliamentary election you must be 18 and a Swedish citizen. Other rules apply in municipal and regional elections.',
      source: {
        chapter: 4,
        page: 14,
        quote: 'För att rösta i riksdagsvalet måste man även vara svensk medborgare.',
      },
    },
    {
      id: 'k4-q6',
      prompt: 'I vilket land röstar en EU-medborgare i valet till EU-parlamentet?',
      options: [
        { id: 'A', text: 'I det land där hen är född' },
        { id: 'B', text: 'I det land där hen är folkbokförd' },
        { id: 'C', text: 'I det land där EU-parlamentet ligger' },
        { id: 'D', text: 'I det land där hen har flest släktingar' },
      ],
      correctOptionId: 'B',
      explanationSv:
        'EU-medborgare röstar till EU-parlamentet i det land där de är folkbokförda.',
      explanationEn:
        'EU citizens vote in the European Parliament election in the country where they are registered as residents.',
      source: {
        chapter: 4,
        page: 14,
        quote: 'EU-medborgare röstar till EU-parlamentet i det land där de är folkbokförda.',
      },
    },
    {
      id: 'k4-q7',
      prompt: 'Hur ofta hålls val till EU-parlamentet?',
      options: [
        { id: 'A', text: 'Vartannat år' },
        { id: 'B', text: 'Vart fjärde år' },
        { id: 'C', text: 'Vart femte år' },
        { id: 'D', text: 'Vart åttonde år' },
      ],
      correctOptionId: 'C',
      explanationSv:
        'Val till EU-parlamentet hålls vart femte år. Valen i Sverige till riksdag, region och kommun hålls vart fjärde år.',
      explanationEn:
        'European Parliament elections are held every five years. Swedish national, regional and municipal elections are every four years.',
      source: {
        chapter: 4,
        page: 14,
        quote: 'Val till EU-parlamentet hålls vart femte år.',
      },
    },
    {
      id: 'k4-q8',
      prompt: 'Hur gammal måste man vara för att ha rätt att rösta i Sverige?',
      options: [
        { id: 'A', text: 'Man måste ha fyllt 15 år' },
        { id: 'B', text: 'Man måste ha fyllt 16 år' },
        { id: 'C', text: 'Man måste ha fyllt 21 år' },
        { id: 'D', text: 'Man måste ha fyllt 18 år' },
      ],
      correctOptionId: 'D',
      explanationSv: 'För att ha rätt att rösta ska man ha fyllt 18 år.',
      explanationEn: 'You must have turned 18 to have the right to vote.',
      source: {
        chapter: 4,
        page: 14,
        quote: 'För att ha rätt att rösta ska man ha fyllt 18 år.',
      },
    },
    {
      id: 'k4-q9',
      prompt:
        'Omar är medborgare i ett land utanför EU och Norden och bor i Sverige. Vad gäller för honom i kommunvalet?',
      options: [
        { id: 'A', text: 'Han kan få rösta om han har varit folkbokförd i Sverige en viss tid' },
        { id: 'B', text: 'Han kan inte rösta i kommunvalet förrän han har blivit svensk medborgare' },
        { id: 'C', text: 'Han får rösta i kommunvalet om han blir medlem i ett politiskt parti' },
        { id: 'D', text: 'Han får bara rösta i kommunvalet i det land där han är medborgare' },
      ],
      correctOptionId: 'A',
      explanationSv:
        'För att rösta i kommun- och regionvalen behöver man inte vara svensk medborgare. Den som inte är medborgare i ett EU-land eller i Norden måste ha varit folkbokförd i Sverige i tre år. Enligt reglerna som gäller i dag ska det vara tre år i följd närmast före valdagen.',
      explanationEn:
        'You do not need to be a Swedish citizen to vote in municipal and regional elections. Citizens of countries outside the EU and the Nordic region must have been registered as residents in Sweden for three years. Under the current rules, these must be three years in a row immediately before election day.',
      source: {
        chapter: 4,
        page: 14,
        quote:
          'För att rösta i kommun- och regionvalen behöver man inte vara svensk medborgare',
      },
    },
    {
      id: 'k4-q10',
      prompt:
        'Mikko är 30 år, finsk medborgare och folkbokförd i Sverige. Vad krävs för att han ska få rösta i kommunvalet?',
      options: [
        { id: 'A', text: 'Att han först blir svensk medborgare genom en ansökan' },
        { id: 'B', text: 'Inget mer, det räcker att han är folkbokförd här' },
        { id: 'C', text: 'Att han är medlem i ett svenskt politiskt parti' },
        { id: 'D', text: 'Att han har varit folkbokförd här i tre år i följd' },
      ],
      correctOptionId: 'B',
      explanationSv:
        'EU-medborgare och medborgare i Norden behöver bara vara folkbokförda i Sverige för att få rösta i kommun- och regionvalen. Finland är både ett EU-land och ett nordiskt land.',
      explanationEn:
        'EU citizens and Nordic citizens only need to be registered as residents in Sweden to vote in municipal and regional elections. Finland is both an EU and a Nordic country.',
      source: {
        chapter: 4,
        page: 14,
        quote:
          'EU-medborgare eller medborgare i Norden behöver endast vara folkbokförda i landet.',
      },
    },
    {
      id: 'k4-q11',
      prompt: 'Vilket alternativ beskriver bäst att folkomröstningar i Sverige är rådgivande?',
      options: [
        { id: 'A', text: 'Resultatet blir automatiskt en ny lag' },
        { id: 'B', text: 'Politikerna röstar i stället för folket' },
        { id: 'C', text: 'Politikerna måste inte följa resultatet' },
        { id: 'D', text: 'Resultatet måste godkännas av EU' },
      ],
      correctOptionId: 'C',
      explanationSv:
        'Folkomröstningarna är rådgivande. Det betyder att politikerna inte måste följa resultatet.',
      explanationEn: 'Referendums are advisory, which means politicians do not have to follow the result.',
      source: {
        chapter: 4,
        page: 14,
        quote: 'Folkomröstningarna är rådgivande',
      },
    },
    {
      id: 'k4-q12',
      prompt: 'Var kan en folkomröstning hållas?',
      options: [
        { id: 'A', text: 'I hela landet, men inte i regioner eller kommuner' },
        { id: 'B', text: 'I regioner och kommuner, men inte i hela landet' },
        { id: 'C', text: 'I samband med valet till EU-parlamentet' },
        { id: 'D', text: 'Nationellt, i en region eller i en kommun' },
      ],
      correctOptionId: 'D',
      explanationSv:
        'Folkomröstningar hålls ibland om en särskild fråga. De kan hållas nationellt, i en region eller i en kommun.',
      explanationEn:
        'Referendums are sometimes held on a specific question. They can be national, regional or municipal.',
      source: {
        chapter: 4,
        page: 14,
        quote:
          'Ibland hålls folkomröstningar om en särskild fråga. De kan hållas nationellt, i en region eller i en kommun.',
      },
    },
    {
      id: 'k4-q13',
      prompt: 'Vad står på det röstkort som skickas hem till den som har rösträtt?',
      options: [
        { id: 'A', text: 'Vilken vallokal man ska gå till' },
        { id: 'B', text: 'Vilket parti man bör rösta på' },
        { id: 'C', text: 'Hur många platser varje parti har' },
        { id: 'D', text: 'Vilka politiker som redan är valda' },
      ],
      correctOptionId: 'A',
      explanationSv:
        'Före valet får de som har rätt att rösta ett röstkort hemskickat. Där står vilken vallokal man ska gå till.',
      explanationEn:
        'Before the election, everyone with the right to vote gets a voting card at home. It says which polling station to go to.',
      source: {
        chapter: 4,
        page: 14,
        quote:
          'De som har rätt att rösta får ett röstkort hemskickat före valet där det står vilken vallokal man ska gå till.',
      },
    },
    {
      id: 'k4-q14',
      prompt: 'Lena ska resa bort på valdagen. Vad kan hon göra för att ändå rösta?',
      options: [
        { id: 'A', text: 'Hon kan rösta via telefon till sin kommun på valdagen' },
        { id: 'B', text: 'Hon kan rösta i förväg på en särskild plats före valdagen' },
        { id: 'C', text: 'Hon kan lämna sin röst till ett parti som räknar den' },
        { id: 'D', text: 'Hon kan rösta i efterhand när hon kommer hem igen' },
      ],
      correctOptionId: 'B',
      explanationSv:
        'Man brukar rösta i den vallokal som står på röstkortet. Men det går också bra att rösta i förväg på särskilda platser.',
      explanationEn:
        'You usually vote at the polling station on your voting card, but you can also vote in advance at special places.',
      source: {
        chapter: 4,
        page: 14,
        quote: 'förväg på särskilda platser. I vallokalen finns valsedlar till de olika partierna.',
      },
    },
    {
      id: 'k4-q15',
      prompt: 'Vad är en folkomröstning?',
      options: [
        { id: 'A', text: 'Ett val där folket väljer ledamöter till riksdagen' },
        { id: 'B', text: 'Ett möte där partierna debatterar inför valet' },
        { id: 'C', text: 'En omröstning där folket röstar om en särskild fråga' },
        { id: 'D', text: 'En omröstning i riksdagen om statens budget' },
      ],
      correctOptionId: 'C',
      explanationSv:
        'En folkomröstning hålls ibland om en särskild fråga. Då röstar folket om just den frågan, till exempel om euron år 2003.',
      explanationEn:
        'A referendum is sometimes held on one specific question. The people then vote on that question, for example on the euro in 2003.',
      source: {
        chapter: 4,
        page: 14,
        quote: 'Ibland hålls folkomröstningar om en särskild fråga.',
      },
    },
    {
      id: 'k4-q16',
      prompt: 'Ali kommer till sin vallokal för att rösta. Vad finns där som han använder för att rösta?',
      options: [
        { id: 'A', text: 'En lista där han skriver sitt namn och sitt parti' },
        { id: 'B', text: 'En dator där han måste logga in med sitt röstkort' },
        { id: 'C', text: 'En politiker från varje parti som tar emot hans röst' },
        { id: 'D', text: 'Valsedlar till de olika partierna' },
      ],
      correctOptionId: 'D',
      explanationSv:
        'I vallokalen finns valsedlar till de olika partierna. Valet är hemligt, så man röstar bakom en skärm.',
      explanationEn:
        'At the polling station there are ballot papers for the different parties. The vote is secret, so you vote behind a screen.',
      source: {
        chapter: 4,
        page: 14,
        quote: 'I vallokalen finns valsedlar till de olika partierna. Valen är hemliga.',
      },
    },
    {
      id: 'k4-q17',
      prompt: 'Vad är ett politiskt parti, enligt kapitlet?',
      options: [
        { id: 'A', text: 'En grupp människor med gemensamma idéer om hur samhället ska styras' },
        { id: 'B', text: 'En statlig myndighet som genomför riksdagens beslut i praktiken' },
        { id: 'C', text: 'En förening som ordnar valen och räknar rösterna i vallokalen' },
        { id: 'D', text: 'En grupp ledamöter som kungen utser efter varje riksdagsval' },
      ],
      correctOptionId: 'A',
      explanationSv:
        'Politiska partier samlar människor med gemensamma idéer om hur samhället ska styras. De föreslår lösningar och driver frågor de tycker är viktiga.',
      explanationEn:
        'Political parties bring together people with shared ideas about how society should be run. They propose solutions and push issues they think are important.',
      source: {
        chapter: 4,
        page: 15,
        quote:
          'Politiska partier samlar människor med gemensamma idéer om hur samhället ska styras.',
      },
    },
    {
      id: 'k4-q18',
      prompt: 'Vilket alternativ beskriver bäst vad det betyder för väljarna att partierna föreslår olika lösningar?',
      options: [
        { id: 'A', text: 'Väljarna måste rösta på flera partier samtidigt' },
        { id: 'B', text: 'Väljarna har olika alternativ att välja mellan' },
        { id: 'C', text: 'Väljarna slipper välja mellan olika partier' },
        { id: 'D', text: 'Väljarna behöver inte rösta i varje val' },
      ],
      correctOptionId: 'B',
      explanationSv:
        'Partierna föreslår olika lösningar och driver olika frågor. Det innebär att de som röstar har olika alternativ att välja mellan.',
      explanationEn:
        'Parties propose different solutions and push different issues, so voters have different alternatives to choose from.',
      source: {
        chapter: 4,
        page: 15,
        quote: 'Det innebär att de som röstar har olika alternativ att välja mellan.',
      },
    },
    {
      id: 'k4-q19',
      prompt:
        'Johanna vill vara med och påverka innehållet i ett partis politik. Vad säger kapitlet att hon kan göra?',
      options: [
        { id: 'A', text: 'Hon måste först bli vald till riksdagen' },
        { id: 'B', text: 'Hon måste få tillstånd från en myndighet' },
        { id: 'C', text: 'Hon kan bli medlem i ett politiskt parti' },
        { id: 'D', text: 'Hon kan bara påverka genom att rösta' },
      ],
      correctOptionId: 'C',
      explanationSv:
        'Alla som vill kan bli medlemmar i ett politiskt parti för att påverka innehållet i politiken. Alla kan engagera sig aktivt i partipolitiken.',
      explanationEn:
        'Anyone who wants to can join a political party to influence its policies. Everyone can take an active part in party politics.',
      source: {
        chapter: 4,
        page: 15,
        quote:
          'Alla som vill kan också bli medlemmar i ett politiskt parti för att påverka innehållet i politiken.',
      },
    },
    {
      id: 'k4-q20',
      prompt:
        'En grupp vänner tycker att inget parti driver de frågor som de tycker är viktiga. Vad gäller?',
      options: [
        { id: 'A', text: 'De måste välja ett av partierna som redan finns' },
        { id: 'B', text: 'Riksdagen måste först godkänna att ett nytt parti bildas' },
        { id: 'C', text: 'Nya partier får bildas först efter en folkomröstning' },
        { id: 'D', text: 'De kan starta ett nytt parti tillsammans' },
      ],
      correctOptionId: 'D',
      explanationSv: 'Det går att starta ett nytt parti tillsammans med andra.',
      explanationEn: 'It is possible to start a new party together with others.',
      source: {
        chapter: 4,
        page: 15,
        quote: 'Det går även att starta ett nytt parti tillsammans med andra.',
      },
    },
    {
      id: 'k4-q21',
      prompt: 'Hur försöker partierna övertyga väljarna under valrörelsen?',
      options: [
        { id: 'A', text: 'Genom debatter, möten, politisk reklam och kampanjer' },
        { id: 'B', text: 'Genom att dela ut röstkort till sina egna anhängare' },
        { id: 'C', text: 'Genom att stå bakom skärmen och hjälpa väljarna rösta' },
        { id: 'D', text: 'Genom att skicka valsedlar direkt till riksdagen' },
      ],
      correctOptionId: 'A',
      explanationSv:
        'Under valrörelsen inför valen försöker partierna övertyga väljarna genom debatter, möten, politisk reklam och kampanjer.',
      explanationEn:
        'During the election campaign, parties try to persuade voters through debates, meetings, political advertising and campaigns.',
      source: {
        chapter: 4,
        page: 15,
        quote:
          'Under valrörelsen inför valen försöker partierna övertyga väljarna genom debatter, möten, politisk reklam och kampanjer.',
      },
    },
    {
      id: 'k4-q22',
      prompt: 'Varför försöker de politiska partierna få stöd från folket?',
      options: [
        { id: 'A', text: 'För att få bestämma vem som blir kung eller drottning' },
        { id: 'B', text: 'För att deras kandidater ska bli valda' },
        { id: 'C', text: 'För att få driva myndigheter som företag' },
        { id: 'D', text: 'För att slippa delta i debatter inför valet' },
      ],
      correctOptionId: 'B',
      explanationSv:
        'Partierna har olika idéer om hur landet ska styras. De försöker få stöd från folket för att deras kandidater ska bli valda till riksdagen, regionerna, kommunerna eller EU.',
      explanationEn:
        'Parties have different ideas about how the country should be run. They seek public support so that their candidates are elected to parliament, the regions, the municipalities or the EU.',
      source: {
        chapter: 4,
        page: 14,
        quote:
          'försöker få stöd från folket för att deras kandidater ska bli valda till riksdagen, regionerna, kommunerna eller EU',
      },
    },
    {
      id: 'k4-q23',
      prompt: 'Varför behöver partierna ofta samarbeta med varandra efter ett proportionellt val?',
      options: [
        { id: 'A', text: 'För att kunna dela på röstkorten till nästa val' },
        { id: 'B', text: 'För att lagen förbjuder ett parti att regera ensamt' },
        { id: 'C', text: 'För att få majoritet för sina politiska förslag' },
        { id: 'D', text: 'För att kunna hålla en folkomröstning om varje lag' },
      ],
      correctOptionId: 'C',
      explanationSv:
        'Partierna får platser efter sin andel av rösterna. Därför har ett parti sällan majoritet ensamt och behöver ofta samarbeta för att få majoritet för sina förslag.',
      explanationEn:
        'Parties get seats in proportion to their share of the vote, so one party rarely has a majority alone and often needs to cooperate to get its proposals through.',
      source: {
        chapter: 4,
        page: 15,
        quote: 'Ofta behöver partierna därför samarbeta för att få majoritet för sina politiska förslag.',
      },
    },
    {
      id: 'k4-q24',
      prompt: 'Vilket alternativ beskriver bäst varför regeln om fyra procent finns?',
      options: [
        { id: 'A', text: 'Den ska se till att alla partier får minst några platser' },
        { id: 'B', text: 'Den ska göra det lättare för nya partier att komma in' },
        { id: 'C', text: 'Den ska bestämma hur många som får rösta i varje kommun' },
        { id: 'D', text: 'Den ska hindra att för många partier kommer in i riksdagen' },
      ],
      correctOptionId: 'D',
      explanationSv:
        'Regeln om fyra procent ska hindra att för många partier kommer in i riksdagen. Många små partier skulle göra det svårare att skapa stabila majoriteter.',
      explanationEn:
        'The four percent rule prevents too many parties from entering parliament, which would make stable majorities harder to form.',
      source: {
        chapter: 4,
        page: 15,
        quote:
          'Regeln om fyra procent finns för att hindra att för många partier kommer in i riksdagen vilket skulle göra det svårare att skapa stabila majoriteter.',
      },
    },
    {
      id: 'k4-q25',
      prompt:
        'I kommunvalet ser Kim ett parti som bara har en politik för den egna kommunen. Vilket alternativ beskriver bäst ett sådant parti?',
      options: [
        { id: 'A', text: 'Det är förbjudet, alla partier måste ha en politik för hela landet' },
        { id: 'B', text: 'Sådana lokala partier brukar finnas i region- och kommunvalen' },
        { id: 'C', text: 'Det får finnas i Stockholm, men inte i mindre kommuner' },
        { id: 'D', text: 'Det måste först ha minst fyra procent av rösterna i riksdagsvalet' },
      ],
      correctOptionId: 'B',
      explanationSv:
        'I region- och kommunvalen brukar det finnas särskilda partier som endast har en politik för just sin region eller kommun, och inte på riksnivå.',
      explanationEn:
        'In regional and municipal elections there are often special parties with policies only for their own region or municipality, not the whole country.',
      source: {
        chapter: 4,
        page: 15,
        quote:
          'I region- och kommunvalen brukar det finnas särskilda partier som endast har en politik för just sin region eller kommun',
      },
    },
  ],
}
