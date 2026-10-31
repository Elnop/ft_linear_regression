export type Sample = { km: number; price: number };

export type Thetas = { theta0: number; theta1: number };

export type TrainOptions = {
  learningRate: number;
  iterations: number;
};

export type TrainStep = Thetas & { iteration: number; cost: number };

export type Scale = { min: number; max: number };
