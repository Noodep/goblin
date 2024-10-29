/**
 * @file geometry object containing data and its description
 * this geometry is to be rendered with draw elements
 *
 * @author noodep
 * @version 0.44
 */

import Geometry from './geometry.js';

/**
 * Function to assign to the destroy property after the VBO and EBO are created.
 */
function _destroyBuffers(renderer) {
	renderer.deleteBuffer(this._vbo);
	renderer.deleteBuffer(this._ebo);
	renderer.deleteVertexArray(this._vao);
	this._vbo = null;
	this._ebo = null;
	this._vao = null;
	this.destroy = Geometry.prototype.destroy; // Reset to empty function
	this._initialized = false;
}

export default class IndexedGeometry extends Geometry {

	constructor(index_buffer, vertex_buffer, rendering_type = WebGLRenderingContext.TRIANGLES, index_type = WebGLRenderingContext.UNSIGNED_BYTE) {
		super(vertex_buffer, index_buffer.length, rendering_type);
		// this._ebo = null;
		this._index_buffer = index_buffer;
		this._index_type = index_type;
	}

	get indices() {
		return this._indices;
	}

	get indexType() {
		return this._index_type;
	}

	initialize(renderer) {
		super.initialize(renderer);

		this._index_buffer.initialize(renderer)


		//this._ebo = renderer.createBuffer(
		//	this._indices.byteLength,
		//	WebGLRenderingContext.ELEMENT_ARRAY_BUFFER,
		//	WebGLRenderingContext.STATIC_DRAW
		//);
		//
		//renderer.updateBufferData(this._ebo, this._indices, 0, WebGLRenderingContext.ELEMENT_ARRAY_BUFFER);

		renderer.activateVertexArray(this._vao);
		renderer.activateBuffer(this._index_buffer);
		renderer.activateVertexArray(null);

		this.destroy = _destroyBuffers.bind(this, renderer);
	}

	render(renderer) {
		renderer._context.drawElements(this._rendering_type, this._size, this._index_type, 0);
	}

}
