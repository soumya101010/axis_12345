const ADMIN_EMAIL = "soumyabiswas2004@gmail.com";

export function isAdmin(email?: string | null): boolean {
    return email === ADMIN_EMAIL;
}
