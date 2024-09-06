sap.ui.define([
	"sap/ui/model/CompositeType",
], function(CompositeType) {
	"use strict";

	var Number = CompositeType.extend("manageevent.custom.types.TermValueNumber", {

		constructor : function (oFormatOptions) {
			CompositeType.apply(this, arguments);
            this.bParseWithValues = true; // Publicly documented. Make 'parts' available in parseValue
            this.bUseRawValues = true;
		}

	});


	Number.prototype.formatValue = function(parts){
        if(parts[0] && Array.isArray(parts)){
            const foundObject = parts[0].find(obj => obj.term_id === parts[1]);
            if(foundObject){
                if(foundObject.termValue[0]){                  
                    return foundObject.termValue[0].value;
                }
            }
            return "";      
        }
        return parts;

      };

    Number.prototype.parseValue = function(sValue, sSourceType) {
        return sValue;
	};

	Number.prototype.validateValue = function(vValue) {

	};

	Number.prototype.getParseException = function () {
		var oBundle = Library.getResourceBundleFor("sap.ui.core"),
			sText;

		if (!this.bShowNumber) {
			sText = oBundle.getText("Currency.InvalidMeasure");
		} else if (!this.bShowMeasure) {
			sText = oBundle.getText("EnterNumber");
		} else {
			sText = oBundle.getText("Currency.Invalid");
		}

		return new ParseException(sText);
	};

	return Number;

});