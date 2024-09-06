sap.ui.define([
    "sap/ui/mdc/TableDelegate",
    "sap/ui/mdc/Field",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "manageevent/custom/types/TermValueNumber"
], function (TableDelegate,  FieldBase, JSONModel, Filter, FilterOperator, TermValueNumber) {
    "use strict";

    var MyTableDelegate = Object.assign({}, TableDelegate);

        var fetchModel = async function(oControl) {
            return new Promise((resolve) => {
                const sModelName = oControl.getDelegate().payload && oControl.getDelegate().payload.modelName,
                    oContext = { modelName: sModelName, control: oControl, resolve: resolve };
                _retrieveModel.call(oContext);
            });
        };

        var _retrieveModel = async function () {
            this.control.detachModelContextChange(_retrieveModel, this);
            const sModelName = this.modelName,
                oModel = this.control.getModel(sModelName);
                var oContext = this.control.getBindingContext();
        
            if (oModel && oContext) {
                this.resolve(oModel);
            } else {
                this.control.attachModelContextChange(_retrieveModel, this);
            }
        };

        MyTableDelegate.fetchProperties = async function (oTable) {

            return fetchModel(oTable)
			.then(async (model) => {
                oTable.attachModelContextChange(function(oEvent){
                    oEvent.getSource().rebind();
                });
                var aProperties = [];
                try{
                    var oContext = oTable.getBindingContext();
                    var aTerms = await oTable.getModel().bindList(oContext.getPath() + '/terms').requestContexts();
                    for (const term of aTerms) { 
                        var id = await term.requestProperty("id");
                        var description = await term.requestProperty("description");
                        var datatype = await term.requestProperty("datatype");
                        
                        aProperties.push({
                            key: id,
                            label: description,
                            path: "",
                            dataType: "sap.ui.model.type." + datatype
                        })
        
                        oTable.addColumn(_addColumn(oTable,oTable.getId() + "---col-" + id, id, datatype));
                      }
                        oTable.rebind();
                        return aProperties;
                }catch(error){
                    console.log(error);
                }

			});


        };

        /**
         * Bind the columns to the table.
         */
       var _addColumn = function (oTable,sId, sPropertyKey, datatype) {
        var dataType = new TermValueNumber();
        var field = new FieldBase({ value: { parts : [ { path : 'itemterms', mode: 'OneWay'} , {value : sPropertyKey}, { path : 'IsActiveEntity'}  ],
            type:  dataType},
            editMode: "{=${ui>/isEditable}=== true ? 'Editable' : 'ReadOnly'}" });   
            field.attachChange(function(oEvent){
                    var parts = oEvent.getSource().getBinding('value').getValue();
                    if(parts[0] && Array.isArray(parts)){
                        const foundObject = parts[0].find(obj => obj.term_id === parts[1]);
                        if(foundObject){
                            if(foundObject.termValue[0]){
                                oEvent.getSource().sBindingPath = `/ItemTermValues(ID=${foundObject.termValue[0].ID},IsActiveEntity=${foundObject.termValue[0].IsActiveEntity})`;
                            }
                        }   
                    }

                if(oEvent.getSource().sBindingPath){
                   var oBindingContext = oEvent.getSource().getModel().getKeepAliveContext(oEvent.getSource().sBindingPath);
                   oBindingContext.setProperty('value',oEvent.getParameter('value'));
                }
            });
        var oColumn = new sap.ui.mdc.table.Column(sId,{
                header: sPropertyKey,
                dataProperty: sPropertyKey,
                template: field
            });

            var oData = {
                id: sPropertyKey
            };

            var oModel = new JSONModel(oData);
            oColumn.setModel(oModel,"termModel");
            return oColumn;

        };

        MyTableDelegate.addItem = async (oTable, sPropertyKey) => {
            // const oPropertyInfo = JSONPropertyInfo.find((oPI) => oPI.key === sPropertyKey);
            const sId = oTable.getId() + "---col-" + sPropertyKey;
            var IsActiveEntity = await oTable.getBindingContext().requestProperty("IsActiveEntity");
            const filters = [new Filter("id", FilterOperator.Eq, sPropertyKey)];
            var termBinding = await oTable.getModel().getKeepAliveContext("/Term(id='" +eventId+"',IsActiveEntity="+IsActiveEntity+")" );
            var dataType = await termBinding.requestProperty("datatype");
            return await _addColumn(oTable,sId, sPropertyKey,dataType);
        };

        MyTableDelegate.updateBindingInfo = function (oTable, oBindingInfo) {
 
            TableDelegate.updateBindingInfo.call(MyTableDelegate, oTable, oBindingInfo);
            if(!oTable.getBindingContext()){
                return;
            }
            oBindingInfo.path = oTable.getBindingContext().getPath() + oTable.getPayload().bindingPath;
            oBindingInfo.parameters.$expand = 'itemterms($select=term_id;$expand=termValue)';
        };

        return MyTableDelegate;
});