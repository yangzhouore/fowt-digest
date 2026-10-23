import { copy as c, type Copy, type CountryGuide, type CountryRole, type CountryTopic, type EvidenceKind } from "./country-guide-types";
import { sharedTopics, topic } from "./country-guide-content";

export function role(id: string, name: string, category: Copy, delivers: Copy, customer: Copy, boundary: Copy, kind: EvidenceKind, ...sourceIds: string[]): CountryRole {
  return { id, name, category, delivers, customer, boundary, kind, sourceIds };
}

export function makeGuide(input: Omit<CountryGuide, "topics" | "reviewedOn"> & {
  countryTopics: CountryTopic[]; authority: Copy; network: Copy; chainExamples: Copy[]; chainSources: string[];
}): CountryGuide {
  const { countryTopics, authority, network, chainExamples, chainSources, ...metadata } = input;
  const chain = topic(1, c("Follow deliverables upwards; read payment and permission as separate relationships.", "从下向上看交付物；另行理解付款与许可关系。"), chainSources, [
    c("Industrial chain: materials → components → subsystems → packages → marine delivery → project company. Project-development chain: rights, design, consent, grid, revenue and finance converge at investment. Regulatory chain: public authorities authorise and supervise alongside the project. Market chain: power buyers, balance/settlement parties and network charges create financial relationships separate from physical electricity.", "工业链：材料 → 部件 → 子系统 → 设备包 → 海工交付 → 项目公司。开发链：权利、设计、许可、电网、收入与融资汇合为投资条件。监管链：公共机关在项目旁审批监督。市场链：购电、平衡／结算与网络费形成独立于物理电流的资金关系。"),
    c("The table describes typical functions/payment directions. Named examples illustrate documented roles below; no entire domestic supplier chain or current project procurement list is implied. A developer can contract directly with suppliers or through EPCI (engineering, procurement, construction and installation) package leads.", "下表说明通常功能及付款方向；具名示例对应后文的有证据角色，不代表全国产业链完整名录或某项目当前采购清单。开发商可直接采购，也可通过 EPCI（设计、采购、施工与安装）牵头承包商采购。"),
  ], { headers: [c("Level", "层级"), c("Function / delivery upwards", "功能／向上交付"), c("Who pays whom? Typical contract flow", "谁付给谁？典型合同流"), c("Main risk", "主要风险"), c("Country / cross-border examples", "本国／跨境示例")], rows: [
    [c("01 Materials", "01 材料"), c("Steel, concrete constituents, copper, polymers and fibre become traceable manufacturing inputs.", "钢、混凝土原料、铜、聚合物和纤维成为可追溯制造投入。"), c("Component/fabrication firms pay material suppliers.", "部件／制造企业向材料商付款。"), c("Commodity cost, grade, origin, quality and delivery.", "原料价格、等级、产地、质量与交期。"), chainExamples[0]],
    [c("02 Components", "02 部件"), c("Bearings, forgings, steel sections, cable cores and connectors enter subsystems.", "轴承、锻件、钢构段、缆芯与连接件进入子系统。"), c("OEMs and subsystem suppliers pay component makers.", "整机与子系统商向部件商付款。"), c("Qualification, tolerances and serial throughput.", "资格、公差与批量产能。"), chainExamples[1]],
    [c("03 Subsystems", "03 子系统"), c("Turbine drivetrain/control, floater, mooring/anchor and dynamic cable perform distinct functions.", "风机传动／控制、浮体、系泊／锚及动态缆承担不同功能。"), c("Package leads or developer pay subsystem suppliers.", "设备包牵头方或开发商向子系统商付款。"), c("Coupled loads, fatigue and interface compatibility.", "耦合载荷、疲劳与接口兼容。"), chainExamples[2]],
    [c("04 Engineered packages", "04 工程设备包"), c("Design, manufacture, test and warrant turbine, foundation or electrical packages.", "设计、制造、测试并质保风机、基础或电气设备包。"), c("Developer pays package contractor against agreed milestones.", "开发商按约定里程碑向设备包承包商付款。"), c("Performance, warranty gaps and scope exclusions.", "性能、质保缺口与范围排除。"), chainExamples[3]],
    [c("05 EPCI / marine delivery", "05 EPCI／海工交付"), c("Ports, vessels and installation contractors deliver tested, installed interfaces.", "港口、船舶与安装商交付完成安装测试的接口。"), c("Developer/prime contractor pays yards, ports and vessel contractors.", "开发商／总承包商向船厂、港口及船舶商付款。"), c("Weather, vessel/port slots, lifting, hook-up and delay.", "天气、港船档期、吊装、连接及延误。"), chainExamples[4]],
    [c("06 Developer / project company", "06 开发商／项目公司"), c("Integrates asset, permissions, contracts, capital and operation.", "集成资产、许可、合同、资金与运行。"), c("Equity/debt fund development and construction; power-sale cash funds operation and repayment.", "股本／债务支付开发建设，售电现金支付运维及偿债。"), c("Integrated cost, consent, revenue and delivery exposure.", "综合成本、许可、收入与交付风险。"), chainExamples[5]],
    [c("07 Connection / transmission", "07 接入／输电"), c("Export and network assets move power across an agreed ownership boundary.", "送出及电网资产跨越约定产权边界传输电力。"), c("Project connection spending and regulated network charges follow the local model.", "项目接入投资与受监管网络费按本国模式确定。"), c("Completion dates, faults, capacity and boundary responsibility.", "完工时间、故障、容量与边界责任。"), chainExamples[6]],
    [c("08 Electricity system / market", "08 电力系统／市场"), c("Balance supply/demand, trade and settle measured energy.", "平衡供需，交易并结算计量电量。"), c("Buyers pay sellers; imbalance, balancing and network settlement are separate.", "购电方向售电方付款；偏差、平衡与网络另行结算。"), c("Forecast error, congestion, price and collateral exposure.", "预测误差、阻塞、价格与担保风险。"), chainExamples[7]],
    [c("09 Public coordination — alongside", "09 公共协调——并行层"), c("Plan areas, award rights, approve projects and regulate networks/markets.", "规划区域、授予权利、批准项目及监管电网市场。"), c("Public funding, fees or levies where applicable; a payment does not buy consent.", "适用的公共预算、收费或征费；付款不意味着买到许可。"), c("Policy change, cumulative impacts and decision sequencing.", "政策变化、累积影响与决策时序。"), chainExamples[8]],
  ] }, undefined, ["typical", "interpretation", "project"]);
  const localSources = countryTopics.find((item) => item.number === 4)!.sourceIds;
  const topics = [chain, ...sharedTopics(authority, network).map((item) => item.number === 3 ? { ...item, sourceIds: [...item.sourceIds, ...localSources] } : item), ...countryTopics].sort((a, b) => a.number - b.number);
  return { ...metadata, reviewedOn: "2026-10-23", topics };
}
