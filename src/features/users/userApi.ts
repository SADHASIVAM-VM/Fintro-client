import { baseApi } from '@/api/baseApi';
import type { User } from '@/features/auth/authSlice';

export interface UsersQueryParams {
  page: number;
  limit: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  role?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const userApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getUsers: builder.query<PaginatedResponse<User>, UsersQueryParams>({
      query: (params) => ({
        url: '/users',
        method: 'GET',
        params,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ id }) => ({ type: 'User' as const, id })),
              { type: 'User', id: 'LIST' },
            ]
          : [{ type: 'User', id: 'LIST' }],
    }),
    getUserById: builder.query<User, string>({
      query: (id) => ({
        url: `/users/${id}`,
        method: 'GET',
      }),
      providesTags: (_result, _error, id) => [{ type: 'User', id }],
    }),
    createUser: builder.mutation<User, Omit<User, 'id'>>({
      query: (newUser) => ({
        url: '/users',
        method: 'POST',
        data: newUser,
      }),
      invalidatesTags: [{ type: 'User', id: 'LIST' }],
    }),
    // Mutation with cache invalidation and Optimistic Updates
    updateUser: builder.mutation<User, { id: string; changes: Partial<User>; queryParams: UsersQueryParams }>({
      query: ({ id, changes }) => ({
        url: `/users/${id}`,
        method: 'PATCH',
        data: changes,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'User', id },
        { type: 'User', id: 'LIST' },
      ],
      // Optimistic update example: locally apply update to the cached list
      async onQueryStarted({ id, changes, queryParams }, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          userApi.util.updateQueryData('getUsers', queryParams, (draft) => {
            const user = draft.data.find((u) => u.id === id);
            if (user) {
              Object.assign(user, changes);
            }
          })
        );
        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
    }),
    deleteUser: builder.mutation<{ success: boolean; id: string }, string>({
      query: (id) => ({
        url: `/users/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'User', id: 'LIST' }],
    }),
  }),
});

export const {
  useGetUsersQuery,
  useGetUserByIdQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
} = userApi;
