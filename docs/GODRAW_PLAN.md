# GoDraw Implementation Plan

## Architecture Overview

GoDraw extends godeploy by introducing a new project type (`godraw`) that stores Excalidraw canvas data for multiple pages, then generates and deploys static HTML/CSS/JS at build time.

---

## 1. Database Schema Extensions

### New Table: `godraw_projects`

Extends project metadata for godraw-specific features:

```sql
CREATE TABLE public.godraw_projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,

  -- Godraw-specific settings
  theme TEXT NOT NULL DEFAULT 'light', -- light | dark
  home_page_id UUID, -- references godraw_pages(id)

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(project_id)
);

CREATE INDEX idx_godraw_projects_tenant_id ON public.godraw_projects(tenant_id);
CREATE INDEX idx_godraw_projects_project_id ON public.godraw_projects(project_id);
```

### New Table: `godraw_pages`

Stores individual pages with Excalidraw canvas data:

```sql
CREATE TABLE public.godraw_pages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  godraw_project_id UUID NOT NULL REFERENCES public.godraw_projects(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,

  -- Page metadata
  name TEXT NOT NULL, -- e.g., "Home", "About", "Contact"
  slug TEXT NOT NULL, -- URL slug: "home", "about", "contact"

  -- Excalidraw scene data (stored as JSONB for querying)
  elements JSONB NOT NULL DEFAULT '[]', -- ExcalidrawElement[]
  app_state JSONB NOT NULL DEFAULT '{}', -- AppState
  files JSONB NOT NULL DEFAULT '{}', -- BinaryFiles (images, etc.)

  -- Metadata
  order_index INTEGER NOT NULL DEFAULT 0, -- for page ordering in navigation
  is_published BOOLEAN NOT NULL DEFAULT true,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(godraw_project_id, slug)
);

CREATE INDEX idx_godraw_pages_tenant_id ON public.godraw_pages(tenant_id);
CREATE INDEX idx_godraw_pages_godraw_project_id ON public.godraw_pages(godraw_project_id);
CREATE INDEX idx_godraw_pages_slug ON public.godraw_pages(slug);
```

### Modify `projects` table

Add a `project_type` column to distinguish between regular SPAs and godraw projects:

```sql
-- Migration to add project_type
ALTER TABLE public.projects
ADD COLUMN project_type TEXT NOT NULL DEFAULT 'spa'
CHECK (project_type IN ('spa', 'godraw'));

CREATE INDEX idx_projects_type ON public.projects(project_type);
```

---

## 2. API Endpoints

### GoDraw Project Management

#### `POST /api/projects/godraw`

Create new godraw project

```typescript
// Body: { name, description? }
// Returns: { project, godrawProject, defaultPage }
// Creates:
//   1. Regular project entry (type='godraw')
//   2. godraw_projects entry
//   3. Default "home" page in godraw_pages
```

#### `GET /api/projects/:projectId/godraw`

Get godraw project details

```typescript
// Returns: { godrawProject, pages[] }
```

#### `PATCH /api/projects/:projectId/godraw`

Update godraw settings

```typescript
// Body: { theme?, homePageId? }
```

### Page Management

#### `POST /api/projects/:projectId/godraw/pages`

Create new page

```typescript
// Body: { name, slug?, elements?, appState?, files? }
// Returns: { page }
```

#### `GET /api/projects/:projectId/godraw/pages`

List all pages

```typescript
// Query: { includeUnpublished? }
// Returns: { pages[] }
```

#### `GET /api/projects/:projectId/godraw/pages/:pageId`

Get single page

```typescript
// Returns: { page } with full canvas data
```

#### `PATCH /api/projects/:projectId/godraw/pages/:pageId`

Update page

```typescript
// Body: { name?, slug?, elements?, appState?, files?, isPublished?, orderIndex? }
// Auto-saves canvas state via onChange callback
```

#### `DELETE /api/projects/:projectId/godraw/pages/:pageId`

Delete page

```typescript
// Prevents deleting home page
```

#### `PATCH /api/projects/:projectId/godraw/pages/reorder`

Reorder pages

```typescript
// Body: { pageIds: string[] } - array of page IDs in desired order
```

### Build & Deploy

#### `POST /api/projects/:projectId/godraw/build`

Generate static site

```typescript
// Triggers:
//   1. Fetch all published pages
//   2. Generate HTML for each page using export utilities
//   3. Create zip archive with static assets
//   4. Upload to DO Spaces
//   5. Record deployment
```

---

## 3. Static Site Generation

### Build Process Flow

```typescript
// Pseudo-code for build process
async function buildGodrawSite(projectId: string) {
  // 1. Fetch project and pages
  const godrawProject = await getGodrawProject(projectId);
  const pages = await getPublishedPages(projectId);

  // 2. Create temporary build directory
  const buildDir = await createTempBuildDir();

  // 3. Generate HTML for each page
  for (const page of pages) {
    // Export Excalidraw canvas to SVG
    const svg = await exportToSvg({
      elements: page.elements,
      appState: page.appState,
      files: page.files,
      exportPadding: 20
    });

    // Generate HTML wrapper
    const html = generatePageHTML({
      title: page.name,
      svg: svg,
      navigation: buildNavigation(pages, page.slug),
      theme: godrawProject.theme,
      isHomePage: page.id === godrawProject.home_page_id
    });

    // Write to file
    const filename = page.slug === 'home' ? 'index.html' : `${page.slug}.html`;
    await writeFile(join(buildDir, filename), html);
  }

  // 4. Copy static assets (CSS, JS for navigation/interactions)
  await copyStaticAssets(buildDir);

  // 5. Process embedded images from 'files'
  await extractAndWriteImages(pages, buildDir);

  // 6. Create zip archive
  const archivePath = await createZipArchive(buildDir);

  // 7. Upload to storage (reuse existing StorageService)
  return archivePath;
}
```

### HTML Template Structure

```html
<!DOCTYPE html>
<html lang="en" data-theme="${theme}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${pageTitle} | ${projectName}</title>
  <link rel="stylesheet" href="/assets/godraw.css">
</head>
<body>
  <!-- Navigation -->
  <nav class="godraw-nav">
    <ul>
      ${pages.map(p => `
        <li><a href="/${p.slug === 'home' ? '' : p.slug}.html">${p.name}</a></li>
      `)}
    </ul>
  </nav>

  <!-- Canvas Content (SVG export) -->
  <main class="godraw-canvas">
    ${svgContent}
  </main>

  <!-- Interactive elements handling -->
  <script src="/assets/godraw.js"></script>
</body>
</html>
```

### Interactive Elements

Use Excalidraw's `customData` on elements to enable:

- **Links**: Elements with `customData.link = '/about'` become clickable
- **Buttons**: Elements with `customData.action = 'navigate'`
- **Embeds**: Support for iframe embeds (already in Excalidraw)

```typescript
// In godraw.js runtime
document.querySelectorAll('[data-godraw-link]').forEach(el => {
  el.addEventListener('click', (e) => {
    e.preventDefault();
    window.location.href = el.dataset.godrawLink;
  });
});
```

---

## 4. Frontend Editor UI

### Project Creation Flow

1. **Projects Page** (`/projects`) - Add "New GoDraw Project" button
2. **Template Selection Modal** - When creating project, show:
   - Regular SPA (existing)
   - **GoDraw Site Builder** (new)
3. **Create GoDraw Project** - Calls `POST /api/projects/godraw`
4. **Redirect to Editor** - Navigate to `/projects/:id/godraw/editor`

### GoDraw Editor Route Structure

```
/projects/:projectId/godraw
  /editor                 # Live Excalidraw editor
  /pages                  # Page management UI
  /settings               # GoDraw-specific settings
  /preview                # Preview mode (read-only Excalidraw)
```

### Editor Component

`apps/dashboard/src/pages/godraw/GodrawEditor.tsx`

```tsx
import { Excalidraw } from "@excalidraw/excalidraw";
import { exportToSvg } from "@excalidraw/excalidraw";
import { useState, useCallback } from "react";

export function GodrawEditor() {
  const [excalidrawAPI, setExcalidrawAPI] = useState(null);
  const [currentPage, setCurrentPage] = useState(null);
  const [pages, setPages] = useState([]);
  const [isSaving, setIsSaving] = useState(false);

  // Auto-save on change (debounced)
  const handleChange = useCallback(
    debounce((elements, appState, files) => {
      if (!currentPage) return;

      setIsSaving(true);
      api.patch(`/projects/${projectId}/godraw/pages/${currentPage.id}`, {
        elements,
        appState,
        files
      }).finally(() => setIsSaving(false));
    }, 2000),
    [currentPage]
  );

  return (
    <div className="godraw-editor">
      {/* Top Bar */}
      <div className="editor-toolbar">
        {/* Page selector dropdown */}
        <PageSelector
          pages={pages}
          currentPage={currentPage}
          onPageChange={switchPage}
          onNewPage={createNewPage}
        />

        {/* Actions */}
        <button onClick={handlePreview}>Preview</button>
        <button onClick={handlePublish}>Publish Site</button>

        {/* Save indicator */}
        {isSaving && <span>Saving...</span>}
      </div>

      {/* Excalidraw Canvas */}
      <div className="editor-canvas">
        <Excalidraw
          excalidrawAPI={(api) => setExcalidrawAPI(api)}
          initialData={{
            elements: currentPage?.elements || [],
            appState: currentPage?.appState || {},
            files: currentPage?.files || {}
          }}
          onChange={handleChange}
          theme={theme}
          UIOptions={{
            canvasActions: {
              loadScene: false, // Disable file loading
              export: false,    // Custom export via our UI
              saveAsImage: true
            }
          }}
        >
          {/* Custom sidebar for page links */}
          <Sidebar>
            <PageLinksPanel pages={pages} />
          </Sidebar>
        </Excalidraw>
      </div>
    </div>
  );
}
```

### Page Management UI

**Side Panel Component** for managing pages:

- List all pages with drag-to-reorder
- Add new page button
- Delete page (with confirmation)
- Set home page
- Toggle publish status

**Link Creation Tool**:

- Custom button in Excalidraw toolbar
- Select element → Choose target page → Saves `customData.link`
- Visual indicator on elements with links (overlay icon)

---

## 5. Component Structure

```
apps/dashboard/src/pages/godraw/
  ├── GodrawProjectsPage.tsx       # List of godraw projects
  ├── GodrawEditor.tsx             # Main editor component
  ├── GodrawEditorLayout.tsx       # Layout wrapper
  ├── components/
  │   ├── PageSelector.tsx         # Dropdown for switching pages
  │   ├── PageLinksPanel.tsx       # Sidebar for adding page links
  │   ├── PageManager.tsx          # Modal for managing all pages
  │   ├── PublishDialog.tsx        # Confirm publish with preview
  │   └── GodrawPreview.tsx        # Read-only preview mode
  └── hooks/
      ├── useGodrawProject.ts      # Fetch godraw project data
      ├── useGodrawPages.ts        # Fetch and manage pages
      └── useAutoSave.ts           # Debounced auto-save hook

apps/api/src/app/
  ├── components/
  │   └── godraw/
  │       ├── GodrawProjectService.ts
  │       ├── GodrawPageService.ts
  │       ├── GodrawBuilder.ts     # Static site generation
  │       └── godraw.types.ts
  └── routes/
      └── godraw.ts                # All godraw endpoints
```

---

## 6. Build & Deployment Integration

### Reuse Existing Deploy Flow

GoDraw builds create a standard zip archive, so they plug into the existing deployment pipeline:

1. **Build Trigger** - User clicks "Publish" in editor
2. **API Call** - `POST /api/projects/:id/godraw/build`
3. **Generate Archive** - GodrawBuilder creates static site zip
4. **Upload** - Use existing `StorageService` to upload to DO Spaces
5. **Record Deploy** - Create entry in `deploys` table
6. **Serve** - Static files served from CDN at `projectname.godeploy.app`

### Build Service

`apps/api/src/app/components/godraw/GodrawBuilder.ts`

```typescript
export class GodrawBuilder {
  async build(projectId: string): Promise<Result<string>> {
    // 1. Validate project type
    // 2. Fetch godraw project + pages
    // 3. Generate HTML for each page
    // 4. Create static assets
    // 5. Bundle as zip
    // 6. Return archive path for upload
  }

  private async generatePageHTML(page: GodrawPage, allPages: GodrawPage[], theme: string) {
    // Export to SVG using @excalidraw/excalidraw server-side
    // Wrap in HTML template
    // Add navigation links
    // Process custom link elements
  }

  private async extractImages(files: BinaryFiles, buildDir: string) {
    // Extract base64 images from Excalidraw files
    // Write to /assets/images/
  }
}
```

---

## 7. Migration Path & Rollout Plan

### Phase 1: Core Infrastructure (MVP)

- [ ] Database migrations (project_type, godraw tables)
- [ ] API endpoints for project/page CRUD
- [ ] Basic editor UI with single page support
- [ ] Simple HTML generation (SVG export only)

### Phase 2: Multi-Page Support

- [ ] Page management UI
- [ ] Navigation generation
- [ ] Page link creation tool
- [ ] Reordering pages

### Phase 3: Build & Deploy

- [ ] GodrawBuilder service
- [ ] Integration with existing deploy flow
- [ ] Preview mode
- [ ] Publish workflow

### Phase 4: Enhanced Features

- [ ] Interactive elements (buttons, forms)
- [ ] Custom themes/styling
- [ ] SEO metadata per page
- [ ] Analytics integration
- [ ] Templates library (pre-built pages)

---

## 8. Technical Considerations

### Server-Side Rendering of Excalidraw

- Use `@excalidraw/excalidraw` exports like `exportToSvg` in Node.js
- May require headless browser (Puppeteer) for complex scenes
- Consider using Excalidraw's utility functions directly

### Storage of Binary Files

- Excalidraw `files` (images) stored as base64 in JSONB initially
- During build, extract and optimize images
- Upload to DO Spaces under `/assets/images/`

### Performance

- JSONB indexing for fast page queries
- Debounced auto-save (2-3 seconds)
- Optimistic UI updates
- Build process should be async with webhook/polling for completion

### Security

- Validate page slugs to prevent XSS
- Sanitize Excalidraw elements before rendering
- Rate limit build requests
- File size limits on canvas data

---

## 9. User Experience Flow

### Creating a GoDraw Site

1. User clicks "New Project" → Selects "GoDraw Site Builder"
2. Enters project name → API creates project + default home page
3. Redirects to `/projects/:id/godraw/editor`
4. Sees Excalidraw canvas with toolbar and "Pages" panel
5. Draws homepage content
6. Clicks "Add Page" → Creates "About" page → Switches to it
7. Draws about page content
8. Adds link from home to about (via link tool)
9. Clicks "Preview" → Opens read-only preview with navigation
10. Clicks "Publish" → Triggers build → Shows progress → Site goes live

### Editing Existing Site

1. User navigates to project details
2. Sees "Edit in GoDraw" button
3. Loads editor with current pages
4. Makes changes → Auto-saves
5. Publishes when ready

---

## 10. Example Code Snippets

### Creating Link Between Pages

```typescript
// In editor UI
function createPageLink(elementId: string, targetPageSlug: string) {
  const elements = excalidrawAPI.getSceneElements();
  const element = elements.find(el => el.id === elementId);

  if (element) {
    excalidrawAPI.updateScene({
      elements: elements.map(el =>
        el.id === elementId
          ? { ...el, customData: { ...el.customData, link: `/${targetPageSlug}.html` }}
          : el
      )
    });
  }
}
```

### Rendering Linked Elements in HTML

```typescript
// In GodrawBuilder.generatePageHTML()
function processLinkedElements(svg: string, elements: ExcalidrawElement[]) {
  // Add data attributes to linked elements
  elements.forEach(el => {
    if (el.customData?.link) {
      // Inject onclick handler or data attribute
      svg = svg.replace(
        `id="${el.id}"`,
        `id="${el.id}" data-godraw-link="${el.customData.link}" style="cursor: pointer"`
      );
    }
  });
  return svg;
}
```

---

## Next Steps

This plan provides a complete blueprint for implementing GoDraw. The suggested implementation order:

1. **Database & API** (Week 1-2)
   - Migrations
   - Service classes
   - API routes
   - Tests

2. **Editor UI** (Week 2-3)
   - Basic editor component
   - Page management
   - Auto-save

3. **Build System** (Week 3-4)
   - GodrawBuilder
   - HTML generation
   - Asset processing

4. **Deploy Integration** (Week 4-5)
   - Hook into existing flow
   - Preview mode
   - Polish UX

---

## Questions to Consider

1. **Should we support real-time collaboration** like Excalidraw.com does?
2. **Template library**: Pre-built page layouts users can start from?
3. **Export formats**: Besides live deployment, export as standalone HTML zip?
4. **Mobile editing**: Should the editor work on mobile devices?
5. **Version history**: Track page versions and allow rollback?
6. **Custom CSS**: Allow users to add custom styles to generated pages?
7. **Analytics**: Built-in page view tracking for GoDraw sites?
8. **Forms**: Special handling for form elements with backend integration?
