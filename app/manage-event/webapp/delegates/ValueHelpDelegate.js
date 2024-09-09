sap.ui.define([
	"sap/ui/mdc/ValueHelpDelegate",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator"
], (
	ValueHelpDelegate,
	Filter,
	FilterOperator
) => {
	"use strict";

	const JSONValueHelpDelegate = Object.assign({}, ValueHelpDelegate);

	JSONValueHelpDelegate.retrieveContent = function(oValueHelp, oContainer, sContentId) {

		const aContent = oContainer.getContent();
		const oContent = aContent[0];

		if (!oContent || !oContent.isA("sap.ui.mdc.valuehelp.content.MTable") || oContent.getTable()) {
			return Promise.resolve();
		}

		return new Promise((fnResolve, fnReject) => {
			sap.ui.require(["sap/m/library", "sap/m/Table", "sap/m/Column", "sap/m/ColumnListItem", "sap/m/Label", "sap/m/Text", "sap/ui/model/type/String"], function() {
				const [library, Table, Column, ColumnListItem, Label, Text, StringType] = Array.from(arguments);
				const { ListMode } = library;
				const oTable = new Table(oContainer.getId() + "-Table", {
					width: oContainer.isTypeahead() ? "13rem" : "100%",
					mode: oContainer.isTypeahead() ? ListMode.SingleSelectMaster : ListMode.SingleSelectLeft,
					columns: [
						new Column({
							width: "3rem",
							header: new Label({text: "ID"})
						}),
						new Column({
							width: "10rem",
							header: new Label({text: "Name"})
						})
					],
					items: {path: "valueHelp>/items", template: new ColumnListItem({
						type: "Active",
						cells: [
							new Text({text: {path: 'valueHelp>keyid', type: new StringType({}, {maxLength: 2})}}),
							new Text({text: {path: 'valueHelp>description', type: new StringType()}})
						]
					})}
				});
				oContent.setTable(oTable);
				fnResolve();
			}, fnReject);
		});
	};


	JSONValueHelpDelegate.shouldOpenOnClick = function(oValueHelp, oContainer) {
		const oPayload = oValueHelp.getPayload();

		if (oPayload && oPayload.hasOwnProperty("shouldOpenOnClick")) {
			return Promise.resolve(oPayload.shouldOpenOnClick);
		} else {
			return ValueHelpDelegate.shouldOpenOnClick.apply(this, arguments);
		}
	};



	return JSONValueHelpDelegate;

}

);