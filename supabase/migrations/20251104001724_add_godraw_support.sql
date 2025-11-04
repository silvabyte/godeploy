-- ================================================
-- add_godraw_support.sql
-- ================================================
-- Add support for GoDraw (visual site builder using Excalidraw)

-- 1. Add project_type column to projects table
ALTER TABLE public.projects
ADD COLUMN project_type TEXT NOT NULL DEFAULT 'spa'
CHECK (project_type IN ('spa', 'godraw'));

CREATE INDEX idx_projects_type ON public.projects(project_type);

-- 2. Create godraw_projects table
-- Stores godraw-specific project settings
CREATE TABLE public.godraw_projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,

  -- Godraw-specific settings
  theme TEXT NOT NULL DEFAULT 'light' CHECK (theme IN ('light', 'dark')),
  home_page_id UUID, -- references godraw_pages(id), will be set after first page is created

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(project_id)
);

CREATE INDEX idx_godraw_projects_tenant_id ON public.godraw_projects(tenant_id);
CREATE INDEX idx_godraw_projects_project_id ON public.godraw_projects(project_id);

-- 3. Create godraw_pages table
-- Stores individual pages with Excalidraw canvas data
CREATE TABLE public.godraw_pages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  godraw_project_id UUID NOT NULL REFERENCES public.godraw_projects(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,

  -- Page metadata
  name TEXT NOT NULL,
  slug TEXT NOT NULL,

  -- Excalidraw scene data (stored as JSONB for querying and flexibility)
  elements JSONB NOT NULL DEFAULT '[]', -- ExcalidrawElement[]
  app_state JSONB NOT NULL DEFAULT '{}', -- AppState
  files JSONB NOT NULL DEFAULT '{}', -- BinaryFiles (images, etc.)

  -- Metadata
  order_index INTEGER NOT NULL DEFAULT 0,
  is_published BOOLEAN NOT NULL DEFAULT true,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(godraw_project_id, slug)
);

CREATE INDEX idx_godraw_pages_tenant_id ON public.godraw_pages(tenant_id);
CREATE INDEX idx_godraw_pages_godraw_project_id ON public.godraw_pages(godraw_project_id);
CREATE INDEX idx_godraw_pages_slug ON public.godraw_pages(slug);
CREATE INDEX idx_godraw_pages_order_index ON public.godraw_pages(godraw_project_id, order_index);

-- 4. Add foreign key constraint for home_page_id after godraw_pages table exists
-- Note: This creates a circular dependency, but it's safe because home_page_id is nullable
ALTER TABLE public.godraw_projects
ADD CONSTRAINT fk_godraw_projects_home_page
FOREIGN KEY (home_page_id) REFERENCES public.godraw_pages(id) ON DELETE SET NULL;

-- 5. Add triggers to update updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_godraw_projects_updated_at
BEFORE UPDATE ON public.godraw_projects
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_godraw_pages_updated_at
BEFORE UPDATE ON public.godraw_pages
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
