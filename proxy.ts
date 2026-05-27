import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const PUBLIC_PATHS = ["/login"]
const ALLOWED_ROLES = ["super-admin", "operator"]

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (PUBLIC_PATHS.some((path) => pathname.startsWith(path))) {
    return NextResponse.next()
  }

  const token = request.cookies.get("access_token")?.value
  const userCookie = request.cookies.get("user")?.value

  console.log(`[PROXY DEBUG] pathname: ${pathname}`)
  console.log(`[PROXY DEBUG] token present: ${!!token}, value length: ${token ? token.length : 0}`)
  console.log(`[PROXY DEBUG] userCookie present: ${!!userCookie}, value: ${userCookie}`)

  if (!token || !userCookie) {
    console.log(`[PROXY DEBUG] Missing token or userCookie. Redirecting to /login...`)
    return NextResponse.redirect(new URL("/login", request.url))
  }

  try {
    const user = JSON.parse(decodeURIComponent(userCookie))
    const roleKey = user?.role?.key
    console.log(`[PROXY DEBUG] parsed roleKey: ${roleKey}`)

    if (!ALLOWED_ROLES.includes(roleKey)) {
      console.log(`[PROXY DEBUG] Role ${roleKey} is not in ALLOWED_ROLES. Redirecting to /login...`)
      return NextResponse.redirect(new URL("/login", request.url))
    }
  } catch (err) {
    console.log(`[PROXY DEBUG] JSON parsing error or general error in proxy:`, err)
    return NextResponse.redirect(new URL("/login", request.url))
  }

  console.log(`[PROXY DEBUG] Proxy check passed. Proceeding to: ${pathname}`)
  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
}
