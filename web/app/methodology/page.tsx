import type { Metadata } from "next";
import { SiteFooter } from "../site-footer";
import { SiteHeader } from "../site-header";

const coverageAreas = [
  {
    title: "Engineering",
    text: "What happened: source-backed project, technology, infrastructure, policy, supply-chain and operational developments.",
  },
  {
    title: "Research",
    text: "What is being studied: recent papers selected from a deterministic OpenAlex workflow.",
  },
  {
    title: "Industry",
    text: "Who builds it: a curated map of companies and roles across the floating-wind value chain.",
  },
  {
    title: "Projects",
    text: "Where it is happening: structured project facts, status, participants, timelines and sources.",
  },
  {
    title: "Digital & AI",
    text: "How digital technologies may change offshore wind, and how offshore wind may support AI and compute infrastructure.",
  },
];

const researchFlow = [
  "OpenAlex weekly candidates",
  "normalise metadata",
  "exact deduplication",
  "FOWT classification",
  "100-point score",
  "rank and select up to 5",
];

const researchScoreComponents = [
  {
    label: "FOWT relevance",
    points: 35,
    text: "Classifier result, explicit floating-offshore-wind phrases, combined floating and wind terms, and classifier confidence.",
  },
  {
    label: "Technical specificity",
    points: 25,
    text: "Controlled signals covering aerodynamics, hydrodynamics, station keeping, structures, controls, platforms, electrical systems, numerical methods and economics.",
  },
  {
    label: "Research value",
    points: 15,
    text: "Signals for validation, datasets, modelling, optimisation and design, plus the availability of an abstract.",
  },
  {
    label: "Venue quality",
    points: 10,
    text: "A transparent proxy based on source metadata, publication type and technical or repository terms. Journal impact factor is not used.",
  },
  {
    label: "Metadata quality",
    points: 10,
    text: "Completeness of identifiers, source URL, authors, publication source, abstract, topic tags and text-availability metadata.",
  },
  {
    label: "Recency",
    points: 5,
    text: "Publication date relative to the newest candidate in that weekly pool.",
  },
];

const engineeringFlow = [
  "Approved sources",
  "weekly discovery",
  "date and FOWT filtering",
  "duplicate-event grouping",
  "100-point score",
  "diversity and up to 5",
];

const engineeringScoreComponents = [
  {
    label: "Engineering relevance",
    points: 30,
    text: "Explicit floating-wind, offshore-wind and engineering terms for areas such as ports, installation, fabrication, cables, moorings, vessels and grid connection.",
  },
  {
    label: "Project / company",
    points: 25,
    text: "Named project or supply-chain entities and concrete events such as tenders, selections, partnerships, support decisions and study groups.",
  },
  {
    label: "Technology",
    points: 20,
    text: "Controlled groups for ports, floating platforms, cables, installation, fabrication and digital engineering.",
  },
  {
    label: "Policy / market",
    points: 15,
    text: "Government, procurement, regulation, consenting, leasing, state-support, market and supply-chain signals.",
  },
  {
    label: "Source quality",
    points: 10,
    text: "A source-type proxy that gives more weight to government and standards records, followed by attributable company, association, conference and trade sources.",
  },
];

const projectLinks = [
  {
    href: "https://github.com/yangzhouore/fowt-digest",
    label: "GitHub repository",
  },
  {
    href: "https://github.com/yangzhouore/fowt-digest/blob/main/pipeline/ranker.py",
    label: "Research scoring implementation",
  },
  {
    href: "https://github.com/yangzhouore/fowt-digest/blob/main/web/scripts/engineering-selection-scoring.js",
    label: "Engineering scoring implementation",
  },
  {
    href: "https://github.com/yangzhouore/fowt-digest/blob/main/docs/ENGINEERING_SOURCE_POLICY.md",
    label: "Engineering Source Policy",
  },
  {
    href: "https://github.com/yangzhouore/fowt-digest/blob/main/docs/M11_DIGITAL_AI_SIGNALS_DESIGN.md",
    label: "Digital & AI scope and evidence rules",
  },
];

const limitations = [
  "Coverage is incomplete. OpenAlex, the approved Engineering registry and the curated website datasets do not represent every relevant paper, organisation, project or industry event.",
  "Source choice and deterministic weights introduce bias. A high score means a record matched the published model; it is not a universal measure of scientific quality or industry importance.",
  "Historical candidate pools may be retained or reconstructed. Reconstructed Research and Engineering pools can drift because upstream pages, indexes and metadata change over time.",
  "Research selection relies heavily on metadata, topic tags and abstracts. It does not imply that every full paper has been reviewed, and missing or weak abstracts can affect classification and score.",
  "Project facts and status can change after access. Static records may lag announcements, construction changes, ownership changes, pauses or cancellations.",
  "Digital & AI is an emerging field. Research, prototypes and pilots must not be read as proven commercial performance, and speculative infrastructure pathways are labelled cautiously.",
  "Projects are maintained independently from Research, Engineering and Industry. Cross-area relationships are not inferred or automatically synchronized, so valid links and updates may be absent.",
];

export const metadata: Metadata = {
  title: "Methodology",
  description:
    "How FOWT Digest sources, selects and presents floating and offshore wind intelligence.",
};

export default function MethodologyPage() {
  return (
    <main className="methodology-page">
      <SiteHeader />

      <section className="intro" aria-labelledby="methodology-heading">
        <p className="eyebrow">01 / What FOWT Digest is</p>
        <h1 id="methodology-heading">Source-backed intelligence for floating and offshore wind.</h1>
        <p>
          FOWT Digest is a static intelligence briefing for people who need a
          clear view of floating offshore wind without treating every source as
          equally important or every missing fact as permission to infer. It
          brings together engineering developments, research papers, industry
          roles, projects, and a narrow Digital & AI evidence set. Published
          records remain linked to their underlying sources.
        </p>
      </section>

      <section aria-labelledby="why-heading">
        <p className="eyebrow">02 / Why this exists</p>
        <h2 id="why-heading">Less noise, clearer evidence.</h2>
        <p>
          Floating wind knowledge is distributed across academic indexes,
          government and regulatory pages, project announcements, standards
          bodies, technical organisations, company releases and trade sources.
          FOWT Digest reduces the time needed to scan that material while
          preserving the route back to the original record. It is a briefing,
          not a claim of complete market coverage and not a substitute for
          primary technical, commercial, legal or investment due diligence.
        </p>
      </section>

      <section aria-labelledby="audience-heading">
        <p className="eyebrow">03 / Who this is for</p>
        <h2 id="audience-heading">Readers working across the FOWT system.</h2>
        <p>
          The intended readers are offshore-wind engineers, researchers,
          developers, project and supply-chain teams, public-sector and policy
          professionals, students, and others who need a concise technical
          orientation. The site assumes domain interest but does not assume that
          every reader follows every journal, project or supplier.
        </p>
      </section>

      <section aria-labelledby="coverage-heading">
        <p className="eyebrow">04 / What the site covers</p>
        <h2 id="coverage-heading">Five views of one sector.</h2>
        <div className="methodology-sectors">
          {coverageAreas.map((area) => (
            <article className="methodology-sector" key={area.title}>
              <h3>{area.title}</h3>
              <p>{area.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section aria-labelledby="sources-heading">
        <p className="eyebrow">05 / Sources</p>
        <h2 id="sources-heading">Attributable records before presentation.</h2>
        <p>
          Research candidates currently come from OpenAlex searches within a
          defined weekly publication window. Engineering starts from a controlled
          registry of public, attributable sources covering government and
          regulators, developers and suppliers, standards and certification,
          ports, engineering software, associations, universities, conferences
          and specialist trade press. Industry, Projects and Digital & AI use
          curated static records with source URLs and provenance fields.
        </p>
        <p>
          Primary and authoritative sources are preferred where available.
          Company and trade sources can provide useful evidence, but their claims
          are kept within the boundary of what the stored record supports.
          Missing facts remain absent or unknown. The site does not silently
          repair dates, relationships, technical values or project status.
        </p>
        <ul className="project-link-list">
          {projectLinks.map((link) => (
            <li key={link.href}><a href={link.href}>{link.label}</a></li>
          ))}
        </ul>
      </section>

      <section className="research-selection-visual" aria-labelledby="research-selection-heading">
        <p className="eyebrow">06 / How Research selection works</p>
        <h2 id="research-selection-heading">A deterministic paper pipeline.</h2>
        <p>
          The local Research pipeline queries OpenAlex using controlled FOWT
          terms and a weekly publication-date window. It stores raw responses,
          normalises identifiers and metadata, reconstructs abstracts when
          available, and deduplicates exact matches using DOI, OpenAlex ID or
          normalised title plus publication date. It then classifies each paper
          as Relevant, Possibly Relevant or Not Relevant from title, abstract and
          topic-tag signals. No language model performs this classification.
        </p>
        <ol className="research-flow" aria-label="Research selection flow">
          {researchFlow.map((step) => <li key={step}>{step}</li>)}
        </ol>
        <ScoreFormula components={researchScoreComponents} label="Research 100 point score formula" />
        <p>
          <code>research_selection_score_v1</code> is computed before ranking.
          Candidates are ordered by total score, then relevance classification,
          publication date and paper ID as stable tie-breakers. Not Relevant
          records are ineligible; the first eligible records are selected up to
          the five-paper limit. Candidate pages expose the score and component
          evidence where pool data exists. The website reads committed digest
          JSON and does not re-rank or rewrite papers.
        </p>
      </section>

      <section className="research-selection-visual" aria-labelledby="engineering-selection-heading">
        <p className="eyebrow">07 / How Engineering selection works</p>
        <h2 id="engineering-selection-heading">A separate source-record workflow.</h2>
        <p>
          Engineering does not use the Research paper pipeline. Candidates are
          discovered from approved public sources, retained for the weekly date
          window, filtered for basic FOWT relevance, and grouped to remove
          duplicate coverage of the same event. Collection audits record source
          attempts and candidate counts where that evidence exists. Each retained
          source record preserves publisher, title, URL, date, source type,
          evidence text, retrieval information and licensing notes.
        </p>
        <ol className="research-flow" aria-label="Engineering selection flow">
          {engineeringFlow.map((step) => <li key={step}>{step}</li>)}
        </ol>
        <ScoreFormula components={engineeringScoreComponents} label="Engineering 100 point score formula" />
        <p>
          <code>engineering_selection_score_v1</code> ranks candidates by total
          score, using source record ID as the deterministic tie-breaker. A
          separate deterministic diversity step can defer duplicate project
          groups and prefer broader technology coverage before selecting up to
          five highlights. Fewer than five may be published when the source pool
          does not support padding. The resulting briefing copy and sources are
          committed as static data; the website does not discover or score news
          at runtime.
        </p>
      </section>

      <section aria-labelledby="structured-intelligence-heading">
        <p className="eyebrow">08 / How Industry and Projects work</p>
        <h2 id="structured-intelligence-heading">Structured intelligence, not ranked feeds.</h2>
        <div className="methodology-sectors">
          <article className="methodology-sector">
            <h3>Industry</h3>
            <p>
              The Industry Map organises curated organisations by declared roles
              across project ownership, turbines, floating platforms, moorings,
              cables, electrical systems, installation, assurance, engineering
              and simulation. Each company entry includes a representative
              involvement and source URL. Placement explains a value-chain role;
              it is not a quality ranking or endorsement.
            </p>
          </article>
          <article className="methodology-sector">
            <h3>Projects</h3>
            <p>
              Projects are maintained as static structured records. Controlled
              status values make filtering consistent, while individual facts,
              company relationships and timeline events retain source references
              and, where needed, field-level claims. Relationships are stored only
              when supported. Unsupported values remain null rather than being
              estimated from adjacent projects or companies.
            </p>
          </article>
        </div>
      </section>

      <section aria-labelledby="digital-ai-method-heading">
        <p className="eyebrow">09 / Digital & AI methodology</p>
        <h2 id="digital-ai-method-heading">Offshore wind × digital systems, narrowly defined.</h2>
        <p>
          Digital & AI covers applications with a direct offshore-wind,
          wind-infrastructure or energy-system connection: engineering models,
          digital twins, autonomous inspection, robotics, industrial software,
          forecasting, grid integration and relevant compute infrastructure. It
          excludes generic AI news. Every Signal stores its sector connection,
          maturity, evidence type and source IDs.
        </p>
        <p>
          The page separates application areas from real-world evidence. The
          lifecycle map shows where digital methods could enter engineering
          practice; linked Signals show what the current source set actually
          supports. Offshore-wind-to-AI pathways distinguish grid-based supply
          from emerging coastal, offshore and flexible-compute concepts.
          Emerging or experimental labels are cautions, not predictions of
          commercial success.
        </p>
      </section>

      <section aria-labelledby="editorial-control-heading">
        <p className="eyebrow">10 / Editorial control and neutrality</p>
        <h2 id="editorial-control-heading">Deterministic tools support, but do not replace, judgement.</h2>
        <p>
          Collection records, validation rules and scoring make selection more
          inspectable and repeatable. They do not make it objective in an
          absolute sense. Source lists, keyword groups, weights, taxonomies and
          diversity rules are editorial choices and can shape what appears.
          Scores are selection aids, not technical verdicts.
        </p>
        <p>
          Publication remains a human-controlled repository action: static data
          is inspected, validated and committed before it reaches the website.
          The current site does not use AI to write published summaries or to
          make final publication decisions. Inclusion does not endorse an
          organisation, technology or project. Provenance is preserved so
          readers can inspect the evidence and form their own view.
        </p>
      </section>

      <section aria-labelledby="limitations-heading">
        <p className="eyebrow">11 / Known limitations</p>
        <h2 id="limitations-heading">What this methodology cannot guarantee.</h2>
        <ul className="methodology-step-list">
          {limitations.map((limitation, index) => (
            <li key={limitation}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <p>{limitation}</p>
            </li>
          ))}
        </ul>
      </section>

      <SiteFooter />
    </main>
  );
}

function ScoreFormula({
  components,
  label,
}: {
  components: Array<{ label: string; points: number; text: string }>;
  label: string;
}) {
  return (
    <div className="score-formula" aria-label={label}>
      <dl>
        {components.map((component) => (
          <div key={component.label}>
            <dt>{component.label}</dt>
            <dd>{component.points}</dd>
          </div>
        ))}
        <div className="score-total">
          <dt>Total</dt>
          <dd>100</dd>
        </div>
      </dl>
      <div className="score-component-copy">
        {components.map((component) => (
          <p key={component.label}>
            <strong>{component.label}:</strong> {component.text}
          </p>
        ))}
      </div>
    </div>
  );
}
