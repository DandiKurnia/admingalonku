import { AppShell } from "@/components/app-shell"
import { TransactionList } from "@/components/transaction-list"
import { PermissionGuard } from "@/components/permission-guard"

export default function TransactionsPage() {
  return (
    <AppShell title="Transactions">
      <PermissionGuard permissionKey="transactions.read">
        <TransactionList />
      </PermissionGuard>
    </AppShell>
  )
}
