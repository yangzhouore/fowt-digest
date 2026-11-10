import { cloneElement, isValidElement, type ReactNode } from "react";
import { LocalizedCopy } from "./localized-copy";
import { LocalizedElement } from "./localized-element";
import { isOriginalSourceLink, translateContentText } from "./render-content";

type ContentProps = {
  children?: ReactNode; className?: string; translate?: string; href?: string;
  lang?: string; "aria-label"?: string; placeholder?: string;
};
const originalClasses = new Set([
  "homepage-paper-list", "engineering-highlight-list", "paper-list", "engineering-list",
  "context-stored-excerpt", "context-sr-only",
]);

/** Localize at the server component's own render boundary, before RSC streaming. */
export function localizeServerContent(content: ReactNode): ReactNode {
  if (Array.isArray(content)) return content.map((child, index) => {
    const rendered = localizeServerContent(child);
    return isValidElement(rendered) && rendered.key === null
      ? cloneElement(rendered, { key: `content-${index}` }) : rendered;
  });
  if (typeof content === "string") {
    const chinese = translateContentText(content, "zh");
    return chinese === content ? content : <LocalizedCopy en={content} zh={chinese} />;
  }
  if (!isValidElement<ContentProps>(content)) return content;
  const props = content.props;
  if (props.translate === "no" || (typeof content.type === "string" && ["script", "style", "svg"].includes(content.type))
    || props.className?.split(/\s+/).some((name) => originalClasses.has(name))
    || isOriginalSourceLink(props.href, props.children)) return content;
  const children = props.children === undefined ? undefined : localizeServerContent(props.children);
  if (typeof content.type === "string" && (props["aria-label"] || props.placeholder || props.lang === "en")) {
    const { children: unused, ...attributes } = props;
    void unused;
    return <LocalizedElement key={content.key} tag={content.type} attributes={attributes}>{children}</LocalizedElement>;
  }
  return children === undefined ? content : cloneElement(content, undefined, children);
}
