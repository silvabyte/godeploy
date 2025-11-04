import * as fs from "node:fs/promises";
import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { GodrawBuilder } from "../components/godraw/GodrawBuilder";
import { GodrawPageService } from "../components/godraw/GodrawPageService";
import { GodrawProjectService } from "../components/godraw/GodrawProjectService";
import {
	type CreateGodrawPage,
	type CreateGodrawProject,
	type ReorderPages,
	routeSchemas,
	type UpdateGodrawPage,
	type UpdateGodrawProject,
} from "../components/godraw/godraw.types";
import { validateAndTransformProjectName } from "../components/projects/project-utils";
import { StorageService } from "../components/storage/StorageService";
import { ProjectDomain } from "../utils/url";

export default async function (fastify: FastifyInstance) {
	// Initialize services
	const godrawProjectService = new GodrawProjectService();
	const godrawPageService = new GodrawPageService();
	const godrawBuilder = new GodrawBuilder();
	const storageService = new StorageService();

	// ================================================
	// GoDraw Project Routes
	// ================================================

	/**
	 * POST /api/projects/godraw
	 * Create a new GoDraw project
	 */
	fastify.post(
		"/projects/godraw",
		{ ...routeSchemas.createGodrawProject, config: { auth: true } },
		async (
			request: FastifyRequest<{
				Body: CreateGodrawProject;
			}>,
			reply: FastifyReply,
		) => {
			const { user_id, tenant_id } = request.user;
			const { name, description, theme = "light" } = request.body;

			// Validate and transform project name
			const nameResult = validateAndTransformProjectName(name);
			if (nameResult.error || !nameResult.data) {
				return reply.code(400).send({ error: nameResult.error });
			}

			const { name: validatedName, subdomain } = nameResult.data;

			// Check if subdomain is already taken
			const existingProject =
				await request.db.projects.getProjectBySubdomain(subdomain);
			if (existingProject.data) {
				return reply
					.code(400)
					.send({ error: "A project with this name already exists" });
			}

			// Create regular project entry with godraw type
			const projectResult = await request.db.projects.createProject({
				tenant_id,
				owner_id: user_id,
				name: validatedName,
				subdomain,
				description: description ?? null,
				domain: null,
				project_type: "godraw",
			});

			if (projectResult.error || !projectResult.data) {
				return reply.code(500).send({
					error: "Failed to create project",
					message: projectResult.error,
				});
			}

			const project = projectResult.data;

			// Create godraw_projects entry
			const godrawProjectResult =
				await godrawProjectService.createGodrawProject({
					project_id: project.id,
					tenant_id,
					theme,
					home_page_id: null, // Will be set after creating default page
				});

			if (godrawProjectResult.error || !godrawProjectResult.data) {
				// Rollback: delete the project we just created (use supabase directly)
				await request.db.supabase
					.from("projects")
					.delete()
					.eq("id", project.id);
				return reply.code(500).send({
					error: "Failed to create GoDraw project",
					message: godrawProjectResult.error,
				});
			}

			const godrawProject = godrawProjectResult.data;

			// Create default "home" page
			const defaultPageResult = await godrawPageService.createPage({
				godraw_project_id: godrawProject.id,
				tenant_id,
				name: "Home",
				slug: "home",
				elements: [],
				app_state: {},
				files: {},
				order_index: 0,
				is_published: true,
			});

			if (defaultPageResult.error || !defaultPageResult.data) {
				// Rollback
				await godrawProjectService.deleteGodrawProject(godrawProject.id);
				await request.db.supabase
					.from("projects")
					.delete()
					.eq("id", project.id);
				return reply.code(500).send({
					error: "Failed to create default page",
					message: defaultPageResult.error,
				});
			}

			const defaultPage = defaultPageResult.data;

			// Set the home page
			await godrawProjectService.setHomePage(godrawProject.id, defaultPage.id);

			return reply.code(201).send({
				project: {
					id: project.id,
					name: project.name,
					subdomain: project.subdomain,
					project_type: "godraw",
				},
				godraw_project: {
					...godrawProject,
					home_page_id: defaultPage.id,
				},
				default_page: defaultPage,
			});
		},
	);

	/**
	 * GET /api/projects/:projectId/godraw
	 * Get GoDraw project with all pages
	 */
	fastify.get(
		"/projects/:projectId/godraw",
		{ ...routeSchemas.getGodrawProject, config: { auth: true } },
		async (
			request: FastifyRequest<{
				Params: { projectId: string };
			}>,
			reply: FastifyReply,
		) => {
			const { projectId } = request.params;
			const { tenant_id } = request.user;

			// Verify project exists and belongs to user's tenant
			const projectResult = await request.db.projects.getProjectById(projectId);
			if (projectResult.error || !projectResult.data) {
				return reply.code(404).send({ error: "Project not found" });
			}

			if (projectResult.data.tenant_id !== tenant_id) {
				return reply.code(404).send({ error: "Project not found" });
			}

			// Get GoDraw project
			const godrawProjectResult =
				await godrawProjectService.getByProjectId(projectId);
			if (godrawProjectResult.error || !godrawProjectResult.data) {
				return reply.code(404).send({ error: "GoDraw project not found" });
			}

			// Get all pages
			const pagesResult = await godrawPageService.getPagesByProjectId(
				godrawProjectResult.data.id,
				true, // Include unpublished
			);

			if (pagesResult.error) {
				return reply.code(500).send({
					error: "Failed to fetch pages",
					message: pagesResult.error,
				});
			}

			return reply.code(200).send({
				godraw_project: godrawProjectResult.data,
				pages: pagesResult.data ?? [],
			});
		},
	);

	/**
	 * PATCH /api/projects/:projectId/godraw
	 * Update GoDraw project settings
	 */
	fastify.patch(
		"/projects/:projectId/godraw",
		{ ...routeSchemas.updateGodrawProject, config: { auth: true } },
		async (
			request: FastifyRequest<{
				Params: { projectId: string };
				Body: UpdateGodrawProject;
			}>,
			reply: FastifyReply,
		) => {
			const { projectId } = request.params;
			const { tenant_id } = request.user;

			// Verify project exists and belongs to user's tenant
			const projectResult = await request.db.projects.getProjectById(projectId);
			if (projectResult.error || !projectResult.data) {
				return reply.code(404).send({ error: "Project not found" });
			}

			if (projectResult.data.tenant_id !== tenant_id) {
				return reply.code(404).send({ error: "Project not found" });
			}

			// Get GoDraw project
			const godrawProjectResult =
				await godrawProjectService.getByProjectId(projectId);
			if (godrawProjectResult.error || !godrawProjectResult.data) {
				return reply.code(404).send({ error: "GoDraw project not found" });
			}

			// Update GoDraw project
			const updateResult = await godrawProjectService.updateGodrawProject(
				godrawProjectResult.data.id,
				request.body,
			);

			if (updateResult.error || !updateResult.data) {
				return reply.code(500).send({
					error: "Failed to update GoDraw project",
					message: updateResult.error,
				});
			}

			return reply.code(200).send(updateResult.data);
		},
	);

	// ================================================
	// GoDraw Page Routes
	// ================================================

	/**
	 * POST /api/projects/:projectId/godraw/pages
	 * Create a new page
	 */
	fastify.post(
		"/projects/:projectId/godraw/pages",
		{ ...routeSchemas.createPage, config: { auth: true } },
		async (
			request: FastifyRequest<{
				Params: { projectId: string };
				Body: CreateGodrawPage;
			}>,
			reply: FastifyReply,
		) => {
			const { projectId } = request.params;
			const { tenant_id } = request.user;

			// Get GoDraw project
			const godrawProjectResult =
				await godrawProjectService.getByProjectId(projectId);
			if (godrawProjectResult.error || !godrawProjectResult.data) {
				return reply.code(404).send({ error: "GoDraw project not found" });
			}

			// Generate slug from name if not provided
			const slug =
				request.body.slug ??
				request.body.name.toLowerCase().replace(/\s+/g, "-");

			// Check if slug is already taken
			const existingPage = await godrawPageService.getPageBySlug(
				godrawProjectResult.data.id,
				slug,
			);
			if (existingPage.data) {
				return reply
					.code(400)
					.send({ error: "A page with this slug already exists" });
			}

			// Get next order_index
			const countResult = await godrawPageService.countPages(
				godrawProjectResult.data.id,
			);
			const orderIndex = request.body.order_index ?? countResult.data ?? 0;

			// Create page
			const pageResult = await godrawPageService.createPage({
				godraw_project_id: godrawProjectResult.data.id,
				tenant_id,
				name: request.body.name,
				slug,
				elements: request.body.elements ?? [],
				app_state: request.body.app_state ?? {},
				files: request.body.files ?? {},
				order_index: orderIndex,
				is_published: request.body.is_published ?? true,
			});

			if (pageResult.error || !pageResult.data) {
				return reply.code(500).send({
					error: "Failed to create page",
					message: pageResult.error,
				});
			}

			return reply.code(201).send(pageResult.data);
		},
	);

	/**
	 * GET /api/projects/:projectId/godraw/pages
	 * List all pages
	 */
	fastify.get(
		"/projects/:projectId/godraw/pages",
		{ ...routeSchemas.listPages, config: { auth: true } },
		async (
			request: FastifyRequest<{
				Params: { projectId: string };
				Querystring: { includeUnpublished?: string };
			}>,
			reply: FastifyReply,
		) => {
			const { projectId } = request.params;
			const includeUnpublished = request.query.includeUnpublished === "true";

			// Get GoDraw project
			const godrawProjectResult =
				await godrawProjectService.getByProjectId(projectId);
			if (godrawProjectResult.error || !godrawProjectResult.data) {
				return reply.code(404).send({ error: "GoDraw project not found" });
			}

			// Get pages
			const pagesResult = await godrawPageService.getPagesByProjectId(
				godrawProjectResult.data.id,
				includeUnpublished,
			);

			if (pagesResult.error) {
				return reply.code(500).send({
					error: "Failed to fetch pages",
					message: pagesResult.error,
				});
			}

			return reply.code(200).send({ pages: pagesResult.data ?? [] });
		},
	);

	/**
	 * GET /api/projects/:projectId/godraw/pages/:pageId
	 * Get a single page
	 */
	fastify.get(
		"/projects/:projectId/godraw/pages/:pageId",
		{ ...routeSchemas.getPage, config: { auth: true } },
		async (
			request: FastifyRequest<{
				Params: { projectId: string; pageId: string };
			}>,
			reply: FastifyReply,
		) => {
			const { pageId } = request.params;

			const pageResult = await godrawPageService.getPageById(pageId);
			if (pageResult.error || !pageResult.data) {
				return reply.code(404).send({ error: "Page not found" });
			}

			return reply.code(200).send(pageResult.data);
		},
	);

	/**
	 * PATCH /api/projects/:projectId/godraw/pages/:pageId
	 * Update a page
	 */
	fastify.patch(
		"/projects/:projectId/godraw/pages/:pageId",
		{ ...routeSchemas.updatePage, config: { auth: true } },
		async (
			request: FastifyRequest<{
				Params: { projectId: string; pageId: string };
				Body: UpdateGodrawPage;
			}>,
			reply: FastifyReply,
		) => {
			const { pageId } = request.params;

			// Check if page exists
			const existingPage = await godrawPageService.getPageById(pageId);
			if (existingPage.error || !existingPage.data) {
				return reply.code(404).send({ error: "Page not found" });
			}

			// If updating slug, check it's not taken
			if (request.body.slug && request.body.slug !== existingPage.data.slug) {
				const slugCheck = await godrawPageService.getPageBySlug(
					existingPage.data.godraw_project_id,
					request.body.slug,
				);
				if (slugCheck.data) {
					return reply
						.code(400)
						.send({ error: "A page with this slug already exists" });
				}
			}

			// Update page
			const updateResult = await godrawPageService.updatePage(
				pageId,
				request.body,
			);

			if (updateResult.error || !updateResult.data) {
				return reply.code(500).send({
					error: "Failed to update page",
					message: updateResult.error,
				});
			}

			return reply.code(200).send(updateResult.data);
		},
	);

	/**
	 * DELETE /api/projects/:projectId/godraw/pages/:pageId
	 * Delete a page
	 */
	fastify.delete(
		"/projects/:projectId/godraw/pages/:pageId",
		{ ...routeSchemas.deletePage, config: { auth: true } },
		async (
			request: FastifyRequest<{
				Params: { projectId: string; pageId: string };
			}>,
			reply: FastifyReply,
		) => {
			const { projectId, pageId } = request.params;

			// Get GoDraw project to check if this is the home page
			const godrawProjectResult =
				await godrawProjectService.getByProjectId(projectId);
			if (godrawProjectResult.error || !godrawProjectResult.data) {
				return reply.code(404).send({ error: "GoDraw project not found" });
			}

			// Prevent deleting home page
			if (godrawProjectResult.data.home_page_id === pageId) {
				return reply.code(400).send({ error: "Cannot delete the home page" });
			}

			// Delete page
			const deleteResult = await godrawPageService.deletePage(pageId);
			if (deleteResult.error) {
				return reply.code(500).send({
					error: "Failed to delete page",
					message: deleteResult.error,
				});
			}

			return reply.code(204).send();
		},
	);

	/**
	 * PATCH /api/projects/:projectId/godraw/pages/reorder
	 * Reorder pages
	 */
	fastify.patch(
		"/projects/:projectId/godraw/pages/reorder",
		{ ...routeSchemas.reorderPages, config: { auth: true } },
		async (
			request: FastifyRequest<{
				Params: { projectId: string };
				Body: ReorderPages;
			}>,
			reply: FastifyReply,
		) => {
			const { page_ids } = request.body;

			const reorderResult = await godrawPageService.reorderPages(page_ids);
			if (reorderResult.error) {
				return reply.code(500).send({
					error: "Failed to reorder pages",
					message: reorderResult.error,
				});
			}

			return reply.code(200).send({ success: true });
		},
	);

	// ================================================
	// GoDraw Build & Deploy Routes
	// ================================================

	/**
	 * POST /api/projects/:projectId/godraw/build
	 * Build and deploy GoDraw project as static site
	 */
	fastify.post(
		"/projects/:projectId/godraw/build",
		{ config: { auth: true } },
		async (
			request: FastifyRequest<{
				Params: { projectId: string };
			}>,
			reply: FastifyReply,
		) => {
			const { projectId } = request.params;
			const { tenant_id, user_id } = request.user;

			// Verify project exists and belongs to user's tenant
			const projectResult = await request.db.projects.getProjectById(projectId);
			if (projectResult.error || !projectResult.data) {
				return reply.code(404).send({ error: "Project not found" });
			}

			if (projectResult.data.tenant_id !== tenant_id) {
				return reply.code(404).send({ error: "Project not found" });
			}

			const project = projectResult.data;

			// Verify it's a godraw project
			if (project.project_type !== "godraw") {
				return reply.code(400).send({ error: "Not a GoDraw project" });
			}

			// Build the static site
			const buildResult = await godrawBuilder.build({
				projectId,
				tenantId: tenant_id,
			});

			if (buildResult.error || !buildResult.data) {
				return reply.code(500).send({
					error: "Failed to build site",
					message: buildResult.error,
				});
			}

			const { archivePath, pageCount, buildTime } = buildResult.data;

			// Create deployment record
			const deployResult = await request.db.deploys.recordDeploy({
				project_id: projectId,
				user_id,
				tenant_id,
				url: ProjectDomain.from(project).determine(),
				status: "pending",
			});

			if (deployResult.error || !deployResult.data) {
				// Cleanup archive
				await fs.rm(archivePath, { force: true }).catch(() => {});
				return reply.code(500).send({
					error: "Failed to record deployment",
					message: deployResult.error,
				});
			}

			const deploy = deployResult.data;

			// Upload to storage
			let uploadResult: { data: string | null; error: string | null };
			try {
				uploadResult = await storageService.processSpaArchive(
					archivePath,
					project,
				);
			} catch (e) {
				const err = e as Error;
				// Update deployment status to failed
				if (deploy.id) {
					await request.db.deploys.updateDeployStatus(deploy.id, "failed");
				}
				// Cleanup archive
				await fs.rm(archivePath, { force: true }).catch(() => {});
				return reply.code(500).send({
					error: "Failed to upload files",
					message: err.message,
				});
			}

			if (uploadResult.error) {
				// Update deployment status to failed
				if (deploy.id) {
					await request.db.deploys.updateDeployStatus(deploy.id, "failed");
				}
				// Cleanup archive
				await fs.rm(archivePath, { force: true }).catch(() => {});
				return reply.code(500).send({
					error: "Failed to upload files",
					message: uploadResult.error,
				});
			}

			// Update deployment status to success
			if (!deploy.id) {
				// Cleanup archive
				await fs.rm(archivePath, { force: true }).catch(() => {});
				return reply.code(500).send({
					error: "Failed to update deployment status",
					message: "Deploy ID not found",
				});
			}

			const updateResult = await request.db.deploys.updateDeployStatus(
				deploy.id,
				"success",
			);

			if (updateResult.error) {
				// Cleanup archive
				await fs.rm(archivePath, { force: true }).catch(() => {});
				return reply.code(500).send({
					error: "Failed to update deployment status",
					message: updateResult.error,
				});
			}

			// Cleanup archive
			await fs.rm(archivePath, { force: true }).catch(() => {});

			// Construct URLs
			const projectDomain = ProjectDomain.from(project);

			return reply.code(201).send({
				deploy_id: deploy.id,
				project_id: projectId,
				status: "success",
				build_info: {
					page_count: pageCount,
					build_time_ms: buildTime,
				},
				urls: {
					site: projectDomain.determine(),
					subdomain: projectDomain.subdomain.origin,
				},
			});
		},
	);
}
