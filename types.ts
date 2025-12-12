export enum AppView {
  IMAGE_GENERATOR = 'IMAGE_GENERATOR',
  IMAGE_EDITOR = 'IMAGE_EDITOR',
  VIDEO_GENERATOR = 'VIDEO_GENERATOR',
  CODE_GENERATOR = 'CODE_GENERATOR',
}

export enum Framework {
  REACT = 'React',
  VUE = 'Vue',
  VANILLA = 'HTML/Vanilla'
}

export interface GeneratedImage {
  url: string;
  prompt: string;
  timestamp: number;
}

export interface GeneratedVideo {
  url: string;
  prompt: string;
}

export interface CodeResult {
  html: string;
  css: string;
  javascript: string;
  explanation: string;
}

export enum AspectRatio {
  SQUARE = '1:1',
  LANDSCAPE = '16:9',
  PORTRAIT = '9:16',
  WIDE = '21:9',
  STANDARD = '4:3',
  TALL = '3:4'
}

export enum ImageSize {
  ONE_K = '1K',
  TWO_K = '2K',
  FOUR_K = '4K'
}