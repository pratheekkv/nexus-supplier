namespace com.sap.supplier.db;

using { managed, cuid } from '@sap/cds/common';


entity Event : cuid, managed {
  description: String;    
  type : Association to EventType;
  version: String;
  status: String;
  owner: String;
  eventBiddingEnds: Integer;
  eventDurationUOM: String;
  awardDate: Date;
  startBidOnPublish : Boolean;
  biddingEnd : Integer;
  biidingEndUnit : String(6);
  items: Composition of many Item on items.event = $self;
  suppliers: Composition of many Supplier on suppliers.event = $self;
  terms: Composition of many Terms on terms.Event = $self;
}

entity Item : cuid {
  node_id: String;
  parent_id  : type of node_id;
  itemType : Association to ItemType;
  itemterms: Composition of many ItemTerms on itemterms.item = $self;
  event: Association to one Event;
  parent : Association to one Item on parent.node_id = parent_id;
}

entity ItemTerms : cuid {
  term : Association to Terms;
  item: Association to Item;

}

entity Supplier: cuid, managed {
  event: Association to one Event;
  orgName: String;  
  contact: String;
  riskLevel: String;  
  incumbentSupplier: Boolean;  
  excludedSupplier: Boolean;
}

entity Terms {
  key id : String;
  key Event: Association to one Event;
  description : String;  
  datatype : String;
  isDropDown : Boolean;
  isMultiInput : Boolean;
  ranges: Composition of many TermRange on ranges.term = $self;
}

entity TermRange : cuid {
  term: Association to Terms;
  keyid: String;
  description : String;
}

@cds.odata.valuelist
entity EventType {
  key id : String;
  description : String;  
}

@cds.odata.valuelist
entity ItemType {
  key id : String;
  description : String;  
}