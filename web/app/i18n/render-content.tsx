import { cloneElement, isValidElement, type ReactNode } from "react";
import type { Language } from "./translations";
import chineseText from "./content-zh.json";
import interfaceText from "./interface-zh.json";

const dictionary: Readonly<Record<string, string>> = { ...chineseText, ...interfaceText };
const sourceActions = new Set(["Open DOI", "Open source"]);
const originalContentClasses = new Set([
  "homepage-paper-list", "engineering-highlight-list", "paper-list", "engineering-list",
  "context-stored-excerpt", "context-sr-only",
]);

export function isOriginalSourceLink(href: string | undefined, children: ReactNode): boolean {
  return Boolean(href && /^https?:\/\//.test(href)
    && !(typeof children === "string" && sourceActions.has(children.trim())));
}

/** Stored presentation translations only. Values, records, links and identifiers stay unchanged. */
export function translateContentText(text: string, language: Language): string {
  if (language !== "zh") return text;
  const key = text.trim().replace(/\s+/g, " ");
  const translated = dictionary[key];
  if (!translated) return text;
  return `${text.match(/^\s*/)?.[0] ?? ""}${translated}${text.match(/\s*$/)?.[0] ?? ""}`;
}

type TextElementProps = {
  children?: ReactNode;
  className?: string;
  translate?: string;
  href?: string;
  lang?: string;
  "aria-label"?: string;
  placeholder?: string;
};

/** Render bilingual copy without mutating the DOM or rewriting authoritative JSON. */
export function localizeContent(content: ReactNode, language: Language): ReactNode {
  if (Array.isArray(content)) return content.map((child, index) => {
    const rendered = localizeContent(child, language);
    return isValidElement(rendered) && rendered.key === null
      ? cloneElement(rendered, { key: `content-${index}` }) : rendered;
  });
  const render = (child: ReactNode): ReactNode => {
    if (typeof child === "string") return translateContentText(child, language);
    if (!isValidElement<TextElementProps>(child)) return child;
    const props = child.props;
    if (props.translate === "no" || (typeof child.type === "string" && ["script", "style", "svg"].includes(child.type))
      || props.className?.split(/\s+/).some((name) => originalContentClasses.has(name))
      || isOriginalSourceLink(props.href, props.children)) return child;
    const attributes: Partial<TextElementProps> = {};
    if (props["aria-label"]) attributes["aria-label"] = translateContentText(props["aria-label"], language);
    if (props.placeholder) attributes.placeholder = translateContentText(props.placeholder, language);
    if (props.lang === "en") attributes.lang = "zh-CN";
    return props.children === undefined
      ? cloneElement(child, attributes)
      : cloneElement(child, attributes, localizeContent(props.children, language));
  };
  return render(content);
}
