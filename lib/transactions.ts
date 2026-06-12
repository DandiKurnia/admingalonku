"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { apiFetchData, AuthError } from "./api"
import type { Transaction, TransactionDetail, TransactionStats } from "./types"

async function getToken() {
  const cookieStore = await cookies()
  const token = cookieStore.get("access_token")?.value
  if (!token) redirect("/login")
  return token
}

function handleAuthError(err: unknown): never {
  if (err instanceof AuthError) redirect("/login")
  throw err
}

export async function getTransactions(): Promise<Transaction[]> {
  try {
    const token = await getToken()
    return await apiFetchData<Transaction[]>("/transactions", token)
  } catch (err) {
    handleAuthError(err)
  }
}

export async function getTransactionById(
  id: number
): Promise<TransactionDetail> {
  try {
    const token = await getToken()
    return await apiFetchData<TransactionDetail>(`/transactions/${id}`, token)
  } catch (err) {
    handleAuthError(err)
  }
}

export async function getTransactionStats(
  groupBy: "daily" | "monthly" = "daily",
  addressId?: number
): Promise<TransactionStats[]> {
  try {
    const token = await getToken()
    const params = new URLSearchParams({ groupBy })
    if (addressId) params.set("addressId", String(addressId))
    return await apiFetchData<TransactionStats[]>(
      `/transactions/stats?${params}`,
      token
    )
  } catch (err) {
    handleAuthError(err)
  }
}

export interface DashboardSummary {
  total_devices: number
  total_transactions: number
  total_galons: number
  total_revenue: number
}

export async function getTransactionSummary(
  addressId?: number
): Promise<DashboardSummary> {
  try {
    const token = await getToken()
    const params = new URLSearchParams()
    if (addressId) params.set("addressId", String(addressId))
    return await apiFetchData<DashboardSummary>(
      `/transactions/summary?${params}`,
      token
    )
  } catch (err) {
    handleAuthError(err)
  }
}
