# Security Specification - ProjectX UAE

## Data Invariants
1.  **Admins**: Only users in `/admins/` can perform administrative tasks.
2.  **Developers**: Can be read by everyone, but only admins can create/update/delete.
3.  **Projects**: Can be read by everyone. Creation/Update/Delete restricted to Admins.
4.  **Users**: A user can only read and write their own profile document (`/users/{userId}`).

## The "Dirty Dozen" Payloads (Deny Cases)
1.  **Anonymous Write to Users**: Try to write to `/users/some-uid` without being logged in.
2.  **Spoofing User ID**: Try to write to `/users/target-uid` while logged in as `attacker-uid`.
3.  **Admin Escalation**: Try to write to `/admins/attacker-uid` to make self admin.
4.  **Developer Poisoning**: Try to create a developer with a 1MB name string.
5.  **Project Hijacking**: Try to update a project's `developer` field to something else without permissions.
6.  **Immutable Field Bypass**: Try to change a user's `email` after it has been set (or if the app determines it's immutable via some flag).
7.  **Resource Exhaustion**: Try to upload 1000 properties in a single user profile.
8.  **Project ID Poisoning**: Create a project with an ID containing malicious characters.
9.  **Relational Orphan**: Create a project without a valid developer ID (if existence check is implemented).
10. **Verified Agent Spoof**: Try to set `isVerifiedAgent` to `true` as a regular user.
11. **System Field Update**: Try to manually set `updatedAt` to a future date (manual timestamp).
12. **Blanket Read of Users**: Try to list all users as a regular authenticated user.

## Test Runner Logic
The `firestore.rules` will verify:
-   `request.auth.uid == userId` for the `/users/` collection.
-   `exists(/databases/$(database)/documents/admins/$(request.auth.uid))` for privileged collections.
-   Schema validation via `isValidUser`, `isValidProject`, etc.
