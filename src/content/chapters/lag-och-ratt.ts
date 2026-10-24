import type { ChapterContent } from '../types'

export const lagOchRatt: ChapterContent = {
  slug: 'lag-och-ratt',
  number: 5,
  title: 'Lag och rätt',
  mp3Url:
    'https://www.uhr.se/globalassets/_uhr.se/medborgarskapsprovet/utbildningsmaterial/06_lag-och-ratt.mp3',
  intro:
    'Kapitlet handlar om lagar som alla måste följa. Det beskriver Sveriges fyra grundlagar och allemansrätten, och hur rättsväsendet med polis, åklagare och domstolar utreder brott och dömer på ett rättssäkert sätt.',
  bullets: [
    'Sverige har fyra grundlagar: regeringsformen, tryckfrihetsförordningen, yttrandefrihetsgrundlagen och successionsordningen.',
    'Allemansrätten är skyddad i regeringsformen och ger alla möjlighet att vara i naturen, med ansvar.',
    'Rättssäkerhet betyder att alla behandlas lika inför lagen och får en rättvis rättegång i oberoende domstolar.',
    'Det finns tre nivåer av domstolar: tingsrätten, hovrätten och Högsta domstolen.',
    'Man är som huvudregel straffmyndig från 15 år. För yngre barn bestämmer socialtjänsten vad som ska hända.',
  ],
  summaryEasy: [
    'Lagar är regler som alla måste följa. Lagarna skyddar människor. Rättssäkerhet betyder att alla behandlas lika inför lagen. Alla har rätt till en rättvis rättegång.',
    'Sverige har fyra grundlagar. En grundlag är en lag som är svårare att ändra än andra lagar. Regeringsformen säger att all makt kommer från folket. Tryckfrihetsförordningen och yttrandefrihetsgrundlagen skyddar rätten att säga och skriva vad man tycker. Men det är förbjudet att till exempel förtala andra eller sprida hat mot en folkgrupp. Successionsordningen säger vem som blir kung eller drottning.',
    'Allemansrätten är skyddad i grundlagen. Den betyder att alla får vara i naturen. Du får till exempel gå, tälta och plocka bär och svamp. Du får inte skada naturen eller störa den som äger marken.',
    'Rättsväsendet är myndigheter som ser till att lagarna följs. Polisen förhindrar och utreder brott. Åklagaren bestämmer om en misstänkt person ska ställas inför domstol. Domstolarna är oberoende. Det betyder att regeringen och riksdagen inte kan bestämma hur de dömer.',
    'Det finns tre nivåer av domstolar. Ett mål börjar i tingsrätten. Den som tycker att domen är fel kan överklaga till hovrätten. Högsta domstolen tar bara vissa viktiga fall. En misstänkt person är oskyldig tills en domstol har dömt personen.',
    'Man är straffmyndig från 15 år. Det är huvudregeln. Det betyder att man kan bli åtalad för ett brott. När ett yngre barn gör ett brott bestämmer socialtjänsten vad som ska hända. Den som döms för vissa allvarliga brott hamnar i belastningsregistret. Då kan det bli svårare att få jobb, körkort eller medborgarskap.',
  ],
  glossary: [
    {
      term: 'grundlag',
      sv: 'En viktig lag som är svårare att ändra än andra lagar.',
      en: 'Fundamental law: a constitutional law that is harder to change than ordinary laws.',
    },
    {
      term: 'regeringsformen',
      sv: 'Grundlagen som säger hur Sverige styrs och vilka fri- och rättigheter vi har.',
      en: 'Instrument of Government: the fundamental law on how Sweden is governed and on basic rights.',
    },
    {
      term: 'tryckfrihetsförordningen',
      sv: 'Grundlagen som skyddar rätten att fritt ge ut böcker och tidningar.',
      en: 'Freedom of the Press Act: protects the right to publish printed texts freely.',
    },
    {
      term: 'yttrandefrihetsgrundlagen',
      sv: 'Grundlagen som skyddar rätten att säga vad man tycker, till exempel i radio och tv.',
      en: 'Fundamental Law on Freedom of Expression: covers radio, TV and similar media.',
    },
    {
      term: 'successionsordningen',
      sv: 'Grundlagen som säger vem som blir kung eller drottning.',
      en: 'Act of Succession: decides who becomes the next king or queen.',
    },
    {
      term: 'allemansrätten',
      sv: 'Rätten för alla att vara i naturen, om man inte skadar naturen eller stör markägaren.',
      en: 'Right of public access: everyone may move and stay in nature, responsibly.',
    },
    {
      term: 'rättsväsendet',
      sv: 'Myndigheterna som ser till att lagarna följs, till exempel polisen och domstolarna.',
      en: 'The justice system: the authorities that make sure laws are followed.',
    },
    {
      term: 'rättssäkerhet',
      sv: 'Alla behandlas lika inför lagen och får en rättvis rättegång.',
      en: 'Legal certainty / rule of law: equal treatment before the law and a fair trial.',
    },
    {
      term: 'åklagare',
      sv: 'En person som bestämmer om det ska bli rättegång och försöker bevisa att den åtalade är skyldig.',
      en: 'Prosecutor: decides whether to bring a case to court and argues it there.',
    },
    {
      term: 'tingsrätten',
      sv: 'Den första domstolen, där brottmål och tvistemål börjar.',
      en: 'District court: the first-instance court.',
    },
    {
      term: 'överklaga',
      sv: 'Att be en högre domstol att titta på ett fall igen.',
      en: 'To appeal: to ask a higher court to look at a case again.',
    },
    {
      term: 'häktning',
      sv: 'En domstol beslutar att en misstänkt person ska vara inlåst en längre tid.',
      en: 'Detention (remand): a court orders a suspect to be held for a longer time.',
    },
    {
      term: 'nämndemän',
      sv: 'Vanliga personer som dömer tillsammans med domaren i tingsrätten.',
      en: 'Lay judges: members of the public who judge together with the judge in the district court.',
    },
    {
      term: 'straffmyndig',
      sv: 'Gammal nog för att kunna bli åtalad för ett brott, i Sverige som huvudregel från 15 år.',
      en: 'Of the age of criminal responsibility (15 in Sweden as a main rule).',
    },
    {
      term: 'belastningsregister',
      sv: 'Ett register över personer som har dömts för vissa brott.',
      en: 'Criminal record register.',
    },
  ],
  questions: [
    {
      id: 'k5-q1',
      prompt: 'Hur många grundlagar finns det i Sverige?',
      options: [
        { id: 'A', text: 'Två grundlagar' },
        { id: 'B', text: 'Fyra grundlagar' },
        { id: 'C', text: 'Tre grundlagar' },
        { id: 'D', text: 'Fem grundlagar' },
      ],
      correctOptionId: 'B',
      explanationSv:
        'Sverige har fyra grundlagar: regeringsformen, tryckfrihetsförordningen, yttrandefrihetsgrundlagen och successionsordningen.',
      explanationEn:
        'Sweden has four fundamental laws: the Instrument of Government, the Freedom of the Press Act, the Fundamental Law on Freedom of Expression and the Act of Succession.',
      source: {
        chapter: 5,
        page: 16,
        quote:
          'Sverige har fyra grundlagar: regeringsformen, tryckfrihetsförordningen, yttrandefrihetsgrundlagen och successionsordningen.',
      },
    },
    {
      id: 'k5-q2',
      prompt: 'Vilken grundlag bestämmer vem som blir kung eller drottning efter den nuvarande?',
      options: [
        { id: 'A', text: 'Regeringsformen' },
        { id: 'B', text: 'Tryckfrihetsförordningen' },
        { id: 'C', text: 'Successionsordningen' },
        { id: 'D', text: 'Yttrandefrihetsgrundlagen' },
      ],
      correctOptionId: 'C',
      explanationSv:
        'Successionsordningen är den grundlag som bestämmer vem som ska bli nästa kung eller drottning.',
      explanationEn: 'The Act of Succession is the fundamental law that decides who becomes the next king or queen.',
      source: {
        chapter: 5,
        page: 16,
        quote:
          'Successionsordningen är den grundlag som bestämmer vem som ska bli kung eller drottning efter den nuvarande.',
      },
    },
    {
      id: 'k5-q3',
      prompt: 'I vilken domstol börjar ett brottmål?',
      options: [
        { id: 'A', text: 'Tingsrätten' },
        { id: 'B', text: 'Hovrätten' },
        { id: 'C', text: 'Högsta domstolen' },
        { id: 'D', text: 'Förvaltningsrätten' },
      ],
      correctOptionId: 'A',
      explanationSv:
        'Tingsrätten är första instans, där brottmål och tvistemål börjar. Hovrätten prövar fall som har överklagats från tingsrätten.',
      explanationEn:
        'The district court (tingsrätten) is the first instance, where criminal and civil cases start. The court of appeal hears cases appealed from it.',
      source: {
        chapter: 5,
        page: 18,
        quote: 'första instans, där brottsmål och tvistemål börjar.',
      },
    },
    {
      id: 'k5-q4',
      prompt: 'Vad gäller för en person som är misstänkt för ett brott?',
      options: [
        { id: 'A', text: 'Personen ska ses som skyldig tills hen bevisar motsatsen' },
        { id: 'B', text: 'Personen får inte ta hjälp av en advokat före rättegången' },
        { id: 'C', text: 'Personen döms direkt av polisen när hen grips' },
        { id: 'D', text: 'Personen ska ses som oskyldig tills hen har dömts för brottet' },
      ],
      correctOptionId: 'D',
      explanationSv:
        'En misstänkt person ska betraktas som oskyldig tills en domstol har dömt personen för brottet. Det är bara domstolar som dömer.',
      explanationEn:
        'A suspect must be regarded as innocent until a court has convicted them. Only courts decide guilt.',
      source: {
        chapter: 5,
        page: 18,
        quote:
          'En person som är misstänkt för ett brott ska betraktas som oskyldig tills dess att den dömts för brottet.',
      },
    },
    {
      id: 'k5-q5',
      prompt: 'Från vilken ålder är man som huvudregel straffmyndig i Sverige?',
      options: [
        { id: 'A', text: '12 år' },
        { id: 'B', text: '18 år' },
        { id: 'C', text: '15 år' },
        { id: 'D', text: '20 år' },
      ],
      correctOptionId: 'C',
      explanationSv:
        'Enligt materialet är man straffmyndig och kan bli åtalad för brott från 15 års ålder. Sedan 10 september 2026 gäller en tillfällig regel om 14 år för vissa allvarliga brott (materialet nämner bara ett förslag om 13 år).',
      explanationEn:
        'According to the material, you can be prosecuted for a crime from the age of 15. Since 10 September 2026 a temporary rule sets the age at 14 for certain serious crimes.',
      source: {
        chapter: 5,
        page: 19,
        quote: 'I Sverige är en person straffmyndig och kan bli åtalad för ett brott från 15 års ålder.',
      },
    },
    {
      id: 'k5-q6',
      prompt: 'Vad innebär allemansrätten?',
      options: [
        { id: 'A', text: 'Att alla får bygga ett hus på mark som ingen använder' },
        { id: 'B', text: 'Att alla får vara i naturen oavsett vem som äger marken' },
        { id: 'C', text: 'Att alla får jaga och fiska överallt utan tillstånd' },
        { id: 'D', text: 'Att alla får gå in i andras trädgårdar för att vila' },
      ],
      correctOptionId: 'B',
      explanationSv:
        'Allemansrätten ger alla möjlighet att vara i naturen, även på mark som någon annan äger. Man måste vara ansvarsfull och inte skada naturen.',
      explanationEn:
        'The right of public access lets everyone be in nature, whoever owns the land, as long as they act responsibly.',
      source: {
        chapter: 5,
        page: 17,
        quote: 'Allemansrätten ger alla möjlighet att vara i naturen oavsett vem som äger marken.',
      },
    },
    {
      id: 'k5-q7',
      prompt: 'Vad skiljer en grundlag från andra lagar?',
      options: [
        { id: 'A', text: 'Den beslutas av folket i en folkomröstning varje år' },
        { id: 'B', text: 'Den bestäms av kungen och inte av riksdagen' },
        { id: 'C', text: 'Den skrivs av domstolarna och inte av politikerna' },
        { id: 'D', text: 'Den är svårare att ändra än andra lagar' },
      ],
      correctOptionId: 'D',
      explanationSv: 'Grundlagarna är svårare att ändra än andra lagar. Det gör dem stabila över tid.',
      explanationEn: 'Fundamental laws are harder to change than other laws, which makes them stable.',
      source: {
        chapter: 5,
        page: 16,
        quote: 'Grundlagarna är svårare att ändra än andra lagar.',
      },
    },
    {
      id: 'k5-q8',
      prompt: 'Enligt regeringsformen, varifrån utgår all offentlig makt i Sverige?',
      options: [
        { id: 'A', text: 'Från folket' },
        { id: 'B', text: 'Från regeringen' },
        { id: 'C', text: 'Från kungen' },
        { id: 'D', text: 'Från domstolarna' },
      ],
      correctOptionId: 'A',
      explanationSv:
        'Regeringsformen säger att all offentlig makt i Sverige utgår från folket. Det är grunden för demokratin.',
      explanationEn:
        'The Instrument of Government says that all public power in Sweden comes from the people.',
      source: {
        chapter: 5,
        page: 16,
        quote: 'Regeringsformen säger att all offentlig makt utgår från folket,',
      },
    },
    {
      id: 'k5-q9',
      prompt: 'Vilket alternativ beskriver bäst vad regeringsformen innehåller?',
      options: [
        { id: 'A', text: 'Vem som ska ärva tronen efter den nuvarande kungen' },
        { id: 'B', text: 'Hur landet styrs och vilka rättigheter medborgarna har' },
        { id: 'C', text: 'Hur en rättegång i tingsrätten ska gå till steg för steg' },
        { id: 'D', text: 'Hur man får ge ut böcker, tidningar och tidskrifter' },
      ],
      correctOptionId: 'B',
      explanationSv:
        'Regeringsformen säger att riksdagen stiftar lagar och att regeringen styr landet. Den garanterar också medborgarnas grundläggande fri- och rättigheter.',
      explanationEn:
        'The Instrument of Government says the Riksdag makes laws and the government rules the country, and it guarantees basic rights and freedoms.',
      source: {
        chapter: 5,
        page: 16,
        quote:
          'att riksdagen stiftar lagar och att regeringen styr landet. Den garanterar medborgarnas grundläggande fri- och rättigheter',
      },
    },
    {
      id: 'k5-q10',
      prompt: 'Sofia vill skriva och ge ut en egen bok. Vilken grundlag ger henne rätt att fritt göra det?',
      options: [
        { id: 'A', text: 'Successionsordningen' },
        { id: 'B', text: 'Regeringsformen' },
        { id: 'C', text: 'Tryckfrihetsförordningen' },
        { id: 'D', text: 'Yttrandefrihetsgrundlagen' },
      ],
      correctOptionId: 'C',
      explanationSv:
        'Tryckfrihetsförordningen skyddar det fria ordet i tryckt form. Den ger alla rätt att fritt ge ut böcker, tidningar och tidskrifter.',
      explanationEn:
        'The Freedom of the Press Act protects free speech in print and gives everyone the right to publish books, newspapers and magazines.',
      source: {
        chapter: 5,
        page: 16,
        quote: 'Den ger alla rätt att fritt ge ut böcker, tidningar och tidskrifter.',
      },
    },
    {
      id: 'k5-q11',
      prompt:
        'Några grannar vill starta en förening och ordna en demonstration. Vad gäller enligt kapitlet?',
      options: [
        { id: 'A', text: 'Man måste vara svensk medborgare för att bilda en förening' },
        { id: 'B', text: 'Föreningar är tillåtna, men man får inte demonstrera på gatan' },
        { id: 'C', text: 'Riksdagen måste först godkänna den nya föreningen och mötet' },
        { id: 'D', text: 'Alla som bor här har rätt att bilda föreningar och demonstrera' },
      ],
      correctOptionId: 'D',
      explanationSv:
        'Yttrandefrihetsgrundlagen ger alla som bor i Sverige rätt att vara med i och bilda föreningar och att demonstrera.',
      explanationEn:
        'Everyone who lives in Sweden has the right to join and form associations and to demonstrate.',
      source: {
        chapter: 5,
        page: 16,
        quote:
          'Alla som bor i Sverige har rätt att vara med i och bilda föreningar och att demonstrera.',
      },
    },
    {
      id: 'k5-q12',
      prompt: 'Vilket alternativ beskriver bäst yttrandefriheten i Sverige?',
      options: [
        { id: 'A', text: 'Man får uttrycka åsikter fritt, men vissa yttranden är förbjudna i lag' },
        { id: 'B', text: 'Man får säga vad man vill, eftersom alla yttranden är tillåtna' },
        { id: 'C', text: 'Man får uttrycka åsikter först när staten har godkänt dem' },
        { id: 'D', text: 'Man får uttrycka åsikter fritt i tidningar, men inte i radio och tv' },
      ],
      correctOptionId: 'A',
      explanationSv:
        'Grundlagarna skyddar rätten att uttrycka åsikter. Men vissa yttranden är förbjudna, till exempel förtal och hets mot folkgrupp.',
      explanationEn:
        'The fundamental laws protect the right to express opinions, but some statements are forbidden by law, such as defamation and hate speech.',
      source: {
        chapter: 5,
        page: 16,
        quote: 'skyddar alltså rätten att uttrycka åsikter, men vissa yttranden är förbjudna i lag.',
      },
    },
    {
      id: 'k5-q13',
      prompt: 'Vilket av följande är ett brott som har med yttranden att göra?',
      options: [
        { id: 'A', text: 'Kritik mot regeringen' },
        { id: 'B', text: 'En insändare om skolan' },
        { id: 'C', text: 'Hets mot folkgrupp' },
        { id: 'D', text: 'Ett protestmöte på torget' },
      ],
      correctOptionId: 'C',
      explanationSv:
        'Det är förbjudet att kränka och förtala personer eller grupper. Sådana brott kallas förtal, hets mot folkgrupp eller hatbrott.',
      explanationEn:
        'It is forbidden to insult and defame people or groups. Such crimes are called defamation, incitement against an ethnic or national group, or hate crime.',
      source: {
        chapter: 5,
        page: 16,
        quote:
          'Det är till exempel förbjudet att kränka och förtala personer eller grupper. Sådana brott kallas förtal, hets mot folkgrupp eller hatbrott.',
      },
    },
    {
      id: 'k5-q14',
      prompt: 'Vilken information är det förbjudet att sprida enligt kapitlet?',
      options: [
        { id: 'A', text: 'Kritik mot hur politiker sköter sitt arbete' },
        { id: 'B', text: 'Hemligheter om det svenska försvaret' },
        { id: 'C', text: 'Nyheter om hur det går för svensk ekonomi' },
        { id: 'D', text: 'Åsikter om vilka lagar som borde ändras' },
      ],
      correctOptionId: 'B',
      explanationSv:
        'Det är förbjudet att sprida information som kan skada Sveriges säkerhet, till exempel hemligheter om det svenska försvaret.',
      explanationEn:
        'It is forbidden to spread information that can harm Sweden\'s security, for example secrets about the Swedish defence.',
      source: {
        chapter: 5,
        page: 16,
        quote: 'Det är också förbjudet att sprida information som kan skada Sveriges säkerhet',
      },
    },
    {
      id: 'k5-q15',
      prompt: 'En familj är ute på en utflykt i skogen. Vad får de göra enligt allemansrätten?',
      options: [
        { id: 'A', text: 'Gå rakt över en bondes åker där det växer säd' },
        { id: 'B', text: 'Gå in i en trädgård vid ett hus för att äta' },
        { id: 'C', text: 'Lämna sina sopor i skogen om de gräver ner dem' },
        { id: 'D', text: 'Sätta upp ett tält och plocka bär och svamp' },
      ],
      correctOptionId: 'D',
      explanationSv:
        'Enligt allemansrätten går det bra att gå, cykla, paddla, tälta, göra upp eld och plocka bär, svamp och blommor. Man får inte gå på åkrar, gå in i trädgårdar eller kasta skräp.',
      explanationEn:
        'The right of public access lets you walk, cycle, paddle, camp, make a fire and pick berries, mushrooms and flowers, but not walk on fields, enter gardens or litter.',
      source: {
        chapter: 5,
        page: 17,
        quote:
          'Det går bra att gå, cykla, paddla, sätta upp tält, göra upp eld och plocka bär, svamp och blommor.',
      },
    },
    {
      id: 'k5-q16',
      prompt: 'I vilken grundlag är allemansrätten skyddad?',
      options: [
        { id: 'A', text: 'I tryckfrihetsförordningen' },
        { id: 'B', text: 'I successionsordningen' },
        { id: 'C', text: 'I regeringsformen' },
        { id: 'D', text: 'I yttrandefrihetsgrundlagen' },
      ],
      correctOptionId: 'C',
      explanationSv: 'Den svenska allemansrätten skyddas i regeringsformen, som är en av de fyra grundlagarna.',
      explanationEn: 'The right of public access is protected in the Instrument of Government.',
      source: {
        chapter: 5,
        page: 17,
        quote: 'Den omfattande svenska allemansrätten skyddas i regeringsformen.',
      },
    },
    {
      id: 'k5-q17',
      prompt:
        'Under en promenad ser Sara en ovanlig blomma som är skyddad av lagen. Vad gäller?',
      options: [
        { id: 'A', text: 'Hon får inte plocka den' },
        { id: 'B', text: 'Hon får plocka en enda blomma' },
        { id: 'C', text: 'Hon får plocka den om hon är på allmän mark' },
        { id: 'D', text: 'Hon får plocka den med allemansrätten' },
      ],
      correctOptionId: 'A',
      explanationSv:
        'Vissa växter är ovanliga och skyddas av lagen. Dem får man inte plocka, inte ens med stöd av allemansrätten.',
      explanationEn:
        'Some plants are rare and protected by law. You may not pick them, even under the right of public access.',
      source: {
        chapter: 5,
        page: 17,
        quote: 'Vissa växter är ovanliga och skyddas av lagen. Dem får man inte plocka.',
      },
    },
    {
      id: 'k5-q18',
      prompt: 'Vilken myndighet avgör om en misstänkt person ska ställas inför en domstol?',
      options: [
        { id: 'A', text: 'Polisen' },
        { id: 'B', text: 'Kriminalvården' },
        { id: 'C', text: 'Brottsoffermyndigheten' },
        { id: 'D', text: 'Åklagarmyndigheten' },
      ],
      correctOptionId: 'D',
      explanationSv:
        'Åklagarmyndigheten avgör om personer som misstänks för brott ska ställas inför en domstol. Polisen utreder brotten.',
      explanationEn:
        'The Prosecution Authority decides whether people suspected of crimes should be brought before a court. The police investigate.',
      source: {
        chapter: 5,
        page: 17,
        quote:
          'Åklagarmyndigheten avgör om personer som misstänks för brott ska ställas inför en domstol.',
      },
    },
    {
      id: 'k5-q19',
      prompt: 'Vilken myndighet ansvarar för fängelserna i Sverige?',
      options: [
        { id: 'A', text: 'Åklagarmyndigheten' },
        { id: 'B', text: 'Kriminalvården' },
        { id: 'C', text: 'Polisen' },
        { id: 'D', text: 'Tingsrätten' },
      ],
      correctOptionId: 'B',
      explanationSv:
        'Kriminalvården ansvarar bland annat för fängelser och för att dömda personer avtjänar sina straff.',
      explanationEn:
        'The Prison and Probation Service is responsible for prisons and for making sure convicted people serve their sentences.',
      source: {
        chapter: 5,
        page: 17,
        quote:
          'Kriminalvården ansvarar bland annat för fängelser och för att dömda personer avtjänar sina straff.',
      },
    },
    {
      id: 'k5-q20',
      prompt:
        'Ali har blivit rånad och behöver stöd. Vilken myndighet tar hand om personer som har utsatts för brott?',
      options: [
        { id: 'A', text: 'Kriminalvården' },
        { id: 'B', text: 'Åklagarmyndigheten' },
        { id: 'C', text: 'Brottsoffermyndigheten' },
        { id: 'D', text: 'Kronofogdemyndigheten' },
      ],
      correctOptionId: 'C',
      explanationSv: 'Brottsoffermyndigheten tar hand om personer som har utsatts för brott.',
      explanationEn: 'The Crime Victim Authority takes care of people who have been victims of crime.',
      source: {
        chapter: 5,
        page: 17,
        quote: 'Brottsoffermyndigheten tar hand om personer som utsatts för brott.',
      },
    },
    {
      id: 'k5-q21',
      prompt: 'Vilket alternativ beskriver bäst vad rättsväsendet är?',
      options: [
        { id: 'A', text: 'Myndigheter som ser till att lagar följs och att staten följer lagen' },
        { id: 'B', text: 'Politiska partier som skriver nya lagar och röstar om dem i riksdagen' },
        { id: 'C', text: 'Föreningar som hjälper människor att hitta en bra advokat' },
        { id: 'D', text: 'Kommuner som bestämmer vilka straff som ska gälla för olika brott' },
      ],
      correctOptionId: 'A',
      explanationSv:
        'Rättsväsendet består av olika myndigheter, till exempel polisen, åklagare och domstolar. De ser till att lagar följs och att staten utövar sin makt enligt lagen.',
      explanationEn:
        'The justice system is made up of authorities such as the police, prosecutors and courts that make sure laws are followed and that the state uses its power lawfully.',
      source: {
        chapter: 5,
        page: 17,
        quote:
          'Det svenska rättsväsendet består av olika myndigheter som arbetar för att se till att lagar följs och att staten utövar sin makt enligt lagen',
      },
    },
    {
      id: 'k5-q22',
      prompt: 'Vad betyder det att domstolarna i Sverige är oberoende?',
      options: [
        { id: 'A', text: 'Domstolarna behöver inte följa de lagar som finns' },
        { id: 'B', text: 'Domstolarna betalas av privata företag och inte av staten' },
        { id: 'C', text: 'Regering eller riksdag kan inte bestämma hur de ska döma' },
        { id: 'D', text: 'Domstolarna bestämmer själva vilka nya lagar som ska gälla' },
      ],
      correctOptionId: 'C',
      explanationSv:
        'Domstolarna är oberoende. Det betyder att varken regeringen eller riksdagen kan bestämma hur de ska döma i ett fall.',
      explanationEn:
        'The courts are independent: neither the government nor the Riksdag can decide how they rule.',
      source: {
        chapter: 5,
        page: 17,
        quote: 'Domstolarna är oberoende. Regering eller riksdag kan inte bestämma hur de ska döma.',
      },
    },
    {
      id: 'k5-q23',
      prompt: 'Maria har dömts i tingsrätten, men hon tycker att domen är fel. Vad kan hon göra?',
      options: [
        { id: 'A', text: 'Be riksdagen att ändra domen' },
        { id: 'B', text: 'Överklaga till en högre domstol' },
        { id: 'C', text: 'Be polisen att ta bort domen' },
        { id: 'D', text: 'Be regeringen att döma på nytt' },
      ],
      correctOptionId: 'B',
      explanationSv:
        'Man kan överklaga en dom. Det betyder att man ber en högre domstol att titta på fallet igen. Riksdag och regering kan inte ändra en dom.',
      explanationEn:
        'You can appeal a judgment, which means asking a higher court to look at the case again. The Riksdag and government cannot change a judgment.',
      source: {
        chapter: 5,
        page: 18,
        quote:
          'Det går att överklaga en dom vilket betyder att man ber en högre domstol att titta på fallet igen.',
      },
    },
    {
      id: 'k5-q24',
      prompt: 'Vad gör polisen under en förundersökning?',
      options: [
        { id: 'A', text: 'Bestämmer vilket straff den misstänkte ska få' },
        { id: 'B', text: 'Beslutar att den misstänkte ska vara häktad' },
        { id: 'C', text: 'Väljer ut de nämndemän som ska döma i målet' },
        { id: 'D', text: 'Samlar bevis och pratar med vittnen om brottet' },
      ],
      correctOptionId: 'D',
      explanationSv: 'Under förundersökningen samlar polisen bevis och pratar med vittnen. Sedan bestämmer åklagaren om det blir rättegång, och det är domstolen som dömer.',
      explanationEn: 'During the preliminary investigation the police collect evidence and talk to witnesses. The prosecutor then decides whether there will be a trial, and the court gives the verdict.',
      source: { chapter: 5, page: 18, quote: 'Polisen samlar bevis och pratar med vittnen.' },
    },
    {
      id: 'k5-q25',
      prompt: 'Vad måste ske innan någon kan dömas för ett brott?',
      options: [
        { id: 'A', text: 'Bevis och fakta ska granskas noggrant i en process' },
        { id: 'B', text: 'Polisen ska skriva under att personen är skyldig' },
        { id: 'C', text: 'Riksdagen ska rösta om personen är skyldig' },
        { id: 'D', text: 'Den misstänkte ska först erkänna brottet' },
      ],
      correctOptionId: 'A',
      explanationSv:
        'Ingen ska dömas utan en process där bevis och fakta granskas noggrant. Det är en del av rättssäkerheten.',
      explanationEn:
        'No one may be convicted without a process in which evidence and facts are examined carefully.',
      source: {
        chapter: 5,
        page: 17,
        quote: 'Ingen ska dömas utan en process, där bevis och fakta granskas noggrant.',
      },
    },
    {
      id: 'k5-q26',
      prompt:
        'Två föräldrar som har separerat är oeniga om vem barnen ska bo hos. De vänder sig till domstolen. Vad kallas den sortens mål?',
      options: [
        { id: 'A', text: 'Brottmål' },
        { id: 'B', text: 'Förvaltningsmål' },
        { id: 'C', text: 'Tvistemål' },
        { id: 'D', text: 'Skattemål' },
      ],
      correctOptionId: 'C',
      explanationSv:
        'Domstolarna hjälper också till när personer är oeniga, till exempel vid vårdnadstvister mellan föräldrar. Det kallas tvistemål.',
      explanationEn:
        'Courts also help when people disagree, for example in custody disputes between parents. These are called civil cases (tvistemål).',
      source: {
        chapter: 5,
        page: 18,
        quote:
          'Domstolarna hjälper också till när personer är oeniga till exempel vid vårdnadstvister mellan föräldrar (tvistemål).',
      },
    },
    {
      id: 'k5-q27',
      prompt: 'Vilka fall prövar Högsta domstolen (HD)?',
      options: [
        { id: 'A', text: 'Brottmål som ännu inte har prövats i tingsrätten' },
        { id: 'B', text: 'Vissa viktiga fall som redan prövats i tingsrätt och hovrätt' },
        { id: 'C', text: 'Fall där den dömda personen har fått böter som straff' },
        { id: 'D', text: 'De brott som polisen inte har kunnat utreda själv' },
      ],
      correctOptionId: 'B',
      explanationSv:
        'Högsta domstolen är den högsta nivån. Den prövar bara vissa viktiga fall som redan har gått igenom tingsrätten och hovrätten.',
      explanationEn:
        'The Supreme Court only hears certain important cases that have already been through the district court and the court of appeal.',
      source: {
        chapter: 5,
        page: 18,
        quote: 'prövar bara vissa viktiga fall som redan gått igenom tingsrätt och hovrätt.',
      },
    },
    {
      id: 'k5-q28',
      prompt: 'Vilken av följande uppgifter har polisen enligt kapitlet?',
      options: [
        { id: 'A', text: 'Att bestämma vilket straff en dömd person ska få' },
        { id: 'B', text: 'Att ansvara för fängelser och för dömda personer' },
        { id: 'C', text: 'Att utse nämndemän som dömer i tingsrätten' },
        { id: 'D', text: 'Att göra pass och nationella id-kort till medborgare' },
      ],
      correctOptionId: 'D',
      explanationSv:
        'Polisen gör pass och nationella id-kort till svenska medborgare. Polisen beslutar också om olika tillstånd, till exempel för en demonstration.',
      explanationEn:
        'The police issue passports and national ID cards to Swedish citizens and decide on some permits, for example for a demonstration.',
      source: {
        chapter: 5,
        page: 18,
        quote: 'Polisen gör pass och nationella id-kort till svenska medborgare',
      },
    },
    {
      id: 'k5-q29',
      prompt: 'Vilket alternativ beskriver bäst polisens uppgift?',
      options: [
        { id: 'A', text: 'Att stifta lagar och bestämma hur domstolarna ska döma' },
        { id: 'B', text: 'Att upprätthålla lag och ordning och att förebygga och utreda brott' },
        { id: 'C', text: 'Att döma misstänkta personer till böter eller till fängelse' },
        { id: 'D', text: 'Att försvara den åtalade och ifrågasätta åklagarens bevis' },
      ],
      correctOptionId: 'B',
      explanationSv:
        'Polisens uppgift är att upprätthålla lag och ordning och att förebygga och utreda brott. Det är domstolarna som dömer.',
      explanationEn:
        'The police maintain law and order and prevent and investigate crime. Courts, not the police, decide sentences.',
      source: {
        chapter: 5,
        page: 18,
        quote:
          'Polisens uppgift är att upprätthålla lag och ordning och att förebygga och utreda brott.',
      },
    },
    {
      id: 'k5-q30',
      prompt: 'Någon har stulit Johans cykel. Vad är det första steget i en brottsutredning?',
      options: [
        { id: 'A', text: 'Att Johan anmäler brottet till polisen' },
        { id: 'B', text: 'Att en domstol häktar en misstänkt person' },
        { id: 'C', text: 'Att åklagaren bestämmer om det blir rättegång' },
        { id: 'D', text: 'Att nämndemännen förhör alla vittnen' },
      ],
      correctOptionId: 'A',
      explanationSv:
        'Det första steget är en polisanmälan. Den som utsätts för ett brott anmäler det till polisen.',
      explanationEn:
        'The first step is a police report: the victim reports the crime to the police.',
      source: {
        chapter: 5,
        page: 18,
        quote: 'Den som utsätts för ett brott anmäler det till polisen.',
      },
    },
    {
      id: 'k5-q31',
      prompt:
        'Polisen har gripit en person som är starkt misstänkt för ett brott. Vem kan sedan anhålla personen?',
      options: [
        { id: 'A', text: 'En nämndeman' },
        { id: 'B', text: 'Kriminalvården' },
        { id: 'C', text: 'En åklagare' },
        { id: 'D', text: 'Brottsoffermyndigheten' },
      ],
      correctOptionId: 'C',
      explanationSv:
        'Om polisen har starka misstankar kan personen gripas. En åklagare kan sedan anhålla personen.',
      explanationEn:
        'If the police have strong suspicions they can arrest a person. A prosecutor can then order the person to be held (anhållan).',
      source: {
        chapter: 5,
        page: 18,
        quote: 'Om polisen har starka misstankar mot någon kan den personen gripas. En åklagare kan sedan anhålla personen.',
      },
    },
    {
      id: 'k5-q32',
      prompt: 'Hur länge kan en anhållen person som längst hållas inlåst?',
      options: [
        { id: 'A', text: 'I upp till 24 timmar' },
        { id: 'B', text: 'I upp till 48 timmar' },
        { id: 'C', text: 'I upp till en vecka' },
        { id: 'D', text: 'I upp till 72 timmar' },
      ],
      correctOptionId: 'D',
      explanationSv:
        'När en åklagare har anhållit en misstänkt person kan personen hållas inlåst i upp till 72 timmar.',
      explanationEn: 'A person who has been detained by a prosecutor can be held for up to 72 hours.',
      source: {
        chapter: 5,
        page: 18,
        quote: 'Den misstänkte kan då hållas inlåst i upp till 72 timmar.',
      },
    },
    {
      id: 'k5-q33',
      prompt: 'Vad betyder det att en misstänkt person blir häktad?',
      options: [
        { id: 'A', text: 'Polisen håller ett första förhör med personen om brottet' },
        { id: 'B', text: 'En domstol beslutar att hen ska vara inlåst en längre tid' },
        { id: 'C', text: 'Personen döms till ett fängelsestraff av tingsrätten' },
        { id: 'D', text: 'Åklagaren beslutar att personen ska släppas fri direkt' },
      ],
      correctOptionId: 'B',
      explanationSv:
        'Häktning betyder att en domstol beslutar att en misstänkt person ska hållas inlåst under en längre tid. Det kan ske om bevisen blir fler och misstankarna starkare.',
      explanationEn:
        'Detention on remand means a court decides that a suspect should be held for a longer time, when evidence and suspicions grow stronger.',
      source: {
        chapter: 5,
        page: 18,
        quote:
          'Det betyder att en domstol beslutar att en misstänkt person ska hållas inlåst under en längre tid.',
      },
    },
    {
      id: 'k5-q34',
      prompt: 'Vad gör försvarsadvokaten under en rättegång?',
      options: [
        { id: 'A', text: 'Försöker bevisa att den åtalade är skyldig' },
        { id: 'B', text: 'Bestämmer vilken påföljd den åtalade ska få' },
        { id: 'C', text: 'Ifrågasätter åklagarens bevis och lägger fram egna' },
        { id: 'D', text: 'Beslutar om den åtalade ska häktas eller inte' },
      ],
      correctOptionId: 'C',
      explanationSv:
        'Den åtalade har rätt till en försvarsadvokat. Advokaten kan ifrågasätta åklagarens bevis och lägga fram egna bevis. Det är åklagaren som försöker bevisa skulden.',
      explanationEn:
        'The defendant has the right to a defence lawyer, who can question the prosecutor\'s evidence and present their own. The prosecutor tries to prove guilt.',
      source: {
        chapter: 5,
        page: 19,
        quote:
          'Den åtalade har rätt till en försvarsadvokat som kan ifrågasätta åklagarens bevis och lägga fram egna bevis.',
      },
    },
    {
      id: 'k5-q35',
      prompt: 'Vilket alternativ beskriver bäst nämndemännens roll i tingsrätten?',
      options: [
        { id: 'A', text: 'De dömer tillsammans med domaren och representerar allmänheten' },
        { id: 'B', text: 'De försvarar den åtalade och lägger fram bevis för den åtalade' },
        { id: 'C', text: 'De samlar bevis och förhör vittnen innan rättegången börjar' },
        { id: 'D', text: 'De arbetar på Kriminalvården och ser till att straffen avtjänas' },
      ],
      correctOptionId: 'A',
      explanationSv:
        'I tingsrätten dömer nämndemän tillsammans med domaren. De ska representera allmänheten och ge insyn i rättsprocessen. De utses av de politiska partierna.',
      explanationEn:
        'In the district court, lay judges judge together with the judge. They represent the public and give insight into the legal process. They are appointed by the political parties.',
      source: {
        chapter: 5,
        page: 19,
        quote:
          'I tingsrätten dömer också så kallade nämndemän tillsammans med domaren. De ska representera allmänheten och ge insyn i rättsprocessen.',
      },
    },
    {
      id: 'k5-q36',
      prompt: 'En tolvåring har gjort något brottsligt. Vem bestämmer vad som ska hända med barnet?',
      options: [
        { id: 'A', text: 'Tingsrätten' },
        { id: 'B', text: 'Kriminalvården' },
        { id: 'C', text: 'Åklagaren' },
        { id: 'D', text: 'Socialtjänsten' },
      ],
      correctOptionId: 'D',
      explanationSv:
        'Barn under 15 år är inte straffmyndiga. När ett yngre barn gör något brottsligt är det socialtjänsten som bestämmer vad som ska hända med barnet.',
      explanationEn:
        'Children under the age of criminal responsibility cannot be prosecuted. When a younger child commits a crime, social services decide what happens.',
      source: {
        chapter: 5,
        page: 19,
        quote:
          'När ett yngre barn gör något brottsligt, är det socialtjänsten som bestämmer vad som ska hända med barnet.',
      },
    },
    {
      id: 'k5-q37',
      prompt: 'Vad kan det leda till om man finns med i belastningsregistret?',
      options: [
        { id: 'A', text: 'Man förlorar sin rösträtt i alla allmänna val i Sverige' },
        { id: 'B', text: 'Man måste betala en högre skatt under resten av livet' },
        { id: 'C', text: 'Det kan bli svårare att få jobb, körkort och medborgarskap' },
        { id: 'D', text: 'Man får inte längre bo kvar i den kommun där man bor' },
      ],
      correctOptionId: 'C',
      explanationSv:
        'Den som döms för vissa allvarliga brott registreras i belastningsregistret. Det kan göra det svårare att få jobb, körkort eller medborgarskap.',
      explanationEn:
        'People convicted of certain serious crimes are entered in the criminal record register, which can make it harder to get a job, a driving licence or citizenship.',
      source: {
        chapter: 5,
        page: 19,
        quote: 'Det kan göra det svårare att få jobb, körkort eller medborgarskap.',
      },
    },
  ],
  review: { reviewedAt: '2026-10-24', pdfVersion: '2026-08-10' },
}
