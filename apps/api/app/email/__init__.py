"""Email subsystem package for Kavach (SMTP + outbox pattern + localized templates)."""
from .sender import enqueue_email, process_outbox_queue
from .suppression import is_suppressed, add_to_suppression_list, remove_from_suppression_list

__all__ = [
    "enqueue_email",
    "process_outbox_queue",
    "is_suppressed",
    "add_to_suppression_list",
    "remove_from_suppression_list",
]
