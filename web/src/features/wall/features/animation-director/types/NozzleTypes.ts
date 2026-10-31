export type SprayPathOptions = {
  speed?: number;
  width?: number;
  load?: number;
  dwell?: number;
  hesitations?: number;
  end?: 'blob' | 'taper';
  seed?: number;
};

export type SprayDotOptions = {
  duration?: number;
  width?: number;
  load?: number;
  seed?: number;
};
