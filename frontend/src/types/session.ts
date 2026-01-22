// src/types/session.ts
import type { JWTPayload } from "jose";

export type Rol = "ADMIN" | "RECEPCIONISTA" | "MUCAMA";

export interface SessionPayload extends JWTPayload {
  id: string;
  nombre: string;
  rol: Rol;
}