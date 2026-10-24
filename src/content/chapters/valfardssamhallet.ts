import type { ChapterContent } from '../types'

export const valfardssamhallet: ChapterContent = {
  slug: 'valfardssamhallet',
  number: 9,
  title: 'Välfärdssamhället',
  mp3Url:
    'https://www.uhr.se/globalassets/_uhr.se/medborgarskapsprovet/utbildningsmaterial/10_valfardssamhallet.mp3',
  intro:
    'Välfärdssamhället ska ge alla invånare en grundläggande ekonomisk och social trygghet. Välfärden finansieras främst med skatter, som inkomstskatt, moms och arbetsgivaravgifter. Staten, regionerna och kommunerna har ansvar för olika delar av välfärden.',
  bullets: [
    'Skatter gör att skola, sjukvård och vägar kan finansieras gemensamt.',
    'Staten finansierar bland annat pensioner, sjukförsäkring, föräldraförsäkring, studiestöd och barnbidrag.',
    'Sveriges 21 regioner ansvarar för hälso- och sjukvården och driver sjukhus och vårdcentraler.',
    'Kommunerna ansvarar för bland annat förskola, skola, äldreomsorg och socialtjänst.',
  ],
  summaryEasy: [
    'Välfärd betyder att alla ska kunna leva ett tryggt liv. Alla ska kunna få vård och utbildning. Man ska kunna få pengar om man blir sjuk eller arbetslös.',
    'Välfärden betalas mest med skatter. Inkomstskatt är skatt på lönen. Moms är skatt när du köper varor och tjänster. Arbetsgivaravgifter är pengar som arbetsgivaren betalar till staten, utöver lönen. Även företag betalar skatt. När fler arbetar får samhället mer pengar till välfärden.',
    'Staten betalar till exempel pension, barnbidrag och studiestöd. Staten betalar också för universitet och forskning.',
    'Sverige har 21 regioner. Regionerna ansvarar för sjukvården. De driver sjukhus och vårdcentraler. Primärvård är till exempel vårdcentraler och mödravårdscentraler. På sjukhus görs operationer. Det finns också privata vårdgivare som får skattepengar.',
    'Kommunerna bestämmer själva sin skatt. Kommunen ansvarar för förskola, fritidshem och skola. Grundskolan är för barn mellan 6 och 16 år. Det finns också gymnasieskola och vuxenutbildning för vuxna.',
    'Kommunen hjälper äldre som inte klarar vardagen själva. Socialtjänsten finns i varje kommun. Den ger stöd och skydd till personer som behöver det. Det kan vara personer utan bostad eller personer som är utsatta för våld.',
  ],
  glossary: [
    {
      term: 'välfärdssamhället',
      sv: 'Ett samhälle där alla ska ha ekonomisk och social trygghet.',
      en: 'the welfare society: a society that gives everyone basic economic and social security',
    },
    {
      term: 'inkomstskatt',
      sv: 'Skatt som man betalar på sin lön.',
      en: 'income tax: tax paid on your wages',
    },
    {
      term: 'moms (mervärdesskatt)',
      sv: 'Skatt som man betalar när man köper varor och tjänster.',
      en: 'VAT (value added tax): tax on goods and services',
    },
    {
      term: 'arbetsgivaravgifter',
      sv: 'Pengar som arbetsgivaren betalar till staten för de anställda, utöver lönen.',
      en: 'employer contributions: fees employers pay to the state on top of wages',
    },
    {
      term: 'skattemedel',
      sv: 'Pengar som samhället får in genom skatter.',
      en: 'tax money: public funds that come from taxes',
    },
    {
      term: 'regioner',
      sv: 'De 21 delarna av Sverige som bland annat ansvarar för sjukvården.',
      en: 'regions: the 21 regional authorities, mainly responsible for health care',
    },
    {
      term: 'kommuner',
      sv: 'Den lokala nivån som ansvarar för till exempel skola och äldreomsorg.',
      en: 'municipalities: local government, responsible for schools and elderly care',
    },
    {
      term: 'primärvård',
      sv: 'Vård på vårdcentraler och barnavårds- och mödravårdscentraler.',
      en: 'primary care: health centres and child and maternity clinics',
    },
    {
      term: 'sjukhusvård',
      sv: 'Vård på sjukhus, till exempel operationer och avancerad behandling.',
      en: 'hospital care: care in hospitals, such as operations',
    },
    {
      term: 'barnomsorg',
      sv: 'Förskolor och fritidshem för barn.',
      en: 'childcare: preschools and after-school centres',
    },
    {
      term: 'kommunal vuxenutbildning',
      sv: 'Utbildning för vuxna som kommunen ordnar.',
      en: 'municipal adult education',
    },
    {
      term: 'äldreomsorg',
      sv: 'Hjälp och vård från kommunen till äldre personer.',
      en: 'elderly care: help and care for older people',
    },
    {
      term: 'socialtjänsten',
      sv: 'En del av kommunen som ger stöd och skydd till personer som behöver det.',
      en: 'social services: the municipal service that gives support and protection',
    },
  ],
  review: { reviewedAt: '2026-10-24', pdfVersion: '2026-08-10' },
  questions: [
    {
      id: 'k9-q1',
      prompt: 'Du köper en ny jacka i en butik. Vilken skatt ingår i det du betalar?',
      options: [
        { id: 'A', text: 'Inkomstskatt' },
        { id: 'B', text: 'Arbetsgivaravgift' },
        { id: 'C', text: 'Moms' },
        { id: 'D', text: 'Medlemsavgift' },
      ],
      correctOptionId: 'C',
      explanationSv:
        'Moms är en skatt på varor och tjänster. Den betalar man när man köper något, till exempel en jacka.',
      explanationEn:
        'VAT (moms) is a tax on goods and services. You pay it when you buy something, for example a jacket.',
      source: {
        chapter: 9,
        page: 30,
        quote: 'Det finns även en skatt (moms) på varor och tjänster.',
      },
    },
    {
      id: 'k9-q2',
      prompt:
        'Regionerna ska erbjuda hälso- och sjukvård till alla. Vad driver och finansierar regionerna för att kunna göra det?',
      options: [
        { id: 'A', text: 'Sjukhus och vårdcentraler' },
        { id: 'B', text: 'Förskolor och fritidshem' },
        { id: 'C', text: 'Universitet och högskolor' },
        { id: 'D', text: 'Socialtjänst och äldreboenden' },
      ],
      correctOptionId: 'A',
      explanationSv:
        'Regionerna ska erbjuda hälso- och sjukvård till alla. För att kunna göra det driver och finansierar de sjukhus och vårdcentraler. Förskolor och socialtjänst sköts av kommunerna, och universitet finansieras av staten.',
      explanationEn:
        'The regions must offer health care to everyone. To do that, they run and fund hospitals and health centres. Preschools and social services are run by the municipalities, and universities are funded by the state.',
      source: {
        chapter: 9,
        page: 30,
        quote:
          'De ska bland annat erbjuda hälso- och sjukvård till alla. För att kunna göra det driver och finansierar de sjukhus och vårdcentraler.',
      },
    },
    {
      id: 'k9-q3',
      prompt: 'Vem ser till att det finns tillgång till skolor och utbildning?',
      options: [
        { id: 'A', text: 'Staten' },
        { id: 'B', text: 'Regionen' },
        { id: 'C', text: 'Kommunen' },
        { id: 'D', text: 'Arbetsgivarna' },
      ],
      correctOptionId: 'C',
      explanationSv:
        'Det är kommunen som ser till att det finns skolor och utbildning. Kommunerna har ett stort ansvar för välfärden.',
      explanationEn:
        'The municipality makes sure there are schools and education. Municipalities have a large responsibility for welfare.',
      source: {
        chapter: 9,
        page: 31,
        quote:
          'Det är kommunen som ser till så att det finns tillgång till skolor och utbildning.',
      },
    },
    {
      id: 'k9-q4',
      prompt: 'Vad finansierar staten bland annat enligt kapitlet?',
      options: [
        { id: 'A', text: 'Förskolor, fritidshem och kommunala grundskolor' },
        { id: 'B', text: 'Vårdcentraler, sjukhus och tandvård' },
        { id: 'C', text: 'Äldreomsorg, hemtjänst och socialtjänst' },
        { id: 'D', text: 'Pensioner, studiestöd och föräldraförsäkring' },
      ],
      correctOptionId: 'D',
      explanationSv:
        'Staten finansierar bland annat pensioner, sjukförsäkring, föräldraförsäkring, arbetslöshetsförsäkring, studiestöd och barnbidrag. Skolor och äldreomsorg sköts av kommunerna, och sjukvård av regionerna.',
      explanationEn:
        'The state funds pensions, sickness insurance, parental insurance, unemployment insurance, student aid and child benefit. Schools and elderly care are run by municipalities, and health care by regions.',
      source: {
        chapter: 9,
        page: 30,
        quote:
          'Staten finansierar bland annat pensioner, sjukförsäkring, föräldraförsäkring, arbetslöshetsförsäkring, studiestöd och barnbidrag.',
      },
    },
    {
      id: 'k9-q5',
      prompt: 'Vart går inkomstskatten som anställda betalar på sin lön?',
      options: [
        { id: 'A', text: 'Till A-kassan och Försäkringskassan' },
        { id: 'B', text: 'Till staten, regionen och kommunen' },
        { id: 'C', text: 'Till banken där man har sitt lönekonto' },
        { id: 'D', text: 'Till arbetsgivaren och facket' },
      ],
      correctOptionId: 'B',
      explanationSv:
        'En del av lönen går som inkomstskatt till staten, regionen och kommunen.',
      explanationEn:
        'Part of your wages goes as income tax to the state, the region and the municipality.',
      source: {
        chapter: 9,
        page: 30,
        quote:
          'En del av lönen man får som anställd går till staten, regionen och kommunen som skatt.',
      },
    },
    {
      id: 'k9-q6',
      prompt: 'Vilket alternativ beskriver bäst vad välfärdssamhället ska ge alla invånare?',
      options: [
        { id: 'A', text: 'En grundläggande ekonomisk och social trygghet' },
        { id: 'B', text: 'Samma lön för alla oavsett yrke och utbildning' },
        { id: 'C', text: 'En egen bostad där staten betalar hela hyran' },
        { id: 'D', text: 'Ett fast arbete inom den offentliga sektorn' },
      ],
      correctOptionId: 'A',
      explanationSv:
        'Välfärdssamhället ska ge alla invånare en grundläggande ekonomisk och social trygghet. Det handlar till exempel om sjukvård, utbildning och stöd vid sjukdom eller arbetslöshet.',
      explanationEn:
        'The welfare society should give all residents basic economic and social security, for example health care, education and support when ill or unemployed.',
      source: {
        chapter: 9,
        page: 30,
        quote:
          'Kapitlet handlar om välfärdssamhället som ska ge alla invånare en grundläggande ekonomisk och social trygghet.',
      },
    },
    {
      id: 'k9-q7',
      prompt: 'Vilket alternativ beskriver bäst vem som betalar skatt enligt materialet?',
      options: [
        { id: 'A', text: 'Personer som arbetar, men inte företag' },
        { id: 'B', text: 'Företag, men inte personer som arbetar' },
        { id: 'C', text: 'Personer som äger en bostad eller bil' },
        { id: 'D', text: 'Både personer som arbetar och företag' },
      ],
      correctOptionId: 'D',
      explanationSv:
        'Skatt betalas inte bara av personer som arbetar. Även företag betalar skatt.',
      explanationEn: 'Tax is not only paid by people who work. Companies pay tax too.',
      source: {
        chapter: 9,
        page: 30,
        quote:
          'Skatt betalas inte bara av personer som arbetar, utan till exempel också av företag.',
      },
    },
    {
      id: 'k9-q8',
      prompt: 'Vilket alternativ beskriver bäst vad som ger mer pengar till välfärden?',
      options: [
        { id: 'A', text: 'Att färre jobbar och att fler får bidrag' },
        { id: 'B', text: 'Att fler jobbar och att mer köps och säljs' },
        { id: 'C', text: 'Att färre varor och tjänster köps och säljs' },
        { id: 'D', text: 'Att fler sparar i stället för att handla' },
      ],
      correctOptionId: 'B',
      explanationSv:
        'Ju fler som jobbar och ju mer varor och tjänster som köps och säljs, desto mer skatt kommer in. Då får stat, regioner och kommuner mer pengar till välfärden.',
      explanationEn:
        'The more people work and the more goods and services are bought and sold, the more tax comes in. Then the state, regions and municipalities get more money for welfare.',
      source: {
        chapter: 9,
        page: 30,
        quote:
          'Ju fler som jobbar och ju mer varor och tjänster som köps och säljs, desto mer pengar får staten, regionerna och kommunerna in till välfärden.',
      },
    },
    {
      id: 'k9-q9',
      prompt: 'Vilket alternativ beskriver bäst vad skatterna gör möjligt?',
      options: [
        { id: 'A', text: 'Att varje person själv betalar för sin skola och vård' },
        { id: 'B', text: 'Att staten kan ge alla invånare samma lön' },
        { id: 'C', text: 'Att skola, sjukvård och vägar betalas gemensamt' },
        { id: 'D', text: 'Att privata företag slipper betala för sina anställda' },
      ],
      correctOptionId: 'C',
      explanationSv:
        'Skatterna gör att många viktiga tjänster kan finansieras gemensamt. Exempel är skola, sjukvård och vägar.',
      explanationEn:
        'Taxes make it possible to fund many important services together, for example schools, health care and roads.',
      source: {
        chapter: 9,
        page: 30,
        quote:
          'Skatterna gör att många viktiga tjänster kan finansieras gemensamt, till exempel skola, sjukvård och vägar.',
      },
    },
    {
      id: 'k9-q10',
      prompt:
        'Ett företag betalar lön till sina anställda. Utöver lönen betalar företaget pengar till staten för de anställda. Vad kallas de pengarna?',
      options: [
        { id: 'A', text: 'Arbetsgivaravgifter' },
        { id: 'B', text: 'Moms' },
        { id: 'C', text: 'Statlig inkomstskatt' },
        { id: 'D', text: 'Medlemsavgifter' },
      ],
      correctOptionId: 'A',
      explanationSv:
        'Arbetsgivaravgifter betalar arbetsgivaren till staten för sina anställda, utöver lönen. Pengarna går bland annat till sjukförsäkring och pensioner.',
      explanationEn:
        'Employer contributions are paid by the employer to the state for each employee, on top of wages. The money goes to sickness insurance and pensions among other things.',
      source: {
        chapter: 9,
        page: 30,
        quote:
          'Arbetsgivare betalar avgifter till staten för sina anställda, utöver deras löner.',
      },
    },
    {
      id: 'k9-q12',
      prompt: 'Vem finansierar högre utbildning och forskning vid högskolor och universitet?',
      options: [
        { id: 'A', text: 'Regionerna' },
        { id: 'B', text: 'Staten' },
        { id: 'C', text: 'Kommunerna' },
        { id: 'D', text: 'Privata företag' },
      ],
      correctOptionId: 'B',
      explanationSv:
        'Staten finansierar högre utbildning och forskning inom högskolor och universitet.',
      explanationEn: 'The state funds higher education and research at universities and university colleges.',
      source: {
        chapter: 9,
        page: 30,
        quote:
          'Staten finansierar också högre utbildning och forskning inom högskolor och universitet.',
      },
    },
    {
      id: 'k9-q13',
      prompt:
        'Förskolan där Lina lämnar sin son drivs av ett privat företag. Hur finansieras en sådan välfärdstjänst enligt materialet?',
      options: [
        { id: 'A', text: 'Med avgifter som föräldrarna betalar' },
        { id: 'B', text: 'Med pengar från fackförbunden' },
        { id: 'C', text: 'Fortfarande med skattemedel' },
        { id: 'D', text: 'Med lån som företaget tar från banken' },
      ],
      correctOptionId: 'C',
      explanationSv:
        'En del välfärdstjänster drivs av privata företag. De finansieras ändå med skattemedel, alltså med pengar från skatter.',
      explanationEn:
        'Some welfare services are run by private companies. They are still funded with tax money.',
      source: {
        chapter: 9,
        page: 30,
        quote:
          'En del välfärdstjänster drivs av privata företag men de finansieras fortfarande med skattemedel.',
      },
    },
    {
      id: 'k9-q14',
      prompt: 'Vilket alternativ beskriver bäst hur sjukvården bedrivs i Sverige?',
      options: [
        { id: 'A', text: 'Mest av privata vårdgivare som patienterna betalar' },
        { id: 'B', text: 'Av staten, och privata vårdgivare är förbjudna' },
        { id: 'C', text: 'Av kommunerna, som driver sjukhusen i landet' },
        { id: 'D', text: 'Mest offentligt, men också av privata vårdgivare' },
      ],
      correctOptionId: 'D',
      explanationSv:
        'Sjukvården bedrivs i huvudsak i offentlig regi. Det finns också privata vårdgivare, och de finansieras med skattemedel.',
      explanationEn:
        'Health care is mainly run by the public sector. There are also private care providers, and they are funded with tax money.',
      source: {
        chapter: 9,
        page: 30,
        quote:
          'Sjukvården bedrivs i huvudsak i offentlig regi men det finns även privata vårdgivare som finansieras med skattemedel.',
      },
    },
    {
      id: 'k9-q18',
      prompt: 'Vem bestämmer hur mycket invånarna ska betala i skatt till kommunen?',
      options: [
        { id: 'A', text: 'Riksdagen' },
        { id: 'B', text: 'Regionen' },
        { id: 'C', text: 'Arbetsgivarna' },
        { id: 'D', text: 'Kommunen själv' },
      ],
      correctOptionId: 'D',
      explanationSv:
        'Kommunerna bestämmer själva hur mycket invånarna ska betala i skatt till kommunen. De bestämmer också vad pengarna ska användas till.',
      explanationEn:
        'The municipalities decide themselves how much tax residents pay to the municipality, and what the money is used for.',
      source: {
        chapter: 9,
        page: 31,
        quote:
          'Kommunerna bestämmer själva hur mycket invånarna ska betala i skatt till kommunen och vad pengarna ska användas till.',
      },
    },
    {
      id: 'k9-q19',
      prompt: 'Omars dotter är tio år. Vilken skola finns för barn i hennes ålder i alla kommuner?',
      options: [
        { id: 'A', text: 'Grundskolan' },
        { id: 'B', text: 'Gymnasieskolan' },
        { id: 'C', text: 'Förskolan' },
        { id: 'D', text: 'Vuxenutbildningen' },
      ],
      correctOptionId: 'A',
      explanationSv:
        'I alla kommuner finns grundskolor för barn mellan 6 och 16 år, så en tioåring går i grundskolan. Gymnasieskolan kommer efter grundskolan, och förskolan är för yngre barn.',
      explanationEn:
        'Every municipality has compulsory schools (grundskolor) for children aged 6 to 16, so a ten-year-old goes there. Upper secondary school comes after it, and preschool is for younger children.',
      source: {
        chapter: 9,
        page: 31,
        quote: 'I alla kommuner finns grundskolor för barn mellan 6 och 16 år.',
      },
    },
    {
      id: 'k9-q20',
      prompt: 'Vad ingår i barnomsorgen som kommunen ansvarar för?',
      options: [
        { id: 'A', text: 'Barnavårdscentraler och mödravårdscentraler' },
        { id: 'B', text: 'Förskolor och fritidshem' },
        { id: 'C', text: 'Barnbidrag och föräldraförsäkring' },
        { id: 'D', text: 'Barnsjukhus och universitetssjukhus' },
      ],
      correctOptionId: 'B',
      explanationSv:
        'Barnomsorg är förskolor och fritidshem, och den styrs av kommunen. Barnavårdscentraler hör till regionernas primärvård, och barnbidrag betalas av staten.',
      explanationEn:
        'Childcare means preschools and after-school centres, run by the municipality. Child health centres belong to the regions\' primary care, and child benefit is paid by the state.',
      source: { chapter: 9, page: 31, quote: 'Barnomsorg: Förskolor och fritidshem.' },
    },
    {
      id: 'k9-q21',
      prompt:
        'Ahmed är 35 år och har gått ut grundskolan. Han vill läsa fler kurser. Vilken utbildning ordnar kommunen för honom enligt materialet?',
      options: [
        { id: 'A', text: 'Högskola som kommunen driver' },
        { id: 'B', text: 'Kommunens fritidshem' },
        { id: 'C', text: 'Kommunal vuxenutbildning' },
        { id: 'D', text: 'Regionens rehabilitering' },
      ],
      correctOptionId: 'C',
      explanationSv:
        'Förutom grundskolor finns gymnasieskolor och kommunal vuxenutbildning i kommunerna. Vuxenutbildningen är till för vuxna som Ahmed. Högskolor och universitet finansieras av staten, inte av kommunen.',
      explanationEn:
        'Besides compulsory schools, municipalities have upper secondary schools and municipal adult education, which is for adults like Ahmed. Universities are funded by the state, not by the municipality.',
      source: {
        chapter: 9,
        page: 31,
        quote: 'Dessutom finns det gymnasieskolor och kommunal vuxenutbildning.',
      },
    },
    {
      id: 'k9-q22',
      prompt:
        'Eriks pappa är gammal och klarar inte längre att städa och laga mat själv. Vad gäller enligt materialet?',
      options: [
        { id: 'A', text: 'Regionen ska flytta honom till ett sjukhus' },
        { id: 'B', text: 'Familjen måste själv anlita en privat firma' },
        { id: 'C', text: 'Staten ger honom en högre pension i stället' },
        { id: 'D', text: 'Kommunen ska erbjuda honom stöd och hjälp' },
      ],
      correctOptionId: 'D',
      explanationSv:
        'Enligt svensk lag ska kommunerna erbjuda äldre stöd och hjälp. Kommunen kan ge vård och service så att den äldre kan bo kvar hemma.',
      explanationEn:
        'By Swedish law, municipalities must offer older people support and help. The municipality can give care and services so that the person can stay at home.',
      source: {
        chapter: 9,
        page: 31,
        quote:
          'Enligt svensk lag ska kommuner erbjuda äldre stöd och hjälp. Kommunen kan hjälpa till med vård och service så att de äldre kan bo kvar i sina hem.',
      },
    },
    {
      id: 'k9-q23',
      prompt: 'Vilket alternativ beskriver bäst socialtjänstens uppgift?',
      options: [
        { id: 'A', text: 'Att se till att de som behöver får stöd och skydd' },
        { id: 'B', text: 'Att driva sjukhus och vårdcentraler i regionen' },
        { id: 'C', text: 'Att ta ut skatt av företag och av invånare' },
        { id: 'D', text: 'Att förhandla om löner för de anställda' },
      ],
      correctOptionId: 'A',
      explanationSv:
        'I varje kommun finns en socialtjänst. Den ansvarar för att de som behöver får stöd och skydd, till exempel omsorg, rådgivning eller ekonomisk hjälp.',
      explanationEn:
        'Every municipality has social services. They make sure that people who need it get support and protection, such as care, advice or financial help.',
      source: {
        chapter: 9,
        page: 31,
        quote:
          'I varje kommun finns en socialtjänst som ansvarar för att de som behöver får stöd och skydd.',
      },
    },
    {
      id: 'k9-q24',
      prompt:
        'Sofia är utsatt för hot och våld i sitt hem. Vilken del av kommunen kan ge henne stöd och hjälp?',
      options: [
        { id: 'A', text: 'Äldreomsorgen' },
        { id: 'B', text: 'Socialtjänsten' },
        { id: 'C', text: 'Barnomsorgen' },
        { id: 'D', text: 'Vuxenutbildningen' },
      ],
      correctOptionId: 'B',
      explanationSv:
        'Socialtjänsten ger stöd och skydd. Det kan till exempel gälla människor som är utsatta för hot och våld.',
      explanationEn:
        'Social services give support and protection. This can for example be for people who are exposed to threats and violence.',
      source: {
        chapter: 9,
        page: 31,
        quote:
          'Det kan handla om familjer som inte har tillräckligt med pengar, personer som inte har någonstans att bo, människor med missbruksproblem eller som är utsatta för hot och våld.',
      },
    },
    {
      id: 'k9-q25',
      prompt: 'Vad kan socialtjänsten också göra enligt materialet?',
      options: [
        { id: 'A', text: 'Betala ut studiestöd till alla studenter' },
        { id: 'B', text: 'Utföra operationer och avancerad behandling' },
        { id: 'C', text: 'Bestämma hur hög kommunens skatt ska vara' },
        { id: 'D', text: 'Ge råd om och hjälp till arbete och studier' },
      ],
      correctOptionId: 'D',
      explanationSv:
        'Socialtjänsten kan ge stöd och hjälp till personer med funktionsnedsättning. Den kan också ge råd om och hjälp till arbete och studier.',
      explanationEn:
        'Social services can support people with disabilities. They can also give advice and help with work and studies.',
      source: {
        chapter: 9,
        page: 31,
        quote:
          'Socialtjänsten kan också ge stöd och hjälp till personer med funktionsnedsättning och ge råd om och hjälp till arbete och studier.',
      },
    },
  ],
}
