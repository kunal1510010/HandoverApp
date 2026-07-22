from django.contrib import admin

from .models import ChecklistItem, Flat, Inspection, Issue, ItemResponse, Photo, Room


@admin.register(Flat)
class FlatAdmin(admin.ModelAdmin):
    list_display = ("unit_no", "customer_number", "customer_name", "config", "status", "floor_plan")


admin.site.register(Room)
admin.site.register(ChecklistItem)
admin.site.register(Inspection)
admin.site.register(ItemResponse)
admin.site.register(Issue)
admin.site.register(Photo)
