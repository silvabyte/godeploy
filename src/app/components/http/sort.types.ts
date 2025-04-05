export const GENERIC_SORT_QUERY_PARAMS = {
  'sort[created_at]': 'created_at',
  'sort[updated_at]': 'updated_at',
} as const;

export type GenericSortQueryParamKey = keyof typeof GENERIC_SORT_QUERY_PARAMS;
export type GenericSortQueryParamValue =
  (typeof GENERIC_SORT_QUERY_PARAMS)[GenericSortQueryParamKey];

export const DEPLOY_SORT_QUERY_PARAMS = {
  ...GENERIC_SORT_QUERY_PARAMS,
  'sort[status]': 'status',
} as const;

export type DeploySortQueryParamKey = keyof typeof DEPLOY_SORT_QUERY_PARAMS;
export type DeploySortQueryParamValue =
  (typeof DEPLOY_SORT_QUERY_PARAMS)[DeploySortQueryParamKey];
