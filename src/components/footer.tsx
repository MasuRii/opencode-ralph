import { useTheme } from "../context/ThemeContext";
import { formatDuration, formatNumber } from "../util/time";
import type { TokenUsage } from "../state";

export type FooterProps = {
  commits: number;
  elapsed: number;
  status: "running" | "paused" | "ready" | "starting" | "complete" | "error";
  linesAdded: number;
  linesRemoved: number;
  sessionActive?: boolean;
  tokens?: TokenUsage;
};

/**
 * Footer component displaying keybind hints, commits count, and elapsed time.
 * Compact single-line layout for log-centric view.
 * 
 * NOTE: Uses reactive theme getter `t()` and separate <text fg={}> elements.
 * OpenTUI doesn't support nested <span style={{ fg }}> - must use <text fg={}>.
 */
export function Footer(props: FooterProps) {
  const { theme } = useTheme();
  // Reactive getter ensures theme updates propagate correctly
  const t = () => theme();
  
  // Dynamic action label based on status
  const actionLabel = () => {
    switch (props.status) {
      case "ready": return "start";
      case "paused": return "resume";
      default: return "pause";
    }
  };
  
  return (
    <box
      flexDirection="row"
      width="100%"
      height={1}
      alignItems="center"
      paddingLeft={1}
      paddingRight={1}
      backgroundColor={t().backgroundPanel}
    >
      {/* Keybind hints (left side) - using separate <text> elements for colors */}
      <box flexDirection="row">
        <text fg={t().borderSubtle}>q</text>
        <text fg={t().textMuted}> quit  </text>
        <text fg={t().borderSubtle}>p</text>
        <text fg={t().textMuted}> {actionLabel()}  </text>
        <text fg={t().borderSubtle}>T</text>
        <text fg={t().textMuted}> tasks  </text>
        <text fg={t().accent}>c</text>
        <text fg={t().textMuted}> cmds</text>
        {props.sessionActive && (
          <>
            <text fg={t().textMuted}>  </text>
            <text fg={t().borderSubtle}>:</text>
            <text fg={t().textMuted}> steer</text>
          </>
        )}
      </box>

      {/* Spacer */}
      <box flexGrow={1} />

      {/* Stats (right side) - using separate <text> elements for colors */}
      <box flexDirection="row">
        {/* Token display - only show when tokens > 0 */}
        {props.tokens && (props.tokens.input > 0 || props.tokens.output > 0) && (
          <>
            <text fg={t().borderSubtle}>{formatNumber(props.tokens.input)}in</text>
            <text fg={t().textMuted}>/</text>
            <text fg={t().borderSubtle}>{formatNumber(props.tokens.output)}out</text>
            {props.tokens.reasoning > 0 && (
              <>
                <text fg={t().textMuted}>/</text>
                <text fg={t().borderSubtle}>{formatNumber(props.tokens.reasoning)}r</text>
              </>
            )}
            <text fg={t().textMuted}> · </text>
          </>
        )}
        <text fg={t().success}>+{props.linesAdded}</text>
        <text fg={t().textMuted}>/</text>
        <text fg={t().error}>-{props.linesRemoved}</text>
        <text fg={t().textMuted}> · </text>
        <text fg={t().borderSubtle}>{props.commits}c</text>
        <text fg={t().textMuted}> · </text>
        <text fg={t().borderSubtle}>{formatDuration(props.elapsed)}</text>
      </box>
    </box>
  );
}
