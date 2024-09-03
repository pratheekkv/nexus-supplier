package com.sap.supplier.manage;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.Iterator;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.context.annotation.RequestScope;

import com.sap.cds.Result;
import com.sap.cds.ResultBuilder;
import com.sap.cds.ql.Select;
import com.sap.cds.ql.cqn.AnalysisResult;
import com.sap.cds.ql.cqn.CqnAnalyzer;
import com.sap.cds.ql.cqn.CqnSelect;
import com.sap.cds.ql.cqn.CqnSelectListItem;
import com.sap.cds.ql.cqn.CqnStatement;
import com.sap.cds.ql.cqn.ResolvedSegment;
import com.sap.cds.ql.impl.SelectListValueBuilder;
import com.sap.cds.reflect.CdsModel;
import com.sap.cds.services.cds.CdsCreateEventContext;
import com.sap.cds.services.cds.CdsDeleteEventContext;
import com.sap.cds.services.cds.CdsReadEventContext;
import com.sap.cds.services.cds.CdsUpdateEventContext;
import com.sap.cds.services.cds.CqnService;
import com.sap.cds.services.handler.EventHandler;
import com.sap.cds.services.handler.annotations.On;
import com.sap.cds.services.handler.annotations.ServiceName;

import cds.gen.buyerservice.BuyerService_;
import cds.gen.buyerservice.ItemTermValues_;
import cds.gen.eventservice.EventService;

@Component
@RequestScope
@ServiceName(BuyerService_.CDS_NAME)
public class BuyerServiceHandler implements EventHandler{

    @Autowired
    private EventService eventService;

    @On(event = CqnService.EVENT_READ)
    public void redirectReadToEventService(CdsReadEventContext context) {
        CqnSelect select = context.getCqn();

        List<CqnSelectListItem> items = select.items();

        List<CqnSelectListItem> expand = new ArrayList<>();
        List<CqnSelectListItem> columns = new ArrayList<>();

        for (CqnSelectListItem cqnSelectListItem : items) {
            
            if(cqnSelectListItem.isExpand()){
                expand.add(cqnSelectListItem);
            }
            else if(cqnSelectListItem.isSelectList()){
                columns.add(cqnSelectListItem);
            }
        }

        List<CqnSelectListItem> filteredItems = items.stream()
                                                    .filter(item -> !(item instanceof SelectListValueBuilder) && !"IsActiveEntity".equals(item.asRef().displayName()) && !"HasActiveEntity".equals(item.asRef().displayName())
                                                                    && !"HasDraftEntity".equals(item.asRef().displayName()) && !"DraftAdministrativeData_DraftUUID".equals(item.asRef().displayName())
                                                                    )
                                                    .collect(Collectors.toList());

        CqnSelect newCqn = Select.copy(select).columns(filteredItems).orderBy(List.of()).inlineCount();
        // Redirect to eventService
         context.setResult(eventService.run(newCqn));
    }

    @On(event = CqnService.EVENT_READ, entity = ItemTermValues_.CDS_NAME)
    public void itemTermValuesRead(CdsReadEventContext context) {
        System.out.println("itemTermValuesRead Read Called");
        CqnSelect cqn = context.getCqn();
        System.out.println(cqn.toString());

        Result res = ResultBuilder.selectedRows(Collections.emptyList()).result();
        context.setResult(res);

    }    

    @On(event = CqnService.EVENT_CREATE)
    public void redirectCreateToEventService(CdsCreateEventContext context) {
        context.setResult(eventService.run(context.getCqn()));
    }

    @On(event = CqnService.EVENT_UPDATE)
    public void redirectUpdateToEventService(CdsUpdateEventContext context) {
        context.setResult(eventService.run(context.getCqn()));
    }

    @On(event = CqnService.EVENT_DELETE)
    public void redirectDeleteToEventService(CdsDeleteEventContext context) {
        context.setResult(eventService.run(context.getCqn()));
    }

}
