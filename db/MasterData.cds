namespace com.sap.supplier.db;

using { managed, cuid } from '@sap/cds/common';


entity TermsMaster {
  key id : String;
  description : String;  
  datatype : String;
  isDropDown : Boolean;
  isMultiInput : Boolean;
  ranges: Composition of many TermRangeMaster on ranges.term = $self;
}


entity TermRangeMaster : cuid {
  term: Association to TermsMaster;
  keyid: String;
  description : String;
}