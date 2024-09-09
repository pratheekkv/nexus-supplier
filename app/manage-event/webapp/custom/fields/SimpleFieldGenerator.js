sap.ui.define([
	"sap/ui/base/Object",
    "sap/ui/mdc/Field",
    "manageevent/custom/types/TermValueNumber"
], function(Object, Field, TermValueNumber) {
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

	return Object.extend("manageevent.custom.fields.SimpleFieldGenerator", {

        getField: function(sPropertyKey){
            
            var field = new Field({ 
                                        value: { parts : [ 
                                                            { path : 'itemterms', mode: 'OneWay'} , 
                                                            {value : sPropertyKey}, 
                                                            { path : 'IsActiveEntity'}  ],
                                                 type:  simpleDataType},
                                        editMode: "{=${ui>/isEditable}=== true ? 'Editable' : 'Display'}",
                                        change: fnChangeHandler }); 
            return field;
        }

	});

});