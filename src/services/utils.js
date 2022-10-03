import ProgressBar from 'progress';

/* eslint-disable */
export const progressBar = size =>
  new ProgressBar('uploading :path [:bar]: :received', {
    complete: '=',
    incomplete: ' ',
    width: 40,
    total: size,
  });
