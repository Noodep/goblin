const EPSILON32 = Math.pow(2, -23);

export function epsilonEquals(a, b) {
	return Math.abs(b - a) <= Number.EPSILON;
}

export function epsilon32Equals(a, b) {
	return Math.abs(b - a) <= EPSILON32;
}

export function randomFloat32() {
	return Math.fround(Math.random());
}

export function approxEquals(a, b, epsilon = 0.00001) {
	return Math.abs(a - b) < epsilon;
}
