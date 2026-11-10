import { useState } from 'react'
import { Link } from 'react-router-dom'
import { analyticsConfigured, analyticsRetentionMonths, setAnalyticsConsent, useAnalyticsConsent } from '../lib/analyticsConsent'
import { clearAllProgress } from '../lib/progress'

/** Yes or no to visitor statistics. Read after hydration like other saved state. */
function AnalyticsChoice() {
  const consent = useAnalyticsConsent()
  return (
    <fieldset className="space-y-2">
      <legend className="font-medium text-ink">Får sidan skicka besöksstatistik från den här webbläsaren?</legend>
      {!analyticsConfigured && <p className="text-ink-2">Ny statistikinsamling är pausad. Du kan fortfarande välja nej och rensa äldre sparade statistik-id:n.</p>}
      <label className="mb-choice">
        <input type="radio" name="statistik" disabled={!analyticsConfigured} checked={consent === 'granted'} onChange={() => setAnalyticsConsent('granted')} />
        <span>Ja, skicka statistik</span>
      </label>
      <label className="mb-choice">
        <input type="radio" name="statistik" checked={consent === 'denied'} onChange={() => setAnalyticsConsent('denied')} />
        <span>Nej, skicka ingen statistik</span>
      </label>
      <p role="status" className="text-ink-2">
        {consent === 'granted' && analyticsConfigured
          ? 'Statistik skickas. Du kan ändra dig när som helst.'
          : consent === 'denied'
            ? 'Ingen statistik skickas. Äldre sparade statistik-id:n är borttagna.'
            : consent === 'granted' && !analyticsConfigured
              ? 'Ingen statistik skickas medan insamlingen är pausad.'
              : consent === null
              ? 'Du har inte valt än, så ingen statistik skickas.'
              : ''}
      </p>
    </fieldset>
  )
}

function ClearProgress() {
  const [cleared, setCleared] = useState(false)

  function clear() {
    if (!window.confirm('Vill du rensa dina sparade studieuppgifter i den här webbläsaren?')) return
    clearAllProgress()
    setCleared(true)
  }

  return (
    <div className="space-y-2">
      <button type="button" onClick={clear} className="mb-btn mb-btn--secondary">
        Rensa mina sparade studieuppgifter
      </button>
      <p role="status" className="text-ink-2">
        {cleared ? 'Klart. Dina framsteg, svar, repetitionshistorik, provresultat, studieplan och valet att visa engelska förklaringar är borttagna från den här webbläsaren.' : ''}
      </p>
    </div>
  )
}

export function Integritet() {
  return (
    <article className="space-y-8">
      <header className="space-y-3">
        <h1 className="text-3xl font-semibold">Integritetspolicy</h1>
        <p className="text-sm text-ink-2">Senast uppdaterad: 10 november 2026</p>
        <p>
          Policyn gäller provamedborgarskap.se och appen Prova medborgarskap i ChatGPT,
          inklusive den skrivskyddade tjänsten på /api/mcp. Här beskriver vi vilka uppgifter
          som behandlas, varför, av vem, hur länge och hur du kan påverka det.
        </p>
      </header>

      <section className="surface-raised space-y-3 p-5 text-sm leading-relaxed text-ink/85">
        <h2 className="text-xl font-semibold text-ink">Ansvarig och kontakt</h2>
        <p>
          Adrian Martén driver Prova medborgarskap och är personuppgiftsansvarig för
          webbplatsens och integrationens behandling. Kontakta{' '}
          <a href="mailto:adrian@adrianmarten.net" className="text-accent underline underline-offset-2">adrian@adrianmarten.net</a>{' '}
          för frågor, tillgång eller radering. Tjänsten är fristående och inte knuten till UHR,
          Skolverket eller Migrationsverket. Den ger studiehjälp, inte ett personligt myndighetsbeslut.
        </p>
        <p>
          Det finns inga användarkonton, ingen inloggning, ingen betalning och inga reklamcookies.
          Vi säljer inte personuppgifter, använder dem inte för annonsering och använder inte
          MCP-sökningar, studieuppgifter eller verktygssvar för att träna AI-modeller.
        </p>
      </section>

      <section id="chatgpt" className="surface-raised space-y-3 p-5 text-sm leading-relaxed text-ink/85">
        <h2 className="text-xl font-semibold text-ink">ChatGPT: uppgifter in och ut</h2>
        <p>
          När du använder Prova medborgarskap i ChatGPT skickar OpenAI det valda verktygsanropet
          till vår tjänst hos Vercel. Ingen separat inloggning eller kontokoppling används.
          Vi begär inte ditt namn, din e-postadress, ditt personnummer, din plats eller hela
          din chatthistorik. Söktext är fri text och kan innehålla personuppgifter om du eller
          assistenten tar med dem. Skriv därför bara ämnet du vill studera, inga privata ärenden.
        </p>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <strong>search:</strong> tar emot query, en söktext på högst 200 tecken. Den används
            för att hitta offentligt material. Svaret innehåller högst tio träffar med id,
            titel och kanonisk webbadress. Söktexten skickas inte till någon extern sökmotor.
          </li>
          <li>
            <strong>fetch:</strong> tar emot id för ett tillåtet offentligt kapitel, en FAQ
            eller status:uhr. Svaret innehåller id, titel, beskrivning, webbadress, offentlig
            text och metadata: källänkar, utgivare, kontrolldatum när de finns, datum för
            frågegranskning och begränsningar. Verktyget öppnar inte godtyckliga webbadresser.
          </li>
          <li>
            <strong>Tekniska uppgifter:</strong> JSON-RPC-metod, anrops-id och protokollversion
            används för att besvara anropet. Vercel tar också emot anslutningsuppgifter som
            IP-adress, tidpunkt, sökväg, HTTP-metod, webbläsar-/klientuppgifter och statuskod.
            IP-adressen kan vara OpenAI:s serveradress, snarare än din egen.
          </li>
        </ul>
        <p>
          Indata och svaret behandlas i arbetsminnet för att besvara anropet. Applikationen
          skriver inte sökningar eller verktygssvar till databas, analysverktyg eller egna
          innehållsloggar. Svaren skickas tillbaka till OpenAI så att ChatGPT kan visa och
          använda studiematerialet. Svaren har Cache-Control: no-store och sparas inte i vår
          servercache. Offentligt studiematerial finns kvar som en del av webbplatsen.
        </p>
        <p>
          För att begränsa missbruk hålls en IP-adress från anropets vidarebefordringshuvud,
          eller dess ursprung om adress saknas, tillsammans med ett antal anrop i serverns
          arbetsminne. Posten tas bort efter en minut, även om inga fler anrop kommer.
          Den kan försvinna tidigare när serverinstansen avslutas eller minnesgränsen nås.
        </p>
        <p>
          Integrationen kan inte läsa eller ändra dina lokala övningssvar, framsteg,
          studieplaner eller privata dokument. Den har inga skrivverktyg. Den skickar inte
          uppgifter till UHR eller Migrationsverket när du söker eller hämtar material.
        </p>
        <p>
          Du kan sluta använda appen eller ta bort anslutningen i ChatGPT:s inställningar.
          Det stoppar framtida verktygsanrop men raderar inte tidigare chattar. OpenAI hanterar
          chatten och verktygssvaren enligt{' '}
          <a href="https://openai.com/policies/privacy-policy/" className="text-accent underline underline-offset-2">OpenAI:s integritetspolicy</a>{' '}
          och dina ChatGPT-inställningar. Hantera chatthistorik, eventuell användning för
          modellförbättring och radering hos OpenAI. Vi kan inte radera en ChatGPT-chatt åt dig.
          Samma ansvarsfördelning gäller om du använder tjänsten från en annan AI-assistent.
        </p>
      </section>

      <section className="surface-raised space-y-3 p-5 text-sm leading-relaxed text-ink/85">
        <h2 className="text-xl font-semibold text-ink">Studieuppgifter på din enhet</h2>
        <p>
          Webbläsarens localStorage sparar dina svar i vägledningen ”Behöver jag provet?”,
          övningsresultat, besökta kapitel, sparade och felbesvarade frågor, påbörjade övningar,
          repetitionshistorik (antal rätt och fel, följd av rätta svar och senaste svarsdatum),
          studieplanens startdag och antal veckor samt valet att visa engelska förklaringar.
          Ett påbörjat prov sparas med frågor, valda svar och tidpunkter, liksom dina tio
          senaste provresultat. Uppgifterna används för att fortsätta studier och repetition
          på samma enhet. De skickas inte till oss eller MCP-tjänsten.
        </p>
        <p>
          Uppgifterna har ingen automatisk tidsgräns. De finns kvar tills du rensar dem eller
          webbläsaren tar bort webbplatsdata. Ordkortens pågående omgång finns bara i minnet
          medan den är öppen.
        </p>
        <ClearProgress />
        <p>
          Knappen rensar studieuppgifter och språkval. Statistikval och offlinefiler hanteras
          separat. För att läsa offline sparar en service worker offentliga sidor och filer
          i webbläsarens Cache Storage. Sidor uppdateras när nätet fungerar; högst 120
          resursfiler behålls. Kopiorna har ingen fast tidsgräns och kan tas bort av webbläsaren.
          Rensa webbplatsdata för provamedborgarskap.se i webbläsarens inställningar för att
          ta bort både offlinekopior, statistikval och övrig lokal lagring.
        </p>
        <p>
          Uppläsning använder webbläsarens eller operativsystemets talfunktion. Offentlig
          studietext lämnas till den valda rösten. En nätbaserad röst kan behandla texten hos
          din enhetsleverantör enligt dennes villkor; en lokal röst prioriteras när den finns.
          Vi spelar inte in din röst och begär inte mikrofonåtkomst.
        </p>
      </section>

      <section className="surface-raised space-y-3 p-5 text-sm leading-relaxed text-ink/85" aria-labelledby="statistik">
        <h2 id="statistik" className="text-xl font-semibold text-ink">Frivillig besöksstatistik</h2>
        <p>
          Besöksstatistik får skickas endast efter ett aktivt ja och när lagringstiden för
          statistikprojektet har kontrollerats och angetts för den publicerade versionen.
          ChatGPT-verktygen skickar ingen PostHog-statistik.
        </p>
        <p>
          {analyticsConfigured
            ? `Den här versionen är konfigurerad för ${analyticsRetentionMonths} månaders händelselagring hos PostHog, med leverantörens efterföljande raderingsprocess. Du väljer själv om statistik ska skickas.`
            : 'Ny insamling är pausad tills lagringstiden har verifierats. Ett tidigare ja startar inte insamling medan den är pausad.'}
        </p>
        <p>
          När statistiken är på används PostHog för att förstå sidbesök, sidlämningar,
          prestanda och antal tekniska fel. Endast kända sidvägar utan URL-parametrar eller
          fragment, slumpade tekniska id:n och begränsade tekniska mätvärden skickas.
          Klickinnehåll, övningssvar, studieplaner, fri text, fullständiga hänvisningsadresser
          och råa felmeddelanden skickas inte. Personprofiler, inspelning av sessioner,
          värmekartor och automatisk klickinsamling är avstängda. IP-baserad platsberäkning
          begärs avstängd; PostHog behöver ändå behandla anslutningens IP-adress för att ta
          emot nätverkstrafiken. Inga statistikkakor sätts.
        </p>
        <p>
          Statistikvalet sparas i localStorage tills du ändrar valet eller rensar
          webbplatsdata. Nya statistik-id:n och tekniskt sessionssammanhang hålls bara i
          sidans arbetsminne och försvinner när sidan laddas om eller stängs. De sparas
          inte i localStorage, sessionStorage eller cookies. Nej stoppar framtida händelser
          och rensar äldre sparade statistik-id:n. Det raderar inte redan mottagna händelser
          hos PostHog. Kontakta oss om du vill begära radering där. Om en tillfällig
          identifierare redan har försvunnit kan vi inte alltid koppla tidigare händelser
          till dig, och vi begär inte dina studiesvar för att göra det.
        </p>
        <p>
          Tidigare statistik kan finnas kvar hos PostHog enligt projektets då gällande
          lagringstid. Den exakta projektinställningen har inte kunnat verifieras.
          PostHog Cloud anger ett års händelselagring för gratisplanen och upp till sju år
          för vissa betalplaner; utgångna händelser kan finnas kvar tills leverantören
          genomför radering. Detta är inte ett löfte om att äldre händelser redan har raderats.
          Vi återupptar inte insamling innan projektets lagringstid har verifierats och
          denna policy har uppdaterats. Se{' '}
          <a href="https://posthog.com/docs/data/events-retention" className="text-accent underline underline-offset-2">PostHogs lagringstider</a>{' '}
          och <a href="https://posthog.com/privacy" className="text-accent underline underline-offset-2">integritetspolicy</a>.
        </p>
        <AnalyticsChoice />
      </section>

      <section className="surface-raised space-y-3 p-5 text-sm leading-relaxed text-ink/85">
        <h2 className="text-xl font-semibold text-ink">Mottagare, drift och lagringstider</h2>
        <p>
          Adrian Martén hanterar tjänsten och integritetsförfrågningar. Vercel är
          driftleverantör och behandlar webb- och MCP-trafik för leverans, felsökning och
          säkerhet. PostHog är mottagare av eventuell samtyckt statistik, inte av MCP-sökningar
          eller studiehistorik. OpenAI tar emot MCP-svaren som leverantör av ChatGPT.
          Om den separata AI-hjälpen aktiveras är OpenAI och Upstash Redis också mottagare
          för förklaringar respektive kapacitetsskydd och cache, enligt avsnittet nedan.
          E-postleverantörer behandlar kontaktmejl för att leverera och förvara vår korrespondens.
          Underleverantörer kan behandla uppgifter för dessa leverantörers räkning.
        </p>
        <p>
          Projektet använder Vercels Hobby-plan. Vercels dokumenterade lagringstid för
          tillgängliga runtime-loggar på den planen är en timme. Loggarna kan innehålla
          IP-adress, klientuppgifter, tidpunkt, anrops-id, begärd adress och statuskod.
          Applikationen lägger inte söktext, valda studiesvar eller verktygssvar i loggarna.
          En timme avser runtime-loggar, inte en garanti för all separat säkerhets-, backup-
          eller rättsligt nödvändig behandling hos Vercel. Sådan behandling styrs av
          leverantörens ändamål och skyldigheter. Vi skapar inget eget beständigt MCP-register.
          Se <a href="https://vercel.com/docs/logs/runtime" className="text-accent underline underline-offset-2">Vercels loggdokumentation</a>{' '}
          och <a href="https://vercel.com/legal/privacy-notice" className="text-accent underline underline-offset-2">Vercels integritetsinformation</a>.
        </p>
        <p>
          Leverantörerna kan behandla uppgifter utanför EU/EES. Vi lovar därför inte att all
          behandling sker inom EU. Leverantörernas dataskyddsavtal beskriver tillämpliga
          överföringsmekanismer, exempelvis EU:s standardavtalsklausuler. OpenAI:s behandling
          av din ChatGPT-chatt styrs separat av ditt konto och dina inställningar.
        </p>
      </section>

      <section className="surface-raised space-y-3 p-5 text-sm leading-relaxed text-ink/85">
        <h2 className="text-xl font-semibold text-ink">Separat, frivillig AI-hjälp på webbplatsen</h2>
        <p>
          Denna funktion är skild från ChatGPT-integrationen och är för närvarande inte
          aktiverad för allmän användning. Om den aktiveras krävs ett separat val för den
          aktuella frågan. Till vår tjänst skickas questionId, selectedOptionId, language,
          intent, consent och privacyVersion. Tjänsten lägger till den offentliga frågan,
          alternativen, facit, författad förklaring och godkända källutdrag innan OpenAI
          tillfrågas. Svaret består av en förklaring, eventuellt exempel och kontrollfråga,
          källhänvisningar samt källversion. Ingen fri text eller övrig studiehistorik skickas.
        </p>
        <p>
          OpenAI är mottagare för att skapa förklaringen. Vi begär store: false; det är inte
          samma sak som noll lagring. Enligt OpenAI:s standardvillkor för API:t kan
          missbruksövervakningsloggar behållas i upp till 30 dagar, eller längre om lag kräver
          det eller det behövs för att skydda tjänster eller tredje part. Ingen särskild nollagring eller EU-residens utlovas. Se{' '}
          <a href="https://developers.openai.com/api/docs/guides/your-data" className="text-accent underline underline-offset-2">OpenAI:s API-datakontroller</a>.
        </p>
        <p>
          Om hjälpen aktiveras används Upstash Redis för kapacitetsskydd och tillfällig
          cache. Ett HMAC-baserat id från IP-adressen och antal anrop sparas till nästa
          UTC-dygnsskifte (högst cirka 24 timmar). Gemensamma kostnadsräknare sparas till
          nästa UTC-dygns- respektive månadsskifte och innehåller inte dina svar eller ditt
          id. En kostnadsreservation sparas normalt högst 15 minuter. Kontrollerade
          förklaringar för offentliga frågor kan återanvändas i cache i högst tio minuter;
          cache innehåller fråge-/svarskontext men inte din IP-adress. Se{' '}
          <a href="https://upstash.com/trust/privacy.pdf" className="text-accent underline underline-offset-2">Upstashs integritetspolicy</a>.
          Att avstå påverkar inte den vanliga studiehjälpen. Samtycket sparas inte mellan
          frågorna. Att stänga panelen eller avbryta stoppar visningen men kan inte återkalla
          behandling som redan har påbörjats hos en leverantör.
        </p>
      </section>

      <section className="space-y-3 text-sm leading-relaxed text-ink/85">
        <h2 className="text-xl font-semibold text-ink">Dina val och rättigheter</h2>
        <p>
          Statistik och eventuell AI-hjälp bygger på ditt samtycke. Nödvändig drift och
          missbruksskydd bygger på vårt berättigade intresse av en fungerande och säker
          tjänst. Lokala studieinställningar används för funktioner du själv valt.
          Vi använder inte uppgifterna för automatiserade beslut om medborgarskap eller
          annan profilering med rättsliga följder.
        </p>
        <p>
          Du kan begära tillgång, rättelse, radering, begränsning, invända mot behandling och
          begära dataportabilitet där dessa rättigheter gäller. Återkallat samtycke påverkar
          inte behandling som redan skett. Mejla{' '}
          <a href="mailto:adrian@adrianmarten.net" className="text-accent underline underline-offset-2">adrian@adrianmarten.net</a>{' '}
          och ange vilken tjänst och ungefärlig tidpunkt det gäller. Skicka inte personnummer,
          studiesvar eller hela chattar. Vi kan behöva begränsade uppgifter för att hitta
          en post och verifiera din begäran. Kortlivade loggar kan redan vara borta och lokal
          lagring kan bara rensas på din enhet. Om du mejlar oss får vi din avsändaradress,
          eventuellt namn och meddelandets innehåll. Kontaktmejl behandlas för att besvara och
          dokumentera din begäran så länge det behövs för ärendet och eventuella rättsliga krav.
        </p>
        <p>
          Du kan klaga hos <a href="https://www.imy.se/privatperson/utfora-arenden/lamna-ett-klagomal/" className="text-accent underline underline-offset-2">Integritetsskyddsmyndigheten (IMY)</a>.
          Externa länkar till myndigheter omfattas av deras egna integritetspolicyer när du
          följer dem. Väsentliga ändringar publiceras här med nytt uppdateringsdatum innan
          nya användningar av uppgifter börjar. Mer om tjänsten finns på{' '}
          <Link to="/om" className="text-accent underline underline-offset-2">Om</Link>.
        </p>
      </section>
    </article>
  )
}
