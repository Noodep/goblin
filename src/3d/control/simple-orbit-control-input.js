/**
 * @file simple input bindings for camera orbit controls
 *
 * @author noodep
 * @version 0.32
 */

export default class SimpleOrbitControlInput {

	static DEFAULT_SENSITIVITY = 0.005;
	static DEFAULT_WHEEL_SENSITIVITY = 10.0;
	static DEFAULT_SENSITIVITY_MODIFIER = 0.1;

	#orbit_control;
	#camera;
	#$element;
	#sensitivity;
	#sensitivity_modifier;
	#wheel_sensitivity;

	#mouseMoveHandler = this.#handleMouseMove.bind(this);

	constructor(orbit_control, camera, $element) {
		this.#orbit_control = orbit_control;
		this.#camera = camera;
		this.#$element = $element;

		this.#sensitivity = SimpleOrbitControlInput.DEFAULT_SENSITIVITY;
		this.#sensitivity_modifier = SimpleOrbitControlInput.DEFAULT_SENSITIVITY_MODIFIER;

		this.#wheel_sensitivity = SimpleOrbitControlInput.DEFAULT_WHEEL_SENSITIVITY;

		this.#attachEvents();
	}

	/**
	 * Sets up user event bindings.
	 */
	#attachEvents() {
		this.#$element.addEventListener('contextmenu', e => e.preventDefault());
		this.#$element.addEventListener('mousedown', this.#handleMouseDown.bind(this));
		this.#$element.addEventListener('mouseup', this.#handleMouseUp.bind(this));
		this.#$element.addEventListener('wheel', this.#handleMouseWheel.bind(this));
	}

	/**
	 * Handles mouse down events.
	 */
	#handleMouseDown() {
		this.#$element.addEventListener('mousemove', this.#mouseMoveHandler);
	}

	/**
	 * Handles mouse up events.
	 */
	#handleMouseUp() {
		this.#$element.removeEventListener('mousemove', this.#mouseMoveHandler);
	}

	/**
	 * Handles dragging of the target.
	 */
	#handleMouseMove(e) {
		const horizontal_delta = this.#sensitivityAdjustedDisplacement(e, e.movementX);
		const vertical_delta = this.#sensitivityAdjustedDisplacement(e, e.movementY);

		if(e.shiftKey)
			this.#orbit_control.offsetOrigin(horizontal_delta, vertical_delta);
		else
			// draging the visual sphere means moving the camera in the opposite direction, hence the negation
			this.#orbit_control.moveOnSphere(-horizontal_delta, -vertical_delta);
	}

	/**
	 * Handles dragging of the target.
	 */
	#handleMouseWheel(e) {
		e.preventDefault();

		const delta = this.#sensitivityAdjustedDisplacement(e, Math.sign(e.deltaY) * this.#wheel_sensitivity);

		if(e.shiftKey)
			this.#camera.verticalFieldOfView = this.#camera.verticalFieldOfView + delta;
		else
			this.#orbit_control.radius += delta;
	}

	/**
	 * Gets sensitivity adjusted displacement value.
	 */
	#sensitivityAdjustedDisplacement(e, raw) {
		let actual_sensitivity = this.#sensitivity;
		if(e.ctrlKey)
			actual_sensitivity *= this.#sensitivity_modifier;
		else if(e.altKey)
			actual_sensitivity /= this.#sensitivity_modifier;

		return raw * actual_sensitivity;
	}

}
