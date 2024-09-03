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

  virtual LimitedDescendantCount : Integer64;

  virtual DistanceFromRoot       : Integer64;

  virtual DrillState             : String;

  virtual Matched                : Boolean;

  virtual MatchedDescendantCount : Integer64;

  terms: Composition of many ItemTerms on terms.Item = $self;
  event: Association to one Event;
  parent : Association to one Item on parent.node_id = parent_id;

}

entity ItemTerms {
  key id : Association to one Terms;
  key Item: Association to Item;
  termValue: Composition of many ItemTerms on termValue.id = $self.id and termValue.Item = $self.Item;

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