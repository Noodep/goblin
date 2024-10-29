/**
 * @file Icosahedron geometry generation.
 *
 * @author Noodep
 * @version 0.73
 */

import Vec3 from '../../math/vec3.js';
import BufferAttribute from '../../gl/buffer-attribute.js';
import { Buffer } from '../../gl/geometry/geometry.js';
import IndexedGeometry from '../../gl/geometry/indexed-geometry.js';

export default class Icosahedron {

	static generateBaseVertices(origin = new Vec3(), scale = Vec3.identity()) {
		const unit = 1.0;
		const len = unit / 2.0;
		const phi = len * Math.sqrt(1.0 + 0.5) / 2.0;

		return [
			[origin.x - len * scale.x, origin.y + 0 * scale.y, origin.z - phi * scale.z],
			[origin.x - len * scale.x, origin.y + 0 * scale.y, origin.z + phi * scale.z],
			[origin.x + len * scale.x, origin.y + 0 * scale.y, origin.z + phi * scale.z],
			[origin.x + len * scale.x, origin.y + 0 * scale.y, origin.z - phi * scale.z],

			[origin.x - phi * scale.x, origin.y - len * scale.y, origin.z + 0 * scale.z],
			[origin.x + phi * scale.x, origin.y - len * scale.y, origin.z + 0 * scale.z],
			[origin.x + phi * scale.x, origin.y + len * scale.y, origin.z + 0 * scale.z],
			[origin.x - phi * scale.x, origin.y + len * scale.y, origin.z + 0 * scale.z],

			[origin.x + 0 * scale.x, origin.y - phi * scale.y, origin.z - len * scale.z],
			[origin.x + 0 * scale.x, origin.y + phi * scale.y, origin.z - len * scale.z],
			[origin.x + 0 * scale.x, origin.y + phi * scale.y, origin.z + len * scale.z],
			[origin.x + 0 * scale.x, origin.y - phi * scale.y, origin.z + len * scale.z],
		];
	}

	static generateOutlineBoxIndices(index_offset = 0) {
		return Icosahedron.OUTLINE_INDICES.map(index => index + index_offset);
	}

	static createIndexedIcosahedronOutlineGeometry(origin = new Vec3(), scale = Vec3.identity(), vertex_typed_array = Float32Array, index_typed_array = Uint8Array, index_type = WebGLRenderingContext.UNSIGNED_BYTE, index_offset = 0) {
		// 12 vertices * 3 components by vertex
		const element_stride = 3;
		const indices = new index_typed_array(Icosahedron.generateOutlineBoxIndices(index_offset));
		const vertices = Icosahedron.generateBaseVertices(origin, scale);
		const data = new vertex_typed_array(12 * element_stride);

		let offset = 0;
		vertices.forEach(vertex => {
			data.set(vertex, element_stride * offset);
			offset++;
		});

		const index_buffer = new Buffer(indices, WebGLRenderingContext.ELEMENT_ARRAY_BUFFER)
		const vertex_buffer = new Buffer(data, WebGLRenderingContext.ARRAY_BUFFER)
		const geometry = new IndexedGeometry(index_buffer, vertex_buffer, WebGLRenderingContext.LINES, index_type);

		const stride = element_stride * vertex_typed_array.BYTES_PER_ELEMENT;
		geometry.addAttribute('position', new BufferAttribute(3, WebGLRenderingContext.FLOAT, 0, stride));

		return geometry;
	}

	static createIndexedColoredIcosahedronOutlineGeometry(color = Vec3.identity(), origin = new Vec3(), scale = Vec3.identity(), vertex_typed_array = Float32Array, index_typed_array = Uint8Array, index_type = WebGLRenderingContext.UNSIGNED_BYTE, index_offset = 0) {
		// 12 vertices * 6 components by vertex
		const element_stride = 6;
		const indices = new index_typed_array(Icosahedron.generateOutlineBoxIndices(index_offset));
		const vertices = Icosahedron.generateBaseVertices(origin, scale);
		const data = new vertex_typed_array(12 * element_stride);

		let offset = 0;
		vertices.forEach(vertex => {
			data.set(vertex, element_stride * offset);
			data.set(color._v, element_stride * offset + 3);
			offset++;
		});


		const index_buffer = new Buffer(indices, WebGLRenderingContext.ELEMENT_ARRAY_BUFFER)
		const vertex_buffer = new Buffer(data, WebGLRenderingContext.ARRAY_BUFFER)
		const geometry = new IndexedGeometry(index_buffer, vertex_buffer, WebGLRenderingContext.LINES, index_type);

		const stride = element_stride * vertex_typed_array.BYTES_PER_ELEMENT;
		geometry.addAttribute('position', new BufferAttribute(3, WebGLRenderingContext.FLOAT, 0, stride));
		geometry.addAttribute('color', new BufferAttribute(3, WebGLRenderingContext.FLOAT, 3 * vertex_typed_array.BYTES_PER_ELEMENT, stride));

		return geometry;
	}

}

Icosahedron.OUTLINE_INDICES = [
	0, 1, 0, 7, 0, 9, 0, 8, 0, 4, // 0 star
	1, 7, 7, 9, 9, 8, 8, 4, 4, 1, // 0 star band
	10, 1, 10, 7, 6, 7, 6, 9, 3, 9, 3, 8, 5, 8, 5, 4, 11, 4, 11, 1, // 0 star adjacent
	2, 3, 2, 5, 2, 11, 2, 10, 2, 6,
	3, 5, 5, 11, 11, 10, 10, 6, 6, 3
];

//1, 7, 7, 9, 9, 8, 8, 4, 4, 1
