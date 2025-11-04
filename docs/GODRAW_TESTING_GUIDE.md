# GoDraw Testing Guide

This guide will help you test GoDraw locally end-to-end.

## Prerequisites

- Local Supabase instance running
- API server running
- Dashboard dev server running

## Setup Steps

### 1. Start Local Supabase

```bash
cd /home/matsilva/code/silvabyte/godeploy-api
supabase start
```

This will start all Supabase services locally:
- PostgreSQL on port `55431`
- API on port `55321`
- Studio on port `55433`

### 2. Apply Migrations

```bash
bun db:up
```

This applies all migrations including the new GoDraw tables:
- `godraw_projects`
- `godraw_pages`
- Updates to `projects` table (adds `project_type` column)

### 3. Verify Database Schema

Open Supabase Studio at http://localhost:55433 and check:
- Table `godraw_projects` exists
- Table `godraw_pages` exists
- Table `projects` has `project_type` column

### 4. Start API Server

```bash
# From repo root
bun dev
# or
make api.dev
```

API will start on `http://localhost:38444`

### 5. Start Dashboard

```bash
cd apps/dashboard
bun dev
```

Dashboard will start on `http://localhost:3000`

---

## Testing the API

### Test 1: Create a GoDraw Project

```bash
# First, login to get an auth token
# (Use your existing auth flow or create a test user)

# Create a GoDraw project
curl -X POST http://localhost:38444/api/projects/godraw \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My First GoDraw Site",
    "description": "A visual site builder test",
    "theme": "light"
  }'
```

**Expected Response:**
```json
{
  "project": {
    "id": "uuid",
    "name": "My First GoDraw Site",
    "subdomain": "my-first-godraw-site",
    "project_type": "godraw"
  },
  "godraw_project": {
    "id": "uuid",
    "project_id": "uuid",
    "tenant_id": "uuid",
    "theme": "light",
    "home_page_id": "uuid",
    "created_at": "timestamp",
    "updated_at": "timestamp"
  },
  "default_page": {
    "id": "uuid",
    "godraw_project_id": "uuid",
    "tenant_id": "uuid",
    "name": "Home",
    "slug": "home",
    "elements": [],
    "app_state": {},
    "files": {},
    "order_index": 0,
    "is_published": true,
    "created_at": "timestamp",
    "updated_at": "timestamp"
  }
}
```

### Test 2: Get GoDraw Project

```bash
curl http://localhost:38444/api/projects/PROJECT_ID/godraw \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Expected Response:**
```json
{
  "godraw_project": { /* ... */ },
  "pages": [
    {
      "id": "uuid",
      "name": "Home",
      "slug": "home",
      /* ... */
    }
  ]
}
```

### Test 3: Create a New Page

```bash
curl -X POST http://localhost:38444/api/projects/PROJECT_ID/godraw/pages \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "About",
    "slug": "about"
  }'
```

### Test 4: Update a Page (Save Canvas Data)

```bash
curl -X PATCH http://localhost:38444/api/projects/PROJECT_ID/godraw/pages/PAGE_ID \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "elements": [
      {
        "type": "rectangle",
        "id": "rect-1",
        "x": 100,
        "y": 100,
        "width": 200,
        "height": 150
      }
    ]
  }'
```

### Test 5: List All Pages

```bash
curl http://localhost:38444/api/projects/PROJECT_ID/godraw/pages \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Test 6: Delete a Page

```bash
curl -X DELETE http://localhost:38444/api/projects/PROJECT_ID/godraw/pages/PAGE_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Testing the Frontend

### 1. Access the Dashboard

Navigate to `http://localhost:3000` and log in.

### 2. Create a GoDraw Project

1. Click "Create New Project" button
2. Select "GoDraw Site Builder" template (when implemented)
3. Name your project
4. Click "Create"

### 3. Open the Editor

Navigate to `/projects/:projectId/godraw/editor`

You should see:
- Excalidraw canvas
- Top toolbar with Preview and Publish buttons
- Clean interface ready for drawing

### 4. Draw Something

- Use Excalidraw tools to draw shapes, text, arrows
- Changes auto-save (when implemented)
- Check browser console for save events

### 5. Create Additional Pages

(This UI needs to be implemented - see GODRAW_PLAN.md)

---

## Database Verification

### Check Data in Supabase Studio

1. Open http://localhost:55433
2. Navigate to Table Editor
3. Check `godraw_projects` table - should have your project
4. Check `godraw_pages` table - should have your pages
5. Check `projects` table - verify `project_type` = 'godraw'

### Verify Relationships

Run SQL queries in Studio SQL Editor:

```sql
-- Get all godraw projects with their pages
SELECT
  gp.id as project_id,
  gp.theme,
  p.name as project_name,
  p.subdomain,
  array_agg(
    json_build_object(
      'id', page.id,
      'name', page.name,
      'slug', page.slug,
      'order_index', page.order_index
    ) ORDER BY page.order_index
  ) as pages
FROM godraw_projects gp
JOIN projects p ON p.id = gp.project_id
JOIN godraw_pages page ON page.godraw_project_id = gp.id
GROUP BY gp.id, p.name, p.subdomain;
```

---

## Common Issues & Solutions

### Migration Fails

**Problem:** `bun db:up` fails with foreign key error

**Solution:**
```bash
# Reset local database
bun db:reset

# Reapply migrations
bun db:up
```

### API 404 on GoDraw Routes

**Problem:** GET /api/projects/:id/godraw returns 404

**Solution:**
- Check that godraw routes are registered in `apps/api/src/app/build/register.ts`
- Restart API server
- Verify project exists and is type 'godraw'

### TypeScript Errors

**Problem:** Type errors when running `make api.typecheck`

**Solution:**
```bash
# Clean and rebuild
bun install
make api.typecheck
```

### Excalidraw Not Loading

**Problem:** Editor page shows blank canvas

**Solution:**
- Check browser console for errors
- Verify `@excalidraw/excalidraw` is installed in dashboard
- Check that CSS is imported: `import "@excalidraw/excalidraw/index.css"`

---

## Next Steps for Testing

### Phase 1 (Current Implementation)
- ✅ Create GoDraw project via API
- ✅ Fetch project and pages
- ✅ Create/update/delete pages
- ✅ Basic Excalidraw editor loads

### Phase 2 (To Implement)
- [ ] Auto-save functionality with debouncing
- [ ] Page switcher in editor UI
- [ ] Create new page from editor
- [ ] Delete page from editor
- [ ] Reorder pages

### Phase 3 (Build & Deploy)
- [ ] Generate static HTML from Excalidraw data
- [ ] Upload to DO Spaces
- [ ] Live preview
- [ ] Publish workflow

---

## API Endpoint Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/projects/godraw` | Create new GoDraw project |
| GET | `/api/projects/:id/godraw` | Get project with all pages |
| PATCH | `/api/projects/:id/godraw` | Update project settings |
| POST | `/api/projects/:id/godraw/pages` | Create new page |
| GET | `/api/projects/:id/godraw/pages` | List all pages |
| GET | `/api/projects/:id/godraw/pages/:pageId` | Get single page |
| PATCH | `/api/projects/:id/godraw/pages/:pageId` | Update page |
| DELETE | `/api/projects/:id/godraw/pages/:pageId` | Delete page |
| PATCH | `/api/projects/:id/godraw/pages/reorder` | Reorder pages |

---

## Environment Variables

Make sure your `.env` has:

```env
# Supabase (local)
SUPABASE_URL=http://127.0.0.1:55321
SUPABASE_API_KEY=your-anon-key-from-supabase-start

# DigitalOcean (for future deployment)
DIGITAL_OCEAN_TOKEN=your-token
DIGITAL_OCEAN_SPACES_ENDPOINT=your-endpoint
DIGITAL_OCEAN_SPACES_BUCKET=your-bucket
DIGITAL_OCEAN_SPACES_KEY=your-key
DIGITAL_OCEAN_SPACES_SECRET=your-secret
```

---

## Useful Commands

```bash
# Start everything
supabase start && bun dev &
cd apps/dashboard && bun dev

# Reset database
bun db:reset

# Create new migration
bun db:new migration_name

# Type check
make api.typecheck
make dashboard.typecheck

# Lint & format
make all.check.fix

# Run tests
make api.test
```

---

## Success Criteria

✅ **Phase 1 Complete When:**
1. Can create GoDraw project via API
2. Can view project in database
3. Can create/edit/delete pages
4. Editor loads with Excalidraw canvas
5. Canvas changes log to console
6. All TypeScript types pass

🎉 **You're ready to build Phase 2!**
