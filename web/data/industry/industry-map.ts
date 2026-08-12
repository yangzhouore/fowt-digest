export type IndustryRoleId =
  | "developer-owner"
  | "utility"
  | "turbine-oem"
  | "floating-platform"
  | "platform-engineering"
  | "mooring-anchoring"
  | "cable-systems"
  | "offshore-electrical"
  | "grid-technology"
  | "epci-subsea"
  | "marine-installation"
  | "certification-assurance"
  | "engineering-consulting"
  | "simulation-software";

export type IndustryCompany = {
  id: string;
  name: string;
  countryRegion: string;
  companyType: string;
  roles: IndustryRoleId[];
  description: string;
  website: string;
  representativeInvolvement: string;
  sourceUrl: string;
};

export type IndustryCategory = {
  id: string;
  title: string;
  description: string;
  roles: IndustryRoleId[];
};

export type IndustryStage = {
  id: string;
  number: string;
  title: string;
  side: "Project side" | "Delivery chain";
  summary: string;
  categories: IndustryCategory[];
};

export type IndustryCategoryView = IndustryCategory & {
  companies: IndustryCompany[];
};

export type IndustryStageView = Omit<IndustryStage, "categories"> & {
  categories: IndustryCategoryView[];
};

export const industryStages: IndustryStage[] = [
  {
    id: "develop-own",
    number: "01",
    title: "Develop & Own",
    side: "Project side",
    summary:
      "Developers, project owners, and utilities originate floating wind projects, hold seabed or lease positions, and procure the delivery chain.",
    categories: [
      {
        id: "developers-owners-utilities",
        title: "Developers / Project Owners / Utilities",
        description:
          "Owns or develops the project and normally acts as the client for the technical supply chain.",
        roles: ["developer-owner", "utility"],
      },
    ],
  },
  {
    id: "build-floating-system",
    number: "02",
    title: "Build The Floating System",
    side: "Delivery chain",
    summary:
      "Turbine OEMs and floating-platform specialists define the core generating system and its floating support structure.",
    categories: [
      {
        id: "wind-turbine-oem",
        title: "Wind Turbine OEM",
        description:
          "Supplies the offshore wind turbine and associated turbine technology for floating projects.",
        roles: ["turbine-oem"],
      },
      {
        id: "floating-foundation-platform",
        title: "Floating Foundation / Platform",
        description:
          "Provides semi-submersible, spar, barge, TLP, or other floating support concepts and platform engineering.",
        roles: ["floating-platform", "platform-engineering"],
      },
    ],
  },
  {
    id: "secure-connect",
    number: "03",
    title: "Secure & Connect",
    side: "Delivery chain",
    summary:
      "Station keeping, dynamic cables, export cables, and offshore electrical systems connect the floating plant to the wider power system.",
    categories: [
      {
        id: "mooring-anchoring",
        title: "Mooring & Anchoring",
        description:
          "Keeps the floating system on station through mooring lines, anchors, connectors, and integrity services.",
        roles: ["mooring-anchoring"],
      },
      {
        id: "dynamic-export-cable",
        title: "Dynamic / Export Cable",
        description:
          "Transfers power from moving floating assets through inter-array and export cable systems.",
        roles: ["cable-systems"],
      },
      {
        id: "offshore-electrical-substation",
        title: "Offshore Electrical / Substation",
        description:
          "Provides substations, HVDC/HVAC systems, grid connection equipment, and power-system integration.",
        roles: ["offshore-electrical", "grid-technology"],
      },
    ],
  },
  {
    id: "install-deliver",
    number: "04",
    title: "Install & Deliver",
    side: "Delivery chain",
    summary:
      "EPCI contractors, subsea specialists, and marine installation fleets assemble, tow, hook up, cable, and deliver offshore systems.",
    categories: [
      {
        id: "epci-subsea-engineering",
        title: "EPCI / Subsea Engineering",
        description:
          "Packages engineering, procurement, construction, installation, and subsea delivery work.",
        roles: ["epci-subsea"],
      },
      {
        id: "marine-installation-vessels",
        title: "Marine Installation / Vessels",
        description:
          "Executes heavy lift, towing, cable installation, mooring installation, and offshore construction campaigns.",
        roles: ["marine-installation"],
      },
    ],
  },
  {
    id: "enable-assure",
    number: "05",
    title: "Enable & Assure",
    side: "Delivery chain",
    summary:
      "Grid, certification, assurance, engineering, and simulation organisations reduce technical risk and support safe operation.",
    categories: [
      {
        id: "grid-technology",
        title: "Grid Technology",
        description:
          "Supports offshore transmission, power conversion, and grid integration for large floating wind systems.",
        roles: ["grid-technology"],
      },
      {
        id: "certification-assurance",
        title: "Certification / Assurance",
        description:
          "Provides classification, certification, verification, and technical assurance for floating assets and marine systems.",
        roles: ["certification-assurance"],
      },
      {
        id: "engineering-simulation-software",
        title: "Engineering / Simulation / Software",
        description:
          "Supports design, coupled analysis, geotechnics, metocean, dynamic modelling, and project engineering.",
        roles: ["engineering-consulting", "simulation-software"],
      },
    ],
  },
];

export const industryCompanies: IndustryCompany[] = [
  {
    id: "equinor",
    name: "Equinor",
    countryRegion: "Norway / Global",
    companyType: "Developer and energy company",
    roles: ["developer-owner"],
    description:
      "Developer and operator of Hywind floating wind projects, including Hywind Scotland and Hywind Tampen.",
    website: "https://www.equinor.com/",
    representativeInvolvement: "Hywind floating wind projects",
    sourceUrl: "https://www.equinor.com/energy/floating-wind",
  },
  {
    id: "rwe",
    name: "RWE",
    countryRegion: "Germany / Europe",
    companyType: "Developer and utility",
    roles: ["developer-owner", "utility"],
    description:
      "Major offshore wind developer with floating wind lease and demonstration activity in Europe and Asia-Pacific.",
    website: "https://www.rwe.com/",
    representativeInvolvement: "Floating offshore wind development portfolio",
    sourceUrl: "https://www.rwe.com/en/the-group/countries-and-locations/offshore-wind/",
  },
  {
    id: "edf-renewables",
    name: "EDF Renewables",
    countryRegion: "France / Global",
    companyType: "Developer and utility affiliate",
    roles: ["developer-owner", "utility"],
    description:
      "Renewables developer involved in floating wind projects and tenders through EDF Group activities.",
    website: "https://www.edf-re.com/",
    representativeInvolvement: "Provence Grand Large floating wind project",
    sourceUrl: "https://www.edf-renewables.com/en/project/provence-grand-large/",
  },
  {
    id: "ocean-winds",
    name: "Ocean Winds",
    countryRegion: "Spain / France / Global",
    companyType: "Offshore wind developer",
    roles: ["developer-owner"],
    description:
      "Offshore wind developer active in floating wind through projects such as WindFloat Atlantic and Eoliennes Flottantes du Golfe du Lion.",
    website: "https://www.oceanwinds.com/",
    representativeInvolvement: "WindFloat Atlantic and EFGL",
    sourceUrl: "https://www.oceanwinds.com/projects/windfloat-atlantic/",
  },
  {
    id: "iberdrola-scottishpower",
    name: "Iberdrola / ScottishPower",
    countryRegion: "Spain / United Kingdom",
    companyType: "Developer and utility",
    roles: ["developer-owner", "utility"],
    description:
      "Utility group developing offshore wind, including floating wind opportunity areas through ScottishPower Renewables.",
    website: "https://www.iberdrola.com/",
    representativeInvolvement: "Floating offshore wind development activity",
    sourceUrl: "https://www.scottishpowerrenewables.com/",
  },
  {
    id: "cip",
    name: "Copenhagen Infrastructure Partners",
    countryRegion: "Denmark / Global",
    companyType: "Infrastructure investor and developer",
    roles: ["developer-owner"],
    description:
      "Infrastructure fund manager and developer backing large offshore wind and floating wind projects.",
    website: "https://www.cip.com/",
    representativeInvolvement: "Floating offshore wind development investments",
    sourceUrl: "https://www.cip.com/",
  },
  {
    id: "totalenergies",
    name: "TotalEnergies",
    countryRegion: "France / Global",
    companyType: "Developer and energy company",
    roles: ["developer-owner"],
    description:
      "Energy company developing floating offshore wind projects and partnerships in Europe and Asia-Pacific.",
    website: "https://totalenergies.com/",
    representativeInvolvement: "Eolmed and floating wind partnerships",
    sourceUrl:
      "https://totalenergies.com/projects/renewables-electricity/eolmed-floating-offshore-wind-farm-project",
  },
  {
    id: "shell",
    name: "Shell",
    countryRegion: "United Kingdom / Global",
    companyType: "Developer and energy company",
    roles: ["developer-owner"],
    description:
      "Energy company with offshore wind development and floating wind demonstration involvement.",
    website: "https://www.shell.com/",
    representativeInvolvement: "Floating wind development and demonstration activity",
    sourceUrl: "https://www.shell.com/energy-and-innovation/new-energies/wind.html",
  },
  {
    id: "mainstream-renewable-power",
    name: "Mainstream Renewable Power",
    countryRegion: "Ireland / Global",
    companyType: "Renewables developer",
    roles: ["developer-owner"],
    description:
      "Renewables developer active in offshore wind partnerships, including floating wind development markets.",
    website: "https://www.mainstreamrp.com/",
    representativeInvolvement: "Floating offshore wind development partnerships",
    sourceUrl: "https://www.mainstreamrp.com/",
  },
  {
    id: "corio-generation",
    name: "Corio Generation",
    countryRegion: "United Kingdom / Global",
    companyType: "Offshore wind developer",
    roles: ["developer-owner"],
    description:
      "Offshore wind developer with fixed and floating project interests across global markets.",
    website: "https://www.coriogeneration.com/",
    representativeInvolvement: "Global offshore wind development portfolio",
    sourceUrl: "https://www.coriogeneration.com/",
  },
  {
    id: "vestas",
    name: "Vestas",
    countryRegion: "Denmark / Global",
    companyType: "Wind turbine OEM",
    roles: ["turbine-oem"],
    description:
      "Offshore wind turbine supplier whose turbines have been selected for floating wind projects.",
    website: "https://www.vestas.com/",
    representativeInvolvement: "Turbines for floating wind arrays",
    sourceUrl: "https://www.vestas.com/en/products/offshore",
  },
  {
    id: "siemens-gamesa",
    name: "Siemens Gamesa",
    countryRegion: "Spain / Germany / Global",
    companyType: "Wind turbine OEM",
    roles: ["turbine-oem"],
    description:
      "Offshore wind turbine OEM supplying large offshore turbines for commercial-scale projects.",
    website: "https://www.siemensgamesa.com/",
    representativeInvolvement: "Offshore turbine technology for floating-capable projects",
    sourceUrl: "https://www.siemensgamesa.com/products-and-services/offshore",
  },
  {
    id: "ge-vernova",
    name: "GE Vernova",
    countryRegion: "United States / Global",
    companyType: "Wind turbine and grid technology company",
    roles: ["turbine-oem", "grid-technology"],
    description:
      "Supplies offshore wind turbine technology and grid systems relevant to offshore wind integration.",
    website: "https://www.gevernova.com/",
    representativeInvolvement: "Haliade-X offshore turbine and grid systems",
    sourceUrl: "https://www.gevernova.com/wind-power/offshore-wind",
  },
  {
    id: "mingyang",
    name: "Mingyang Smart Energy",
    countryRegion: "China / Global",
    companyType: "Wind turbine OEM",
    roles: ["turbine-oem", "floating-platform"],
    description:
      "Wind turbine OEM and floating wind technology developer involved in Chinese floating wind demonstrations.",
    website: "https://www.myse.com.cn/",
    representativeInvolvement: "Floating offshore wind turbine demonstrations",
    sourceUrl: "https://www.myse.com.cn/en/",
  },
  {
    id: "principle-power",
    name: "Principle Power",
    countryRegion: "United States / Portugal / Global",
    companyType: "Floating platform technology company",
    roles: ["floating-platform", "platform-engineering"],
    description:
      "Developer of the WindFloat semi-submersible floating foundation technology.",
    website: "https://www.principlepower.com/",
    representativeInvolvement: "WindFloat platform",
    sourceUrl: "https://www.principlepower.com/windfloat",
  },
  {
    id: "bw-ideol",
    name: "BW Ideol",
    countryRegion: "France / Norway / Global",
    companyType: "Floating platform technology company",
    roles: ["floating-platform", "platform-engineering"],
    description:
      "Floating wind technology company commercialising the Damping Pool barge foundation concept.",
    website: "https://www.bw-ideol.com/",
    representativeInvolvement: "Damping Pool floating foundation",
    sourceUrl: "https://www.bw-ideol.com/en/technology",
  },
  {
    id: "saitec-offshore",
    name: "Saitec Offshore Technologies",
    countryRegion: "Spain / Europe",
    companyType: "Floating platform technology company",
    roles: ["floating-platform", "platform-engineering"],
    description:
      "Developer of the SATH concrete floating platform technology for offshore wind.",
    website: "https://saitec-offshore.com/",
    representativeInvolvement: "SATH floating platform",
    sourceUrl: "https://saitec-offshore.com/sath-technology/",
  },
  {
    id: "stiesdal-offshore",
    name: "Stiesdal Offshore",
    countryRegion: "Denmark / Europe",
    companyType: "Floating platform technology company",
    roles: ["floating-platform", "platform-engineering"],
    description:
      "Developer of the Tetra floating foundation concept for industrialised offshore wind deployment.",
    website: "https://www.stiesdal.com/offshore/",
    representativeInvolvement: "Tetra floating foundation",
    sourceUrl: "https://www.stiesdal.com/offshore/",
  },
  {
    id: "ocergy",
    name: "Ocergy",
    countryRegion: "United States / France",
    companyType: "Floating platform technology company",
    roles: ["floating-platform", "platform-engineering"],
    description:
      "Developer of floating wind platform and floating environmental monitoring technologies.",
    website: "https://www.ocergy.com/",
    representativeInvolvement: "Ocg-Wind floating platform",
    sourceUrl: "https://www.ocergy.com/",
  },
  {
    id: "technip-energies",
    name: "Technip Energies",
    countryRegion: "France / Global",
    companyType: "Engineering and floating platform company",
    roles: ["floating-platform", "platform-engineering", "engineering-consulting"],
    description:
      "Engineering company developing floating offshore wind platform technology and project engineering services.",
    website: "https://www.ten.com/",
    representativeInvolvement: "INOFLOAT floating wind platform technology",
    sourceUrl: "https://www.ten.com/en/markets/energy-transition/offshore-wind",
  },
  {
    id: "sbm-offshore",
    name: "SBM Offshore",
    countryRegion: "Netherlands / Global",
    companyType: "Floating systems engineering company",
    roles: ["floating-platform", "platform-engineering"],
    description:
      "Floating systems specialist applying offshore floating engineering to floating wind technology.",
    website: "https://www.sbmoffshore.com/",
    representativeInvolvement: "Floating wind foundation concepts and offshore floating systems",
    sourceUrl: "https://www.sbmoffshore.com/what-we-do/renewables/",
  },
  {
    id: "delmar-systems",
    name: "Delmar Systems",
    countryRegion: "United States / Global",
    companyType: "Mooring and anchoring specialist",
    roles: ["mooring-anchoring"],
    description:
      "Mooring and anchoring specialist providing offshore station-keeping systems and installation support.",
    website: "https://www.delmarsystems.com/",
    representativeInvolvement: "Offshore mooring systems and installation services",
    sourceUrl: "https://www.delmarsystems.com/renewables/",
  },
  {
    id: "vryhof",
    name: "Vryhof",
    countryRegion: "Netherlands / Global",
    companyType: "Anchoring and mooring specialist",
    roles: ["mooring-anchoring"],
    description:
      "Anchor and mooring systems specialist serving offshore energy and floating renewables markets.",
    website: "https://www.vryhof.com/",
    representativeInvolvement: "Anchoring and mooring systems",
    sourceUrl: "https://www.vryhof.com/",
  },
  {
    id: "acteon",
    name: "Acteon",
    countryRegion: "United Kingdom / Global",
    companyType: "Marine energy infrastructure specialist",
    roles: ["mooring-anchoring", "epci-subsea", "marine-installation"],
    description:
      "Provides subsea services, moorings, foundations, and marine infrastructure support for offshore renewables.",
    website: "https://acteon.com/",
    representativeInvolvement: "Offshore renewables mooring and subsea services",
    sourceUrl: "https://acteon.com/markets/offshore-renewables/",
  },
  {
    id: "bridon-bekaert",
    name: "Bridon-Bekaert",
    countryRegion: "United Kingdom / Belgium / Global",
    companyType: "Steel wire rope and mooring supplier",
    roles: ["mooring-anchoring"],
    description:
      "Supplies steel wire rope and mooring components used in offshore energy and floating applications.",
    website: "https://www.bridon-bekaert.com/",
    representativeInvolvement: "Offshore mooring rope and wire products",
    sourceUrl: "https://www.bridon-bekaert.com/en-gb/markets/oil-gas-offshore-energy",
  },
  {
    id: "vicinay-marine",
    name: "Vicinay Marine",
    countryRegion: "Spain / Global",
    companyType: "Mooring chain supplier",
    roles: ["mooring-anchoring"],
    description:
      "Supplies mooring chain and accessories for offshore floating systems.",
    website: "https://www.vicinaymarine.com/",
    representativeInvolvement: "Offshore mooring chain systems",
    sourceUrl: "https://www.vicinaymarine.com/",
  },
  {
    id: "prysmian",
    name: "Prysmian",
    countryRegion: "Italy / Global",
    companyType: "Cable systems supplier",
    roles: ["cable-systems"],
    description:
      "Supplies submarine power cable systems for offshore wind export and inter-array connections.",
    website: "https://www.prysmian.com/",
    representativeInvolvement: "Submarine power cable systems for offshore wind",
    sourceUrl: "https://www.prysmian.com/en/markets/energy/submarine-power-cables-systems",
  },
  {
    id: "nexans",
    name: "Nexans",
    countryRegion: "France / Global",
    companyType: "Cable systems supplier",
    roles: ["cable-systems"],
    description:
      "Supplies submarine and offshore wind cable systems, including dynamic cable technology development.",
    website: "https://www.nexans.com/",
    representativeInvolvement: "Offshore wind submarine cable systems",
    sourceUrl: "https://www.nexans.com/business/energy-transition/offshore-wind/",
  },
  {
    id: "jdr-cables",
    name: "JDR Cable Systems",
    countryRegion: "United Kingdom / Global",
    companyType: "Subsea cable and umbilical supplier",
    roles: ["cable-systems"],
    description:
      "Supplies subsea power cables and umbilicals for offshore wind and floating offshore applications.",
    website: "https://www.jdrcables.com/",
    representativeInvolvement: "Inter-array and subsea power cable systems",
    sourceUrl: "https://www.jdrcables.com/markets/offshore-wind/",
  },
  {
    id: "nkt",
    name: "NKT",
    countryRegion: "Denmark / Global",
    companyType: "Power cable supplier",
    roles: ["cable-systems"],
    description:
      "Supplies high-voltage power cable systems for offshore wind and grid connections.",
    website: "https://www.nkt.com/",
    representativeInvolvement: "Offshore wind power cable systems",
    sourceUrl: "https://www.nkt.com/solutions/high-voltage-cable-solutions/offshore-wind",
  },
  {
    id: "hitachi-energy",
    name: "Hitachi Energy",
    countryRegion: "Switzerland / Global",
    companyType: "Grid technology supplier",
    roles: ["grid-technology", "offshore-electrical"],
    description:
      "Supplies grid connection, HVDC, power conversion, and grid integration technology for offshore energy systems.",
    website: "https://www.hitachienergy.com/",
    representativeInvolvement: "HVDC and offshore grid connection systems",
    sourceUrl: "https://www.hitachienergy.com/offering/product-and-system/hvdc",
  },
  {
    id: "siemens-energy",
    name: "Siemens Energy",
    countryRegion: "Germany / Global",
    companyType: "Grid and offshore electrical supplier",
    roles: ["grid-technology", "offshore-electrical"],
    description:
      "Provides offshore grid connection, substations, and transmission technologies for offshore wind.",
    website: "https://www.siemens-energy.com/",
    representativeInvolvement: "Offshore grid connection and transmission systems",
    sourceUrl:
      "https://www.siemens-energy.com/global/en/home/products-services/solutions-usecase/offshore-wind.html",
  },
  {
    id: "subsea7-seaway7",
    name: "Subsea7 / Seaway7",
    countryRegion: "United Kingdom / Global",
    companyType: "EPCI and offshore installation contractor",
    roles: ["epci-subsea", "marine-installation"],
    description:
      "Provides offshore wind EPCI, subsea, foundation, cable, and installation services through Seaway7 and Subsea7 capabilities.",
    website: "https://www.subsea7.com/",
    representativeInvolvement: "Offshore wind EPCI and installation services",
    sourceUrl: "https://www.seaway7.com/what-we-do/floating-wind/",
  },
  {
    id: "saipem",
    name: "Saipem",
    countryRegion: "Italy / Global",
    companyType: "EPCI and marine installation contractor",
    roles: ["epci-subsea", "marine-installation"],
    description:
      "Offshore EPCI contractor with floating wind foundation and marine installation capabilities.",
    website: "https://www.saipem.com/",
    representativeInvolvement: "Floating wind EPCI and offshore construction capabilities",
    sourceUrl: "https://www.saipem.com/en/solutions/energy-carriers/offshore-wind",
  },
  {
    id: "boskalis",
    name: "Boskalis",
    countryRegion: "Netherlands / Global",
    companyType: "Marine contractor",
    roles: ["marine-installation", "epci-subsea"],
    description:
      "Marine contractor providing offshore wind transport, installation, cable, and seabed intervention services.",
    website: "https://boskalis.com/",
    representativeInvolvement: "Offshore wind marine installation services",
    sourceUrl: "https://boskalis.com/markets/offshore-energy/offshore-wind",
  },
  {
    id: "deme",
    name: "DEME",
    countryRegion: "Belgium / Global",
    companyType: "Offshore and marine contractor",
    roles: ["marine-installation", "epci-subsea"],
    description:
      "Offshore contractor providing foundation, cable, and marine installation services for offshore wind.",
    website: "https://www.deme-group.com/",
    representativeInvolvement: "Offshore wind installation and cable works",
    sourceUrl: "https://www.deme-group.com/solutions/offshore-energy/offshore-wind",
  },
  {
    id: "jan-de-nul",
    name: "Jan De Nul",
    countryRegion: "Belgium / Global",
    companyType: "Offshore and marine contractor",
    roles: ["marine-installation", "epci-subsea"],
    description:
      "Marine contractor providing offshore wind installation, cable-laying, and subsea construction services.",
    website: "https://www.jandenul.com/",
    representativeInvolvement: "Offshore wind installation and cable-laying vessels",
    sourceUrl: "https://www.jandenul.com/activities/offshore/offshore-renewables",
  },
  {
    id: "heerema",
    name: "Heerema Marine Contractors",
    countryRegion: "Netherlands / Global",
    companyType: "Heavy-lift marine contractor",
    roles: ["marine-installation"],
    description:
      "Heavy-lift marine contractor supporting offshore installation campaigns and floating offshore infrastructure.",
    website: "https://www.heerema.com/",
    representativeInvolvement: "Offshore heavy-lift and installation vessels",
    sourceUrl: "https://www.heerema.com/markets/offshore-wind",
  },
  {
    id: "dnv",
    name: "DNV",
    countryRegion: "Norway / Global",
    companyType: "Certification and assurance body",
    roles: ["certification-assurance", "engineering-consulting"],
    description:
      "Provides floating wind standards, certification, verification, and technical advisory services.",
    website: "https://www.dnv.com/",
    representativeInvolvement: "Floating wind certification and recommended practices",
    sourceUrl: "https://www.dnv.com/energy/renewables/offshore-wind/",
  },
  {
    id: "abs",
    name: "ABS",
    countryRegion: "United States / Global",
    companyType: "Classification and assurance body",
    roles: ["certification-assurance"],
    description:
      "Classification society providing guidance and approval services for floating offshore wind systems.",
    website: "https://ww2.eagle.org/",
    representativeInvolvement: "Floating offshore wind class and certification services",
    sourceUrl: "https://ww2.eagle.org/en/Products-and-Services/offshore-renewables.html",
  },
  {
    id: "bureau-veritas",
    name: "Bureau Veritas",
    countryRegion: "France / Global",
    companyType: "Certification and classification body",
    roles: ["certification-assurance"],
    description:
      "Provides certification, classification, and risk services for offshore renewable energy assets.",
    website: "https://group.bureauveritas.com/",
    representativeInvolvement: "Offshore wind certification and floating unit classification",
    sourceUrl: "https://marine-offshore.bureauveritas.com/renewable-energy/offshore-wind",
  },
  {
    id: "lloyds-register",
    name: "Lloyd's Register",
    countryRegion: "United Kingdom / Global",
    companyType: "Classification and assurance body",
    roles: ["certification-assurance"],
    description:
      "Classification and assurance organisation supporting offshore renewables, floating assets, and marine systems.",
    website: "https://www.lr.org/",
    representativeInvolvement: "Offshore renewables assurance and classification",
    sourceUrl: "https://www.lr.org/en/renewable-energy/offshore-wind/",
  },
  {
    id: "ramboll",
    name: "Ramboll",
    countryRegion: "Denmark / Global",
    companyType: "Engineering consultancy",
    roles: ["engineering-consulting"],
    description:
      "Engineering consultancy providing offshore wind design, advisory, and floating wind engineering services.",
    website: "https://www.ramboll.com/",
    representativeInvolvement: "Floating offshore wind engineering and advisory",
    sourceUrl: "https://www.ramboll.com/energy/offshore-wind",
  },
  {
    id: "wood-thilsted",
    name: "Wood Thilsted",
    countryRegion: "United Kingdom / Denmark / Global",
    companyType: "Offshore wind engineering consultancy",
    roles: ["engineering-consulting"],
    description:
      "Offshore wind engineering consultancy supporting fixed and floating foundation, cable, and geotechnical design.",
    website: "https://woodthilsted.com/",
    representativeInvolvement: "Floating wind foundation and offshore geotechnical engineering",
    sourceUrl: "https://woodthilsted.com/markets/offshore-wind/",
  },
  {
    id: "cowi",
    name: "COWI",
    countryRegion: "Denmark / Global",
    companyType: "Engineering consultancy",
    roles: ["engineering-consulting"],
    description:
      "Engineering consultancy providing offshore wind design and advisory services across foundations, electrical systems, and infrastructure.",
    website: "https://www.cowi.com/",
    representativeInvolvement: "Offshore wind engineering and design services",
    sourceUrl: "https://www.cowi.com/solutions/energy/offshore-wind",
  },
  {
    id: "orcina",
    name: "Orcina",
    countryRegion: "United Kingdom / Global",
    companyType: "Engineering software company",
    roles: ["simulation-software"],
    description:
      "Developer of OrcaFlex, used for dynamic analysis of moorings, risers, cables, and floating offshore systems.",
    website: "https://www.orcina.com/",
    representativeInvolvement: "OrcaFlex dynamic analysis software",
    sourceUrl: "https://www.orcina.com/orcaflex/",
  },
  {
    id: "nrel-openfast",
    name: "NREL OpenFAST",
    countryRegion: "United States / Global",
    companyType: "Public research software project",
    roles: ["simulation-software"],
    description:
      "Open-source wind turbine simulation tool used for coupled aero-hydro-servo-elastic modelling of floating wind turbines.",
    website: "https://openfast.readthedocs.io/",
    representativeInvolvement: "OpenFAST floating wind simulation framework",
    sourceUrl: "https://openfast.readthedocs.io/",
  },
];

export const industryCompanyCount = industryCompanies.length;

const allRoleIds = new Set(
  industryStages.flatMap((stage) =>
    stage.categories.flatMap((category) => category.roles),
  ),
);

export function getIndustryMap(): IndustryStageView[] {
  validateIndustryData();

  return industryStages.map((stage) => ({
    ...stage,
    categories: stage.categories.map((category) => ({
      ...category,
      companies: industryCompanies.filter((company) =>
        company.roles.some((role) => category.roles.includes(role)),
      ),
    })),
  }));
}

export function getIndustryCompanies(): IndustryCompany[] {
  validateIndustryData();
  return industryCompanies;
}

export function validateIndustryData() {
  const companyIds = new Set<string>();

  for (const stage of industryStages) {
    requiredString(stage.id, "stage.id");
    requiredString(stage.number, `${stage.id}.number`);
    requiredString(stage.title, `${stage.id}.title`);
    requiredString(stage.summary, `${stage.id}.summary`);

    for (const category of stage.categories) {
      requiredString(category.id, `${stage.id}.category.id`);
      requiredString(category.title, `${category.id}.title`);
      requiredString(category.description, `${category.id}.description`);

      if (category.roles.length === 0) {
        throw new Error(`Industry category ${category.id} must declare at least one role.`);
      }
    }
  }

  for (const company of industryCompanies) {
    requiredString(company.id, "company.id");
    requiredString(company.name, `${company.id}.name`);
    requiredString(company.countryRegion, `${company.id}.countryRegion`);
    requiredString(company.companyType, `${company.id}.companyType`);
    requiredString(company.description, `${company.id}.description`);
    requiredUrl(company.website, `${company.id}.website`);
    requiredString(company.representativeInvolvement, `${company.id}.representativeInvolvement`);
    requiredUrl(company.sourceUrl, `${company.id}.sourceUrl`);

    if (companyIds.has(company.id)) {
      throw new Error(`Duplicate industry company id: ${company.id}`);
    }
    companyIds.add(company.id);

    if (company.roles.length === 0) {
      throw new Error(`Industry company ${company.id} must declare at least one role.`);
    }

    for (const role of company.roles) {
      if (!allRoleIds.has(role)) {
        throw new Error(`Industry company ${company.id} references unknown role: ${role}`);
      }
    }
  }
}

function requiredString(value: string, label: string) {
  if (!value || value.trim().length === 0) {
    throw new Error(`Missing industry field: ${label}`);
  }
}

function requiredUrl(value: string, label: string) {
  requiredString(value, label);

  try {
    new URL(value);
  } catch {
    throw new Error(`Invalid industry URL for ${label}: ${value}`);
  }
}
