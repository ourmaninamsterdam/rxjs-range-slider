// @flow

import { fromEvent, pipe } from 'rxjs';
import { merge, filter, map, scan, tap, mergeMap } from 'rxjs/operators';

const INCREMENT_LOWER = 'INCREMENT_LOWER';
const DECREMENT_LOWER = 'DECREMENT_LOWER';
const INCREMENT_UPPER = 'INCREMENT_UPPER';
const DECREMENT_UPPER = 'DECREMENT_UPPER';

type STATE_ACTION_TYPES =
  | typeof INCREMENT_LOWER
  | typeof INCREMENT_UPPER
  | typeof DECREMENT_LOWER
  | typeof DECREMENT_UPPER;

type STATE = {
  start: number,
  end: number
};

const formatCSSPercentage = num => `${num}%`;
const restrictToRange = (min, max, num) => Math.min(Math.max(min, num), max);

const createStateReducer = ({
  rangeStart,
  rangeEnd,
  stepSize
}: {
  rangeStart: number,
  rangeEnd: number,
  stepSize: number
}): Function => {
  const stateReducer = (
    state: STATE,
    action: {
      type: STATE_ACTION_TYPES
    }
  ): STATE => {
    switch (action.type) {
      case INCREMENT_LOWER:
        return {
          ...state,
          start: restrictToRange(rangeStart, state.end, state.start + stepSize)
        };
      case DECREMENT_LOWER:
        return {
          ...state,
          start: restrictToRange(rangeStart, rangeEnd, state.start - stepSize)
        };

      case INCREMENT_UPPER:
        return {
          ...state,
          end: restrictToRange(rangeStart, rangeEnd, state.end + stepSize)
        };

      case DECREMENT_UPPER:
        return {
          ...state,
          end: restrictToRange(state.start, rangeEnd, state.end - stepSize)
        };

      default:
        return state;
    }
  };

  return stateReducer;
};

const rxRangeSlider = ({
  rangeNode,
  handlesContainerNode,
  handleStartNode,
  handleEndNode,
  start: [stepStart, stepEnd],
  stepSize,
  bounds: [rangeStart, rangeEnd]
}: {
  rangeNode: HTMLElement,
  handlesContainerNode: HTMLElement,
  handleStartNode: HTMLElement,
  handleEndNode: HTMLElement,
  start: Array<number>,
  stepSize: number,
  bounds: Array<number>
}) => {
  const KEY_LEFT = 37;
  const KEY_RIGHT = 39;
  const VALID_KEYS = [KEY_LEFT, KEY_RIGHT];

  const isLeftKey = e => e.keyCode === KEY_LEFT;
  const isRightKey = e => e.keyCode === KEY_RIGHT;

  const handleStartNode$ = fromEvent(handleStartNode, 'keydown');
  const handleEndNode$ = fromEvent(handleEndNode, 'keydown');

  const stateReducer = createStateReducer({ rangeStart, rangeEnd, stepSize });

  const incrementLowerRange$ = pipe(
    filter(isRightKey),
    map(() => state => stateReducer(state, { type: INCREMENT_LOWER }))
  )(handleStartNode$);

  const decrementLowerRange$ = pipe(
    filter(isLeftKey),
    map(() => state => stateReducer(state, { type: DECREMENT_LOWER }))
  )(handleStartNode$);

  const incrementUpperRange$ = pipe(
    filter(isRightKey),
    map(() => state => stateReducer(state, { type: INCREMENT_UPPER }))
  )(handleEndNode$);

  const decrementUpperRange$ = pipe(
    filter(isLeftKey),
    map(() => state => stateReducer(state, { type: DECREMENT_UPPER }))
  )(handleEndNode$);

  const drawRange = (nodes, currentStart, currentEnd, rangeStart, rangeEnd) => {
    const container = nodes[0].parentNode;
    const width = Math.abs(((currentStart - currentEnd) / rangeEnd) * 100);
    const left = (currentStart / rangeEnd) * 100;

    Array.prototype.slice.call(nodes).forEach(node => {
      node.style.left = formatCSSPercentage(restrictToRange(0, 100, left));
      node.style.width = formatCSSPercentage(restrictToRange(0, 100, width));
    });
  };

  const mergedRanges$ = incrementLowerRange$.pipe(
    merge(decrementLowerRange$, incrementUpperRange$, decrementUpperRange$)
  );

  const state$ = pipe(
    scan((state, change) => change(state), {
      start: stepStart,
      end: stepEnd
    }),
    tap((state: Object) =>
      drawRange(
        [rangeNode, handlesContainerNode],
        state.start,
        state.end,
        rangeStart,
        rangeEnd
      )
    )
  )(mergedRanges$);

  drawRange(
    [rangeNode, handlesContainerNode],
    stepStart,
    stepEnd,
    rangeStart,
    rangeEnd
  );

  return state$;
};

export default rxRangeSlider;
