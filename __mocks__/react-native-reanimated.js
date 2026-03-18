const React = require('react');
const { View, ScrollView, Text, Image } = require('react-native');

// Minimal stub — no native worklets required.
const useSharedValue = (initial) => ({ value: initial });
const useAnimatedStyle = () => ({});
const useAnimatedScrollHandler = () => () => {};
const withSpring = (v) => v;
const withTiming = (v) => v;
const withRepeat = (v) => v;
const withSequence = (...args) => args[args.length - 1];
const interpolate = (_v, _i, output) => output[0];
const Extrapolation = { CLAMP: 'CLAMP', EXTEND: 'EXTEND', IDENTITY: 'IDENTITY' };
const Easing = { inOut: () => () => {}, ease: () => {}, linear: () => {}, in: () => () => {}, out: () => () => {} };

const createAnimatedComponent = (Component) => Component;

// Chainable entering/exiting animation stub (supports .delay().springify().damping() etc.)
const animationStub = () => {
  const stub = {
    delay: () => stub,
    springify: () => stub,
    damping: () => stub,
    stiffness: () => stub,
    duration: () => stub,
    easing: () => stub,
    withInitialValues: () => stub,
  };
  return stub;
};

const FadeInDown = animationStub();
const FadeOutUp = animationStub();
const FadeIn = animationStub();
const FadeOut = animationStub();
const LinearTransition = animationStub();
const SlideInRight = animationStub();
const SlideOutLeft = animationStub();

const Animated = {
  View,
  ScrollView,
  Text,
  Image,
  createAnimatedComponent,
};

module.exports = {
  __esModule: true,
  default: Animated,
  ...Animated,
  useSharedValue,
  useAnimatedStyle,
  useAnimatedScrollHandler,
  withSpring,
  withTiming,
  withRepeat,
  withSequence,
  interpolate,
  Extrapolation,
  Easing,
  createAnimatedComponent,
  FadeInDown,
  FadeOutUp,
  FadeIn,
  FadeOut,
  LinearTransition,
  SlideInRight,
  SlideOutLeft,
};
