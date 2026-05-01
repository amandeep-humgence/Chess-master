'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { supabaseData } from '../../../lib/supabase/data'
import DataTable from '../../../components/admin/DataTable'
import Avatar from '../../../components/ui/Avatar'
import { formatDate } from '../../../lib/utils'
import type { UserDTO, PaginatedResponse } from '../../../types'

export default function AdminUsersPage() {
  const [page, setPage] = useState(1)

  const { data, isLoading } = useQuery<PaginatedResponse<UserDTO>>({
    queryKey: ['admin-users', page],
    queryFn: () => supabaseData.users.list(page, 20),
  })

  return (
    <div>
      <h1 className="mb-6 text-xl font-bold text-slate-100">Users</h1>
      <DataTable
        isLoading={isLoading}
        data={data?.data ?? []}
        page={page}
        totalPages={data?.totalPages ?? 1}
        onPageChange={setPage}
        emptyMessage="No users found."
        columns={[
          {
            header: 'User',
            accessor: (row: UserDTO) => {
              const name = row.profile ? `${row.profile.firstName} ${row.profile.lastName}` : '—'
              return (
                <div className="flex items-center gap-3">
                  <Avatar src={row.profile?.avatar} alt={name} size="sm" />
                  <div>
                    <p className="font-medium text-slate-200">{name}</p>
                    <p className="text-xs text-slate-500">{row.email}</p>
                  </div>
                </div>
              )
            },
          },
          {
            header: 'Role',
            accessor: (row: UserDTO) => (
              <span className={`text-xs font-medium ${row.role === 'ADMIN' ? 'text-amber-400' : 'text-slate-400'}`}>
                {row.role}
              </span>
            ),
          },
          { header: 'Rating', accessor: (row: UserDTO) => row.profile?.chessRating ?? '—' },
          { header: 'Joined', accessor: (row: UserDTO) => formatDate(row.createdAt) },
        ]}
      />
    </div>
  )
}
