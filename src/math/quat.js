/**
 * @file quaternion manipulation.
 *
 * @author noodep
 * @version 0.22
 */

const EPSILON32 = Math.pow(2, -23);

export default class Quaternion {

	/**
	 * @constructor
	 * @memberOf module:math
	 * @alias Quaternion
	 *
	 * @param {Number} [w=0] - w value.
	 * @param {Number} [x=0] - x value.
	 * @param {Number} [y=0] - y value.
	 * @param {Number} [z=0] - z value.
	 * @return {module:math.Quaternion} - The newly created quaternion.
	 */
	constructor(w = 1.0, x = 0.0, y = 0.0, z = 0.0) {
		this._q = new Float32Array(4);
		this._q[0] = w;
		this._q[1] = x;
		this._q[2] = y;
		this._q[3] = z;
	}

	/**
	 * Creates a new quaternion from an Array-like (magnitude property and integer keys) object (Array, Vec2, Vec3, etc.).
	 * w is the first component.
	 *
	 * @param {Array} - The array containing the values with which to initialize this quaternion.
	 * @return {module:math.Vec3} - The newly created quaternion set with values from the specified Array.
	 */
	static from(array) {
		if(array && array[Symbol.iterator])
			return new Quaternion(array[0], array[1], array[2], array[3]);
		return undefined;
	}

	/**
	 * Creates a new quaternion from an axis rotation specified by rotating by theta around the axis axis.
	 * Axis will be normalized if necessary.
	 *
	 * @param {Number} theta - Angle by which to rotate around the specified axis.
	 * @param {Vec3} axis - The vector representation of the axis arount which to rotate.
	 *
	 * @return {module:math.Quaternion} - The newly created quaternion representing the specified rotation.
	 */
	static fromAxisRotation(theta, axis) {
		return new Quaternion().fromAxisRotation(theta, axis);
	}

	/**
	 * Creates a new quaternion describing a which would transform one vector
	 * into another vector (in terms of direction)
	 */
	static fromVecToVec(vec1, vec2) {
		return new Quaternion().fromVecToVec(vec1, vec2);
	}

	/**
	 * Creates a new identity quaternion.
	 *
	 * @return {module:math.Quaternion} - The newly created identity quaternion.
	 */
	static identity() {
		const q = new Quaternion();
		q._q[0] = 1.0;
		q._q[1] = 0.0;
		q._q[2] = 0.0;
		q._q[3] = 0.0;

		return q;
	}

	/**
	 * Sets the quaternion to identity.
	 *
	 * @return {module:math.Quaternion} - This quaternion.
	 */
	identity() {
		this._q[0] = 1.0;
		this._q[1] = 0.0;
		this._q[2] = 0.0;
		this._q[3] = 0.0;

		return this;
	}

	/**
	 * Sets this quaternion values from an axis rotation specified by rotating by theta around the axis axis.
	 * Axis will be normalized if necessarry.
	 *
	 * @param {Number} theta - Angle by which to rotate around the specified axis.
	 * @param {Vec3} axis - The vector representation of the axis arount which to rotate.
	 *
	 * @return {module:math.Quaternion} - This quaternion representing the specified rotation.
	 */
	fromAxisRotation(theta, axis) {
		if(!axis.isUnit())
			axis = axis.clone().normalize();

		const half_theta = theta / 2.0;
		const s = Math.sin(half_theta);

		this._q[0] = Math.cos(half_theta);
		this._q[1] = s * axis.x;
		this._q[2] = s * axis.y;
		this._q[3] = s * axis.z;

		return this;
	}

	/**
	 * Sets this quaternion to describe a rotation which would transform one
	 * vector into another vector (in terms of direction)
	 */
	fromVecToVec(vec1, vec2) {
		const cross = vec1.clone().cross(vec2);

		// Multiply the magnitudes but only perform 1 square root
		this._q[0] = vec1.dot(vec2) + Math.sqrt(vec1.magnitude2() * vec2.magnitude2());
		this._q[1] = cross.x;
		this._q[2] = cross.y;
		this._q[3] = cross.z;
		return this.normalize();
	}

	/**
	 * Copies values of quaternion q into this quaternion.
	 *
	 * @param {module:math.Quaternion} q - Quaternion from which to copy values.
	 * @return {module:math.Quaternion} - This Quaternion.
	 */
	copy(q) {
		this._q[0] = q._q[0];
		this._q[1] = q._q[1];
		this._q[2] = q._q[2];
		this._q[3] = q._q[3];

		return this;
	}

	/**
	 * Clones this quaternion.
	 *
	 * @return {module:math.Quaternion} - The newly cloned quaternion.
	 */
	clone() {
		return new Quaternion(this._q[0], this._q[1], this._q[2], this._q[3]);
	}

	/**
	 * Test for equality component wise using machine EPSILON for 32 bits (2^-23)
	 *
	 * @param {module:math.Quaternion} - The quaternion with which to make the comparison.
	 * @return {Boolean} - true if this quaternion and the specified quaternion have the same components, false otherwise.
	 */
	equals(q) {
		return Math.abs(this._q[0] - q._q[0]) < EPSILON32 &&
			Math.abs(this._q[1] - q._q[1]) < EPSILON32 &&
			Math.abs(this._q[2] - q._q[2]) < EPSILON32 &&
			Math.abs(this._q[3] - q._q[3]) < EPSILON32;
	}

	/**
	 * Calculates the magnitude (magnitude) of this quaternion.
	 *
	 * @return {Number} - A scalar representing the magnitude of this quaternion.
	 */
	magnitude() {
		return Math.hypot(this._q[0], this._q[1], this._q[2], this._q[3]);
	}

	/**
	 * Calculates the square of the magnitude (magnitude) of this quaternion.
	 *
	 * @return {Number} - A scalar representing the square of the magnitude of this
	 * quaternion.
	 */
	magnitude2() {
		return this._q[0]*this._q[0] + this._q[1]*this._q[1]
			+ this._q[2]*this._q[2] + this._q[3]*this._q[3];
	}

	/**
	 * Normalizes this quaternion, if possible.
	 *
	 * @return {module:math.Quaternion} - The normalized quaternion.
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
	 * Conjugates this quaternion, if possible.
	 *
	 * @return {module:math.Quaternion} - The conjugated quaternion.
	 */
	conjugate() {
		this._q[1] = -this._q[1];
		this._q[2] = -this._q[2];
		this._q[3] = -this._q[3];

		return this;
	}

	/**
	 * Inverts this quaternion, is possible. The inverse of q, q^-1, is such
	 * that q * q^-1 = 1 (the identity quaternion), and is equal to q* / |q|^2
	 * (q* is the conjugate).
	 *
	 * @return {module:math.Quaterion} - The inverted quaterion.
	 */
	invert() {
		const mag2 = this.magnitude2();
		if (Math.abs(mag2) < EPSILON32) {
			return this;
		}

		return this.conjugate().scale(1.0 / Math.sqrt(mag2));
	}

	/**
	 * Multiplies this quaternion by a scalar.
	 *
	 * @param {Number} n - Scalar by which to multiply this quaternion.
	 * @return {module:math.Quaternion} - The scaled quaternion.
	 */
	scale(n) {
		this._q[0] *= n;
		this._q[1] *= n;
		this._q[2] *= n;
		this._q[3] *= n;

		return this;
	}

	/**
	 * Multiplies this quaternion by another quaternion.
	 * This function does not allocate unecessary objects.
	 *
	 * @param {module:math.Quaternion} n - Quaternion by which to multiply this quaternion.
	 * @return {module:math.Quaternion} - The resulting quaternion.
	 */
	multiply(q) {
		// w1*w2 - v1.v2
		const w = this._q[0] * q._q[0] - (this._q[1] * q._q[1] + this._q[2] * q._q[2] + this._q[3] * q._q[3]);

		// w1*v2 + w2*v1 + v1xv2
		const x = this._q[0] * q._q[1] + q._q[0] * this._q[1] + this._q[2] * q._q[3] - this._q[3] * q._q[2];
		const y = this._q[0] * q._q[2] + q._q[0] * this._q[2] + this._q[3] * q._q[1] - this._q[1] * q._q[3];
		const z = this._q[0] * q._q[3] + q._q[0] * this._q[3] + this._q[1] * q._q[2] - this._q[2] * q._q[1];

		this._q[0] = w;
		this._q[1] = x;
		this._q[2] = y;
		this._q[3] = z;

		return this;
	}

	/**
	 * Rotates the specified vector in R3.
	 * This quaternion is assumed to be a unit quaternion.
	 *
	 * @param {module:math:Vec3} q - The vector to be rotated.
	 * @return {module:math:Vec3} - The rotated vector.
	 */
	rotate(v) {
		const x = v.x;
		const y = v.y;
		const z = v.z;

		const x2 = 2.0 * this._q[1];
		const y2 = 2.0 * this._q[2];
		const z2 = 2.0 * this._q[3];

		const xx2 = x2 * this._q[1];
		const xy2 = x2 * this._q[2];
		const xz2 = x2 * this._q[3];
		const yy2 = y2 * this._q[2];
		const yz2 = y2 * this._q[3];
		const zz2 = z2 * this._q[3];

		const wx2 = this._q[0] * x2;
		const wy2 = this._q[0] * y2;
		const wz2 = this._q[0] * z2;

		v.x = x * (1.0 - yy2 - zz2) + y * (xy2 - wz2) + z * (xz2 + wy2);
		v.y = y * (1.0 - xx2 - zz2) + x * (xy2 + wz2) + z * (yz2 - wx2);
		v.z = z * (1.0 - xx2 - yy2) + x * (xz2 - wy2) + y * (yz2 + wx2);

		return v;
	}

	/**
	 * Calculates the dot product of this quaternion with another.
	 * @param {Quaternion} other - The other quaternion to dot with this one.
	 * @return {number} The dot product of the two quaternions.
	 */
	dot(other) {
		return this._q[0] * other._q[0] + this._q[1] * other._q[1] + this._q[2] * other._q[2] + this._q[3] * other._q[3];
	}

	[Symbol.iterator]() {
		return this._q[Symbol.iterator]();
	}

	/**
	 * Negates the quaternion, effectively inverting its direction.
	 * @return {module:math.Quaternion} - This quaternion, after negation.
	 */
	negate() {
		this._q[0] = -this._q[0];
		this._q[1] = -this._q[1];
		this._q[2] = -this._q[2];
		this._q[3] = -this._q[3];
		return this;
	}

	/**
	 * Adds another quaternion to this quaternion.
	 * @param {Quaternion} other - The other quaternion to add.
	 * @return {Quaternion} - This quaternion after addition.
	 */
	add(other) {
		this._q[0] += other._q[0];
		this._q[1] += other._q[1];
		this._q[2] += other._q[2];
		this._q[3] += other._q[3];
		return this;
	}

	/**
	 * Adds another quaternion to this one, scaled by a factor.
	 * @param {Quaternion} other - The other quaternion to add.
	 * @param {number} scale - The scale factor.
	 * @return {Quaternion} - This quaternion after the scaled addition.
	 */
	addScaled(other, scale) {
		this._q[0] += other._q[0] * scale;
		this._q[1] += other._q[1] * scale;
		this._q[2] += other._q[2] * scale;
		this._q[3] += other._q[3] * scale;
		return this;
	}

	/**
	 * Returns a human readable string representing this quaternion.
	 *
	 * @param {Number} [p=16] - precision to use when printing coordinate values.
	 * @return {String} - A human readable String representing this quaternion.
	 */
	toString(precision = 16) {
		return `(${this._q[0].toFixed(precision)}, ${this._q[1].toFixed(precision)}, ${this._q[2].toFixed(precision)}, ${this._q[3].toFixed(precision)})`;
	}

}

///
/// Define getters and setters for the quaternion's values by different names,
/// reusing the same functions.
///

const wProperty = {
	get: function() { return this._q[0]; },
	set: function(val) { this._q[0] = val; }
};

const xProperty = {
	get: function() { return this._q[1]; },
	set: function(val) { this._q[1] = val; }
};

const yProperty = {
	get: function() { return this._q[2]; },
	set: function(val) { this._q[2] = val; }
};

const zProperty = {
	get: function() { return this._q[3]; },
	set: function(val) { this._q[3] = val; }
};

Object.defineProperty(Quaternion.prototype, 'w', wProperty);
Object.defineProperty(Quaternion.prototype, 'x', xProperty);
Object.defineProperty(Quaternion.prototype, 'y', yProperty);
Object.defineProperty(Quaternion.prototype, 'z', zProperty);

Object.defineProperty(Quaternion.prototype, 0, wProperty);
Object.defineProperty(Quaternion.prototype, 1, xProperty);
Object.defineProperty(Quaternion.prototype, 2, yProperty);
Object.defineProperty(Quaternion.prototype, 3, zProperty);

// Some aliases
Quaternion.prototype.norm = Quaternion.prototype.normal;
Quaternion.prototype.mag = Quaternion.prototype.magnitude;
Quaternion.prototype.mag2 = Quaternion.prototype.magnitude2;
Quaternion.prototype.mul = Quaternion.prototype.multiply;

/**
 * Make Quaternions act like arrays
 */
Quaternion.prototype[Symbol.isConcatSpreadable] = true;
Quaternion.prototype.length = 4;

/**
 * Class to create a Quaternion who's componenets are stored in a specified
 * ArrayBuffer.
 *
 * @constructor
 * @param {ArrayBuffer} buffer - The buffer to use.
 * @param {Number} [byteOffset=0] - The byte offset in the buffer.
 * @return {module:math.QuatView} - The newly created vector.
 */
export function QuatView(buffer, byteOffset = 0) {
	this._q = new Float32Array(buffer, byteOffset, 4);
}
// Have to do inheritance like this because the other way requires calling
// super() in the constructor.
QuatView.prototype = Object.create(Quaternion.prototype);

/**
 * Some common vector constants.
 * @see Vec3 for why caution should be used when using these.
 */
Quaternion.IDENTITY = Quaternion.identity();
