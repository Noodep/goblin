/**
 * @file utility classes for 3d font manipulation.
 *
 * @author noodep
 * @version 0.23
 */

import Vec3 from '../math/vec3.js';
import IndexedGeometry from '../gl/geometry/indexed-geometry.js';
import { Buffer } from '../gl/geometry/geometry.js';
import BufferAttribute from '../gl/buffer-attribute.js';

import Plane from '../3d/geometry/plane.js';

export default class TextUtils {

	static createAtlas(glyphs, size, family, color = 'white') {
		const canvas = document.createElement('canvas');
		const context = canvas.getContext('2d');

		const atlas = {
			texture: canvas,
			glyphs: {}
		};

		// Initializes font style.
		context.font = `${size}px ${family}`;

		let total_atlas_width = glyphs.reduce((acc, glyph) => {
			return acc + context.measureText(glyph).width;
		},0);

		// the + size/2 is an empirical value that fits most of the common fonts and sizes
		const canvas_size = TextUtils._nearestPowerOfTwo(Math.sqrt(total_atlas_width * size) + size / 2);

		canvas.width = canvas_size;
		canvas.height = canvas_size;
		// font style needs to be reset after a size change
		context.font = `${size}px ${family}`;
		context.fillStyle = `${color}`;
		context.textBaseline = 'bottom';

		let offset_x = 0;
		let offset_y = size;

		context.clearRect(0, 0, canvas_size, canvas_size);

		glyphs.forEach(glyph => {
			const metrics = context.measureText(glyph);

			if(offset_x + metrics.width > canvas_size) {
				offset_x = 0;
				offset_y += size;
			}

			atlas.glyphs[glyph] = {
				x: offset_x / canvas_size,
				y: 1.0 - (offset_y / canvas_size),
				w: metrics.width / canvas_size,
				h: size / canvas_size
			};

			context.fillText(glyph, offset_x, offset_y);
			offset_x += metrics.width;
		});

		return atlas;
	}

	/**
	 * Returns the width of the specified text using the specified atlas.
	 * The width is normalized for a height of 1.
	 *
	 * @param {String} text - String of text for which the width will be computed.
	 * @param {Object} atlas - Atlas previously created by createAtlas function.
	 * @return {Number} - The normalized width of the specified text.
	 */
	static getTextWidth(text, atlas) {
		const glyphs = Array.from(text);
		const glyph_count = glyphs.length;

		let width = 0;
		for(let idx = 0 ; idx < glyph_count ; idx++) {
			const glyph = glyphs[idx];
			const glyph_data = atlas.glyphs[glyph];

			if(!glyph_data)
				throw new Error(`Unknown glyph ${glyph}. Please use an atlas containing this glyph.`);

			const ratio = glyph_data.w / glyph_data.h;
			width += ratio;
		}

		return width;
	}

	static createTextGeometry(text, atlas, align = 0.0) {
		const glyphs = Array.from(text);
		const glyph_count = glyphs.length;

		/** @type {Uint8ArrayConstructor | Uint16ArrayConstructor} */
		let index_typed_array = Uint8Array;
		/** @type {GLenum} */
		let index_type = WebGLRenderingContext.UNSIGNED_BYTE;
		if(glyph_count * 4 > 255) {
			index_typed_array = Uint16Array;
			index_type = WebGLRenderingContext.UNSIGNED_SHORT;
		}

		const element_stride = 5;
		// 4 vertices * 5 components per vertex (3 positions, 2 uv);
		const data = new Float32Array(glyph_count * 4 * element_stride);
		// 2 triangles * 3 vertices = 6 indices
		const indices = new index_typed_array(glyph_count * 6);

		let offset_x = 0.0;
		// skips computing text_width if text origin is aligned with the start
		if (align && align !== 0.0) {
			const text_width = TextUtils.getTextWidth(text, atlas);
			offset_x = -text_width * align;
		}

		for(let idx = 0 ; idx < glyph_count ; idx++) {
			const glyph = glyphs[idx];
			const glyph_data = atlas.glyphs[glyph];

			if(!glyph_data)
				throw new Error(`Unknown glyph ${glyph}. Please use an atlas containing this glyph.`);

			const local_indices = Plane.generatePlaneIndices(idx * 4);
			indices.set(local_indices, idx * 6);

			const ratio = glyph_data.w / glyph_data.h;
			const x1 = glyph_data.x;
			const y1 = glyph_data.y;
			const x2 = glyph_data.x + glyph_data.w;
			const y2 = glyph_data.y + glyph_data.h;
			const vertices = Plane.generatePlaneVertices(new Vec3(offset_x + ratio / 2.0, 0.0, 0.0), new Vec3(ratio, 1.0, 1.0));
			const uvs = [ [x1, y1], [x2, y1], [x2, y2], [x1, y2] ];

			data.set(vertices[0], idx * 4 * element_stride + 0);
			data.set(vertices[1], idx * 4 * element_stride + 5);
			data.set(vertices[2], idx * 4 * element_stride + 10);
			data.set(vertices[3], idx * 4 * element_stride + 15);

			data.set(uvs[0], idx * 4 * element_stride + 3);
			data.set(uvs[1], idx * 4 * element_stride + 8);
			data.set(uvs[2], idx * 4 * element_stride + 13);
			data.set(uvs[3], idx * 4 * element_stride + 18);

			offset_x += ratio;
		}

		const index_buffer = new Buffer(indices, WebGLRenderingContext.ELEMENT_ARRAY_BUFFER)
		const vertex_buffer = new Buffer(data, WebGLRenderingContext.ARRAY_BUFFER)
		const geometry = new IndexedGeometry(index_buffer, vertex_buffer, WebGLRenderingContext.TRIANGLES, index_type);

		const stride = element_stride * Float32Array.BYTES_PER_ELEMENT;
		geometry.addAttribute('position', new BufferAttribute(3, WebGLRenderingContext.FLOAT, 0, stride));
		geometry.addAttribute('uv', new BufferAttribute(2, WebGLRenderingContext.FLOAT, 3 * Float32Array.BYTES_PER_ELEMENT, stride));

		return geometry;
	}

	/**
	 * @param {number} value
	 */
	static _nearestPowerOfTwo(value) {
		return Math.pow(2, Math.ceil(Math.log2(value)));
	}

}

TextUtils.GLYPH_SETS = {
	'basic': Array.from('abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ!;%:?*()_+-=.,/|"\'@#$^&{}[] '),
	'basic+digits': Array.from('!"#$%&\'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz ')
};
