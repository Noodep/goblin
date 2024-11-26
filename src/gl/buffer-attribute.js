/**
 * @file webgl attribute defines the caracteristics of a piece of rendering data
 *
 * @author noodep
 * @version 0.37
 */

export default class BufferAttribute {
	/**
	 * Constructs an instance of a BufferAttribute.
	 * @param {number} size - The number of components per vertex attribute. Must be 1, 2, 3, or 4.
	 * @param {GLenum} type - The data type of each component in the array.
	 * @param {number} offset - Offset in bytes of the first component in the vertex attribute array. Must be a multiple of the byte length of type.
	 * @param {number} stride - The distance in bytes between the beginning of consecutive vertex attributes. Can be 0 to indicate that the attributes are tightly packed.
	 * @param {number} elementCount - The total number of elements in the attribute. This is crucial for drawing operations.
	 */
	constructor(size, type = WebGLRenderingContext.FLOAT, offset = 0, stride = 0, elementCount = 0) {
		this._size = size;
		this._type = type;
		this._offset = offset;
		this._stride = stride;
		this._elementCount = elementCount;
	}

	get size() {
		return this._size;
	}

	get type() {
		return this._type;
	}

	get offset() {
		return this._offset;
	}

	get stride() {
		return this._stride;
	}

	get elementCount() {
		return this._elementCount;
	}

	set elementCount(count) {
		this._elementCount = count;
	}

}
