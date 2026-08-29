# Canonical Multimedia

`support_media` is the canonical persistence layer for support multimedia.

The editor may continue sending the legacy `imageUrls` field for compatibility, but the support write model must materialize those resources into `support_media` whenever explicit `media[]` is not supplied. The first resource is the cover; its type is taken from `technical.metadata.cover_media_type` (`image` or `video`). Additional resources are stored in `sort_order` order.

Public inventory reads use `media[]` first and retain `imageUrls` only as a legacy fallback.

No UX/layout changes are part of this integration.
