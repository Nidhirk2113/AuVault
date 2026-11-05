import { AuditLog } from './models.js';

// Records who did what. Pass a session to make it part of a transaction.
export const audit = (user, action, entity, entityId, details = {}, session) =>
  AuditLog.create([{ user: user.id, action, entity, entityId: String(entityId), details }], { session });
