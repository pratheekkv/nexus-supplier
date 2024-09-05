using { EventService  } from './EventService';
using { cuid } from '@sap/cds/common';

service  BuyerService {
    @odata.draft.enabled
    entity Event        as projection on EventService.Event;
    entity Item         as projection on EventService.Item;
    entity ItemTerms    as projection on EventService.ItemTerms;
    entity Supplier     as projection on EventService.Supplier;
    entity Terms        as projection on EventService.Terms;
    entity TermRange     as projection on EventService.TermRange;
    entity EventType    as projection on EventService.EventType;
    entity ItemType     as projection on EventService.ItemType; 

    extend projection ItemTerms with {
        termValue : Composition of many ItemTermValues on termValue.term = $self.term and termValue.item = $self.item
    };

    @cds.persistence.skip
    entity ItemTermValues : cuid {
    term : Association to one Terms;
    item: Association to Item;
    value : String
    }

    annotate BuyerService.Event with @( Capabilities.InsertRestrictions.Insertable : true )

};

