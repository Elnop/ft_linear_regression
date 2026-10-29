export const REPO = 'https://github.com/Elnop/ft_linear_regression';

export const VIDEOS = {
  ml1: { id: 'EUD07IiviJg', tag: 'ML#1', title: 'Formation Machine Learning (2019)' },
  ml3: { id: 'wg7-roETbbM', tag: 'ML#3', title: 'La régression linéaire (partie 1/2)' },
  ml4: { id: 'rcl_YRyoLIY', tag: 'ML#4', title: 'Descente de gradient' },
} as const;

export const videoUrl = (id: string) => `https://www.youtube.com/watch?v=${id}`;
