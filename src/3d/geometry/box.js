/**
 * @file Triangular box geometry generation.
 *
 * @author Noodep
 * @version 0.35
 */

import Vec3 from '../../math/vec3.js';
import BufferAttribute from '../../gl/buffer-attribute.js';
import Geometry, { Buffer } from '../../gl/geometry/geometry.js';
import IndexedGeometry from '../../gl/geometry/indexed-geometry.js';

export default class Box {

	static generateBoxVertices(origin = new Vec3(), scale = Vec3.identity()) {
		const i = 0.5;
		return [
			[origin.x + i * scale.x, origin.y + i * scale.y, origin.z + i * scale.z],
			[origin.x - i * scale.x, origin.y + i * scale.y, origin.z + i * scale.z],
			[origin.x - i * scale.x, origin.y - i * scale.y, origin.z + i * scale.z],
			[origin.x + i * scale.x, origin.y - i * scale.y, origin.z + i * scale.z],
			[origin.x + i * scale.x, origin.y - i * scale.y, origin.z - i * scale.z],
			[origin.x + i * scale.x, origin.y + i * scale.y, origin.z - i * scale.z],
			[origin.x - i * scale.x, origin.y + i * scale.y, origin.z - i * scale.z],
			[origin.x - i * scale.x, origin.y - i * scale.y, origin.z - i * scale.z]
		];
	}

	static generateBoxIndices(index_offset = 0) {
		return Box.INDICES.map(index => index + index_offset);
	}

	static generatePerFaceBoxIndices(index_offset = 0) {
		return Box.PER_FACE_INDICES.map(index => index + index_offset);
	}

	static generateOutlineBoxIndices(index_offset = 0) {
		return Box.OUTLINE_INDICES.map(index => index + index_offset);
	}

	static generateBoxMesh(origin = new Vec3(), scale = Vec3.identity(), vertex_typed_array = Float32Array) {
		// 6 faces * 2 triangles by face * 3 vertices per triangle * 3 components by vertex
		const indices = Box.generateBoxIndices();
		const vertices = Box.generateBoxVertices(origin, scale);
		const data = new vertex_typed_array(6 * 2 * 3 * 3);
		const stride = 3;
		let offset = 0;
		indices.forEach(index => {
			data.set(vertices[index], stride * offset++);
		});
		return data;
	}

	static createBoxGeometry(origin = new Vec3(), scale = Vec3.identity(), vertex_typed_array = Float32Array) {
		const data = Box.generateBoxMesh(origin, scale, vertex_typed_array);

		const buffer = new Buffer(data, WebGLRenderingContext.ARRAY_BUFFER);
		const geometry = new Geometry(buffer, data.length / 3, WebGLRenderingContext.TRIANGLES);

		geometry.addAttribute('position', new BufferAttribute(3));

		return geometry;
	}

	static createIndexedBoxGeometry(origin = new Vec3(), scale = Vec3.identity(), vertex_typed_array = Float32Array, index_typed_array = Uint8Array, index_type = WebGLRenderingContext.UNSIGNED_BYTE, index_offset = 0) {
		// 8 vertices * 3 components by vertex
		const indices = new index_typed_array(Box.generateBoxIndices(index_offset));
		const vertices = Box.generateBoxVertices(origin, scale);
		const data = new vertex_typed_array(8 * 3);

		const stride = 3;
		let offset = 0;
		vertices.forEach(vertex => {
			data.set(vertex, stride * offset++);
		});

		const index_buffer = new Buffer(indices, WebGLRenderingContext.ELEMENT_ARRAY_BUFFER)
		const vertex_buffer = new Buffer(data, WebGLRenderingContext.ARRAY_BUFFER)
		const geometry = new IndexedGeometry(index_buffer, vertex_buffer, WebGLRenderingContext.TRIANGLES, index_type);

		geometry.addAttribute('position', new BufferAttribute(3));

		return geometry;
	}

	static createIndexedBoxOutlineGeometry(origin = new Vec3(), scale = Vec3.identity(), vertex_typed_array = Float32Array, index_typed_array = Uint8Array, index_type = WebGLRenderingContext.UNSIGNED_BYTE, index_offset = 0) {
		// 8 vertices * 6 components by vertex
		const indices = new index_typed_array(Box.generateOutlineBoxIndices(index_offset));
		const vertices = Box.generateBoxVertices(origin, scale);
		const data = new vertex_typed_array(8 * 3);

		const element_stride = 3;
		let offset = 0;
		vertices.forEach(vertex => {
			data.set(vertex, element_stride * offset);
			offset++;
		});

		const index_buffer = new Buffer(indices, WebGLRenderingContext.ELEMENT_ARRAY_BUFFER)
		const vertex_buffer = new Buffer(data, WebGLRenderingContext.ARRAY_BUFFER)
		const geometry = new IndexedGeometry(index_buffer, vertex_buffer, WebGLRenderingContext.TRIANGLES, index_type);

		const stride = element_stride * vertex_typed_array.BYTES_PER_ELEMENT;
		geometry.addAttribute('position', new BufferAttribute(3, WebGLRenderingContext.FLOAT, 0, stride));

		return geometry;
	}

	static createIndexedColoredBoxGeometry(color = Vec3.identity(), origin = new Vec3(), scale = Vec3.identity(), vertex_typed_array = Float32Array, index_typed_array = Uint8Array, index_type = WebGLRenderingContext.UNSIGNED_BYTE, index_offset = 0) {
		// 8 vertices * 6 components by vertex
		const indices = new index_typed_array(Box.generateBoxIndices(index_offset));
		const vertices = Box.generateBoxVertices(origin, scale);
		const data = new vertex_typed_array(8 * 6);

		const element_stride = 6;
		let offset = 0;
		vertices.forEach(vertex => {
			data.set(vertex, element_stride * offset);
			data.set(color._v, element_stride * offset + 3);
			offset++;
		});


		const index_buffer = new Buffer(indices, WebGLRenderingContext.ELEMENT_ARRAY_BUFFER)
		const vertex_buffer = new Buffer(data, WebGLRenderingContext.ARRAY_BUFFER)
		const geometry = new IndexedGeometry(index_buffer, vertex_buffer, WebGLRenderingContext.TRIANGLES, index_type);

		const stride = element_stride * vertex_typed_array.BYTES_PER_ELEMENT;
		geometry.addAttribute('position', new BufferAttribute(3, WebGLRenderingContext.FLOAT, 0, stride));
		geometry.addAttribute('color', new BufferAttribute(3, WebGLRenderingContext.FLOAT, 3 * vertex_typed_array.BYTES_PER_ELEMENT, stride));

		return geometry;
	}

	static createIndexedColoredBoxOutlineGeometry(color = Vec3.identity(), origin = new Vec3(), scale = Vec3.identity(), vertex_typed_array = Float32Array, index_typed_array = Uint8Array, index_type = WebGLRenderingContext.UNSIGNED_BYTE, index_offset = 0) {
		// 8 vertices * 6 components by vertex
		const indices = new index_typed_array(Box.generateOutlineBoxIndices(index_offset));
		const vertices = Box.generateBoxVertices(origin, scale);
		const data = new vertex_typed_array(8 * 6);

		const element_stride = 6;
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

	static createIndexedBoxGeometryWithNormals(origin = new Vec3(), scale = Vec3.identity(), vertex_typed_array = Float32Array, index_typed_array = Uint8Array, index_type = WebGLRenderingContext.UNSIGNED_BYTE) {
		const vertices = Box.generateBoxVertices(origin, scale);
		// 6 faces * 2 triangles by face * 3 vertices per triangle * 6 components.
		// 6 components = 1 point per vertex * 3 components per point + 1 normal per vertex * 3 components per normal.
		const data = new vertex_typed_array(6 * 2 * 3 * 6);
		const indices = new index_typed_array(Box.generatePerFaceBoxIndices());
		let offset = 0;
		Box.STRUCTURE.forEach(face => {
			face.vertices.forEach(vertex => {
				data.set(vertices[vertex], offset);
				offset += 3;
				data.set(face.normal, offset);
				offset += 3;
			});
		});

		const index_buffer = new Buffer(indices, WebGLRenderingContext.ELEMENT_ARRAY_BUFFER)
		const vertex_buffer = new Buffer(data, WebGLRenderingContext.ARRAY_BUFFER)
		const geometry = new IndexedGeometry(index_buffer, vertex_buffer, WebGLRenderingContext.TRIANGLES, index_type);

		const stride = 6 * vertex_typed_array.BYTES_PER_ELEMENT;
		geometry.addAttribute('position', new BufferAttribute(3, WebGLRenderingContext.FLOAT, 0, stride));
		geometry.addAttribute('normal', new BufferAttribute(3, WebGLRenderingContext.FLOAT, 3 * vertex_typed_array.BYTES_PER_ELEMENT, stride));

		return geometry;
	}

	static createIndexedColoredBoxGeometryWithNormals(color = Vec3.identity(), origin = new Vec3(), scale = Vec3.identity(), vertex_typed_array = Float32Array, index_typed_array = Uint8Array, index_type = WebGLRenderingContext.UNSIGNED_BYTE) {
		const vertices = Box.generateBoxVertices(origin, scale);
		// 6 faces * 2 triangles by face * 3 vertices per triangle * 9 components.
		// 9 components = 1 point per vertex * 3 components per point + 1 color per vertex * 3 components per point + 1 normal per vertex * 3 components per normal.
		const data = new vertex_typed_array(6 * 2 * 3 * 9);
		const indices = new index_typed_array(Box.generatePerFaceBoxIndices());
		let offset = 0;
		Box.STRUCTURE.forEach(face => {
			face.vertices.forEach(vertex => {
				data.set(vertices[vertex], offset);
				offset += 3;
				data.set(color._v, offset);
				offset += 3;
				data.set(face.normal, offset);
				offset += 3;
			});
		});

		const index_buffer = new Buffer(indices, WebGLRenderingContext.ELEMENT_ARRAY_BUFFER)
		const vertex_buffer = new Buffer(data, WebGLRenderingContext.ARRAY_BUFFER)
		const geometry = new IndexedGeometry(index_buffer, vertex_buffer, WebGLRenderingContext.TRIANGLES, index_type);

		const stride = 9 * vertex_typed_array.BYTES_PER_ELEMENT;
		geometry.addAttribute('position', new BufferAttribute(3, WebGLRenderingContext.FLOAT, 0, stride));
		geometry.addAttribute('color', new BufferAttribute(3, WebGLRenderingContext.FLOAT, 3 * vertex_typed_array.BYTES_PER_ELEMENT, stride));
		geometry.addAttribute('normal', new BufferAttribute(3, WebGLRenderingContext.FLOAT, 6 * vertex_typed_array.BYTES_PER_ELEMENT, stride));

		return geometry;
	}

}

Box.INDICES = [
	0, 1, 2, 0, 2, 3,
	0, 3, 4, 0, 4, 5,
	0, 5, 6, 0, 6, 1,
	1, 6, 7, 1, 7, 2,
	7, 4, 3, 7, 3, 2,
	4, 7, 6, 4, 6, 5
];

Box.PER_FACE_INDICES = [
	0 , 1 , 2 , 0 , 2 , 3 ,
	4 , 5 , 6 , 4 , 6 , 7 ,
	8 , 9 , 10, 8 , 10, 11,
	12, 13, 14, 12, 14, 15,
	16, 17, 18, 16, 18, 19,
	20, 21, 22, 20, 22, 23
];

Box.OUTLINE_INDICES = [
	0, 1, 1, 2, 2, 3, 3, 0,
	4, 5, 5, 6, 6, 7, 7, 4,
	0, 5, 1, 6, 2, 7, 3, 4
];

Box.STRUCTURE = [
	// Front
	{ vertices: [0,1,2,3], normal: [ 0.0, 0.0, 1.0] },
	// Right
	{ vertices: [0,3,4,5], normal: [ 1.0, 0.0, 0.0] },
	// Top
	{ vertices: [0,5,6,1], normal: [ 0.0, 1.0, 0.0] },
	// Left
	{ vertices: [1,6,7,2], normal: [-1.0, 0.0, 0.0] },
	// Bottom
	{ vertices: [7,4,3,2], normal: [ 0.0,-1.0, 0.0] },
	// Back
	{ vertices: [4,7,6,5], normal: [ 0.0, 0.0,-1.0] }
];
