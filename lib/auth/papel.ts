export type Papel = "admin" | "leitor";

/** Papel gravado pelo administrador em app_metadata (o próprio usuário não consegue alterar). */
export function papelDasClaims(claims: unknown): Papel | null {
  const papel = (claims as { app_metadata?: { papel?: unknown } } | null)?.app_metadata?.papel;
  return papel === "admin" || papel === "leitor" ? papel : null;
}
