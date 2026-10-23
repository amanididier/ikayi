<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Ikayi is a separate credit-only TanStack app; the Stoke Yange reference is read-only to preserve the original product.
- Credit views share one CreditBook module with indexed Dexie device storage under an Ikayi-specific name, preserving offline-first reference behavior without touching source data.
- Aggregate credit entries once by party using a Map and query only the active party kind, avoiding repeated full-history scans.
- Existing-service connection is user-managed in project settings; do not copy reference credentials, simulate successful authentication, or claim cloud sync without a verified connected service.
- Native startup fixes belong in the guarded post-sync script and launch theme only, preserving launcher assets because Android displays its system splash before React can render.
- Usage increments and upload acknowledgements must preserve concurrent visits in Dexie transactions, and upload attempts share a single daily-gated promise to avoid duplicate background sends.
- Manual sync merges remote-only rows instead of replacing device tables, so entries made during network requests are retained; full multi-device conflict and deletion reconciliation is not implemented.
