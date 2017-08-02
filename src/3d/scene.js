/**
 * @fileOverview Scene.
 * @author Noodep
 * @version 0.04
 */
'use strict';

import {dl} from '../util/log.js';
import Mat4 from '../math/mat4.js';
import Renderable from '../gl/renderable.js';
import Object3D from './object3d.js';

export default class Scene extends Object3D {

	/**
	 * @constructor
	 * @memberOf module:3d
	 * @alias Scene
	 *
	 * @param {String} [scene_id] - This scene id.
	 * @return {module:3d.Scene} - The newly created Scene.
	 */
	constructor(scene_id) {
		super({id: scene_id});
		this._lights = new Set();
		this._cameras = new Array();

		// Temporary test
		this._active_camera = 0;
		// Tempend

		this._update_listeners = new Set();

		this._program_cache = new Map();
	}

	sceneAttached(renderer) {
		this.initializeObject3D(renderer, this);
	}

	/**
	 * Adds the specified listener to this scene.
	 * UpdateListeners are objects that want to be notified when a new frame triggers.
	 */
	addUpdateListener(listener) {
		this._update_listeners.add(listener);
	}

	/**
	 * Remove the specified listener from this scene.
	 */
	removeUpdateListener(listener) {
		this._update_listeners.delete(listener);
	}

	/**
	 * Adds a camera projection matrix
	 */
	addCamera(camera) {
		this._cameras.push(camera);
	}

	/**
	 * Recursive initialization of the specified Object3D.
	 *
	 * TODO This needs to update when new objects are added to the scene or any
	 * object down the hierarchy.
	 */
	initializeObject3D(renderer, object) {
		if(object instanceof Renderable) {
			object.initialize(renderer);
			this.addRenderableToProgramCache(object);
		}

		for(let child_object of object.children) {
			this.initializeObject3D(renderer, child_object);
		};
	}

	/**
	 * Add the specified {@code Renderable} to this {@code Scene} program cache.
	 */
	addRenderableToProgramCache(renderable) {
		const program_name = renderable.program;
		if(!this._program_cache.has(program_name))
			this._program_cache.set(program_name, new Set());

		this._program_cache.get(program_name).add(renderable);
	}

	/**
	 * Update this Scene.
	 */
	update(delta_t) {
		this._update_listeners.forEach((listener) => listener(delta_t));

		// Update Models
		super.update(delta_t);
	}

	/**
	 * Render this Scene using program batches.
	 */
	render(renderer) {
		this._program_cache.forEach((renderables, program_name) => {
			dl(`Rendering batch with program ${program_name}`);
			this.applyProgramState(renderer, program_name);

			for(let renderable of renderables) {
				renderable.setShaderState(renderer);
				renderable.render(renderer);
				renderable.cleanShaderState(renderer);
			};
		});

		renderer.useProgram(null);
	}

	/**
	 * Applies the specified program rendering state to the specified renderer.
	 * Camera and View for now. Fog and Overrides later.
	 */
	applyProgramState(renderer, program_name) {
		renderer.useProgram(program_name);
		const program = renderer.activeProgram;
		const camera = this._cameras[this._active_camera];

		program.applyState(renderer, camera.projection, camera.view);
	}
}

