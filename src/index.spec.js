import rxRangeSlider from './index';

describe('rxRangeSlider', () => {
  const sliderNode = document.querySelector('#slider');
  const config = {
    bounds: [0, 1000],
    start: [100, 6000],
    stepSize: 50,
    rangeNode: sliderNode.querySelector('.slider__range'),
    handlesContainerNode: sliderNode.querySelector('.slider__handles'),
    handleStartNode: sliderNode.querySelector('.slider__handle--left'),
    handleEndNode: sliderNode.querySelector('.slider__handle--right')
  };

  const myRxRangeSlider = rxRangeSlider(config);

  myRxRangeSlider.subscribe(state => {
    console.log(state);
  });
});
