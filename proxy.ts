import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { papelDasClaims } from "@/lib/auth/papel";

/**
 * Porteiro do site: toda página e toda API exige login de um usuário com acesso
 * liberado (papel "leitor" ou "admin"). Só a tela /entrar fica aberta.
 * Área /admin e a planilha completa exigem papel "admin".
 */
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
      },
    },
  );

  // Confere a assinatura do token (e renova a sessão quando está para vencer).
  const { data } = await supabase.auth.getClaims();
  const papel = papelDasClaims(data?.claims);
  const caminho = request.nextUrl.pathname;
  // O otimizador de fotos também é fechado: sem login, ninguém usa a cota do site.
  const ehApi = caminho.startsWith("/api/") || caminho.startsWith("/_next/image");

  // Respostas de redirecionamento/erro levam junto os cookies renovados.
  const comCookies = (r: NextResponse) => {
    response.cookies.getAll().forEach((c) => r.cookies.set(c));
    r.headers.set("Cache-Control", "no-store");
    return r;
  };

  if (caminho === "/entrar") {
    if (papel) return comCookies(NextResponse.redirect(new URL("/", request.url)));
    return response;
  }

  if (!papel) {
    if (ehApi) return comCookies(NextResponse.json({ erro: "nao-autenticado" }, { status: 401 }));
    const url = new URL("/entrar", request.url);
    if (caminho !== "/") url.searchParams.set("retorno", caminho + request.nextUrl.search);
    return comCookies(NextResponse.redirect(url));
  }

  const soAdmin = caminho === "/admin" || caminho.startsWith("/admin/") || caminho === "/api/exportar";
  if (soAdmin && papel !== "admin") {
    if (ehApi) return comCookies(NextResponse.json({ erro: "sem-permissao" }, { status: 403 }));
    return comCookies(NextResponse.redirect(new URL("/", request.url)));
  }

  return response;
}

export const config = {
  matcher: [
    "/_next/image",
    "/((?!_next/static|_next/image|favicon.ico|icon.svg|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
