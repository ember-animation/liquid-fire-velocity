import { animate, stop, isAnimating, timeSpent, timeRemaining, finish } from "./animate";
import versionWarnings from './version-warnings';
import './velocity-ext';

versionWarnings({
  minVelocityVersion: [0, 11, 8]
});

export { animate, stop, isAnimating, timeSpent, timeRemaining, finish };
