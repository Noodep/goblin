/**
 * @file Renderable class that represent a Object3D  thst can be rendered on screen
 * Such object has a shader program associated with it and a geometry of some kind
 *
 * @author noodep
 * @version 0.19
 */

import { dl } from '../util/log.js';
import Object3D from '../3d/object3d.js';

/**
 * A class to represent an Object3D that can be rendered on a screen (by a
 * WebGLRenderer).
 */
export default class Renderable extends Object3D {

	/**
	 * @constructor
	 * @memberOf module:3d
	 * @alias Renderable
	 *
	 * @param {Array} geometry - This object geometry.
	 * @param {String} program - The name of this object rendering program.
	 * @param {Object} options - Object3D options - id, origin, orientation, scale.
	 * @return {module:3d.Renderable} - The newly created Renderable.
	 */
	constructor(id, name, origin, orientation, scale, geometry, program) {
		super(id, name, origin, orientation, scale);
		this._geometry = geometry;
		this._program = program;
		this._model_uniform_location = undefined;

		// Place to store a geometry between being set with the setter and being
		// initialized later in setShaderState().
		this._new_geometry = null;
	}

	static create({ id, name, origin, orientation, scale, geometry, program } = {}) {
		return new Renderable(id, name, origin, orientation, scale, geometry, program);
	}

	get program() {
		return this._program;
	}

	get geometry() {
		return this._geometry;
	}

	set geometry(geometry) {
		this._new_geometry = geometry;
	}

	initialize(renderer) {
		dl(`Initializing Renderable with id ${this.id}.`);

		renderer.useProgram(this._program);
		const program = renderer.activeProgram;

		this._model_uniform_location = program.getUniform('model');

		// Only initialize geometry if it hasn't been initialized yet
		if (!this._geometry.isInitialized) {
			this._geometry.initialize(renderer);
		}
	}

	setShaderState(renderer) {
		if (this._new_geometry) {
			if (this._geometry.isInitialized) this._geometry.destroy(renderer);
			this._geometry = this._new_geometry;
			this._geometry.initialize(renderer);
			this._new_geometry = null;
		}

		renderer.activateVertexArray(this._geometry.vao);
		renderer._context.uniformMatrix4fv(this._model_uniform_location, false, this.worldModel.matrix);
	}

	cleanShaderState(renderer) {
		renderer.activateVertexArray(null);
	}

	render(renderer) {
		this._geometry.render(renderer);
	}

	/**
	 * Deletes the geometry and the vertex array object used from GPU memory.
	 * The Renderable can still be re-initialized later.
	 */
	destroy() {
		this._geometry.destroy();
		super.destroy();
	}

}
