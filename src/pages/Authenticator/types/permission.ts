// Base Types matching your models
export interface Role {
  id: number;
  name: string;
  description?: string;
  status?: number;
  created_at?: string;
  updated_at?: string;
}

export interface Module {
  id: number;
  name: string;
  slug: string;
  status?: number;
  created_at?: string;
  updated_at?: string;
}

export interface Right {
  id: number;
  name: string;
  status?: number;
  created_at?: string;
  updated_at?: string;
}

export interface RoleModuleRight {
  id: number;
  role_id: number;
  module_id: number;
  right_id: number;
  created_at?: string;
  updated_at?: string;
}

export interface PermissionData {
  roles: Role[];
  modules: Module[];
  rights: Right[];
  role_module_rights: RoleModuleRight[];
}

export interface PermissionMatrix {
  [moduleId: number]: {
    [rightId: number]: boolean;
  };
}

export interface PermissionItem {
  module_id: number;
  right_id: number;
  granted: boolean;
}

export interface BulkPermissionUpdate {
  permissions: PermissionItem[];
}

// Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T;
  total?: number;
}

export interface PermissionManagerData {
  roles: Role[];
  modules: Module[];
  rights: Right[];
  role_module_rights: RoleModuleRight[];
}

export interface RolePermissionsResponse {
  role_id: number;
  role_name: string;
  role_description: string;
  modules: Module[];
  rights: Right[];
  permission_matrix: Array<{
    module_id: number;
    module_name: string;
    module_slug: string;
    permissions: {
      [rightName: string]: boolean;
    };
  }>;
  total_permissions: number;
}

export interface RolePermissionSummary {
  role_id: number;
  role_name: string;
  total_modules: number;
  total_rights: number;
  permissions_granted: number;
  max_possible_permissions: number;
  permission_percentage: number;
  modules_with_permissions: Array<{
    module_name: string;
    module_slug: string;
    permission_count: number;
  }>;
}
