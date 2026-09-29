import json
from ..models import AuditLog

def log_event(db, actor_user_id, action, resource_type, resource_id=None, severity="INFO", details=None):
    row = AuditLog(actor_user_id=actor_user_id, action=action, resource_type=resource_type,
                   resource_id=str(resource_id) if resource_id is not None else None,
                   severity=severity, details=json.dumps(details or {}))
    db.add(row)
    db.commit()
    return row
