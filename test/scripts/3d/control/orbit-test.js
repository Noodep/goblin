/**
 * @file orbit control tests
 *
 * @author noodep
 * @version 0.83
 */

import { epsilonEquals, approxEquals } from '../../test-utils.js';

import Vec2 from '/src/math/vec2.js'
import Vec3 from '/src/math/vec3.js';
import Quat from '/src/math/quat.js'
import OrbitControl from '/src/3d/control/orbit.js';

export default class OrbitControlTest {

	static runAll() {
		console.log('%c----- Testing /src/3d/control/orbit.js -----','color:lightblue;');
		console.time('Perf');

		OrbitControlTest.testDefaultConstruction();
		OrbitControlTest.offsetSettingCopiesValuesAndDoesNotKeepAReferenceToSuppliedVec3();
		OrbitControlTest.setOnSphereSetsAzimuthAndInclinationAndOnlyUpdatesPositionOnce();
		OrbitControlTest.cartesianToSphericalTest();
		OrbitControlTest.quaternionToAzimuthInclinationTest();
		OrbitControlTest.setOrbitControlToTargetPoseTest();

		console.timeEnd('Perf');
		console.log('%c----------------------------------------','color:lightblue;');
		console.log('\n');
	}

	static testDefaultConstruction() {
		const target = {
			setPose: () => {}
		};
		const orbit_control = new OrbitControl(target, {element: new EventTarget()});
		console.assert(orbit_control != undefined, 'Default construction does not work.');
	}

	static offsetSettingCopiesValuesAndDoesNotKeepAReferenceToSuppliedVec3() {
		const target = {
			setPose: () => {}
		};
		const orbit_control = new OrbitControl(target, {element: new EventTarget()});
		const offset = new Vec3(1.0, 2.0, 3.0);
		orbit_control.offset = offset;
		console.assert(orbit_control.offset != offset, 'Setting offset should not keep a reference to the supplied vec3 but copy values instead');
	}

	static setOnSphereSetsAzimuthAndInclinationAndOnlyUpdatesPositionOnce() {
		const target = {
			update_count: 0,
			setPose: function() { this.update_count++; }
		};
		const angle = Math.PI/4.0;
		const orbit_control = new OrbitControl(target, {element: new EventTarget()});

		// reset the update count after orbit control initialization
		target.update_count = 0;

		orbit_control.setOnSphere(angle, angle);

		console.assert(
			epsilonEquals(orbit_control.azimuth, angle),
			`azimuth should equal ${angle}, but equals ${orbit_control.azimuth} instead`
		);

		console.assert(
			epsilonEquals(orbit_control.inclination, angle),
			`inclination should equal ${angle}, but equals ${orbit_control.inclination} instead`
		);

		console.assert(
			target.update_count == 1,
			`setOnSphere should update pose only once, but updated pose ${target.update_count} times`
		);
	}

		/**
		 * Tests the cartesianToSpherical function with a complex and a simple case.
		 */
		static cartesianToSphericalTest() {
			// Complex case
			let offset = new Vec3(0, 0, 0);
			let position = new Vec3(1, 1, 1);
			let expected = new Vec3(Math.sqrt(3), Math.atan2(1, 1), Math.acos(1 / Math.sqrt(3)));
			let actual = OrbitControl.cartesianToSpherical(offset, position);
			console.assert(actual.equals(expected), `Expected ${actual} to equal ${expected}`);

			// Simple case
			position = new Vec3(1, 0, 0); // Position on X-axis at distance 1
			expected = new Vec3(1, 0, Math.PI / 2); // Radius 1, azimuth 0, inclination π/2
			actual = OrbitControl.cartesianToSpherical(offset, position);
			console.assert(actual.equals(expected), `Expected ${actual} to equal ${expected}`);
		}

			/**
			 * Tests the quaternionToAzimuthInclination function with a complex and a simple case.
			 */
		static quaternionToAzimuthInclinationTest() {
			// Complex case
			let orientation = new Quat().fromAxisRotation(Math.PI / 4, Vec3.Y_AXIS).multiply(new Quat().fromAxisRotation(Math.PI / 3, Vec3.Z_AXIS));
			let forward = new Vec3(0, 0, 1);
			forward = orientation.rotate(forward);

			// Compute expected azimuth and inclination from the rotated vector
			let expected = new Vec2();
			expected.x = Math.atan2(forward._v[1], forward._v[0]);
			expected.y = Math.acos(forward._v[2] / forward.magnitude());
			expected.y += OrbitControl.HALF_PI;

			let actual = OrbitControl.quaternionToAzimuthInclination(orientation);
			console.assert(actual.equals(expected), `Expected ${actual} to equal ${expected}`);

			// Simple case
			orientation = new Quat().fromAxisRotation(Math.PI / 2, new Vec3(0, 0, 1)); // 90 degrees rotation around Z-axis
			forward = new Vec3(1, 0, 0); // Forward along X-axis

			// Compute expected azimuth and inclination from the rotated vector
			expected = new Vec2();
			expected.x = 0; // Along X-axis
			expected.y = Math.PI / 2; // In XY plane

			actual = OrbitControl.quaternionToAzimuthInclination(orientation);
			console.assert(actual.equals(expected), `Expected ${actual} to equal ${expected}`);
		}

			/**
			 * Tests the setOrbitControlToTargetPose function with a complex and a simple case.
			 */
		static setOrbitControlToTargetPoseTest() {
			// Complex case
			let target = {
					position: new Vec3(1, 1, 1),
					orientation: new Quat().fromAxisRotation(Math.PI / 4, Vec3.Y_AXIS).multiply(new Quat().fromAxisRotation(Math.PI / 3, Vec3.Z_AXIS)),
					setPose: function() {},
			};
			let oc = new OrbitControl(target);
			oc.setOrbitControlToTargetPose();

			let forward = new Vec3(0, 0, 1);
			forward = target.orientation.rotate(forward);

			// Compute expected azimuth and inclination from the rotated vector
			let expected_radius = Math.sqrt(3);
			let azimuth = Math.atan2(forward._v[1], forward._v[0]);
			// We need to make sure that the azimuth is within the correct ranges
			let expected_azimuth = (azimuth + OrbitControl.TWO_PI) % OrbitControl.TWO_PI;
			let expected_inclination = Math.acos(forward._v[2] / forward.magnitude());
			expected_inclination += OrbitControl.HALF_PI;

			console.assert(approxEquals(oc.radius, expected_radius), `Expected radius ${oc.radius} to equal ${expected_radius}`);
			console.assert(approxEquals(oc.azimuth, expected_azimuth), `Expected azimuth ${oc.azimuth} to equal ${expected_azimuth}`);
			console.assert(approxEquals(oc.inclination, expected_inclination), `Expected inclination ${oc.inclination} to equal ${expected_inclination}`);

			// Simple case
			target = {
					position: new Vec3(1, 0, 0), // Set on X-axis at distance 1
					orientation: new Quat().fromAxisRotation(Math.PI / 2, new Vec3(0, 0, 1)), // Rotate 90 degrees around Z-axis
					setPose: function() {},
			};
			oc = new OrbitControl(target);
			oc.setOrbitControlToTargetPose();

			expected_radius = 1; // Distance from origin
			expected_azimuth = 0; // 0 degrees from X-axis in XY-plane
			expected_inclination = Math.PI / 2; // On XY-plane

			console.assert(approxEquals(oc.radius, expected_radius), `Expected radius ${oc.radius} to equal ${expected_radius}`);
			console.assert(approxEquals(oc.azimuth, expected_azimuth), `Expected azimuth ${oc.azimuth} to equal ${expected_azimuth}`);
			console.assert(approxEquals(oc.inclination, expected_inclination), `Expected inclination ${oc.inclination} to equal ${expected_inclination}`);
		}

}
