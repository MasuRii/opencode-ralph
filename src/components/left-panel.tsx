import { For, Show, createEffect } from "solid-js";
import type { ScrollBoxRenderable } from "@opentui/core";
import { useTheme } from "../context/ThemeContext";
import { taskStatusIndicators } from "./tui-theme";
import type { TaskStatus, UiTask } from "./tui-types";

export type LeftPanelProps = {
  tasks: UiTask[];
  selectedIndex: number;
  width: number;
  /** Panel height - used to trigger scroll recalculation on terminal resize */
  height: number;
};

function truncateText(text: string, maxWidth: number): string {
  if (text.length <= maxWidth) return text;
  if (maxWidth <= 3) return text.slice(0, maxWidth);
  return text.slice(0, maxWidth - 1) + "…";
}

function getStatusColor(status: TaskStatus, theme: ReturnType<typeof useTheme>["theme"]): string {
  const t = theme();
  switch (status) {
    case "done":
      return t.success;
    case "actionable":
      return t.success;
    case "pending":
    default:
      return t.textMuted;
  }
}

function TaskRow(props: {
  task: UiTask;
  isSelected: boolean;
  maxWidth: number;
}) {
  const { theme } = useTheme();
  const t = () => theme();

  const statusColor = () => getStatusColor(props.task.status, theme);
  const statusIndicator = () => taskStatusIndicators[props.task.status];

  const titleWidth = () => Math.max(10, props.maxWidth - props.task.id.length - 3);
  const truncatedTitle = () => truncateText(props.task.title, titleWidth());

  const titleColor = () => {
    if (props.task.status === "done") return t().textMuted;
    return props.isSelected ? t().primary : t().text;
  };

  const idColor = () => (props.task.status === "done" ? t().textMuted : t().textMuted);

  return (
    <box
      width="100%"
      flexDirection="row"
      paddingLeft={1}
      paddingRight={1}
      backgroundColor={props.isSelected ? t().backgroundElement : "transparent"}
    >
      <text fg={statusColor()}>{statusIndicator()}</text>
      <text fg={idColor()}> {props.task.id}</text>
      <text fg={titleColor()}> {truncatedTitle()}</text>
    </box>
  );
}

export function LeftPanel(props: LeftPanelProps) {
  const { theme } = useTheme();
  const t = () => theme();
  let scrollboxRef: ScrollBoxRenderable | undefined;

  const maxRowWidth = () => Math.max(20, props.width - 4);

  createEffect(() => {
    const selectedIndex = props.selectedIndex;
    const taskCount = props.tasks.length;
    // Access height to create reactive dependency - effect re-runs on terminal resize
    const _panelHeight = props.height;

    if (!scrollboxRef || taskCount === 0) {
      return;
    }

    const viewportHeight = scrollboxRef.viewport?.height ?? 0;
    if (viewportHeight <= 0) {
      return;
    }

    const currentTop = scrollboxRef.scrollTop;
    const maxVisibleIndex = currentTop + viewportHeight - 1;
    let nextTop = currentTop;

    if (selectedIndex < currentTop) {
      nextTop = selectedIndex;
    } else if (selectedIndex > maxVisibleIndex) {
      nextTop = selectedIndex - viewportHeight + 1;
    }

    const maxScrollTop = Math.max(0, scrollboxRef.scrollHeight - viewportHeight);
    nextTop = Math.min(maxScrollTop, Math.max(0, nextTop));

    if (nextTop !== scrollboxRef.scrollTop) {
      scrollboxRef.scrollTop = nextTop;
    }
  });

  return (
    <box
      title="Tasks"
      flexGrow={1}
      flexShrink={1}
      minWidth={30}
      maxWidth={50}
      flexDirection="column"
      backgroundColor={t().background}
      border
      borderColor={t().border}
    >
      <scrollbox
        ref={(el) => {
          scrollboxRef = el;
        }}
        flexGrow={1}
        width="100%"
        stickyScroll={false}
        rootOptions={{
          backgroundColor: t().background,
        }}
        viewportOptions={{
          backgroundColor: t().background,
        }}
        verticalScrollbarOptions={{
          visible: true,
          trackOptions: {
            backgroundColor: t().border,
          },
        }}
      >
        <Show
          when={props.tasks.length > 0}
          fallback={
            <box padding={1}>
              <text fg={t().textMuted}>No tasks loaded</text>
            </box>
          }
        >
          <For each={props.tasks}>
            {(task, index) => (
              <TaskRow
                task={task}
                isSelected={index() === props.selectedIndex}
                maxWidth={maxRowWidth()}
              />
            )}
          </For>
        </Show>
      </scrollbox>
    </box>
  );
}
