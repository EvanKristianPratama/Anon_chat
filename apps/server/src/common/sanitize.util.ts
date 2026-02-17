/**
 * Strips HTML tags and common XSS vectors from user-supplied text.
 * Keeps the string readable while removing dangerous payloads.
 */
export function sanitize(input: string): string {
    return input
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/javascript:/gi, "")
        .replace(/on\w+\s*=/gi, "");
}
