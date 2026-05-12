import { useState, useCallback } from "react";
import { RefreshControl, ScrollView, type ScrollViewProps } from "react-native";
import { useThemeStore } from "../../hooks/useColorScheme";

/**
 * ScrollView wrapper that wires the project's branded RefreshControl. Pass an async
 * {@code onRefresh}; the wrapper manages the {@code refreshing} flag and tint colours so the
 * spinner stays on-brand in both themes.
 *
 * <pre>
 *  &lt;RefreshableScroll onRefresh={async () =&gt; jobsQuery.refetch()}&gt;
 *    {/* content *\/}
 *  &lt;/RefreshableScroll&gt;
 * </pre>
 */
export interface RefreshableScrollProps extends Omit<ScrollViewProps, "refreshControl"> {
  onRefresh: () => void | Promise<void>;
  /** Override the spinner tint — defaults to the primary brand colour. */
  tintColor?: string;
}

export function RefreshableScroll({
  onRefresh,
  tintColor,
  children,
  ...rest
}: RefreshableScrollProps) {
  const { isDark } = useThemeStore();
  const [refreshing, setRefreshing] = useState(false);

  const handle = useCallback(async () => {
    setRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setRefreshing(false);
    }
  }, [onRefresh]);

  return (
    <ScrollView
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handle}
          tintColor={tintColor ?? "#2563EB"}
          colors={[tintColor ?? "#2563EB"]}
          progressBackgroundColor={isDark ? "#1e293b" : "#ffffff"}
        />
      }
      {...rest}
    >
      {children}
    </ScrollView>
  );
}
