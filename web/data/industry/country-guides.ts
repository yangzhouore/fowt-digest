import { germanyGuide } from "./germany-guide";
import { norwayGuide } from "./norway-guide";
import { chinaGuide } from "./china-guide";
import { countrySources } from "./country-guide-sources";
import { assertCountryGuides } from "./country-guide-validator";

export const countryGuides = [germanyGuide, norwayGuide, chinaGuide];
assertCountryGuides(countryGuides, countrySources);
export { countrySources };
