sap.ui.define([
	"com/zmm/commprintout/controller/BaseController",
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/BusyIndicator",
	"sap/m/UploadCollectionParameter",
	"sap/m/MessageToast",
	"sap/ui/model/Filter",
	"sap/m/PDFViewer",
	"sap/m/MessageBox",
	"sap/ui/core/routing/History",
	"sap/m/library",
	"sap/ui/Device"
], function (BaseController, Controller, JSONModel, BusyIndicator, UploadCollectionParameter, MessageToast, Filter, PDFViewer, MessageBox,
	History, MobileLibrary, Device) {
	"use strict";

	var ListMode = MobileLibrary.ListMode,
		ListSeparators = MobileLibrary.ListSeparators;

	return BaseController.extend("com.zmm.commprintout.controller.View2", {
		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf com.zmm.commprintout.view.View2
		 */
		onLanguageSelectChange: function (oEvent) {
			this.lang = oEvent.getParameters().selectedItem.mProperties.key;
		},
		onInit: function () {
			this.model = this.getModel("mainModel");
			this.category = "";
			this.lang = ""; //AYD
			this.getRouter().getRoute("View2").attachPatternMatched(this.onRouteMatched.bind(this));
			var oModel = new sap.ui.model.json.JSONModel();
			this.getView().setModel(oModel, "Users");
			sap.ui.getCore().setModel(oModel, "Users");

			//For attachments from local system - RY
			
			//var oAttachModel = new sap.ui.model.json.JSONModel();
			this.oAttachModel = this.getModel("mainModel");
			this.getView().setModel(this.oAttachModel, "attachments");
			//sap.ui.getCore().setModel(oAttachModel, "attachments");

			/*// Sets the text to the label
			this.byId("mailAttachmentId").addEventDelegate({
				onBeforeRendering: function() {
					this.byId("attachedFileName").setValue(this.getAttachmentTitleText());
				}.bind(this)
			});*/

		},

		onRouteMatched: function (oEvent) {
			var oParameters = oEvent.getParameters();
			this.category = oParameters.arguments.category;
			var sTitle = "";
			switch (this.category) {

			case "PDC1":
				sTitle = this.getView().getModel("i18n").getResourceBundle().getText("lbl_PDC1");
				break;
			case "PDC2":
				sTitle = this.getView().getModel("i18n").getResourceBundle().getText("lbl_PDC2");
				break;
			case "PDC3":
				sTitle = this.getView().getModel("i18n").getResourceBundle().getText("lbl_PDC3");
				break;
			case "PDC4":
				sTitle = this.getView().getModel("i18n").getResourceBundle().getText("lbl_PDC4");
				break;
			case "PDC5":
				sTitle = this.getView().getModel("i18n").getResourceBundle().getText("lbl_PDC5");
				break;
			case "PDC6":
				sTitle = this.getView().getModel("i18n").getResourceBundle().getText("lbl_PDC6");
				break;
			case "PDC7":
				sTitle = this.getView().getModel("i18n").getResourceBundle().getText("lbl_PDC7");
				break;
			case "PDC8":
				sTitle = this.getView().getModel("i18n").getResourceBundle().getText("lbl_PDC8");
			default:
			}
			this.model.setProperty("/Category", sTitle);

			if (oEvent.getParameters().name === "View2") {
				this.getModel("mainModel").setProperty("/selectedPO", "");
				this.model.setProperty("/attachModel", []);
				this.model.setProperty("/mailContentList", []); //AYD
				this.model.setProperty("/mailContent", ""); //AYD
				this.model.setProperty("/receiverList", []); //AYD
				//this.model.setProperty("/ccreceiverList", []);
				this.model.refresh(true); //AYD
			}
			//if we leave the application and navigate back we set the PO.
			if (localStorage.getItem("ConsolisPrintoutData") !== null) {
				var sData = localStorage.getItem("ConsolisPrintoutData");
				var data = JSON.parse(sData);
				this.getModel("mainModel").setData(data);
			}
		},
		handleDocListValueHelp: function (oEvent) {
			if (!this.docListDialog) {
				this.docListDialog = sap.ui.xmlfragment("com.zmm.commprintout.view.fragments.ProcDocValueHelp", this);
				this.docListDialog.setModel(this.model);
			}
			this.docListDialog.open();

		},
		handleDocListValueHelpSearch: function (oEvent) {
			var sValue = oEvent.getParameter("value");
			var oFilter = new Filter("Ebeln", sap.ui.model.FilterOperator.Contains, sValue);
			oEvent.getSource().getBinding("items").filter([oFilter]);
		},
		handleDocListValueHelpClose: function (oEvent) {
			var oSelectedItem = oEvent.getParameter("selectedItem");
			if (oSelectedItem) {
				this.getModel("mainModel").setProperty("/selectedPO", oSelectedItem.getTitle());
				this.getDocDetail(oSelectedItem.getTitle());

			}
			oEvent.getSource().getBinding("items").filter([]);
		},
		getProcDocList: function () {
				var that = this;
				that.model.setProperty("/docList", []);
				that.model.setProperty("/DocListDialogBusy", true);
				var oFilters = [];
				oFilters.push(new Filter("Bstyp", "EQ", that.category));
				BusyIndicator.show(0);
				this.getOwnerComponent().getModel().read("/ProcDocSearchHelpSet", {
					filters: oFilters,
					async: false,
					success: function (oData) {
						BusyIndicator.hide(0);

						that.model.setProperty("/docList", oData.results);
						that.model.setProperty("/DocListDialogBusy", false);
					},
					error: function (oError) {
						that.model.setProperty("/docList", []);
						that.model.setProperty("/DocListDialogBusy", false);
						var msg = JSON.parse(oError.responseText);
						MessageToast.show(msg.error.message.value);
						BusyIndicator.hide(0);
					}
				});
			},
			/**
			 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
			 * (NOT before the first rendering! onInit() is used for that one!).
			 * @memberOf com.zmm.commprintout.view.View2
			 */
			//	onBeforeRendering: function() {
			//
			//	},
			/**
			 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
			 * This hook is the same one that SAPUI5 controls get after being rendered.
			 * @memberOf com.zmm.commprintout.view.View2
			 */
				onAfterRendering: function() {
					this.getView().byId("attachedFileName").addEventDelegate(
					this.byId("attachedFileName").setValue(this.fileName));
				},
			/**
			 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
			 * @memberOf com.zmm.commprintout.view.View2
			 */
			//	onExit: function() {
			//
			//	}
			
		/**
		 *@memberOf com.zmm.commprintout.controller.View2
		 */
		onNavigateToApp: function (oEvent) {
			var that = this;
			var oCrossAppNav = sap.ushell && sap.ushell.Container && sap.ushell.Container.getService("CrossApplicationNavigation");

			switch (this.category) {
			case "PDC1":
				var a = "PurchaseOrder-manage&//C_PurchaseOrderTP(PurchaseOrder='";
				var b = that.getModel("mainModel").getProperty("/selectedPO");
				var c = "',DraftUUID=guid'00000000-0000-0000-0000-000000000000',IsActiveEntity=true)";

				var shellHash = a.concat(b.concat(c));

				var href_For_Product_display = (oCrossAppNav && oCrossAppNav.toExternal({
					target: {
						shellHash: shellHash
					}
				})) || "";
				break;
			case "PDC2":
				break;
			case "PDC3":
				a = "RequestForQuotation-manage&//C_RequestForQuotationEnhWD(RequestForQuotation='";
				b = that.getModel("mainModel").getProperty("/selectedPO");
				c = "',DraftUUID=guid'00000000-0000-0000-0000-000000000000',IsActiveEntity=true)";

				shellHash = a.concat(b.concat(c));

				var href_For_Product_display = (oCrossAppNav && oCrossAppNav.toExternal({
					target: {
						shellHash: shellHash
					}
				})) || "";
				break;
			case "PDC4":
				a = "PurchaseContract-manage&//C_ContractMaintain(PurchaseContract='";
				b = that.getModel("mainModel").getProperty("/selectedPO");
				c = "',DraftUUID=guid'00000000-0000-0000-0000-000000000000',IsActiveEntity=true)";

				shellHash = a.concat(b.concat(c));

				var href_For_Product_display = (oCrossAppNav && oCrossAppNav.toExternal({
					target: {
						shellHash: shellHash
					}
				})) || "";
				break;
			case "PDC5" || "PDC6" || "PDC7":
				a = "PurchaseSchedulingAgreement-manage&//C_Schedgagrmthdr(SchedulingAgreement='";
				b = that.getModel("mainModel").getProperty("/selectedPO");
				c = "',DraftUUID=guid'00000000-0000-0000-0000-000000000000',IsActiveEntity=true)";

				shellHash = a.concat(b.concat(c));

				var href_For_Product_display = (oCrossAppNav && oCrossAppNav.toExternal({
					target: {
						shellHash: shellHash
					}
				})) || "";
				break;
			default:
			}
			//set the localstorage if the user navigates back
			localStorage.setItem("ConsolisPrintoutData", JSON.stringify(this.getModel("mainModel").getData()));
		},

		//FileUploader
		handleUploadComplete: function (evt) {
			debugger;
			var oFileUpload = this.byId("fileUploader");
			var domRef = oFileUpload.getFocusDomRef();
			var file = domRef.files[0];
			if (file === undefined) {} else {
				//this.fileName = file.name;
				var base64_marker = 'data:' + file.type + ';base64,';
				var reader = new FileReader();
				var that = this;
				//on Load
				reader.onload = (function (theFile) {

					return function (evt) {
						//locate content
						var base64Index = evt.target.result.indexOf(base64_marker) + base64_marker.length;
						//Get content
						var base64 = evt.target.result.substring(base64Index);
						var service = "/sap/opu/odata/sap/ZMM_PRINTOUTS_SRV/AttachmentDocSet";
						var token = that.getView().getModel("oDataModel").getSecurityToken();
						$.ajaxSetup({
							cache: false
						});
						jQuery.ajax({
							type: 'POST',
							url: service,
							async: false,
							//    headers: oHeaders,
							cache: false,
							dataType: "json",
							data: base64,
							beforeSend: function (xhr) {
								xhr.setRequestHeader("X-CSRF-Token", token);
								xhr.setRequestHeader("Content-Type", file.type);
								// xhr.setRequestHeader("slug", oVin_no);
							},
							success: function (oData) {
								oFileUpload.clear();
								that.getimage();
							},
							error: function (odata) {}
						});
					};
				})(file);
				//Read file
				reader.readAsDataURL(file);
			}
		},

		onUploadAttachment: function () {
			debugger;

			//var oUploadCollection = this.getView().byId("mailAttachmentId");
			var oFileUpload = this.getView().byId("mailAttachmentId");
			var oData = oFileUpload.getModel("mainModel").getData();

			var domRef = oFileUpload.getFocusDomRef();
			//var domRef = oFileUpload.getDomRef();
			var file = domRef.files[0];
			this.fileName = file.name;
			var fileType = this.fileName.split(".")[1];
			var fileSizeMB = (file.size / 1048576).toFixed(6);
			if (fileSizeMB > 5) {
				MessageBox.error(this.oResourceModel.getText("RcFileSizeErrorMsg"));
				return;
			}
			
			var base64_marker = 'data:' + file.type + ';base64,';
			var reader = new FileReader();
			var that = this;

			reader.onload = (function (theFile) {
				return function (evt) {
					var base64Index = evt.target.result.indexOf(base64_marker) + base64_marker.length;
					that.base64 = evt.target.result.substring(base64Index);
					var service = "/sap/opu/odata/sap/ZMM_PRINTOUTS_SRV/AttachmentDocSet";
					var token = that.getView().getModel().getSecurityToken();
					oData.attachModel.unshift({
						"Value": that.base64,
						"Name": that.fileName
					});
					
					that.getView().getModel("mainModel").refresh();
					/*debugger;
					that.byId("attachedFileName").setValue(that.fileName);*/
					
				};
				
			})(file);
			
			reader.readAsDataURL(file);
			//this.getView().byId("attachedFileName").setText(this.fileName);
			
			// that.getAttachmentTitleText(that.fileName);
		},

		/*getAttachmentList: function (fileName) {
			debugger;
			//Rendering list of attachments in view
			this.getView().byId("attachedFileName").setValue(fileName);
			
		},*/

		//Attachments from local system - RY

		/*onUploadChange: function (oEvent) {
			var oUploadCollection = oEvent.getSource();
			// Header Token
			var oCustomerHeaderToken = new UploadCollectionParameter({
				name: "x-csrf-token",
				value: "securityTokenFromModel"
			});
			oUploadCollection.addHeaderParameter(oCustomerHeaderToken);
		},*/

		/*		onUploadComplete: function (oEvent) {
					debugger;
					var oUploadCollection = this.getView().byId("mailAttachmentId");
					var oData = oUploadCollection.getModel("mainModel").getData();

					//this.data = sap.ui.getCore().getModel("Users").getData();

					/*this.oData = {
						"attachModel": {
							"FileId": Date.now().toString(),
							"FileName": oEvent.getParameter("files")[0].fileName
						}
					};*/

		/*oData.attachModel.unshift({
			"value": this.base64, // generate Id,
			"name": this.fileName
		});
		this.getView().getModel("mainModel").refresh();*/

		// Sets the text to the label
		//this.byId("attachmentTitle").setText(this.getAttachmentTitleText());

		// delay the success message for to notice onChange message
		/*setTimeout(function () {
				MessageToast.show("UploadComplete event triggered.");
			}, 4000);
		},*/

		onBeforeUploadStarts: function (oEvent) {
			// Header Slug
			debugger;
			var oCustomerHeaderSlug = new UploadCollectionParameter({
				name: "slug",
				value: oEvent.getParameter("fileName")
			});
			oEvent.getParameters().addHeaderParameter(oCustomerHeaderSlug);
			MessageToast.show("BeforeUploadStarts event triggered.");
		},

		/*getAttachmentTitleText: function () {
			var aItems = this.getView().byId("UploadCollection").getItems();
			return "Uploaded (" + aItems.length + ")";
		},*/
		
		getAttachmentTitleText: function (fileName) {
			debugger;
			//var aItems = this.getView().byId("attachmentList").getItems();
			/*return "Uploaded (" + aItems.length + ")";*/
			//this.getView().byId("attachedFileName").setValue(fileName);
			this.getView().byId("attachedFileName").addEventDelegate(
					this.byId("attachedFileName").setValue(fileName)
			);
		},

		onSelectionChange: function () {
			var oUploadCollection = this.byId("UploadCollection");
			// Only it is enabled if there is a selected item in multi-selection mode
			if (oUploadCollection.getMode() === ListMode.MultiSelect) {
				if (oUploadCollection.getSelectedItems().length > 0) {
					this.byId("deleteSelectedButton").setEnabled(true);
				} else {
					this.byId("deleteSelectedButton").setEnabled(false);
				}
			}
		},

		getAttachments: function (oDocument) {
			debugger;
			var that = this;
			var sPath = "";
			that.model.setProperty("/attachModel", []);
			//call is now baing made. it was not before. its returning an error.
			// var oModel = this.getModel("Attachment");
			var oModel = new sap.ui.model.odata.ODataModel("/sap/opu/odata/sap/CV_ATTACHMENT_SRV", true);

			switch (this.category) {
			case "PDC1":
				sPath = "/GetAllOriginals?ObjectType='BUS2012'&ObjectKey='" + oDocument + "'&SemanticObjectType=''&IsDraft=false";
				break;
			case "PDC2":
				sPath = "/GetAllOriginals?ObjectType='BUS2012'&ObjectKey='" + oDocument + "'&SemanticObjectType=''&IsDraft=false";
				break;
			case "PDC3":
				sPath = "/GetAllOriginals?ObjectType='EKKO_RFQ'&ObjectKey='" + oDocument + "'&SemanticObjectType=''&IsDraft=false";
				break;
			case "PDC4":
				sPath = "/GetAllOriginals?ObjectType='BUS2014'&ObjectKey='" + oDocument + "'&SemanticObjectType=''&IsDraft=false";
				break;
			case "PDC5" || "PDC6" || "PDC7":
				sPath = "/GetAllOriginals?ObjectType='BUS2013'&ObjectKey='" + oDocument + "'&SemanticObjectType=''&IsDraft=false";
				break;
			default:
			}

			oModel.read(sPath, {
				async: false,
				success: function (oData) {
					that.model.setProperty("/attachModel", oData.results);

				},
				error: function (oError) {

					var msg = JSON.parse(oError.response.body);
					sap.m.MessageBox.error(msg.error.message.value);
				}
			});

		},

		onPrintPreview: function (oEvent) {
			var sPath = "";
			var serviceUrl = "/sap/opu/odata/sap/CA_OC_OUTPUT_REQUEST_SRV";
			var oDocument = this.getModel("mainModel").getProperty("/selectedPO");
			debugger;
			if (oDocument === "") {
				return;
			}
			switch (this.category) {
			case "PDC1":
				sPath = "/Items(ApplObjectType='PURCHASE_ORDER',ApplObjectId='" + oDocument + "',ItemId='1')/GetDocument/$value/";
				break;
			case "PDC2":
				sPath = "/Items(ApplObjectType='PURCHASE_ORDER',ApplObjectId='" + oDocument + "',ItemId='1')/GetDocument/$value/";
				break;
			case "PDC3":
				sPath = "/Items(ApplObjectType='REQUEST_FOR_QUOTATION',ApplObjectId='" + oDocument + "',ItemId='1')/GetDocument/$value/";
				break;
			case "PDC4":
				sPath = "/Items(ApplObjectType='PURCHASE_CONTRACT',ApplObjectId='" + oDocument + "',ItemId='1')/GetDocument/$value/";
				break;
			case "PDC5":
				sPath = "/Items(ApplObjectType='SCHEDULING_AGREEMENT',ApplObjectId='" + oDocument + "',ItemId='1')/GetDocument/$value/";
				break;
			case "PDC6":
				sPath = "/Items(ApplObjectType='SCHEDULING_AGREEMENT',ApplObjectId='" + oDocument + "',ItemId='1')/GetDocument/$value/";
				break;
			case "PDC7":
				sPath = "/Items(ApplObjectType='SCHEDULING_AGREEMENT',ApplObjectId='" + oDocument + "',ItemId='1')/GetDocument/$value/";
				break;
			default:
			}

			var pdfURL = serviceUrl + sPath;

			var opdfViewer = new PDFViewer();
			this.getView().addDependent(opdfViewer);
			var sSource = pdfURL;
			opdfViewer.setSource(sSource);
			opdfViewer.setTitle("Print Out");
			this.pdfViewerSA = opdfViewer;
			opdfViewer.open();
		},
		onPrintPreviewSARelease: function (oEvent) {
			let oSource = oEvent.getSource();
			let bindingContext = oSource.getBindingContext("local");
			let model = bindingContext.getModel();
			let path = bindingContext.getPath();
			const data = model.getProperty(path);
			//1 for Forecast, 2 for JIT
			let releaseNumber = "1";
			if (oSource.getId().indexOf('JIT') > -1) {
				releaseNumber = "2";
			}
			let concatNumber = data['SA'] + data['SAItem'] + releaseNumber + data['ReleaseNumber'];
			var sPath = "/Items(ApplObjectType='SCHEDULING_AGREEMENT_RELEASES',ApplObjectId='" + concatNumber +
				"',ItemId='1')/GetDocument/$value/";
			var serviceUrl = "/sap/opu/odata/sap/CA_OC_OUTPUT_REQUEST_SRV";

			var pdfURL = serviceUrl + sPath;

			var opdfViewer = new PDFViewer();
			this.getView().addDependent(opdfViewer);
			var sSource = pdfURL;
			opdfViewer.setSource(sSource);
			opdfViewer.setTitle("Print Out");
			this.pdfViewerSA = opdfViewer;
			opdfViewer.open()
		},
		getMailContent: function (oDocument) {

			var that = this;
			that.model.setProperty("/mailContentList", []);
			that.model.setProperty("/mailContent", "");

			var oFilters = [];
			//		oFilters.push(new Filter("Bstyp", "EQ", that.category));
			oFilters.push(new Filter("Ebeln", "EQ", oDocument));
			oFilters.push(new Filter("DocType", "EQ", this.category));
			oFilters.push(new Filter("Language", "EQ", this.lang)); //AYD

			//add the line item when using SA release
			if (this.category === 'PDC6') {
				let SAItem = this.getModel('mainModel').getProperty("/SAItem");
				oFilters.push(new Filter("Ebelp", "EQ", SAItem));
			}

			BusyIndicator.show(0);
			this.getOwnerComponent().getModel().read("/MailContentSet", {
				filters: oFilters,
				async: false,
				success: function (oData) {
					BusyIndicator.hide(0);
					that.model.setProperty("/mailContentList", oData.results);
					that.bindMailContent();
				},
				error: function (oError) {

					var msg = JSON.parse(oError.responseText);
					MessageToast.show(msg.error.message.value);
					BusyIndicator.hide(0);
				}
			});

		},

		bindMailContent: function () {
			var that = this;
			var sMailContent = that.model.getProperty("/mailContentList");
			var sHtmlValue = "<p><span>";

			for (var row = 0; row < sMailContent.length; row++) {
				sHtmlValue = sHtmlValue.concat(sMailContent[row].Line);
				if (sMailContent[row].Line === "") {
					sHtmlValue = sHtmlValue.concat("</span></p><p><span>");
				}
			}

			sHtmlValue = sHtmlValue.concat("</span></p>");

			that.model.setProperty("/mailContent", sHtmlValue);

		},
		getReceiversCreditMemo: function (filterItems) {
			this.model.setProperty("/receiverList", []);
			let filters = filterItems.map(function (filterItem) {
				return new Filter("Ebeln", "EQ", filterItem.supplier);
			});
			let docTypeFilter = new Filter("DocType", "EQ", this.category);
			let promises = [];
			let that = this;
			filters.forEach(function (filter) {
				let promise = new Promise((resolve, reject) => {
					let oDataFilters = [new Filter({
						filters: [filter, docTypeFilter],
						and: true
					})];
					that.getOwnerComponent().getModel().read("/ReceiversSet", {
						filters: oDataFilters,
						success: function (oData) {
							resolve();
							//							BusyIndicator.hide(0);
							//							this.model.setProperty("/receiverList", oData.results);
						}.bind(this),
						error: function (oError) {
							reject();
							//							var msg = JSON.parse(oError.responseText);
							//							MessageToast.show(msg.error.message.value);
							//							BusyIndicator.hide(0);
						}
					})
				});
				promises.push(promise);
			});
			Promise.all(promises).then((values) => {
				console.log(values);
				debugger;
			});
			/*
			let oDataFilters = [new Filter({
				filters: filters,
				and: true
			})];
			*/
			/*
			this.getOwnerComponent().getModel().read("/ReceiversSet", {
				filters: oDataFilters,
				success: function (oData) {
					BusyIndicator.hide(0);
					this.model.setProperty("/receiverList", oData.results);
				}.bind(this),
				error: function (oError) {
					var msg = JSON.parse(oError.responseText);
					MessageToast.show(msg.error.message.value);
					BusyIndicator.hide(0);
				}
			});
			*/
		},
		getCreditMemoDetails: function (recievers) {
			//set the selected recievers
			this.model.setProperty("/receiverList", recievers);
			this.getAttachments('CREDIT_MEMO');
			this.getMailContent('CREDIT_MEMO');

		},
		getSADetails: function () {
			var oDocument = this.getModel("mainModel").getProperty("/selectedPO");
			this.getReceivers(oDocument);
			this.getMailContent(oDocument);

		},
		getConsigmentSettlementDetails() {
			var oDocument = this.getModel("mainModel").getProperty("/selectedPO");
			let oDataModel = this.getModel();
			let filter = new Filter("Lifnr", "EQ", oDocument);
			let that = this;
			this.getAttachments(oDocument);
			this.getMailContent(oDocument);
			oDataModel.read('/VendorSet', {
				filters: [filter],
				success: function (data) {
					let model = that.getModel("mainModel");
					model.setProperty('/receiverList', data.results);
				},
				error: function (data) {
					debugger;
				}
			});
		},
		getReceivers: function (oDocument) {
			debugger;
			var that = this;
			that.model.setProperty("/receiverList", []);

			var oFilters = [];
			//		oFilters.push(new Filter("Bstyp", "EQ", that.category));
			oFilters.push(new Filter("Ebeln", "EQ", oDocument));
			oFilters.push(new Filter("DocType", "EQ", this.category));
			BusyIndicator.show(0);
			this.getOwnerComponent().getModel().read("/ReceiversSet", {
				filters: oFilters,
				async: false,
				success: function (oData) {
					BusyIndicator.hide(0);
					that.model.setProperty("/receiverList", oData.results);
				},
				error: function (oError) {

					var msg = JSON.parse(oError.responseText);
					MessageToast.show(msg.error.message.value);
					BusyIndicator.hide(0);
				}
			});
		},

		getCCReceivers: function (oDocument) {
			debugger;
			this.enCCMails = [];
			this.enCCMails = this.getView().getModel("Users").getData();
			//this.enCCMails = oDocument.getParameters().value;
		},
		
		getEnteredCCReceivers: function(event) {
			
			var enCCMails = this.getView().byId("cc_receiver").getValue();            
		},

		onSendMail: function () {
			debugger;
			var that = this;

			this.oAttachments = [];
			//this.getView().byId("attachedFileName").setText(fileName);
			//var sAttachments = this.model.getProperty("/attachModel");
			var sAttachments = this.getView().getModel("mainModel").getProperty("/attachModel");
			if (sAttachments === undefined) {
				sAttachments = [];
				this.model.setProperty("/attachModel", []);
			}

			for (var i = 0; i < sAttachments.length; i++) {
				this.oAttachment = {};
				this.oAttachment.Value = sAttachments[i].Value;
				this.oAttachment.Name = sAttachments[i].Name;
				this.oAttachments.push(this.oAttachment);
			}

			var oEntry = {};
			let mainModel = this.getModel("mainModel");
			let Ebeln = mainModel.getProperty("/selectedPO");
			if (Ebeln === " ") {
				Ebeln = "CREDITMEMO";
			}
			
			
			oEntry.Ebeln = Ebeln;
			oEntry.Receiver = this.model.getProperty("/receiverList");
			oEntry.Content = this.model.getProperty("/mailContentList");
			oEntry.AttachmentDoc = that.oAttachments;
			oEntry.Language = this.lang;
			oEntry.DocType = this.category;
			if(this.enCCMails==undefined) {
				oEntry.Ccreceiver = this.ccMails;
			} else {
				oEntry.Ccreceiver = this.enCCMails;
			}

			//for (var i = oEntry.Receiver.length - 1; i >= 0; i--) {
			//	if(oEntry.Receiver[i].Receiver === '')
			//        oEntry.Receiver.splice(i, 1);
			//}

			//if SA release, append additional properties to get the correct attachment
			if (this.category === 'PDC6') {
				oEntry.Ebelp = mainModel.getProperty("/SAItem");
				oEntry.ReleaseType = mainModel.getProperty("/SAReleaseType");
				oEntry.ReleaseNo = mainModel.getProperty("/SAReleaseRealseNo");
			}

			BusyIndicator.show(0);
			this.getOwnerComponent().getModel().create("/AutoMailSet", oEntry, {
				async: false,
				success: function (oData) {
					var msg = undefined;
					if (oData && oData.Receiver && oData.Receiver.results && oData.Receiver.results.length > 0) {
						let obj = oData.Receiver.results.find((item) => {
								if (item['Name'] !== "") {
									return item['Name'];
								}
							}),
							name = obj['Name'],
							receiver = '';
						oData.Receiver.results.forEach(function (item) {
							if (receiver === "") {
								receiver = item['Receiver'];
							} else {
								receiver = receiver + ', ' + item['Receiver'];
							}
						});
						msg = that.getI18nText('emailSentToRecievers', [name, receiver]);
					}
					BusyIndicator.hide(0);
					switch (oData.Type) {
					case 'S':
						MessageBox.success(msg, {
							action: [MessageBox.Action.OK],
							onClose: function (clickedItem) {
								if (clickedItem === "OK") {
									that.getRouter().navTo("View1");
									that.getOwnerComponent().getModel("mainModel").setData({});
									that.getView().getModel("Users").setData([]);
									that.getView().getModel("attachments").destroyBindingContext;
									sap.ui.getCore().getModel("Users").destroyBindingContext;
								}
							}
						});
						break;
					case 'W':
						MessageBox.warning(oData.Message);
						break;
					case 'E':
						MessageBox.error(oData.Message);
						break;
					}
					sap.ui.getCore().getModel("Users").refresh();
				},
				error: function (oError) {
					var msg = JSON.parse(oError.responseText);
					MessageToast.show(msg.error.message.value);
					BusyIndicator.hide(0);
				}
			});

		},

		getDocDetail: function (oEvent) {
			var oDocument = this.getModel("mainModel").getProperty("/selectedPO");
			this.getDocHedaer(oDocument);
			this.getAttachments(oDocument);
			this.getMailContent(oDocument);
			this.getReceivers(oDocument);
			//this.getCCReceivers(oDocument); //RY
		},

		onAttachmentDeleted: function (oEvent) {
			debugger;
			var sItemToDeleteId = oEvent.getParameter("documentId");

			var oData = this.byId("mailAttachmentId").getModel().getData();
			var aItems = jQuery.extend(true, {}, oData).items;
			jQuery.each(aItems, function (index) {
				if (aItems[index] && aItems[index].documentId === sItemToDeleteId) {
					aItems.splice(index, 1);
				}
			});

			var attachModel = this.model.getProperty("/attachModel");
			jQuery.each(attachModel, function (index) {
				if (attachModel[index] && attachModel[index].Documentnumber === sItemToDeleteId) {
					attachModel.splice(index, 1);
				}
			});

			this.model.setProperty("/attachModel", attachModel);

		},

		onContentChanged: function (oEvent) {

			var newMailContent = oEvent.getParameter("newValue");
			var newContentList = newMailContent.split("</p>\n");
			this.model.setProperty("/mailContentList", []);
			var mailContent = [];

			for (var line = 0; line < newContentList.length; line++) {
				newContentList[line] = newContentList[line].replace("&nbsp;", "");
				newContentList[line] = newContentList[line].replace("<p>", "");
				newContentList[line] = newContentList[line].replace("</p>", "");
				newContentList[line] = newContentList[line].replace("\n", "");
				newContentList[line] = newContentList[line].replace("&nbsp;", "");
				var oContent = {};
				//			oContent.Bstyp = this.category;
				let ebeln = this.getModel("mainModel").getProperty("/selectedPO");
				if (ebeln === " ") {
					ebeln = "CREDITMEMO";
				}
				oContent.Ebeln = ebeln;
				oContent.Line = newContentList[line];
				mailContent.push(oContent);
			}

			this.model.setProperty("/mailContentList", mailContent);
		},

		getDocHedaer: function (oDocument) {

		},

		onAddToReceiver: function (oEvent) {
			debugger;
			var list = oEvent.getSource().getParent().getParent();
			var binding = list.getBinding("items");
			var model = binding.getModel();
			var items = model.getProperty(binding.getPath());

			if (items.length < 1) {
				items.push({
					Receiver: 'ABC'
				});
			}

			if (items.length > 0) {
				var newItem = {...items[0]
				};
				newItem["Name"] = '';
				newItem["Receiver"] = '';
				newItem['Lifnr'] = '';
				items.unshift(newItem);
				model.setProperty(binding.getPath(), items);
			}

		},

		onAddCCReceiver: function (oEvent) {
			debugger;

			this.data = sap.ui.getCore().getModel("Users").getData();

			this.oData = {
				"cc_receiver": [{
					"Ccreceiver": "",
					"Lifnr": "",
					"Name": "",
					"Ebeln": "",
					"DocType": ""
				}]
			};

			var obj = {
				'Ccreceiver': '',
				'Lifnr': '',
				'Name': '',
				'Ebeln': '',
				'DocType': ''
			};
			//this.data.cc_receiver.push(obj);
			if (this.data.length > 0) {
				this.data.push(obj);
				sap.ui.getCore().getModel("Users").setData(this.data);
			} else {
				sap.ui.getCore().getModel("Users").setData(this.oData.cc_receiver);
			}
			sap.ui.getCore().getModel("Users").refresh();
		},

		onRemoveToReceiver: function (oEvent) {
			var selectedItem = oEvent.getParameter("listItem");
			var bindingContext = selectedItem.getBindingContext("mainModel");
			var path = bindingContext.getPath();
			var model = bindingContext.getModel();
			var index = parseInt(path.split("/")[path.split("/").length - 1]);
			if (!isNaN(index)) {
				var items = model.getProperty("/receiverList");
				items.splice(index, 1);
				model.setProperty("/receiverList", items);
			}
		},

		onRemoveCCReceiver: function (oEvent) {
			debugger;
			var selectedItem = oEvent.getParameter("listItem");
			var bindingContext = selectedItem.getBindingContext("Users");
			var path = bindingContext.getPath();
			var model = bindingContext.getModel();
			var index = parseInt(path.split("/")[path.split("/").length - 1]);
			if (!isNaN(index)) {
				var items = model.getData();
				items.splice(index, 1);
				model.setProperty("/cc_receiver", items);
			}
		},

		onVHRequestVendorTo: function (oEvent) {
			var oFragment = this.buildFragment("shEmailTo", this);
			var bindingContext = oEvent.getSource().getBindingContext("mainModel");
			var mainModel = this.getModel("mainModel");
			//Used to find out where to put the selected result from the search help
			mainModel.setProperty("/bindingContext", bindingContext);
			oFragment.open();
		},

		onVHRequestVendorCC: function (oEvent) {
			debugger;
			var oFragment = this.buildFragment("shEmailCC", this);
			var bindingContext = oEvent.getSource().getBindingContext("Users");
			var mainModel = this.getModel();
			//Used to find out where to put the selected result from the search help
			this.inputId = oEvent.getSource().getId();
			mainModel.setProperty("/cc_receiver", bindingContext);
			oFragment.open();
		},

		onVHRequest: function (oEvent) {
			debugger;
			var category = this.getOwnerComponent().getModel("mainModel").getProperty("/Category");
			var sh = "";
			switch (category) {
			case 'PO Confirmation reminder':
				sh = 'shConfirmationPO';
				break;
			case 'PO':
				sh = "shPO";
				break;
			case 'RFQ':
				sh = "shRFQ";
				break;
			case 'Contract':
				sh = 'shContract';
				break;
			case 'Consignment settlement':
				sh = 'shConsignment_settlement';
				break;
			case 'Scheduling agreement':
				sh = 'shSchedulingAgreement';
				break;
			case 'Scheduling agreement release':
				sh = 'shSchedulingAgreementRelease';
				break;
			case 'Credit Memo':
				sh = 'shCreditMemo'
				break;
			default:
				break;
			}
			var oFragment = this.buildFragment(sh, this);

			//scheduling agreement release - attach event handler when the user clicks an item
			if (sh = 'Scheduling agreement release') {
				let table = this.getTableInDialog(oFragment);
				const selectFunction = function (oEvent) {
					let selectedItem = oEvent.getParameter("listItem");
					let bindingContext = selectedItem.getBindingContext();
					let data = bindingContext.getModel().getProperty(bindingContext.getPath());
					let schedulingAgreementReleaseService = this.getOwnerComponent().getModel("schedulingAgrRelease");
					const uri =
						`/C_Schedgagrmthdr(SchedulingAgreement='${data.Schedulingagreement}',DraftUUID=guid'00000000-0000-0000-0000-000000000000',IsActiveEntity=true)/to_SchedgAgrmtItmWithDraft?$skip=0&$top=10&$select=SchedulingAgreementItem,TargetQuantity,OrderQuantityUnit`;
					schedulingAgreementReleaseService.read(uri, {
						success: function (oEvent) {
							if (oEvent.results && oEvent.results.length > 0) {
								let item = oEvent.results[0];
								const itemNumber = item['SchedulingAgreementItem'],
									SANumber = item['SchedulingAgreement'];
								let model = this.getOwnerComponent().getModel();
								let filters = new Filter({
									filters: [new Filter({
											path: 'Ebeln',
											operator: 'EQ',
											value1: SANumber
										}),
										new Filter({
											path: 'Ebelp',
											operator: 'EQ',
											value1: itemNumber
										})
									],
									and: true
								});
								model.read('/SchAgrScheLinesSet', {
									filters: [filters],
									success: function (oEvent) {
										let localModel = this.getOwnerComponent().getModel('local');
										let JITData = [],
											forecastData = [];
										oEvent.results.forEach(function (data) {
											if (data['Abart'] === '1') {
												forecastData.push(data);
											} else if (data['Abart'] === '2') {
												JITData.push(data);
											}
										});
										if (JITData.length < 1 && forecastData.length < 1) {
											localModel.setProperty("/schAgrReleaseData", undefined);
											localModel.setProperty("/schAgrReleaseDataVisible", undefined);
										} else {
											const element = oEvent.results[0];
											localModel.setProperty("/schAgrReleaseData", {
												data: [{
													JIT: JITData,
													Forecast: forecastData,
													SA: element['Ebeln'],
													SAItem: element['Ebelp'],
													ReleaseDate: element['Abrdt'],
													ReleaseNumber: element['Abruf']
												}]
											});
											localModel.setProperty("/schAgrReleaseDataVisible", true);
										}
									}.bind(this)
								});
							} else {
								//show error msg.
							}
						}.bind(this)
					});
				}.bind(this);
				table.attachSelect(selectFunction);
			}

			oFragment.open();

		},
		getFilterBarInDialog: function (fragment) {
			if (fragment.getContent().length > 0 && fragment.getContent()[0].getItems().length > 0 && fragment.getContent()[0].getItems()[0] !==
				undefined) {
				let smartFilterBar = fragment.getContent()[0].getItems()[0];
				return smartFilterBar;
			}
		},
		getTableInDialog: function (fragment) {
			if (fragment.getContent().length > 0 && fragment.getContent()[0].getItems().length > 1 && fragment.getContent()[0].getItems()[1] !==
				undefined) {
				let smartTable = fragment.getContent()[0].getItems()[1];
				let table = smartTable.getTable();

				return table;
			}
		},
		onCancelValueHelp: function (oEvent) {
			var oDialog = oEvent.getSource().getParent();
			oDialog.close();
			oDialog.destroy();
		},
		onValueHelpOKRFQ: function (oEvent) {
			var oSmartTable = sap.ui.getCore().byId('smartTRFQ');
			var table = oSmartTable.getTable();
			var selectedItem = table.getSelectedItem();
			var bindingContext = selectedItem.getBindingContext();
			var model = bindingContext.getModel();
			var path = bindingContext.getPath();
			var purchaseOrder = model.getProperty(path + '/Ebeln');
			var mainModel = this.getModel("mainModel");
			mainModel.setProperty("/selectedPO", purchaseOrder);
			var oBtn = oEvent.getSource();
			var oDialog = oBtn.getParent();
			oDialog.close();
			oDialog.destroy();
			this.getDocDetail();
		},
		onValueHelpOKContract: function (oEvent) {
			var oSmartTable = sap.ui.getCore().byId('smartTContracts');
			var table = oSmartTable.getTable();
			var selectedItem = table.getSelectedItem();
			var bindingContext = selectedItem.getBindingContext();
			var model = bindingContext.getModel();
			var path = bindingContext.getPath();
			var purchaseOrder = model.getProperty(path + '/Ebeln');
			var mainModel = this.getModel("mainModel");
			mainModel.setProperty("/selectedPO", purchaseOrder);
			var oBtn = oEvent.getSource();
			var oDialog = oBtn.getParent();
			oDialog.close();
			oDialog.destroy();
			this.getDocDetail();
		},
		onValueHelpOKPO: function (oEvent) {
			var oSmartTable = sap.ui.getCore().byId('smartTPO');
			var table = oSmartTable.getTable();
			var selectedItem = table.getSelectedItem();
			var bindingContext = selectedItem.getBindingContext();
			var model = bindingContext.getModel();
			var path = bindingContext.getPath();
			var purchaseOrder = model.getProperty(path + '/Ebeln');
			var mainModel = this.getModel("mainModel");
			mainModel.setProperty("/selectedPO", purchaseOrder);
			var oBtn = oEvent.getSource();
			var oDialog = oBtn.getParent();
			oDialog.close();
			oDialog.destroy();
			this.getDocDetail();
		},
		onValueHelpOKConsigmentSettlement: function (oEvent) {
			var oSmartTable = sap.ui.getCore().byId('smartTConsigmentSettlement');
			var table = oSmartTable.getTable();
			var selectedItem = table.getSelectedItem();
			var bindingContext = selectedItem.getBindingContext();
			var model = bindingContext.getModel();
			var path = bindingContext.getPath();
			var supplier = model.getProperty(path + '/Supplier');
			var mainModel = this.getModel("mainModel");
			mainModel.setProperty("/selectedPO", supplier);
			var oBtn = oEvent.getSource();
			var oDialog = oBtn.getParent();
			this.getConsigmentSettlementDetails();

			oDialog.close();
			oDialog.destroy();
		},
		onValueHelpOKConfirmationPO: function (oEvent) {
			var oSmartTable = sap.ui.getCore().byId('smartTConfirmationPO');
			var table = oSmartTable.getTable();
			var selectedItem = table.getSelectedItem();
			var bindingContext = selectedItem.getBindingContext();
			var model = bindingContext.getModel();
			var path = bindingContext.getPath();
			var purchaseOrder = model.getProperty(path + '/Purchasingdocument');
			var mainModel = this.getModel("mainModel");
			mainModel.setProperty("/selectedPO", purchaseOrder);
			var oBtn = oEvent.getSource();
			var oDialog = oBtn.getParent();
			oDialog.close();
			oDialog.destroy();
			this.getDocDetail();
		},
		onValueHelpOKCreditMemo: function (oEvent) {
			debugger;
			var oSmartTable = sap.ui.getCore().byId('smartTCreditMemo');
			var table = oSmartTable.getTable();
			var selectedItems = table.getSelectedItems();
			var recievers = selectedItems.map(function (selectedItem) {
				var bindingContext = selectedItem.getBindingContext();
				var model = bindingContext.getModel();
				var path = bindingContext.getPath();
				return {
					Receiver: model.getProperty(path + '/Receiver'),
					Name: model.getProperty(path + '/Name1'),
					Lifnr: model.getProperty(path + '/Lifnr')
				};
			});
			var mainModel = this.getModel("mainModel");
			mainModel.setProperty("/selectedPO", recievers[0].Lifnr);

			var oBtn = oEvent.getSource();
			var oDialog = oBtn.getParent();
			oDialog.close();
			oDialog.destroy();
			this.getCreditMemoDetails(recievers);
		},
		onValueHelpOKSchedulingAgreement: function (oEvent) {
			var oSmartTable = sap.ui.getCore().byId('smartTSchedulingAgrrement');
			var table = oSmartTable.getTable();
			var selectedItem = table.getSelectedItem();
			var bindingContext = selectedItem.getBindingContext();
			var model = bindingContext.getModel();
			var path = bindingContext.getPath();
			var purchaseOrder = model.getProperty(path + '/Schedulingagreement');
			var mainModel = this.getModel("mainModel");
			mainModel.setProperty("/selectedPO", purchaseOrder);
			var oBtn = oEvent.getSource();
			var oDialog = oBtn.getParent();
			oDialog.close();
			oDialog.destroy();
			this.getDocDetail();
		},
		onValueHelpOKSchedulingAgreementRelease: function (oEvent) {
			let JITTable = sap.ui.getCore().byId('SAJITTable'),
				SAForecastTable = sap.ui.getCore().byId('SAForecastTable');
			let localModel = this.getOwnerComponent().getModel("local");
			let mainModel = this.getModel("mainModel");
			let SA = undefined;
			let SAItem = undefined;

			//ensure the JIT table has been selected
			if (JITTable.getSelectedItem() !== null) {
				var selectedItemJIT = JITTable.getSelectedItem();
				var JITContext = selectedItemJIT.getBindingContext("local");
				SA = JITContext.getModel().getProperty(JITContext.getPath() + '/SA');
				SAItem = JITContext.getModel().getProperty(JITContext.getPath() + '/SAItem');
				mainModel.setProperty("/selectedPO", SA);
				mainModel.setProperty("/SAItem", SAItem);
				mainModel.setProperty("/SAReleaseType", "2");
				mainModel.setProperty("/SAReleaseRealseNo", JITContext.getModel().getProperty(JITContext.getPath() + '/ReleaseNumber'));
			}
			//ensure the Forecast table has been selected
			if (SAForecastTable.getSelectedItem() !== null) {
				var selectedItemForecast = SAForecastTable.getSelectedItem();
				var ForecastContext = selectedItemForecast.getBindingContext("local");
				SA = ForecastContext.getModel().getProperty(ForecastContext.getPath() + '/SA');
				SAItem = ForecastContext.getModel().getProperty(ForecastContext.getPath() + '/SAItem');
				mainModel.setProperty("/selectedPO", SA);
				mainModel.setProperty("/SAItem", SAItem);
				mainModel.setProperty("/SAReleaseType", "1");
				mainModel.setProperty("/SAReleaseRealseNo", ForecastContext.getModel().getProperty(ForecastContext.getPath() + '/ReleaseNumber'));
			}
			var oBtn = oEvent.getSource();
			var oDialog = oBtn.getParent();
			oDialog.close();
			oDialog.destroy();
			this.getSADetails();
		},

		onShowHideTables: function (oEvent) {
			let localModel = this.getOwnerComponent().getModel('local');
			let visible = localModel.getProperty("/schAgrReleaseDataVisible");
			if (visible === true) {
				visible = false;
			} else {
				visible = true;
			}
			localModel.setProperty("/schAgrReleaseDataVisible", visible);
		},
		onValueHelpOKEmailTo: function (oEvent) {
			debugger;
			var oSmartTable = sap.ui.getCore().byId('smartTEmails');
			var table = oSmartTable.getTable();
			var selectedItem = table.getSelectedItem();
			var selectedItemBindingContext = selectedItem.getBindingContext();
			var model = selectedItemBindingContext.getModel();
			var path = selectedItemBindingContext.getPath();

			var email = model.getProperty(path + '/Receiver');
			var lifnr = model.getProperty(path + '/Lifnr');
			var name = model.getProperty(path + '/Name1');

			var mainModel = this.getModel("mainModel");
			var bindingContext = mainModel.getProperty("/bindingContext");
			var bindingPath = bindingContext.getPath();
			mainModel.setProperty(bindingPath + '/Receiver', email);
			mainModel.setProperty(bindingPath + '/Lifnr', lifnr);
			mainModel.setProperty(bindingPath + '/Name', name);

			var oBtn = oEvent.getSource();
			var oDialog = oBtn.getParent();
			oDialog.close();
			oDialog.destroy();
		},

		onValueHelpOKEmailCC: function (oEvent) {
			debugger;
			var oSmartTable = sap.ui.getCore().byId('smartTEmails');
			var table = oSmartTable.getTable();
			var selectedItem = table.getSelectedItem();
			var selectedItemBindingContext = selectedItem.getBindingContext();
			var model = selectedItemBindingContext.getModel();
			var path = selectedItemBindingContext.getPath();

			this.email = model.getProperty(path + '/Receiver');
			var lifnr = model.getProperty(path + '/Lifnr');
			var name = model.getProperty(path + '/Name1');

			this.CCModel = this.getView().getModel("Users");
			/*var bindingContext = CCModel.getProperty("/bindingContext");
			var bindingPath = bindingContext.getPath();*/
			var oInput = this.byId(this.inputId);
			this.sPath = oInput.getBindingContext("Users").getPath();
			var po = this.getModel("mainModel").getProperty("/selectedPO");

			this.CCModel.setProperty(this.sPath + '/Ccreceiver', this.email);
			this.CCModel.setProperty(this.sPath + '/Lifnr', lifnr);
			this.CCModel.setProperty(this.sPath + '/Name', name);
			this.CCModel.setProperty(this.sPath + '/Ebeln', po);
			this.CCModel.setProperty(this.sPath + '/DocType', this.category);

			this.ccMails = [];
			this.ccMails = this.getView().getModel("Users").getData();

			var oBtn = oEvent.getSource();
			var oDialog = oBtn.getParent();
			oDialog.close();
			oDialog.destroy();

		},

		onEnterValueCC: function (oEvent) {
			var ccMails = [];
			ccMails = this.getView().byId("cc_rec");
		},

		onRemoveSelection: function (oEvent) {
			let table = oEvent.getSource().getParent().getParent();
			table.removeSelections();
		},

	});
});