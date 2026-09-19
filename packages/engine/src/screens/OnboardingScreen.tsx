import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Dimensions,
  Image,
  ImageSourcePropType,
  KeyboardAvoidingView,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { useQueryClient } from '@tanstack/react-query';
import { GlowingButton } from '../components/GlowingButton';
import { OceanBackground } from '../components/OceanBackground';
import { useNicheConfig } from '../config/NicheConfigProvider';
import type { OnboardingQuestion } from '../config/types';
import { updateProfile } from '../data/api';
import { dashboardQueryKey } from '../data/hooks/useDashboard';
import { answersToProfile } from '../data/profileMap';
import { staggerIn, stepEnter, stepEnterBack } from '../motion/presets';
import {
  costPrompt,
  HABIT_OPTIONS,
  parseHabit,
  unitsPrompt,
} from '../onboarding/habit';
import {
  useOnboardingStore,
  type OnboardingAnswers,
} from '../onboarding/useOnboardingStore';
import { useTheme } from '../theme/useTheme';
import { useTypography } from '../theme/useTypography';

type Step = 'welcome' | 'question' | 'done';

const { width: SCREEN_W } = Dimensions.get('window');

const QUIT_PRESETS = [
  { id: 'today', label: 'Today', sublabel: 'Fresh start, right now', daysAgo: 0 },
  { id: 'yesterday', label: 'Yesterday', sublabel: 'Day one already done', daysAgo: 1 },
  { id: 'few', label: 'A few days ago', sublabel: 'You’ve got a head start', daysAgo: 3 },
  { id: 'week', label: 'About a week ago', sublabel: 'Momentum is building', daysAgo: 7 },
] as const;

/** Emotional, true reasons people actually quit for. Tap to fill, still editable. */
const REASON_PRESETS = [
  'To be around longer for the people I love',
  'I’m done letting it control me',
  'My kids are watching',
  'A scare made it real',
  'To breathe without thinking about it',
  'The money should be mine, not theirs',
] as const;

interface TeachSlide {
  id: string;
  tag: string;
  title: string;
  body: string;
  emoji: string;
  /** Full-bleed scene art (no transparency) — render in a rounded frame. */
  scene?: boolean;
}

/**
 * Artwork map. Generate the PNGs with the prompts in the accompanying notes,
 * drop them in packages/engine/src/assets/onboarding/, then uncomment the
 * matching require() below. Until then each slide falls back to its emoji.
 */
const SLIDE_ART: Record<string, ImageSourcePropType | null> = {
  wave: require('../assets/onboarding/wave.png'),
  time: require('../assets/onboarding/time.png'),
  play: require('../assets/onboarding/play.png'),
  body: require('../assets/onboarding/body.png'),
  future: require('../assets/onboarding/future.png'),
  deal: require('../assets/onboarding/deal.png'),
};

const TEACH_SLIDES: TeachSlide[] = [
  {
    id: 'wave',
    tag: 'WHY THIS WORKS',
    title: 'A craving is a wave, not a wall.',
    body: 'It swells, peaks in about three minutes, then falls. You don’t have to fight it — you just have to still be here when it breaks.',
    emoji: '🌊',
  },
  {
    id: 'time',
    tag: 'THE RESEARCH',
    title: 'Urges pass. Almost always in minutes.',
    body: 'Most cravings fade within 3–5 minutes. Riding them out instead of feeding them is one of the most proven ways to quit for good.',
    emoji: '⏳',
  },
  {
    id: 'play',
    tag: 'HOW SWELL WORKS',
    title: 'Craving hits? Open Swell and play.',
    body: 'One calm three-minute game for your hands and your head. When it ends, so has the urge. We log the win. Quietly.',
    emoji: '🎮',
  },
  {
    id: 'body',
    tag: 'WHAT YOU GET',
    title: 'Proof you’re winning — not guilt.',
    body: 'Days clear. Money back. A body already repairing itself. No lectures here, just receipts.',
    emoji: '🫁',
  },
  {
    id: 'future',
    tag: 'YOU, A MONTH FROM NOW',
    title: 'Someone’s waiting on the other side.',
    body: 'Breathing easier. A little money back. Quietly proud of themselves. That version of you isn’t a fantasy — every wave you ride brings them closer.',
    emoji: '🌅',
    scene: true,
  },
  {
    id: 'deal',
    tag: 'THE DEAL',
    title: 'You don’t have to be perfect.',
    body: 'Just a little harder to beat than yesterday. Slip once? You start the next wave. We’ll be counting every single one with you.',
    emoji: '🤝',
  },
];

function isoDaysAgo(days: number): string {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - days);
  return d.toISOString();
}

function isAnswered(
  question: OnboardingQuestion,
  answers: OnboardingAnswers
): boolean {
  if (question.id === 'name') return answers.name.trim().length >= 1;
  if (question.id === 'age') return answers.age.trim().length > 0 && Number(answers.age) > 0;
  if (question.id === 'habit') return Boolean(parseHabit(answers.habit));
  if (question.id === 'reason') return answers.reason.trim().length >= 2;
  if (question.id === 'cigs_per_day') return answers.cigs_per_day.trim().length > 0;
  if (question.id === 'cost_per_pack') return answers.cost_per_pack.trim().length > 0;
  if (question.id === 'quit_date') return Boolean(answers.quit_date);
  if (question.type === 'select') return currentSelectValue(question, answers).length > 0;
  return true;
}

function currentSelectValue(
  question: OnboardingQuestion,
  answers: OnboardingAnswers
): string {
  if (question.id === 'habit') return answers.habit;
  return '';
}

export function OnboardingScreen() {
  const theme = useTheme();
  const config = useNicheConfig();
  const { mega, display, headline, body, bodyLg, label, caption } =
    useTypography();
  const complete = useOnboardingStore((s) => s.complete);
  const queryClient = useQueryClient();

  const questions = config.onboarding;
  const [step, setStep] = useState<Step>('welcome');
  const [questionIndex, setQuestionIndex] = useState(0);
  const [teachIndex, setTeachIndex] = useState(0);
  const [answers, setAnswers] = useState<OnboardingAnswers>({
    name: '',
    age: '',
    habit: '',
    reason: '',
    cigs_per_day: '',
    cost_per_pack: '',
    quit_date: null,
  });
  const directionRef = useRef(1);
  const animateStepsRef = useRef(false);
  const teachScrollRef = useRef<ScrollView>(null);

  // Screen darkens as the cigarette count climbs — the weight of the habit.
  const smog = useSharedValue(0);

  // Gentle, endless float on the welcome wordmark — the app feels "alive".
  const float = useSharedValue(0);
  useEffect(() => {
    float.value = withRepeat(withTiming(1, { duration: 2600 }), -1, true);
  }, [float]);
  const floatStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: -7 * float.value }],
  }));
  const artStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: -6 * float.value },
      { scale: 1 + 0.02 * float.value },
    ],
  }));

  const question: OnboardingQuestion | undefined = questions[questionIndex];
  const totalSteps = 1 + questions.length;
  const currentStepNumber =
    step === 'welcome' ? 1 : step === 'done' ? totalSteps : questionIndex + 2;

  const setAnswer = (key: keyof OnboardingAnswers, value: string | null) => {
    setAnswers((prev) => ({ ...prev, [key]: value }));
  };

  const habit = parseHabit(answers.habit);

  const isCigsStep = step === 'question' && question?.id === 'cigs_per_day';

  useEffect(() => {
    if (!isCigsStep) {
      smog.value = withTiming(0, { duration: 400 });
      return;
    }
    const count = Number(answers.cigs_per_day) || 0;
    // 0 → clear, ~30/day → heavy smog. Cap so it never goes pitch black.
    const target = Math.min(count / 30, 1) * 0.72;
    smog.value = withTiming(target, { duration: 500 });
  }, [answers.cigs_per_day, isCigsStep, smog]);

  const smogStyle = useAnimatedStyle(() => ({
    opacity: smog.value,
  }));

  const prompt = useMemo(() => {
    if (!question) return '';
    if (question.id === 'cigs_per_day') return unitsPrompt(habit);
    if (question.id === 'cost_per_pack') return costPrompt(habit);
    return question.prompt;
  }, [question, habit]);

  const currentValue = useMemo(() => {
    if (!question) return '';
    if (question.id === 'name') return answers.name;
    if (question.id === 'age') return answers.age;
    if (question.id === 'habit') return answers.habit;
    if (question.id === 'reason') return answers.reason;
    if (question.id === 'cigs_per_day') return answers.cigs_per_day;
    if (question.id === 'cost_per_pack') return answers.cost_per_pack;
    return answers.quit_date ?? '';
  }, [question, answers]);

  const canContinue = question ? isAnswered(question, answers) : false;

  const goNextFromQuestion = () => {
    if (!question || !isAnswered(question, answers)) return;
    directionRef.current = 1;
    animateStepsRef.current = true;
    if (questionIndex < questions.length - 1) {
      setQuestionIndex((i) => i + 1);
      return;
    }
    setStep('done');
  };

  const goBack = () => {
    directionRef.current = -1;
    animateStepsRef.current = true;
    if (step === 'question' && questionIndex === 0) {
      setStep('welcome');
      return;
    }
    if (step === 'question') {
      setQuestionIndex((i) => i - 1);
      return;
    }
    if (step === 'done') {
      setQuestionIndex(questions.length - 1);
      setStep('question');
    }
  };

  const finish = async () => {
    complete(answers);
    if (config.useMockApi) return;
    try {
      await updateProfile(config.appId, answersToProfile(answers));
      await queryClient.invalidateQueries({
        queryKey: dashboardQueryKey(config.appId),
      });
    } catch {
      // Local onboarding still counts if the network misses.
    }
  };

  const onTeachScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const idx = Math.round(e.nativeEvent.contentOffset.x / SCREEN_W);
    if (idx !== teachIndex) setTeachIndex(idx);
  };

  const goNextSlide = () => {
    const next = Math.min(teachIndex + 1, TEACH_SLIDES.length - 1);
    teachScrollRef.current?.scrollTo({ x: next * SCREEN_W, animated: true });
    setTeachIndex(next);
  };

  const stepKey = step === 'question' ? `question-${questionIndex}` : step;
  const entering = animateStepsRef.current
    ? directionRef.current >= 0
      ? stepEnter
      : stepEnterBack
    : undefined;

  const selectOptions =
    question?.id === 'habit'
      ? HABIT_OPTIONS.map((option) => option.label)
      : question?.options ?? [];

  return (
    <View style={[styles.root, { backgroundColor: theme.surface.canvas }]}>
      <OceanBackground />
      <Animated.View
        pointerEvents="none"
        style={[styles.smog, { backgroundColor: '#0a0f14' }, smogStyle]}
      />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.topBar}>
          {step !== 'welcome' ? (
            <Pressable onPress={goBack} hitSlop={12} style={styles.backBtn}>
              <Text style={{ color: theme.text.secondary, fontSize: 22 }}>
                ←
              </Text>
            </Pressable>
          ) : (
            <View style={styles.backBtn} />
          )}
          <View style={styles.dots}>
            {Array.from({ length: totalSteps }).map((_, i) => (
              <View
                key={i}
                style={[
                  styles.dot,
                  {
                    backgroundColor:
                      i < currentStepNumber
                        ? theme.accent.coral
                        : theme.border.subtle,
                  },
                ]}
              />
            ))}
          </View>
          <View style={styles.backBtn} />
        </View>

        <Animated.View key={stepKey} entering={entering} style={styles.flex}>
          {step === 'welcome' && (
            <View style={styles.welcomeBody}>
              <View style={styles.welcomeHero}>
                <Animated.Text
                  entering={staggerIn(80)}
                  style={[label, { color: theme.text.secondary, letterSpacing: 2 }]}
                >
                  WELCOME TO
                </Animated.Text>

                <Animated.View entering={staggerIn(180)} style={floatStyle}>
                  <Text
                    style={[
                      mega,
                      {
                        color: theme.accent.coral,
                        fontSize: 84,
                        lineHeight: 88,
                        marginTop: 4,
                      },
                    ]}
                  >
                    {config.brand.name}
                  </Text>
                </Animated.View>

                <Animated.Text
                  entering={staggerIn(320)}
                  style={[
                    display,
                    {
                      color: theme.text.primary,
                      marginTop: 20,
                      fontSize: 34,
                      lineHeight: 42,
                    },
                  ]}
                >
                  Your cravings just met their match.
                </Animated.Text>

                <Animated.Text
                  entering={staggerIn(440)}
                  style={[
                    body,
                    {
                      color: theme.text.secondary,
                      marginTop: 16,
                      maxWidth: 340,
                      lineHeight: 26,
                      fontSize: 17,
                    },
                  ]}
                >
                  Smoke or vape — every urge is a 3-minute wave. We hand you
                  something to hold onto while it passes, and keep score of every
                  one you beat.
                </Animated.Text>
              </View>

              <Animated.View entering={staggerIn(620)} style={styles.welcomeFooter}>
                <Text
                  style={[
                    caption,
                    {
                      color: theme.text.muted,
                      marginBottom: 14,
                      textAlign: 'center',
                    },
                  ]}
                >
                  Takes about a minute. No lectures, promise.
                </Text>
                <GlowingButton
                  label="Let's begin"
                  onPress={() => {
                    directionRef.current = 1;
                    animateStepsRef.current = true;
                    setStep('question');
                  }}
                />
              </Animated.View>
            </View>
          )}

          {step === 'question' && question && (
            <View style={styles.body}>
              <Text
                style={[
                  headline,
                  { color: isCigsStep ? '#ffffff' : theme.text.primary },
                ]}
              >
                {prompt}
              </Text>

              {question.id === 'reason' ? (
                <>
                  <Text
                    style={[
                      caption,
                      { color: theme.text.muted, marginTop: 10 },
                    ]}
                  >
                    Pick one that stings a little, or write your own.
                  </Text>
                  <View style={styles.reasonWrap}>
                    {REASON_PRESETS.map((preset) => {
                      const selected = answers.reason.trim() === preset;
                      return (
                        <Pressable
                          key={preset}
                          onPress={() => setAnswer('reason', preset)}
                          style={[
                            styles.reasonChip,
                            {
                              borderColor: selected
                                ? theme.accent.coral
                                : theme.border.subtle,
                              backgroundColor: selected
                                ? theme.accent.coral
                                : theme.surface.glass,
                            },
                          ]}
                        >
                          <Text
                            style={[
                              body,
                              {
                                color: selected
                                  ? theme.text.inverse
                                  : theme.text.primary,
                                fontWeight: '600',
                              },
                            ]}
                          >
                            {preset}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                  <TextInput
                    value={answers.reason}
                    onChangeText={(text) => setAnswer('reason', text)}
                    placeholder="Or say it in your own words…"
                    placeholderTextColor={theme.text.secondary}
                    multiline
                    style={[
                      styles.reasonInput,
                      {
                        color: theme.text.primary,
                        borderColor: theme.border.subtle,
                        backgroundColor: theme.surface.glass,
                        fontFamily: theme.fonts.body,
                      },
                    ]}
                  />
                </>
              ) : question.type === 'date' ? (
                <View style={styles.presetWrap}>
                  {QUIT_PRESETS.map((preset) => {
                    const iso = isoDaysAgo(preset.daysAgo);
                    const isSelected = answers.quit_date === iso;
                    return (
                      <Pressable
                        key={preset.id}
                        onPress={() => setAnswer('quit_date', iso)}
                        style={[
                          styles.preset,
                          {
                            borderColor: isSelected
                              ? theme.accent.coral
                              : theme.border.subtle,
                            backgroundColor: isSelected
                              ? theme.accent.coral
                              : theme.surface.glass,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            body,
                            {
                              color: isSelected
                                ? theme.text.inverse
                                : theme.text.primary,
                              fontWeight: '600',
                            },
                          ]}
                        >
                          {preset.label}
                        </Text>
                        <Text
                          style={[
                            caption,
                            {
                              color: isSelected
                                ? theme.text.inverse
                                : theme.text.muted,
                              marginTop: 2,
                              opacity: isSelected ? 0.9 : 1,
                            },
                          ]}
                        >
                          {preset.sublabel}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              ) : question.type === 'select' ? (
                <View style={styles.presetWrap}>
                  {selectOptions.map((option) => {
                    const value =
                      question.id === 'habit'
                        ? HABIT_OPTIONS.find((item) => item.label === option)?.id ??
                          option
                        : option;
                    const isSelected =
                      currentSelectValue(question, answers) === value;
                    return (
                      <Pressable
                        key={option}
                        onPress={() => {
                          if (question.id === 'habit') setAnswer('habit', value);
                        }}
                        style={[
                          styles.preset,
                          {
                            borderColor: isSelected
                              ? theme.accent.coral
                              : theme.border.subtle,
                            backgroundColor: isSelected
                              ? theme.accent.coral
                              : theme.surface.glass,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            body,
                            {
                              color: isSelected
                                ? theme.text.inverse
                                : theme.text.primary,
                              fontWeight: '600',
                            },
                          ]}
                        >
                          {option}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              ) : question.id === 'name' ? (
                <TextInput
                  value={answers.name}
                  onChangeText={(text) => setAnswer('name', text)}
                  placeholder={question.placeholder}
                  placeholderTextColor={theme.text.secondary}
                  autoCapitalize="words"
                  autoFocus
                  style={[
                    styles.input,
                    {
                      color: theme.text.primary,
                      borderColor: theme.border.subtle,
                      backgroundColor: theme.surface.glass,
                      fontFamily: theme.fonts.body,
                    },
                  ]}
                />
              ) : (
                <>
                  <TextInput
                    value={currentValue}
                    onChangeText={(text) => {
                      if (question.id === 'age')
                        setAnswer('age', text.replace(/[^0-9]/g, '').slice(0, 3));
                      if (question.id === 'cigs_per_day')
                        setAnswer('cigs_per_day', text.replace(/[^0-9]/g, ''));
                      if (question.id === 'cost_per_pack')
                        setAnswer('cost_per_pack', text.replace(/[^0-9]/g, ''));
                    }}
                    placeholder={question.placeholder}
                    placeholderTextColor={
                      isCigsStep ? 'rgba(255,255,255,0.5)' : theme.text.secondary
                    }
                    keyboardType="number-pad"
                    autoFocus
                    style={[
                      styles.input,
                      {
                        color: isCigsStep ? '#ffffff' : theme.text.primary,
                        borderColor: theme.border.subtle,
                        backgroundColor: isCigsStep
                          ? 'rgba(255,255,255,0.08)'
                          : theme.surface.glass,
                        fontFamily: theme.fonts.body,
                      },
                    ]}
                  />
                  {isCigsStep && Number(answers.cigs_per_day) > 0 ? (
                    <Text
                      style={[
                        body,
                        {
                          color: '#ffd9cf',
                          marginTop: 16,
                          lineHeight: 22,
                        },
                      ]}
                    >
                      {smogLine(Number(answers.cigs_per_day))}
                    </Text>
                  ) : null}
                </>
              )}

              <View style={styles.footer}>
                <GlowingButton
                  label="Continue"
                  disabled={!canContinue}
                  onPress={goNextFromQuestion}
                />
              </View>
            </View>
          )}

          {step === 'done' && (
            <View style={styles.flex}>
              <ScrollView
                ref={teachScrollRef}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onMomentumScrollEnd={onTeachScroll}
                scrollEventThrottle={16}
              >
                {TEACH_SLIDES.map((slide) => (
                  <View key={slide.tag} style={[styles.slide, { width: SCREEN_W }]}>
                    <Text
                      style={[
                        label,
                        { color: theme.accent.coral, letterSpacing: 1.5 },
                      ]}
                    >
                      {slide.tag}
                    </Text>
                    <Text
                      style={[
                        display,
                        {
                          color: theme.text.primary,
                          marginTop: 14,
                          fontSize: 38,
                          lineHeight: 44,
                        },
                      ]}
                    >
                      {slide.title}
                    </Text>
                    <Text
                      style={[
                        bodyLg,
                        {
                          color: theme.text.secondary,
                          marginTop: 18,
                          fontSize: 19,
                          lineHeight: 29,
                        },
                      ]}
                    >
                      {slide.body}
                    </Text>

                    <View style={styles.slideArtWrap}>
                      <Animated.View style={artStyle}>
                        {SLIDE_ART[slide.id] ? (
                          <Image
                            source={SLIDE_ART[slide.id] as ImageSourcePropType}
                            style={[
                              styles.slideImage,
                              slide.scene && styles.slideImageScene,
                            ]}
                            resizeMode={slide.scene ? 'cover' : 'contain'}
                          />
                        ) : (
                          <View
                            style={[
                              styles.slideArt,
                              {
                                backgroundColor: theme.surface.glass,
                                borderColor: theme.border.subtle,
                              },
                            ]}
                          >
                            <Text style={styles.slideEmoji}>{slide.emoji}</Text>
                          </View>
                        )}
                      </Animated.View>
                    </View>
                  </View>
                ))}
              </ScrollView>

              <View style={styles.slideDots}>
                {TEACH_SLIDES.map((slide, i) => (
                  <View
                    key={slide.tag}
                    style={[
                      styles.slideDot,
                      {
                        backgroundColor:
                          i === teachIndex
                            ? theme.accent.coral
                            : theme.border.subtle,
                        width: i === teachIndex ? 20 : 6,
                      },
                    ]}
                  />
                ))}
              </View>

              <View style={styles.doneFooter}>
                {teachIndex >= TEACH_SLIDES.length - 1 ? (
                  <GlowingButton label="I'm ready" onPress={finish} />
                ) : (
                  <>
                    <GlowingButton label="Next" onPress={goNextSlide} />
                    <Pressable onPress={finish} hitSlop={12} style={styles.skipLink}>
                      <Text
                        style={[
                          caption,
                          { color: theme.text.muted, fontWeight: '600' },
                        ]}
                      >
                        Skip the tour
                      </Text>
                    </Pressable>
                  </>
                )}
              </View>
            </View>
          )}
        </Animated.View>
      </KeyboardAvoidingView>
    </View>
  );
}

function smogLine(count: number): string {
  if (count >= 20) return 'That’s a lot of smoke to carry. Let’s start putting it down.';
  if (count >= 10) return 'Every one of those is a wave you’ll learn to ride.';
  return 'Fewer than most — a good place to start.';
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  smog: {
    ...StyleSheet.absoluteFillObject,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 8,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dots: {
    flexDirection: 'row',
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  body: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 32,
  },
  welcomeBody: {
    flex: 1,
    paddingHorizontal: 24,
  },
  welcomeHero: {
    flex: 1,
    justifyContent: 'center',
  },
  welcomeFooter: {
    paddingBottom: 48,
    alignItems: 'center',
  },
  input: {
    marginTop: 32,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 18,
    fontSize: 22,
  },
  reasonWrap: {
    marginTop: 20,
    gap: 10,
  },
  reasonChip: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  reasonInput: {
    marginTop: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 16,
    fontSize: 17,
    minHeight: 72,
    textAlignVertical: 'top',
  },
  presetWrap: {
    marginTop: 32,
    gap: 10,
  },
  preset: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 18,
  },
  footer: {
    marginTop: 'auto',
    paddingBottom: 48,
    gap: 16,
    alignItems: 'center',
  },
  slide: {
    paddingHorizontal: 24,
    paddingTop: 32,
    justifyContent: 'flex-start',
  },
  slideArtWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  slideArt: {
    width: 176,
    height: 176,
    borderRadius: 88,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
  },
  slideEmoji: {
    fontSize: 88,
    lineHeight: 100,
  },
  slideImage: {
    width: 260,
    height: 260,
  },
  slideImageScene: {
    borderRadius: 28,
  },
  slideDots: {
    flexDirection: 'row',
    gap: 6,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  slideDot: {
    height: 6,
    borderRadius: 3,
  },
  doneFooter: {
    paddingHorizontal: 24,
    paddingBottom: 48,
    paddingTop: 24,
    alignItems: 'center',
  },
  skipLink: {
    marginTop: 16,
    paddingVertical: 4,
  },
});
