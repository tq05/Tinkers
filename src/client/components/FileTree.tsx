import { useState } from "react";
import type { FileNode } from "../mock/types";
import "./components.css";

export interface FileTreeProps {
  nodes: FileNode[];
  selectedPath?: string;
  onSelect?: (path: string) => void;
}

const CHANGE_COLOR: Record<NonNullable<FileNode["change"]>, string> = {
  added: "var(--positive)",
  modified: "var(--warning)",
  referenced: "var(--primary)",
};

const CHANGE_LABEL: Record<NonNullable<FileNode["change"]>, string> = {
  added: "Added",
  modified: "Modified",
  referenced: "Referenced",
};

function fileEmoji(name: string): string {
  if (/\.(ts|tsx)$/.test(name)) return "🟦";
  if (/\.(js|jsx|mjs)$/.test(name)) return "🟨";
  if (/\.py$/.test(name)) return "🐍";
  if (/\.(css|scss)$/.test(name)) return "🎨";
  if (/\.(md|txt)$/.test(name)) return "📄";
  if (/\.json$/.test(name)) return "🔧";
  if (/\.(swift|kt)$/.test(name)) return "📱";
  return "📄";
}

function TreeRow({
  node,
  depth,
  selectedPath,
  onSelect,
}: {
  node: FileNode;
  depth: number;
  selectedPath?: string;
  onSelect?: (path: string) => void;
}) {
  const [open, setOpen] = useState(depth < 2);
  const isDir = node.type === "dir";
  const selected = node.path === selectedPath;

  return (
    <div>
      <div
        className={`tk-filetree__row${selected ? " tk-filetree__row--selected" : ""}`}
        style={{ paddingLeft: 8 + depth * 14 }}
        onClick={() => (isDir ? setOpen((o) => !o) : onSelect?.(node.path))}
        role={isDir ? "treeitem" : "button"}
        aria-expanded={isDir ? open : undefined}
      >
        <span className="tk-filetree__twisty">{isDir ? (open ? "▾" : "▸") : ""}</span>
        <span aria-hidden="true">{isDir ? (open ? "📂" : "📁") : fileEmoji(node.name)}</span>
        <span className="tk-filetree__name">{node.name}</span>
        {node.change && (
          <span
            className="tk-filetree__change"
            title={CHANGE_LABEL[node.change]}
            style={{ background: CHANGE_COLOR[node.change] }}
          />
        )}
      </div>
      {isDir && open && node.children && (
        <div role="group">
          {node.children.map((child) => (
            <TreeRow
              key={child.path}
              node={child}
              depth={depth + 1}
              selectedPath={selectedPath}
              onSelect={onSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function FileTree({ nodes, selectedPath, onSelect }: FileTreeProps) {
  return (
    <div className="tk-filetree" role="tree">
      {nodes.map((node) => (
        <TreeRow
          key={node.path}
          node={node}
          depth={0}
          selectedPath={selectedPath}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
}
