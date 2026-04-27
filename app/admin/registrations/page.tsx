'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import api from '../../../lib/api'
import DataTable from '../../../components/admin/DataTable'
import { Badge } from '../../../components/ui/Badge'
import { formatDate } from '../../../lib/utils'
import type { RegistrationDTO, PaginatedResponse } from '../../../types'

export default function AdminRegistrationsPage() {
  const [page, setPage] = useState(1)

  const { data, isLoading } = useQuery<PaginatedResponse<RegistrationDTO>>({
    queryKey: ['admin-registrations', page],
    queryFn: async () => {
      const res = await api.get<{ data: PaginatedResponse<RegistrationDTO> }>(`/api/admin/registrations?page=${page}&limit=20`)
      return res.data.data
    },
  })

  return (
    <div>
      <h1 className="mb-6 text-xl font-bold text-slate-100">Registrations</h1>
      <DataTable
        isLoading={isLoading}
        data={data?.data ?? []}
        page={page}
        totalPages={data?.totalPages ?? 1}
        onPageChange={setPage}
        columns={[
          {
            header: 'Player',
            accessor: (row: RegistrationDTO) => {
              const u = row.user as { profile?: { firstName: string; lastName: string }; email: string } | undefined
              return u?.profile ? `${u.profile.firstName} ${u.profile.lastName}` : u?.email ?? '—'
            },
          },
          {
            header: 'Tournament',
            accessor: (row: RegistrationDTO) => (row.tournament as { title?: string })?.title ?? '—',
          },
          {
            header: 'Date',
            accessor: (row: RegistrationDTO) => formatDate(row.createdAt),
          },
          {
            header: 'Status',
            accessor: (row: RegistrationDTO) => <Badge status={row.status} type="registration" />,
          },
        ]}
      />
    </div>
  )
}
