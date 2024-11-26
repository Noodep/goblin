/**
 * @file Scene
 *
 * @author noodep
 * @version 0.24
 */

import Renderable from '../gl/renderable.js';
import Object3D from './object3d.js';

/**
 * Scene to render a hierarchy of Renderables.
 *
 * Fires the following events, in addition to those in Object3D:
 *	'update' - When the scene updates; passes the time since the last update
 */
export default class Scene extends Object3D {

	/**
	 * @constructor
	 * @memberOf module:3d
	 * @alias Scene
	 *
	 * @param {String} [name] - This scene display name.
	 * @return {module:3d.Scene} - The newly created Scene.
	 */
	constructor(name) {
		super(undefined, name);
		this._lights = new Set();
		this._cameras = new Array();

		// Temporary test
		this._active_camera = 0;
		// Tempend

		this._program_cache = new Map();

		// Private instance symbols used to store the bound 'add' and 'remove'
		// event handlers on each parent object so that the listeners can be
		// removed when an object is removed from the scene.
		this._add_handler_symbol = Symbol(`${this.id} add`);
		this._remove_handler_symbol = Symbol(`${this.id} remove`);
	}

	/**
	 * Returns an array of all renderable objects in this scene, in no
	 * particular order.
	 */
	getRenderables() {
		const renderables = [];
		for (let cache of this._program_cache.values()) {
			for (let renderable of cache) {
				renderables.push(renderable);
			}
		}

		return renderables;
	}

	sceneAttached(renderer) {
		this.initializeObject3D(renderer, this);
	}

	/**
	 * Adds a camera projection matrix
	 */
	addCamera(camera) {
		this._cameras.push(camera);
	}

	/**
	 * Recursive initialization of the specified Object3D.
	 */
	initializeObject3D(renderer, object) {
		if(object instanceof Renderable) {
			object.initialize(renderer);
			this.addRenderableToProgramCache(object);
		}

		// Utilize (exploit) the fact that a renderer is passed to this function
		// to be able to initialize new objects added to the hierarchy without
		// having to wait until a reference to a renderer is available.
		//
		// Binding the functions to pass the this pointer and the renderer
		// creates new, anonymous functions; symbols private to this instance
		// are used to store the callbacks with the objects they are listening
		// to maintain references to them for removal in uninitializeObject3D().
		// (Even though the remove listener does not have to bind to the
		// renderer and could be defined as an arrow function in the
		// constructor, it is created with the add listener for conisistency and
		// possible future changes).
		const add_event_handler = this._addEventHandler.bind(this, renderer);
		const remove_event_handler = this._removeEventHandler.bind(this);

		object.addListener('add', add_event_handler);
		object.addListener('remove', remove_event_handler);
		object[this._add_handler_symbol] = add_event_handler;
		object[this._remove_handler_symbol] = remove_event_handler;

		for(let child_object of object.getChildren()) {
			this.initializeObject3D(renderer, child_object);
		}
	}

	/**
	 * Recursively uninitialization of the specified Object3D.
	 * This undoes the action of initializeObject3D() by recursively removing
	 * event listeners on Object3D instances and removing Renderables in the
	 * hierarchy at and below the specified object from the program cache.
	 *
	 * TODO Should renderables be destroyed via Renderable#destroy() when
	 * uninitialized, or still be allowed to exist in case they are later
	 * re-added (current behavior) ?
	 */
	uninitializeObject3D(object) {
		if (object instanceof Renderable) {
			this.removeRenderableFromProgramCache(object);
		}

		object.removeListener('add', object[this._add_handler_symbol]);
		object.removeListener('remove', object[this._remove_handler_symbol]);
		delete object[this._add_handler_symbol];
		delete object[this._remove_handler_symbol];

		for (let child_object of object.getChildren()) {
			this.uninitializeObject3D(child_object);
		}
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
	 * Remove the specified {@code Renderable} from this {@code Scene} program
	 * cache.
	 */
	removeRenderableFromProgramCache(renderable) {
		const program_name = renderable.program;
		if (this._program_cache.has(program_name)) {
			let cache = this._program_cache.get(program_name);
			cache.delete(renderable);

			// Remove the program altogether if there are no more renderables in
			// it.
			if (cache.size === 0) {
				this._program_cache.delete(program_name);
			}
		}
	}

	/**
	 * Update this Scene.
	 */
	update(delta_t) {
		this.notify('update', delta_t);

		// Update Models
		super.update(delta_t);
	}

	/**
	 * Render this Scene using program batches, respecting the visibility of renderables.
	 */
	render(renderer) {
		// render fully opaque objects first, deferring those that may blend colors
		const those_may_blend = new Map();
		this._program_cache.forEach((renderables, program_name) => {
			this.applyProgramState(renderer, program_name);

			let any_may_blend = false;
			for (let renderable of renderables) {
				// Check if the renderable is visible before rendering
				if (!renderable.visible) {
					continue; // Skip rendering this renderable if it's not visible
				}
				if (renderable.may_blend) {
					any_may_blend = true;
					continue;
				}

				renderable.setShaderState(renderer);
				renderable.render(renderer);
				renderable.cleanShaderState(renderer);
			}
			if (any_may_blend)
				those_may_blend.set(program_name, renderables);
		});
		// if there are objects that may blend, render them
		if (those_may_blend.size > 0) {
			those_may_blend.forEach((renderables, program_name) => {
				this.applyProgramState(renderer, program_name);

				for (let renderable of renderables) {
					// Check if the renderable is visible before rendering
					if (!renderable.visible) {
						continue; // Skip rendering this renderable if it's not visible
					}
					if (!renderable.may_blend) continue;

					renderable.setShaderState(renderer);
					renderable.render(renderer);
					renderable.cleanShaderState(renderer);
				}
			});
		}

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

	_addEventHandler(renderer, parent, child) {
		this.initializeObject3D(renderer, child);
	}

	_removeEventHandler(parent, child) {
		this.uninitializeObject3D(child);
	}

}
