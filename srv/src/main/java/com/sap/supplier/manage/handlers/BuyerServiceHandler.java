package com.sap.supplier.manage.handlers;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.context.annotation.RequestScope;

import com.sap.cds.Result;
import com.sap.cds.Row;
import com.sap.cds.impl.builder.model.ExpandBuilder;
import com.sap.cds.ql.CQL;
import com.sap.cds.ql.Insert;
import com.sap.cds.ql.Select;
import com.sap.cds.ql.cqn.CqnInsert;
import com.sap.cds.ql.cqn.CqnSelect;
import com.sap.cds.ql.cqn.CqnSelectListItem;
import com.sap.cds.ql.cqn.CqnStar;
import com.sap.cds.ql.cqn.CqnUpdate;
import com.sap.cds.services.cds.CdsUpdateEventContext;
import com.sap.cds.services.cds.CqnService;
import com.sap.cds.services.draft.ActiveReadEventContext;
import com.sap.cds.services.draft.DraftCreateEventContext;
import com.sap.cds.services.draft.DraftService;
import com.sap.cds.services.draft.Drafts;
import com.sap.cds.services.handler.EventHandler;
import com.sap.cds.services.handler.annotations.After;
import com.sap.cds.services.handler.annotations.Before;
import com.sap.cds.services.handler.annotations.On;
import com.sap.cds.services.handler.annotations.ServiceName;
import com.sap.supplier.manage.CqnModifier.BuyerServiceCqnModifier;
import com.sap.supplier.manage.dataProvider.TermValueDataProvider;

import cds.gen.buyerservice.BuyerService_;
import cds.gen.buyerservice.Event;
import cds.gen.buyerservice.Event_;
import cds.gen.buyerservice.Item;
import cds.gen.buyerservice.ItemTerms_;
import cds.gen.buyerservice.Item_;
import cds.gen.buyerservice.TermRange;
import cds.gen.buyerservice.Terms_;
import cds.gen.eventservice.EventService;
import cds.gen.eventservice.TermRange_;
import cds.gen.eventservice.Terms;
import cds.gen.eventservice.TermsVH;
import cds.gen.eventservice.TermsVH_;

@Component
@RequestScope
@ServiceName(BuyerService_.CDS_NAME)
public class BuyerServiceHandler implements EventHandler {

    @Autowired
    private EventService eventService;

    @Autowired
    private BuyerServiceCqnModifier cqnModifier;

    @Autowired
    private TermValueDataProvider terValueDataProvider;

    @Autowired    
    private DraftService draftService;

    @On(event = DraftService.EVENT_ACTIVE_READ)
    public void redirectReadToEventService(ActiveReadEventContext context) {
        CqnSelect cqn = cqnModifier.getNewCqn(context.getCqn());
        Result result = eventService.run(cqn);
        // Fetch all rows
        List<Row> rows = result.listOf(Row.class);
        rows.forEach(row -> {
            Map<String, Object> rowMap = row;
            rowMap.put("IsActiveEntity", true);
            row.putAll(rowMap);
        });
        context.setResult(result);
    }

    @After(entity = Event_.CDS_NAME)
    public void afterActiveEventReadHandler(ActiveReadEventContext context) {
        ExpandBuilder termValueExpand = cqnModifier.getTermValueExpand(context.getCqn());
        if (termValueExpand == null) {
            return;
        }
        Result result = context.getResult();
        List<Event> events = result.listOf(Event.class);
        for (Event event : events) {
            for (Item item : event.getItems()) {
                terValueDataProvider.fillTermValues(item.getItemterms());
            }
        }
        context.setResult(events);
    }

    @After(entity = Item_.CDS_NAME)
    public void afterActiveItemReadHandler(ActiveReadEventContext context) {
        ExpandBuilder termValueExpand = cqnModifier.getTermValueExpand(context.getCqn());
        if (termValueExpand == null) {
            return;
        }
        Result result = context.getResult();
        List<Item> items = result.listOf(Item.class);
        for (Item item : items) {
            terValueDataProvider.fillTermValues(item.getItemterms());
        }
        context.setResult(items);
    }

    @After(entity = ItemTerms_.CDS_NAME)
    public void afterActiveItemTermReadHandler(ActiveReadEventContext context) {
        ExpandBuilder termValueExpand = cqnModifier.getTermValueExpand(context.getCqn());
    }


    @On(event = { CqnService.EVENT_UPDATE }, entity = Event_.CDS_NAME)
    public void handleEventUpdate(CdsUpdateEventContext context) {
        List<Map<String, Object>> values = cqnModifier.getItemTermValueOnUpdateEvent(context.getCqn());
        CqnUpdate update = cqnModifier.removeItemTermValueOnUpdateEvent(context.getCqn());
        Result result = eventService.run(update);
        context.setResult(eventService.run(context.getCqn()));
    }
    
    @Before(event = DraftService.EVENT_DRAFT_CREATE, entity = Terms_.CDS_NAME)
    public void handleAddTerm(DraftCreateEventContext context){
       CqnInsert cqn = context.getCqn();
       List<Map<String, Object>> newEntries = cqn.entries();

       for (Map<String,Object> entry : newEntries) {
            String selectedId = (String) entry.get("id");
            List<CqnSelectListItem> items = new ArrayList<>();
            items.add(CqnStar.star());
            items.add(CQL.to("ranges").expand(CqnStar.star()));
            
           CqnSelect query = Select.from(BuyerService_.TERMS_VH).columns(items).where(b -> b.id().eq(selectedId));
           Result result = eventService.run(query);
           List<Terms> terms = result.listOf(Terms.class);
           Map<String,Object> term = terms.get(0);
           entry.put("isDropDown", term.get("isDropDown"));
           entry.put("ranges", term.get("ranges"));
           List<Map<String,Object>> ranges = (List<Map<String, Object>>) entry.get("ranges");
           for (Map<String,Object> range : ranges) {
            range.put(Drafts.DRAFT_ADMINISTRATIVE_DATA, entry.get(Drafts.DRAFT_ADMINISTRATIVE_DATA));
            range.put(Drafts.DRAFT_ADMINISTRATIVE_DATA_DRAFT_UUID, entry.get(Drafts.DRAFT_ADMINISTRATIVE_DATA_DRAFT_UUID));
            range.put(Drafts.HAS_ACTIVE_ENTITY, false);
            range.put(Drafts.IS_ACTIVE_ENTITY, false);
            range.put(Drafts.HAS_DRAFT_ENTITY, false);
            range.put(TermRange.TERM_EVENT_ID,entry.get(Terms.EVENT_ID));
            range.put(TermRange.TERM_ID,entry.get(Terms.ID));
           }
           entry.put("datatype", term.get("datatype"));
           entry.put("description", term.get("description"));
           entry.put("isMultiInput", term.get("isMultiInput"));
           
           CqnInsert newTerm = Insert.copy(cqn).entries(Arrays.asList(entry));
        //    Result termDraft = draftService.newDraft(newTerm);
           context.setCqn(newTerm);
           return;

       }
    }

}
