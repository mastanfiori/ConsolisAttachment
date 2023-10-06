/* global QUnit */
QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"com/zmm/commprintout/ZMM_PRINTOUT/test/unit/AllTests"
	], function () {
		QUnit.start();
	});
});