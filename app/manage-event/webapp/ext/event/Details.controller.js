sap.ui.define(
    [
        'sap/fe/core/PageController',
        "manageevent/delegates/ItemTableDelegate"
    ],
    function(PageController,ItemTableDelegate) {
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

            },

            onAddTerm: function(oEvent){
                    this._OpenDialog(function(){
                    }).then(function(){
                    })
                    .catch(function(){
                    });
                
            },
            

            _OpenDialog : function(fnAction){

                return new Promise(
					function (resolve, reject) {
						this.loadFragment({
								name: "manageevent.ext.fragments.TermsValueHelp",
								controller: this
							})
							.then(function (approveDialog) {
								//Dialog Continue button
								approveDialog.getBeginButton().attachPress(function (oEvent) {
									approveDialog.close();
                                    approveDialog.addedItems.forEach(element => {
                                        var oBindingContext = approveDialog.getBindingContext();
                                        var oCreate =approveDialog.getModel().bindList(oBindingContext.getPath() + '/terms').create({
                                            "id" : element,
                                            "Event_ID" : oBindingContext.getProperty("ID")
                                        });

                                       var oTable = this.getView().byId('treeTable');
                                       oCreate.oCreatedPromise.then(async function(a){
                                        var ranges = await this.oContext.getModel().bindList(this.oContext.getPath() + '/ranges').requestContexts();
                                        oTable.addColumn(ItemTableDelegate.addColumn(oTable,oCreate,ranges));

                                       }.bind({oContext :oCreate, oTable : oTable }));
                                       
                                    });
									resolve(null);
								}.bind(this));
								//Dialog Cancel button
								approveDialog.getEndButton().attachPress(function (oEvent) {
									approveDialog.close().destroy();
									reject(null);
								});
								//consider dialog closing with Escape
								approveDialog.attachAfterClose(function () {
									approveDialog.close().destroy();
									reject(null);
								});
                                approveDialog.removedItems = [];
                                approveDialog.addedItems = [];
								approveDialog.open();
							}.bind(this));
					}.bind(this)
				);

            },

            onTermFragmentUpdateFinish : async function(oEvent){
                var oListBinding = await oEvent.getSource().getModel().bindList(oEvent.getSource().getBindingContext().getPath() + '/terms');
                var oSelectedTerms = await oListBinding.requestContexts();
                var oList = this.byId("multiSelectList");
                var aItems = oList.getItems();

                aItems.forEach(function(oItem) {
                    var oItemContext = oItem.getBindingContext();
                    if (oItemContext) {
                      var itemId = oItemContext.getProperty("id");
                      var isSelected = oSelectedTerms.some(function(oTermBinding) {
                        return oTermBinding.getProperty("id") === itemId;
                      });
                      oItem.setSelected(isSelected);
                    }
                  });

            },

            onTermSelectionChange: function(oEvent){
                var isNew = oEvent.getParameter('selected');
                var oItem = oEvent.getParameter('listItem');
                var oDialog = oEvent.getSource().getParent();
                var itemId = oItem.getBindingContext().getProperty("id");
                if (isNew) {
                    // Add to addedItems if not already present
                    if (!oDialog.addedItems.includes(itemId)) {
                        oDialog.addedItems.push(itemId);
                    }
                    // Remove from removedItems if it exists there
                    var index = oDialog.removedItems.indexOf(itemId);
                    if (index !== -1) {
                        oDialog.removedItems.splice(index, 1);
                    }
                } else {
                    // Only add to removedItems if not present in addedItems
                    if (!oDialog.addedItems.includes(itemId) && !oDialog.removedItems.includes(itemId)) {
                        oDialog.removedItems.push(itemId);
                    }else if(oDialog.addedItems.includes(itemId)){
                        var index = oDialog.addedItems.indexOf(itemId);
                        if (index !== -1) {
                            oDialog.addedItems.splice(index, 1);
                        }
                    }
                }
                
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
