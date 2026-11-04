import type { Art } from '@/features/graffiti/features/stickers/StickersTypes.ts';
import { CarArt } from '@/features/graffiti/features/stickers/components/presenters/CarArt.tsx';
import { DescentArt } from '@/features/graffiti/features/stickers/components/presenters/DescentArt.tsx';
import { FormulaArt } from '@/features/graffiti/features/stickers/components/presenters/FormulaArt.tsx';
import { Logo42Art } from '@/features/graffiti/features/stickers/components/presenters/Logo42Art.tsx';
import { NorminetteArt } from '@/features/graffiti/features/stickers/components/presenters/NorminetteArt.tsx';
import { PiscineArt } from '@/features/graffiti/features/stickers/components/presenters/PiscineArt.tsx';
import { ReactArt } from '@/features/graffiti/features/stickers/components/presenters/ReactArt.tsx';
import { TypescriptArt } from '@/features/graffiti/features/stickers/components/presenters/TypescriptArt.tsx';

export const logo42: Art = { viewWidth: 120, viewHeight: 120, Body: Logo42Art };
export const piscine: Art = { viewWidth: 190, viewHeight: 96, Body: PiscineArt };
export const formula: Art = { viewWidth: 220, viewHeight: 84, Body: FormulaArt };
export const car: Art = { viewWidth: 130, viewHeight: 130, Body: CarArt };
export const typescript: Art = { viewWidth: 110, viewHeight: 110, Body: TypescriptArt };
export const react: Art = { viewWidth: 124, viewHeight: 124, Body: ReactArt };
export const norminette: Art = { viewWidth: 180, viewHeight: 82, Body: NorminetteArt };
export const descent: Art = { viewWidth: 160, viewHeight: 120, Body: DescentArt };
