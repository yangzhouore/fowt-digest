"use client";

import { type FormEvent, useState } from "react";
import { normalizeSearchText } from "../../data/global-search";
import { productTitles, type Preferences } from "../../subscribe/preferences";
import { useLanguage } from "../i18n/language-context";
import { callSubscribe, messages } from "./client";
import styles from "./subscribe.module.css";

export type CompanyOption = { id: string; name: string };

const descriptions = {
  news: { en: "What happened this week?", zh: "本周发生了什么？" },
  research: { en: "What should I read this week?", zh: "本周值得阅读什么？" },
  company: { en: "What happened at the companies I follow?", zh: "我关注的企业有哪些动态？" },
};
const products = ["news", "research", "company"] as const;

export function PreferenceForm({ companies, initial, token }: {
  companies: readonly CompanyOption[]; initial?: Preferences; token?: string;
}) {
  const { language } = useLanguage();
  const zh = language === "zh";
  const [options, setOptions] = useState({ news: initial?.news ?? false, research: initial?.research ?? false, company: !!initial?.companyIds.length });
  const [selected, setSelected] = useState(initial?.companyIds ?? []);
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");
  const search = normalizeSearchText(query);
  const available = companies.filter(({ id, name }) => !selected.includes(id) &&
    (normalizeSearchText(name).includes(search) || id.includes(search)));

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!options.news && !options.research && !options.company) {
      setStatus("selection");
      return;
    }
    if (options.company && selected.length === 0) {
      setStatus("companyRequired");
      return;
    }
    const data = new FormData(event.currentTarget);
    setBusy(true);
    const result = await callSubscribe({ ...options, companies: options.company ? selected : [], locale: language,
      ...(token ? { action: "update", token } : { action: "request", email: data.get("email") }) });
    setStatus(result.code);
    setBusy(false);
  }

  if (status === "requested") return <p role="status">{messages.requested[language]}</p>;

  return (
    <form method="post" action="/api/subscribe" className={styles.form} onSubmit={submit}>
      {!token && <label>{zh ? "电子邮件地址" : "Email address"}
        <input type="email" name="email" autoComplete="email" maxLength={254} required />
      </label>}
      <fieldset>
        <legend>{zh ? "您想接收哪些内容？" : "What would you like to receive?"}</legend>
        {products.map((product) => (
          <label className={styles.product} key={product}>
            <input type="checkbox" checked={options[product]}
              onChange={(event) => setOptions({ ...options, [product]: event.target.checked })} />
            <span>{productTitles[product][language]}<small>{descriptions[product][language]}</small></span>
          </label>
        ))}
      </fieldset>
      {options.company && (
        <fieldset>
          <legend>{zh ? "企业" : "Companies"}</legend>
          {selected.length > 0 && <ul className={styles.selected} aria-label={zh ? "已选企业" : "Selected companies"}>
            {companies.filter(({ id }) => selected.includes(id)).map(({ id, name }) => (
              <li key={id}><button type="button" aria-label={zh ? `移除 ${name}` : `Remove ${name}`}
                onClick={() => setSelected(selected.filter((value) => value !== id))}>{name} ×</button></li>
            ))}
          </ul>}
          <label>{zh ? "搜索企业" : "Search companies"}
            <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} />
          </label>
          <ul className={styles.options} aria-label={zh ? "可选企业" : "Available companies"}>
            {available.map(({ id, name }) => (
              <li key={id}><button type="button" onClick={() => setSelected([...selected, id])}>{name}</button></li>
            ))}
          </ul>
          {!available.length && <p>{zh ? "没有可添加的匹配企业。" : "No matching companies to add."}</p>}
        </fieldset>
      )}
      <button className={styles.action} type="submit" disabled={busy}>{token
        ? zh ? "保存偏好" : "Save preferences"
        : zh ? "订阅" : "Subscribe"}</button>
      {status in messages && <p role={status === "saved" ? "status" : "alert"}>{messages[status as keyof typeof messages][language]}</p>}
    </form>
  );
}
