import { EllipseTest } from './MaskShapeTests';
import { Mask } from '../types/Array2D';
export { Mask };

export const square2x2 = new Mask(2, 2, [1, 1, 1, 1]);
export const plus3x3 = new Mask(3, 3, [0, 1, 0, 1, 1, 1, 0, 1, 0]);
export const square3x3 = new Mask(3, 3, [1, 1, 1, 1, 1, 1, 1, 1, 1]);

/**
 * Create a rectangular kernel for morphological operations.
 * @param width Width of kernel.
 * @param height Height of kernel.
 * @returns Mask of the specified size.
 */
export const GenerateRectangularKernel = (width: number, height: number): Mask =>
{
	return new Mask(width, height, 1);
};

/**
 * Create an elliptic/circular kernel for morphological operations.
 * @param width Width of kernel.
 * @param height Height of kernel.
 * @returns Mask of the specified size.
 */
export const GenerateEllipticKernel = (width: number, height: number): Mask =>
{
	return Mask.From(
		new Mask(width, height, 1).Map(EllipseTest(width, height))
	);
};