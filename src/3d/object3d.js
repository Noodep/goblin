/**
 * @file Object3d class that represent a object that can be manipulated in a 3d environment
 *
 * @author noodep
 * @version 0.99
 */

import { uuidv4 } from '../crypto/uuid.js';
import Mat4 from '../math/mat4.js';
import Quat from '../math/quat.js';
import Vec3 from '../math/vec3.js';
import Listenable from '../util/listenable.js';
import { wl } from '../util/log.js';

/**
 * Object in a 3D environment.
 *
 * Fires the following event types:
 * property:
 *	'origin' - When the origin property updates; passes the new origin
 *	'orientation' - When the orientation property updates; passed the new orientation
 *	'size' - When the size proprty updates; passes the new size
 *	'model' - When the world model updates; passes the new matrix
 *	'add' - When a child is added; passes this object and the added one
 *	'remove' - When a child is removed; passes this object and the removed one
 *	'destroy' - Directly after destroy() has been called
 * Note that "updates" above does not necessarily imply "changes"
 * Events will be fired when the property has the possibility of changing.
 */
export default class Object3D extends Listenable {

	/**
	 * @constructor
	 * @memberOf module:3d
	 * @alias Object3d
	 *
	 * @param {String} [id=uuidv4()] - this object's id.
	 * @param {String} [name=''] - this object's name.
	 * @param {Array} [origin] - a 3 dimensional array containing this object origin.
	 * @param {Array} [orientation] - a 3 dimensional array containing this object orientation. Euler angles in radians around XYZ.
	 * @param {Array} [scale] - a 3 dimensional array containing this object scaling.
	 * @return {module:3d.Object3d} - The newly created Object3d.
	 */
	constructor(id = uuidv4(), name = '', origin = Vec3.NULL, orientation = Quat.IDENTITY, scale = Vec3.IDENTITY) {
		super();
		this._id = id;
		this._name = name;
		this._parent = undefined;
		this._children = new Set();
		this._origin = Vec3.from(origin);
		this._orientation = Quat.from(orientation);
		this._scale = Vec3.from(scale);
		this._visible = true;
		this._is_model_valid = false;
		this._local_model = Mat4.identity();
		this._world_model = Mat4.identity();

		// Temporary quaternion used for rotations. This avoids creating one each time.
		this._tmp_quaternion = new Quat();
	}

	/**
	 * Getter for this Object3d id.
	 *
	 * @return {String} - This Object3d id.
	 */
	get id() {
		return this._id;
	}

	/**
	 * Getter for this Object3d display name.
	 *
	 * @return {String} - This Object3d display name.
	 */
	get name() {
		return this._name;
	}

	/**
	 * Setter for this Object3d display name.
	 *
	 * @param {module:3d.object3d} name - This Object3d new display name.
	 */
	set name(name) {
		this._name = name;
	}

	/**
	 * Getter for this Object3d parent.
	 *
	 * @return {module:3d.object3d} - This Object3d parent.
	 */
	get parent() {
		return this._parent;
	}

	/**
	 * Setter for this Object3d parent.
	 *
	 * @param {module:3d.object3d} parent - This Object3d new parent.
	 */
	set parent(parent) {
		this._parent = parent;
		this._invalidateModel();
	}

	/**
	 * Getter for the number of children of this Object3D.
	 *
	 * @return {Number} - The number of children of this Object3D.
	 */
	get childCount() {
		return this._children.size;
	}

	/**
	 * Getter for this Object3d origin.
	 *
	 * @return {module:math.Vec3} - This Object3d origin.
	 */
	get origin() {
		return this._origin;
	}

	/**
	 * Setter for this Object3d origin.
	 *
	 * @param {module:math.Vec3} v3 - This Object3d new origin.
	 */
	set origin(v3) {
		this._origin.copy(v3);
		this._invalidateModel();
		this.notify('origin', this._origin);
	}

	/**
	 * Getter for this Object3d orientation.
	 *
	 * @return {module:math.Quat} - This Object3d orientation.
	 */
	get orientation() {
		return this._orientation;
	}

	/**
	 * Setter for this Object3d orientation.
	 *
	 * @param {module:math.Quat} q - This Object3d new orientation.
	 */
	set orientation(q) {
		this._orientation.copy(q);
		this._invalidateModel();
		this.notify('orientation', this._orientation);
	}

	/**
	 * Getter for this Object3d scaling.
	 *
	 * @return {module:math.Vec3} - This Object3d scaling.
	 */
	get size() {
		return this._scale;
	}

	/**
	 * Setter for this Object3d scaling.
	 *
	 * @param {module:math.Vec3} v3 - This Object3d new scaling.
	 */
	set size(v3) {
		this._scale.copy(v3);
		this._invalidateModel();
		this.notify('size', this._scale);
	}

	// Visibility getter
	get visible() {
		return this._visible;
	}

	/**
	 * Setter for this Object3d visibility.
	 *
	 * @param {Boolean} value - This Object3d new visibility state.
	 */
	set visible(value) {
		this._visible = value;
		this.notify('visibility', this._visible);
	}

	/**
	 * Getter for this Object3d local model matrix.
	 *
	 * @return {module:math.Mat4} - This Object3d local model matrix.
	 */
	get localModel() {
		return this._local_model;
	}

	/**
	 * Getter for this Object3d world model matrix.
	 *
	 * @return {module:math.Mat4} - This Object3d world model matrix.
	 */
	get worldModel() {
		return this._world_model;
	}

	/**
	 * Adds a child to this Object3d
	 *
	 * @param {module:3d.Object3d} object - The Object3d to be added as a child.
	 */
	addChild(object) {
		if(object.parent)
			throw new Error('Unable to add the specified object to this node as it already has a parent.');

		if (this.hasChild(object)) {
			wl(`Object ${object.id} is already a child of this object.`);
			return;
		}

		this._children.add(object);
		object.parent = this;

		this.notify('add', this, object);
	}

	/**
	 * Tests whether or not the specified object is a child of this object.
	 *
	 * @param {Object3D} object - The object to search for as a child.
	 * @return {Boolean} - true if the object is a child of this object; false
	 * otherwise.
	 */
	hasChild(object) {
		return this._children.has(object);
	}

	/**
	 * Returns an iterator over the children of this Object3D.
	 */
	getChildren() {
		return this._children.values();
	}

	/**
	 * Removes a child from this Object3d if possible.
	 *
	 * @param {module:3d.Object3d} object - The Object3d to be removed.
	 * @return {Boolean} - true if the object was removed, false if the object
	 * was not a child of this Object3d.
	 */
	removeChild(object) {
		if(!object || !this.hasChild(object)) {
			wl(`Object ${object} is not a child of this object.`);
			return false;
		}

		this._children.delete(object);
		object.parent = undefined;
		this.notify('remove', this, object);
		return true;
	}

	/**
	 * Removes all children from this Object3D.
	 */
	clearChildren() {
		for (let child of this._children) {
			this.removeChild(child);
		}
	}

	/**
	 * Updates this object model matrix.
	 */
	update(delta_t) {
		if(!this._is_model_valid)
			this._revalidateModel();

		for(let child of this._children)
			child.update(delta_t);
	}

	/**
	 * Scales this Object3d by the specified vector.
	 *
	 * @param {module:math.Vec3} v - The vector by which to translate this Object3d.
	 */
	scale(v) {
		this._scale.multiply(v);
		this._invalidateModel();
		this.notify('size', this._scale);
	}

	/**
	 * Translates this Object3d by the specified vector.
	 *
	 * @param {module:math.Vec3} v - The vector by which to translate this Object3d.
	 */
	translate(v) {
		this._origin.add(v);
		this._invalidateModel();
		this.notify('origin', this._origin);
	}

	/**
	 * Translates this Object3d along its X axis.
	 *
	 * @param {Number} delta_x - the amount by which to translate this Object3d.
	 */
	translateX(delta_x) {
		this._origin.translateX(delta_x);
		this._invalidateModel();
		this.notify('origin', this._origin);
	}

	/**
	 * Translates this Object3d along its Y axis.
	 *
	 * @param {Number} delta_y - the amount by which to translate this Object3d.
	 */
	translateY(delta_y) {
		this._origin.translateY(delta_y);
		this._invalidateModel();
		this.notify('origin', this._origin);
	}

	/**
	 * Translates this Object3d along its Z axis.
	 *
	 * @param {Number} delta_z - the amount by which to translate this Object3d.
	 */
	translateZ(delta_z) {
		this._origin.translateZ(delta_z);
		this._invalidateModel();
		this.notify('origin', this._origin);
	}

	/**
	 * Applies a rotation around the specified axis to this object.
	 *
	 * @param {Number} theta - The angle (in radians) by which to rotate.
	 * @param {module:math.Vec3} axis - The axis to rotate around.
	 * @return {module:3d.object3d} - The rotated object.
	 */
	rotate(theta, axis) {
		this._tmp_quaternion.fromAxisRotation(theta, axis);
		this._orientation.multiply(this._tmp_quaternion);
		this._invalidateModel();
		this.notify('orientation', this._orientation);
	}

	/**
	 * Applies a rotation in R3 around the X axis to this object.
	 *
	 * @param {Number} theta - Angle in radians by which to rotate.
	 */
	rotateX(theta) {
		this._tmp_quaternion.fromAxisRotation(theta, Vec3.X_AXIS);
		this._orientation.multiply(this._tmp_quaternion);
		this._invalidateModel();
		this.notify('orientation', this._orientation);
	}

	/**
	 * Applies a rotation in R3 around the Y axis to this object.
	 *
	 * @param {Number} theta - Angle in radians by which to rotate.
	 */
	rotateY(theta) {
		this._tmp_quaternion.fromAxisRotation(theta, Vec3.Y_AXIS);
		this._orientation.multiply(this._tmp_quaternion);
		this._invalidateModel();
		return this;
	}

	/**
	 * Applies a rotation in R3 around the Z axis to this object.
	 *
	 * @param {Number} theta - Angle in radians by which to rotate.
	 */
	rotateZ(theta) {
		this._tmp_quaternion.fromAxisRotation(theta, Vec3.Z_AXIS);
		this._orientation.multiply(this._tmp_quaternion);
		this._invalidateModel();
		return this;
	}

	/**
	 * Removes this Object3D from the hierarchy and removes its event listeners.
	 */
	destroy() {
		if (this.parent) {
			this.parent.removeChild(this);
		}

		this.clearListeners();

		for (let child of this._children) {
			this.removeChild(child);
			child.destroy();
		}

		this.notify('destroy');
	}

	/**
	 * Invalidates this object model matrix.
	 * An invalid matrix will be recomputed during the next update.
	 */
	_invalidateModel() {
		this._is_model_valid = false;
	}

	/**
	 * Recomputes this object model matrix.
	 */
	_revalidateModel() {
		this._local_model.identity();
		this._local_model.translate(this._origin);
		this._local_model.rotateQuat(this._orientation);
		this._local_model.scaleVec(this._scale);

		this._computeWorldModel();
		this._is_model_valid = true;

		for(let child of this._children)
			child._invalidateModel();

		this.notify('model', this.worldModel);
	}

	/**
	 * Computes this object world matrix based on the local model and this object parent world matrix.
	 */
	_computeWorldModel() {
		if(this._parent) {
			this._world_model.copy(this._parent.worldModel);
			this._world_model.multiply(this._local_model);
		} else {
			this._world_model.copy(this._local_model);
		}
	}

}
