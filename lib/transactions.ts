"use server"

import { cookies } from "next/headers"
import { apiFetchData } from "./api"
import type { Transaction, TransactionDetail, TransactionStats } from "./types"

async function getToken() {
  const cookieStore = await cookies()
  const token = cookieStore.get("access_token")?.value
  if (!token) throw new Error("Unauthorized")
  return token
}

export async function getTransactions(): Promise<Transaction[]> {
  const token = await getToken()
  return apiFetchData<Transaction[]>("/transactions", token)
}

export async function getTransactionById(
  id: number
): Promise<TransactionDetail> {
  const token = await getToken()
  return apiFetchData<TransactionDetail>(`/transactions/${id}`, token)
}

export async function getTransactionStats(
  groupBy: "daily" | "monthly" = "daily",
  addressId?: number
): Promise<TransactionStats[]> {
  const token = await getToken()
  const params = new URLSearchParams({ groupBy })
  if (addressId) params.set("addressId", String(addressId))
  return apiFetchData<TransactionStats[]>(
    `/transactions/stats?${params}`,
    token
  )
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
  const token = await getToken()
  const params = new URLSearchParams()
  if (addressId) params.set("addressId", String(addressId))
  return apiFetchData<DashboardSummary>(
    `/transactions/summary?${params}`,
    token
  )
}
