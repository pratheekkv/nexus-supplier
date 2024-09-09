sap.ui.define([
	"sap/ui/base/Object",
    "sap/ui/mdc/ValueHelp",
    "sap/ui/mdc/valuehelp/content/FixedList",
    "sap/ui/mdc/valuehelp/content/FixedListItem",
    "sap/ui/mdc/valuehelp/Popover",
    "sap/ui/model/json/JSONModel",
    "sap/ui/mdc/Field",
    "manageevent/custom/types/TermValueNumber"
], function(Object, FieldValueHelp,FixedList,FixedListItem,Popover,JSONModel,Field, TermValueNumber) {
	"use strict";

    var fnChangeHandler = function(oEvent){
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
    };

    var simpleDataType = new TermValueNumber();

	return Object.extend("manageevent.custom.fields.DropDownFieldGenerator", {

        getField: function(sPropertyKey,aRangeData){

            if(!aRangeData){
                return;
            }
            
            var oData = {items:[]};
            for (const r of aRangeData) { 

                oData.items.push({keyid: r.keyid, description : r.description});
            }

            var oModel = new JSONModel(oData);
            
                // Create FixedList for Value Help
                var oFixedList = new FixedList({
                    filterList: false,
                    useFirstMatch: false,
                    items: {
                        path: "valueHelp>/items",
                        template: new FixedListItem({
                            key: "{valueHelp>keyid}",
                            text: "{valueHelp>description}",
                            additionalText: "{valueHelp>keyid}"
                        })
                    }
                });

                oFixedList.setModel(oModel,"valueHelp");

                // Create Popover for Value Help
                var oPopover = new Popover({
                    content: oFixedList
                });

                oPopover.setModel(oModel,"valueHelp");

                  // Create FieldValueHelp
            var oFieldValueHelp = new FieldValueHelp({
                delegate: {
                    name: "manageevent/delegates/ValueHelpDelegate",
                    payload: {
                        searchKeys: ["key", "name"],
                        shouldOpenOnClick: true
                    }
                },
                typeahead: oPopover
            });

            oFieldValueHelp.setModel(oModel,"valueHelp");

              // Create MDC Field with Value Help
              var oField = new Field({
                value: { parts : [ 
                    { path : 'itemterms', mode: 'OneWay'} , 
                    {value : sPropertyKey}, 
                    { path : 'IsActiveEntity'}  ],
            type:  simpleDataType},
                editMode: "{=${ui>/isEditable}=== true ? 'Editable' : 'Display'}",
                display: "Description",
                valueHelp: oFieldValueHelp,
                change: fnChangeHandler
            });

            oField.setModel(oModel,"valueHelp");

            return oField;
        }

	});

});