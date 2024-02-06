/**
 * @file class representing a 3D renderer that uses a WebGLRenderingContext
 *
 * @author noodep
 * @version 0.19
 */

import { dl, wl } from '../util/log.js';
import Program from './program.js';

export default class WebGLRenderer {

	/**
	 * @constructor
	 * @memberOf module:gl
	 * @alias WebGLRenderer
	 *
	 * Creates a WebGLRenderer that uses a WebGLRenderingContext as rendering support.
	 *
	 * @param {HTMLCanvasElement} canvas - the canvas element to be used as context.
	 * @param {String} context_type - type of the context backing this renderer (e.g. 'webgl', 'webgl2').
	 * @param {Object} webgl_options - options that will be passed as argument when trying to instanciate the WebGLRenderingContext.
	 * @return {module:gl.WebGLRenderer} - The newly created renderer.
	 */
	constructor({ canvas, context_type, webgl_options } = {}) {
		dl('Creating WebGlRenderer.');
		this._canvas = canvas;
		this._scenes = new Map();

		this._active_program = undefined;
		this._programs = new Map();

		this._context = undefined;
		this._animation_frame = undefined;

		this._initContext(context_type, webgl_options);
		this.updateCanvasDimensions();
	}

	/**
	 * Returns this renderer's canvas's aspect ratio
	 */
	get aspectRatio() {
		return this._context.drawingBufferWidth /
			this._context.drawingBufferHeight;
	}

	/**
	 * Sets this renderer background color as specified by the rgba array.
	 *
	 * @param {Array} rgba - An array containing red green blue alpha values (between 0.0 and 1.0).
	 */
	set background(rgba) {
		dl(`Setting background color to ${rgba}`);
		this._context.clearColor(rgba[0],rgba[1],rgba[2],rgba[3]);
	}

	/**
	 * Clears this renderer specified buffers.
	 */
	clear(buffers) {
		this._context.clear(buffers);
	}

	/**
	 * Enables the specified capability.
	 */
	enable(capability) {
		this._context.enable(capability);
	}

	/**
	 * Disables the specified capability.
	 */
	disable(capability) {
		this._context.disable(capability);
	}

	/**
	 * Adds a scene to this renderer unless a scene with the same id is already present.
	 *
	 * @param {Scene} scene - The scene to be added to this renderer.
	 * @return {Boolean} - true if the scene was successfully added, false otherwise.
	 */
	addScene(scene) {
		if(this._scenes.has(scene.id)) {
			wl(`Scene with id ${scene.id} is already present. The specified scene will not be added.\n` +
				'The existing scene needs to be removed before adding this one.');
			return false;
		}

		scene.sceneAttached(this);
		this._scenes.set(scene.id, scene);

		return true;
	}

	/**
	 * Returns the scene with the specified id.
	 *
	 * @param {String} id - Id of the scene to be returned.
	 * @return {Scene} - the scene with the specified id if it exists, undefined otherwise.
	 */
	getScene(id) {
		if(this._scenes.has(id)) {
			return this._scenes.get(id);
		}

		wl(`Scene with id ${id} does not exists.`);
		return undefined;
	}

	/**
	 * Removes a scene from this renderer if it exists.
	 *
	 * @return {Boolean} - true if the scene was successfully removed, false otherwise.
	 */
	removeScene(scene) {
		if(this._scenes.has(scene.id)) {
			return this._scenes.delete(scene.id);
		}

		wl(`Scene with id ${scene.id} does not exists.`);
		return false;
	}

	/**
	 * Updates the dimensions of the canvas to its current visible area.
	 */
	updateCanvasDimensions() {
		const scale = window.devicePixelRatio;
		this._canvas.width = this._canvas.clientWidth * scale;
		this._canvas.height = this._canvas.clientHeight * scale;
		this._context.viewport(0, 0, this._canvas.width, this._canvas.height);
	}

	/**
	 * Creates (loads, compiles and links) a Program with the specified name.
	 *
	 * @return {Program} - The newly created program.
	 */
	createProgram(name, path, ProgramClass, options) {
		if(!ProgramClass || !(ProgramClass.prototype instanceof Program))
			throw new Error(`${ProgramClass} is unknown or does not extends Program.`);

		if(this._programs.has(name)) {
			wl(`Program ${name} already exists.`);
			return false;
		}

		const configuration = {
			context: this._context,
			name: name
		};

		if(path)
			configuration['path'] = path;

		const program = new ProgramClass(configuration, options);
		this._programs.set(name, program);

		return program;
	}

	/**
	 * Returns the program with the specified name.
	 *
	 * @param {String} name - Name of the program to be returned.
	 * @return {Program} - the program with the specified name if it exists, undefined otherwise.
	 */
	getProgram(name) {
		if (this._programs.has(name)) {
			return this._programs.get(name);
		}

		wl(`Program ${name} does not exist.`);
		return undefined;
	}

	/**
	 * Sets this context active program.
	 *
	 * @param {String} name - Name of the program to be used or null to unset
	 * the active program.
	 * @return {Boolean} - true if the program with the specified name exists
	 * and is activated, false otherwise.
	 */
	useProgram(name) {
		if (name == null) {
			this._active_program = null;
			this._context.useProgram(null);
			return false;
		}

		if(this._active_program == name) {
			// wl('Program already active. Try minimizing program switching.'); commented out due to the amount of reused programs.
			return true;
		}

		const p = this.getProgram(name);
		if (!p) {
			return false;
		}

		this._active_program = name;
		this._context.useProgram(p.program);

		return true;
	}

	/**
	 * Gets this context current active program.
	 *
	 * @param {String} name - Name of the program to be returned.
	 * @return {Program} - the current active program or undefined if no program is in use.
	 */
	get activeProgram() {
		if(!this._active_program) {
			wl('There is no active program at the moment.');
			return undefined;
		}

		return this.getProgram(this._active_program);
	}

	/**
	 * Creates a new buffer object with the specified id and allocates the
	 * underlying buffer object's storage.
	 *
	 * @param {GLsizeiptr} size - size of the buffer to allocate.
	 * @param {GLenum} [buffer_type=ARRAY_BUFFER] - type of buffer to create.
	 * @param {GLenum} [buffer_usage=STATIC_DRAW] - usage of the buffer.
	 * @return {Boolean} - true if the buffer was successfully created, false otherwise.
	 */
	createBuffer(size, buffer_type = WebGLRenderingContext.ARRAY_BUFFER, buffer_usage = WebGLRenderingContext.STATIC_DRAW) {
		const buffer_object = this._context.createBuffer();
		this._context.bindBuffer(buffer_type, buffer_object);
		this._context.bufferData(buffer_type, size, buffer_usage);
		this._context.bindBuffer(buffer_type, null);
		return buffer_object;
	}

	/**
	 * Delete the specified buffer object from memory.
	 */
	deleteBuffer(buffer) {
		this._context.deleteBuffer(buffer);
	}

	/**
	 * Make the specified buffer object active.
	 *
	 * @param {WebGLBuffer} buffer - The buffer to activate.
	 * @param {GLenum} [buffer_type=ARRAY_BUFFER] - type of buffer to bind.
	 * possible values are WebGLRenderingContext.ARRAY_BUFFER and
	 * WebGLRenderingContext.ELEMENT_ARRAY_BUFFER.
	 */
	activateBuffer(buffer, buffer_type = WebGLRenderingContext.ARRAY_BUFFER) {
		this._context.bindBuffer(buffer_type, buffer);
	}

	/**
	 * Updates data of the specified buffer object.
	 *
	 * @param {WebGLBuffer} buffer - The buffer to update.
	 * @param {ArrayBuffer} buffer_data - new data to be copied.
	 * @param {GLintptr} [offset=0] - offset indicating where to start the data replacement.
	 * @param {GLenum} [buffer_type=ARRAY_BUFFER] - type of buffer to update.
	 */
	updateBufferData(buffer, buffer_data, offset = 0, buffer_type = WebGLRenderingContext.ARRAY_BUFFER) {
		this.activateBuffer(buffer, buffer_type);
		this._context.bufferSubData(buffer_type, offset, buffer_data);
	}

	/**
	 * Creates a new vertex array object with the specified id.
	 *
	 * @return {WebGLVertexArrayObject} - the newly created vertex array object.
	 */
	createVertexArray() {
		return this._context.createVertexArray();
	}

	/**
	 * Deletes the specified vertex array object.
	 */
	deleteVertexArray(vao) {
		this._context.deleteVertexArray(vao);
	}

	/**
	 * Activates the specified vertex array object.
	 */
	activateVertexArray(vao) {
		return this._context.bindVertexArray(vao);
	}

	/**
	 * Enables the specified attribute.
	 */
	enableAttribute(name, attribute) {
		const program = this.activeProgram;
		const pointer = program.getAttribute(name);
		this._context.vertexAttribPointer(
			pointer,
			attribute.size,
			attribute.type,
			WebGLRenderingContext.FALSE,
			attribute.stride,
			attribute.offset
		);

		this._context.enableVertexAttribArray(pointer);
	}

	/**
	 * Starts this renderer animation loop.
	 */
	start() {
		let previous_timestamp = 0;

		/**
		 * Execute one update and rendering pass.
		 * Then asks to be called again on the next available animationFrame.
		 */
		const __loop = (current_timestamp) => {
			const delta_t = current_timestamp - previous_timestamp;
			previous_timestamp = current_timestamp;

			this._animation_frame = window.requestAnimationFrame(__loop);
			this.clear(WebGLRenderingContext.COLOR_BUFFER_BIT | WebGLRenderingContext.DEPTH_BUFFER_BIT);
			this._scenes.forEach((scene) => {
				scene.update(delta_t);
				scene.render(this);
			});
		};

		__loop(0);
	}

	/**
	 * Initialize this renderer context with and instance of a WebGLRenderingContext.
	 *
	 * @throws {Error} - if unable to create a webgl context.
	 */
	_initContext(context_type = 'webgl', options = WebGLRenderer.DEFAULT_WEBGL_OPTIONS) {
		dl(`Creating WebGlRenderer context with options ${options}.`);
		this._context = this._canvas.getContext(context_type, options);

		if(!this._context)
			throw new Error('Unable to create webgl context.');
	}

}

WebGLRenderer.DEFAULT_WEBGL_OPTIONS = {
	alpha: false,
	premultipliedAlpha: false
};
