/**
 * @file geometry object containing data and it description.
 *
 * @author noodep
 * @version 0.91
 */

import { wl } from '../../util/log.js';
/** @import WebGLRenderer from '../webgl-renderer.js' */

/**
 * Function to assign to the destroy property after the VBO and VAO are created.
 */
function _destroyBuffers(renderer) {
	renderer.deleteBuffer(this._vbo);
	renderer.deleteVertexArray(this._vao);
	this._vbo = null;
	this._vao = null;
	this.destroy = Geometry.prototype.destroy; // Reset to empty function
	this._initialized = false;
}


export class Buffer {
	/** @type {ArrayBuffer}*/
	#data;

	/** @type {WebGLBuffer | null} */
	#vbo = null;

	/** @type {GLenum} */
	#type = null;

	/**
	 * @param {ArrayBuffer} data
	 * @param {GLenum} type
	 */
	constructor(data, type) {
		this.#data = data
		this.#type = type
	}

	/**
	 * @param {WebGLRenderer} renderer
	 */
	initialize(renderer) {
		if (this.#vbo !== null)
			this.#vbo =
			renderer.createBuffer(
				this.#data.byteLength,
				WebGLRenderingContext.ARRAY_BUFFER,
				WebGLRenderingContext.STATIC_DRAW
			);
			renderer.updateBufferData(this._vbo, this._buffer, 0, WebGLRenderingContext.ARRAY_BUFFER);
	}
}

export default class Geometry {

	/*
	 * @param {Buffer} buffer
	 * @param {int} count - number of indices to be rendered
	 */
	constructor(buffer, count, rendering_type = WebGLRenderingContext.TRIANGLES) {
		this._attributes = new Map();
		this._vao = null;

		this._buffer = buffer;
		this._count = sizecount
		this._rendering_type = rendering_type;

		this._initialized = false;
	}

	get attributes() {
		return this._attributes;
	}

	get buffer() {
		return this._buffer;
	}

	get renderingType() {
		return this._rendering_type;
	}

	get byteLength() {
		return this._buffer.byteLength;
	}

	get size() {
		return this._size;
	}

	get vao() {
		return this._vao;
	}

	/**
	 * Checks if the geometry has been initialized.
	 * @return {Boolean} True if initialized, false otherwise.
	 */
	get isInitialized() {
		return this._initialized;
	}

	addAttribute(name, attribute) {
		if(this._attributes.has(name))
			throw new Error(`Attribute ${name} already exists in this geometry.`);

		this._attributes.set(name, attribute);
	}

	initialize(renderer) {
		if (this._initialized) {
			wl('Geometry already initialized.');
			this.destroy();
		}

		this._vao = renderer.createVertexArray();

		renderer.activateVertexArray(this._vao);
		renderer.activateBuffer(this._vbo);

		this._attributes.forEach((attribute, name) => {
			renderer.enableAttribute(name, attribute);
		});

		// Prevents procedure to get additional steps
		renderer.activateVertexArray(null);

		this.destroy = _destroyBuffers.bind(this, renderer);
		this._initialized = true;
	}

	render(renderer) {
		renderer._context.drawArrays(this._rendering_type, 0, this._size);
	}

	/**
	 * Deletes the WebGL buffer objects of this geometry from GPU memory. The
	 * geometry can still be initiailzed later.
	 */
	destroy() {
		// This is empty because it cannot delete the buffers until they are
		// created and must use the same renderer for deletion as for creation.
		wl('Geometry destroyed before initialized.');
	}

}
