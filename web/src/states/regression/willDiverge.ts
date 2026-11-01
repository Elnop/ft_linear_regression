const DIVERGENCE_LEARNING_RATE = 1.75;

export const willDiverge = (learningRate: number) => learningRate > DIVERGENCE_LEARNING_RATE;
