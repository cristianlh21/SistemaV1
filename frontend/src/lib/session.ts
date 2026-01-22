import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { SessionPayload } from "@/types/session"; // <-- Importa desde el nuevo archivo

const secretKey = process.env.SESSION_SECRET || "clave_secreta_provisoria_123";
const key = new TextEncoder().encode(secretKey);

// 2. Tipamos el 'payload' como SessionPayload
export async function encrypt(payload: SessionPayload): Promise<string> {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("8h")
    .sign(key);
}

// 3. Tipamos el retorno como Promise<SessionPayload | null>
export async function decrypt(input: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(input, key, {
      algorithms: ["HS256"],
    });

    // Usamos 'as SessionPayload' para asegurar a TS que el contenido es correcto
    return payload as SessionPayload;
  } catch {
    // Si el token es inválido o expiró, devolvemos null
    return null;
  }
}

export async function createSession(empleado: SessionPayload) {
  const expires = new Date(Date.now() + 8 * 60 * 60 * 1000);
  const session = await encrypt(empleado);

  const cookieStore = await cookies();
  cookieStore.set("session", session, {
    expires,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });
}

export async function deleteSession() {
  const cookieStore = await cookies();
  cookieStore.delete("session");
}
