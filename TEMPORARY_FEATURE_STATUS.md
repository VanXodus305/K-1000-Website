# Temporary Feature Status

Last updated: July 25, 2026

This note tracks features that are intentionally hidden or temporarily closed. The related source code and data have not been deleted unless stated otherwise.

| Feature | Current status | What remains available |
| --- | --- | --- |
| Homepage Domain Holo Panel | Temporarily closed | Domain nodes and their hover presentation remain visible. Pressing a node does not open the panel. The panel component and domain data remain in the codebase. |
| Branch leadership cards | Hidden | The Branches page remains available as an information page. Leadership data remains in `src/data/leadership.ts`. |
| Office leadership cards | Hidden | The Offices page remains available as an information page. Leadership data remains in `src/data/leadership.ts`. |
| Local admin preview access | Temporarily closed | The redesigned admin interface remains available through the normal password-backed authentication flow. The local preview bypass and sample records are disabled. |

## Restore Points

- Set `DOMAIN_HOLO_PANEL_ENABLED` to `true` in `src/components/home/UnifiedPortal.tsx` to restore Domain Holo Panel opening.
- Restore leadership rendering in the Branches and Offices pages when those sections are ready to display again.
- Do not restore the admin preview bypass for production. Use the existing authenticated admin API flow.
