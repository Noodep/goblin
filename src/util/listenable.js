/**
 * @file b class to make an object generate events.
 *
 * @author noodep
 * @version 0.07
 */

import { el } from './log.js';

/**
 * Class to make an object notify a set of observers when changes occur for this
 * object.
 *
 * @see Listenable#notify() for details about how the listener is called.
 */
export default class Listenable {

	/**
	 * Creates a Listenable object with no listeners.
	 */
	constructor() {
		this._listeners = new Map();
	}

	/**
	 * Adds a listener of a specified type.
	 *
	 * @param type - The type of listener to add.
	 * @param {Function} listener - The listener to add.
	 */
	addListener(type, listener) {
		if (!(listener instanceof Function)) {
			el(`Listener ${listener} is not a function.`);
			return;
		}

		let type_listeners = this._listeners.get(type);
		if (!type_listeners) {
			type_listeners = new Set();
			this._listeners.set(type, type_listeners);
		}

		type_listeners.add(listener);
	}

	/**
	 * Removes a specified listener of a specified type or all listeners of that type if no specific listener is provided.
	 *
	 * @param {string} type - The type of listener to remove.
	 * @param {Function} [listener] - The listener to remove. If not provided, all listeners for the type are removed.
	 */
	removeListener(type, listener) {
		if (listener === undefined) {
			// If no listener is provided, remove all listeners for the type
			this._listeners.delete(type);
		} else {
			// If a specific listener is provided, remove only that listener
			let type_listeners = this._listeners.get(type);
			if (type_listeners) {
				if (type_listeners.delete(listener) && type_listeners.size === 0) {
					this._listeners.delete(type);
				}
			}
		}
	}

	/**
	 * Clears the listeners on this Listenable of a specific type or all types.
	 *
	 * @param [type] - The type of listener to clear. If unspecified, all
	 * listeners of the type are cleared.
	 */
	clearListeners(type) {
		if (arguments.length < 1) {
			this._listeners.clear();
		} else {
			this._listeners.delete(type);
		}
	}

	/**
	 * Returns an iterable over the listeners on this object of the specified
	 * type.
	 */
	getListeners(type) {
		let type_listeners = this._listeners.get(type);
		if (type_listeners) {
			return type_listeners.values();
		} else {
			return [];
		}
	}

	/**
	 * Notifies all listeners of the specified type, passing the arguments to
	 * this function after type.
	 *
	 * @param type - The type of listener to notify.
	 * @param {...} - The arguments to pass to the listener.
	 */
	notify(type) {
		let type_listeners = this._listeners.get(type);
		if (type_listeners) {
			const args = Array.prototype.slice.call(arguments, 1);
			for (let listener of type_listeners) {
				listener(...args);
			}
		}
	}

}
