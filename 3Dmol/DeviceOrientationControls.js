/**
 * @author richt / http://richt.me
 * @author WestLangley / http://github.com/WestLangley
 *
 * W3C Device Orientation control (http://w3c.github.io/deviceorientation/spec-source-orientation.html)
 *
 * Modified by Mingyang Li in Jan 2017 for 3Dmol.js
 */

$3Dmol.DeviceOrientationControls = function(object) {

    var scope = this;

    this.object = object;
    //this.object.rotation.reorder("YXZ");

    this.enabled = true;

    this.deviceOrientation = {};
    this.screenOrientation = 0;

    this.alpha = 0;
    this.alphaOffsetAngle = 0;

    var onDeviceOrientationChangeEvent = function(event) {
        scope.deviceOrientation = event;
    };

    var onScreenOrientationChangeEvent = function() {
        scope.screenOrientation = window.orientation || 0;

    };

    // The angles alpha, beta and gamma form a set of intrinsic Tait-Bryan angles of type Z-X'-Y''

    var setObjectQuaternion = function() {

        var zee = new $3Dmol.Vector3(0, 0, 1);

        var euler = new $3Dmol.Vector3();//$3Dmol.Euler();

        var q0 = new $3Dmol.Quaternion();

        var q1 = new $3Dmol.Quaternion(-Math.sqrt(0.5), 0, 0, Math.sqrt(0.5)); // - PI/2 around the x-axis

        return function(quaternion, alpha, beta, gamma, orient) {
            //The Euler Angles reported by the device is of the order "ZXY".
            //For our purpose, we need to pass them to setFromEuler() in the order of "YXZ".
            //euler.set(alpha, beta, -gamma);//(beta, alpha, -gamma, 'YXZ'); // 'ZXY' for the device, but 'YXZ' for us
            euler.set(gamma, beta, alpha);
            quaternion.setFromEuler(euler); // orient the device

            quaternion.multiply(q1); // camera looks out the back of the device, not the top

            quaternion.multiply(q0.setFromAxisAngle(zee, -orient)); // adjust for screen orientation
        }

    }();

    this.connect = function() {

        onScreenOrientationChangeEvent(); // run once on load

        window.addEventListener('orientationchange', onScreenOrientationChangeEvent, false);
        window.addEventListener('deviceorientation', onDeviceOrientationChangeEvent, false);

        scope.enabled = true;

    };

    this.disconnect = function() {

        window.removeEventListener('orientationchange', onScreenOrientationChangeEvent, false);
        window.removeEventListener('deviceorientation', onDeviceOrientationChangeEvent, false);

        scope.enabled = false;

    };

    this.update = function() {

        if (scope.enabled === false) return;

        var alpha = scope.deviceOrientation.alpha ? $3Dmol.Math.degToRad(scope.deviceOrientation.alpha) + this.alphaOffsetAngle : 0; // Z
        var beta = scope.deviceOrientation.beta ? $3Dmol.Math.degToRad(scope.deviceOrientation.beta) : 0; // X'
        var gamma = scope.deviceOrientation.gamma ? $3Dmol.Math.degToRad(scope.deviceOrientation.gamma) : 0; // Y''
        var orient = scope.screenOrientation ? $3Dmol.Math.degToRad(scope.screenOrientation) : 0; // O

        setObjectQuaternion(scope.object.quaternion, alpha, beta, gamma, orient);
        this.alpha = alpha;

    };

    this.updateAlphaOffsetAngle = function(angle) {

        this.alphaOffsetAngle = angle;
        this.update();

    };

    this.dispose = function() {

        this.disconnect();

    };

    this.connect();

};
