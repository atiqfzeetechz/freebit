import {Dimensions} from 'react-native';

// const {height
const {width, height} = Dimensions.get('window');

export const hp = (h: number) => {
  const _height = (height * h) / 100;
  return _height;
};

export const wp = (w: number) => {
  const _width = (width * w) / 100;
  return _width;
};
