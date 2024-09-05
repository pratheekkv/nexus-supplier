package com.sap.supplier.manage.CqnModifier;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.stereotype.Component;

import com.sap.cds.impl.builder.model.ComparisonPredicate;
import com.sap.cds.impl.builder.model.Conjunction;
import com.sap.cds.impl.builder.model.ExpandBuilder;
import com.sap.cds.impl.builder.model.StructuredTypeRefImpl;
import com.sap.cds.impl.parser.token.RefSegmentBuilder;
import com.sap.cds.ql.RefBuilder.RefSegment;
import com.sap.cds.ql.Select;
import com.sap.cds.ql.StructuredTypeRef;
import com.sap.cds.ql.cqn.CqnExpression;
import com.sap.cds.ql.cqn.CqnPredicate;
import com.sap.cds.ql.cqn.CqnReference.Segment;
import com.sap.cds.ql.cqn.CqnSelect;
import com.sap.cds.ql.cqn.CqnSelectListItem;
import com.sap.cds.ql.cqn.CqnStar;
import com.sap.cds.ql.cqn.CqnStructuredTypeRef;

@Component
public class BuyerServiceCqnModifier {

    public CqnSelect getNewCqn(CqnSelect cqn) {

        CqnStructuredTypeRef source = cqn.from().asRef();
        List<Segment> segments = source.segments();

        List<Segment> alteredsegments = new ArrayList<Segment>();
        int index = 0;
        for (Segment segment : segments) {
            alteredsegments.add(index, removeUnwantedFieldsFromSegments(segment));
            index++;
        }

        StructuredTypeRefImpl.typeRef(alteredsegments);
        boolean isCountRequired = cqn.hasInlineCount();
        Select newSelect = Select.from(StructuredTypeRefImpl.typeRef(alteredsegments)).columns(cqn.items()).limit(cqn.top())
                .groupBy(cqn.groupBy());
        if(isCountRequired){
            newSelect.inlineCount();
        }

        cqn = newSelect;

        List<CqnSelectListItem> star = cqn.items().stream()
                .filter(item -> item instanceof CqnStar )
                .collect(Collectors.toList());

        List<CqnSelectListItem> filteredItems = cqn.items().stream()
                .filter(item -> !item.isExpand() && !(item instanceof CqnStar )&& !"IsActiveEntity".equals(item.asRef().displayName())
                        && !"HasActiveEntity".equals(item.asRef().displayName())
                        && !"HasDraftEntity".equals(item.asRef().displayName())
                        && !"DraftAdministrativeData_DraftUUID".equals(item.asRef().displayName()))
                .collect(Collectors.toList());

        if(star.size()> 0){
            filteredItems.addAll(star);
        }        

        List<CqnSelectListItem> expandedItems = cqn.items().stream()
                .filter(item -> item.isExpand())
                .collect(Collectors.toList());

        List<CqnSelectListItem> filteredExpandedItems = new ArrayList<>();

        for (CqnSelectListItem cqnSelectListItem : expandedItems) {
            CqnSelectListItem item = removeUnwantedExpandFromSelect((ExpandBuilder) cqnSelectListItem);
            if (item != null) {
                filteredExpandedItems.add(item);
            }

        }

        if (filteredExpandedItems.size() > 0) {
            filteredItems.addAll(filteredExpandedItems);
        }
        
        cqn = Select.copy(cqn).columns(filteredItems);
        return cqn;
    }

    private RefSegment removeUnwantedFieldsFromSegments(Segment segment) {

        Optional<CqnPredicate> availableFilters = segment.filter();
        RefSegment newSegment = RefSegmentBuilder.copy(segment);
        if (availableFilters.isPresent()) {
            CqnExpression expression = availableFilters.get();
            if (expression instanceof Conjunction) { // In caae of IsActiveEntity. It has to be a Conjunction
                List<CqnPredicate> filters = ((Conjunction) expression).predicates();
                for (CqnPredicate cqnPredicate : filters) {
                    ComparisonPredicate elements = (ComparisonPredicate) cqnPredicate.asExpression();
                    if (!"IsActiveEntity".equals(elements.left().asRef().displayName())) {
                        newSegment.filter(elements);
                    }
                }
            }
        }
        return newSegment;
    }

    private ExpandBuilder removeUnwantedExpandFromSelect(ExpandBuilder cqn) {

        String dname = cqn.displayName();
        StructuredTypeRef ref = cqn.ref();

        if ("termValue".equals(cqn.displayName())) {
            return null;
        }

        ExpandBuilder newExpand = ExpandBuilder.expand(ref);

        List<CqnSelectListItem> expandedItems = cqn.items().stream()
                .filter(item -> item.isExpand())
                .collect(Collectors.toList());

        List<CqnSelectListItem> selectedFields = cqn.items().stream()
                .filter(item -> !item.isExpand())
                .collect(Collectors.toList());

        for (CqnSelectListItem expandItem : expandedItems) {
            String expand = expandItem.toString();
            ExpandBuilder item = (ExpandBuilder) expandItem;
            ExpandBuilder result = removeUnwantedExpandFromSelect(item);
            if (result != null) {
                selectedFields.add(result);
            }

        }
        if (selectedFields.size() > 0) {
            newExpand.items(selectedFields);
        }
        return newExpand;
    }

    public ExpandBuilder getTermValueExpand(CqnSelect cqn){

        List<CqnSelectListItem> expandedItems = cqn.items().stream()
                .filter(item -> item.isExpand())
                .collect(Collectors.toList());


        for (CqnSelectListItem cqnSelectListItem : expandedItems) {
            CqnSelectListItem item = getTermValueExpand((ExpandBuilder) cqnSelectListItem);
            if (item != null) {
                return (ExpandBuilder) item;
            }

        }

        return null;

    }

    private ExpandBuilder getTermValueExpand(ExpandBuilder cqn) {

        String dname = cqn.displayName();
        StructuredTypeRef ref = cqn.ref();

        if ("termValue".equals(cqn.displayName())) {
            return cqn;
        }

        ExpandBuilder newExpand = ExpandBuilder.expand(ref);

        List<CqnSelectListItem> expandedItems = cqn.items().stream()
                .filter(item -> item.isExpand())
                .collect(Collectors.toList());

        List<CqnSelectListItem> selectedFields = cqn.items().stream()
                .filter(item -> !item.isExpand())
                .collect(Collectors.toList());

        for (CqnSelectListItem expandItem : expandedItems) {
            String expand = expandItem.toString();
            ExpandBuilder item = (ExpandBuilder) expandItem;
            ExpandBuilder result = getTermValueExpand(item);
            if (result != null) {
                return result;
            }

        }

        return null;
    }
}
