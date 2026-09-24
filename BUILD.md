# Medborgarskap — build brief (v1)

**Working title:** Medborgarskap  
**Tagline (SV):** Fristående övning till medborgarskapsprovet, baserad på UHR:s *Sverige i fokus*.  
**Domain:** https://medborgarskap.adrianmarten.net  
**Repo:** https://github.com/duhman/medborgarskap  
**Owner:** Adrian Martén (personal / portfolio goodwill; free forever)  
**Status:** Personal-first MVP; soft-public only when Adrian would send it to a friend without caveats.

---

## 1. Problem and job-to-be-done

People preparing for Sweden’s medborgarskapsprov (samhällskunskap) need to study UHR’s official material and practice multiple-choice questions in Swedish. Commercial sites (e.g. medborgaretest.se at 249 kr/mo) sell large quiz banks and exam anxiety. Official facts and the study guide are already free from the state.

**Primary JTBD:** Help me learn *Sverige i fokus* and know whether I even need UHR’s paper test.  
**Not the JTBD:** Sell readiness anxiety or race to “1000 questions.”

---

## 2. Positioning (Lennybot + CoS, locked)

**Wedge:** Official-first study companion (pathway triage + listen → read → cited quiz).

**Survive vs competitors by:**
1. **Pathway triage** — “Behöver jag provet?” using Migrationsverket alternate paths (grades, SFI D, komvux/folkhögskola, age).
2. **Reader + official audio, then quiz** — wired to UHR’s 13 chapters + intro MP3s and PDF.
3. **Cite chapter (and page when known)** on every explanation.
4. **Honest UHR status strip** — next sitting TBA; Aug 2026 was utprövningsprov; do **not** lock 60 Q / 90 min as permanent until UHR republishes.

**Hygiene (not the wedge):** free forever, calm Grundform-ish UI, optional EN under explanations.

**Kill for v1:** AI tutor; volume race; fake “real exam” 60/90 as default; scrape of any commercial bank; PDF mirror unless reuse terms checked; accounts; paid unlocks; pass guarantees; invented next-exam dates.

---

## 3. Official sources (SoT)

| Resource | Role | URL |
| --- | --- | --- |
| Sverige i fokus PDF (corr. 2026-08-10) | Study text; test based on this | https://www.uhr.se/globalassets/_uhr.se/medborgarskapsprovet/utbildningsmaterial/sverige-i-fokus_.pdf |
| UHR utbildningsmaterial | PDF + MP3 list + 5 sample Qs | https://www.uhr.se/medborgarskapsprovet/utbildningsmaterial/ |
| UHR medborgarskapsprov hub | Rules, dates | https://www.uhr.se/medborgarskapsprovet/ |
| UHR FAQ | Samples, pass-mark notes | https://www.uhr.se/medborgarskapsprovet/fragor-och-svar/ |
| Registration | Anmälan / results | https://medborgarskapsprovet.uhr.se/ |
| Migrationsverket knowledge | Who needs test; alternate paths | https://www.migrationsverket.se/du-vill-ansoka/svenskt-medborgarskap/medborgarskap-for-vuxna/medborgarskap-for-vuxna.html |
| Reform notice | 6 Jun 2026 context | https://www.migrationsverket.se/nyheter/nyhetsarkiv/2026-05-06-nya-regler-for-svenskt-medborgarskap-fran-6-juni-2026.html |

**Chapters (13 + inledning):**
1. Landet Sverige  
2. Sveriges demokratiska system  
3. Så här styrs Sverige  
4. Politiska val och partier  
5. Lag och rätt  
6. Mediernas roll  
7. Mänskliga rättigheter  
8. Arbetsmarknad och privatekonomi  
9. Välfärdssamhället  
10. Sveriges moderna historia  
11. Sverige och omvärlden  
12. En sekulär stat och ett mångreligiöst land  
13. Traditioner och högtider  

Plus Inledning (audio track 1).

**Hard facts:** Exam in Swedish only; paper; 4-option MC, one correct. UHR does not endorse third-party practice tests. Track UHR errata (e.g. FN 1945, kyrkor ~1400).

---

## 4. Trust and legal

- Above-the-fold disclaimer: independent study aid; **not** affiliated with UHR, Skolverket, or Migrationsverket.
- No crown / UHR / Migrationsverket logos.
- Copy language: “övning”, “fristående”, never imply official “godkänt” against unpublished cut scores.
- **Original** practice questions only (except clearly labeled UHR sample items).
- Link out to official PDF and MP3s; do not host a PDF mirror in v1.
- Every practice answer cites `kapitel` (+ `sida` when known).
- No em/en dashes in user-facing Swedish/English UI copy (house rule: ASCII hyphen only).

---

## 5. Information architecture

```
/                     Home: status strip + disclaimer + CTAs
                        → Behöver jag provet? | Börja studera
/behover-jag          Pathway checklist (Migrationsverket-aligned)
/status               Longer UHR/Mig status (optional; can be section on home)
/kapitel              Chapter index (13 + links to PDF/MP3)
/kapitel/[slug]       Chapter study: summary bullets + official PDF deep-link
                        + official MP3 link + “Öva detta kapitel”
/ovning/[slug]        Chapter quiz (5–10 original SV MC)
/provfragor           UHR’s 5 official sample questions (labeled)
/om                   About, sources, disclaimer, contact
```

Progress: **localStorage** only in v1 (no accounts). Track chapters visited, quiz scores per chapter, pathway checklist answers.

---

## 6. Content requirements (MVP)

### 6.1 Pathway checklist (`/behover-jag`)
Interactive yes/no-ish flow covering:
- Age 16–66 vs 67+ exemption framing (point to Migrationsverket for decisions)
- Existing Swedish school / komvux / folkhögskola samhällskunskap grades
- SFI / Swedish language path separate note (language test later; civics vs language)
- Clear outcome copy: “Du kan behöva provet” vs “Du kan kanske visa kunskap på annat sätt” with **strong** CTA to Migrationsverket (they decide), not a legal verdict.

### 6.2 Chapter pages
For each of 13 chapters:
- Short Swedish intro (original paraphrase, not copy-paste of PDF)
- Link: “Läs kapitlet i Sverige i fokus (PDF)” → UHR PDF
- Link: “Lyssna (MP3)” → UHR audio URL for that chapter
- CTA: Öva kapitlet

### 6.3 Questions
- ~5–10 **original** Swedish MC per chapter (four options, one correct)
- Explanation in Swedish; optional English toggle under the fold
- `source: { chapter, page? }` required in data model
- Store as typed JSON/TS modules under `src/content/`

### 6.4 Status strip (every page)
Editable config object:
```ts
{
  nextSitting: "Information kommer på uhr.se",
  registrationOpen: false,
  notes: "Första tillfället aug 2026 var utprövningsprov. Godkäntgräns sätts i efterhand."
}
```
Never invent a next date.

---

## 7. UX / visual

- Swedish UI primary; EN optional only inside explanations.
- Calm, paper-ink, Bauhaus/Braun-adjacent (Grundform spirit): strong type hierarchy, generous whitespace, restrained color (ink + one accent). Not generic SaaS hero + testimonial carousel.
- Mobile-first; large tap targets for quiz options.
- No dark-pattern urgency, countdown to “exam,” or fake social proof.

---

## 8. Tech stack (scaffold target)

- **Vite + React 19 + TypeScript**
- **React Router** (or TanStack Router) for the IA above
- **Tailwind CSS** + CSS variables for a small design token set
- **Static-friendly** deploy to **Vercel**
- Content as checked-in TS/JSON (no CMS in v1)
- `vitest` for question schema + a few quiz helpers
- `README.md` with sources, disclaimer, and how to update status strip

Domain after deploy: attach `medborgarskap.adrianmarten.net` on Vercel (CNAME/DNS as needed).

---

## 9. Success metrics

**Personal:** Adrian completes all chapters once + ≥80% on a mixed review set he trusts.  
**Soft-public (later):** % finish pathway checklist; % open ≥1 official MP3 before first quiz; weekly returners studying a new chapter; zero “are you UHR?” confusion in month one.

---

## 10. Scaffold acceptance criteria (this Cursor run)

1. Repo boots with `npm install && npm run dev` / `npm run build`.
2. All routes in §5 exist (can be stub content for some chapters).
3. At least **3 chapters** fully populated with study page + ≥5 original questions each (prefer first 3: Landet Sverige, Demokratiska systemet, Så här styrs Sverige). Remaining chapters: stubs with title + PDF/MP3 links + empty quiz placeholder.
4. Pathway page functional with checklist + Migrationsverket links.
5. Status strip + disclaimer on layout shell.
6. Official sample questions page with the **5 UHR examples** clearly labeled official (Swedish text as published).
7. localStorage progress for quizzes completed.
8. README documents sources, non-affiliation, and content update process.
9. `vercel.json` if needed for SPA fallback.
10. No copied commercial site copy/UI; no AI tutor; no fake 60/90 timer as default.

---

## 11. Out of scope (explicit)

Accounts, payments, AI chat, scraping, PDF hosting, full question bank to 1000, Product Hunt launch, email capture funnels.
