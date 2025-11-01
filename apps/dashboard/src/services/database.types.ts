export type Database = {
	public: {
		Tables: {
			deploys: {
				Row: {
					created_at: string | null;
					id: string;
					project_id: string;
					status: string;
					tenant_id: string;
					updated_at: string | null;
					url: string;
					user_id: string;
				};
				Insert: {
					created_at?: string | null;
					id?: string;
					project_id: string;
					status?: string;
					tenant_id: string;
					updated_at?: string | null;
					url: string;
					user_id: string;
				};
				Update: {
					created_at?: string | null;
					id?: string;
					project_id?: string;
					status?: string;
					tenant_id?: string;
					updated_at?: string | null;
					url?: string;
					user_id?: string;
				};
				Relationships: [
					{
						foreignKeyName: "deploys_project_id_fkey";
						columns: ["project_id"];
						isOneToOne: false;
						referencedRelation: "projects";
						referencedColumns: ["id"];
					},
					{
						foreignKeyName: "deploys_tenant_id_fkey";
						columns: ["tenant_id"];
						isOneToOne: false;
						referencedRelation: "tenants";
						referencedColumns: ["id"];
					},
					{
						foreignKeyName: "deploys_user_id_fkey";
						columns: ["user_id"];
						isOneToOne: false;
						referencedRelation: "users";
						referencedColumns: ["id"];
					},
				];
			};
			projects: {
				Row: {
					created_at: string | null;
					description: string | null;
					domain: string | null;
					id: string;
					name: string;
					owner_id: string;
					subdomain: string;
					tenant_id: string;
					updated_at: string | null;
				};
				Insert: {
					created_at?: string | null;
					description?: string | null;
					domain?: string | null;
					id?: string;
					name: string;
					owner_id: string;
					subdomain: string;
					tenant_id: string;
					updated_at?: string | null;
				};
				Update: {
					created_at?: string | null;
					description?: string | null;
					domain?: string | null;
					id?: string;
					name?: string;
					owner_id?: string;
					subdomain?: string;
					tenant_id?: string;
					updated_at?: string | null;
				};
				Relationships: [
					{
						foreignKeyName: "projects_owner_id_fkey";
						columns: ["owner_id"];
						isOneToOne: false;
						referencedRelation: "users";
						referencedColumns: ["id"];
					},
					{
						foreignKeyName: "projects_tenant_id_fkey";
						columns: ["tenant_id"];
						isOneToOne: false;
						referencedRelation: "tenants";
						referencedColumns: ["id"];
					},
				];
			};
			subscriptions: {
				Row: {
					created_at: string | null;
					currency: string;
					current_period_end: string | null;
					current_period_start: string | null;
					id: string;
					interval: string;
					plan_name: string;
					price_cents: number;
					status: string;
					stripe_subscription_id: string | null;
					tenant_id: string;
					trial_ends_at: string | null;
					updated_at: string | null;
				};
				Insert: {
					created_at?: string | null;
					currency?: string;
					current_period_end?: string | null;
					current_period_start?: string | null;
					id?: string;
					interval?: string;
					plan_name: string;
					price_cents: number;
					status?: string;
					stripe_subscription_id?: string | null;
					tenant_id: string;
					trial_ends_at?: string | null;
					updated_at?: string | null;
				};
				Update: {
					created_at?: string | null;
					currency?: string;
					current_period_end?: string | null;
					current_period_start?: string | null;
					id?: string;
					interval?: string;
					plan_name?: string;
					price_cents?: number;
					status?: string;
					stripe_subscription_id?: string | null;
					tenant_id?: string;
					trial_ends_at?: string | null;
					updated_at?: string | null;
				};
				Relationships: [
					{
						foreignKeyName: "subscriptions_tenant_id_fkey";
						columns: ["tenant_id"];
						isOneToOne: false;
						referencedRelation: "tenants";
						referencedColumns: ["id"];
					},
				];
			};
			tenant_users: {
				Row: {
					created_at: string | null;
					id: string;
					role: string;
					tenant_id: string;
					updated_at: string | null;
					user_id: string;
				};
				Insert: {
					created_at?: string | null;
					id?: string;
					role?: string;
					tenant_id: string;
					updated_at?: string | null;
					user_id: string;
				};
				Update: {
					created_at?: string | null;
					id?: string;
					role?: string;
					tenant_id?: string;
					updated_at?: string | null;
					user_id?: string;
				};
				Relationships: [
					{
						foreignKeyName: "tenant_users_tenant_id_fkey";
						columns: ["tenant_id"];
						isOneToOne: false;
						referencedRelation: "tenants";
						referencedColumns: ["id"];
					},
					{
						foreignKeyName: "tenant_users_user_id_fkey";
						columns: ["user_id"];
						isOneToOne: false;
						referencedRelation: "users";
						referencedColumns: ["id"];
					},
				];
			};
			tenants: {
				Row: {
					created_at: string | null;
					id: string;
					name: string;
				};
				Insert: {
					created_at?: string | null;
					id?: string;
					name: string;
				};
				Update: {
					created_at?: string | null;
					id?: string;
					name?: string;
				};
				Relationships: [];
			};
			users: {
				Row: {
					created_at: string | null;
					email: string;
					id: string;
					tenant_id: string;
				};
				Insert: {
					created_at?: string | null;
					email: string;
					id: string;
					tenant_id: string;
				};
				Update: {
					created_at?: string | null;
					email?: string;
					id?: string;
					tenant_id?: string;
				};
				Relationships: [];
			};
		};
		Views: {
			[_ in never]: never;
		};
		Functions: {
			get_user_tenants: {
				Args: { user_id: string };
				Returns: string[];
			};
		};
		Enums: {
			[_ in never]: never;
		};
		CompositeTypes: {
			[_ in never]: never;
		};
	};
};

type DefaultSchema = Database[Extract<keyof Database, "public">];

export type Tables<
	DefaultSchemaTableNameOrOptions extends
		| keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
		| { schema: keyof Database },
	TableName extends DefaultSchemaTableNameOrOptions extends {
		schema: keyof Database;
	}
		? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
				Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
		: never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
	? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
			Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
			Row: infer R;
		}
		? R
		: never
	: DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
				DefaultSchema["Views"])
		? (DefaultSchema["Tables"] &
				DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
				Row: infer R;
			}
			? R
			: never
		: never;

// Removed unused helper generics to satisfy TS noUnusedLocals
