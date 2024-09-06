sap.ui.define(
    [
        'sap/fe/core/PageController'
    ],
    function(PageController) {
        'use strict';

        return PageController.extend('manageevent.ext.event.Details', {
            /**
             * Called when a controller is instantiated and its View controls (if available) are already created.
             * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
             * @memberOf nexus.supplier.ext.main.Main
             */
             onInit: function () {
                PageController.prototype.onInit.apply(this);
             },


             onModelContextChange: async function(oEvent){
                var oContext = this.getView()?.getBindingContext();
                var isActiveEntity = await oContext?.requestProperty("IsActiveEntity");

                if (isActiveEntity !== undefined) {
                    var uiModel = this.getView()?.getModel("ui");
                    uiModel.setProperty("/isEditable", !isActiveEntity);
              }
            },

            onEdit: async function(oEvent){
                var oContext = this.getView().getBindingContext();
                this.getView().setBusy(true);
                await this.getExtensionAPI().getEditFlow().editDocument(oContext);
                this.getView().getModel().refresh();
                this.getView().setBusy(false);
                
            },

            onSave : async function(){
                await this.editFlow.saveDocument(this.getView().getBindingContext());
                var uiModel = this.getView()?.getModel("ui");
                uiModel.setProperty("/isEditable", false);
                this.getView()?.getModel().refresh();
            },
    
            onCancel : async function(oEvent) {
                await this.editFlow.cancelDocument(this.getView().getBindingContext(), { cancelButton: oEvent.getSource(), skipDiscardPopover: true });
                var uiModel = this.getView()?.getModel("ui");
                uiModel.setProperty("/isEditable", false);
                this.getView()?.getModel().refresh();

            }

            /**
             * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
             * (NOT before the first rendering! onInit() is used for that one!).
             * @memberOf nexus.supplier.ext.main.Main
             */
            //  onBeforeRendering: function() {
            //
            //  },

            /**
             * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
             * This hook is the same one that SAPUI5 controls get after being rendered.
             * @memberOf nexus.supplier.ext.main.Main
             */
            //  onAfterRendering: function() {
            //
            //  },

            /**
             * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
             * @memberOf nexus.supplier.ext.main.Main
             */
            //  onExit: function() {
            //
            //  }
        });
    }
);
