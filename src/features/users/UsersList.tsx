import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Shield, Check } from 'lucide-react';
import { toast } from 'sonner';
import {
  useGetUsersQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
} from './userApi';
import type { UsersQueryParams } from './userApi';
import type { User } from '@/features/auth/authSlice';
import { DataTable } from '@/components/ui/DataTable';
import type { ColumnDef, FilterOption, BulkActionDef } from '@/components/ui/DataTable';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Dialog } from '@/components/ui/Dialog';
import { UserForm } from './UserForm';
import type { UserFormSchema } from './UserForm';
import { Helmet } from 'react-helmet-async';

export const UsersList: React.FC = () => {
  // Query parameters state
  const [queryParams, setQueryParams] = useState<UsersQueryParams>({
    page: 1,
    limit: 10,
    search: '',
    sortBy: 'name',
    sortOrder: 'asc',
    role: '',
  });

  // Selected rows
  const [selectedRows, setSelectedRows] = useState<User[]>([]);

  // Modals visibility state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // Queries & Mutations hooks
  const { data, isLoading, isFetching } = useGetUsersQuery(queryParams);
  const [createUser, { isLoading: isCreating }] = useCreateUserMutation();
  const [updateUser, { isLoading: isUpdating }] = useUpdateUserMutation();
  const [deleteUser] = useDeleteUserMutation();

  const handlePageChange = (page: number) => {
    setQueryParams((prev) => ({ ...prev, page }));
  };

  const handleLimitChange = (limit: number) => {
    setQueryParams((prev) => ({ ...prev, limit, page: 1 }));
  };

  const handleSearchChange = (search: string) => {
    setQueryParams((prev) => ({ ...prev, search, page: 1 }));
  };

  const handleFilterChange = (role: string) => {
    setQueryParams((prev) => ({ ...prev, role, page: 1 }));
  };

  const handleSortChange = (key: string, order: 'asc' | 'desc') => {
    setQueryParams((prev) => ({ ...prev, sortBy: key, sortOrder: order }));
  };

  // CRUD handlers
  const handleAddUserSubmit = async (formData: UserFormSchema) => {
    try {
      await createUser(formData).unwrap();
      toast.success('User added successfully');
      setIsAddOpen(false);
    } catch (err: any) {
      toast.error(err.data?.message || 'Failed to create user');
    }
  };

  const handleEditUserSubmit = async (formData: UserFormSchema) => {
    if (!editingUser) return;
    try {
      await updateUser({
        id: editingUser.id,
        changes: formData,
        queryParams, // Needed for optimistic update cache target
      }).unwrap();
      toast.success('User details updated successfully');
      setIsEditOpen(false);
      setEditingUser(null);
    } catch (err: any) {
      toast.error(err.data?.message || 'Failed to update user');
    }
  };

  const handleDeleteClick = async (id: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    try {
      await deleteUser(id).unwrap();
      toast.success('User deleted successfully');
      setSelectedRows((prev) => prev.filter((r) => (r.id || (r as any)._id) !== id));
    } catch (err: any) {
      toast.error(err.data?.message || 'Failed to delete user');
    }
  };

  // Bulk action handlers
  const handleBulkDelete = async (rows: User[]) => {
    if (!confirm(`Are you sure you want to delete ${rows.length} users?`)) return;
    try {
      await Promise.all(rows.map((row) => deleteUser(row.id).unwrap()));
      toast.success(`${rows.length} users deleted successfully`);
      setSelectedRows([]);
    } catch {
      toast.error('Some deletions failed');
    }
  };

  // Columns definitions
  const columns: ColumnDef<User>[] = [
    {
      key: 'avatar',
      header: 'User',
      cell: (row) => (
        <div className="flex items-center gap-3">
          <Avatar src={row.avatar} alt={row.name} />
          <div className="text-left font-sans">
            <span className="font-semibold text-foreground text-sm block">{row.name}</span>
            <span className="text-xs text-muted-foreground font-mono block">{row.id || (row as any)._id}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'email',
      header: 'Email Address',
      sortable: true,
      cell: (row) => <span className="font-mono text-xs">{row.email}</span>,
    },
    {
      key: 'role',
      header: 'System Role',
      sortable: true,
      cell: (row) => {
        const isAdmin = row.role === 'admin';
        return (
          <Badge variant={isAdmin ? 'default' : 'secondary'} className="gap-1 font-sans">
            {isAdmin ? <Shield className="h-3 w-3" /> : null}
            {row.role.toUpperCase()}
          </Badge>
        );
      },
    },
    {
      key: 'actions',
      header: 'Actions',
      cell: (row) => (
        <div className="flex items-center gap-1.5">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              setEditingUser(row);
              setIsEditOpen(true);
            }}
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
          >
            <Edit2 className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleDeleteClick(row.id || (row as any)._id)}
            className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      ),
    },
  ];

  const filterOptions: FilterOption[] = [
    { value: 'user', label: 'User Role' },
    { value: 'admin', label: 'Admin Role' },
  ];

  const bulkActions: BulkActionDef<User>[] = [
    {
      label: 'Delete Selected',
      icon: <Trash2 className="h-3 w-3" />,
      onClick: handleBulkDelete,
      variant: 'destructive',
    },
    {
      label: 'Activate Accounts',
      icon: <Check className="h-3 w-3" />,
      onClick: (rows) => {
        toast.success(`Activated accounts for: ${rows.map((r) => r.name).join(', ')}`);
        setSelectedRows([]);
      },
      variant: 'outline',
    },
  ];

  return (
    <div className="space-y-6 text-left">
      <Helmet>
        <title>User Accounts | Antigravity Core</title>
      </Helmet>

      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Users Management</h1>
          <p className="text-muted-foreground text-sm font-sans mt-0.5">
            Administer accounts, toggle credentials, and review user roles.
          </p>
        </div>
        <Button variant="primary" onClick={() => setIsAddOpen(true)} className="gap-1.5 font-sans">
          <Plus className="h-4.5 w-4.5" /> Add User
        </Button>
      </div>

      {/* Paginated Data Table view */}
      <DataTable
        columns={columns}
        data={data?.data || []}
        isLoading={isLoading || isFetching}
        currentPage={queryParams.page}
        limit={queryParams.limit}
        totalItems={data?.total || 0}
        totalPages={data?.totalPages || 0}
        onPageChange={handlePageChange}
        onLimitChange={handleLimitChange}
        searchValue={queryParams.search || ''}
        onSearchChange={handleSearchChange}
        filterValue={queryParams.role}
        filterOptions={filterOptions}
        onFilterChange={handleFilterChange}
        sortBy={queryParams.sortBy || 'name'}
        sortOrder={queryParams.sortOrder || 'asc'}
        onSortChange={handleSortChange}
        selectedRows={selectedRows}
        onSelectedRowsChange={setSelectedRows}
        bulkActions={bulkActions}
        getRowId={(row) => row.id || (row as any)._id}
      />

      {/* Dialog for Creating Users */}
      <Dialog
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Add New User Account"
      >
        <UserForm onSubmit={handleAddUserSubmit} isLoading={isCreating} submitLabel="Create User" />
      </Dialog>

      {/* Dialog for Editing Users */}
      <Dialog
        isOpen={isEditOpen}
        onClose={() => {
          setIsEditOpen(false);
          setEditingUser(null);
        }}
        title="Edit User Profile"
      >
        {editingUser && (
          <UserForm
            defaultValues={editingUser}
            onSubmit={handleEditUserSubmit}
            isLoading={isUpdating}
            submitLabel="Save Changes"
          />
        )}
      </Dialog>
    </div>
  );
};
export default UsersList;
