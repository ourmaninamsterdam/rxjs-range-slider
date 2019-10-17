// @flow

import { fromEvent } from 'rxjs';
import { merge } from 'rxjs/operators';

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
  const INCREMENT_LOWER = 'INCREMENT_LOWER';
  const DECREMENT_LOWER = 'DECREMENT_LOWER';
  const INCREMENT_UPPER = 'INCREMENT_UPPER';
  const DECREMENT_UPPER = 'DECREMENT_UPPER';

  const isLeftKey = e => e.keyCode === KEY_LEFT;
  const isRightKey = e => e.keyCode === KEY_RIGHT;
  const formatCSSPercentage = num => `${num}%`;
  const restrictToRange = (min, max, num) => Math.min(Math.max(min, num), max);

  const handleStartNode$ = fromEvent(handleStartNode, 'keydown');
  const handleEndNode$ = fromEvent(handleEndNode, 'keydown');

  const incrementLowerRange$ = merge(handleStartNode$)
    .filter(isRightKey)
    .map(() => state => stateReducer(state, { type: INCREMENT_LOWER }));
  const decrementLowerRange$ = merge(handleStartNode$)
    .filter(isLeftKey)
    .map(() => state => stateReducer(state, { type: DECREMENT_LOWER }));
  const incrementUpperRange$ = merge(handleEndNode$)
    .filter(isRightKey)
    .map(() => state => stateReducer(state, { type: INCREMENT_UPPER }));
  const decrementUpperRange$ = merge(handleEndNode$)
    .filter(isLeftKey)
    .map(() => state => stateReducer(state, { type: DECREMENT_UPPER }));

  const drawRange = (nodes, currentStart, currentEnd, rangeStart, rangeEnd) => {
    const container = nodes[0].parentNode;
    const width = Math.abs(((currentStart - currentEnd) / rangeEnd) * 100);
    const left = (currentStart / rangeEnd) * 100;

    Array.prototype.slice.call(nodes).forEach(node => {
      node.style.left = formatCSSPercentage(restrictToRange(0, 100, left));
      node.style.width = formatCSSPercentage(restrictToRange(0, 100, width));
    });
  };

  const stateReducer = (state, action) => {
    if (action.type === INCREMENT_LOWER) {
      return {
        ...state,
        start: restrictToRange(rangeStart, state.end, state.start + stepSize)
      };
    }
    if (action.type === DECREMENT_LOWER) {
      return {
        ...state,
        start: restrictToRange(rangeStart, rangeEnd, state.start - stepSize)
      };
    }
    if (action.type === INCREMENT_UPPER) {
      return {
        ...state,
        end: restrictToRange(rangeStart, rangeEnd, state.end + stepSize)
      };
    }
    if (action.type === DECREMENT_UPPER) {
      console.log(DECREMENT_UPPER);
      return {
        ...state,
        end: restrictToRange(state.start, rangeEnd, state.end - stepSize)
      };
    }

    return state;
  };

  const state$ = merge(
    incrementLowerRange$,
    decrementLowerRange$,
    incrementUpperRange$,
    decrementUpperRange$
  ).scan((state, change) => change(state), {
    start: stepStart,
    end: stepEnd
  });

  state$
    .do(state =>
      drawRange(
        [rangeNode, handlesContainerNode],
        state.start,
        state.end,
        rangeStart,
        rangeEnd
      )
    )
    .subscribe();

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
