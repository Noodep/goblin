/**
 * @file 3-components vector manipulation
 *
 * @author oodep
 * @version 0.76
 */

import { Vec2View } from './vec2.js';

const EPSILON32 = Math.pow(2, -23);

export default class Vec3 {

	/**
	 * @constructor
	 * @memberOf module:math
	 * @alias Vec3
	 *
	 * @param {Number} [x=0] - x value.
	 * @param {Number} [y=0] - y value.
	 * @param {Number} [z=0] - z value.
	 *
	 * @return {module:math.Vec3} - The newly created vector.
	 */
	constructor(x = 0.0, y = 0.0, z = 0.0) {
		this._v = new Float32Array(3);
		this._v[0] = x;
		this._v[1] = y;
		this._v[2] = z;

		// Don't initialize/allocate this._xy so that it will not take up memory
		// if it is not used.
	}

	/**
	 * Creates a new vector having the same value for all components.
	 *
	 * @param {number} value - The value to set.
	 * @return {module:math.Vec3} - The newly created vector.
	 */
	static fill(value) {
		return new Vec3(value, value, value);
	}

	/**
	 * Creates a new vector from an Array-like (magnitude property and integer keys) object (Array, Vec2, Vec3, etc.).
	 *
	 * @param {Array} - The array containing the values with which to initialize this vector.
	 * @return {module:math.Vec3} - The newly created vector set with values from the specified Array.
	 */
	static from(array) {
		if(array && array[Symbol.iterator])
			return new Vec3(array[0], array[1], array[2]);
		return undefined;
	}

	/**
	 * Creates a new vector from the two specified vectors.
	 *
	 * @param {module:math:Vec3} u - The first vector.
	 * @param {module:math:Vec3} v - The second vector.
	 * @return {module:math.Vec3} - The newly created vector corresponding to
	 * the difference v - u.
	 */
	static difference(u, v) {
		return new Vec3(v._v[0] - u._v[0], v._v[1] - u._v[1], v._v[2] - u._v[2]);
	}

	/**
	 * Creates a new identity vector.
	 *
	 * @return {module:math.Vec3} - The newly created vector set to identity.
	 */
	static identity() {
		const v = new Vec3();
		v._v[0] = 1.0;
		v._v[1] = 1.0;
		v._v[2] = 1.0;

		return v;
	}

	/**
	 * Creates a new random vector.
	 *
	 * @return {module:math.Vec3} - The newly created vector set with random values between 0.0 and 1.0.
	 */
	static random() {
		const v = new Vec3();
		v._v[0] = Math.random();
		v._v[1] = Math.random();
		v._v[2] = Math.random();

		return v;
	}

	/**
	 * A Vec2View using this Vec3's buffer. Other permutations of the components
	 * like in GLSL are not supported.
	 */
	get xy() {
		if (!this._xy) {
			this._xy = new Vec2View(this._v.buffer);
		}

		return this._xy;
	}

	/**
	 * Sets the same value for all componenets
	 *
	 * @param {number} value - The value to set.
	 * @return {module:math.Vec3} - The vector with the componenets set.
	 */
	fill(value) {
		this._v.fill(value);
		return this;
	}

	/**
	 * Sets the vector to identiy.
	 *
	 * @return {module:math.Vec3} - This vector.
	 */
	identity() {
		this._v[0] = 1.0;
		this._v[1] = 1.0;
		this._v[2] = 1.0;

		return this;
	}

	/**
	 * Copies values of vector v3 into this vector.
	 *
	 * @param {module:math.Vec3} v3 - Vector from which to copy values.
	 * @return {module:math.Vec3} - This vector.
	 */
	copy(v3) {
		this._v[0] = v3._v[0];
		this._v[1] = v3._v[1];
		this._v[2] = v3._v[2];

		return this;
	}

	/**
	 * Clones this vector.
	 *
	 * @return {module:math.Vec3} - The newly cloned vector.
	 */
	clone() {
		return new Vec3(this._v[0],this._v[1],this._v[2]);
	}

	/**
	 * Test for equality component wise using machine EPSILON for 32 bits (2^-23)
	 *
	 * @param {module:math.Vec3} - The vector with which to make the comparison.
	 * @return {Boolean} - true if this vector and the specified vector have the same components, false otherwise.
	 */
	equals(v3) {
		return Math.abs(this._v[0] - v3._v[0]) < EPSILON32 &&
			Math.abs(this._v[1] - v3._v[1]) < EPSILON32 &&
			Math.abs(this._v[2] - v3._v[2]) < EPSILON32;
	}

	/**
	 * Computes the distance from this vector to another vector.
	 *
	 * @param {module:math.Vec3} v3 - The other vector.
	 * @return {Number} - A scalar representing the distance from this vector to
	 * the other vector.
	 */
	distance(v3) {
		return Math.hypot(this._v[0] - v3._v[0], this._v[1] - v3._v[1], this._v[2] - v3._v[2]);
	}

	/**
	 * Computes the angle in 3D space to a specified vector.
	 *
	 * @param {module:math.Vec3} v3 - The other vector.
	 * @return {Number} - A scalar representing the angle (in radians) from this
	 * vector to the other vector.
	 */
	angle(v3) {
		return Math.acos(this.dot(v3) / this.magnitude() / v3.magnitude());
	}

	/**
	 * Computes the magnitude of this vector.
	 *
	 * @return {Number} - A scalar representing the magnitude of this vector.
	 */
	magnitude() {
		return Math.hypot(this._v[0], this._v[1], this._v[2]);
	}

	/**
	 * Computes the square of the magnitude of this vector.
	 *
	 * @return {Number} - A scalar representing the square of the magnitude of
	 * this vector.
	 */
	magnitude2() {
		return this._v[0]*this._v[0] + this._v[1]*this._v[1] + this._v[2]*this._v[2];
	}

	/**
	 * Check if this vector is a unit vector.
	 *
	 * @return {Boolean} - true if this vector is a unit vector, false otherwise.
	 */
	isUnit() {
		return Math.abs(this.magnitude() - 1.0) < EPSILON32;
	}

	/**
	 * Normalize this vector, if possible.
	 *
	 * @return {module:math.Vec3} - This vector normalized.
	 */
	normalize() {
		const mag2 = this.magnitude2();
		if (Math.abs(mag2) < EPSILON32) {
			return this;
		} else {
			return this.scale(1.0 / Math.sqrt(mag2));
		}
	}

	/**
	 * Negates this vector.
	 *
	 * @return {module:math.Vec3} - The negated vector.
	 */
	negate() {
		this._v[0] = -this._v[0];
		this._v[1] = -this._v[1];
		this._v[2] = -this._v[2];

		return this;
	}

	/**
	 * Inverts this vector.
	 *
	 * @return {module:math.Vec3} - The inversed vector.
	 */
	invert() {
		this._v[0] = 1.0 / this._v[0];
		this._v[1] = 1.0 / this._v[1];
		this._v[2] = 1.0 / this._v[2];

		return this;
	}

	/**
	 * Adds the specified vector to this vector.
	 *
	 * @param {module:math.Vec3} v3 - Vector to add to this vector.
	 * @return {module:math.Vec3} - The translated vector.
	 */
	add(v3) {
		this._v[0] += v3._v[0];
		this._v[1] += v3._v[1];
		this._v[2] += v3._v[2];

		return this;
	}

	abs() {
		this._v[0] = Math.abs(this._v[0]);
		this._v[1] = Math.abs(this._v[1]);
		this._v[2] = Math.abs(this._v[2]);
	}
	/**
	 * Subtracts the specified vector from this vector.
	 *
	 * @param {module:math.Vec3} v3 - Vector to substract from this vector.
	 * @return {module:math.Vec3} - The translated vector.
	 */
	sub(v3) {
		this._v[0] -= v3._v[0];
		this._v[1] -= v3._v[1];
		this._v[2] -= v3._v[2];

		return this;
	}

	/**
	 * Multiplies this vector by a scalar.
	 *
	 * @param {Number} n - Scalar by which to multiply this vector.
	 * @return {module:math.Vec3} - The scaled vector.
	 */
	scale(n) {
		this._v[0] *= n;
		this._v[1] *= n;
		this._v[2] *= n;

		return this;
	}

	/**
	 * Multiplies this vector by another vector.
	 *
	 * @param {module:math.Vec3} n - Vector by which to multiply this vector.
	 * @return {module:math.Vec3} - The result of the multiplication.
	 */
	multiply(v3) {
		this._v[0] *= v3._v[0];
		this._v[1] *= v3._v[1];
		this._v[2] *= v3._v[2];

		return this;
	}

	/**
	 * Computes the dot product of this vector by another vector.
	 *
	 * @param {module:math.Vec3} v3 - Vector by which to compute the dot product.
	 * @return {Number} - The result of the dot product.
	 */
	dot(v3) {
		return this._v[0] * v3._v[0] + this._v[1] * v3._v[1] + this._v[2] * v3._v[2];
	}

	/**
	 * Computes the cross product of this vector and the specified vector.
	 *
	 * @param {module:math.Vec3} v3 - The vector by which to compute the cross product.
	 * @return {module:math.Vec3} - The result of the cross product.
	 */
	cross(v3) {
		const x = this._v[0];
		const y = this._v[1];
		const z = this._v[2];

		this._v[0] = y * v3._v[2] - z * v3._v[1];
		this._v[1] = z * v3._v[0] - x * v3._v[2];
		this._v[2] = x * v3._v[1] - y * v3._v[0];

		return this;
	}

	/**
	 * Rotates this vector by a quaternion.
	 *
	 * @param {module:math.Quaternion} q - The quaternion by which to rotate.
	 * @return {module:math.Vec3} - The rotated vector.
	 */
	rotate(q) {
		return q.rotate(this);
	}

	/**
	 * Rotates this vector in R3 around the X axis.
	 *
	 * @param {Number} theta - Angle by which to rotate the vector in radians.
	 * @return {module:math.Vec3} - The rotated vector.
	 */
	rotateX(theta) {
		const y = this._v[1];
		const z = this._v[2];
		const c = Math.cos(theta);
		const s = Math.sin(theta);

		this._v[1] = y * c - z * s;
		this._v[2] = z * c + y * s;

		return this;
	}

	/**
	 * Rotates this vector in R3 around the Y axis
	 *
	 * @param {Number} theta - Angle by which to rotate the vector.
	 * @return {module:math.Vec3} - The rotated vector.
	 */
	rotateY(theta) {
		const x = this._v[0];
		const z = this._v[2];
		const c = Math.cos(theta);
		const s = Math.sin(theta);

		this._v[2] = z * c - x * s;
		this._v[0] = x * c + z * s;

		return this;
	}

	/**
	 * Rotates this vector in R3 around the Z axis
	 *
	 * @param {Number} theta - Angle by which to rotate the vector.
	 * @return {Vec3} - The rotated vector.
	 */
	rotateZ(theta) {
		const x = this._v[0];
		const y = this._v[1];
		const c = Math.cos(theta);
		const s = Math.sin(theta);

		this._v[0] = x * c - y * s;
		this._v[1] = y * c + x * s;

		return this;
	}

	/**
	 * Translates this vector in R3 on the X axis by the specified amount.
	 *
	 * @param {Number} delta_x - amount by which to translate this vector on the X axis.
	 * @return {module:math.Vec3} - The translated vector.
	 */
	translateX(delta_x) {
		this._v[0] += delta_x;

		return this;
	}

	/**
	 * Translates this vector in R3 on the Y axis by the specified amount.
	 *
	 * @param {Number} delta_y - amount by which to translate this vector on the Y axis.
	 * @return {module:math.Vec3} - The translated vector.
	 */
	translateY(delta_y) {
		this._v[1] += delta_y;

		return this;
	}

	/**
	 * Translates this vector in R3 on the Z axis by the specified amount.
	 *
	 * @param {Number} delta_z - amount by which to translate this vector on the Z axis.
	 * @return {module:math.Vec3} - The translated vector.
	 */
	translateZ(delta_z) {
		this._v[2] += delta_z;

		return this;
	}

	/**
	 * Transforms this Vec3 by the specified matrix and normalizes it (scales by
	 * the inverse of the implicit w coordinate initialized to 1).
	 *
	 * @param {module:math.Mat4} m - The matrix by which to transform this vec3;
	 * @return {module:math.Vec3} - The transformed vector.
	 */
	transform(m) {
		const x = this._v[0];
		const y = this._v[1];
		const z = this._v[2];

		this._v[0] = m._m[0] * x + m._m[4] * y + m._m[8]  * z + m._m[12];
		this._v[1] = m._m[1] * x + m._m[5] * y + m._m[9]  * z + m._m[13];
		this._v[2] = m._m[2] * x + m._m[6] * y + m._m[10] * z + m._m[14];
		const w = m._m[3] * x + m._m[7] * y + m._m[11] * z + m._m[15];

		this._v[0] /= w;
		this._v[1] /= w;
		this._v[2] /= w;

		return this;
	}

	[Symbol.iterator]() {
		return this._v[Symbol.iterator]();
	}

	isUniform() {
		return this._v[0] == this._v[1] && this._v[1] == this._v[2];
	}
	/**
	 * Returns a human readable string representing this vector.
	 *
	 * @param {Number} [p=16] - The precision to use when printing coordinate
	 * values.
	 * @return {String} - A human readable String representing this vector.
	 */
	toString(p = 16) {
		return `<${this._v[0].toFixed(p)}, ${this._v[1].toFixed(p)}, ${this._v[2].toFixed(p)}>`;
	}

}

// Some aliases
Vec3.prototype.dist = Vec3.prototype.distance;
Vec3.prototype.norm = Vec3.prototype.normal;
Vec3.prototype.mag = Vec3.prototype.magnitude;
Vec3.prototype.mag2 = Vec3.prototype.magnitude2;
Vec3.prototype.mul = Vec3.prototype.multiply;

///
/// Define getters and setters for the vector's values by different names,
/// reusing the same functions.
///

const xProperty = {
	//configurable: false,
	//enumerable: false,
	get: function() { return this._v[0]; },
	set: function(val) { this._v[0] = val; }
};

const yProperty = {
	//configurable: false,
	//enumerable: false,
	get: function() { return this._v[1]; },
	set: function(val) { this._v[1] = val; }
};

const zProperty = {
	//configurable: false,
	//enumerable: false,
	get: function() { return this._v[2]; },
	set: function(val) { this._v[2] = val; }
};

Object.defineProperties(Vec3.prototype, {
	x: xProperty,
	y: yProperty,
	z: zProperty,

	r: xProperty,
	g: yProperty,
	b: zProperty,

	s: xProperty,
	t: yProperty,
	p: zProperty,

	0: xProperty,
	1: yProperty,
	2: zProperty,

	length: {
		//configurable: false,
		//enumerable: false,
		//writable: false,
		value: 3,
	},
});

/**
 * So Array.prototype.concat() can be used. Leave this as a normal property in
 * case one wants to change it.
 */
Vec3.prototype[Symbol.isConcatSpreadable] = true;

/**
 * Class to create a Vec3 who's componenets are stored in a specified
 * ArrayBuffer.
 *
 * @constructor
 * @param {ArrayBuffer} buffer - The buffer to use.
 * @param {Number} [byteOffset=0] - The byte offset in the buffer.
 * @return {module:math.Vec3View} - The newly created vector.
 */
export function Vec3View(buffer, byteOffset = 0) {
	this._v = new Float32Array(buffer, byteOffset, 3);
}
// Have to do inheritance like this because the other way requires calling
// super() in the constructor.
Vec3View.prototype = Object.create(Vec3.prototype);

/**
 * Some common vector constants.
 * Do NOT call any of the mutator methods (add, mul, cross, etc. (the ones which
 * return vectors)) on these as they are not constant and doing so will modify
 * them and likely break something else using them.
 * TODO Find a nice way to create immutable Vec3 objects (they cannot be deeply
 * frozen because they contain typed arrays).
 */
Vec3.NULL = new Vec3(0.0, 0.0, 0.0);
Vec3.IDENTITY = Vec3.identity();
Vec3.X_AXIS = new Vec3(1.0, 0.0, 0.0);
Vec3.Y_AXIS = new Vec3(0.0, 1.0, 0.0);
Vec3.Z_AXIS = new Vec3(0.0, 0.0, 1.0);
Vec3.NEG_X_AXIS = new Vec3(-1.0, 0.0, 0.0);
Vec3.NEG_Y_AXIS = new Vec3(0.0, -1.0, 0.0);
Vec3.NEG_Z_AXIS = new Vec3(0.0, 0.0, -1.0);
