sap.ui.define([
    "sap/ui/mdc/TableDelegate",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "manageevent/custom/fields/SimpleFieldGenerator",
    "manageevent/custom/fields/DropDownFieldGenerator"
], function (TableDelegate, JSONModel, Filter, FilterOperator, SimpleFieldGenerator,DropDownFieldGenerator) {
    "use strict";

    var oSimpleFieldGenerator = new SimpleFieldGenerator();
    var oDropDownFieldGenerator = new DropDownFieldGenerator();

    var MyTableDelegate = Object.assign({}, TableDelegate);

        var fetchModel = async function(oControl) {
            return new Promise((resolve) => {
                const sModelName = oControl.getDelegate().payload && oControl.getDelegate().payload.modelName,
                    oContext = { sModelName: sModelName, oControl: oControl, resolve: resolve };
                _retrieveModel.call(oContext);
            });
        };

        var _retrieveModel = async function () {
            this.oControl.detachModelContextChange(_retrieveModel, this);
            var oModel = this.oControl.getModel(this.sModelName);
            var oContext = this.oControl.getBindingContext();
        
            if (oModel && oContext) {
                this.resolve(oModel);
            } else {
                this.oControl.attachModelContextChange(_retrieveModel, this);
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
                    var aTerms = await oTable.getModel().bindList('terms',oContext,[],[],{$expand:'ranges($select=keyid,description)'}).requestContexts();
                    for (const term of aTerms) { 
                        var id = await term.requestProperty("id");
                        var description = await term.requestProperty("description");
                        var datatype = await term.requestProperty("datatype");
                        var ranges = await term.requestObject("ranges");
                        
                        aProperties.push({
                            key: id,
                            label: description,
                            path: "",
                            dataType: "sap.ui.model.type." + datatype
                        });

                        oTable.addColumn(_addColumn(oTable,term,ranges));
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
       var _addColumn = function (oTable,oTermBinding,oRangeData) {
            var sPropertyKey = oTermBinding.getProperty("id");
            var sDescription =  oTermBinding.getProperty("description");
            var isDropDown =  oTermBinding.getProperty("isDropDown");
            var datatype =  oTermBinding.getProperty("datatype");
            var sId = oTable.getId() + "---col-" + sPropertyKey;
            var oField = null;
            if(isDropDown === false){
                oField = oSimpleFieldGenerator.getField(sPropertyKey);
            }else {
                oField = oDropDownFieldGenerator.getField(sPropertyKey, oRangeData);
            }
            
            var oColumn = new sap.ui.mdc.table.Column(sId,{
                    header: sDescription,
                    dataProperty: sPropertyKey,
                    template: oField
            });

            var oData = { id: sPropertyKey };

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
            var label = await termBinding.requestProperty("description");
            return await _addColumn(oTable,sId, sPropertyKey,dataType,label);
        };

        MyTableDelegate.updateBindingInfo = function (oTable, oBindingInfo) {
 
            TableDelegate.updateBindingInfo.call(MyTableDelegate, oTable, oBindingInfo);
            if(!oTable.getBindingContext()){
                return;
            }
            oBindingInfo.path = oTable.getBindingContext().getPath() + oTable.getPayload().bindingPath;
            oBindingInfo.parameters.$expand = 'itemterms($select=term_id;$expand=termValue)';
        };

        MyTableDelegate.addColumn = function (oTable,oTermBinding,oRangeData) {
            var sPropertyKey = oTermBinding.getProperty("id");
            var sDescription =  oTermBinding.getProperty("description");
            var isDropDown =  oTermBinding.getProperty("isDropDown");
            var datatype =  oTermBinding.getProperty("datatype");
            var sId = oTable.getId() + "---col-" + sPropertyKey;
            var oField = null;
            if(isDropDown === false){
                oField = oSimpleFieldGenerator.getField(sPropertyKey);
            }else {
                oField = oDropDownFieldGenerator.getField(sPropertyKey, oRangeData);
            }
            
            var oColumn = new sap.ui.mdc.table.Column(sId,{
                    header: sDescription,
                    dataProperty: sPropertyKey,
                    template: oField
            });

            var oData = { id: sPropertyKey };

            var oModel = new JSONModel(oData);
            oColumn.setModel(oModel,"termModel");
            return oColumn;
        };

        return MyTableDelegate;
});