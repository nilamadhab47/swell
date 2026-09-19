/**
 * ScribbleGame — Meditative drawing canvas for craving intervention.
 *
 * "Draw anything for 3 minutes."
 *
 * The most aligned game with Swell's calm identity. Zero cognitive load,
 * endlessly creative, deeply tactile. The user fills time with color
 * and motion until the craving passes.
 *
 * Features:
 * - Beautiful reactive brush with Skia paths
 * - 8 curated colors from Swell's palette
 * - Adjustable brush size (small / medium / large)
 * - Undo (step back through strokes)
 * - Clear canvas
 * - Integrated timer + encouragement messages
 * - Subtle background that shifts as session progresses
 * - Haptic feedback on color/size changes
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  AppState,
  Dimensions,
  PanResponder,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  Canvas,
  Group,
  Path as SkiaPath,
  Skia,
  RoundedRect,
} from '@shopify/react-native-skia';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

import { CoolingBackground } from '../../components/CoolingBackground';
import { CravingTimer } from '../../craving/CravingTimer';
import { CravingMessageOverlay } from '../../craving/CravingMessageOverlay';
import { useTheme } from '../../theme/useTheme';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');
const CANVAS_W = SCREEN_W - 32;
const CANVAS_H = Math.min(SCREEN_H * 0.52, 480);

interface Stroke {
  path: string;
  color: string;
  width: number;
}

interface ScribbleGameProps {
  durationSecs: number;
  onComplete: (actualDurationSecs: number) => void;
  onEarlyExit?: () => void;
}

const BRUSH_SIZES = [
  { label: 'S', value: 3 },
  { label: 'M', value: 7 },
  { label: 'L', value: 14 },
];

function getPalette(scheme: 'light' | 'dark') {
  if (scheme === 'dark') {
    return [
      '#5CE0D6', // aqua
      '#F07050', // coral
      '#F5C054', // gold
      '#70D4B8', // mint
      '#7EB8F0', // blue
      '#F5A080', // peach
      '#C8A0E8', // lavender
      '#FFFFFF', // white
    ];
  }
  return [
    '#14B3A6', // aqua
    '#F04A2F', // coral
    '#F2A234', // gold
    '#30B880', // mint
    '#3888D0', // blue
    '#D87050', // peach
    '#9868C0', // lavender
    '#0E2A36', // ink
  ];
}

export function ScribbleGame({
  durationSecs,
  onComplete,
  onEarlyExit,
}: ScribbleGameProps) {
  const theme = useTheme();
  const palette = useMemo(() => getPalette(theme.scheme), [theme.scheme]);

  // ----- State -----
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [currentPath, setCurrentPath] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState(0);
  const [selectedSize, setSelectedSize] = useState(1); // medium default
  const [coolProgress, setCoolProgress] = useState(0);
  const [remainingSecs, setRemainingSecs] = useState(durationSecs);

  const startRef = useRef(Date.now());
  const completedRef = useRef(false);
  const sessionSeed = useRef(Math.floor(Math.random() * 10000));
  const pathBuilder = useRef<ReturnType<typeof Skia.Path.Make> | null>(null);

  // ----- Animation -----
  const completionOpacity = useSharedValue(0);
  const completionScale = useSharedValue(0.9);

  // ----- Finish -----
  const finish = useCallback(() => {
    if (completedRef.current) return;
    completedRef.current = true;

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    completionOpacity.value = withTiming(1, { duration: 600 });
    completionScale.value = withSpring(1, { damping: 14, stiffness: 100 });

    const elapsed = Math.round((Date.now() - startRef.current) / 1000);
    setTimeout(() => onComplete(elapsed), 1200);
  }, [onComplete, completionOpacity, completionScale]);

  // ----- Timer -----
  useEffect(() => {
    startRef.current = Date.now();
    const interval = setInterval(() => {
      const elapsed = (Date.now() - startRef.current) / 1000;
      setCoolProgress(Math.min(1, elapsed / durationSecs));
      setRemainingSecs(Math.max(0, Math.ceil(durationSecs - elapsed)));

      if (elapsed >= durationSecs) {
        clearInterval(interval);
        finish();
      }
    }, 200);
    return () => clearInterval(interval);
  }, [durationSecs, finish]);

  // ----- Resume from background: immediately sync timer -----
  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active' && !completedRef.current) {
        const elapsed = (Date.now() - startRef.current) / 1000;
        setCoolProgress(Math.min(1, elapsed / durationSecs));
        setRemainingSecs(Math.max(0, Math.ceil(durationSecs - elapsed)));
        if (elapsed >= durationSecs) finish();
      }
    });
    return () => sub.remove();
  }, [durationSecs, finish]);

  // ----- Drawing (PanResponder) -----
  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => !completedRef.current,
        onMoveShouldSetPanResponder: () => !completedRef.current,
        onPanResponderGrant: (evt) => {
          const { locationX, locationY } = evt.nativeEvent;
          const path = Skia.Path.Make();
          path.moveTo(locationX, locationY);
          pathBuilder.current = path;
          setCurrentPath(path.toSVGString());
        },
        onPanResponderMove: (evt) => {
          if (!pathBuilder.current) return;
          const { locationX, locationY } = evt.nativeEvent;
          pathBuilder.current.lineTo(locationX, locationY);
          setCurrentPath(pathBuilder.current.toSVGString());
        },
        onPanResponderRelease: () => {
          if (!pathBuilder.current) return;
          const svgPath = pathBuilder.current.toSVGString();
          setStrokes((prev) => [
            ...prev,
            {
              path: svgPath,
              color: palette[selectedColor],
              width: BRUSH_SIZES[selectedSize].value,
            },
          ]);
          setCurrentPath(null);
          pathBuilder.current = null;
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
        },
      }),
    [palette, selectedColor, selectedSize],
  );

  // ----- Actions -----
  const undo = useCallback(() => {
    setStrokes((prev) => {
      if (prev.length === 0) return prev;
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      return prev.slice(0, -1);
    });
  }, []);

  const clearCanvas = useCallback(() => {
    if (strokes.length === 0) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setStrokes([]);
  }, [strokes.length]);

  // ----- Completion overlay -----
  const completionStyle = useAnimatedStyle(() => ({
    opacity: completionOpacity.value,
    transform: [{ scale: completionScale.value }],
  }));

  const canvasBg = theme.scheme === 'dark'
    ? 'rgba(0,0,0,0.25)'
    : 'rgba(255,255,255,0.65)';

  const controlBg = theme.scheme === 'dark'
    ? 'rgba(255,255,255,0.08)'
    : 'rgba(255,255,255,0.7)';

  const controlBorder = theme.scheme === 'dark'
    ? 'rgba(255,255,255,0.12)'
    : 'rgba(14,42,54,0.08)';

  return (
    <View style={styles.container}>
      <CoolingBackground coolProgress={coolProgress} />

      {/* Header */}
      <View style={styles.header}>
        <Pressable
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            if (onEarlyExit) onEarlyExit();
            else finish();
          }}
          hitSlop={12}
          style={[styles.closeBtn, { backgroundColor: controlBg, borderColor: controlBorder }]}
        >
          <Text style={{ color: theme.text.secondary, fontSize: 18 }}>✕</Text>
        </Pressable>

        <CravingTimer
          totalSecs={durationSecs}
          remainingSecs={remainingSecs}
          progress={coolProgress}
        />

        <View style={styles.strokeCount}>
          <Text style={[styles.strokeLabel, { color: theme.text.muted }]}>strokes</Text>
          <Text style={[styles.strokeValue, { color: theme.text.primary, fontFamily: theme.fonts.display }]}>
            {strokes.length}
          </Text>
        </View>
      </View>

      {/* Encouragement */}
      <CravingMessageOverlay
        remainingSecs={remainingSecs}
        sessionSeed={sessionSeed.current}
      />

      {/* Drawing canvas */}
      <View
        style={[
          styles.canvasWrap,
          { backgroundColor: canvasBg, borderColor: controlBorder },
        ]}
        {...panResponder.panHandlers}
      >
        <Canvas style={{ width: CANVAS_W, height: CANVAS_H }}>
          <Group>
            {/* Completed strokes */}
            {strokes.map((stroke, i) => {
              const path = Skia.Path.MakeFromSVGString(stroke.path);
              if (!path) return null;
              return (
                <SkiaPath
                  key={i}
                  path={path}
                  style="stroke"
                  strokeWidth={stroke.width}
                  strokeCap="round"
                  strokeJoin="round"
                  color={stroke.color}
                />
              );
            })}

            {/* Current active stroke */}
            {currentPath && (() => {
              const path = Skia.Path.MakeFromSVGString(currentPath);
              if (!path) return null;
              return (
                <SkiaPath
                  path={path}
                  style="stroke"
                  strokeWidth={BRUSH_SIZES[selectedSize].value}
                  strokeCap="round"
                  strokeJoin="round"
                  color={palette[selectedColor]}
                  opacity={0.8}
                />
              );
            })()}
          </Group>
        </Canvas>

        {/* Empty state hint */}
        {strokes.length === 0 && !currentPath && (
          <View style={styles.emptyHint} pointerEvents="none">
            <Text style={[styles.emptyText, { color: theme.text.muted }]}>
              Draw anything.
            </Text>
            <Text style={[styles.emptySubtext, { color: theme.text.muted }]}>
              Fill the time. The craving will pass.
            </Text>
          </View>
        )}
      </View>

      {/* Color palette */}
      <View style={styles.paletteRow}>
        {palette.map((color, i) => (
          <Pressable
            key={color}
            onPress={() => {
              setSelectedColor(i);
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
            }}
            style={[
              styles.colorDot,
              {
                backgroundColor: color,
                borderColor: i === selectedColor ? theme.text.primary : 'transparent',
                transform: [{ scale: i === selectedColor ? 1.2 : 1 }],
              },
            ]}
          />
        ))}
      </View>

      {/* Brush size + actions */}
      <View style={styles.toolRow}>
        {/* Brush sizes */}
        <View style={styles.sizeGroup}>
          {BRUSH_SIZES.map((size, i) => (
            <Pressable
              key={size.label}
              onPress={() => {
                setSelectedSize(i);
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
              }}
              style={[
                styles.sizeBtn,
                {
                  backgroundColor: i === selectedSize ? theme.accent.aqua : controlBg,
                  borderColor: i === selectedSize ? theme.accent.aqua : controlBorder,
                },
              ]}
            >
              <Text
                style={[
                  styles.sizeBtnText,
                  { color: i === selectedSize ? '#fff' : theme.text.secondary },
                ]}
              >
                {size.label}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Undo + Clear */}
        <View style={styles.actionGroup}>
          <Pressable
            onPress={undo}
            disabled={strokes.length === 0}
            style={[
              styles.actionBtn,
              {
                backgroundColor: controlBg,
                borderColor: controlBorder,
                opacity: strokes.length === 0 ? 0.4 : 1,
              },
            ]}
          >
            <Text style={[styles.actionIcon, { color: theme.text.secondary }]}>↩</Text>
          </Pressable>
          <Pressable
            onPress={clearCanvas}
            disabled={strokes.length === 0}
            style={[
              styles.actionBtn,
              {
                backgroundColor: controlBg,
                borderColor: controlBorder,
                opacity: strokes.length === 0 ? 0.4 : 1,
              },
            ]}
          >
            <Text style={[styles.actionIcon, { color: theme.text.secondary }]}>✕</Text>
          </Pressable>
        </View>
      </View>

      {/* Completion overlay */}
      {completedRef.current && (
        <Animated.View
          style={[styles.completionOverlay, completionStyle, { backgroundColor: theme.surface.canvas }]}
        >
          <Text
            style={[styles.completionTitle, { color: theme.state.success, fontFamily: theme.fonts.display }]}
          >
            You filled the time.
          </Text>
          <Text style={[styles.completionSub, { color: theme.text.secondary }]}>
            The craving passed.
          </Text>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 8,
    zIndex: 2,
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 0.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  strokeCount: {
    alignItems: 'center',
    minWidth: 40,
  },
  strokeLabel: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  strokeValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  canvasWrap: {
    alignSelf: 'center',
    width: CANVAS_W,
    height: CANVAS_H,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 16,
    overflow: 'hidden',
    zIndex: 1,
    marginTop: 8,
  },
  emptyHint: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  emptySubtext: {
    fontSize: 14,
    marginTop: 6,
    fontStyle: 'italic',
  },
  paletteRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  colorDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2.5,
  },
  toolRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  sizeGroup: {
    flexDirection: 'row',
    gap: 8,
  },
  sizeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 0.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sizeBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
  actionGroup: {
    flexDirection: 'row',
    gap: 10,
  },
  actionBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 0.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionIcon: {
    fontSize: 20,
    fontWeight: '600',
  },
  completionOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  completionTitle: {
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
  },
  completionSub: {
    fontSize: 16,
    marginTop: 8,
    textAlign: 'center',
  },
});
