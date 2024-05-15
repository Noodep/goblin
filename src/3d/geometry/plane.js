/**
 * @file Triangular plane geometry generation.
 *
 * @author noodep
 * @version 0.08
 */

import Vec3 from '../../math/vec3.js';
import BufferAttribute from '../../gl/buffer-attribute.js';
import Geometry from '../../gl/geometry/geometry.js';
import IndexedGeometry from '../../gl/geometry/indexed-geometry.js';

export default class Plane {

	static generatePlaneVertices(origin = new Vec3(), scale = Vec3.identity()) {
		const i = 0.5;
		return [
			[origin.x - i * scale.x, origin.y - i * scale.y, origin.z],
			[origin.x + i * scale.x, origin.y - i * scale.y, origin.z],
			[origin.x + i * scale.x, origin.y + i * scale.y, origin.z],
			[origin.x - i * scale.x, origin.y + i * scale.y, origin.z]
		];
	}

	static generatePlaneUVs() {
		return [
			[0.0, 0.0],
			[1.0, 0.0],
			[1.0, 1.0],
			[0.0, 1.0]
		];
	}

	static generatePlaneIndices(index_offset = 0) {
		return [
			0 + index_offset, 1 + index_offset, 2 + index_offset,
			0 + index_offset, 2 + index_offset, 3 + index_offset
		];
	}

	static generatePlaneMesh(origin = new Vec3(), scale = Vec3.identity(), vertex_typed_array = Float32Array) {
		// 2 triangles * 3 vertices per triangle * 3 components by vertex
		const indices = Plane.generatePlaneIndices();
		const vertices = Plane.generatePlaneVertices(origin, scale);
		const data = new vertex_typed_array(2 * 3 * 3);
		const stride = 3;
		let offset = 0;
		indices.forEach(index => {
			data.set(vertices[index], stride * offset++);
		});
		return data;
	}

	static createPlaneGeometry(origin = new Vec3(), scale = Vec3.identity(), vertex_typed_array = Float32Array) {
		const data = Plane.generatePlaneMesh(origin, scale, vertex_typed_array);

		const geometry = new Geometry(data, data.length / 3, WebGLRenderingContext.TRIANGLES);
		geometry.addAttribute('position', new BufferAttribute(3));

		return geometry;
	}

	static createIndexedPlaneGeometry(origin = new Vec3(), scale = Vec3.identity(), vertex_typed_array = Float32Array, index_typed_array = Uint8Array, index_type = WebGLRenderingContext.UNSIGNED_BYTE, index_offset = 0) {
		// 4 vertices * 3 components by vertex
		const indices = new index_typed_array(Plane.generatePlaneIndices(index_offset));
		const vertices = Plane.generatePlaneVertices(origin, scale);
		const data = new vertex_typed_array(4 * 3);

		const stride = 3;
		let offset = 0;
		vertices.forEach(vertex => {
			data.set(vertex, stride * offset++);
		});

		const geometry = new IndexedGeometry(indices, data, WebGLRenderingContext.TRIANGLES, index_type);
		geometry.addAttribute('position', new BufferAttribute(3));

		return geometry;
	}

	static createIndexedUVPlaneGeometry(origin = new Vec3(), scale = Vec3.identity(), vertex_typed_array = Float32Array, index_typed_array = Uint8Array, index_type = WebGLRenderingContext.UNSIGNED_BYTE, index_offset = 0) {
		// 4 vertices * 3 components by vertex
		const indices = new index_typed_array(Plane.generatePlaneIndices(index_offset));
		const vertices = Plane.generatePlaneVertices(origin, scale);
		const element_stride = 3 + 2;
		const data = new vertex_typed_array(4 * element_stride);
		const uvs = Plane.generatePlaneUVs();

		for(let vertex_idx = 0; vertex_idx < vertices.length ; vertex_idx++) {
			const vertex = vertices[vertex_idx];
			const uv = uvs[vertex_idx];
			data.set(Array.prototype.concat(vertex, uv), element_stride * vertex_idx);
		}

		const geometry = new IndexedGeometry(indices, data, WebGLRenderingContext.TRIANGLES, index_type);
		const stride = element_stride * Float32Array.BYTES_PER_ELEMENT;
		geometry.addAttribute('position', new BufferAttribute(3, WebGLRenderingContext.FLOAT, 0, stride));
		geometry.addAttribute('uv', new BufferAttribute(2, WebGLRenderingContext.FLOAT, 3 * Float32Array.BYTES_PER_ELEMENT, stride));

		return geometry;
	}

	static createIndexedColoredPlaneGeometry(color = Vec3.identity(), origin = new Vec3(), scale = Vec3.identity(), vertex_typed_array = Float32Array, index_typed_array = Uint8Array, index_type = WebGLRenderingContext.UNSIGNED_BYTE, index_offset = 0) {
		// 4 vertices * 6 components by vertex
		const indices = new index_typed_array(Plane.generatePlaneIndices(index_offset));
		const vertices = Plane.generatePlaneVertices(origin, scale);
		const data = new vertex_typed_array(4 * 6);

		const element_stride = 6;
		let offset = 0;
		vertices.forEach(vertex => {
			data.set(vertex, element_stride * offset);
			data.set(color._v, element_stride * offset + 3);
			offset++;
		});

		const stride = element_stride * vertex_typed_array.BYTES_PER_ELEMENT;
		const geometry = new IndexedGeometry(indices, data, WebGLRenderingContext.TRIANGLES, index_type);
		geometry.addAttribute('position', new BufferAttribute(3, WebGLRenderingContext.FLOAT, 0, stride));
		geometry.addAttribute('color', new BufferAttribute(3, WebGLRenderingContext.FLOAT, 3 * vertex_typed_array.BYTES_PER_ELEMENT, stride));

		return geometry;
	}

	static createIndexedPlaneGeometryWithNormals(origin = new Vec3(), scale = Vec3.identity(), vertex_typed_array = Float32Array, index_typed_array = Uint8Array, index_type = WebGLRenderingContext.UNSIGNED_BYTE) {
		const vertices = Plane.generatePlaneVertices(origin, scale);
		// 2 triangles * 3 vertices per triangle * 6 components.
		// 6 components = 1 point per vertex * 3 components per point + 1 normal per vertex * 3 components per normal.
		const data = new vertex_typed_array(4 * 6);
		const indices = new index_typed_array([0 , 1 , 2 , 0 , 2 , 3]);
		const normal = [0.0, 1.0, 0.0];

		let offset = 0;
		const element_stride = 6;
		vertices.forEach(vertex => {
			data.set(vertex, offset * element_stride);
			data.set(normal, offset * element_stride + 3);
			offset++;
		});

		const geometry = new IndexedGeometry(indices, data, WebGLRenderingContext.TRIANGLES, index_type);
		const stride = element_stride * vertex_typed_array.BYTES_PER_ELEMENT;
		geometry.addAttribute('position', new BufferAttribute(3, WebGLRenderingContext.FLOAT, 0, stride));
		geometry.addAttribute('normal', new BufferAttribute(3, WebGLRenderingContext.FLOAT, 3 * vertex_typed_array.BYTES_PER_ELEMENT, stride));

		return geometry;
	}

}
