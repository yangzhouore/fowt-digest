import { subscriptionCompanies } from "../../subscribe/preferences";
import { LocalizedCopy } from "../i18n/localized-copy";
import { PreferenceForm } from "./preference-form";

export default function SubscribePage() {
  return (
    <>
      <section className="intro">
        <h1><LocalizedCopy en="Stay informed on floating wind" zh="订阅浮式风电动态" /></h1>
        <p><LocalizedCopy en="Choose what you’d like to receive by email each week." zh="选择您希望每周通过电子邮件接收的内容。" /></p>
      </section>
      <PreferenceForm companies={subscriptionCompanies()} />
    </>
  );
}
