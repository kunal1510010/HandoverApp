from django.template.loader import render_to_string
from weasyprint import HTML

from ..models import ChecklistItem


def _build_context(inspection):
    flat = inspection.flat
    rooms = list(flat.rooms.order_by("order"))
    checklist_by_id = {c.item_id: c for c in ChecklistItem.objects.all()}

    by_room = {}
    for r in inspection.responses.prefetch_related("issues__photos"):
        by_room.setdefault(r.room_key, []).append(r)

    summary_rows = []
    issue_groups = []
    total_issues = 0
    for room in rooms:
        room_issues = []
        for r in by_room.get(room.key, []):
            item = checklist_by_id.get(r.item_id)
            for issue in r.issues.all():
                room_issues.append({
                    "crumb": f"{item.category} → {item.subcategory}" if item else r.item_id,
                    "text": item.text if item else "",
                    "heading": issue.heading,
                    "exact_location": issue.exact_location,
                    "photos": [p.image.path for p in issue.photos.all() if p.image],
                })
        summary_rows.append({"label": room.label, "count": len(room_issues)})
        total_issues += len(room_issues)
        if room_issues:
            issue_groups.append({"room": room.label, "issues": room_issues})

    return {
        "flat": flat,
        "inspection": inspection,
        "summary_rows": summary_rows,
        "issue_groups": issue_groups,
        "total_issues": total_issues,
        "has_issues": total_issues > 0,
    }


def render_pdf(inspection):
    html = render_to_string("report/report.html", _build_context(inspection))
    return HTML(string=html).write_pdf()
