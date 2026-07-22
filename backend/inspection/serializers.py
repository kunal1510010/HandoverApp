"""Plain dict builders — the API shape mirrors the prototype's in-memory
state 1:1 (PRD §17), which doesn't map cleanly onto DRF ModelSerializer
field-for-field renaming, so building dicts directly is less code."""


def serialize_room(room):
    return {"key": room.key, "label": room.label, "type": room.type, "order": room.order}


def serialize_unit(flat):
    return {
        "customer_number": flat.customer_number,
        "customer_name": flat.customer_name,
        "email": flat.email,
        "project": flat.project,
        "product": flat.product,
        "tower": flat.tower,
        "unit_no": flat.unit_no,
        "config": flat.config,
        "sqft": flat.sqft,
        "status": flat.status,
        "floor_plan": flat.floor_plan.url if flat.floor_plan else None,
        "rooms": [serialize_room(r) for r in flat.rooms.order_by("order")],
    }


def serialize_checklist_item(item):
    return {
        "id": item.item_id,
        "cat": item.category,
        "sub": item.subcategory,
        "text": item.text,
        "applies": item.applies_to,
    }


def serialize_issue(issue):
    return {
        "heading": issue.heading,
        "exact_location": issue.exact_location,
        "photos": [p.image.url for p in issue.photos.all()],
        "fixed": issue.fixed,
    }


def serialize_inspection(inspection):
    responses = {}
    for r in inspection.responses.prefetch_related("issues__photos"):
        responses.setdefault(r.room_key, {})[r.item_id] = {
            "response": r.response,
            "skip_reason": r.skip_reason,
            "issues": [serialize_issue(i) for i in r.issues.all()],
        }
    return {
        "id": inspection.id,
        "mode": inspection.mode,
        "status": inspection.status,
        "responses": responses,
        "meta": {
            "inspector_name": inspection.inspector_name,
            "inspector_contact": inspection.inspector_contact,
            "company": inspection.company,
            "fm_name": inspection.fm_name,
            "fm_contact": inspection.fm_contact,
            "inspection_date": inspection.inspection_date,
            "expected_resolution_date": inspection.expected_resolution_date,
            "sqft": inspection.flat.sqft,
            "customer_signed": inspection.customer_signed,
            "inspector_signed": inspection.inspector_signed,
        },
    }
