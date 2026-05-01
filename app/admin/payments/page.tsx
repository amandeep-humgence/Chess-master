'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { supabaseData } from '../../../lib/supabase/data'
import DataTable from '../../../components/admin/DataTable'
import { Badge } from '../../../components/ui/Badge'
import { formatDate, formatCurrency } from '../../../lib/utils'
import type { PaymentDTO, PaginatedResponse } from '../../../types'

export default function AdminPaymentsPage() {
  const [page, setPage] = useState(1)

  const { data, isLoading } = useQuery<PaginatedResponse<PaymentDTO>>({
    queryKey: ['admin-payments', page],
    queryFn: () => supabaseData.payments.list(page, 20),
  })

  return (
    <div>
      <h1 className="mb-6 text-xl font-bold text-slate-100">Payments</h1>
      <DataTable
        isLoading={isLoading}
        data={data?.data ?? []}
        page={page}
        totalPages={data?.totalPages ?? 1}
        onPageChange={setPage}
        columns={[
          {
            header: 'Player',
            accessor: (row: PaymentDTO) => {
              const u = (row as { user?: { profile?: { firstName: string; lastName: string }; email: string } }).user
              return u?.profile ? `${u.profile.firstName} ${u.profile.lastName}` : u?.email ?? '—'
            },
          },
          {
            header: 'Tournament',
            accessor: (row: PaymentDTO) => (row.tournament as { title?: string })?.title ?? '—',
          },
          { header: 'Amount', accessor: (row: PaymentDTO) => formatCurrency(row.amount, row.currency) },
          { header: 'Date', accessor: (row: PaymentDTO) => formatDate(row.createdAt) },
          {
            header: 'Status',
            accessor: (row: PaymentDTO) => <Badge status={row.status} type="payment" />,
          },
        ]}
      />
    </div>
  )
}
