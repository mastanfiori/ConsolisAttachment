sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/routing/History",
	"sap/m/MessageToast",
	'sap/m/MessageBox'
], function (Controller, History, MT, M) {
	"use strict";

	return Controller.extend("com.zmm.commprintout.controller.BaseController", {
		getRouter: function () {
			return this.getOwnerComponent().getRouter();
		},

		getModel: function (sName) {
			return this.getOwnerComponent().getModel(sName);
		},

		setModel: function (oModel, sName) {
			return this.getView().setModel(oModel, sName);
		},
		getI18nText: function (i18nID, values) {
			var oComponent = this.getOwnerComponent(),
				i18nText = "";
			if (!values) {
				i18nText = oComponent.getModel("i18n").getResourceBundle().getText(i18nID);
			} else if (values && typeof (values) === "string") {
				i18nText = oComponent.getModel("i18n").getResourceBundle().getText(i18nID, [values]);
			} else {
				i18nText = oComponent.getModel("i18n").getResourceBundle().getText(i18nID, values);
			}
			return i18nText;
		},
		getResourceBundle: function () {
			return this.getOwnerComponent().getModel("i18n").getResourceBundle();
		},

		getDetailModel: function () {
			return this.getOwnerComponent().getModel("detailModel");
		},

		onCloseDialog: function (oEvent) {
			var dialog = oEvent.getSource().getParent();
			dialog.close();
		},

		fillValues: function (oEvent) {
			M.show(this.getResourceBundle().getText("msg_err_value"), {
				icon: M.Icon.ERROR,
				title: "Hata"
			});
		},

		errMessageToast: function (oEvent) {
			MT.show(this.getResourceBundle().getText("msg_err_value"), {
				duration: 2000
			});
		},

		onNavBack: function () {
			debugger;
			var sPreviousHash = History.getInstance().getPreviousHash();
			if (sPreviousHash !== undefined) {
				// The history contains a previous entry
				history.go(-1);
			} else {
				// Otherwise we go backwards with a forward history
				var bReplace = true;
				this.getRouter().navTo("master", {}, bReplace);
			}
				this.getOwnerComponent().getModel("mainModel").setData({});
		},
		buildFragment: function (fragmentName, controller) {
			var fragment = sap.ui.xmlfragment("com.zmm.commprintout.view.fragments." + fragmentName, controller);
			controller.getView().addDependent(fragment);
			return fragment;
		},
		getControlByID:function(ID){
			let control = undefined;
			control = this.byId(ID);
			if(!control){
				control = sap.ui.getCore().byId(ID);
			}
			return control;
		}
	});

});