from django.conf import settings
from django.http import FileResponse, Http404, HttpResponse, JsonResponse
from django.shortcuts import get_object_or_404
from django.views import View
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response

from .models import AuthToken, ChecklistItem, Flat, Inspection, Issue, ItemResponse, Photo
from .report.generate import render_pdf
from .serializers import serialize_checklist_item, serialize_inspection, serialize_unit


def health(request):
    return JsonResponse({"ok": True})


class SPAView(View):
    """Serve the React index.html for any non-/api, non-/media, non-/static path."""

    def get(self, request, *args, **kwargs):
        index = settings.FRONTEND_DIST / "index.html"
        if not index.exists():
            raise Http404("frontend not built (run: cd frontend && npm run build)")
        return FileResponse(open(index, "rb"), content_type="text/html")


def _authenticate(request):
    """Resolve the Flat scoped to an `Authorization: Token <key>` header, or None."""
    auth = request.headers.get("Authorization", "")
    if not auth.startswith("Token "):
        return None
    token = AuthToken.objects.select_related("flat").filter(key=auth[6:].strip()).first()
    return token.flat if token else None


@api_view(["POST"])
def send_otp(request):
    # Mock: no SMS provider. Fixed dev code, echoed back only in DEBUG.
    body = {"sent": True}
    if settings.DEBUG:
        body["otp"] = "0000"
    return Response(body)


@api_view(["POST"])
def verify_otp(request):
    customer_number = str(request.data.get("customer_number", "")).strip()
    otp = str(request.data.get("otp", ""))
    if otp != "0000":
        return Response({"detail": "Incorrect OTP."}, status=status.HTTP_400_BAD_REQUEST)
    flat = Flat.objects.filter(customer_number=customer_number).first()
    if not flat:
        return Response({"detail": "unit not found"}, status=status.HTTP_404_NOT_FOUND)
    token = AuthToken.objects.create(flat=flat)
    return Response({"token": token.key})


@api_view(["GET"])
def unit_detail(request):
    flat = _authenticate(request)
    if not flat:
        return Response(status=status.HTTP_401_UNAUTHORIZED)
    return Response(serialize_unit(flat))


@api_view(["GET"])
def checklist(request):
    items = ChecklistItem.objects.filter(active=True)
    return Response([serialize_checklist_item(i) for i in items])


def _apply_meta(inspection, meta):
    # Date fields are nullable and must become None when cleared; the
    # CharFields below are non-nullable, so an empty string stays "" (setting
    # them to None trips a NOT NULL constraint on save).
    for key in ("inspector_name", "inspector_contact", "company", "fm_name", "fm_contact"):
        if key in meta:
            setattr(inspection, key, meta[key] or "")
    for key in ("inspection_date", "expected_resolution_date"):
        if key in meta:
            setattr(inspection, key, meta[key] or None)


def _sync_responses(inspection, responses):
    """Full-replace each room/item's response + issues from the given dict,
    matching uploaded photo URLs (from /api/media/upload) back to Photo rows."""
    media_prefix = settings.MEDIA_URL
    for room_key, items in (responses or {}).items():
        for item_id, cell in items.items():
            item_response, _ = ItemResponse.objects.get_or_create(
                inspection=inspection, room_key=room_key, item_id=item_id
            )
            item_response.response = cell.get("response")
            item_response.skip_reason = cell.get("skip_reason") or ""
            item_response.save()
            item_response.issues.all().delete()
            for issue_data in cell.get("issues", []):
                issue = Issue.objects.create(
                    item_response=item_response,
                    heading=issue_data.get("heading", ""),
                    exact_location=issue_data.get("exact_location", ""),
                )
                for url in issue_data.get("photos", []):
                    name = url[len(media_prefix):] if url.startswith(media_prefix) else url
                    Photo.objects.filter(image=name).update(issue=issue)


@api_view(["GET", "POST"])
def inspection_draft(request):
    flat = _authenticate(request)
    if not flat:
        return Response(status=status.HTTP_401_UNAUTHORIZED)

    if request.method == "GET":
        inspection = Inspection.objects.filter(flat=flat, status="in_progress").first()
        return Response(serialize_inspection(inspection) if inspection else None)

    # POST: idempotent create/replace of the flat's one active draft.
    inspection, _ = Inspection.objects.get_or_create(flat=flat, status="in_progress")
    _apply_meta(inspection, request.data.get("meta") or {})
    inspection.save()
    _sync_responses(inspection, request.data.get("responses") or {})
    return Response(serialize_inspection(inspection), status=status.HTTP_201_CREATED)


@api_view(["PATCH"])
def inspection_update(request, pk):
    flat = _authenticate(request)
    if not flat:
        return Response(status=status.HTTP_401_UNAUTHORIZED)
    inspection = get_object_or_404(Inspection, pk=pk, flat=flat)

    data = request.data
    if "meta" in data:
        _apply_meta(inspection, data["meta"] or {})
    if "customer_signed" in data:
        inspection.customer_signed = bool(data["customer_signed"])
    if "inspector_signed" in data:
        inspection.inspector_signed = bool(data["inspector_signed"])
    inspection.save()
    if "responses" in data:
        _sync_responses(inspection, data["responses"])
    return Response(serialize_inspection(inspection))


@api_view(["POST"])
def media_upload(request):
    flat = _authenticate(request)
    if not flat:
        return Response(status=status.HTTP_401_UNAUTHORIZED)
    file = request.FILES.get("file")
    if not file:
        return Response({"detail": "file is required"}, status=status.HTTP_400_BAD_REQUEST)
    photo = Photo.objects.create(image=file)
    return Response({"id": photo.id, "url": photo.image.url}, status=status.HTTP_201_CREATED)


@api_view(["POST"])
def inspection_submit(request, pk):
    flat = _authenticate(request)
    if not flat:
        return Response(status=status.HTTP_401_UNAUTHORIZED)
    inspection = get_object_or_404(Inspection, pk=pk, flat=flat)

    if inspection.status != "submitted":
        has_issues = Issue.objects.filter(item_response__inspection=inspection).exists()
        flat.status = "issues" if has_issues else "clear"
        flat.save()
        inspection.status = "submitted"
        inspection.save()

    return Response({"report_url": f"/api/inspection/{inspection.id}/report.pdf"})


@api_view(["GET"])
def inspection_report(request, pk):
    inspection = get_object_or_404(Inspection, pk=pk)
    pdf_bytes = render_pdf(inspection)
    return HttpResponse(pdf_bytes, content_type="application/pdf")
