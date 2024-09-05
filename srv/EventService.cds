using { com.sap.supplier.db as db } from '../db/Events';
using { cuid } from '@sap/cds/common';
@odata.apply.transformations
service EventService {
    @odata.draft.enabled
    entity Event        as projection on db.Event;
    entity Item         as projection on db.Item;
    entity ItemTerms    as projection on db.ItemTerms;
    entity Supplier     as projection on db.Supplier;
    entity Terms        as projection on db.Terms;
    entity TermRange     as projection on db.TermRange;
    entity EventType    as projection on db.EventType;
    entity ItemType     as projection on db.ItemType;
    
}