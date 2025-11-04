# GoDraw Phase 2 Testing Guide

This guide covers testing the new **multi-page management** features added in Phase 2.

## What's New in Phase 2

✅ **Auto-Save with Debouncing** - Changes are saved automatically after 2 seconds of inactivity
✅ **Page Selector Dropdown** - Quick switching between pages
✅ **Page Manager Modal** - Comprehensive page management UI
✅ **Drag-and-Drop Reordering** - Reorder pages visually
✅ **Create/Delete Pages** - Full CRUD operations
✅ **Publish Toggle** - Mark pages as published/unpublished
✅ **Save Status Indicator** - Visual feedback for save state

---

## Testing Flow

### 1. Create a GoDraw Project

```bash
curl -X POST http://localhost:38444/api/projects/godraw \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Multi-Page Test Site",
    "theme": "light"
  }'
```

**Expected**: Project created with a default "Home" page

### 2. Open the Editor

Navigate to: `http://localhost:3000/projects/:projectId/godraw/editor`

**You should see:**
- Page selector dropdown showing "Home"
- Page manager button (three bars icon)
- Save status area (initially empty)
- Excalidraw canvas
- Preview and Publish buttons

### 3. Test Auto-Save

1. Draw something on the canvas (rectangle, arrow, text)
2. **Watch the save indicator:**
   - Immediately shows "Unsaved changes" with yellow clock icon
   - After 2 seconds, shows "Saving..." with spinning blue clock
   - After save completes, shows "Saved just now" with green checkmark
3. Wait 10-30 seconds and verify it updates to "Saved 10s ago", "Saved 1m ago", etc.

**Verify in Database:**
```sql
SELECT id, name, slug, elements, updated_at
FROM godraw_pages
WHERE godraw_project_id = 'YOUR_PROJECT_ID';
```

The `elements` JSONB should contain your drawings!

### 4. Create a New Page

**Method 1: Via Page Selector**
1. Click the page selector dropdown
2. Click "+ Add new page" at the bottom
3. Enter name: "About Us"
4. Slug auto-generates to "about-us"
5. Click "Create Page"

**Expected:**
- Dialog closes
- Page selector now shows "About Us"
- Canvas is blank (new page)
- Save indicator shows you're on a new page

**Method 2: Via API**
```bash
curl -X POST http://localhost:38444/api/projects/:projectId/godraw/pages \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Contact",
    "slug": "contact"
  }'
```

### 5. Switch Between Pages

1. Click the page selector dropdown
2. See all your pages listed (Home, About Us, Contact)
3. Click "Contact"

**Expected:**
- Canvas switches to Contact page content
- URL stays at `/projects/:id/godraw/editor` (no navigation)
- Save indicator resets
- Any unsaved changes on previous page are auto-saved before switching

**Test:** Draw something, switch pages, switch back - your drawings should persist!

### 6. Test Page Manager

Click the three bars icon (page manager button)

**You should see a modal with:**
- List of all pages
- Drag handles on the left
- Page name and slug for each
- Home icon next to the home page
- Eye icon (publish toggle)
- Home icon button (set as home)
- Trash icon (delete button)

### 7. Reorder Pages

1. Open page manager
2. Drag "Contact" page above "About Us"
3. Close modal
4. Open page selector dropdown

**Expected:** Pages are in new order (Home, Contact, About Us)

**Verify in API:**
```bash
curl http://localhost:38444/api/projects/:projectId/godraw/pages \
  -H "Authorization: Bearer YOUR_TOKEN"
```

Check `order_index` values - should be 0, 1, 2 in the new order

### 8. Toggle Publish Status

1. Open page manager
2. Click the eye icon next to "About Us"

**Expected:**
- Icon changes to eye-slash (unpublished)
- Badge appears showing "Draft"

**Verify:**
```bash
curl http://localhost:38444/api/projects/:projectId/godraw/pages?includeUnpublished=false \
  -H "Authorization: Bearer YOUR_TOKEN"
```

"About Us" should NOT appear in results (only published pages)

### 9. Set Home Page

1. Open page manager
2. Click the home icon button next to "Contact"

**Expected:**
- Home icon moves to "Contact" row
- "Home" page no longer shows home icon
- **Note:** This feature currently logs to console - full implementation pending

### 10. Delete a Page

1. Open page manager
2. Try to delete "Home" page

**Expected:** Delete button is NOT visible (home page can't be deleted)

3. Click delete (trash icon) on "About Us"

**Expected:**
- Shows "Confirm" and "Cancel" buttons inline
- Click "Confirm"
- Page is removed from list

**Verify:**
```bash
curl http://localhost:38444/api/projects/:projectId/godraw/pages \
  -H "Authorization: Bearer YOUR_TOKEN"
```

"About Us" should not be in the list

### 11. Test Edge Cases

#### Switching Pages with Unsaved Changes
1. Draw on Home page
2. Immediately click page selector and switch to Contact

**Expected:**
- Changes are auto-saved before switch
- No data loss

#### Slug Validation
1. Try to create page with slug "home" (already exists)

**Expected:** Error message: "A page with this slug already exists"

2. Try invalid slug: "My Page!" (with special characters)

**Expected:** Slug auto-converts to "my-page"

3. Try to manually type invalid slug: "MY_PAGE"

**Expected:** Error: "Slug must be lowercase alphanumeric with hyphens"

#### Save Status Accuracy
1. Draw something
2. Watch "Saving..." indicator
3. While saving, draw more

**Expected:**
- After save completes, should show "Unsaved changes" again
- New 2-second timer starts

---

## UI Components Reference

### Page Selector Dropdown
**Location:** Top left of editor toolbar
**Shows:** Current page name with chevron
**Features:**
- Lists all pages with names and slugs
- Shows "Draft" badge for unpublished pages
- "+ Add new page" button at bottom
- Hover states on all items

### Page Manager Modal
**Trigger:** Three bars icon in toolbar
**Features:**
- Drag handles for reordering
- Inline icons for actions:
  - Eye = Toggle publish status
  - Home = Set as home page (disabled for current home)
  - Trash = Delete (disabled for home page)
- Confirm/cancel inline for delete
- Footer with help text

### New Page Dialog
**Trigger:** Click "+ Add new page" in page selector
**Fields:**
- Page Name (auto-generates slug)
- URL Slug (editable, validates on submit)
- Error display area
- Cancel / Create buttons

### Save Status Indicator
**Location:** Left side of toolbar, after page manager
**States:**
1. **Saving** - Blue spinning clock + "Saving..."
2. **Unsaved** - Yellow clock + "Unsaved changes"
3. **Saved** - Green checkmark + "Saved Xs ago"
4. **Nothing** - No indicator (no changes yet)

---

## Common Issues

### Page Doesn't Switch
**Problem:** Clicking a page in the dropdown doesn't change the canvas

**Debug:**
1. Open browser DevTools → Network tab
2. Switch pages
3. Look for API call to `/pages/:pageId`
4. Check response has elements data

**Solution:** Ensure `excalidrawAPI.updateScene()` is being called

### Auto-Save Not Working
**Problem:** Changes don't save after 2 seconds

**Debug:**
1. Open browser console
2. Look for errors from `useAutoSave` hook
3. Check Network tab for PATCH requests to `/pages/:pageId`

**Solution:**
- Verify authentication token is valid
- Check page ID exists
- Ensure `onChange` callback is firing

### Drag-and-Drop Doesn't Reorder
**Problem:** Dragging pages doesn't change their order

**Debug:**
1. Check browser console for errors
2. Verify PATCH request to `/pages/reorder` endpoint
3. Check request body has `page_ids` array

**Solution:** Ensure `onDragOver` and `onDragEnd` handlers are working

---

## Phase 2 Success Criteria

✅ **All features work:**
- [x] Auto-save with 2s debounce
- [x] Page selector shows all pages
- [x] Can create new pages
- [x] Can switch between pages
- [x] Canvas updates when switching
- [x] Can delete pages (except home)
- [x] Can reorder via drag-and-drop
- [x] Can toggle publish status
- [x] Save indicator shows correct state

✅ **No data loss:**
- [x] Switching pages saves current changes
- [x] All drawings persist in database
- [x] Page order persists across refreshes

✅ **Good UX:**
- [x] Visual feedback for all actions
- [x] Clear error messages
- [x] Smooth transitions
- [x] Responsive UI

---

## Next Steps: Phase 3

Phase 3 will add **build & deployment**:
- Generate static HTML from Excalidraw data
- Export pages to SVG
- Create navigation between pages
- Upload to DO Spaces
- Live preview before publishing
- Actual deploy to godeploy.app subdomain

Stay tuned! 🚀
