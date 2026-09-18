import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { HealthTimelineItem } from '../data/types';
import type { Milestone } from '../config/types';
import { useTypography } from '../theme/useTypography';
import { useTheme } from '../theme/useTheme';

interface HealthTimelineListProps {
  items: HealthTimelineItem[];
}

function statusColor(
  status: HealthTimelineItem['status'],
  theme: ReturnType<typeof useTheme>
): string {
  switch (status) {
    case 'completed':
      return theme.state.success;
    case 'current':
      return theme.accent.coral;
    default:
      return theme.text.secondary;
  }
}

function statusLabel(status: HealthTimelineItem['status']): string {
  switch (status) {
    case 'completed':
      return 'Done';
    case 'current':
      return 'Now';
    default:
      return 'Ahead';
  }
}

export function HealthTimelineList({ items }: HealthTimelineListProps) {
  const theme = useTheme();
  const { body, label } = useTypography();

  return (
    <View style={styles.list}>
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        const dotColor = statusColor(item.status, theme);

        return (
          <View key={item.id} style={styles.row}>
            <View style={styles.rail}>
              <View
                style={[
                  styles.dot,
                  {
                    backgroundColor: dotColor,
                    borderColor: dotColor,
                  },
                  item.status === 'current' && styles.dotCurrent,
                ]}
              />
              {!isLast && (
                <View
                  style={[
                    styles.line,
                    {
                      backgroundColor:
                        item.status === 'completed'
                          ? theme.state.success
                          : theme.border.subtle,
                    },
                  ]}
                />
              )}
            </View>
            <View style={styles.copy}>
              <View style={styles.titleRow}>
                <Text style={[body, { color: theme.text.primary }]}>
                  {item.label}
                </Text>
                <Text style={[label, { color: dotColor }]}>
                  {statusLabel(item.status)}
                </Text>
              </View>
              {item.description ? (
                <Text
                  style={[
                    label,
                    { color: theme.text.secondary, marginTop: 4 },
                  ]}
                >
                  {item.description}
                </Text>
              ) : null}
            </View>
          </View>
        );
      })}
    </View>
  );
}

/** Fallback when dashboard has no timeline statuses yet. */
export function HealthTimelineFromConfig({ items }: { items: Milestone[] }) {
  const mapped: HealthTimelineItem[] = items.map((m, i) => ({
    id: m.id,
    label: m.label,
    description: m.description,
    status: i === 0 ? 'current' : 'upcoming',
    completed_at: null,
  }));
  return <HealthTimelineList items={mapped} />;
}

const styles = StyleSheet.create({
  list: {
    marginTop: 4,
  },
  row: {
    flexDirection: 'row',
    minHeight: 56,
  },
  rail: {
    width: 24,
    alignItems: 'center',
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 1,
    marginTop: 4,
  },
  dotCurrent: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginTop: 3,
  },
  line: {
    width: 2,
    flex: 1,
    marginTop: 4,
    opacity: 0.5,
  },
  copy: {
    flex: 1,
    paddingBottom: 16,
    paddingLeft: 8,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
});
