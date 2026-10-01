import { sourceMap, type SourceId } from "./data";

export function SourceRefs({ ids, label = "Sources" }: { ids: SourceId[]; label?: string }) {
  return (
    <span className="source-refs" aria-label={label}>
      {ids.map((id) => (
        <a
          key={id}
          href={sourceMap[id].url}
          target="_blank"
          rel="noopener noreferrer"
          data-event="source_click"
          data-source={id}
          aria-label={`Source ${id}: ${sourceMap[id].title} (opens in a new tab)`}
          title={sourceMap[id].title}
        >
          {id}
        </a>
      ))}
    </span>
  );
}
