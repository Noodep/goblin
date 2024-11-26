/**
 * @file A simple camera state object.
 *
 * @author noodep
 * @version 0.96
 */

import Vec3 from '../../math/vec3.js';
import Mat4 from '../../math/mat4.js';
import Quat from '../../math/quat.js';

export default class Camera {

	static DEFAULT_VERTICAL_FIELD_OF_VIEW = Math.PI / 3.0;
	static DEFAULT_NEAR_CLIPPING_PLANE = 0.1;
	static DEFAULT_FAR_CLIPPING_PLANE = 100.0;

	constructor(options) {
		({
			// Perspective
			aspect_ratio: this._aspect_ratio,
			vertical_field_of_view: this._vertical_field_of_view = Camera.DEFAULT_VERTICAL_FIELD_OF_VIEW,
			near_clipping_plane: this._near_clipping_plane = Camera.DEFAULT_NEAR_CLIPPING_PLANE,
			far_clipping_plane: this._far_clipping_plane = Camera.DEFAULT_FAR_CLIPPING_PLANE,
			// Pose
			position: this._position = new Vec3(),
			orientation: this._orientation = new Quat(),
		} = options);

		this._inverse_position = new Vec3();
		this._inverse_orientation = new Quat();

		// Matrices
		this._view = Mat4.identity();
		this._projection = Mat4.identity();
		this._projection_function = Mat4.prototype.perspective;

		this.updateView();
		this.updateProjection();
	}

	/**
	 * Returns this camera view matrix.
	 */
	get view() {
		return this._view;
	}

	/**
	 * Returns this camera projection matrix.
	 */
	get projection() {
		return this._projection;
	}

	/**
	 * Sets this camera position and immediately updates the view.
	 */
	set position(position) {
		this._position.copy(position);
		this.updateView();
	}

	get position() {
		return this._position.clone();
	}

	/**
	 * Sets this camera orientation and immediately updates the view.
	 */
	set orientation(orientation) {
		this._orientation.copy(orientation);
		this.updateView();
	}

	get orientation() {
		return this._orientation.clone();
	}

	/**
	 * gets this camera vertical field of view
	 */
	get verticalFieldOfView() {
		return this._vertical_field_of_view;
	}

	/**
	 * Sets this camera vertical field of view and immediately updates the projection.
	 */
	set verticalFieldOfView(vertical_field_of_view) {
		this._vertical_field_of_view = Math.max(0, Math.min(Math.PI, vertical_field_of_view));
		this.updateProjection();
	}

	/**
	 * Sets this camera aspect ratio and immediately updates the projection.
	 */
	set aspectRatio(aspect_ratio) {
		this._aspect_ratio = aspect_ratio;
		this.updateProjection();
	}

	/**
	 * Sets this camera near clipping plane and immediately updates the projection.
	 */
	set nearClippingPlane(near_clipping_plane) {
		this._near_clipping_plane = near_clipping_plane;
		this.updateProjection();
	}

	/**
	 * Sets this camera far clipping plane and immediately updates the projection.
	 */
	set farClippingPlane(far_clipping_plane) {
		this._far_clipping_plane = far_clipping_plane;
		this.updateProjection();
	}

	/**
	 * Sets this camera position and orientation and immediately updates the view.
	 */
	setPose(position, orientation) {
		this._position.copy(position);
		this._orientation.copy(orientation);
		this.updateView();
	}

	/**
	 * Sets this camera clipping planes and immediately updates the projection.
	 */
	setClippingPlanes(near_clipping_plane, far_clipping_plane) {
		this._near_clipping_plane = near_clipping_plane;
		this._far_clipping_plane = far_clipping_plane;
		this.updateProjection();
	}

	/**
	 * Returns the distance between the camera and the specified point.
	 */
	distanceTo(v3) {
		return this._position.distance(v3);
	}

	/**
	 * Updates the projection matrix with this object values.
	 */
	updateProjection() {
		this._projection_function.call(this._projection, this._vertical_field_of_view, this._aspect_ratio, this._near_clipping_plane, this._far_clipping_plane);
	}

	setPerspectiveProjection() {
		this._projection_function = Mat4.prototype.perspective;
		this.updateProjection();
	}

	setOrthographicProjection() {
		this._projection_function = Mat4.prototype.orthographic;
		this.updateProjection();
	}

	/**
	 * Updates the view matrix with this object values.
	 * View is inversedTR matrix.
	 */
	updateView() {
		// Inverting a rotation and transposing is the same.
		this._inverse_orientation.copy(this._orientation).invert();
		this._inverse_position.copy(this._position);
		this._inverse_orientation.rotate(this._inverse_position).negate();
		this._view.setRotationFromQuaternion(this._inverse_orientation);
		this._view.translation = this._inverse_position;
	}

	/**
	 * Returns a human readable string representing this camera pose (position and orientation).
	 *
	 * @param {Number} [p=16] - precision to use when printing floating values.
	 * @return {String} - A human readable String representing this camera pose.
	 */
	toString(precision = 16) {
		return `{position:${this._position.toString(precision)}, orientation: ${this._orientation.toString(precision)}}`;
	}

}
