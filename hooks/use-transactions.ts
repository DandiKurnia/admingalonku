"use client"

import { useQuery } from "@tanstack/react-query"
import {
  getTransactions,
  getTransactionById,
  getTransactionStats,
  getTransactionSummary,
} from "@/lib/transactions"

export const transactionKeys = {
  all: ["transactions"] as const,
  list: () => [...transactionKeys.all, "list"] as const,
  detail: (id: number) => [...transactionKeys.all, "detail", id] as const,
}

export function useTransactions() {
  return useQuery({
    queryKey: transactionKeys.list(),
    queryFn: () => getTransactions(),
  })
}

export function useTransaction(id: number) {
  return useQuery({
    queryKey: transactionKeys.detail(id),
    queryFn: () => getTransactionById(id),
    enabled: Number.isFinite(id) && id > 0,
  })
}

export function useTransactionStats(
  groupBy: "daily" | "monthly" = "daily",
  addressId?: number,
  enabled: boolean = true
) {
  return useQuery({
    queryKey: [...transactionKeys.all, "stats", groupBy, addressId],
    queryFn: () => getTransactionStats(groupBy, addressId),
    enabled: enabled && Number.isFinite(addressId ?? 0) && (addressId ?? 0) > 0,
  })
}

export function useTransactionSummary(addressId?: number, enabled: boolean = true) {
  return useQuery({
    queryKey: [...transactionKeys.all, "summary", addressId],
    queryFn: () => getTransactionSummary(addressId),
    enabled: enabled,
  })
}
