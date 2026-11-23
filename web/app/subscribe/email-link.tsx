"use client";

import { useEffect, useRef, useState } from "react";
import type { Preferences } from "../../subscribe/preferences";
import { useLanguage } from "../i18n/language-context";
import { callSubscribe, messages, type ActionResult } from "./client";
import { PreferenceForm, type CompanyOption } from "./preference-form";
import styles from "./subscribe.module.css";

type EmailSession = { token: string; unsubscribe: boolean };

export function EmailLink({ mode, companies = [] }: { mode: "confirm" | "manage"; companies?: readonly CompanyOption[] }) {
  const { language } = useLanguage();
  const zh = language === "zh";
  const link = useRef<EmailSession | null>(null);
  const [state, setState] = useState<ActionResult & { session?: EmailSession }>({ code: "loading" });
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let generation = 0;
    function readLink() {
      const fragment = window.location.hash.slice(1);
      if (fragment || !link.current) {
        const unsubscribe = fragment.startsWith("unsubscribe.");
        link.current = { token: unsubscribe ? fragment.slice("unsubscribe.".length) : fragment, unsubscribe };
        if (fragment) window.history.replaceState(null, "", window.location.pathname);
      }
      const request = ++generation;
      const session = link.current;
      const { token } = session;
      const pending = token.length === (mode === "confirm" ? 43 : 117)
        ? mode === "confirm" ? Promise.resolve({ code: "ready" }) : callSubscribe({ action: "load", token })
        : Promise.resolve({ code: "invalidLink" });
      void pending.then((result) => { if (generation === request) setState({ ...result, session }); });
    }
    readLink();
    window.addEventListener("hashchange", readLink);
    return () => {
      generation++;
      window.removeEventListener("hashchange", readLink);
    };
  }, [mode]);

  async function act(action: "confirm" | "unsubscribe") {
    const token = state.session?.token;
    setBusy(true);
    const result = await callSubscribe({ action, token });
    setState((current) => current.session?.token === token
      ? { ...result, preferences: current.preferences, session: current.session } : current);
    setBusy(false);
  }

  function management(preferences: Preferences) {
    return (
      <>
        {state.session && !state.session.unsubscribe && <PreferenceForm key={state.session.token}
          companies={companies} initial={preferences} token={state.session.token} />}
        <section className={styles.unsubscribe}>
          <p>{zh ? "停止接收 Floating Wind Digest 的所有订阅邮件。" : "Stop receiving all subscription emails from Floating Wind Digest."}</p>
          <button type="button" className={styles.action} disabled={busy} onClick={() => act("unsubscribe")}>
            {zh ? "取消所有订阅" : "Unsubscribe from all emails"}
          </button>
        </section>
      </>
    );
  }

  return (
    <>
      <section className="intro">
        <h1>{mode === "confirm" ? zh ? "确认订阅" : "Confirm subscription" : zh ? "管理订阅偏好" : "Manage preferences"}</h1>
      </section>
      {state.code === "loading" && <p role="status">{zh ? "正在读取链接…" : "Checking your link…"}</p>}
      {mode === "confirm" && (state.code === "ready" || state.code === "unavailable") &&
        <button type="button" className={styles.action} disabled={busy} onClick={() => act("confirm")}>
          {zh ? "确认订阅" : "Confirm subscription"}
        </button>}
      {mode === "manage" && (state.code === "loaded" || state.code === "unavailable") && state.preferences && management(state.preferences)}
      {state.code in messages && <p role={["invalidLink", "unavailable"].includes(state.code) ? "alert" : "status"}>
        {messages[state.code as keyof typeof messages][language]}
      </p>}
      {state.code === "confirmed" && state.token &&
        <p><a href={`/subscribe/manage#${state.token}`}>{zh ? "管理订阅偏好" : "Manage preferences"}</a></p>}
    </>
  );
}
