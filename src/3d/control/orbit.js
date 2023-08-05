/**
 * @file object manipulation through orbit control
 *
 * @author noodep
 * @version 2.28
 */

import Quat from '../../math/quat.js';
import Vec3 from '../../math/vec3.js';
import Vec2 from '../../math/vec2.js';

/**
 * Class representing an Orbit Control. This class is responsible for managing and manipulating 3D objects' orientation and position in an orbit.
 *
 * @extends {EventTarget}
 */
export default class OrbitControl extends EventTarget {

	static HALF_PI = Math.PI / 2.0;
	static TWO_PI = 2.0 * Math.PI;
	static SQRT_3 = Math.sqrt(3);
	static DEFAULT_RADIUS = 1.0;
	static DEFAULT_AZIMUTH = 0.0;
	static DEFAULT_INCLINATION = OrbitControl.HALF_PI;

	/**
	 * Create a new instance of OrbitControl.
	 *
	 * @param {Object} target - The target object.
	 * @param {Object} options - An optional options object.
	 * @property {Number} options.radius - The initial radius. Default is 1.0.
	 * @property {Number} options.azimuth - The initial azimuth. Default is 0.0.
	 * @property {Number} options.inclination - The initial inclination. Default is PI / 2.0.
	 * @property {Vec3} options.offset - The initial offset. Default is new Vec3().
	 */
	constructor(target, options = {}) {
		super();
		this._target = target;

		({
			radius: this._radius = OrbitControl.DEFAULT_RADIUS,
			azimuth: this._azimuth = OrbitControl.DEFAULT_AZIMUTH,
			inclination: this._inclination = OrbitControl.DEFAULT_INCLINATION,
			offset: this._offset = new Vec3(),
		} = options);

		this._position = new Vec3();
		this._orientation = new Quat();
		this._inclination_orientation = new Quat();

		this._updatePosition();
	}

	/**
	 * Computes an orbital position in cartesian space, using the specified parameters.
	 *
	 * @param {Vec3}   offset                   - origin of the orbital sphere.
	 * @param {Number} radius                   - radius of the orbital sphere.
	 * @param {Number} azimuth                  - azimuth of the point to compute (from positive x).
	 * @param {Number} inclination              - inclination of the point to compute (from positive z).
	 * @param {Vec3}   [postition = new Vec3()] - vector holding the result of the computation (also returned by this function).
	 *
	 * @return {Vec3} - computed position.
	 */
	static position(offset, radius, azimuth, inclination, position = new Vec3()) {

		const xy_projection_inclination_magnitude = Math.sin(inclination) * radius;

		position.x = offset.x + Math.cos(azimuth) * xy_projection_inclination_magnitude;
		position.y = offset.y + Math.sin(azimuth) * xy_projection_inclination_magnitude;
		position.z = offset.z + Math.cos(inclination) * radius;

		return position;
	}

	/**
	 * computes an orbital orientation to look at the center of the sphere from the point described by the specified parameters
	 *
	 * @param {Number} azimuth                            - azimuth of the point from which to look at the center (counter clockwise from positive x)
	 * @param {Number} inclination                        - inclination of the point from which to look at the center (from positive z)
	 * @param {Quat}   [orientation = new Quat()]         - quaternion holding the result of the computation (also returned by this function)
	 * @param {Quat}   [azimuth_orientation = new Quat()] - quaternion holding the azimuthal orientation (useful for avoiding the creation of a new quaternion every time this function is called)
	 *
	 * @return {Quat} - the computed orientation
	 */
	static orientation(azimuth, inclination, orientation = new Quat(), inclination_orientation = new Quat()) {
		// subtracting PI/2 gives the orientation to which the camera should point
		// it effectively mirrors along the inclination normal plane
		// in a xyz right handed coordinate system, if the camera is in the positive octant, it should look towards the negative octant
		// computes the inclination
		inclination_orientation.fromAxisRotation(inclination - OrbitControl.HALF_PI, Vec3.Y_AXIS);

		// computes the azimuthal rotation
		orientation.fromAxisRotation(azimuth, Vec3.Z_AXIS);

		// rotates the azimuth by the inclination
		orientation.multiply(inclination_orientation);

		return orientation;
	}

	/**
 * Converts cartesian coordinates to spherical coordinates.
 *
 * @param {Vec3} offset   - Origin of the orbital sphere.
 * @param {Vec3} position - Position in cartesian coordinates.
 * @param {Vec3} [result = new Vec3()] - Vector holding the result of the computation (also returned by this function).
 *
 * @return {Vec3} - Computed spherical coordinates (radius, azimuth, inclination).
 */
	static cartesianToSpherical(offset, position, result = new Vec3()) {
		const dx = position.x - offset.x;
		const dy = position.y - offset.y;
		const dz = position.z - offset.z;

		result.x = Math.sqrt(dx*dx + dy*dy + dz*dz); // radius
		result.y = Math.atan2(dy, dx); // azimuth
		result.z = Math.acos(dz / result.x); // inclination

		return result;
	}

	/**
		* Converts a quaternion to azimuth and inclination.
		*
		* @param {Quat} orientation           - Orientation quaternion.
		* @param {Vec2} [result = new Vec2()] - Vector holding the result of the computation (also returned by this function).
		*
		* @return {Vec2} - Computed azimuth and inclination.
		*/
	static quaternionToAzimuthInclination(orientation, result = new Vec2()) {
		// Assuming that the quaternion is a result of two rotations (around Z for azimuth and around Y for inclination):
		// 1. Compute the forward vector from quaternion
		let forward = new Vec3(0, 0, 1);
		forward = orientation.rotate(forward);
		// 2. Compute azimuth and inclination from forward vector
		result.x = Math.atan2(forward._v[1], forward._v[0]); // azimuth
		result.y = Math.acos(forward._v[2] / forward.magnitude()); // inclination
		result.y += OrbitControl.HALF_PI; // add PI/2 since it was subtracted during the original calculation

		return result;
	}

	get offset() {
		return this._offset;
	}

	set offset(offset) {
		this._offset.copy(offset);
		this._updatePosition();
	}

	get radius() {
		return this._radius;
	}

	set radius(radius) {
		this._radius = Math.max(radius, 0);
		this._updatePosition();
	}

	get azimuth() {
		return this._azimuth;
	}

	set azimuth(azimuth) {
		this._azimuth = azimuth;
		this._updatePosition();
	}

	get inclination() {
		return this._inclination;
	}

	set inclination(inclination) {
		this._inclination = inclination;
		this._updatePosition();
	}

	/**
	 * Positions/orients the camera to look at a specified Object3D.
	 *
	 * @param {Object3D} object3d - The object to center on.
	 * @param {Vec3} [direction] - A vector describing the direction to look at
	 * the object. If unspecified, the current direction of the camera is used.
	 */
	centerOn(object3d, direction) {
		({
			offset: this._offset,
			radius: this._radius,
			azimuth: this._azimuth = this._azimuth,
			inclination: this._inclination = this._inclination
		} = OrbitControl.lookAtParameters(object3d, direction));

		this._updatePosition();
	}

	/**
	 * offsets the center of the virtual sphere from the perspective of the camera.
	 */
	offsetOrigin(horizontal_delta, vertical_delta) {
		const sin_azimuth = Math.sin(this._azimuth);
		const cos_azimuth = Math.cos(this._azimuth);

		const delta_proj = -Math.cos(this._inclination) * vertical_delta;

		this._offset.x += cos_azimuth * delta_proj + sin_azimuth * horizontal_delta;
		this._offset.y += sin_azimuth * delta_proj - cos_azimuth * horizontal_delta;
		this._offset.z += Math.sin(this._inclination) * vertical_delta;

		this._updatePosition();
	}

	/**
	 * Moves the camera on the virtual sphere by changing azimuth and inclination according to provided deltas.
	 * If the updated azimuth is more than 2*PI, it is normalized by the modulus operation. Inclination is capped between 0 and PI.
	 *
	 * @param {Number} horizontal_delta - Amount to change the azimuth.
	 * @param {Number} vertical_delta - Amount to change the inclination.
	 */
	moveOnSphere(horizontal_delta, vertical_delta) {
		this._azimuth = (this._azimuth + horizontal_delta) % OrbitControl.TWO_PI;
		this._inclination = Math.max(Math.min(this._inclination + vertical_delta, Math.PI), 0);

		this._updatePosition();
		this.dispatchEvent(new CustomEvent('orientation'));
	}

	setOnSphere(azimuth, inclination) {
		this._azimuth = azimuth;
		this._inclination = inclination;

		this._updatePosition();
		this.dispatchEvent(new CustomEvent('orientation'));
	}

	setOrbitControlToTargetPose() {
		this.setFromTarget(this._target);
	}

	/**
	 * Sets the state of the OrbitControl from the given target's state.
	 * It first calculates the spherical coordinates from the target's position.
	 * Then, it determines the azimuth and inclination from the target's orientation.
	 * After normalizing these values, it updates the position of the OrbitControl to match the target.
	 *
	 * @param {Object3D} target - The target object from which to set the state.
	 */
	setFromTarget(target) {
		// Calculate the spherical coordinates from the target's position
		const sphericalCoordinates = OrbitControl.cartesianToSpherical(this._offset, target.position);

		this._radius = sphericalCoordinates.x;
		this._azimuth = sphericalCoordinates.y;
		this._inclination = sphericalCoordinates.z;

		// Calculate the azimuth and inclination from the target's orientation
		const azimuthInclination = OrbitControl.quaternionToAzimuthInclination(target.orientation);

		// We need to make sure that the azimuth and inclination are within the correct ranges
		this._azimuth = (azimuthInclination.x + OrbitControl.TWO_PI) % OrbitControl.TWO_PI;
		this._inclination = Math.max(Math.min(azimuthInclination.y, Math.PI), 0);

		// Call update position to make sure everything is synced
		this._updatePosition();
	}

	/**
	 * Resets the OrbitControl to its initial state.
	 * The offset is set to 0, inclination to PI/2 (so it's looking at the equator), azimuth to 0, and radius to 1.
	 * After resetting these values, it updates the position.
	 */
	reset() {
		this._offset.fill(0.0);
		this._theta = OrbitControl.HALF_PI;
		this._phi = 0.0;
		this._radius = OrbitControl.DEFAULT_RADIUS;

		this._updatePosition();
	}

	/**
	 * Private method that updates the target position and orientation based on the current state of the OrbitControl.
	 * It first calculates the new position using the current state, then determines the orientation.
	 * Finally, it sets the new pose for the target.
	 */
	_updatePosition() {
		OrbitControl.position(this._offset, this._radius, this._azimuth, this._inclination, this._position);
		OrbitControl.orientation(this._azimuth, this._inclination, this._orientation, this._inclination_orientation);

		this._target.setPose(this._position, this._orientation);
	}

}
