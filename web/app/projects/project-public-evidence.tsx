import { getProjectReadiness, type ProjectWithRelations } from "../../data/project-adapter";
import { getProjectPublicEvidence } from "../../data/project-public-evidence-adapter";
import { LocalizedCopy as Copy } from "../i18n/localized-copy";

const areaZh: Record<string, string> = { Permitting: "许可", Revenue: "收入", Engineering: "工程", Procurement: "采购", "Financing / FID": "融资 / FID", Execution: "执行" };
const stateZh: Record<string, string> = { SECURED: "已落实", ACTIVE: "推进中", "NOT VERIFIED": "未核实", "NOT STARTED": "未开始", UNKNOWN: "未知" };
const materialLabels = {
  public_webpage: { en: "Public webpage inspected", zh: "已查阅公开网页" },
  public_document: { en: "Public document inspected", zh: "已查阅公开文件" },
  stored_record: { en: "Stored source-backed record", zh: "已存档的来源支持记录" },
  unavailable: { en: "Source unavailable during review", zh: "复核时来源无法获取" },
};

export function ProjectReviewStrip({ project }: { project: ProjectWithRelations }) {
  const evidence = getProjectPublicEvidence(project);
  return <aside className="project-review-strip" aria-labelledby="review-summary-heading">
    <h2 id="review-summary-heading"><Copy en="Assessment review" zh="评估复核" /></h2>
    <p>{evidence.reviewedOn ? <><Copy en="Last completed review" zh="最近完成复核" />: <time dateTime={evidence.reviewedOn}>{evidence.reviewedOn}</time> · <Copy en="Public-source assessment review" zh="公开来源评估复核" /></> : <Copy en="Assessment review: not recorded" zh="评估复核：未记录" />}</p>
    <p><Copy en="Public evidence does not disclose complete internal readiness. Review dates, source access dates and event dates describe different things." zh="公开证据无法揭示全部内部准备情况。评估复核日期、来源查阅日期与事件日期具有不同含义。" /> <a href="#review-history"><Copy en="Review history & changes" zh="复核历史与变化" /></a></p>
  </aside>;
}

export function ProjectPublicEvidence({ project }: { project: ProjectWithRelations }) {
  const evidence = getProjectPublicEvidence(project);
  const readiness = getProjectReadiness(project);
  return <section className="project-intel-section project-public-evidence" aria-labelledby="readiness-heading">
    <p className="eyebrow"><Copy en="Public evidence" zh="公开证据" /></p>
    <h2 id="readiness-heading"><Copy en="Public evidence by readiness area" zh="各准备度领域的公开证据" /></h2>
    <p className="project-muted-note"><Copy en="Readiness states are editorial assessments. Linked records show their evidence context; counts do not measure completeness or technical quality. Missing evidence does not prove inactivity." zh="准备度状态属于编辑评估。关联记录展示证据背景；数量不代表完整程度或技术质量。证据缺失不等于项目停滞。" /></p>
    <div className="project-evidence-table" role="table" aria-label={`${project.name} readiness matrix`}>
      <div className="project-evidence-header" role="row">
        <strong role="columnheader"><Copy en="Area" zh="领域" /></strong>
        <strong role="columnheader"><Copy en="Editorial readiness" zh="编辑准备度评估" /></strong>
        <strong role="columnheader"><Copy en="Evidence & boundaries" zh="证据与边界" /></strong>
      </div>
      {evidence.areas.map((area) => {
        const gate = readiness.find((gate) => gate.area === area.area)!;
        return <div className="project-evidence-row" role="row" key={area.area} id={area.anchor}>
          <div role="cell"><h3><Copy en={area.area} zh={areaZh[area.area]} /></h3></div>
          <div role="cell"><strong className={`project-intel-state-pill project-intel-state-${gate.state.toLowerCase().replaceAll(" ", "-")}`}><Copy en={gate.state} zh={`${stateZh[gate.state]} / ${gate.state}`} /></strong></div>
          <div role="cell">
            <p className="project-evidence-assessment"><strong><Copy en="Editorial assessment" zh="编辑评估" />: </strong>{gate.evidence}</p>
            <details className="project-evidence-disclosure">
              <summary><Copy en={`Evidence & boundaries — ${area.area}`} zh={`证据与边界 — ${areaZh[area.area]}`} /> <span className="project-evidence-count">({area.items.length})</span></summary>
              <div className="project-evidence-content">
                <h4><Copy en="Recorded public evidence" zh="已记录的公开证据" /></h4>
                {area.items.length ? <ul className="project-evidence-items">{area.items.map((item) => <li key={item.key}>
                  <p>{item.text}</p>
                  {item.eventDate && <p className="project-evidence-meta"><Copy en="Event date" zh="事件日期" />: <time dateTime={item.eventDate}>{item.eventDate}</time></p>}
                  {item.context && <p className="project-evidence-meta"><Copy en="Recorded role scope" zh="记录的角色范围" />: {item.context}</p>}
                  <ul className="project-evidence-sources">{item.sources.map((source) => <li key={source.sourceId}>
                    <a href={source.url}>{source.title}</a>
                    <p className="project-evidence-meta">{source.publisher} · <Copy en="Published" zh="发布" />: {source.publishedDate ?? <Copy en="Not recorded" zh="未记录" />} · <Copy en="Stored source access" zh="存档来源查阅日期" />: {source.accessedDate}</p>
                    <p className="project-evidence-meta">{source.inspection ? <><Copy {...materialLabels[source.inspection.material]} /> · <Copy en="Review access" zh="本次复核查阅日期" />: {source.inspection.accessedDate}</> : <Copy {...materialLabels.stored_record} />}</p>
                  </li>)}</ul>
                </li>)}</ul> : <p><Copy en="No linked evidence recorded" zh="未记录关联证据" /></p>}
                <h4><Copy en="Evidence boundary / open question" zh="证据边界／待确认问题" /></h4>
                <p>{area.boundary ?? <Copy en="These records do not disclose all internal decisions, remaining conditions or current activity. No additional area-specific boundary has been recorded." zh="这些记录无法揭示全部内部决策、剩余条件或当前活动。尚未记录额外的领域专属边界说明。" />}</p>
                <h4><Copy en="Next observable signal" zh="下一步可观察信号" /></h4>
                {area.watchpoints.length ? <ul>{area.watchpoints.map((watchpoint) => <li key={watchpoint}>{watchpoint}</li>)}</ul> : <p><Copy en="No area-specific watchpoint mapped. See the project watchpoints below." zh="未关联领域专属观察点；请参阅下方项目观察点。" /></p>}
              </div>
            </details>
          </div>
        </div>;
      })}
    </div>
  </section>;
}

export function ProjectReviewHistory({ project }: { project: ProjectWithRelations }) {
  const evidence = getProjectPublicEvidence(project);
  const changeLabels = { fact: { en: "Factual record change", zh: "事实记录变化" }, assessment: { en: "Editorial assessment change", zh: "编辑评估变化" }, mapping: { en: "Evidence-mapping maintenance", zh: "证据关联维护" } };
  return <section id="review-history" className="project-intel-section project-review-history" aria-labelledby="review-history-heading">
    <h2 id="review-history-heading"><Copy en="Review history & changes" zh="复核历史与变化" /></h2>
    <p className="project-muted-note"><Copy en="A review describes the named public evidence and its limits. Partial reviews do not advance the completed assessment date. Mapping maintenance is not a change in real-world project status." zh="复核仅针对列明的公开证据及其边界。部分复核不会更新已完成评估日期。证据关联维护不代表项目现实状态发生变化。" /></p>
    {evidence.reviews.length ? <ol className="project-review-list">{evidence.reviews.map((review) => <li key={review.id}>
      <h3><time dateTime={review.date}>{review.date}</time> · {review.outcome === "completed" ? <Copy en="Completed public-source review" zh="已完成公开来源复核" /> : <Copy en="Partial public-source review" zh="部分公开来源复核" />}</h3>
      <p>{review.summary}</p>
      <p><strong><Copy en="Limitations" zh="局限" />: </strong>{review.limitations}</p>
      <details><summary><Copy en="Review scope & source inspections" zh="复核范围与来源查阅记录" /></summary>
        <div className="project-evidence-content">
          <h4><Copy en="Area findings" zh="各领域复核结果" /></h4>
          <dl className="project-review-findings">{review.findings.map((finding) => <div key={finding.area}><dt><Copy en={finding.area} zh={areaZh[finding.area]} /></dt><dd>{finding.note} {finding.sourceIds.map((id, index) => <a key={id} href={evidence.sourceById[id]?.url}>[{index + 1}]</a>)}</dd></div>)}</dl>
          <h4><Copy en="Material actually reviewed" zh="实际查阅材料" /></h4>
          <ul className="project-evidence-sources">{review.sources.map((inspection) => <li key={inspection.sourceId}>
            <a href={inspection.source?.url}>{inspection.source?.title ?? inspection.sourceId}</a>
            <p className="project-evidence-meta"><Copy {...materialLabels[inspection.material]} /> · {inspection.accessedDate}</p>
            <p>{inspection.finding}</p>
          </li>)}</ul>
        </div>
      </details>
      {!evidence.changes.some((change) => change.reviewId === review.id && change.kind !== "mapping") && review.outcome === "completed" && <p><Copy en="No material change identified within the reviewed scope." zh="在本次复核范围内未发现实质变化。" /></p>}
    </li>)}</ol> : <p><Copy en="No assessment review history recorded" zh="未记录评估复核历史" /></p>}
    {evidence.changes.length > 0 && <details className="project-change-history"><summary><Copy en="Recorded changes" zh="已记录变化" /> ({evidence.changes.length})</summary>
      <ol className="project-review-list">{evidence.changes.map((change) => <li key={change.id}>
        <h3><Copy {...changeLabels[change.kind]} /> · <time dateTime={change.date}>{change.date}</time></h3>
        <p><Copy en={change.area} zh={areaZh[change.area] ?? "项目"} /></p>
        <dl className="project-change-values"><div><dt><Copy en="Before" zh="此前" /></dt><dd>{change.before}</dd></div><div><dt><Copy en="After" zh="此后" /></dt><dd>{change.after}</dd></div></dl>
        <p><strong><Copy en="Reason" zh="原因" />: </strong>{change.rationale}</p>
        <ul className="project-evidence-sources">{change.sourceIds.map((id) => <li key={id}><a href={evidence.sourceById[id]?.url}>{evidence.sourceById[id]?.title ?? id}</a></li>)}</ul>
      </li>)}</ol>
    </details>}
  </section>;
}
