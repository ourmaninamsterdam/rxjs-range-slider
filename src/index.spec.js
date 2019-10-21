import rxRangeSlider from './index';

const createHTMLFixture = content => {
  const node = document.createElement('div');
  node.innerHTML = content;
  return node;
};

const addToDocument = node => document.body.appendChild(node);

const createSlider = config => {
  const htmlElement = createHTMLFixture(
    `
      <div class="slider" id="slider">
        <div class="slider__range"></div>
        <div class="slider__handles">
          <div tabIndex="1" class="handle slider__handle slider__handle--left"></div>
          <div tabIndex="2" class="handle slider__handle slider__handle--right"></div>
        </div>  
      </div>
    `
  );
  addToDocument(htmlElement);

  const sliderNode = document.querySelector('#slider');
  const handleStartNode = sliderNode.querySelector('.slider__handle--left');
  const handleEndNode = sliderNode.querySelector('.slider__handle--right');
  const rangeNode = sliderNode.querySelector('.slider__range');
  const handlesContainerNode = sliderNode.querySelector('.slider__handles');

  const myRxRangeSlider = rxRangeSlider({
    ...config,
    sliderNode,
    rangeNode,
    handlesContainerNode,
    handleStartNode,
    handleEndNode
  });

  return {
    sliderNode,
    rangeNode,
    handlesContainerNode,
    handleStartNode,
    handleEndNode,
    slider: myRxRangeSlider
  };
};

const KEY_LEFT = 37;
const KEY_RIGHT = 39;

const arrowKeyRightEvent = new KeyboardEvent('keydown', {
  bubbles: true,
  cancelable: true,
  shiftKey: false,
  keyCode: KEY_RIGHT
});

const arrowKeyLeftEvent = new KeyboardEvent('keydown', {
  bubbles: true,
  cancelable: true,
  shiftKey: false,
  keyCode: KEY_LEFT
});

describe('rxRangeSlider', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  it.skip('should increase the start value by the step size when the right arrow key is clicked', done => {
    const { slider: myRxRangeSlider, handleStartNode } = createSlider({
      bounds: [0, 5000],
      start: [250, 1000],
      stepSize: 250
    });

    myRxRangeSlider.subscribe(state => {
      expect(state.start).toEqual(500);
      done();
    });

    myRxRangeSlider.subscribe(state => {
      expect(state.start).toEqual(750);
      done();
    });

    myRxRangeSlider.subscribe(state => {
      expect(state.start).toEqual(1000);
      done();
    });

    handleStartNode.dispatchEvent(arrowKeyRightEvent);
    handleStartNode.dispatchEvent(arrowKeyRightEvent);
    handleStartNode.dispatchEvent(arrowKeyRightEvent);
  });

  it.skip('should decrease the start value by the step size when the left arrow key is clicked', done => {
    const { slider: myRxRangeSlider, handleStartNode } = createSlider({
      bounds: [0, 5000],
      start: [1000, 2000],
      stepSize: 250
    });

    myRxRangeSlider.subscribe(state => {
      expect(state.start).toEqual(750);
      done();
    });

    myRxRangeSlider.subscribe(state => {
      expect(state.start).toEqual(500);
      done();
    });

    myRxRangeSlider.subscribe(state => {
      expect(state.start).toEqual(250);
      done();
    });

    handleStartNode.dispatchEvent(arrowKeyLeftEvent);
    handleStartNode.dispatchEvent(arrowKeyLeftEvent);
    handleStartNode.dispatchEvent(arrowKeyLeftEvent);
  });
});
